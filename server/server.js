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

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Clean text extractor from PDF buffer
async function extractPdfText(buffer) {
  try {
    const pdf = require('pdf-parse');
    const parse = typeof pdf === 'function' ? pdf : (pdf.default || pdf.pdfParse);
    if (typeof parse === 'function') {
      const res = await parse(buffer);
      if (res && res.text && res.text.trim().length > 10) {
        return res.text;
      }
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

function getSystemPrompt(targetLanguage = 'English') {
  return `
You are SubText, an expert medical document auditor dedicated to patient transparency and safety.
Analyze the provided medical text, consent form, discharge paper, or prescription.
CRITICAL LANGUAGE INSTRUCTION:
Translate all explanation fields ('summary.simplified', 'financialLiabilityWarning', 'flaggedClauses.plainExplanation', and 'caregiverChecklist') into the following target language: ${targetLanguage}.
Keep all JSON keys strictly in English.

Return STRICT JSON with this exact schema:
{
  "documentType": "Surgical Consent" | "Prescription" | "Discharge Notice" | "Financial Agreement" | "Lab Report",
  "vulnerabilityScore": 85,
  "vulnerabilityLevel": "High" | "Medium" | "Low",
  "summary": {
    "standard": "Concise medical summary in English.",
    "simplified": "6th-grade reading level explanation in ${targetLanguage}."
  },
  "financialLiabilityWarning": "Explicit statement in ${targetLanguage} of potential out-of-pocket costs or surprise billing risk, or null if none.",
  "flaggedClauses": [
    {
      "clauseTitle": "Short descriptive title of risk",
      "severity": "High" | "Medium" | "Low",
      "originalQuote": "Verbatim quote or identified excerpt",
      "plainExplanation": "Why this matters explained simply in ${targetLanguage}."
    }
  ],
  "medicationTimeline": [
    {
      "timeSlot": "Morning" | "Afternoon" | "Night" | "As Needed",
      "medicationName": "Drug name with dosage",
      "instructions": "Clear directions in ${targetLanguage}"
    }
  ],
  "caregiverChecklist": [
    "Crucial follow-up step or red flag warning sign to watch for in ${targetLanguage}"
  ]
}
Return only JSON. No surrounding markdown backticks.
`;
}

// Fallback executor through available chat models
async function runAuditWithFallback(userPrompt, language = 'English') {
  const modelsList = await groq.models.list();
  const allIds = modelsList.data.map(m => m.id);

  const eligibleChatModels = allIds.filter(id => 
    !id.includes('whisper') &&
    !id.includes('embed') &&
    !id.includes('guard') &&
    !id.includes('vision') &&
    !id.includes('orpheus')
  );

  let lastError = null;
  for (const model of eligibleChatModels) {
    try {
      console.log(`Auditing with model: ${model} (Language: ${language})...`);
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: getSystemPrompt(language) },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      });
      return JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.warn(`Model ${model} failed (${err.message}). Trying next...`);
      lastError = err;
    }
  }

  throw new Error(`All available models failed. Last error: ${lastError?.message}`);
}

// 1. Text Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    let { textContent, language = 'English' } = req.body;
    if (!textContent || !textContent.trim()) {
      return res.status(400).json({ error: "Missing document text." });
    }

    textContent = textContent.slice(0, 10000);
    const parsedData = await runAuditWithFallback(
      `Please audit this medical text:\n\n${textContent}`,
      language
    );
    return res.json(parsedData);
  } catch (error) {
    console.error("Text analysis error:", error);
    return res.status(500).json({ error: error?.message || "Failed to process document." });
  }
});

// 2. File Ingestion Endpoint
app.post('/api/analyze-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const language = req.body.language || 'English';
    console.log(`Received file: ${req.file.originalname} (${req.file.mimetype}) - Lang: ${language}`);
    let extractedText = '';

    if (req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
      extractedText = await extractPdfText(req.file.buffer);
    } else {
      extractedText = req.file.buffer.toString('utf-8');
    }

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ 
        error: "Could not read text from this file. Please ensure it contains selectable text." 
      });
    }

    extractedText = extractedText.slice(0, 10000);
    const parsedData = await runAuditWithFallback(
      `Please audit this medical document (${req.file.originalname}):\n\n${extractedText}`,
      language
    );
    return res.json(parsedData);
  } catch (error) {
    console.error("File analysis error:", error);
    return res.status(500).json({ error: error?.message || "Failed to process document file." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SubText AI Server running on port ${PORT}`);
});