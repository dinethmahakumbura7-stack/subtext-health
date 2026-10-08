import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  Clock, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  UploadCloud, 
  Printer, 
  Download,
  CheckCircle2, 
  Circle,
  AlertCircle, 
  DollarSign, 
  CheckSquare, 
  Languages, 
  RotateCcw,
  MessageSquare,
  X,
  History,
  Trash2,
  Copy,
  Check
} from 'lucide-react';

const CLINICAL_PRESETS = [
  {
    id: 'surgical',
    title: 'Surgical Waiver',
    text: `HOSPITAL SURGICAL CONSENT & FINANCIAL WAIVER:
The patient agrees that Dr. Smith and Associates may perform elective laparoscopic surgery. 
SECTION 4.2 - BINDING ARBITRATION: The signatory forfeits any right to trial by jury and submits all malpractice claims exclusively to private arbitration at the patient's shared expense.
SECTION 8 - OUT-OF-NETWORK COVERAGE: Patient authorizes care by supplemental surgical assistants or on-call anesthesiologists, and acknowledges responsibility for all out-of-network balance billings not covered by primary insurance.`
  },
  {
    id: 'pediatric',
    title: 'Pediatric Antibiotic Rx',
    text: `DISCHARGE PRESCRIPTION & PEDIATRIC INSTRUCTIONS:
- Amoxicillin-Clavulanate (Augmentin) 400mg/5mL: Give 5 mL orally every 12 hours with food for 10 full days.
- Ibuprofen Infant Drops 50mg/1.25mL: Give 1.25 mL every 6 to 8 hours as needed for high fever (>38.5°C). Never give on an empty stomach.
- Warning: Stop immediately and go to ER if skin rash, wheezing, or facial swelling occurs.`
  },
  {
    id: 'emergency',
    title: 'ER Surprise Billing Notice',
    text: `EMERGENCY ROOM DISCHARGE SUMMARY & FINANCIAL UNDERTAKING:
Patient presented with acute non-cardiac chest tightness. EKG normal.
OUT-OF-NETWORK NOTICE: Diagnostic scans and lab testing were processed by third-party offsite physicians who are out-of-network.
The patient assumes full personal liability for all remaining balances, copays, and non-contracted facility fees exceeding primary insurance coverage.`
  }
];

const LANGUAGES = [
  { code: 'English', label: 'English' },
  { code: 'Sinhala', label: 'සිංහල (Sinhala)' },
  { code: 'Tamil', label: 'தமிழ் (Tamil)' },
  { code: 'Spanish', label: 'Español' }
];

const STORAGE_KEY = 'subtext_audit_history';

