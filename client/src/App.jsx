import React, { useState, useRef } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  Clock, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  UploadCloud, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  CheckSquare 
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [viewLevel, setViewLevel] = useState('simplified');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleScan = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        res = await fetch('http://localhost:5000/api/analyze-file', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('http://localhost:5000/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ textContent: inputText }),
        });
      }

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to process document');
      }

      setAnalysis(data);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Make sure the backend server is running on port 5000!');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans print:bg-white print:text-black">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-20 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              SubText <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-teal-950 border border-teal-800 text-teal-300">Health AI</span>
            </h1>
            <p className="text-xs text-slate-400">Medical consent auditor & patient care translator</p>
          </div>
        </div>

        {analysis && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl transition"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            Print Care Card
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 print:p-0 print:block">
        
        {/* Left Column: Upload & Text Ingestion */}
        <section className="lg:col-span-5 flex flex-col gap-4 print:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col flex-1">
            
            {/* File Drag-and-Drop Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-950/40 mb-4"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/*,.pdf,.txt" 
                className="hidden" 
              />
              <UploadCloud className="w-8 h-8 text-teal-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">
                {selectedFile ? selectedFile.name : "Click to upload prescription photo or document scan"}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, or PDF up to 10MB</p>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between bg-teal-950/30 border border-teal-800/50 rounded-xl px-3 py-2 mb-3">
                <span className="text-xs text-teal-300 truncate max-w-[240px]">{selectedFile.name}</span>
                <button onClick={clearFile} className="text-[11px] text-rose-400 hover:underline">Remove</button>
              </div>
            )}

            {filePreview && (
              <div className="mb-4 rounded-xl overflow-hidden border border-slate-800 max-h-48 flex justify-center bg-black/40">
                <img src={filePreview} alt="Scan preview" className="object-contain max-h-48" />
              </div>
            )}

            {/* Raw Text Fallback */}
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-400" /> Or paste document text:
              </label>
              <button 
                onClick={() => { clearFile(); setInputText(SAMPLE_TEXT); }}
                className="text-[11px] text-teal-400 hover:underline"
              >
                Reset Sample
              </button>
            </div>
            
            <textarea
              disabled={!!selectedFile}
              className={`w-full flex-1 min-h-[220px] p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono resize-none focus:outline-none focus:border-teal-500 leading-relaxed ${selectedFile ? 'opacity-40 cursor-not-allowed text-slate-500' : 'text-slate-300'}`}
              placeholder="Paste hospital consent copy, surgical agreement, or prescription notes here..."
              value={selectedFile ? "[File uploaded — ready to scan]" : inputText}
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
                  Auditing Clauses & Risks...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-teal-200" />
                  Audit Document
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Column: Results & Care Card */}
        <section className="lg:col-span-7 flex flex-col gap-5 print:w-full">
          {!analysis ? (
            <div className="h-full border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-500 min-h-[400px]">
              <FileText className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm font-medium text-slate-400">No document scanned yet</p>
              <p className="text-xs max-w-sm mt-1">Upload a prescription or consent document to generate a patient impact breakdown.</p>
            </div>
          ) : (
            <>
              {/* Vulnerability Meter & Document Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:grid-cols-3">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between print:bg-white print:border-black">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 print:text-gray-700">Document Type</span>
                  <span className="text-sm font-bold text-teal-300 mt-1 print:text-black">{analysis.documentType || 'Medical Record'}</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between sm:col-span-2 print:bg-white print:border-black">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 print:text-gray-700">Patient Vulnerability Score</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${analysis.vulnerabilityScore > 70 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                      {analysis.vulnerabilityScore || 0}/100 ({analysis.vulnerabilityLevel || 'Risk'})
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${analysis.vulnerabilityScore > 70 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${analysis.vulnerabilityScore || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Financial Liability Banner */}
              {analysis.financialLiabilityWarning && (
                <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3 print:border-black print:bg-yellow-50">
                  <DollarSign className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider print:text-black">Out-Of-Pocket Billing Alert</h4>
                    <p className="text-xs text-slate-200 mt-1 print:text-gray-800">{analysis.financialLiabilityWarning}</p>
                  </div>
                </div>
              )}

              {/* Summary Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm print:bg-white print:border-black">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 print:border-black">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-black">Document Summary</span>
                  <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex print:hidden">
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
                <p className="text-sm text-slate-200 leading-relaxed print:text-black">
                  {viewLevel === 'simplified' 
                    ? (analysis.summary?.simplified || analysis.summary) 
                    : (analysis.summary?.standard || analysis.summary)}
                </p>
              </div>

              {/* Flagged Traps */}
              {Array.isArray(analysis.flaggedClauses) && analysis.flaggedClauses.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 print:bg-white print:border-black">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider print:text-black">
                      Identified Legal Clauses & Hazards ({analysis.flaggedClauses.length})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {analysis.flaggedClauses.map((clause, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 border-l-4 border-l-rose-500 print:bg-white print:border-black">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-rose-300 print:text-black">{clause.clauseTitle}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 print:border-black print:text-black">
                            {clause.severity} Risk
                          </span>
                        </div>
                        {clause.originalQuote && (
                          <p className="text-xs italic text-slate-400 border-l-2 border-slate-800 pl-2 mb-2 print:text-gray-700 print:border-black">
                            "{clause.originalQuote}"
                          </p>
                        )}
                        <p className="text-xs text-slate-200 font-medium print:text-black">
                          💡 <span className="font-semibold text-teal-300 print:text-black">Patient Impact:</span> {clause.plainExplanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medication Schedule Timeline */}
              {Array.isArray(analysis.medicationTimeline) && analysis.medicationTimeline.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 print:bg-white print:border-black">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-teal-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider print:text-black">
                      Medication Regimen Schedule
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:grid-cols-3">
                    {analysis.medicationTimeline.map((med, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between print:bg-white print:border-black">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-teal-300 px-2 py-0.5 rounded print:border print:border-black print:text-black">
                            {med.timeSlot}
                          </span>
                          <p className="text-xs font-bold text-white mt-2 print:text-black">{med.medicationName}</p>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug print:text-gray-700">{med.instructions}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Caregiver Checklist */}
              {Array.isArray(analysis.caregiverChecklist) && analysis.caregiverChecklist.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 print:bg-white print:border-black">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckSquare className="w-5 h-5 text-teal-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider print:text-black">
                      Discharge & Caregiver Action Items
                    </h3>
                  </div>

                  <ul className="space-y-2">
                    {analysis.caregiverChecklist.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 print:text-black">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 print:text-black" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}