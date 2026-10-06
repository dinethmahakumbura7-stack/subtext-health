import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Multer in-memory storage for handling file and image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `
You are SubText, an expert medical document auditor dedicated to patient advocacy and safety.
Analyze the provided medical text or image (consent form, discharge summary, surgical agreement, or prescription).

Return STRICT JSON matching this schema exactly:
{
  "documentType": "Surgical Consent" | "Prescription" | "Discharge Notice" | "Financial Agreement" | "Lab Report",
  "vulnerabilityScore": 85,
  "vulnerabilityLevel": "High" | "Medium" | "Low",
  "summary": {
    "standard": "Concise medical summary.",
    "simplified": "6th-grade reading level summary explaining what this actually means for the patient."
  },
  "financialLiabilityWarning": "Explicit statement of potential out-of-pocket costs or unexpected billing risk, or null if none.",
  "flaggedClauses": [
    {
      "clauseTitle": "Short descriptive title of risk",
      "severity": "High" | "Medium" | "Low",
      "originalQuote": "Verbatim quote or identified excerpt",
      "plainExplanation": "Why this matters in plain terms (e.g. arbitration, waived claims, strict penalties)."
    }
  ],
  "medicationTimeline": [
    {
      "timeSlot": "Morning" | "Afternoon" | "Night" | "As Needed",
      "medicationName": "Drug name with dosage",
      "instructions": "Clear directions (e.g., take with food, avoid dairy)"
    }
  ],
  "caregiverChecklist": [
    "Crucial follow-up step or red flag warning sign to watch for"
  ]
}

Ensure "vulnerabilityScore" is an integer between 0 and 100 based on legal traps, billing risks, and health complexity. Return ONLY the JSON object.
`;

// Helper function to resolve an available Groq model
async function getActiveModel(isVision = false) {
  try {
    const list = await groq.models.list();
    const available = list.data.map(m => m.id);

    if (isVision) {
      const visionModels = [
        'llama-3.2-11b-vision-preview',
        'llama-3.2-90b-vision-preview'
      ];
      return visionModels.find(m => available.includes(m)) || 'llama-3.2-11b-vision-preview';
    }

    const textModels = [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'llama-3.3-70b-specdec',
      'mixtral-8x7b-32768'
    ];
    return textModels.find(m => available.includes(m)) || available[0];
  } catch (err) {
    return isVision ? 'llama-3.2-11b-vision-preview' : 'llama-3.1-8b-instant';
  }
}

// 1. Text Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { textContent } = req.body;
    if (!textContent || !textContent.trim()) {
      return res.status(400).json({ error: "Missing document text." });
    }

    const model = await getActiveModel(false);
    console.log(`Processing text analysis using: ${model}`);

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Please audit this medical text:\n\n${textContent}` }
      ],
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(completion.choices[0].message.content);
    return res.json(parsedData);
  } catch (error) {
    console.error("Text analysis error:", error);
    return res.status(500).json({ error: error?.message || "Failed to process medical document." });
  }
});

// 2. Multimodal Image / Scan Ingestion Endpoint
app.post('/api/analyze-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const mimeType = req.file.mimetype;
    const base64Data = req.file.buffer.toString('base64');
    const model = await getActiveModel(true);

    console.log(`Auditing medical scan image using vision model: ${model}`);

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Audit this medical document, waiver, or prescription scan and extract all key risk details:" },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(completion.choices[0].message.content);
    return res.json(parsedData);
  } catch (error) {
    console.error("Vision scan error:", error);
    return res.status(500).json({ error: error?.message || "Failed to analyze document image." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SubText AI Server running on port ${PORT}`);
});