import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for all incoming client requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' }));

// Initialize Groq SDK
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Health checks (for UptimeRobot and Render warm-up)
app.get('/', (req, res) => {
  res.status(200).send('SubText Health backend is live and healthy.');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Primary Audit / Analyze Handler
const handleAnalysis = async (req, res) => {
  try {
    const rawText = req.body.documentText || req.body.text || req.body.content || req.body.excerpt || '';

    if (!rawText.trim()) {
      return res.status(400).json({ error: 'Document excerpt or text is required.' });
    }

    const systemPrompt = `You are SubText Health's elite patient advocacy team (combining medical billing auditors, clinical patient navigators, and healthcare consumer rights attorneys).
Analyze this healthcare document (surgical consent, emergency admission, financial waiver, or medical billing ledger).

Evaluate rigorously for:
1. Violations of the federal No Surprises Act (42 U.S.C. § 300gg-111) for out-of-network emergency room care and non-consensual ancillary specialists (anesthesiology, radiology, pathology).
2. Emergency room evaluation upcoding (e.g., CPT 99285 without documented high-complexity medical decision-making).
3. Unbundled procedures, duplicate line items, and unreasonable chargemaster facility fees.
4. Mandatory binding arbitration covenants and hidden debt collection waivers in patient admission agreements.

Respond ONLY with a valid JSON object matching this schema:
{
  "summary": "Clear 2-3 sentence overview of what the patient is looking at and key risks.",
  "riskLevel": "High",
  "riskScore": 85,
  "potentialSavings": "Estimated dollar savings or percentage if applicable",
  "violations": [
    {
      "title": "Short title of violation or clause",
      "statute": "Statutory citation (e.g., 42 U.S.C. § 300gg-111 or Section 4.2 Arbitration)",
      "explanation": "Plain-language translation of what this means for the patient",
      "action": "Concrete step the patient should take"
    }
  ],
  "itemizedFlags": [
    {
      "code": "Section or CPT code",
      "issue": "Specific warning"
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this medical text:\n\n${rawText.slice(0, 6000)}` }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const parsedAudit = JSON.parse(completion.choices[0]?.message?.content || '{}');

    // Return compatibility fields for any frontend shape
    return res.status(200).json({
      success: true,
      audit: parsedAudit,
      ...parsedAudit
    });
  } catch (error) {
    console.error('Analysis Error:', error);
    return res.status(500).json({ error: 'Failed to complete document audit.' });
  }
};

// Route matching: catches /api/analyze, /analyze, /api/audit, and /audit
app.post(['/api/analyze', '/analyze', '/api/audit', '/audit'], handleAnalysis);

// Free Legal Dispute Notice Generator (replaces Gumroad paywall)
app.post(['/api/generate-letter', '/generate-letter'], async (req, res) => {
  try {
    const { documentText, text, excerpt, auditFindings, patientName, facilityName } = req.body;
    const billExcerpt = documentText || text || excerpt || '';
    const patient = patientName || '[Patient Name]';
    const facility = facilityName || '[Hospital / Facility Billing Department]';

    const systemPrompt = `You are a healthcare advocate and attorney drafting an official, legally cited Medical Debt Dispute and Debt Validation Notice.
Cite applicable federal laws:
- Federal No Surprises Act (42 U.S.C. § 300gg-111) regarding balance billing protections.
- Fair Debt Collection Practices Act (15 U.S.C. § 1692g) for debt verification.
- Demand for a complete itemized UB-04 / CMS-1450 statement with individual CPT and HCPCS codes.
- Formal notice freezing collection agency referrals and credit bureau reporting pending dispute review.

Include date placeholders, certified mail tracking lines, formal subject line, numbered statutory demands, and signature line. Format as clean plain text.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Patient: ${patient}\nFacility: ${facility}\nFlags: ${JSON.stringify(auditFindings || [])}\nExcerpt: ${billExcerpt.slice(0, 3000)}` }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.2
    });

    const letterContent = completion.choices[0]?.message?.content || '';
    return res.status(200).json({ success: true, letter: letterContent });
  } catch (error) {
    console.error('Dispute Letter Error:', error);
    return res.status(500).json({ error: 'Failed to generate dispute notice.' });
  }
});

app.listen(port, () => {
  console.log(`SubText Health backend running on port ${port}`);
});