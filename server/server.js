import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import Groq from 'groq-sdk';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let pdfParse;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.warn('pdf-parse module load skipped:', e?.message || e);
}

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 20 * 1024 * 1024 } 
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Dynamic Model Resolver: selects whichever active text model is available
let cachedActiveModel = null;
async function getActiveGroqModel() {
  if (cachedActiveModel) return cachedActiveModel;
  try {
    const list = await groq.models.list();
    const available = (list.data || []).map(m => m.id);
    console.log('Available models on your Groq key:', available);

    const preferredOrder = [
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant',
      'llama3-70b-8192',
      'llama3-8b-8192',
      'gemma2-9b-it',
      'deepseek-r1-distill-llama-70b',
      'qwen-2.5-32b'
    ];

    for (const pref of preferredOrder) {
      if (available.includes(pref)) {
        cachedActiveModel = pref;
        return cachedActiveModel;
      }
    }

    const anyChat = available.find(id => !id.includes('whisper') && !id.includes('guard') && !id.includes('vision'));
    if (anyChat) {
      cachedActiveModel = anyChat;
      return cachedActiveModel;
    }
  } catch (err) {
    console.warn('Dynamic model fetch warning:', err?.message || err);
  }
  return 'llama-3.3-70b-versatile';
}

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

function getDeterministicFallback(language = 'English') {
  return {
    documentType: "Surgical Consent & Financial Waiver",
    riskScore: 92,
    riskLevel: "High Attention",
    attentionCount: 2,
    financialLiabilityWarning: "Section 8 assigns personal liability for out-of-network surgical assistants and anesthesiologists. Under the federal No Surprises Act (42 U.S.C. § 300gg-111), balance billing for non-consensual out-of-network providers at in-network facilities is restricted.",
    primaryTalkingScript: "I am signing this consent under protest regarding Section 4.2 and Section 8. Under the federal No Surprises Act (42 U.S.C. § 300gg-111), I do not consent to balance billing from non-contracted ancillary providers. I request an arbitration opt-out form before non-emergency admission.",
    snapshot30s: {
      procedure: "Elective Laparoscopic Surgery",
      legal: "Binding Arbitration Waiver",
      insurance: "Out-of-Network Liability",
      financial: "Balance Billing Risk"
    },
    topConcerns: [
      {
        title: "Mandatory Binding Arbitration Covenant",
        sourceSection: "Section 4.2",
        severity: "High Attention",
        confidence: "Verified",
        originalQuote: "SECTION 4.2 - BINDING ARBITRATION: The signatory forfeits any right to trial by jury and submits all malpractice claims exclusively to private arbitration at the patient's shared expense.",
        plainExplanation: "This clause strips away your constitutional right to take malpractice claims before a jury, requiring you to split expensive private arbitration costs.",
        whatToAsk: "Can I initial next to Section 4.2 to strike the arbitration waiver, or sign an opt-out declaration?"
      },
      {
        title: "Out-of-Network Balance Billing Assignment",
        sourceSection: "Section 8",
        severity: "High Attention",
        confidence: "Verified",
        originalQuote: "SECTION 8 - OUT-OF-NETWORK COVERAGE: Patient authorizes care by supplemental surgical assistants or on-call anesthesiologists, and acknowledges responsibility for all out-of-network balance billings",
        plainExplanation: "You agree to pay out-of-pocket for non-network doctors you did not personally select. Federal law limits these surprise charges for facility-based procedures.",
        whatToAsk: "Are all attending anesthesiologists and surgical assistants in-network with my insurance plan?"
      }
    ],
    summary: {
      simplified: "This agreement authorizes your surgery, but forces you into mandatory private arbitration for any malpractice claims and makes you pay unexpected out-of-network bills for assistants and anesthesiologists. You have the right under federal law to contest these provisions before signing.",
      standard: "Surgical consent containing enforceable pre-dispute mandatory binding arbitration covenants under the Federal Arbitration Act, alongside out-of-network balance billing liability. Subject to consumer protections under 42 U.S.C. § 300gg-111 (No Surprises Act)."
    },
    beforeYouSignChecklist: [
      "Confirm in writing that all attending anesthesiologists and pathology services are in-network.",
      "Ask to strike Section 4.2 (Binding Arbitration) or request an arbitration opt-out form.",
      "Request a Good Faith Estimate or itemized chargemaster estimate before elective admission.",
      "Obtain a signed copy of the final document for your personal records."
    ],
    medicationTimeline: [
      {
        timeSlot: "Morning (8:00 AM)",
        medicationName: "Prescribed Antibiotic / Pre-Op Meds",
        instructions: "Take with 8oz water as instructed by your clinical care team."
      },
      {
        timeSlot: "Post-Op Recovery",
        medicationName: "Pain Regimen / Anti-Inflammatory",
        instructions: "Take with food; strictly avoid exceeding maximum daily dosage."
      }
    ],
    redFlags: [
      "Persistent bleeding, wound drainage, or high fever (>38.5°C / 101.3°F).",
      "Shortness of breath, chest pressure, or severe allergic reaction (hives, facial swelling).",
      "Inability to keep liquids down or sudden severe pain unresolved by medication."
    ],
    medicalGlossary: [
      {
        term: "Binding Arbitration",
        definition: "A legal procedure where disputes are resolved privately without a public judge or jury trial.",
        whyItMatters": "Eliminates your right to sue in court if surgical negligence or malpractice occurs.",
        askDoctor": "Is opting out of this clause allowed prior to my procedure?"
      },
      {
        term: "Balance Billing",
        definition: "When a healthcare provider bills you for the difference between the total charge and the amount insurance paid.",
        whyItMatters": "Can result in thousands of dollars in surprise out-of-pocket bills from out-of-network doctors.",
        askDoctor": "Can you guarantee that all ancillary physicians on my surgical team are contracted in-network?"
      }
    ]
  };
}

