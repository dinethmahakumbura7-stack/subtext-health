import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Health check endpoints for Render and UptimeRobot
app.get('/', (req, res) => {
  res.status(200).send('SubText Health backend is live.');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 1. Audit endpoint (No Surprises Act, CPT Upcoding, Arbitration analysis)
app.post('/api/audit', async (req, res) => {
  try {
    const { documentText } = req.body;

    if (!documentText || !documentText.trim()) {
      return res.status(400).json({ error: 'Document text is required.' });
    }

    const systemPrompt = `You are an expert patient healthcare advocate and medical billing auditor specializing in US healthcare regulations.
Analyze the provided medical billing statement, intake form, or summary excerpt.

Audit for:
1. Violations of the federal No Surprises Act (42 U.S.C. § 300gg-111) for out-of-network emergency room care and non-consensual ancillary providers (radiology, anesthesiology, pathology).
2. Emergency room evaluation upcoding (such as CPT 99285 without documented high-complexity medical decision-making).
3. Unbundled procedure codes, duplicate supply charges, and excessive chargemaster facility fees.
4. Binding arbitration covenants or aggressive collection agreements hidden in admission paperwork.

Respond ONLY with a valid JSON object matching this structure:
{
  "summary": "2-3 sentence overview of billing issues found",
  "riskLevel": "High" | "Medium" | "Low",
  "potentialSavings": "Estimated dollar range or percentage if applicable",
  "violations": [
    {
      "title": "Short title of the violation or issue",
      "statute": "Applicable legal citation (e.g., 42 U.S.C. § 300gg-111)",
      "explanation": "Clear plain-language explanation of why this charge or clause is improper",
      "action": "Concrete step the patient should take"
    }
  ],
  "itemizedFlags": [
    {
      "code": "CPT/HCPCS code or item name",
      "issue": "Identified coding anomaly (e.g., Upcoding, Balance Billing, Unbundled)"
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this medical text:\n\n${documentText.slice(0, 6000)}` }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const parsedAudit = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return res.status(200).json({ success: true, audit: parsedAudit });
  } catch (error) {
    console.error('Audit Error:', error);
    return res.status(500).json({ error: 'Failed to complete document audit.' });
  }
});

// 2. Dispute Letter Generator (100% Free Endpoint for the Hackathon)
app.post('/api/generate-letter', async (req, res) => {
  try {
    const { documentText, auditFindings, patientName, facilityName } = req.body;

    const patient = patientName || '[Patient Name]';
    const facility = facilityName || '[Hospital / Clinic Billing Department]';

    const systemPrompt = `You are a medical billing advocate drafting an official, legally cited Medical Debt Dispute and Debt Validation Notice.

Citations to include where applicable:
- Federal No Surprises Act (42 U.S.C. § 300gg-111) regarding balance billing protections.
- Fair Debt Collection Practices Act (15 U.S.C. § 1692g) for debt verification.
- Demand for a complete itemized UB-04 / CMS-1450 statement with individual CPT and HCPCS codes.
- Formal notice freezing collection agency referrals and credit bureau reporting pending dispute resolution.

Structure:
- Standard header (Date, Certified Mail tracking placeholder, Sender, Recipient).
- Clear Subject Line referencing account and formal dispute notice.
- Factual background citing identified issues.
- Numbered formal statutory demands.
- Signature block.

Format as clean, ready-to-print plain text without markdown backticks.`;

    const userMessage = `Patient Name: ${patient}
Facility Name: ${facility}
Audit Findings: ${JSON.stringify(auditFindings || [])}
Bill Excerpt: ${documentText ? documentText.slice(0, 3000) : 'Medical statement'}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.2
    });

    const letterContent = completion.choices[0]?.message?.content || '';
    return res.status(200).json({ success: true, letter: letterContent });
  } catch (error) {
    console.error('Letter Error:', error);
    return res.status(500).json({ error: 'Failed to generate dispute letter.' });
  }
});

app.listen(port, () => {
  console.log(`SubText Health backend running on port ${port}`);
});