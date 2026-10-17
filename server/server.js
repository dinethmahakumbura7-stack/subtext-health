import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Groq SDK Initialization
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// UptimeRobot & Health Check Endpoints
app.get('/', (req, res) => {
  res.status(200).send('SubText Health API is active and running.');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * 1. AUDIT ENDPOINT: Analyzes document, flags upcoding, balance billing, and arbitration clauses
 */
app.post('/api/audit', async (req, res) => {
  try {
    const { documentText } = req.body;

    if (!documentText || documentText.trim().length === 0) {
      return res.status(400).json({ error: 'Document text is required for analysis.' });
    }

    const systemPrompt = `You are an elite US healthcare consumer rights advocate and certified medical billing auditor.
Analyze the provided medical paperwork or billing ledger.

Identify and evaluate:
1. Violations of the federal No Surprises Act (42 U.S.C. § 300gg-111) for out-of-network emergency room care and non-consensual ancillary specialists (anesthesiology, radiology, pathology).
2. Emergency room evaluation upcoding (e.g., CPT 99285 without documented high-complexity medical decision-making).
3. Unbundled procedures, duplicate line items, and unreasonable chargemaster facility fees.
4. Mandatory binding arbitration covenants and hidden debt collection waivers in patient admission agreements.

Format your entire response strictly as a JSON object matching this schema:
{
  "summary": "Brief 2-3 sentence overview of findings",
  "riskLevel": "High" | "Medium" | "Low",
  "potentialSavingsEstimate": "Estimated dollar range or percentage if applicable",
  "violations": [
    {
      "title": "Short violation title",
      "statute": "Statutory citation (e.g., 42 U.S.C. § 300gg-111)",
      "explanation": "Plain-English explanation of why this charge or clause is improper",
      "recommendedAction": "Exact step the patient must take to challenge it"
    }
  ],
  "itemizedFlags": [
    {
      "code": "CPT/HCPCS or line item name",
      "description": "Short description",
      "issue": "Specific error identified (e.g., Upcoding, Unbundling, Balance Billing)"
    }
  ]
}
Return only valid JSON. Do not include markdown backticks.`;

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

/**
 * 2. FREE DISPUTE LETTER GENERATOR: Fully unlocked for the hackathon
 */
app.post('/api/generate-letter', async (req, res) => {
  try {
    const { documentText, auditFindings, patientName, facilityName } = req.body;

    const patient = patientName?.trim() || '[Patient Name]';
    const facility = facilityName?.trim() || '[Hospital / Facility Billing Department]';

    const systemPrompt = `You are an expert patient rights attorney and medical billing transparency advocate.
Draft an official, legally cited Medical Debt Dispute and Statutory Validation Notice ready to be printed and mailed.

Legal frameworks to cite where applicable:
- Federal No Surprises Act (42 U.S.C. § 300gg-111) regarding illegal balance billing.
- Fair Debt Collection Practices Act (15 U.S.C. § 1692g) requiring written verification before debt validation.
- Demand for a complete itemized UB-04 / CMS-1450 statement with individual CPT and HCPCS codes.
- Formal demand placing the account on administrative hold and freezing collection transfers and credit bureau reporting pending dispute review.

Include:
- Formal header placeholders (Date, Certified Mail tracking placeholder, Sender, Recipient).
- Clear Subject Line referencing account and formal dispute notice.
- Factual background citing identified issues.
- Explicit numbered statutory demands.
- Formal signature block.

Format as clean, ready-to-print plain text.`;

    const userMessage = `Patient Name: ${patient}
Facility Name: ${facility}
Identified Audit Violations: ${JSON.stringify(auditFindings || [])}
Relevant Bill Excerpt: ${documentText ? documentText.slice(0, 3000) : 'Standard emergency/hospital billing statement'}`;

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
    console.error('Letter Generation Error:', error);
    return res.status(500).json({ error: 'Failed to generate dispute letter.' });
  }
});

app.listen(port, () => {
  console.log(`SubText Health backend running on port ${port}`);
});