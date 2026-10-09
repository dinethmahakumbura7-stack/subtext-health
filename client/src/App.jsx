import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Printer, 
  Download, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  DollarSign, 
  CheckSquare, 
  Languages, 
  History, 
  Trash2, 
  Copy, 
  Check, 
  HelpCircle, 
  ShieldCheck, 
  HeartPulse, 
  FileCheck, 
  Scale, 
  Users, 
  Info, 
  Lock, 
  AlertTriangle, 
  UserCheck, 
  Pill, 
  X 
} from 'lucide-react';

const API_BASE_URL = 'https://subtext-health.onrender.com';

const UI_STRINGS = {
  English: {
    tagline: 'Understand your healthcare paperwork before you sign',
    badge: 'Privacy-first document analysis • Plain-language translations',
    heroTitle: 'Understand before you sign.',
    heroDesc: 'You are safe. We will help you understand every surgical waiver, emergency notice, or discharge prescription in plain speech before you commit.',
    advocateReady: 'Advocate Guidance Ready',
    privateSession: 'Private session',
    saveReport: 'Save Report',
    printCareCard: 'Print Care Card',
    analyzeHeader: 'Analyze a healthcare document',
    step1: 'Step 1 of 2',
    tabUpload: 'Upload PDF / Scan',
    tabText: 'Paste Text',
    tabPresets: 'Try Sample',
    dragDrop: 'Drag & drop your document here',
    dropNow: 'Drop your medical file now',
    formats: 'PDF • JPG • PNG • up to 20 MB',
    remove: 'Remove',
    docExcerpt: 'Document Excerpt:',
    clear: 'Clear',
    recentConsultations: 'Recent Consultations',
    btnAudit: 'Run Patient Advocacy Audit',
    btnAuditing: 'Auditing Document in',
    docRef: 'Original Document Reference',
    clickToHighlight: 'Click any hazard above to highlight',
    analyzingTitle: 'Analyzing your document...',
    analyzingDesc: 'Preparing plain-language translations and safety checks in',
    stepDocType: 'Identifying document category & procedure type',
    stepClauses: 'Extracting clauses, covenants & out-of-network liabilities',
    stepScript: 'Generating patient talking script & plain-language summary...',
    advocateEmptyTitle: 'Your Healthcare Advocate is Ready',
    advocateEmptyDesc: 'Upload your document or pick a sample on the left. We will review legal arbitration, financial bills, and medication schedules before you sign.',
    riskOverview: 'Patient Risk Overview',
    docCategory: 'Document Category',
    verified: 'Verified from document',
    viewMode: 'View Mode',
    switchToCaregiver: 'Switch to Caregiver View',
    caregiverActive: 'Caregiver View (Active)',
    caregiverDashboard: 'Caregiver Action Dashboard',
    returnPatient: 'Return to Patient View',
    caregiverDesc: 'Displaying caregiver priorities: medication administration, urgent red flags, and questions to ask on behalf of the patient.',
    dailyMedSchedule: 'Daily Medication Schedule to Administer',
    erRedFlags: 'Critical Red Flags: When to Call the ER Immediately',
    caregiverChecklist: 'Caregiver Verification Checklist',
    outOfPocketNotice: 'Out-Of-Pocket Billing Notice',
    whatShouldISay: 'What Should I Say to the Hospital?',
    readToStaff: 'Read this directly to staff',
    copyScript: 'Copy Script',
    copied: 'Copied to clipboard',
    translateScript: 'Translate script:',
    docIn30s: 'Your Document in 30 Seconds',
    procedure: 'Procedure',
    legalTerms: 'Legal Terms',
    insurance: 'Insurance',
    financial: 'Financial',
    itemsAttention: 'Items Deserving Your Attention',
    clickCardHighlight: 'Click card to highlight original text',
    source: 'Source',
    whatItMeans: 'What it means:',
    askStaff: 'Ask staff:',
    getDefenseScript: 'Get Full Defense Script →',
    patientSummary: 'Patient Summary',
    plainText: 'Plain Language',
    clinicalTone: 'Clinical Tone',
    beforeSign: 'Before You Sign Checklist',
    confirmed: 'confirmed',
    keyTerms: 'Key Terms Translated to Plain Language',
    clickInspect: 'Click to inspect',
    decoded: 'Decoded',
    dailyMeds: 'Daily Medication Schedule',
    urgentCareTitle: 'When to Seek Urgent Emergency Care',
    erNote: "Always follow the treating clinician's direct emergency discharge instructions.",
    footerNotice: 'SubText provides educational information and document analysis. It does not replace advice from a qualified healthcare professional, attorney, pharmacist, or insurer.',
    footerPrivate: 'Private In-Session Storage',
    footerMulti: 'Multi-Language Verification',
    negotiationBrief: 'Patient Negotiation Brief',
    addressing: 'Addressing:',
    readStaffModal: 'Read This to the Hospital Staff:',
    recMod: 'Recommended Modification:',
    yourRights: 'Your Rights:',
    close: 'Close',
    understood: 'Understood',
    howCalculated: 'How this score is calculated',
    privacyCommit: 'Session Privacy Commitment'
  },
  Spanish: {
    tagline: 'Comprenda su papeleo medico antes de firmar',
    badge: 'Analisis confidencial • Traduccion en lenguaje claro',
    heroTitle: 'Comprenda antes de firmar.',
    heroDesc: 'Esta en un lugar seguro. Le ayudaremos a entender cada consentimiento quirurgico, aviso de emergencia o receta medica en lenguaje sencillo.',
    advocateReady: 'Guia de Asistencia Lista',
    privateSession: 'Sesion privada',
    saveReport: 'Guardar informe',
    printCareCard: 'Imprimir tarjeta de atencion',
    analyzeHeader: 'Analizar documento medico',
    step1: 'Paso 1 de 2',
    tabUpload: 'Subir PDF / Imagen',
    tabText: 'Pegar texto',
    tabPresets: 'Ver ejemplos',
    dragDrop: 'Arrastre y suelte su documento aqui',
    dropNow: 'Suelte su archivo medico aqui',
    formats: 'PDF • JPG • PNG • hasta 20 MB',
    remove: 'Eliminar',
    docExcerpt: 'Extracto del documento:',
    clear: 'Borrar',
    recentConsultations: 'Consultas recientes',
    btnAudit: 'Iniciar auditoria medica',
    btnAuditing: 'Auditando documento en',
    docRef: 'Referencia del documento original',
    clickToHighlight: 'Haga clic en un riesgo para resaltarlo',
    analyzingTitle: 'Analizando su documento...',
    analyzingDesc: 'Generando explicaciones sencillas y revisiones de seguridad en',
    stepDocType: 'Identificando tipo de documento y procedimiento',
    stepClauses: 'Extrayendo clausulas, arbitrajes y costos fuera de red',
    stepScript: 'Creando guion para el hospital y resumen accesible...',
    advocateEmptyTitle: 'Su asistente medico esta listo',
    advocateEmptyDesc: 'Suba un documento o seleccione un ejemplo. Revisaremos clausulas legales, cobros y medicamentos antes de que firme.',
    riskOverview: 'Evaluacion de Riesgo',
    docCategory: 'Categoria del Documento',
    verified: 'Verificado del documento',
    viewMode: 'Modo de Vista',
    switchToCaregiver: 'Cambiar a Vista de Cuidador',
    caregiverActive: 'Vista de Cuidador (Activa)',
    caregiverDashboard: 'Panel de Accion para Cuidadores',
    returnPatient: 'Volver a Vista de Paciente',
    caregiverDesc: 'Prioridades del cuidador: administracion de medicamentos, signos de alerta y preguntas al personal.',
    dailyMedSchedule: 'Horario diario de medicamentos para administrar',
    erRedFlags: 'Signos de alarma: cuando acudir a urgencias de inmediato',
    caregiverChecklist: 'Lista de verificacion para el cuidador',
    outOfPocketNotice: 'Aviso de Gastos de Bolsillo',
    whatShouldISay: '¿Que debo decirle al hospital?',
    readToStaff: 'Lea esto directamente al personal',
    copyScript: 'Copiar Guion',
    copied: 'Copiado al portapapeles',
    translateScript: 'Traducir guion:',
    docIn30s: 'Su Documento en 30 Segundos',
    procedure: 'Procedimiento',
    legalTerms: 'Terminos Legales',
    insurance: 'Seguro Medico',
    financial: 'Costos Financieros',
    itemsAttention: 'Puntos que requieren su atencion',
    clickCardHighlight: 'Haga clic para resaltar en el texto original',
    source: 'Seccion',
    whatItMeans: 'Que significa:',
    askStaff: 'Pregunte al personal:',
    getDefenseScript: 'Ver Guion de Negociacion →',
    patientSummary: 'Resumen para el Paciente',
    plainText: 'Lenguaje Claro',
    clinicalTone: 'Tono Clinico',
    beforeSign: 'Lista de Verificacion Antes de Firmar',
    confirmed: 'confirmados',
    keyTerms: 'Terminos Clave Explicados',
    clickInspect: 'Haga clic para ver detalles',
    decoded: 'Explicado',
    dailyMeds: 'Horario de Medicamentos',
    urgentCareTitle: 'Cuando Buscar Atencion de Urgencias',
    erNote: 'Siga siempre las indicaciones directas de alta dadas por su medico tratante.',
    footerNotice: 'SubText ofrece informacion educativa y analisis documental. No sustituye la consulta medica ni legal profesional.',
    footerPrivate: 'Almacenamiento privado en sesion',
    footerMulti: 'Verificacion multilingue',
    negotiationBrief: 'Guion de Negociacion para el Paciente',
    addressing: 'Tema:',
    readStaffModal: 'Lea esto al personal del hospital:',
    recMod: 'Modificacion recomendada:',
    yourRights: 'Sus derechos:',
    close: 'Cerrar',
    understood: 'Entendido',
    howCalculated: 'Como se calcula esta puntuacion',
    privacyCommit: 'Compromiso de privacidad de la sesion'
  },
  Sinhala: {
    tagline: 'අත්සන් කිරීමට පෙර ඔබේ වෛද්‍ය ලියකියවිලි තේරුම් ගන්න',
    badge: 'පුද්ගලිකත්වය සුරකින විශ්ලේෂණය • සරල භාෂා පරිවර්තනය',
    heroTitle: 'අත්සන් කිරීමට පෙර තේරුම් ගන්න.',
    heroDesc: 'ඔබ සුරක්ෂිතයි. සැත්කම් අවසර පත්‍ර, හදිසි ප්‍රතිකාර දැන්වීම් හෝ බෙහෙත් වට්ටෝරු අත්සන් කිරීමට පෙර සරල සිංහලෙන් තේරුම් ගැනීමට අපි උදවු කරමු.',
    advocateReady: 'රෝගී සහයක සූදානම්',
    privateSession: 'පුද්ගලික සැසිය',
    saveReport: 'වාර්තාව බාගන්න',
    printCareCard: 'කාඩ්පත මුද්‍රණය කරන්න',
    analyzeHeader: 'වෛද්‍ය ලේඛනයක් පරීක්ෂා කරන්න',
    step1: 'පියවර 1 / 2',
    tabUpload: 'PDF / ඡායාරූපය යොමු කරන්න',
    tabText: 'වගන්ති ඇතුළත් කරන්න',
    tabPresets: 'උදාහරණ බලන්න',
    dragDrop: 'ලේඛනය මෙතැනට ඇදගෙන එන්න',
    dropNow: 'ලේඛනය මෙතැනින් තබන්න',
    formats: 'PDF • JPG • PNG • 20 MB දක්වා',
    remove: 'ඉවත් කරන්න',
    docExcerpt: 'ලේඛනයේ කොටස:',
    clear: 'මකන්න',
    recentConsultations: 'මෑත පරීක්ෂා කිරීම්',
    btnAudit: 'වෛද්‍ය පරීක්ෂාව අරඹන්න',
    btnAuditing: 'පරීක්ෂා කරමින් පවතී',
    docRef: 'මුල් ලේඛනයේ කොටස',
    clickToHighlight: 'මුල් ලේඛනයෙන් බලාගැනීමට අවදානම ක්ලික් කරන්න',
    analyzingTitle: 'ලේඛනය පරීක්ෂා කෙරේ...',
    analyzingDesc: 'සරල භාෂාවෙන් තොරතුරු පිළියෙළ කරමින් පවතී',
    stepDocType: 'ලේඛන වර්ගය හඳුනාගැනීම',
    stepClauses: 'නීතිමය වගන්ති සහ සැඟවුණු ගාස්තු වෙන්කර ගැනීම',
    stepScript: 'රෝහල් කාර්ය මණ්ඩලයෙන් ඇසිය යුතු ප්‍රශ්න සැකසීම...',
    advocateEmptyTitle: 'ඔබේ සහයකයා සූදානම්',
    advocateEmptyDesc: 'වම්පසින් ලේඛනයක් ඇතුළත් කරන්න. අත්සන් කිරීමට පෙර නීතිමය කොන්දේසි සහ බෙහෙත් විස්තර අපි පෙන්වා දෙන්නෙමු.',
    riskOverview: 'අවදානම් තත්ත්වය',
    docCategory: 'ලේඛන වර්ගය',
    verified: 'ලේඛනයෙන් තහවුරු කරන ලදී',
    viewMode: 'දසුන තෝරන්න',
    switchToCaregiver: 'භාරකරුගේ දසුනට මාරු වන්න',
    caregiverActive: 'භාරකරුගේ දසුන (ක්‍රියාත්මකයි)',
    caregiverDashboard: 'භාරකරුවන් සඳහා වූ පුවරුව',
    returnPatient: 'රෝගී දසුනට ආපසු යන්න',
    caregiverDesc: 'බෙහෙත් නියමිත වේලාවට දීම, හදිසි අනතුරු ඇඟවීම් සහ විමසිය යුතු ප්‍රශ්න.',
    dailyMedSchedule: 'දිනපතා ලබා දිය යුතු ඖෂධ කාලසටහන',
    erRedFlags: 'හදිසි අනතුරු ඇඟවීම්: වහාම රෝහලට යා යුතු අවස්ථා',
    caregiverChecklist: 'භාරකරුගේ පිරික්සුම් ලැයිස්තුව',
    outOfPocketNotice: 'අමතර ගෙවීම් පිළිබඳ දැන්වීම',
    whatShouldISay: 'රෝහලෙන් මා ඇසිය යුත්තේ කුමක්ද?',
    readToStaff: 'මෙය කාර්ය මණ්ඩලයට සෘජුවම පවසන්න',
    copyScript: 'පිටපත් කරන්න',
    copied: 'පිටපත් කරගන්නා ලදී',
    translateScript: 'භාෂාව මාරු කරන්න:',
    docIn30s: 'තත්පර 30 සාරාංශය',
    procedure: 'ප්‍රතිකාරය',
    legalTerms: 'නීතිමය කොන්දේසි',
    insurance: 'රක්ෂණ ආවරණය',
    financial: 'මූල්‍ය වියදම්',
    itemsAttention: 'විශේෂ අවධානය යොමු කළ යුතු කරුණු',
    clickCardHighlight: 'මුල් ලියවිල්ලෙන් බැලීමට ක්ලික් කරන්න',
    source: 'වගන්තිය',
    whatItMeans: 'මෙහි තේරුම:',
    askStaff: 'කාර්ය මණ්ඩලයෙන් අසන්න:',
    getDefenseScript: 'සම්පූර්ණ ප්‍රශ්නාවලිය බලන්න →',
    patientSummary: 'රෝගියා සඳහා සාරාංශය',
    plainText: 'සරල භාෂාව',
    clinicalTone: 'වෛද්‍ය භාෂාව',
    beforeSign: 'අත්සන් කිරීමට පෙර පරීක්ෂා කළ යුතු දෑ',
    confirmed: 'තහවුරු කර ඇත',
    keyTerms: 'පැහැදිලි කර ඇති ප්‍රධාන වචන',
    clickInspect: 'විස්තර බැලීමට ක්ලික් කරන්න',
    decoded: 'පැහැදිලි කිරීම',
    dailyMeds: 'ඖෂධ කාලසටහන',
    urgentCareTitle: 'වහාම ප්‍රතිකාර ලබාගත යුතු රෝග ලක්ෂණ',
    erNote: 'සැමවිටම වෛද්‍යවරයා ලබාදුන් උපදෙස් පිළිපදින්න.',
    footerNotice: 'මෙම යෙදුම අධ්‍යාපනික සහ දැනුවත් කිරීමේ අරමුණින් සපයන ලද විශ්ලේෂණයකි.',
    footerPrivate: 'පුද්ගලික දත්ත සුරැකීම',
    footerMulti: 'බහුභාෂා සහාය',
    negotiationBrief: 'රෝහල සමඟ සාකච්ඡා කිරීමේ උපදෙස්',
    addressing: 'විෂය:',
    readStaffModal: 'රෝහල් කාර්ය මණ්ඩලයට මෙය පවසන්න:',
    recMod: 'යෝජිත වෙනස්කම්:',
    yourRights: 'ඔබේ අයිතිවාසිකම්:',
    close: 'වසන්න',
    understood: 'තේරුම් ගතිමි',
    howCalculated: 'මෙම අගය ගණනය කළ ආකාරය',
    privacyCommit: 'පුද්ගලිකත්වය සුරැකීමේ සහතිකය'
  },
  Tamil: {
    tagline: 'கையெழுத்திடுவதற்கு முன் உங்கள் மருத்துவ ஆவணங்களைப் புரிந்து கொள்ளுங்கள்',
    badge: 'பாதுகாப்பான பகுப்பாய்வு • எளிய மொழிபெயர்ப்பு',
    heroTitle: 'கையெழுத்திடுவதற்கு முன் புரிந்து கொள்ளுங்கள்.',
    heroDesc: 'நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள். அறுவை சிகிச்சை ஒப்புதல் அல்லது கட்டண ஆவணங்களை கையெழுத்திடுவதற்கு முன் தமிழில் எளிதாகப் புரிந்து கொள்ள உதவுவோம்.',
    advocateReady: 'நோயாளி வழிகாட்டி தயார்',
    privateSession: 'தனிப்பட்ட அமர்வு',
    saveReport: 'அறிக்கையைச் சேமிக்கவும்',
    printCareCard: 'அட்டையை அச்சிடுக',
    analyzeHeader: 'மருத்துவ ஆவணத்தைப் பகுப்பாய்வு செய்யுங்கள்',
    step1: 'படி 1 / 2',
    tabUpload: 'PDF / புகைப்படம் பதிவேற்றவும்',
    tabText: 'உரையை உள்ளிடவும்',
    tabPresets: 'மாதிரிகளைப் பார்க்கவும்',
    dragDrop: 'ஆவணத்தை இங்கே இழுத்து விடுங்கள்',
    dropNow: 'ஆவணத்தை இங்கே விடுங்கள்',
    formats: 'PDF • JPG • PNG • 20 MB வரை',
    remove: 'நீக்கு',
    docExcerpt: 'ஆவணத்தின் பகுதி:',
    clear: 'அழி',
    recentConsultations: 'சமீபத்திய ஆலோசனைகள்',
    btnAudit: 'ஆய்வைத் தொடங்குங்கள்',
    btnAuditing: 'ஆய்வு செய்யப்படுகிறது',
    docRef: 'அசல் ஆவணக் குறிப்பு',
    clickToHighlight: 'முழு ஆவணத்தில் காண கிளிக் செய்யவும்',
    analyzingTitle: 'ஆவணம் ஆய்வு செய்யப்படுகிறது...',
    analyzingDesc: 'எளிய தமிழில் விளக்கங்கள் தயார் செய்யப்படுகின்றன',
    stepDocType: 'ஆவண வகை அடையாளம் காணப்படுகிறது',
    stepClauses: 'சட்ட விதிகளும் கட்டணங்களும் பிரிக்கப்படுகின்றன',
    stepScript: 'மருத்துவமனை ஊழியர்களிடம் கேட்க வேண்டியவை தயார் செய்யப்படுகின்றன...',
    advocateEmptyTitle: 'உங்கள் வழிகாட்டி தயார்',
    advocateEmptyDesc: 'இடதுபுறத்தில் ஆவணத்தை உள்ளிடவும். கட்டணங்கள் மற்றும் மருந்துகளை கையெழுத்திடுவதற்கு முன் விளக்குவோம்.',
    riskOverview: 'ஆபத்து மதிப்பீடு',
    docCategory: 'ஆவண வகை',
    verified: 'ஆவணத்திலிருந்து சரிபார்க்கப்பட்டது',
    viewMode: 'காட்சி முறை',
    switchToCaregiver: 'பராமரிப்பாளர் காட்சிக்கு மாறவும்',
    caregiverActive: 'பராமரிப்பாளர் காட்சி (செயலில் உள்ளது)',
    caregiverDashboard: 'பராமரிப்பாளர் தகவல் பலகை',
    returnPatient: 'நோயாளி காட்சிக்குத் திரும்பு',
    caregiverDesc: 'மருந்து அட்டவணை, அவசர எச்சரிக்கைகள் மற்றும் கேட்க வேண்டிய கேள்விகள்.',
    dailyMedSchedule: 'வழங்க வேண்டிய தினசரி மருந்து அட்டவணை',
    erRedFlags: 'அவசர எச்சரிக்கைகள்: எப்போது உடனே மருத்துவமனைக்குச் செல்ல வேண்டும்',
    caregiverChecklist: 'பராமரிப்பாளர் சரிபார்ப்புப் பட்டியல்',
    outOfPocketNotice: 'கூடுதல் கட்டண அறிவிப்பு',
    whatShouldISay: 'மருத்துவமனையில் நான் என்ன கேட்க வேண்டும்?',
    readToStaff: 'இதை ஊழியர்களிடம் நேரடியாகக் கூறவும்',
    copyScript: 'நகலெடு',
    copied: 'நகலெடுக்கப்பட்டது',
    translateScript: 'மொழிபெயர்ப்பு:',
    docIn30s: '30 வினாடி சுருக்கம்',
    procedure: 'சிகிச்சை',
    legalTerms: 'சட்ட விதிமுறைகள்',
    insurance: 'காப்பீடு',
    financial: 'நிதி செலவுகள்',
    itemsAttention: 'கவனிக்க வேண்டிய முக்கிய விஷயங்கள்',
    clickCardHighlight: 'அசல் உரையில் சிறப்பித்துக் காட்ட கிளிக் செய்யவும்',
    source: 'பிரிவு',
    whatItMeans: 'இதன் பொருள்:',
    askStaff: 'ஊழியர்களிடம் கேட்கவும்:',
    getDefenseScript: 'முழு வழிகாட்டலைப் பார்க்கவும் →',
    patientSummary: 'நோயாளி சுருக்கம்',
    plainText: 'எளிய மொழி',
    clinicalTone: 'மருத்துவ மொழி',
    beforeSign: 'கையெழுத்திடும் முன் சரிபார்க்க வேண்டியவை',
    confirmed: 'உறுதி செய்யப்பட்டது',
    keyTerms: 'விளக்கப்பட்ட முக்கிய சொற்கள்',
    clickInspect: 'விவரங்களைப் பார்க்க கிளிக் செய்க',
    decoded: 'விளக்கம்',
    dailyMeds: 'மருந்து அட்டவணை',
    urgentCareTitle: 'உடனடி சிகிச்சை பெற வேண்டிய அறிகுறிகள்',
    erNote: 'எப்போதும் மருத்துவரின் நேரடி வழிமுறைகளைப் பின்பற்றவும்.',
    footerNotice: 'இது ஒரு கல்வி மற்றும் வழிகாட்டுதல் நோக்கம் கொண்ட பகுப்பாய்வு மட்டுமே.',
    footerPrivate: 'தனிப்பட்ட அமர்வு சேமிப்பு',
    footerMulti: 'பல மொழி ஆதரவு',
    negotiationBrief: 'மருத்துவமனையுடன் பேசும் குறிப்புகள்',
    addressing: 'தலைப்பு:',
    readStaffModal: 'மருத்துவமனை ஊழியர்களிடம் கூற வேண்டியது:',
    recMod: 'பரிந்துரைக்கப்பட்ட மாற்றம்:',
    yourRights: 'உங்கள் உரிமைகள்:',
    close: 'மூடு',
    understood: 'புரிந்தது',
    howCalculated: 'இந்த மதிப்பெண் கணக்கிடப்பட்ட விதம்',
    privacyCommit: 'தனியுரிமை உறுதிப்பாடு'
  }
};