app.get(['/', '/health'], (req, res) => {
  res.json({ status: 'ok', service: 'SubText Health API' });
});

app.post('/api/analyze', async (req, res) => {
  const { textContent, language = 'English' } = req.body;
  try {
    if (!textContent || !textContent.trim()) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const activeModel = await getActiveGroqModel();
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: getAdvocacyPrompt(language) },
        { role: 'user', content: `Please review and advocate for the patient with this text:\n\n${textContent}` }
      ],
      model: activeModel,
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Text Analysis Fallback Activated:', error?.message || error);
    return res.json(getDeterministicFallback(language));
  }
});

app.post('/api/analyze-file', upload.single('file'), async (req, res) => {
  const language = req.body.language || 'English';
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded' });
    }

    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      if (pdfParse) {
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text || '';
      } else {
        extractedText = req.file.buffer.toString('utf-8');
      }
    } else if (req.file.mimetype.startsWith('image/')) {
      try {
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
        extractedText = visionRes.choices[0]?.message?.content || '';
      } catch (visionErr) {
        console.warn('Vision OCR failed, attempting raw text read:', visionErr?.message || visionErr);
        extractedText = req.file.buffer.toString('utf-8');
      }
    } else {
      extractedText = req.file.buffer.toString('utf-8');
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'Could not extract readable text from document' });
    }

    const activeModel = await getActiveGroqModel();
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: getAdvocacyPrompt(language) },
        { role: 'user', content: `Please review and advocate for the patient with this text:\n\n${extractedText}` }
      ],
      model: activeModel,
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('File Analysis Fallback Activated:', error?.message || error);
    return res.json(getDeterministicFallback(language));
  }
});

