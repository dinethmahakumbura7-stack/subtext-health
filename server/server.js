import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `
You are SubText, an expert medical document auditor dedicated to patient transparency.
Analyze the provided medical text, consent form, or prescription details and return STRICT JSON with this exact schema:
{
  "documentType": "Surgical Consent" | "Prescription" | "Discharge Notice" | "Billing Agreement",
  "overallRiskLevel": "Low" | "Medium" | "High",
  "summary": {
    "standard": "Brief professional summary of what this document says.",
    "simplified": "6th-grade level explanation of what the user is agreeing to or instructed to do."
  },
  "flaggedClauses": [
    {
      "clauseTitle": "Title of risky clause",
      "severity": "High" | "Medium" | "Low",
      "originalQuote": "Exact quote from text",
      "plainExplanation": "Why this matters to the patient (hidden costs, arbitration, waived rights)."
    }
  ],
  "medicationTimeline": [
    {
      "timeSlot": "Morning" | "Afternoon" | "Night" | "As Needed",
      "medicationName": "Medication name & dosage",
      "instructions": "Specific guidance (e.g. take with food, avoid dairy)"
    }
  ]
}
Do not return Markdown or conversational text. Return only the JSON object.
`;

app.post('/api/analyze', async (req, res) => {
  try {
    const { textContent } = req.body;
    if (!textContent) {
      return res.status(400).json({ error: "Missing document text." });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Please analyze this medical document text:\n\n${textContent}` }
      ],
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(completion.choices[0].message.content);
    return res.json(parsedData);
  } catch (error) {
    console.error("Analysis error:", error);
    return res.status(500).json({ error: "Failed to process medical document." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SubText AI Server running on port ${PORT}`);
});