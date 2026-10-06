import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `
You are SubText, an expert medical document auditor dedicated to patient transparency.
Analyze the provided medical text, consent form, or prescription details and return STRICT JSON with this exact schema:
{
  "documentType": "Surgical Consent",
  "overallRiskLevel": "High",
  "summary": {
    "standard": "Brief professional summary of what this document says.",
    "simplified": "6th-grade level explanation of what the user is agreeing to or instructed to do."
  },
  "flaggedClauses": [
    {
      "clauseTitle": "Binding Arbitration",
      "severity": "High",
      "originalQuote": "Exact quote from text",
      "plainExplanation": "Why this matters to the patient."
    }
  ],
  "medicationTimeline": [
    {
      "timeSlot": "Morning",
      "medicationName": "Medication name & dosage",
      "instructions": "Specific guidance"
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

    // 1. Fetch available models on this Groq account
    const modelsList = await groq.models.list();
    const availableModelIds = modelsList.data.map(m => m.id);
    console.log("Available Groq models:", availableModelIds);

    // 2. Pick the first available chat model
    const preferredOrder = [
      'llama-3.3-70b-versatile',
      'llama-3.3-70b-specdec',
      'llama3-70b-8192',
      'llama-3.2-11b-vision-preview',
      'llama-3.2-3b-preview',
      'llama-3.2-1b-preview',
      'mixtral-8x7b-32768',
      'gemma2-9b-it'
    ];

    const selectedModel = preferredOrder.find(m => availableModelIds.includes(m)) || availableModelIds[0];
    console.log(`Using model: ${selectedModel}`);

    // 3. Request completion
    const completion = await groq.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Please analyze this medical document text:\n\n${textContent}` }
      ],
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(completion.choices[0].message.content);
    return res.json(parsedData);
  } catch (error) {
    console.error("GROQ API ERROR:", error);
    return res.status(500).json({ error: error?.message || "Failed to process medical document." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SubText AI Server running on port ${PORT}`);
});