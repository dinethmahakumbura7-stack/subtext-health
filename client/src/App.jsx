import React, { useState } from 'react';

const BACKEND_URL = 'https://subtext-health.onrender.com';

// Multilingual UI Dictionary
const TRANSLATIONS = {
  'English (US)': {
    tagline: 'Privacy-first document analysis • Plain-language translations',
    heroTitle: 'Understand before you sign.',
    heroSubtitle: 'You are safe. We will help you understand every surgical waiver, emergency notice, or discharge prescription in plain speech before you commit.',
    advocateReady: 'Advocate Guidance Ready',
    cardHeader: 'ANALYZE A HEALTHCARE DOCUMENT',
    step: 'Step 1 of 2',
    tabUpload: 'Upload PDF / Scan',
    tabPaste: 'Paste Text',
    tabSample: 'Try Sample',
    documentExcerpt: 'DOCUMENT EXCERPT:',
    clear: 'Clear',
    recentTitle: 'RECENT CONSULTATIONS',
    btnAudit: 'Run Patient Advocacy Audit',
    btnAuditing: 'Analyzing Document with Advocate AI...',
    emptyTitle: 'Your Healthcare Advocate is Ready',
    emptyDesc: 'Upload your document or pick a sample on the left. We will review legal arbitration, financial bills, and medication schedules before you sign.',
    freeDisputeBanner: '100% Free Public Advocate Tool',
    disputeTitle: 'Generate Formal Dispute Notice',
    disputeDesc: 'Produces a ready-to-mail legal dispute notice invoking the federal No Surprises Act to freeze collections and demand debt validation.',
    btnGenerateLetter: 'Generate Dispute Packet (Free)',
    btnDraftingLetter: 'Drafting Dispute Letter...',
    modalTitle: 'Formal Medical Debt Validation & Statutory Dispute Notice',
    printBtn: 'Print / Save PDF',
    copyBtn: 'Copy Full Letter',
    copiedBtn: '✓ Copied to Clipboard!',
    sample1Name: 'Surgical Consent & Financial Waiver',
    sample2Name: 'Emergency Room Billing Statement',
    sample3Name: 'Discharge Summary & Prescription'
  },
  'සිංහල': {
    tagline: 'පෞද්ගලිකත්වය සුරකින ලේඛන විශ්ලේෂණය • සරල භාෂා පරිවර්තන',
    heroTitle: 'අත්සන් කිරීමට පෙර තේරුම් ගන්න.',
    heroSubtitle: 'ඔබ සුරක්ෂිතයි. ඔබ කැපවීමට පෙර සෑම ශල්‍ය වෛද්‍ය අත්හැරීමක්, හදිසි දැනුම්දීමක් හෝ බෙහෙත් වට්ටෝරුවක්ම සරල භාෂාවෙන් තේරුම් ගැනීමට අපි ඔබට උදවු කරන්නෙමු.',
    advocateReady: 'උපදේශක මණ්ඩලය සූදානම්',
    cardHeader: 'සෞඛ්‍ය ලේඛනයක් විශ්ලේෂණය කරන්න',
    step: 'පියවර 1 / 2',
    tabUpload: 'PDF / Scan උඩුගත කරන්න',
    tabPaste: 'පෙළ අලවන්න',
    tabSample: 'ආදර්ශ බලන්න',
    documentExcerpt: 'ලේඛන සාරාංශය:',
    clear: 'මකන්න',
    recentTitle: 'මෑත උපදේශන',
    btnAudit: 'රෝගී උපදේශන පරීක්ෂාව අරඹන්න',
    btnAuditing: 'විශ්ලේෂණය වෙමින් පවතී...',
    emptyTitle: 'ඔබගේ සෞඛ්‍ය උපදේශක සූදානම්',
    emptyDesc: 'ඔබගේ ලේඛනය උඩුගත කරන්න හෝ වම්පසින් ආදර්ශයක් තෝරන්න. ඔබ අත්සන් කිරීමට පෙර බේරුම්කරණය, ගාස්තු සහ බෙහෙත් විස්තර අපි පරීක්ෂා කරන්නෙමු.',
    freeDisputeBanner: '100% නොමිලේ මහජන සේවාව',
    disputeTitle: 'නිල විරෝධතා ලිපිය සකසන්න',
    disputeDesc: 'අයථා බිල්පත් අත්හිටුවීමට සහ No Surprises Act යටතේ නීත්‍යානුකූල ලිපියක් ක්ෂණිකව සකසයි.',
    btnGenerateLetter: 'විරෝධතා ලිපිය ලබාගන්න (නොමිලේ)',
    btnDraftingLetter: 'ලිපිය සකසමින් පවතී...',
    modalTitle: 'වෛද්‍ය ණය නිරවුල් කිරීමේ නිල නීතිමය නිවේදනය',
    printBtn: 'මුද්‍රණය / PDF',
    copyBtn: 'පිටපත් කරගන්න',
    copiedBtn: '✓ පිටපත් කරගන්නා ලදී!',
    sample1Name: 'ශල්‍යකර්ම කැමැත්ත සහ මූල්‍ය ගිවිසුම',
    sample2Name: 'හදිසි ප්‍රතිකාර බිල්පත් වාර්තාව',
    sample3Name: 'රෝහලෙන් පිටවීමේ උපදෙස් සහ ඖෂධ'
  },
  'தமிழ்': {
    tagline: 'தனியுரிமை ஆவண பகுப்பாய்வு • எளிய மொழிபெயர்ப்புகள்',
    heroTitle: 'கையெழுத்திடுவதற்கு முன் புரிந்து கொள்ளுங்கள்.',
    heroSubtitle: 'நீங்கள் பாதுகாப்பாக உள்ளீர்கள். அறுவை சிகிச்சை ஒப்புதல், அவசர அறிவிப்பு அல்லது மருந்துச்சீட்டுகளை எளிய மொழியில் புரிந்து கொள்ள நாங்கள் உங்களுக்கு உதவுகிறோம்.',
    advocateReady: 'வழிகாட்டுதல் குழு தயார்',
    cardHeader: 'சுகாதார ஆவணத்தை பகுப்பாய்வு செய்யுங்கள்',
    step: 'படி 1 / 2',
    tabUpload: 'PDF / Scan பதிவேற்றவும்',
    tabPaste: 'உரையை ஒட்டுக',
    tabSample: 'மாதிரியைப் பார்க்கவும்',
    documentExcerpt: 'ஆவண பகுதி:',
    clear: 'அழி',
    recentTitle: 'சமீபத்திய ஆலோசனைகள்',
    btnAudit: 'ஆவண தணிக்கையைத் தொடங்கு',
    btnAuditing: 'பகுப்பாய்வு செய்யப்படுகிறது...',
    emptyTitle: 'உங்கள் சுகாதார ஆலோசகர் தயார்',
    emptyDesc: 'உங்கள் ஆவணத்தைப் பதிவேற்றவும் அல்லது மாதிரியைத் தேர்ந்தெடுக்கவும். கையொப்பமிடுவதற்கு முன் கட்டணங்கள் மற்றும் விதிகளை நாங்கள் மதிப்பாய்வு செய்வோம்.',
    freeDisputeBanner: '100% இலவச பொது சேவை',
    disputeTitle: 'அதிகாரப்பூர்வ மறுப்பு கடிதம் உருவாக்கவும்',
    disputeDesc: 'சட்டவிரோத பில்களை எதிர்க்கவும் சட்டரீதியான மறுப்பு கடிதத்தை உடனடியாக உருவாக்கவும்.',
    btnGenerateLetter: 'மறுப்பு கடிதம் பெறவும் (இலவசம்)',
    btnDraftingLetter: 'கடிதம் தயாராகிறது...',
    modalTitle: 'மருத்துவ கடன் சரிபார்ப்பு மற்றும் சட்டப்பூர்வ மறுப்பு அறிவிப்பு',
    printBtn: 'அச்சிடு / PDF',
    copyBtn: 'முழு கடிதத்தையும் நகலெடு',
    copiedBtn: '✓ நகலெடுக்கப்பட்டது!',
    sample1Name: 'அறுவை சிகிச்சை ஒப்புதல் மற்றும் நிதி ஒப்பந்தம்',
    sample2Name: 'அவசர சிகிச்சை கட்டண அறிக்கை',
    sample3Name: 'வெளியேற்ற வழிமுறைகள் மற்றும் மருந்துகள்'
  },
  'Español': {
    tagline: 'Análisis de documentos con privacidad • Traducciones claras',
    heroTitle: 'Entienda antes de firmar.',
    heroSubtitle: 'Está seguro. Le ayudaremos a comprender cada renuncia quirúrgica, aviso de emergencia o receta médica en lenguaje sencillo antes de comprometerse.',
    advocateReady: 'Equipo Asesor Listo',
    cardHeader: 'ANALIZAR UN DOCUMENTO MÉDICO',
    step: 'Paso 1 de 2',
    tabUpload: 'Subir PDF / Escaneo',
    tabPaste: 'Pegar Texto',
    tabSample: 'Probar Muestra',
    documentExcerpt: 'EXTRACTO DEL DOCUMENTO:',
    clear: 'Borrar',
    recentTitle: 'CONSULTAS RECIENTES',
    btnAudit: 'Ejecutar Auditoría del Paciente',
    btnAuditing: 'Analizando con IA Médica...',
    emptyTitle: 'Su Defensor de Salud está Listo',
    emptyDesc: 'Suba su documento o elija una muestra a la izquierda. Revisaremos arbitrajes legales, facturas y recetas antes de que firme.',
    freeDisputeBanner: 'Herramienta Pública 100% Gratuita',
    disputeTitle: 'Generar Notificación Formal de Disputa',
    disputeDesc: 'Genera una carta formal citando la Ley Sin Sorpresas para congelar cobranzas y exigir validación de deuda.',
    btnGenerateLetter: 'Generar Paquete de Disputa (Gratis)',
    btnDraftingLetter: 'Redactando Carta...',
    modalTitle: 'Aviso Formal de Validación de Deuda Médica y Disputa Legal',
    printBtn: 'Imprimir / Guardar PDF',
    copyBtn: 'Copiar Carta Completa',
    copiedBtn: '✓ ¡Copiado al Portapapeles!',
    sample1Name: 'Consentimiento Quirúrgico y Renuncia Financiera',
    sample2Name: 'Estado de Cuenta de Sala de Emergencias',
    sample3Name: 'Instrucciones de Alta y Medicamentos'
  }
};