export default function App() {
  const [inputText, setInputText] = useState(CLINICAL_PRESETS[0].text);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [viewLevel, setViewLevel] = useState('simplified');
  const fileInputRef = useRef(null);

  // Day 4 Clause Action Modal State
  const [activeClauseAction, setActiveClauseAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionData, setActionData] = useState(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Day 4 Checklist Toggles & History
  const [completedTasks, setCompletedTasks] = useState({});
  const [auditHistory, setAuditHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setAuditHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage:", e);
    }
  }, []);

  const toggleTask = (idx) => {
    setCompletedTasks(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const saveToHistory = (newAnalysis, langUsed, docSnippet) => {
    try {
      const record = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        documentType: newAnalysis.documentType || 'Medical Doc',
        vulnerabilityScore: newAnalysis.vulnerabilityScore || 0,
        language: langUsed,
        snippet: docSnippet ? docSnippet.slice(0, 75) + '...' : 'Uploaded File',
        data: newAnalysis
      };

      const updated = [record, ...auditHistory.slice(0, 4)];
      setAuditHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save audit history:", e);
    }
  };

  const clearHistory = () => {
    setAuditHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const restoreAudit = (record) => {
    setAnalysis(record.data);
    setTargetLanguage(record.language || 'English');
    setViewLevel('simplified');
    setCompletedTasks({});
  };

  const handleFile = (file) => {
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleFileSelect = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const executeAudit = async (langToUse = targetLanguage) => {
    setLoading(true);
    setErrorMessage(null);
    setCompletedTasks({});

    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('language', langToUse);
        res = await fetch('http://localhost:5000/api/analyze-file', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('http://localhost:5000/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            textContent: inputText, 
            language: langToUse 
          }),
        });
      }

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to process document');
      }

      setAnalysis(data);
      setViewLevel('simplified');
      saveToHistory(data, langToUse, selectedFile ? selectedFile.name : inputText);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Make sure the backend server is running on port 5000!');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setTargetLanguage(newLang);
    if (analysis) {
      executeAudit(newLang);
    }
  };

  const handleGetClauseAdvice = async (clause) => {
    setActiveClauseAction(clause);
    setActionLoading(true);
    setActionData(null);
    setCopiedScript(false);

    try {
      const res = await fetch('http://localhost:5000/api/clause-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseTitle: clause.clauseTitle,
          originalQuote: clause.originalQuote,
          plainExplanation: clause.plainExplanation,
          language: targetLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch advice');
      setActionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyScript = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Export readable summary text file
  const handleExportText = () => {
    if (!analysis) return;
    
    let content = `=======================================================\n`;
    content += `SUBTEXT HEALTH AI - PATIENT ADVOCACY & DISCHARGE REPORT\n`;
    content += `=======================================================\n\n`;
    content += `Document Type: ${analysis.documentType || 'Medical Record'}\n`;
    content += `Vulnerability Risk Score: ${analysis.vulnerabilityScore}/100 (${analysis.vulnerabilityLevel})\n`;
    content += `Language: ${targetLanguage}\n`;
    content += `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;

    if (analysis.financialLiabilityWarning) {
      content += `[OUT-OF-POCKET BILLING ALERT]\n${analysis.financialLiabilityWarning}\n\n`;
    }

    content += `[PATIENT SUMMARY]\n`;
    content += `${analysis.summary?.simplified || analysis.summary?.standard || 'N/A'}\n\n`;

    if (analysis.flaggedClauses?.length) {
      content += `[IDENTIFIED LEGAL RISKS & HAZARDS]\n`;
      analysis.flaggedClauses.forEach((c, i) => {
        content += `${i + 1}. ${c.clauseTitle} (${c.severity} Risk)\n`;
        if (c.originalQuote) content += `   Original: "${c.originalQuote}"\n`;
        content += `   Patient Impact: ${c.plainExplanation}\n\n`;
      });
    }

    if (analysis.medicationTimeline?.length) {
      content += `[MEDICATION REGIMEN]\n`;
      analysis.medicationTimeline.forEach((m) => {
        content += `- [${m.timeSlot}] ${m.medicationName}: ${m.instructions}\n`;
      });
      content += `\n`;
    }

    if (analysis.caregiverChecklist?.length) {
      content += `[DISCHARGE & CAREGIVER ACTION ITEMS]\n`;
      analysis.caregiverChecklist.forEach((item, i) => {
        const status = completedTasks[i] ? '[COMPLETED]' : '[PENDING]';
        content += `- ${status} ${item}\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SubText_Report_${analysis.documentType?.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const applyPreset = (presetText) => {
    clearFile();
    setInputText(presetText);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans print:bg-white print:text-black">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-20 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <BookOpen className="w-5 h-5"/>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              SubText <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-teal-950 border border-teal-800 text-teal-300">Health AI</span>
            </h1>
            <p className="text-xs text-slate-400">Medical consent auditor & patient care translator</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Languages className="w-3.5 h-3.5 text-teal-400"/>
            <select
              value={targetLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {analysis && (
            <>
              {/* Export Text File */}
              <button
                onClick={handleExportText}
                className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl transition"
                title="Download text summary"
              >
                <Download className="w-3.5 h-3.5 text-teal-400"/>
                Download
              </button>

              {/* Print View */}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-2 rounded-xl transition shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 text-teal-100"/>
                Print Care Card
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 print:p-0 print:block">
        
        {/* Left Column */}
        <section className="lg:col-span-5 flex flex-col gap-4 print:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col flex-1">
            
            {/* Quick Presets */}
            <div className="mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Demo Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {CLINICAL_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.text)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-teal-950 hover:text-teal-300 border border-slate-700/60 hover:border-teal-700 transition"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Audits History Tray */}
            {auditHistory.length > 0 && (
              <div className="mb-4 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <History className="w-3 h-3 text-teal-400" /> Recent Scans ({auditHistory.length})
                  </span>
                  <button 
                    onClick={clearHistory}
                    className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {auditHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => restoreAudit(item)}
                      className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/60 cursor-pointer flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.vulnerabilityScore > 70 ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {item.vulnerabilityScore}
                        </span>
                        <span className="text-xs text-slate-300 font-medium group-hover:text-teal-300 truncate">
                          {item.documentType}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({item.language})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Drag-and-Drop with Drag Hover Effect */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition mb-3 ${isDragging ? 'border-teal-400 bg-teal-950/40 scale-[1.01]' : 'border-slate-700 hover:border-teal-500 bg-slate-950/40'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/*,.pdf,.txt" 
                className="hidden" 
              />
              <UploadCloud className={`w-7 h-7 mx-auto mb-1.5 transition ${isDragging ? 'text-teal-300 animate-bounce' : 'text-teal-400'}`}/>
              <p className="text-xs font-semibold text-slate-300">
                {selectedFile ? selectedFile.name : (isDragging ? "Drop your file here now" : "Upload medical scan, photo, or PDF")}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Drag & drop PDF, PNG, or JPG up to 10MB</p>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between bg-teal-950/30 border border-teal-800/50 rounded-xl px-3 py-2 mb-3">
                <span className="text-xs text-teal-300 truncate max-w-[240px]">{selectedFile.name}</span>
                <button onClick={clearFile} className="text-[11px] text-rose-400 hover:underline">Remove</button>
              </div>
            )}

            {filePreview && (
              <div className="mb-3 rounded-xl overflow-hidden border border-slate-800 max-h-40 flex justify-center bg-black/40">
                <img src={filePreview} alt="Scan preview" className="object-contain max-h-40" />
              </div>
            )}

            {/* Document Raw Text */}
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-400"/> Document Text:
              </label>
              <button 
                onClick={() => applyPreset(CLINICAL_PRESETS[0].text)}
                className="text-[11px] text-teal-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3"/> Reset
              </button>
            </div>
            
            <textarea
              disabled={!!selectedFile}
              className={`w-full flex-1 min-h-[200px] p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono resize-none focus:outline-none focus:border-teal-500 leading-relaxed ${selectedFile ? 'opacity-40 cursor-not-allowed text-slate-500' : 'text-slate-300'}`}
              placeholder="Paste hospital consent, surgery agreement, or prescription notes here..."
              value={selectedFile ? "[File attached — click Audit Document to analyze]" : inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            {errorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={() => executeAudit(targetLanguage)}
              disabled={loading}
              className="mt-4 w-full py-3 bg-teal-600 hover:bg-teal-500 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-teal-950"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-teal-200"/>
                  Auditing Clauses & Translating to {targetLanguage}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-teal-200"/>
                  Audit Document
                  <ArrowRight className="w-4 h-4 ml-1"/>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Column: Dashboard & Skeletons */}
        <section className="lg:col-span-7 flex flex-col gap-5 print:w-full">
          {loading ? (
            <div className="flex flex-col gap-4">
              <div className="bg-teal-950/40 border border-teal-500/40 rounded-2xl p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping"></div>
                  <span className="text-xs font-semibold text-teal-300">
                    SubText AI Engine is auditing clauses & compiling {targetLanguage} patient summary...
                  </span>
                </div>
                <Sparkles className="w-4 h-4 text-teal-400 animate-spin" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative">
                  <div className="h-3 w-16 bg-slate-700/80 rounded animate-pulse"></div>
                  <div className="h-5 w-24 bg-teal-800/50 rounded animate-pulse"></div>
                </div>
                <div className="h-20 bg-slate-900 border border-slate-800 rounded-2xl p-4 col-span-2 flex flex-col justify-between overflow-hidden relative">
                  <div className="flex justify-between">
                    <div className="h-3 w-36 bg-slate-700/80 rounded animate-pulse"></div>
                    <div className="h-3 w-14 bg-rose-800/60 rounded animate-pulse"></div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-700/70 w-3/4 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-hidden relative">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3">
                  <div className="h-3.5 w-32 bg-slate-700/80 rounded animate-pulse"></div>
                  <div className="h-5 w-24 bg-slate-800 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2.5">
                  <div className="h-3.5 w-full bg-slate-700/60 rounded animate-pulse"></div>
                  <div className="h-3.5 w-11/12 bg-slate-700/60 rounded animate-pulse"></div>
                  <div className="h-3.5 w-4/5 bg-slate-700/60 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : !analysis ? (
            <div className="h-full border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-500 min-h-[400px]">
              <FileText className="w-12 h-12 text-slate-700 mb-3"/>
              <p className="text-sm font-medium text-slate-400">No document scanned yet</p>
              <p className="text-xs max-w-sm mt-1">Select a quick preset or upload a medical document to generate your risk analysis.</p>
            </div>
          ) : (
            <>
              {/* Document Type & Vulnerability Meter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:grid-cols-3">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between print:bg-white print:border-black">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 print:text-black">Document Type</span>
                  <span className="text-sm font-bold text-teal-300 mt-1 print:text-black">{analysis.documentType || 'Medical Record'}</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between sm:col-span-2 print:bg-white print:border-black">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 print:text-black">Patient Vulnerability Score</span>
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
                  <DollarSign className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"/>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider print:text-black">Out-Of-Pocket Billing Alert</h4>
                    <p className="text-xs text-slate-200 mt-1 print:text-black">{analysis.financialLiabilityWarning}</p>
                  </div>
                </div>
              )}

              {/* Summary Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm print:bg-white print:border-black">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 print:border-black">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-black">
                    Summary ({targetLanguage})
                  </span>
                  <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex print:hidden">
                    <button
                      onClick={() => setViewLevel('simplified')}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${viewLevel === 'simplified' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}
                    >
                      {targetLanguage === 'English' ? 'Plain English' : targetLanguage}
                    </button>
                    <button
                      onClick={() => setViewLevel('standard')}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${viewLevel === 'standard' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}
                    >
                      Original Medical Tone
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed print:text-black">
                  {viewLevel === 'simplified' 
                    ? (analysis.summary?.simplified || analysis.summary) 
                    : (analysis.summary?.standard || analysis.summary)}
                </p>
              </div>

              {/* Flagged Legal Traps */}
              {Array.isArray(analysis.flaggedClauses) && analysis.flaggedClauses.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 print:bg-white print:border-black">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-5 h-5 text-rose-400"/>
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

                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between print:hidden">
                          <button
                            onClick={() => handleGetClauseAdvice(clause)}
                            className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold hover:underline"
                          >
                            <MessageSquare className="w-3.5 h-3.5"/>
                            What should I say to the hospital about this?
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medication Schedule */}
              {Array.isArray(analysis.medicationTimeline) && analysis.medicationTimeline.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 print:bg-white print:border-black">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-teal-400"/>
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
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug print:text-black">{med.instructions}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Caregiver Checklist with Task Toggles */}
              {Array.isArray(analysis.caregiverChecklist) && analysis.caregiverChecklist.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 print:bg-white print:border-black">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-teal-400"/>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider print:text-black">
                        Discharge & Caregiver Action Items
                      </h3>
                    </div>
                    <span className="text-[11px] text-teal-400 font-semibold print:hidden">
                      {Object.values(completedTasks).filter(Boolean).length} / {analysis.caregiverChecklist.length} Done
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {analysis.caregiverChecklist.map((item, idx) => {
                      const isDone = !!completedTasks[idx];
                      return (
                        <li 
                          key={idx} 
                          onClick={() => toggleTask(idx)}
                          className={`flex items-start gap-2.5 p-2 rounded-xl transition cursor-pointer select-none border ${isDone ? 'bg-teal-950/20 border-teal-800/40 text-slate-400' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-200'} print:text-black print:border-none print:p-0`}
                        >
                          <button className="mt-0.5 shrink-0 print:hidden">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-teal-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-500 hover:text-slate-400" />
                            )}
                          </button>
                          <span className={`text-xs leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-200'} print:text-black print:no-underline`}>
                            {item}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Action Script Modal */}
      {activeClauseAction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveClauseAction(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5"/>
            </button>

            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-rose-400"/>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Patient Advocate Talking Strategy
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Regarding Clause: <span className="text-slate-200 font-semibold">{activeClauseAction.clauseTitle}</span>
            </p>

            {actionLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-teal-400 gap-2">
                <Sparkles className="w-6 h-6 animate-spin"/>
                <span className="text-xs text-slate-400">Formulating patient defense script in {targetLanguage}...</span>
              </div>
            ) : actionData ? (
              <div className="space-y-3.5">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                      What You Can Say (Read to Staff):
                    </span>
                    <button 
                      onClick={() => handleCopyScript(actionData.talkingScript)}
                      className="text-[11px] text-slate-400 hover:text-teal-300 flex items-center gap-1 transition"
                    >
                      {copiedScript ? (
                        <>
                          <Check className="w-3 h-3 text-teal-400" />
                          <span className="text-teal-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-100 font-medium italic pr-6">
                    "{actionData.talkingScript}"
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                    Recommended Modification:
                  </span>
                  <p className="text-xs text-slate-200">
                    {actionData.alternativeRequest}
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Your Rights:
                  </span>
                  <p className="text-xs text-slate-300">
                    {actionData.patientRight}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-400">Failed to load advice. Please try again.</p>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setActiveClauseAction(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}