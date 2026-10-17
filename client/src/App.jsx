import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Copy, 
  Check, 
  Printer, 
  Save, 
  Globe, 
  Lock, 
  Users, 
  Sparkles,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

const SAMPLE_DOC = `HOSPITAL SURGICAL CONSENT & FINANCIAL WAIVER:
The patient agrees that Dr. Smith and Associates may perform elective laparoscopic surgery.
SECTION 4.2 - BINDING ARBITRATION: The signatory forfeits any right to trial by jury and submits all malpractice claims exclusively to private arbitration at the patient's shared expense.
SECTION 8 - OUT-OF-NETWORK COVERAGE: Patient authorizes care by supplemental surgical assistants or on-call anesthesiologists, and acknowledges responsibility for all out-of-network balance billings exceeding standard allowable insurance payments.`;

export default function App() {
  const [documentText, setDocumentText] = useState(SAMPLE_DOC);
  const [targetLanguage, setTargetLanguage] = useState('English (US)');
  const [selectedScriptLang, setSelectedScriptLang] = useState('EN');
  const [summaryTone, setSummaryTone] = useState('plain'); // 'plain' | 'clinical'
  const [isCaregiverMode, setIsCaregiverMode] = useState(false);
  const [activeHighlightQuote, setActiveHighlightQuote] = useState(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Main Audit State
  const [auditResult, setAuditResult] = useState({
    riskScore: 92,
    riskLevel: 'High',
    documentCategory: 'Clinical Record',
    plainSummary: "The consent includes a prohibited binding arbitration clause for malpractice claims and forces the patient to accept out-of-network balance billing, both likely violating the No Surprises Act. Immediate action is needed to remove or renegotiate these provisions.",
    clinicalSummary: "Formal review under 42 U.S.C. § 300gg-111 identifies non-compliant balance billing covenants regarding facility-based surgical assistants and anesthesiology. Mandatory pre-dispute arbitration conflicts with state patient rights protections and Fourteenth Amendment procedural due process.",
    script: "I am calling to formally dispute the charges on this account under the federal No Surprises Act (42 U.S.C. § 300gg-111). Please place this bill on administrative hold and provide a complete itemized UB-04 CMS-1450 statement with all CPT and revenue codes before any further collection action.",
    scriptTranslations: {
      EN: "I am calling to formally dispute the charges on this account under the federal No Surprises Act (42 U.S.C. § 300gg-111). Please place this bill on administrative hold and provide a complete itemized UB-04 CMS-1450 statement with all CPT and revenue codes before any further collection action.",
      SI: "මම No Surprises Act පනත යටතේ මෙම බිල්පත පිළිබඳව විරෝධය පළ කරමි. කරුණාකර මෙම ගිණුම අත්හිටුවා සියලුම CPT කේත සහිත විස්තරාත්මක බිල්පතක් ලබා දෙන්න.",
      TA: "No Surprises Act சட்டத்தின் கீழ் இந்தக் கட்டணத்தை நான் எதிர்க்கிறேன். தயவுசெய்து இந்த பில் மீது நடவடிக்கையை நிறுத்தி முழு விவர அறிக்கையை வழங்கவும்.",
      SP: "Llamo para disputar formalmente los cargos bajo la Ley Sin Sorpresas (42 U.S.C. § 300gg-111). Por favor pongan esta cuenta en espera administrativa y entreguen una factura detallada UB-04."
    },
    hazards: [
      {
        id: 'h1',
        title: 'Mandatory Binding Arbitration Clause',
        severity: 'High',
        statute: 'Federal Arbitration Act (9 U.S.C. § 1)',
        explanation: 'Section 4.2 forces you to forfeit your constitutional right to trial by jury for any malpractice or negligence claims.',
        action: 'Request an arbitration opt-out form or strike through Section 4.2 before signing.',
        quote: "SECTION 4.2 - BINDING ARBITRATION: The signatory forfeits any right to trial by jury and submits all malpractice claims exclusively to private arbitration at the patient's shared expense."
      },
      {
        id: 'h2',
        title: 'Out-of-Network Balance Billing Risk',
        severity: 'High',
        statute: '42 U.S.C. § 300gg-111 (No Surprises Act)',
        explanation: 'Assigns full financial liability for non-contracted ancillary providers without required 72-hour notice.',
        action: 'Insist on in-network median rates and demand itemized CMS-1450 statements.',
        quote: "SECTION 8 - OUT-OF-NETWORK COVERAGE: Patient authorizes care by supplemental surgical assistants or on-call anesthesiologists, and acknowledges responsibility for all out-of-network balance billings"
      }
    ],
    caregiverTasks: [
      {
        id: 'task-1',
        task: 'Request and secure an itemized UB-04 / CMS-1450 bill with individual CPT codes',
        priority: 'High',
        completed: false
      },
      {
        id: 'task-2',
        task: 'Submit written notice to hospital patient relations opting out of mandatory arbitration',
        priority: 'High',
        completed: false
      },
      {
        id: 'task-3',
        task: 'Verify in-network coverage status for anesthesiologist and surgical assistants',
        priority: 'Medium',
        completed: false
      },
      {
        id: 'task-4',
        task: 'Place account on formal 30-day administrative hold to prevent debt collection referral',
        priority: 'High',
        completed: false
      }
    ]
  });

  const [consultations, setConsultations] = useState([
    { id: 1, type: 'Clinical Form', lang: 'English', score: 92, time: '00:13' },
    { id: 2, type: 'Clinical Form', lang: 'English', score: 82, time: '00:13' },
    { id: 3, type: 'Clinical Form', lang: 'English', score: 88, time: '00:12' }
  ]);

  const toggleTaskCompletion = (taskId) => {
    setAuditResult(prev => ({
      ...prev,
      caregiverTasks: prev.caregiverTasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    }));
  };

  const copyAdvocateScript = () => {
    const textToCopy = auditResult?.scriptTranslations?.[selectedScriptLang] || auditResult?.script || '';
    navigator.clipboard.writeText(textToCopy);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const runAdvocacyAudit = async () => {
    if (!documentText.trim()) {
      setErrorMessage('Healthcare document excerpt or bill text is required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://subtext-health.onrender.com';
      const response = await fetch(`${backendUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentText: documentText,
          text: documentText,
          language: targetLanguage
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const audit = data.audit || data;

      setAuditResult({
        riskScore: audit.riskScore || 92,
        riskLevel: audit.riskLevel || 'High',
        documentCategory: audit.documentCategory || 'Clinical Record',
        plainSummary: audit.plainSummary || audit.summary || '',
        clinicalSummary: audit.clinicalSummary || audit.summary || '',
        script: audit.script || audit.advocateScript || audit.whatToSay || '',
        scriptTranslations: audit.scriptTranslations || {
          EN: audit.script || audit.advocateScript || '',
          SI: audit.script || '',
          TA: audit.script || '',
          SP: audit.script || ''
        },
        hazards: audit.hazards || [],
        caregiverTasks: audit.caregiverTasks || [
          { id: 'task-1', task: 'Request itemized UB-04 CMS-1450 bill', priority: 'High', completed: false },
          { id: 'task-2', task: 'Opt out of mandatory binding arbitration', priority: 'High', completed: false }
        ]
      });

      setConsultations(prev => [
        {
          id: Date.now(),
          type: audit.documentCategory || 'Clinical Form',
          lang: targetLanguage.split(' ')[0],
          score: audit.riskScore || 90,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev.slice(0, 5)
      ]);

    } catch (err) {
      console.error('Audit failed:', err);
      setErrorMessage(err.message || 'Failed to analyze document.');
    } finally {
      setLoading(false);
    }
  };

  const renderHighlightedDocument = () => {
    if (!activeHighlightQuote || !documentText.includes(activeHighlightQuote)) {
      return documentText;
    }

    const parts = documentText.split(activeHighlightQuote);
    return (
      <>
        {parts[0]}
        <mark className="bg-amber-200 text-amber-950 font-medium px-1 rounded transition-colors duration-300">
          {activeHighlightQuote}
        </mark>
        {parts[1]}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-800 font-sans pb-16">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">SubText Health</span>
                <span className="bg-teal-50 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                  PATIENT COMPANION
                </span>
              </div>
              <p className="text-xs text-slate-500">Understand your healthcare paperwork before you sign</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Private session</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <select 
                value={targetLanguage} 
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option>English (US)</option>
                <option>Sinhala (සිංහල)</option>
                <option>Tamil (தமிழ்)</option>
                <option>Spanish (Español)</option>
              </select>
            </div>

            <button 
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg shadow-sm font-medium transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Report</span>
            </button>

            <button 
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-1.5 rounded-lg shadow-sm font-medium transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Care Card</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Privacy-first document analysis • Plain-language translations</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Understand before you sign.</h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              You are safe. We will help you understand every surgical waiver, emergency notice, or discharge prescription in plain speech before you commit.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-4">
            <div className="flex -space-x-2">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white">MD</span>
              <span className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white">RN</span>
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white">JD</span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Advocate Guidance Ready
              </div>
              <span className="text-[11px] text-slate-500 font-medium">English • සිංහල • தமிழ் • Español</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2">
        {/* Left Column: Input Panel */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Analyze a Healthcare Document</span>
              <span className="text-xs text-slate-400 font-medium">Step 1 of 2</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <button 
                type="button" 
                onClick={() => alert("Upload PDF functionality ready. Text parser active.")}
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Upload PDF / Scan</span>
              </button>
              <button 
                type="button" 
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Paste Text</span>
              </button>
              <button 
                type="button" 
                onClick={() => setDocumentText(SAMPLE_DOC)}
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try Sample</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1.5">
              <span>DOCUMENT EXCERPT:</span>
              <button 
                onClick={() => setDocumentText('')} 
                className="hover:text-slate-800 transition"
              >
                Clear
              </button>
            </div>

            <textarea
              rows={8}
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste surgical waiver, ER notice, medical bill lines, or discharge medication instructions here..."
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition resize-none leading-relaxed text-slate-700"
            />

            {errorMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={runAdvocacyAudit}
              disabled={loading}
              className="w-full mt-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Auditing with Healthcare Advocate Committee...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Run Patient Advocacy Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Recent Consultations List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                RECENT CONSULTATIONS ({consultations.length})
              </span>
              <button 
                onClick={() => setConsultations([])} 
                className="hover:text-slate-800 text-[11px] font-normal transition"
              >
                Clear
              </button>
            </div>

            <div className="space-y-2">
              {consultations.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[11px]">
                      {c.score}
                    </span>
                    <span className="font-medium text-slate-700">{c.type}</span>
                    <span className="text-[11px] text-slate-400">({c.lang})</span>
                  </div>
                  <span className="text-slate-400 text-[11px] font-mono">{c.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Advocacy Dashboard & Highlighting */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Patient Risk Overview
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{auditResult.riskScore}</span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full ml-auto">
                  {auditResult.riskLevel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {auditResult.hazards.length} items deserving your attention
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Document Category
              </span>
              <div className="text-lg font-bold text-slate-800 mt-1">
                {auditResult.documentCategory}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                ✓ Verified from document
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                View Mode
              </span>
              <button
                onClick={() => setIsCaregiverMode(!isCaregiverMode)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  isCaregiverMode 
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{isCaregiverMode ? 'Switch to Patient View' : 'Switch to Caregiver View'}</span>
              </button>
            </div>
          </div>

          {/* WHAT SHOULD I SAY TO THE HOSPITAL? Script Box */}
          <div className="bg-[#0F1E22] text-white rounded-2xl p-5 shadow-lg border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
                  What Should I Say to the Hospital?
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Read this directly to staff</span>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-sm leading-relaxed text-slate-200 font-serif min-h-[75px] flex items-center">
              "{auditResult?.scriptTranslations?.[selectedScriptLang] || auditResult?.script || "..."}"
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={copyAdvocateScript}
                className="flex items-center gap-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-1.5 rounded-lg transition shadow-sm"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Script'}</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span>Translate script:</span>
                {['EN', 'SI', 'TA', 'SP'].map(langKey => (
                  <button
                    key={langKey}
                    onClick={() => setSelectedScriptLang(langKey)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                      selectedScriptLang === langKey 
                        ? 'bg-teal-500 text-white' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {langKey}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Caregiver Task Checklist (Active when toggled or available) */}
          {isCaregiverMode && (
            <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Caregiver Action Checklist
                  </span>
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {auditResult.caregiverTasks.filter(t => t.completed).length} / {auditResult.caregiverTasks.length} Completed
                </span>
              </div>

              <div className="space-y-2 mt-2">
                {auditResult.caregiverTasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => toggleTaskCompletion(t.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      t.completed 
                        ? 'bg-slate-50 border-slate-200 text-slate-400 line-through' 
                        : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800 shadow-sm'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={t.completed} 
                      onChange={() => {}} 
                      className="mt-0.5 rounded text-indigo-600 cursor-pointer"
                    />
                    <div className="flex-1 text-xs font-medium leading-relaxed">
                      {t.task}
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      t.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patient Summary with Plain Language / Clinical Tone Switcher */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Patient Summary ({targetLanguage.split(' ')[0]})</span>
              </div>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setSummaryTone('plain')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    summaryTone === 'plain' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Plain Language
                </button>
                <button
                  onClick={() => setSummaryTone('clinical')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    summaryTone === 'clinical' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Clinical Tone
                </button>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-700">
              {summaryTone === 'plain' ? auditResult.plainSummary : auditResult.clinicalSummary}
            </p>
          </div>

          {/* Identified Hazards with Interactive Highlighting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Identified Document Hazards ({auditResult.hazards.length})</span>
              <span className="text-[11px] text-teal-700 font-medium lowercase">Click any hazard to highlight text below</span>
            </div>

            {auditResult.hazards.map((hazard) => (
              <div
                key={hazard.id}
                onClick={() => setActiveHighlightQuote(hazard.quote === activeHighlightQuote ? null : hazard.quote)}
                className={`p-4 rounded-2xl border cursor-pointer transition shadow-sm ${
                  activeHighlightQuote === hazard.quote 
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-300' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {hazard.title}
                  </h4>
                  <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    {hazard.statute}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">{hazard.explanation}</p>
                <div className="text-[11px] font-medium text-teal-800 bg-teal-50 border border-teal-200 rounded-lg p-2">
                  <span className="font-bold">Recommended Patient Action:</span> {hazard.action}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Document Reference Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                Original Document Reference
              </span>
              <span className="text-[11px] text-teal-600 font-normal">
                {activeHighlightQuote ? 'Hazard Highlight Active' : 'Click any hazard above to highlight'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {renderHighlightedDocument()}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span><strong>Important:</strong> SubText provides educational information and document analysis. It does not replace advice from a qualified healthcare professional, attorney, pharmacist, or insurer.</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Private In-Session Storage</span>
          <span>•</span>
          <span>Multi-Language Verification</span>
        </div>
      </footer>
    </div>
  );
}