const CLINICAL_PRESETS = [
  {
    id: 'surgical',
    title: 'Surgical Consent Waiver',
    tag: 'Hospital Surgery',
    desc: 'Binding arbitration & out-of-network balance billing provisions',
    text: `HOSPITAL SURGICAL CONSENT & FINANCIAL WAIVER:
The patient agrees that Dr. Smith and Associates may perform elective laparoscopic surgery. 
SECTION 4.2 - BINDING ARBITRATION: The signatory forfeits any right to trial by jury and submits all malpractice claims exclusively to private arbitration at the patient's shared expense.
SECTION 8 - OUT-OF-NETWORK COVERAGE: Patient authorizes care by supplemental surgical assistants or on-call anesthesiologists, and acknowledges responsibility for all out-of-network balance billings not covered by primary insurance.`
  },
  {
    id: 'pediatric',
    title: 'Pediatric Antibiotic Rx',
    tag: 'Prescription Regimen',
    desc: 'Augmentin & Ibuprofen weight-based dosage timetable & ER allergy triggers',
    text: `DISCHARGE PRESCRIPTION & PEDIATRIC INSTRUCTIONS:
- Amoxicillin-Clavulanate (Augmentin) 400mg/5mL: Give 5 mL orally every 12 hours with food for 10 full days.
- Ibuprofen Infant Drops 50mg/1.25mL: Give 1.25 mL every 6 to 8 hours as needed for high fever (>38.5°C). Never give on an empty stomach.
- Warning: Stop immediately and go to ER if skin rash, wheezing, or facial swelling occurs.`
  },
  {
    id: 'emergency',
    title: 'ER Out-of-Network Bill',
    tag: 'Emergency Notice',
    desc: 'Offsite third-party physician fees and surprise facility charges',
    text: `EMERGENCY ROOM DISCHARGE SUMMARY & FINANCIAL UNDERTAKING:
Patient presented with acute non-cardiac chest tightness. EKG normal.
OUT-OF-NETWORK NOTICE: Diagnostic scans and lab testing were processed by third-party offsite physicians who are out-of-network.
The patient assumes full personal liability for all remaining balances, copays, and non-contracted facility fees exceeding primary insurance coverage.`
  }
];

