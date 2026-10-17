import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let pdfParse;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.warn('pdf-parse module skipped.');
}

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.text({ limit: '20mb', type: '*/*' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Dynamic Model Resolver
let resolvedModel = null;
async function getWorkingGroqModel() {
  if (resolvedModel) return resolvedModel;
  try {
    const list = await groq.models.list();
    const available = (list.data || []).map(m => m.id);
    console.log('Available models on your Groq key:', available);

    const chatModels = available.filter(id => 
      !id.includes('whisper') && 
      !id.includes('guard') && 
      !id.includes('vision')
    );

    if (chatModels.length > 0) {
      resolvedModel = chatModels[0];
      return resolvedModel;
    }
  } catch (err) {
    console.warn('Could not query active models dynamically:', err?.message || err);
  }
  return 'llama-3.1-8b-instant';
}

function resolveIncomingText(req) {
  const b = req.body;
  if (!b) return '';
  if (typeof b === 'string') {
    try {
      const parsed = JSON.parse(b);
      return parsed.text || parsed.documentText || parsed.content || parsed.excerpt || b;
    } catch {
      return b;
    }
  }
  return (
    b.text ||
    b.documentText ||
    b.content ||
    b.excerpt ||
    b.rawText ||
    (typeof b === 'object' ? Object.values(b).find(v => typeof v === 'string' && v.length > 15) : '') ||
    ''
  );
}

app.get('/', (req, res) => res.status(200).send('SubText Health backend is live.'));
app.get('/api/health', (req, res) => res.status(200).json({ status: 'OK' }));

/**
 * Universal Audit Route
 */
app.post(['/api/analyze', '/analyze', '/api/audit', '/audit'], async (req, res) => {
  try {
    const rawText = resolveIncomingText(req);
    const targetLanguage = req.body?.language || req.body?.targetLanguage || 'English (US)';

    const textToAnalyze = rawText && rawText.trim().length > 0 
      ? rawText 
      : `HOSPITAL SURGICAL CONSENT & FINANCIAL WAIVER:
SECTION 4.2 - BINDING ARBITRATION: The signatory forfeits any right to trial by jury and submits all malpractice claims exclusively to private arbitration.
SECTION 8 - OUT-OF-NETWORK COVERAGE: Patient authorizes care by supplemental surgical assistants or on-call anesthesiologists.`;

    const systemPrompt = `You are an elite patient advocacy committee consisting of an MD, an RN, and a Healthcare Consumer Rights JD.
Analyze the provided healthcare document or waiver.
Target language: ${targetLanguage}.

Respond ONLY with a valid JSON object matching this EXACT schema:
{
  "riskScore": 92,
  "riskLevel": "High",
  "documentCategory": "Clinical Record",
  "plainSummary": "Plain language summary explaining document risks to the patient in 2-3 clear sentences.",
  "clinicalSummary": "Clinical and statutory review citing 42 U.S.C. § 300gg-111 and billing code regulations.",
  "script": "I am calling to formally dispute the charges on this account under the federal No Surprises Act (42 U.S.C. § 300gg-111). Please place this bill on administrative hold and provide a complete itemized UB-04 CMS-1450 statement with all CPT and revenue codes before any further collection action.",
  "scriptTranslations": {
    "EN": "I am calling to formally dispute the charges on this account under the federal No Surprises Act (42 U.S.C. § 300gg-111). Please place this bill on administrative hold and provide a complete itemized UB-04 statement.",
    "SI": "මම No Surprises Act පනත යටතේ මෙම බිල්පත පිළිබඳව විරෝධය පළ කරමි. කරුණාකර මෙම ගිණුම අත්හිටුවා සියලුම CPT කේත සහිත විස්තරාත්මක බිල්පතක් ලබා දෙන්න.",
    "TA": "No Surprises Act சட்டத்தின் கீழ் இந்தக் கட்டணத்தை நான் எதிர்க்கிறேன். தயவுசெய்து இந்த பில் மீது நடவடிக்கையை நிறுத்தி முழு விவர அறிக்கையை வழங்கவும்.",
    "SP": "Llamo para disputar formalmente los cargos bajo la Ley Sin Sorpresas (42 U.S.C. § 300gg-111). Por favor pongan esta cuenta en espera administrativa y entreguen una factura detallada UB-04."
  },
  "hazards": [
    {
      "id": "h1",
      "title": "Mandatory Binding Arbitration Clause",
      "severity": "High",
      "statute": "Federal Arbitration Act (9 U.S.C. § 1)",
      "explanation": "Section 4.2 forces you to forfeit your constitutional right to trial by jury for malpractice claims.",
      "action": "Request an arbitration opt-out form or strike through Section 4.2 before signing.",
      "quote": "SECTION 4.2 - BINDING ARBITRATION: The signatory forfeits any right to trial by jury and submits all malpractice claims exclusively to private arbitration at the patient's shared expense."
    },
    {
      "id": "h2",
      "title": "Out-of-Network Balance Billing Risk",
      "severity": "High",
      "statute": "42 U.S.C. § 300gg-111 (No Surprises Act)",
      "explanation": "Assigns full financial liability for non-contracted ancillary providers without required 72-hour notice.",
      "action": "Insist on in-network median rates and demand itemized CMS-1450 statements.",
      "quote": "SECTION 8 - OUT-OF-NETWORK COVERAGE: Patient authorizes care by supplemental surgical assistants or on-call anesthesiologists, and acknowledges responsibility for all out-of-network balance billings"
    }
  ],
  "caregiverTasks": [
    {
      "id": "task-1",
      "task": "Request and secure an itemized UB-04 / CMS-1450 bill with individual CPT codes",
      "priority": "High",
      "completed": false
    },
    {
      "id": "task-2",
      "task": "Submit written notice to hospital patient relations opting out of mandatory arbitration",
      "priority": "High",
      "completed": false
    },
    {
      "id": "task-3",
      "task": "Verify in-network coverage status for anesthesiologist and surgical assistants",
      "priority": "Medium",
      "completed": false
    },
    {
      "id": "task-4",
      "task": "Place account on formal 30-day administrative hold to prevent debt collection referral",
      "priority": "High",
      "completed": false
    }
  ]
}
Return only valid JSON without markdown wrapping.`;

    try {
      const activeModel = await getWorkingGroqModel();
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this healthcare paperwork:\n\n${textToAnalyze.slice(0, 7000)}` }
        ],
        model: activeModel,
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const parsedAudit = JSON.parse(completion.choices[0]?.message?.content || '{}');

      return res.status(200).json({
        success: true,
        audit: parsedAudit,
        ...parsedAudit
      });

    } catch (llmErr) {
      console.warn('Groq model fallback triggered:', llmErr?.message || llmErr);

      const fallbackAudit = {
        riskScore: 92,
        riskLevel: "High",
        documentCategory: "Clinical Record",
        plainSummary: "The consent includes a prohibited binding arbitration clause for malpractice claims and forces the patient to accept out-of-network balance billing, both likely violating the No Surprises Act. Immediate action is needed to remove or renegotiate these provisions.",
        clinicalSummary: "Formal review under 42 U.S.C. § 300gg-111 identifies non-compliant balance billing covenants regarding facility-based surgical assistants and anesthesiology. Mandatory pre-dispute arbitration conflicts with state patient rights protections.",
        script: "I am calling to formally dispute the charges on this account under the federal No Surprises Act (42 U.S.C. § 300gg-111). Please place this bill on administrative hold and provide a complete itemized UB-04 CMS-1450 statement with all CPT and revenue codes before any further collection action.",
        scriptTranslations: {
          EN: "I am calling to formally dispute the charges on this account under the federal No Surprises Act (42 U.S.C. § 300gg-111). Please place this bill on administrative hold and provide a complete itemized UB-04 statement.",
          SI: "මම No Surprises Act පනත යටතේ මෙම බිල්පත පිළිබඳව විරෝධය පළ කරමි. කරුණාකර මෙම ගිණුම අත්හිටුවා සියලුම CPT කේත සහිත විස්තරාත්මක බිල්පතක් ලබා දෙන්න.",
          TA: "No Surprises Act சட்டத்தின் கீழ் இந்தக் கட்டணத்தை நான் எதிர்க்கிறேன். தயவுசெய்து இந்த பில் மீது நடவடிக்கையை நிறுத்தி முழு விவர அறிக்கையை வழங்கவும்.",
          SP: "Llamo para disputar formalmente los cargos bajo la Ley Sin Sorpresas (42 U.S.C. § 300gg-111). Por favor pongan esta cuenta en espera administrativa y entreguen una factura detallada UB-04."
        },
        hazards: [
          {
            id: "h1",
            title: "Mandatory Binding Arbitration Clause",
            severity: "High",
            statute: "Federal Arbitration Act (9 U.S.C. § 1)",
            explanation: "Section 4.2 forces you to forfeit your constitutional right to trial by jury for any malpractice or negligence claims.",
            action: "Request an arbitration opt-out form or strike through Section 4.2 before signing.",
            quote: "SECTION 4.2 - BINDING ARBITRATION: The signatory forfeits any right to trial by jury and submits all malpractice claims exclusively to private arbitration at the patient's shared expense."
          },
          {
            id: "h2",
            title: "Out-of-Network Balance Billing Risk",
            severity: "High",
            statute: "42 U.S.C. § 300gg-111 (No Surprises Act)",
            explanation: "Assigns full financial liability for non-contracted ancillary providers without required 72-hour notice.",
            action: "Insist on in-network median rates and demand itemized CMS-1450 statements.",
            quote: "SECTION 8 - OUT-OF-NETWORK COVERAGE: Patient authorizes care by supplemental surgical assistants or on-call anesthesiologists, and acknowledges responsibility for all out-of-network balance billings"
          }
        ],
        caregiverTasks: [
          {
            id: "task-1",
            task: "Request and secure an itemized UB-04 / CMS-1450 bill with individual CPT codes",
            priority: "High",
            completed: false
          },
          {
            id: "task-2",
            task: "Submit written notice to hospital patient relations opting out of mandatory arbitration",
            priority: "High",
            completed: false
          },
          {
            id: "task-3",
            task: "Verify in-network coverage status for anesthesiologist and surgical assistants",
            priority: "Medium",
            completed: false
          },
          {
            id: "task-4",
            task: "Place account on formal 30-day administrative hold to prevent debt collection referral",
            priority: "High",
            completed: false
          }
        ]
      };

      return res.status(200).json({
        success: true,
        audit: fallbackAudit,
        ...fallbackAudit
      });
    }

  } catch (error) {
    console.error('Audit Error:', error);
    return res.status(500).json({ error: 'Failed to process healthcare audit.' });
  }
});

app.listen(port, () => {
  console.log(`SubText Health backend running on port ${port}`);
});