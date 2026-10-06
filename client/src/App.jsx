import React, { useState } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  Clock, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const SAMPLE_TEXT = `HOSPITAL SURGICAL CONSENT & FINANCIAL WAIVER:
The patient agrees that Dr. Smith and Associates may perform elective laparoscopic surgery. 
SECTION 4.2 - BINDING ARBITRATION: The signatory forfeits any right to trial by jury and submits all malpractice claims exclusively to private arbitration at the patient's shared expense.
SECTION 8 - OUT-OF-NETWORK COVERAGE: Patient authorizes care by supplemental surgical assistants or on-call anesthesiologists, and acknowledges responsibility for all out-of-network balance billings not covered by primary insurance.
DISCHARGE PRESCRIPTION:
- Amoxicillin 500mg: 1 tablet every morning with breakfast.
- Ibuprofen 600mg: Take 1 tablet afternoon as needed for pain.
- Doxycycline 100mg: 1 tablet at night. WARNING: Do NOT consume with dairy products or milk.`;

export default function App() {
  const [inputText, setInputText] = useState(SAMPLE_TEXT);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [viewLevel, setViewLevel] = useState('simplified'); // 'simplified' | 'standard'

  const handleScan = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textContent: inputText }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      setAnalysis(data);
    } catch (err) {
      console.error("Scan error:", err);
      setErrorMessage(err.message || "Failed to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              SubText <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-teal-950 border border-teal-800 text-teal-300">Health AI</span>
            </h1>
            <p className="text-xs text-slate-400">Demystifying hospital waivers & prescriptions</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Column */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" /> Input Medical Document
              </label>
              <button 
                onClick={() => setInputText(SAMPLE_TEXT)}
                className="text-xs text-teal-400 hover:underline"
              >
                Load Sample Waiver
              </button>
            </div>
            
            <textarea
              className="w-full flex-1 min-h-[320px] p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono focus:outline-none focus:border-teal-500 resize-none leading-relaxed"
              placeholder="Paste hospital consent copy, surgical agreement, or prescription notes here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            {errorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handleScan}
              disabled={loading}
              className="mt-4 w-full py-3 bg-teal-600 hover:bg-teal-500 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-teal-200" />
                  Auditing Clauses with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-teal-200" />
                  Audit & Translate Document
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results Column */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          {!analysis ? (
            <div className="h-full border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-500 min-h-[400px]">
              <FileText className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm font-medium text-slate-400">No document scanned yet</p>
              <p className="text-xs max-w-sm mt-1">Paste text on the left and click "Audit & Translate Document" to see plain-English explanations.</p>
            </div>
          ) : (
            <>
              {/* Summary Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Doc Type:</span>
                    <span className="text-xs bg-slate-800 text-teal-300 font-semibold px-2 py-0.5 rounded border border-slate-700">
                      {analysis.documentType || "Medical Record"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Reading Level:</span>
                    <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex">
                      <button
                        onClick={() => setViewLevel('simplified')}
                        className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${viewLevel === 'simplified' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}
                      >
                        Plain English
                      </button>
                      <button
                        onClick={() => setViewLevel('standard')}
                        className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${viewLevel === 'standard' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}
                      >
                        Original Tone
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed">
                  {viewLevel === 'simplified' 
                    ? (analysis.summary?.simplified || analysis.summary || "Summary generated.") 
                    : (analysis.summary?.standard || analysis.summary || "Summary generated.")}
                </p>
              </div>

              {/* Flagged Traps & Clauses */}
              {Array.isArray(analysis.flaggedClauses) && analysis.flaggedClauses.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Flagged Traps & Legal Fine-Print ({analysis.flaggedClauses.length})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {analysis.flaggedClauses.map((clause, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 border-l-4 border-l-rose-500">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-rose-300">{clause.clauseTitle || "Risk Clause"}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {clause.severity || "Warning"} Risk
                          </span>
                        </div>
                        {clause.originalQuote && (
                          <p className="text-xs italic text-slate-400 border-l-2 border-slate-800 pl-2 mb-2">
                            "{clause.originalQuote}"
                          </p>
                        )}
                        <p className="text-xs text-slate-200 font-medium">
                          💡 <span className="font-semibold text-teal-300">Plain Impact:</span> {clause.plainExplanation || "Pay close attention to this clause."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medication Schedule Timeline */}
              {Array.isArray(analysis.medicationTimeline) && analysis.medicationTimeline.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-teal-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Daily Medication Schedule
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {analysis.medicationTimeline.map((med, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-teal-300 px-2 py-0.5 rounded">
                            {med.timeSlot || "Scheduled"}
                          </span>
                          <p className="text-xs font-bold text-white mt-2">{med.medicationName}</p>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">{med.instructions}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}