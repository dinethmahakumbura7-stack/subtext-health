import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import Groq from 'groq-sdk';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

const groq = new Groq({ apiKey: (process.env.GROQ_API_KEY || '').trim() });

async function extractPdfText(buffer) {
  try {
    const pdf = require('pdf-parse');
    const parse = typeof pdf === 'function' ? pdf : (pdf.default || pdf.pdfParse);
    if (typeof parse === 'function') {
      const res = await parse(buffer);
      if (res && res.text && res.text.trim().length > 10) return res.text;
    }
  } catch (err) {
    console.warn("Primary pdf-parse failed, using fallback:", err.message);
  }

  const raw = buffer.toString('latin1');
  const matches = raw.match(/[A-Za-z0-9,.:;%()'\- ]{5,}/g) || [];
  return matches
    .filter(line => !line.includes('/Type') && !line.includes('/Filter') && !line.includes('endobj'))
    .join(' ')
    .trim();
}

function cleanJsonParse(rawString) {
  const cleaned = rawString
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

async function getWorkingModel() {
  try {
    const modelsList = await groq.models.list();
    const allIds = modelsList.data.map(m => m.id);

    const preferred = allIds.filter(id => 
      !id.includes('whisper') &&
      !id.includes('embed') &&
      !id.includes('guard') &&
      !id.includes('vision') &&
      !id.includes('allam')
    );

    const gptOss = preferred.find(id => id.includes('gpt-oss'));
    if (gptOss) return gptOss;

    const qwen = preferred.find(id => id.includes('qwen'));
    if (qwen) return qwen;

    if (preferred.length > 0) return preferred[0];
    return allIds[0];
  } catch (err) {
    console.warn("Could not query Groq models, fallback:", err.message);
    return 'openai/gpt-oss-120b';
  }
}

async function runAudit(documentText, language = 'English') {
  const model = await getWorkingModel();
  console.log(`Auditing with model: ${model} | Target Language: ${language}`);

  const isSinhala = language.toLowerCase().includes('sinhala');
  const isTamil = language.toLowerCase().includes('tamil');
  const isSpanish = language.toLowerCase().includes('spanish');

  let languageDirective = '';
  if (isSinhala) {
    languageDirective = `
MANDATORY: Write the values for "summary.simplified", "financialLiabilityWarning", "topConcerns[].plainExplanation", "topConcerns[].whatToAsk", "medicalGlossary[].definition", "medicalGlossary[].whyItMatters", "primaryTalkingScript", "redFlags[]", "medicationTimeline[].instructions", and "beforeYouSignChecklist[]" entirely in native SINHALA SCRIPT (සිංහල අකුරින් පමණක් ලියන්න).
`;
  } else if (isTamil) {
    languageDirective = `
MANDATORY: Write all patient explanation fields, primaryTalkingScript, whatToAsk, and redFlags entirely in native TAMIL SCRIPT (தமிழ் எழுத்துக்களில் மட்டுமே).
`;
  } else if (isSpanish) {
    languageDirective = `
MANDATORY: Write all patient explanation fields, primaryTalkingScript, whatToAsk, and redFlags entirely in fluent Spanish (Español).
`;
  }

  const systemInstructions = `You are SubText Health, a compassionate patient advocate and medical document translator.
Analyze the user's healthcare document and produce a strict JSON response.

JSON Schema:
{
  "documentType": "Surgical Consent" | "Hospital Bill" | "Prescription" | "Discharge Summary" | "Medical Agreement",
  "riskScore": 85,
  "riskLevel": "High Attention" | "Review Needed" | "Standard Notice",
  "attentionCount": 2,
  "snapshot30s": {
    "procedure": "Name or status of procedure",
    "legal": "Summary of dispute/arbitration status",
    "insurance": "Coverage or network status",
    "financial": "Estimated financial exposure note"
  },
  "summary": {
    "standard": "Short clinical summary in English.",
    "simplified": "Warm, plain-language patient explanation."
  },
  "financialLiabilityWarning": "Direct warning about surprise out-of-pocket costs, or null.",
  "primaryTalkingScript": "Polite, firm script the patient can directly say to the hospital admissions clerk or doctor.",
  "topConcerns": [
    {
      "id": 1,
      "title": "Short title (e.g. Binding Arbitration)",
      "severity": "High Attention" | "Review" | "Information",
      "sourceSection": "Section 4.2",
      "originalQuote": "Verbatim short quote from text",
      "plainExplanation": "Clear explanation of impact on patient rights/wallet.",
      "whatToAsk": "Exact question to ask staff regarding this item.",
      "confidence": "Verified from document"
    }
  ],
  "medicalGlossary": [
    {
      "term": "Complex clinical or legal term",
      "definition": "Simple 1-sentence definition.",
      "whyItMatters": "Why this matters to the patient's care or bill.",
      "askDoctor": "One concise question to ask the physician."
    }
  ],
  "medicationTimeline": [
    {
      "timeSlot": "Morning (8:00 AM)" | "Afternoon (2:00 PM)" | "Night (8:00 PM)" | "As Needed",
      "medicationName": "Medication name and dosage",
      "instructions": "Simple food/timing instructions."
    }
  ],
  "redFlags": [
    "Critical warning sign indicating when to seek urgent emergency care."
  ],
  "beforeYouSignChecklist": [
    "Item patient should verify before signing or leaving."
  ]
}

${languageDirective}
Keep JSON keys, timeSlot, and confidence in English.
Output STRICT JSON ONLY.`;

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemInstructions },
      { 
        role: "user", 
        content: `Audit this clinical document for the patient in ${language}:\n\n${documentText}` 
      }
    ],
    response_format: { type: "json_object" }
  });

  return cleanJsonParse(completion.choices[0].message.content);
}

