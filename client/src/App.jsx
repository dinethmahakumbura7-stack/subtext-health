import React, { useState } from 'react';

const BACKEND_URL = 'https://subtext-health.onrender.com';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // Dispute Letter Modal state
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [hasCopied, setHasCopied] = useState(false);

  // Sample data for quick hackathon demo
  const handleLoadSample = () => {
    setInputText(`EMERGENCY ROOM CHARGES - VALLEY HEALTH SYSTEM
Date of Service: 08/14/2026
Patient Account: #99482103

Line Items:
- 0450 EMERGENCY ROOM GENERAL: $4,850.00
- CPT 99285 EMERGENCY DEPT VISIT HIGH COMPLEXITY: $2,420.00
- CPT 70450 CT SCAN HEAD W/O CONTRAST: $3,600.00
- DR. J. MILLER (ANESTHESIOLOGY / OUT-OF-NETWORK): $1,850.00
- MISC SURGICAL SUPPLIES & BANDAGES: $980.00

Total Amount Due: $13,700.00
Notice: Patient signed standard admission arbitration covenant and financial responsibility agreement.`);
  };

  // Run the AI audit
  const handleRunAudit = async () => {
    if (!inputText.trim()) return;
    setIsAuditing(true);
    setAuditResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: inputText })
      });

      const data = await response.json();
      if (data.audit) {
        setAuditResult(data.audit);
      } else {
        alert('Could not complete audit. Please check your backend connection.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend server.');
    } finally {
      setIsAuditing(false);
    }
  };

  // Generate the free legal dispute packet
  const handleGenerateLetter = async () => {
    setIsGeneratingLetter(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: inputText,
          auditFindings: auditResult?.violations || [],
          patientName: 'Patient / Consumer',
          facilityName: 'Hospital Billing Department'
        })
      });

      const data = await response.json();
      if (data.letter) {
        setLetterContent(data.letter);
        setIsLetterModalOpen(true);
      } else {
        alert('Failed to generate dispute packet.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to backend.');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-blue-600/30">
              S
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">SubText Health</span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full uppercase">
                Hackathon Edition
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              Open-Source Patient Advocacy Tool
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Decode Hospital Paperwork & Dispute Unfair Medical Bills
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Audit hospital statements for illegal out-of-network balance billing, upcoded CPT facility fees, and hidden arbitration waivers. Generate certified dispute packets in seconds.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-200">
              Paste Bill Summary, Admission Form, or Itemized CPT Codes:
            </label>
            <button
              onClick={handleLoadSample}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4"
            >
              Load Sample Bill
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste hospital statement lines, CPT codes, or consent waiver paragraphs here..."
            className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <div className="flex justify-end">
            <button
              onClick={handleRunAudit}
              disabled={isAuditing || !inputText.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              {isAuditing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Auditing with Llama 3...</span>
                </>
              ) : (
                <span>Audit Document Free</span>
              )}
            </button>
          </div>
        </div>

        {/* Audit Results View */}
        {auditResult && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Overview Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Audit Findings
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">Consumer Advocacy Report</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  auditResult.riskLevel === 'High' 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {auditResult.riskLevel || 'Review'} Risk
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {auditResult.summary}
              </p>

              {auditResult.potentialSavingsEstimate && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs sm:text-sm font-medium">
                  💡 <strong>Potential Savings:</strong> {auditResult.potentialSavingsEstimate}
                </div>
              )}
            </div>

            {/* Red Flags / Violations */}
            {auditResult.violations && auditResult.violations.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h4 className="text-base font-bold text-white">Statutory Violations & Questionable Charges</h4>
                <div className="space-y-3">
                  {auditResult.violations.map((v, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-rose-400 text-sm">{v.title}</span>
                        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {v.statute}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{v.explanation}</p>
                      <p className="text-xs text-blue-400 font-medium">
                        <strong>Action:</strong> {v.recommendedAction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unlocked Free Action Bar */}
            <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-900/40 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Full Dispute Engine (100% Free)
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white">Generate Formal Dispute Notice</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-md">
                  Generates an audit-cited legal dispute notice invoking the federal No Surprises Act and debt validation rules to demand itemized review and freeze collections.
                </p>
              </div>

              <button
                onClick={handleGenerateLetter}
                disabled={isGeneratingLetter}
                className="w-full sm:w-auto min-w-[240px] px-6 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {isGeneratingLetter ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Generating Letter...</span>
                  </>
                ) : (
                  <span>Generate Dispute Packet (Free)</span>
                )}
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Dispute Letter Viewer Modal */}
      {isLetterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-left space-y-5">
            
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                    Free Patient Dispute Packet
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Formal Medical Debt Validation & Statutory Dispute Notice
                </h3>
              </div>
              <button
                onClick={() => setIsLetterModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 sm:p-6 max-h-[55vh] overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed text-slate-300 whitespace-pre-wrap select-text shadow-inner">
              {letterContent}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800">
              <p className="text-xs text-slate-400">
                Statutory Citations: 42 U.S.C. § 300gg-111 (No Surprises Act) & 15 U.S.C. § 1692g (FDCPA)
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-medium transition-all"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={handleCopyLetter}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {hasCopied ? "✓ Copied to Clipboard!" : "Copy Full Letter"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-6 text-center text-xs text-slate-500">
        <p>SubText Health • AI-Powered Patient Advocacy & Medical Transparency</p>
      </footer>

    </div>
  );
}