const LANGUAGES = [
  { code: 'English', label: 'English (US)' },
  { code: 'Sinhala', label: 'සිංහල (Sinhala)' },
  { code: 'Tamil', label: 'தமிழ் (Tamil)' },
  { code: 'Spanish', label: 'Español' }
];

const STORAGE_KEY = 'subtext_audit_history';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload'); 
  const [inputText, setInputText] = useState(CLINICAL_PRESETS[0].text);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [viewLevel, setViewLevel] = useState('simplified');
  const [isCaregiverMode, setIsCaregiverMode] = useState(false);
  
  const [highlightedSection, setHighlightedSection] = useState(null);
  const docReferenceRef = useRef(null);
  const fileInputRef = useRef(null);

  const [activeClauseAction, setActiveClauseAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionData, setActionData] = useState(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTermModal, setActiveTermModal] = useState(null);
  const [showScoreInfoModal, setShowScoreInfoModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [completedSignItems, setCompletedSignItems] = useState({});
  const [auditHistory, setAuditHistory] = useState([]);

  const t = UI_STRINGS[targetLanguage] || UI_STRINGS.English;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setAuditHistory(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }, []);

  const toggleSignItem = (idx) => {
    setCompletedSignItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const saveToHistory = (newAnalysis, langUsed, docSnippet) => {
    try {
      const record = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        documentType: newAnalysis.documentType || 'Clinical Form',
        riskScore: newAnalysis.riskScore || 0,
        riskLevel: newAnalysis.riskLevel || 'Review Needed',
        language: langUsed,
        snippet: docSnippet ? docSnippet.slice(0, 75) + '...' : 'Uploaded File',
        data: newAnalysis
      };
      const updated = [record, ...auditHistory.slice(0, 4)];
      setAuditHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save history:", e);
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
    setCompletedSignItems({});
    setHighlightedSection(null);
  };

  const handleFile = (file) => {
    if (file) {
      setSelectedFile(file);
      if (file.type && file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleFileSelect = (e) => handleFile(e.target.files[0]);
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
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
    setCompletedSignItems({});
    setHighlightedSection(null);

    try {
      let res;
      if (selectedFile && activeTab === 'upload') {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('language', langToUse);
        res = await fetch(`${API_BASE_URL}/api/analyze-file`, {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/analyze`, {
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
      saveToHistory(data, langToUse, (selectedFile && activeTab === 'upload') ? selectedFile.name : inputText);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Connecting to backend service...');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setTargetLanguage(newLang);
    if (analysis) executeAudit(newLang);
  };

  const handleSelectClause = (concern) => {
    const query = concern.sourceSection || concern.title;
    setHighlightedSection(query);
    if (docReferenceRef.current) {
      docReferenceRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleGetClauseAdvice = async (clause) => {
    setActiveClauseAction(clause);
    setActionLoading(true);
    setActionData(null);
    setCopiedScript(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/clause-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseTitle: clause.title || clause.clauseTitle,
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

  const handleExportText = () => {
    if (!analysis) return;
    let content = `=======================================================\n`;
    content += `SUBTEXT HEALTH - PATIENT ADVOCACY & DISCHARGE AUDIT\n`;
    content += `=======================================================\n\n`;
    content += `Document Category: ${analysis.documentType || 'Clinical Record'}\n`;
    content += `Patient Risk Overview: ${analysis.riskScore || 0}/100 (${analysis.riskLevel || 'Review'})\n`;
    content += `Language: ${targetLanguage}\n`;
    content += `Generated On: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;

    if (analysis.financialLiabilityWarning) {
      content += `[${t.outOfPocketNotice.toUpperCase()}]\n${analysis.financialLiabilityWarning}\n\n`;
    }

    content += `[${t.whatShouldISay.toUpperCase()}]\n"${analysis.primaryTalkingScript || 'N/A'}"\n\n`;

    content += `[${t.patientSummary.toUpperCase()}]\n`;
    content += `${analysis.summary?.simplified || analysis.summary?.standard || 'N/A'}\n\n`;

    if (analysis.topConcerns?.length) {
      content += `[${t.itemsAttention.toUpperCase()}]\n`;
      analysis.topConcerns.forEach((c, i) => {
        content += `${i + 1}. ${c.title} (${c.sourceSection || 'Section'})\n`;
        content += `   Quote: "${c.originalQuote}"\n`;
        content += `   ${t.whatItMeans} ${c.plainExplanation}\n`;
        content += `   ${t.askStaff} ${c.whatToAsk}\n\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SubText_Patient_Brief_${Date.now()}.txt`;
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
    setActiveTab('text');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-teal-100 selection:text-teal-900 print:bg-white print:text-black">
      
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
              <HeartPulse className="w-5 h-5 stroke-[2.3]"/>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  SubText <span className="text-teal-600">Health</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Patient Companion
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">{t.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition"
              title="Click to view privacy commitments"
            >
              <Lock className="w-3.5 h-3.5 text-teal-600"/>
              <span>{t.privateSession}</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-2 sm:px-3 py-1.5 transition">
              <Languages className="w-4 h-4 text-teal-600 shrink-0"/>
              <select
                value={targetLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-white text-slate-800">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {analysis && (
              <>
                <button
                  onClick={handleExportText}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-1.5 rounded-xl transition shadow-sm print:hidden"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500"/>
                  {t.saveReport}
                </button>

                <button
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-xl transition shadow-md shadow-teal-600/20 print:hidden"
                >
                  <Printer className="w-3.5 h-3.5"/>
                  {t.printCareCard}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-teal-50/20 to-slate-50 border-b border-slate-200 px-4 sm:px-6 py-6 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600"/>
              {t.badge}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {t.heroTitle}
            </h1>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal">
              {t.heroDesc}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex items-center gap-3.5 shrink-0">
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-teal-600 text-white flex items-center justify-center font-bold text-[11px]">
                MD
              </div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-cyan-600 text-white flex items-center justify-center font-bold text-[11px]">
                RN
              </div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                JD
              </div>
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {t.advocateReady}
              </span>
              <span className="text-[11px] text-slate-500">
                English • සිංහල • தமிழ் • Español
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace: Fixed relative layout on mobile, sticky only on desktop */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 print:p-0 print:block items-start">
        
        {/* Left Column: relative on small screens, sticky on desktop */}
        <section className="lg:col-span-5 flex flex-col gap-4 print:hidden relative lg:sticky lg:top-20 z-10">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {t.analyzeHeader}
              </h3>
              <span className="text-[11px] text-slate-400">{t.step1}</span>
            </div>

            <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-4">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${activeTab === 'upload' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <UploadCloud className="w-3.5 h-3.5"/>
                {t.tabUpload}
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${activeTab === 'text' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <FileText className="w-3.5 h-3.5"/>
                {t.tabText}
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${activeTab === 'presets' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <BookOpen className="w-3.5 h-3.5"/>
                {t.tabPresets}
              </button>
            </div>

            {activeTab === 'upload' && (
              <div>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition mb-3 flex flex-col items-center justify-center ${isDragging ? 'border-teal-500 bg-teal-50 scale-[1.01]' : 'border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/20'}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept="image/*,.pdf,.txt" 
                    className="hidden" 
                  />
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-2 shadow-inner">
                    <UploadCloud className="w-6 h-6 stroke-[2]"/>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : (isDragging ? t.dropNow : t.dragDrop)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.formats}</p>
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 mb-2">
                    <span className="text-xs font-semibold text-teal-900 truncate max-w-[200px] sm:max-w-[240px]">{selectedFile.name}</span>
                    <button onClick={clearFile} className="text-[11px] font-bold text-rose-600 hover:underline">{t.remove}</button>
                  </div>
                )}

                {filePreview && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-slate-200 max-h-36 flex justify-center bg-slate-100">
                    <img src={filePreview} alt="Scan preview" className="object-contain max-h-36" />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'text' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t.docExcerpt}</span>
                  <button 
                    onClick={() => setInputText('')} 
                    className="text-[11px] text-slate-400 hover:text-rose-500 hover:underline"
                  >
                    {t.clear}
                  </button>
                </div>
                <textarea
                  className="w-full min-h-[140px] p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed text-slate-700 transition mb-3"
                  placeholder="Paste hospital consent, surgery agreement, or prescription notes here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
            )}

            {activeTab === 'presets' && (
              <div className="flex flex-col gap-2 mb-3">
                {CLINICAL_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => applyPreset(preset.text)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 cursor-pointer transition group flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-teal-950">
                          {preset.title}
                        </span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal leading-snug">
                        {preset.desc}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0 mt-1 transition group-hover:translate-x-0.5"/>
                  </div>
                ))}
              </div>
            )}

            {auditHistory.length > 0 && (
              <div className="mt-1 mb-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <History className="w-3 h-3 text-teal-600"/> {t.recentConsultations} ({auditHistory.length})
                  </span>
                  <button 
                    onClick={clearHistory}
                    className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3"/> {t.clear}
                  </button>
                </div>
                <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                  {auditHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => restoreAudit(item)}
                      className="p-1.5 px-2 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 cursor-pointer flex items-center justify-between transition text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.riskScore > 70 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                          {item.riskScore}
                        </span>
                        <span className="font-semibold text-slate-700 truncate">{item.documentType}</span>
                        <span className="text-[10px] text-slate-400">({item.language})</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={() => executeAudit(targetLanguage)}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-md shadow-teal-600/20"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin"/>
                  {t.btnAuditing} {targetLanguage}...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 stroke-[2.2]"/>
                  {t.btnAudit}
                  <ArrowRight className="w-4 h-4 ml-1 stroke-[2.2]"/>
                </>
              )}
            </button>
          </div>

          {analysis && (
            <div ref={docReferenceRef} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm scroll-mt-24">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-600"/>
                  {t.docRef}
                </span>
                <span className="text-[10px] text-teal-700 font-medium">{t.clickToHighlight}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 max-h-40 overflow-y-auto leading-relaxed">
                {inputText.split('\n').map((line, idx) => {
                  const isHighlighted = highlightedSection && line.toLowerCase().includes(highlightedSection.toLowerCase());
                  return (
                    <p key={idx} className={`py-0.5 transition ${isHighlighted ? 'bg-amber-300 text-amber-950 font-bold px-1.5 rounded ring-2 ring-amber-400 animate-pulse' : ''}`}>
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Normal relative flow, preventing overlaps */}
        <section className="lg:col-span-7 flex flex-col gap-5 print:w-full relative z-0">
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-teal-600 animate-spin"/>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t.analyzingTitle}</h3>
                  <p className="text-xs text-slate-500">{t.analyzingDesc} {targetLanguage}</p>
                </div>
              </div>
              <div className="space-y-2.5 pt-2 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2 text-teal-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-600"/> {t.stepDocType}
                </div>
                <div className="flex items-center gap-2 text-teal-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-600"/> {t.stepClauses}
                </div>
                <div className="flex items-center gap-2 text-slate-700 animate-pulse">
                  <Circle className="w-4 h-4 text-teal-400 animate-spin"/> {t.stepScript}
                </div>
              </div>
            </div>
          ) : !analysis ? (
            <div className="h-full bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-500 min-h-[440px] shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-3">
                <FileCheck className="w-7 h-7"/>
              </div>
              <h3 className="text-base font-bold text-slate-900">{t.advocateEmptyTitle}</h3>
              <p className="text-xs max-w-sm mt-1 text-slate-500 leading-relaxed font-normal">
                {t.advocateEmptyDesc}
              </p>
            </div>
          ) : (
            <>
              {/* Header Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {t.riskOverview}
                    </span>
                    <button 
                      onClick={() => setShowScoreInfoModal(true)} 
                      className="text-slate-400 hover:text-teal-600 transition"
                      title="How is this calculated?"
                    >
                      <Info className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-slate-900">
                      {analysis.riskScore || 85} <span className="text-xs font-normal text-slate-400">/ 100</span>
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${analysis.riskScore > 70 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {analysis.riskLevel || 'High Attention'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    {analysis.attentionCount || (analysis.topConcerns?.length || 2)} {t.itemsAttention.toLowerCase()}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {t.docCategory}
                  </span>
                  <span className="text-sm font-bold text-slate-900 block truncate">
                    {analysis.documentType || 'Clinical Record'}
                  </span>
                  <span className="text-[11px] text-teal-700 font-medium block mt-1">
                    ✓ {t.verified}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {t.viewMode}
                    </span>
                    <Users className="w-3.5 h-3.5 text-teal-600"/>
                  </div>
                  <button
                    onClick={() => setIsCaregiverMode(!isCaregiverMode)}
                    className={`mt-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${isCaregiverMode ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {isCaregiverMode ? `👨‍👩‍👧 ${t.caregiverActive}` : t.switchToCaregiver}
                  </button>
                </div>
              </div>

              {/* Caregiver Mode */}
              {isCaregiverMode ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl p-4 shadow-md flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5"/>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-extrabold">{t.caregiverDashboard}</h4>
                        <button 
                          onClick={() => setIsCaregiverMode(false)}
                          className="text-[11px] text-teal-100 hover:text-white underline font-medium"
                        >
                          {t.returnPatient}
                        </button>
                      </div>
                      <p className="text-xs text-teal-50 mt-0.5 leading-relaxed">
                        {t.caregiverDesc}
                      </p>
                    </div>
                  </div>

                  {Array.isArray(analysis.medicationTimeline) && analysis.medicationTimeline.length > 0 && (
                    <div className="bg-white border border-teal-200 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Pill className="w-4 h-4 text-teal-600"/>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          {t.dailyMedSchedule}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {analysis.medicationTimeline.map((med, idx) => (
                          <div key={idx} className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md">
                                {med.timeSlot}
                              </span>
                              <p className="text-xs font-bold text-slate-900 mt-2">{med.medicationName}</p>
                              <p className="text-xs text-slate-600 mt-1 leading-snug">{med.instructions}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(analysis.redFlags) && analysis.redFlags.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-rose-600"/>
                        <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                          {t.erRedFlags}
                        </h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-rose-800">
                        {analysis.redFlags.map((flag, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 font-medium">
                            <span className="font-bold">•</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(analysis.beforeYouSignChecklist) && analysis.beforeYouSignChecklist.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-teal-600"/>
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            {t.caregiverChecklist}
                          </h3>
                        </div>
                        <span className="text-xs text-teal-700 font-bold">
                          {Object.values(completedSignItems).filter(Boolean).length} of {analysis.beforeYouSignChecklist.length} {t.confirmed}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {analysis.beforeYouSignChecklist.map((item, idx) => {
                          const isDone = !!completedSignItems[idx];
                          return (
                            <li 
                              key={idx} 
                              onClick={() => toggleSignItem(idx)}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl transition cursor-pointer select-none border ${isDone ? 'bg-teal-50 border-teal-200 text-slate-400' : 'bg-slate-50 border-slate-200 hover:border-teal-300 text-slate-700'}`}
                            >
                              <button className="mt-0.5 shrink-0 print:hidden">
                                {isDone ? <CheckCircle2 className="w-4 h-4 text-teal-600"/> : <Circle className="w-4 h-4 text-slate-400 hover:text-slate-600"/>}
                              </button>
                              <span className={`text-xs leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                /* Patient Mode */
                <div className="space-y-5">
                  {analysis.financialLiabilityWarning && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <DollarSign className="w-4 h-4"/>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">{t.outOfPocketNotice}</h4>
                        <p className="text-xs text-amber-800 mt-0.5 leading-relaxed font-medium">{analysis.financialLiabilityWarning}</p>
                      </div>
                    </div>
                  )}

                  {/* What Should I Say Card: relative flow, z-index managed */}
                  <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-5 shadow-lg relative z-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4"/>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                          {t.whatShouldISay}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium">{t.readToStaff}</span>
                    </div>

                    <p className="text-sm font-medium italic text-slate-100 leading-relaxed my-3 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                      "{analysis.primaryTalkingScript || '...'}"
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => handleCopyScript(analysis.primaryTalkingScript || '')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        {copiedScript ? <Check className="w-3.5 h-3.5"/> : <Copy className="w-3.5 h-3.5"/>}
                        {copiedScript ? t.copied : t.copyScript}
                      </button>

                      <div className="flex items-center gap-1 text-[11px] text-slate-300">
                        <span>{t.translateScript}</span>
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`px-2 py-0.5 rounded-md transition ${targetLanguage === lang.code ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                          >
                            {lang.code === 'English' ? 'EN' : lang.code.slice(0, 2).toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 30-Second Snapshot */}
                  {analysis.snapshot30s && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                        {t.docIn30s}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">{t.procedure}</span>
                          <span className="font-bold text-slate-800">{analysis.snapshot30s.procedure || 'N/A'}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">{t.legalTerms}</span>
                          <span className="font-bold text-rose-700">⚠️ {analysis.snapshot30s.legal || 'N/A'}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">{t.insurance}</span>
                          <span className="font-bold text-amber-700">⚠️ {analysis.snapshot30s.insurance || 'N/A'}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">{t.financial}</span>
                          <span className="font-bold text-slate-800">{analysis.snapshot30s.financial || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top Concerns */}
                  {Array.isArray(analysis.topConcerns) && analysis.topConcerns.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600"/>
                          {t.itemsAttention} ({analysis.topConcerns.length})
                        </h3>
                        <span className="text-[11px] text-teal-700 font-medium">{t.clickCardHighlight}</span>
                      </div>

                      <div className="space-y-3">
                        {analysis.topConcerns.map((concern, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => handleSelectClause(concern)}
                            className="bg-slate-50 hover:bg-teal-50/30 border border-slate-200 hover:border-teal-400 rounded-2xl p-4 transition cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 group-hover:text-teal-900">
                                  0{idx + 1} — {concern.title}
                                </span>
                                {concern.sourceSection && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-teal-800">
                                    {t.source}: {concern.sourceSection}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                                  {concern.confidence || 'Verified'}
                                </span>
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${concern.severity && concern.severity.includes('High') ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {concern.severity || 'Review'}
                                </span>
                              </div>
                            </div>

                            {concern.originalQuote && (
                              <p className="text-xs italic text-slate-500 border-l-2 border-slate-300 pl-2.5 my-1.5">
                                "{concern.originalQuote}"
                              </p>
                            )}

                            <p className="text-xs text-slate-700 font-medium">
                              💡 <span className="font-semibold text-slate-900">{t.whatItMeans}</span> {concern.plainExplanation}
                            </p>

                            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                              <span className="text-xs text-teal-800 font-semibold flex items-center gap-1">
                                🗣️ {t.askStaff} "{concern.whatToAsk}"
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGetClauseAdvice(concern);
                                }}
                                className="text-xs text-teal-700 hover:text-teal-900 font-bold hover:underline shrink-0 print:hidden"
                              >
                                {t.getDefenseScript}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-teal-600"/> {t.patientSummary} ({targetLanguage})
                      </span>
                      <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex print:hidden">
                        <button
                          onClick={() => setViewLevel('simplified')}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${viewLevel === 'simplified' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                        >
                          {t.plainText}
                        </button>
                        <button
                          onClick={() => setViewLevel('standard')}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${viewLevel === 'standard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                        >
                          {t.clinicalTone}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-normal">
                      {viewLevel === 'simplified' 
                        ? (analysis.summary?.simplified || analysis.summary) 
                        : (analysis.summary?.standard || analysis.summary)}
                    </p>
                  </div>

                  {/* Before You Sign Checklist */}
                  {Array.isArray(analysis.beforeYouSignChecklist) && analysis.beforeYouSignChecklist.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-teal-600"/>
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            {t.beforeSign}
                          </h3>
                        </div>
                        <span className="text-xs text-teal-700 font-bold print:hidden">
                          {Object.values(completedSignItems).filter(Boolean).length} of {analysis.beforeYouSignChecklist.length} {t.confirmed}
                        </span>
                      </div>

                      <ul className="space-y-2">
                        {analysis.beforeYouSignChecklist.map((item, idx) => {
                          const isDone = !!completedSignItems[idx];
                          return (
                            <li 
                              key={idx} 
                              onClick={() => toggleSignItem(idx)}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl transition cursor-pointer select-none border ${isDone ? 'bg-teal-50 border-teal-200 text-slate-400' : 'bg-slate-50 border-slate-200 hover:border-teal-300 text-slate-700'}`}
                            >
                              <button className="mt-0.5 shrink-0 print:hidden">
                                {isDone ? <CheckCircle2 className="w-4 h-4 text-teal-600"/> : <Circle className="w-4 h-4 text-slate-400 hover:text-slate-600"/>}
                              </button>
                              <span className={`text-xs leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Key Terms */}
                  {Array.isArray(analysis.medicalGlossary) && analysis.medicalGlossary.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-teal-600"/>
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            {t.keyTerms}
                          </h3>
                        </div>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full print:hidden">
                          {t.clickInspect}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {analysis.medicalGlossary.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setActiveTermModal(item)}
                            className="bg-slate-50 hover:bg-teal-50/40 border border-slate-200 hover:border-teal-400 rounded-xl p-3.5 flex flex-col justify-between transition cursor-pointer group"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-teal-950 group-hover:text-teal-700">
                                  {item.term}
                                </span>
                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                                  {t.decoded}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {item.definition}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Daily Medications */}
                  {Array.isArray(analysis.medicationTimeline) && analysis.medicationTimeline.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Pill className="w-4 h-4 text-teal-600"/>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          {t.dailyMeds}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {analysis.medicationTimeline.map((med, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-teal-800 border border-slate-200 px-2 py-0.5 rounded-md">
                                {med.timeSlot}
                              </span>
                              <p className="text-xs font-bold text-slate-900 mt-2">{med.medicationName}</p>
                              <p className="text-xs text-slate-600 mt-1 leading-snug">{med.instructions}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Red flags */}
                  {Array.isArray(analysis.redFlags) && analysis.redFlags.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-rose-600"/>
                        <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                          {t.urgentCareTitle}
                        </h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-rose-800">
                        {analysis.redFlags.map((flag, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="font-bold">•</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-rose-600 mt-2 italic">
                        {t.erNote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-6 mt-8 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-teal-600 shrink-0"/>
            <span>
              <strong>Important:</strong> {t.footerNotice}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] shrink-0">
            <span>{t.footerPrivate}</span>
            <span>•</span>
            <span>{t.footerMulti}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showScoreInfoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setShowScoreInfoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5"/>
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-teal-600"/>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                {t.howCalculated}
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              The Patient Risk Overview score highlights areas deserving your attention before you sign:
            </p>
            <ul className="space-y-2 text-xs text-slate-700 mb-4">
              <li className="flex items-center gap-2">✓ <strong>Legal covenants:</strong> Arbitration and jury forfeiture clauses</li>
              <li className="flex items-center gap-2">✓ <strong>Financial exposure:</strong> Out-of-network balance billing provisions</li>
              <li className="flex items-center gap-2">✓ <strong>Care clarity:</strong> Unclear medication instructions or omitted risks</li>
            </ul>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowScoreInfoModal(false)} className="px-4 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl">
                {t.understood}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrivacyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setShowPrivacyModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5"/>
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-teal-600"/>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                {t.privacyCommit}
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Your uploaded document is processed in memory during this active browser session.
            </p>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowPrivacyModal(false)} className="px-4 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl">
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTermModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setActiveTermModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5"/>
            </button>
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-teal-600"/>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                {t.keyTerms}
              </h3>
            </div>
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block mb-1">Term</span>
              <p className="text-base font-extrabold text-slate-900">{activeTermModal.term}</p>
            </div>
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5">
                <span className="text-[10px] uppercase font-bold text-teal-900 block mb-0.5">{t.plainText}</span>
                <p className="text-teal-950 leading-relaxed font-medium">{activeTermModal.definition}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Why this matters</span>
                <p className="text-slate-700 leading-relaxed">{activeTermModal.whyItMatters || 'Helps you confirm your rights and expected costs.'}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                <span className="text-[10px] uppercase font-bold text-amber-800 block mb-0.5">{t.askStaff}</span>
                <p className="text-slate-700 leading-relaxed">"{activeTermModal.askDoctor || 'Can you explain how this affects my treatment?'}"</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setActiveTermModal(null)} className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
                {t.understood}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeClauseAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setActiveClauseAction(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5"/>
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5"/>
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                {t.negotiationBrief}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              {t.addressing} <span className="text-slate-800 font-semibold">{activeClauseAction.title || activeClauseAction.clauseTitle}</span>
            </p>

            {actionLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-teal-600 gap-2">
                <Sparkles className="w-6 h-6 animate-spin text-teal-600"/>
                <span className="text-xs text-slate-500">{t.analyzingDesc} {targetLanguage}...</span>
              </div>
            ) : actionData ? (
              <div className="space-y-3">
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-teal-900 tracking-wider">
                      {t.readStaffModal}
                    </span>
                    <button 
                      onClick={() => handleCopyScript(actionData.talkingScript)}
                      className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-teal-600"/> : <Copy className="w-3.5 h-3.5"/>}
                      <span>{copiedScript ? t.copied : t.copyScript}</span>
                    </button>
                  </div>
                  <p className="text-xs text-teal-950 font-medium italic pr-4 leading-relaxed">
                    "{actionData.talkingScript}"
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block mb-0.5">{t.recMod}</span>
                  <p className="text-slate-700 leading-relaxed">{actionData.alternativeRequest}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">{t.yourRights}</span>
                  <p className="text-slate-700 leading-relaxed">{actionData.patientRight}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-600">Failed to load advice.</p>
            )}

            <div className="mt-4 flex justify-end">
              <button onClick={() => setActiveClauseAction(null)} className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl">
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}