app.post('/api/analyze', async (req, res) => {
  try {
    let { textContent, language = 'English' } = req.body;
    if (!textContent || !textContent.trim()) {
      return res.status(400).json({ error: "Missing document text." });
    }
    textContent = textContent.slice(0, 8000);
    const result = await runAudit(textContent, language);
    return res.json(result);
  } catch (error) {
    console.error("Text analysis error:", error);
    return res.status(500).json({ error: error?.message || "Failed to process document." });
  }
});

app.post('/api/analyze-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    const language = req.body.language || 'English';
    let extractedText = '';
    if (req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
      extractedText = await extractPdfText(req.file.buffer);
    } else {
      extractedText = req.file.buffer.toString('utf-8');
    }
    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ error: "Could not read text from this file." });
    }
    extractedText = extractedText.slice(0, 8000);
    const result = await runAudit(extractedText, language);
    return res.json(result);
  } catch (error) {
    console.error("File analysis error:", error);
    return res.status(500).json({ error: error?.message || "Failed to process document." });
  }
});

app.post('/api/clause-action', async (req, res) => {
  try {
    const { clauseTitle, originalQuote, plainExplanation, language = 'English' } = req.body;
    if (!clauseTitle) {
      return res.status(400).json({ error: "Missing clause information." });
    }
    const model = await getWorkingModel();
    const isSinhala = language.toLowerCase().includes('sinhala');
    const isTamil = language.toLowerCase().includes('tamil');
    const isSpanish = language.toLowerCase().includes('spanish');

    let scriptLangDirective = `Output all response values in fluent ${language}.`;
    if (isSinhala) scriptLangDirective = `All response values MUST be written entirely in native Sinhala script (සිංහල අකුරින් පමණි).`;
    if (isTamil) scriptLangDirective = `All response values MUST be written entirely in native Tamil script (தமிழ் எழுத்துக்களில் மட்டுமே).`;
    if (isSpanish) scriptLangDirective = `All response values MUST be written in Spanish.`;

    const prompt = `
You are a patient advocate. A patient needs to discuss this clause with their healthcare provider or admissions desk:
Clause: ${clauseTitle}
Excerpt: "${originalQuote || 'N/A'}"
Concern: ${plainExplanation || 'N/A'}

Provide constructive, polite patient guidance. Return STRICT JSON:
{
  "talkingScript": "Exact, polite words the patient can read to staff.",
  "alternativeRequest": "Specific constructive modification to ask for.",
  "patientRight": "A reassuring 1-2 sentence statement of the patient's rights."
}

${scriptLangDirective}
Return valid JSON only. Keep keys in English.
`;

    const completion = await groq.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const parsed = cleanJsonParse(completion.choices[0].message.content);
    return res.json(parsed);
  } catch (error) {
    console.error("Clause action error:", error);
    return res.status(500).json({ error: error?.message || "Failed to generate guidance." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SubText Health Server running on port ${PORT}`);
});