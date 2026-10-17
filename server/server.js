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
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Initialize Groq SDK
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Health check endpoints for Render and UptimeRobot
app.get('/', (req, res) => {
  res.status(200).send('SubText Health backend is live and healthy.');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * Audit & Analysis Core Handler
 * Handles /api/analyze, /analyze, /api/audit, and /audit
 */
const handleAnalyze = async (req, res) => {
  try {
    const rawText = req.body.documentText || req.body.text || req.body.content || req.body.excerpt || '';
    const targetLanguage = req.body.language || 'English (US)';

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: 'Healthcare document excerpt or bill text is required.' });
    }

    const systemPrompt = `You are an elite patient advocacy committee consisting of a Medical Doctor (MD), a Registered Nurse (RN), and a Healthcare Consumer Rights Attorney (JD).
Analyze the provided medical paperwork, admission waiver, discharge instructions, or billing ledger.

Target response language: ${targetLanguage}. If the target language is Sinhala (සිංහල), Tamil (தமிழ்), or Spanish (Español), translate all explanatory text, summaries, and action steps naturally into that language while keeping standard medical/statutory terms (like CPT codes or U.S.C. citations) intact for clarity.

Audit for:
1. Federal No Surprises Act (42 U.S.C. § 300gg-111) violations regarding emergency care and non-consensual out-of-network ancillary specialists.
2. Emergency room evaluation upcoding (e.g., CPT 99285 without documented high medical complexity).
3. Hidden mandatory binding arbitration clauses and debt collection waivers in patient admission forms.
4. Plain-language translations of medical prescriptions, instructions, or unbundled chargemaster fees.

Respond ONLY with a valid JSON object matching this schema:
{
  "summary": "Brief 2-3 sentence overview of findings in the requested language",
  "riskLevel": "High" | "Medium" | "Low",
  "riskScore": 85,
  "potentialSavings": "Estimated dollar range or percentage if applicable",
  "findings": [
    {
      "category": "Arbitration" | "Billing" | "Legal" | "Clinical",
      "title": "Short title in requested language",
      "statute": "Statutory citation or rule (e.g., 42 U.S.C. § 300gg-111, AMA Ethics Code)",
      "explanation": "Clear, compassionate plain-language breakdown for the patient",
      "action": "Concrete, actionable recommendation"
    }
  ],
  "itemizedFlags": [
    {
      "code": "CPT code or line item",
      "issue": "Specific flag"
    }
  ]
}
Return valid JSON only. Do not wrap in markdown backticks.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this healthcare paperwork:\n\n${rawText.slice(0, 6000)}` }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const parsedAudit = JSON.parse(completion.choices[0]?.message?.content || '{}');

    // Return in multiple property structures for complete frontend compatibility
    return res.status(200).json({
      success: true,
      audit: parsedAudit,
      ...parsedAudit
    });
  } catch (error) {
    console.error('Audit Error:', error);
    return res.status(500).json({ error: 'Failed to analyze healthcare document.' });
  }
};

// Map all route variations so no frontend call gets a 404
app.post('/api/analyze', handleAnalyze);
app.post('/analyze', handleAnalyze);
app.post('/api/audit', handleAnalyze);
app.post('/audit', handleAnalyze);

/**
 * Free Legal Dispute & Debt Validation Letter Generator
 */
app.post(['/api/generate-letter', '/generate-letter'], async (req, res) => {
  try {
    const { documentText, text, excerpt, auditFindings, patientName, facilityName } = req.body;
    const billExcerpt = documentText || text || excerpt || '';
    const patient = patientName || '[Patient Name]';
    const facility = facilityName || '[Hospital / Facility Billing Department]';

    const systemPrompt = `You are a healthcare consumer rights attorney and patient advocate drafting an official, legally cited Medical Debt Dispute and Statutory Validation Notice.
Cite where applicable:
- Federal No Surprises Act (42 U.S.C. § 300gg-111) regarding balance billing protections.
- Fair Debt Collection Practices Act (15 U.S.C. § 1692g) requiring debt verification.
- Demand for a complete itemized UB-04 / CMS-1450 statement with individual CPT and HCPCS codes.
- Formal demand placing the account on administrative hold and freezing external debt collection and credit bureau reporting.

Format as clean, ready-to-print formal text.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Patient: ${patient}\nFacility: ${facility}\nFlags: ${JSON.stringify(auditFindings || [])}\nDocument Excerpt:\n${billExcerpt.slice(0, 3000)}` }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2
    });

    const letterContent = completion.choices[0]?.message?.content || '';
    return res.status(200).json({ success: true, letter: letterContent });
  } catch (error) {
    console.error('Letter Error:', error);
    return res.status(500).json({ error: 'Failed to generate dispute packet.' });
  }
});

app.listen(port, () => {
  console.log(`SubText Health backend running on port ${port}`);
});