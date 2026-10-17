import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 20 * 1024 * 1024 } 
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const getAdvocacyPrompt = (language) => `
You are SubText Health, an empathetic patient advocate AI.
Analyze the provided healthcare document (surgical consent, emergency notice, or discharge prescription).

CRITICAL MULTILINGUAL MANDATE:
The requested language is: "${language}".
You MUST translate EVERY SINGLE descriptive text field into "${language}" (Sinhala Unicode for Sinhala, Tamil Unicode for Tamil, Spanish for Spanish, English for English).
This includes:
- "documentType"
- "primaryTalkingScript"
- "financialLiabilityWarning"
- All values in "snapshot30s" (procedure, legal, insurance, financial)
- In "topConcerns": "title", "plainExplanation", "whatToAsk", "severity"
- In "medicalGlossary": "definition", "whyItMatters", "askDoctor"
- In "beforeYouSignChecklist": all checklist strings
- In "medicationTimeline": "instructions"
- In "redFlags": all trigger strings
- In "summary": "simplified" and "standard"

Do NOT keep English placeholder values if the language is not English. Keep ONLY "originalQuote" in its original verbatim text from the document.

Return ONLY a valid JSON object matching this exact schema:
{
  "documentType": "string",
  "riskScore": 85,
  "riskLevel": "High Attention" | "Review Needed" | "Routine Info",
  "attentionCount": 2,
  "primaryTalkingScript": "string",
  "financialLiabilityWarning": "string or null",
  "snapshot30s": {
    "procedure": "string",
    "legal": "string",
    "insurance": "string",
    "financial": "string"
  },
  "topConcerns": [
    {
      "title": "string",
      "sourceSection": "string",
      "originalQuote": "string verbatim quote",
      "plainExplanation": "string",
      "whatToAsk": "string",
      "severity": "High Attention" | "Review",
      "confidence": "Verified"
    }
  ],
  "summary": {
    "simplified": "string",
    "standard": "string"
  },
  "beforeYouSignChecklist": [
    "string",
    "string"
  ],
  "medicalGlossary": [
    {
      "term": "string",
      "definition": "string",
      "whyItMatters": "string",
      "askDoctor": "string"
    }
  ],
  "medicationTimeline": [
    {
      "timeSlot": "Morning / Night / etc",
      "medicationName": "string",
      "instructions": "string"
    }
  ],
  "redFlags": [
    "string"
  ]
}
`;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SubText Health API' });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { textContent, language = 'English' } = req.body;
    if (!textContent) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: getAdvocacyPrompt(language) },
        { role: 'user', content: `Please review and advocate for the patient with this text:\n\n${textContent}` }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);
  } catch (error) {
    console.error('Text Analysis Error:', error);
    res.status(500).json({ error: error.message || 'Error processing document analysis' });
  }
});

app.post('/api/analyze-file', upload.single('file'), async (req, res) => {
  try {
    const language = req.body.language || 'English';
    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded' });
    }

    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
    } else if (req.file.mimetype.startsWith('image/')) {
      const base64Image = req.file.buffer.toString('base64');
      const visionRes = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract and transcribe all readable medical, clinical, and financial text from this image document cleanly. Return only raw text.' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${req.file.mimetype};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        model: 'llama-3.2-11b-vision-preview'
      });
      extractedText = visionRes.choices[0].message.content;
    } else {
      extractedText = req.file.buffer.toString('utf-8');
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'Could not extract readable text from document' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: getAdvocacyPrompt(language) },
        { role: 'user', content: `Please review and advocate for the patient with this text:\n\n${extractedText}` }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);
  } catch (error) {
    console.error('File Analysis Error:', error);
    res.status(500).json({ error: error.message || 'Error processing file upload' });
  }
});

app.post('/api/clause-action', async (req, res) => {
  try {
    const { clauseTitle, originalQuote, plainExplanation, language = 'English' } = req.body;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a patient advocate. Provide a practical negotiation script and legal protection brief in "${language}".
Translate ALL fields into "${language}".
Return ONLY a valid JSON object:
{
  "talkingScript": "polite, assertive sentence the patient can say directly to staff in ${language}",
  "alternativeRequest": "specific modification the patient can ask to write into the agreement in ${language}",
  "patientRight": "plain summary of patient protection laws or standard healthcare consumer rights in ${language}"
}`
        },
        {
          role: 'user',
          content: `Clause: ${clauseTitle}\nQuote: "${originalQuote}"\nMeaning: ${plainExplanation}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);
  } catch (error) {
    console.error('Clause Action Error:', error);
    res.status(500).json({ error: error.message || 'Error preparing negotiation brief' });
  }
});

app.listen(port, () => {
  console.log(`SubText Health Server running on port ${port}`);
});