// Built-in Practice Samples matching your exact project workflow
const SAMPLES = [
  {
    id: 1,
    title: 'Surgical Consent & Financial Waiver',
    lang: 'English',
    time: '23:30',
    riskScore: 85,
    text: `HOSPITAL SURGICAL CONSENT & FINANCIAL WAIVER:
The patient agrees that Dr. Smith and Associates may perform elective laparoscopic surgery.
SECTION 4.2 - BINDING ARBITRATION: The signatory forfeits any right to trial by jury and submits all malpractice claims exclusively to private arbitration at the patient's shared expense.
SECTION 8 - OUT-OF-NETWORK COVERAGE: Patient authorizes care by supplemental surgical assistants or on-call anesthesiologists, and acknowledges responsibility for all out-of-network balance billings not covered by primary insurance.`
  },
  {
    id: 2,
    title: 'Emergency Room Discharge Summary',
    lang: 'English',
    time: '00:31',
    riskScore: 85,
    text: `EMERGENCY ROOM CHARGES & DISCHARGE SUMMARY:
Date of Service: 09/14/2026
Charges:
- REVENUE CODE 0450 EMERGENCY ROOM GENERAL: $4,850.00
- CPT 99285 EMERGENCY DEPT VISIT HIGH COMPLEXITY: $2,420.00
- CPT 70450 CT HEAD/BRAIN WITHOUT CONTRAST: $3,600.00
- DR. J. MILLER (ANESTHESIOLOGY / NON-CONTRACTED): $1,850.00
Notice: Patient presented with moderate laceration and headache; stable vital signs.`
  },
  {
    id: 3,
    title: 'Surgical Consent',
    lang: 'English',
    time: '22:57',
    riskScore: 85,
    text: `OUTPATIENT CLINIC DISCHARGE & PRESCRIPTION INSTRUCTIONS:
Take Amoxicillin-Pot Clavulanate 875-125 MG twice daily for 10 days with meals.
Notice of Financial Agreement: Failure to remit remaining co-insurance balance within 30 days results in mandatory 18% annual interest and external collection escalation.`
  }
];

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState('English (US)');
  const [activeTab, setActiveTab] = useState('paste'); // 'upload' | 'paste' | 'sample'
  const [documentExcerpt, setDocumentExcerpt] = useState(SAMPLES[0].text);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Dispute Letter Generator State (100% Free)
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [copied, setCopied] = useState(false);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS['English (US)'];

  // Handle sample selection
  const handleSelectSample = (sample) => {
    setDocumentExcerpt(sample.text);
    setErrorMessage('');
    setActiveTab('paste');
  };

  // Run the audit calling /api/analyze
  const handleRunAudit = async () => {
    if (!documentExcerpt.trim()) return;
    setIsAuditing(true);
    setErrorMessage('');
    setAuditResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: documentExcerpt,
          language: currentLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const parsed = data.audit || data;
      setAuditResult(parsed);
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not complete audit. Please ensure the backend is active at https://subtext-health.onrender.com");
    } finally {
      setIsAuditing(false);
    }
  };

  // Generate legal dispute packet (Free)
  const handleGenerateLetter = async () => {
    setIsGeneratingLetter(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: documentExcerpt,
          auditFindings: auditResult?.findings || auditResult?.violations || [],
          patientName: 'Patient / Consumer',
          facilityName: 'Hospital Billing Compliance Department'
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
      alert('Network error connecting to dispute generator.');
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(letterContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-800 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0F9D8A] flex items-center justify-center text-white shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">SubText Health</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full uppercase tracking-wider">
                  PATIENT COMPANION
                </span>
              </div>
              <p className="text-xs text-slate-500">Understand your healthcare paperwork before you sign</p>
            </div>
          </div>

          {/* Right Controls: Private session & Language Selector */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Private session</span>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-slate-400 text-xs">文A</span>
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                className="pl-8 pr-8 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                <option value="English (US)">English (US)</option>
                <option value="සිංහල">සිංහල</option>
                <option value="தமிழ்">தமிழ்</option>
                <option value="Español">Español</option>
              </select>
            </div>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Hero Section & Team Credentials Badge */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-semibold text-emerald-800">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{t.tagline}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t.heroTitle}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Advocate Guidance Ready Badge */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3 self-stretch sm:self-auto">
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-white">
                MD
              </div>
              <div className="h-8 w-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-white">
                RN
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-white">
                JD
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-slate-800">{t.advocateReady}</span>
              </div>
              <p className="text-[11px] text-slate-500">English • සිංහල • தமிழ் • Español</p>
            </div>
          </div>
        </div>

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Form, Tabs & Recent Consultations */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.cardHeader}
              </span>
              <span className="text-xs text-slate-400 font-medium">{t.step}</span>
            </div>

            {/* Input Mode Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{t.tabUpload}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'paste' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{t.tabPaste}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sample')}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'sample' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{t.tabSample}</span>
              </button>
            </div>

            {/* Try Sample Dropdown / Quick Select View */}
            {activeTab === 'sample' && (
              <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Select a Practice Healthcare Scenario:</span>
                <div className="space-y-1.5">
                  {SAMPLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSample(s)}
                      className="w-full text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 text-xs text-slate-700 font-medium transition-colors flex items-center justify-between"
                    >
                      <span>{s.title}</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono">Select</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 tracking-wider">
                  {t.documentExcerpt}
                </label>
                <button
                  type="button"
                  onClick={() => setDocumentExcerpt('')}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {t.clear}
                </button>
              </div>

              <textarea
                value={documentExcerpt}
                onChange={(e) => setDocumentExcerpt(e.target.value)}
                placeholder="Paste surgical waivers, hospital bills, or emergency discharge text here..."
                rows={9}
                className="w-full bg-[#FCFDFD] border border-slate-200 rounded-xl p-3.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Recent Consultations List (from screenshot) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">{t.recentTitle} ({SAMPLES.length})</span>
                </div>
                <button className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <span>🗑</span>
                  <span>{t.clear}</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {SAMPLES.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSample(item)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-150 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        {item.riskScore}
                      </span>
                      <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400">({item.lang})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <span className="text-rose-500 font-bold">⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={handleRunAudit}
              disabled={isAuditing || !documentExcerpt.trim()}
              className="w-full py-3.5 bg-[#0F9D8A] hover:bg-[#0c8272] disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isAuditing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>{t.btnAuditing}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>{t.btnAudit} →</span>
                </>
              )}
            </button>

          </div>

          {/* Right Column: Empty State Placeholder OR Active Audit Findings */}
          <div className="lg:col-span-7">
            
            {!auditResult ? (
              // Exact Empty Advocate State
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 min-h-[500px] flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0F9D8A]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-lg font-bold text-slate-800">
                    {t.emptyTitle}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t.emptyDesc}
                  </p>
                </div>
              </div>
            ) : (
              // Active Findings & Free Dispute Builder
              <div className="space-y-6">
                
                {/* Findings Header Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                        Advocate Committee Review
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-1">
                        Document Evaluation & Risk Assessment
                      </h2>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                      {auditResult.riskLevel || 'High'} Risk ({auditResult.riskScore || 85}/100)
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {auditResult.summary}
                  </p>

                  {auditResult.potentialSavings && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                      💰 Estimated Financial Exposure / Potential Savings: {auditResult.potentialSavings}
                    </div>
                  )}
                </div>

                {/* Individual Flags & Plain-Speech Translations */}
                <div className="space-y-3">
                  {(auditResult.findings || auditResult.violations || []).map((f, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 text-sm">{f.title}</span>
                        {f.statute && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {f.statute}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{f.explanation}</p>
                      {f.action && (
                        <p className="text-xs font-semibold text-emerald-700 pt-1">
                          👉 Recommendation: {f.action}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Completely Free Dispute Generation Action Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 border border-slate-800 rounded-2xl p-6 shadow-md text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                        {t.freeDisputeBanner}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{t.disputeTitle}</h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-md">
                      {t.disputeDesc}
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateLetter}
                    disabled={isGeneratingLetter}
                    className="w-full sm:w-auto min-w-[220px] px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isGeneratingLetter ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>{t.btnDraftingLetter}</span>
                      </>
                    ) : (
                      <span>{t.btnGenerateLetter}</span>
                    )}
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

      </main>

      {/* Free Dispute Packet In-App Viewer Modal */}
      {isLetterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-left space-y-5">
            
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Open Patient Advocacy Tool
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1.5">
                  {t.modalTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsLetterModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-h-[50vh] overflow-y-auto font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-text">
              {letterContent}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-400">
                Statutory Citations: 42 U.S.C. § 300gg-111 & 15 U.S.C. § 1692g
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
                >
                  {t.printBtn}
                </button>
                <button
                  onClick={handleCopyLetter}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {copied ? t.copiedBtn : t.copyBtn}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>SubText Health • Privacy-First Patient Advocacy • Open-Source Hackathon Edition</p>
      </footer>

    </div>
  );
}