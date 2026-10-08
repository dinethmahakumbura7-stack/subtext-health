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
  limits: { fileSize: 10 * 1024 * 1024 }
});

const groq = new Groq({ apiKey: (process.env.GROQ_API_KEY || '').trim() });

// Clean text extractor from PDF buffer
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

// Find an active model available on this Groq account
async function getWorkingModel() {
  try {
    const modelsList = await groq.models.list();
    const allIds = modelsList.data.map(m => m.id);

    // Prefer gpt-oss-120b, then any llama/qwen
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
    console.warn("Could not query Groq models, fallback to gpt-oss-120b:", err.message);
    return 'openai/gpt-oss-120b';
  }
}

// Run single-pass audit and translation
async function runAudit(documentText, language = 'English') {
  const model = await getWorkingModel();
  console.log(`Auditing with model: ${model} | Target Language: ${language}`);

  const isSinhala = language.toLowerCase().includes('sinhala');
  const isTamil = language.toLowerCase().includes('tamil');
  const isSpanish = language.toLowerCase().includes('spanish');

  let languageDirective = '';
  if (isSinhala) {
    languageDirective = `
MANDATORY: Write the values for "summary.simplified", "financialLiabilityWarning", "flaggedClauses[].plainExplanation", "medicationTimeline[].instructions", and "caregiverChecklist[]" entirely in native SINHALA SCRIPT (සිංහල අකුරින් පමණක් ලියන්න).
DO NOT use English words for these patient fields. Example: "මෙම ශල්‍යකර්ම එකඟතාවය මඟින්..."
`;
  } else if (isTamil) {
    languageDirective = `
MANDATORY: Write the values for "summary.simplified", "financialLiabilityWarning", "flaggedClauses[].plainExplanation", "medicationTimeline[].instructions", and "caregiverChecklist[]" entirely in native TAMIL SCRIPT (தமிழ் எழுத்துக்களில் எழுதவும்).
DO NOT use English words for these patient fields.
`;
  } else if (isSpanish) {
    languageDirective = `
MANDATORY: Write the values for "summary.simplified", "financialLiabilityWarning", "flaggedClauses[].plainExplanation", "medicationTimeline[].instructions", and "caregiverChecklist[]" entirely in Spanish (Español).
`;
  }

  const systemInstructions = `You are SubText, an expert medical auditor and patient safety advocate.
Analyze the provided document and produce strict JSON.

JSON Schema:
{
  "documentType": "Prescription" | "Surgical Consent" | "Discharge Notice" | "Financial Agreement",
  "vulnerabilityScore": 85,
  "vulnerabilityLevel": "High" | "Medium" | "Low",
  "summary": {
    "standard": "Short clinical summary in English.",
    "simplified": "Simple patient explanation."
  },
  "financialLiabilityWarning": "Brief warning of out-of-pocket costs, or null.",
  "flaggedClauses": [
    {
      "clauseTitle": "Short title in English",
      "severity": "High" | "Medium" | "Low",
      "originalQuote": "Short excerpt quote",
      "plainExplanation": "Patient impact explanation."
    }
  ],
  "medicationTimeline": [
    {
      "timeSlot": "Morning" | "Afternoon" | "Night" | "As Needed",
      "medicationName": "Medication name",
      "instructions": "Directions for use."
    }
  ],
  "caregiverChecklist": [
    "Actionable step or red flag warning."
  ]
}

${languageDirective}
Keep JSON keys, documentType, clauseTitle, and timeSlot in English.
Output STRICT JSON only.`;

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemInstructions },
      { 
        role: "user", 
        content: `Audit this document. Provide patient explanations in ${language}:\n\n${documentText}` 
      }
    ],
    response_format: { type: "json_object" }
  });

  return cleanJsonParse(completion.choices[0].message.content);
}

// 1. Text Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    let { textContent, language = 'English' } = req.body;
    if (!textContent || !textContent.trim()) {
      return res.status(400).json({ error: "Missing document text." });
    }

    textContent = textContent.slice(0, 7000);
    const result = await runAudit(textContent, language);
    return res.json(result);
  } catch (error) {
    console.error("Text analysis error:", error);
    return res.status(500).json({ error: error?.message || "Failed to process document." });
  }
});

// 2. File Analysis Endpoint
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

    extractedText = extractedText.slice(0, 7000);
    const result = await runAudit(extractedText, language);
    return res.json(result);
  } catch (error) {
    console.error("File analysis error:", error);
    return res.status(500).json({ error: error?.message || "Failed to process document." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SubText AI Server running on port ${PORT}`);
});