import React, { useState } from 'react';

const BACKEND_URL = 'https://subtext-health.onrender.com';

export default function App() {
  const [activeTab, setActiveTab] = useState('paste');
  const [inputText, setInputText] = useState(
    `HOSPITAL SURGICAL CONSENT & FINANCIAL WAIVER:
The patient agrees that Dr. Smith and Associates may perform elective laparoscopic surgery.
SECTION 4.2 - BINDING ARBITRATION: The signatory forfeits any right to trial by jury and submits all malpractice claims exclusively to private arbitration at the patient's shared expense.
SECTION 8 - OUT-OF-NETWORK COVERAGE: Patient authorizes care by supplemental surgical assistants or on-call anesthesiologists, and acknowledges responsibility for all out-of-network balance billings not covered by primary insurance.`
  );
  const [isAuditing, setIsAuditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [auditResult, setAuditResult] = useState(null);

  // Consultations Drawer
  const [consultations, setConsultations] = useState([
    { id: 1, title: 'Surgical Consent', lang: 'English', time: '22:57', score: 85 },
    { id: 2, title: 'Surgical Consent & Financial Waiver', lang: 'English', time: '23:30', score: 85 },
    { id: 3, title: 'Emergency Room Discharge Summary', lang: 'English', time: '00:31', score: 85 },
  ]);

  // Modal State for Free Dispute Letter
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [hasCopied, setHasCopied] = useState(false);

  const handleClearText = () => setInputText('');

  const handleLoadSample = () => {
    setInputText(`EMERGENCY DEPARTMENT CHARGES & ADMISSION NOTICE
Facility: Valley Health Hospital System
Date of Service: 09/14/2026

Billed Line Items:
- 0450 EMERGENCY ROOM GENERAL FACILITY FEE: $4,850.00
- CPT 99285 ER EVALUATION LEVEL 5 (HIGH COMPLEXITY): $2,420.00
- CPT 70450 CT HEAD/BRAIN WITHOUT CONTRAST: $3,600.00
- DR. J. MILLER (ANESTHESIOLOGY / OUT-OF-NETWORK): $1,850.00
- MISC PHARMACY & IV SUPPLIES: $980.00

Total Amount Due: $13,700.00
Agreement: Patient agrees to submit all billing controversies to binding arbitration and waives trial by jury.`);
  };

  // Perform Analysis against /api/analyze
  const handleRunAudit = async () => {
    if (!inputText.trim()) {
      setErrorMessage('Please provide a document excerpt to audit.');
      return;
    }

    setIsAuditing(true);
    setErrorMessage('');
    setAuditResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: inputText })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const result = data.audit || data;
      setAuditResult(result);

      // Add to recent history
      setConsultations(prev => [
        {
          id: Date.now(),
          title: 'Document Audit',
          lang: 'English',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          score: result.riskScore || 85
        },
        ...prev
      ]);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to connect to backend service.');
    } finally {
      setIsAuditing(false);
    }
  };

  // Generate Free Legal Dispute Letter
  const handleGenerateDisputeNotice = async () => {
    setIsGeneratingLetter(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: inputText,
          auditFindings: auditResult?.violations || [],
          patientName: 'Patient / Consumer',
          facilityName: 'Hospital Billing Compliance Department'
        })
      });

      const data = await response.json();
      if (data.letter) {
        setLetterContent(data.letter);
        setIsLetterModalOpen(true);
      } else {
        alert('Could not generate dispute letter.');
      }
    } catch (err) {
      console.error(err);
      alert('Error communicating with dispute engine.');
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(letterContent);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col antialiased">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-teal-800 tracking-tight">SubText Health</span>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-full tracking-wide">
                  PATIENT COMPANION
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Understand your healthcare paperwork before you sign</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Private session</span>
            </div>

            <select className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600">
              <option>English (US)</option>
              <option>සිංහල</option>
              <option>தமிழ்</option>
              <option>Español</option>
            </select>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-4 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/80">
              <svg className="w-3.5 h-3.5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
              </svg>
              Privacy-first document analysis • Plain-language translations
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Understand before you sign.
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              You are safe. We will help you understand every surgical waiver, emergency notice, or discharge prescription in plain speech before you commit.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4 self-start md:self-auto">
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white">MD</div>
              <div className="w-9 h-9 rounded-full bg-cyan-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white">RN</div>
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white">JD</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-800">Advocate Guidance Ready</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">English • සිංහල • தமிழ் • Español</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Split Grid */}
      <main className="max-w-7xl mx-auto px-6 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & History */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700 tracking-wider uppercase">
                Analyze a Healthcare Document
              </span>
              <span className="text-xs font-semibold text-slate-400">Step 1 of 2</span>
            </div>

            {/* Tab Buttons */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload PDF / Scan
              </button>
              <button
                onClick={() => setActiveTab('paste')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'paste' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Paste Text
              </button>
              <button
                onClick={handleLoadSample}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-teal-700 flex items-center justify-center gap-1 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Try Sample
              </button>
            </div>

            {/* Input Text Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Document Excerpt:</span>
                <button
                  onClick={handleClearText}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste the paragraph, consent waiver, or billing statement line items..."
                rows={7}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all leading-relaxed"
              />
            </div>

            {/* Recent Consultations List */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>RECENT CONSULTATIONS ({consultations.length})</span>
                </div>
                <button
                  onClick={() => setConsultations([])}
                  className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {consultations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                        {item.score}
                      </span>
                      <span className="font-semibold text-slate-700 truncate">{item.title}</span>
                      <span className="text-[10px] text-slate-400">({item.lang})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Run Audit Action Button */}
            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold text-sm rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isAuditing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Auditing with Medical & Legal Models...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Run Patient Advocacy Audit</span>
                  <span>→</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Column: Output / Advocate Display */}
        <div className="lg:col-span-7">
          {auditResult ? (
            <div className="space-y-6">
              
              {/* Findings Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Advocate Findings</span>
                    <h3 className="text-xl font-bold text-slate-900">Document Plain-Speech Breakdown</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">
                    {auditResult.riskLevel || 'High'} Risk ({auditResult.riskScore || 85}/100)
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {auditResult.summary}
                </p>

                {auditResult.potentialSavings && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <span>💡 Identified Savings Potential:</span>
                    <span>{auditResult.potentialSavings}</span>
                  </div>
                )}
              </div>

              {/* Identified Red Flags / Violations */}
              {auditResult.violations && auditResult.violations.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Clauses Requiring Action Before Signing / Paying
                  </h4>
                  <div className="space-y-3">
                    {auditResult.violations.map((v, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-rose-600 text-sm">{v.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500">
                            {v.statute}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{v.explanation}</p>
                        <p className="text-xs text-teal-800 font-semibold pt-1">
                          <strong>Recommended Patient Move:</strong> {v.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Free Dispute Action Banner (replaces Gumroad paywall) */}
              <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      100% Free Public Advocate Tool
                    </span>
                  </div>
                  <h4 className="text-lg font-bold">Generate Formal Legal Dispute Packet</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
                    Creates an audit-ready dispute notice citing the No Surprises Act and debt validation rules to demand itemized review and freeze collections.
                  </p>
                </div>

                <button
                  onClick={handleGenerateDisputeNotice}
                  disabled={isGeneratingLetter}
                  className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 flex-shrink-0"
                >
                  {isGeneratingLetter ? (
                    <span>Generating Dispute Notice...</span>
                  ) : (
                    <span>Generate Free Dispute Letter</span>
                  )}
                </button>
              </div>

            </div>
          ) : (
            /* Empty State Container */
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center h-full min-h-[460px] flex flex-col items-center justify-center bg-white/50 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-base font-bold text-slate-900">Your Healthcare Advocate is Ready</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload your document or pick a sample on the left. We will review legal arbitration, financial bills, and medication schedules before you sign.
                </p>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Free Dispute Letter Viewer Modal */}
      {isLetterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-left space-y-4 border border-slate-200">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  Audit-Cited Legal Notice
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Medical Debt Validation & Statutory Dispute Notice
                </h3>
              </div>
              <button
                onClick={() => setIsLetterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-h-[55vh] overflow-y-auto font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap select-text">
              {letterContent}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Statutory Citations: 42 U.S.C. § 300gg-111 & 15 U.S.C. § 1692g
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={handleCopyLetter}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  {hasCopied ? "✓ Copied to Clipboard!" : "Copy Full Letter"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>SubText Health • Empowering patients with clinical, legal, and billing clarity</p>
      </footer>

    </div>
  );
}