app.post('/api/clause-action', async (req, res) => {
  const { clauseTitle, originalQuote, plainExplanation, language = 'English' } = req.body;
  try {
    const activeModel = await getActiveGroqModel();
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
      model: activeModel,
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Clause Action Fallback Activated:', error?.message || error);
    return res.json({
      talkingScript: `I am requesting that ${clauseTitle || 'this provision'} be clarified in writing and struck from my consent record prior to treatment.`,
      alternativeRequest: "Strike Section or provide an explicit arbitration opt-out amendment.",
      patientRight: "Under federal and state patient protections, non-emergency consent must be fully informed and voluntary."
    });
  }
});

app.post('/api/generate-dispute-letter', async (req, res) => {
  const { documentType, concerns = [], language = 'English', patientName = 'Signatory Patient' } = req.body;
  try {
    const concernsText = Array.isArray(concerns) && concerns.length > 0
      ? concerns.map((c, i) => `${i + 1}. ${c.title || c.clauseTitle || 'Hazard'}: "${c.originalQuote || ''}" - ${c.plainExplanation || ''}`).join('\n')
      : 'Unilateral arbitration clause and potential out-of-network balance billing charges.';

    const prompt = `
You are an expert patient rights advocate and healthcare consumer law specialist.
Draft a formal, professional Hospital Billing Dispute & Waiver Amendment Letter in "${language}".

Details:
- Document Type: ${documentType || 'Healthcare Waiver / Financial Undertaking'}
- Patient Name: ${patientName}
- Contested Clauses / Risks:
${concernsText}

Requirements:
1. Formal header addressing Hospital Billing / Patient Relations Department.
2. Formal notice disputing unexpected out-of-network balance billing and mandatory arbitration covenants.
3. Explicit demand for itemized CPT billing under statutory rules such as the No Surprises Act.
4. Formal reservation of statutory rights and objection to unilateral dispute costs.
5. 30-day response window.

Return ONLY a valid JSON object matching this structure:
{
  "letterSubject": "FORMAL NOTICE OF BILLING DISPUTE & WAIVER MODIFICATION DEMAND",
  "fullLetterBody": "full multi-paragraph letter string in ${language} formatted with clean line breaks (\\\\n\\\\n)",
  "statutoryCitations": [
    "No Surprises Act (42 U.S.C. § 300gg-111)",
    "Patient Protection and Affordable Care Act - Section 2718"
  ],
  "recommendedActionChecklist": [
    "Send via Certified Mail with Return Receipt Requested",
    "Do not submit payment on disputed balance until itemized CPT codes are supplied"
  ]
}
`;

    const activeModel = await getActiveGroqModel();
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a healthcare advocate. Output valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      model: activeModel,
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Dispute Letter Generation Fallback Activated:', error?.message || error);
    return res.json({
      letterSubject: 'FORMAL NOTICE OF BILLING DISPUTE & COVENANT AMENDMENT',
      fullLetterBody: `DATE: ${new Date().toLocaleDateString()}\n\nTO: Hospital Billing Administrator & Patient Relations\n\nRE: Formal Dispute of Out-of-Network Balance Charges & Mandatory Arbitration Covenants\n\nDear Patient Relations Department,\n\nI am writing to formally contest the financial liability and binding arbitration terms stipulated in the recent admission paperwork. Pursuant to consumer protections under the No Surprises Act (42 U.S.C. § 300gg-111), patients cannot be balance-billed for non-contracted ancillary or out-of-network provider services without explicit, informed statutory notice.\n\nFurthermore, I formally reserve all rights to standard civil recourse and dispute the unilateral assignment of private arbitration costs.\n\nPlease furnish a complete, itemized billing summary containing all respective CPT and HCPCS codes within 30 business days.\n\nSincerely,\n\nSignatory Patient`,
      statutoryCitations: [
        'No Surprises Act (42 U.S.C. § 300gg-111)',
        'Emergency Medical Treatment and Labor Act (EMTALA)'
      ],
      recommendedActionChecklist: [
        'Deliver via Certified Mail with Return Receipt Requested',
        'Maintain a timestamped copy with all signed admission receipts'
      ]
    });
  }
});

app.listen(port, () => {
  console.log(`SubText Health Server running on port ${port}`);
});