import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Activity, Zap, ShieldCheck, QrCode, Lock, 
  Barcode, History, Hammer, ZapOff, PlusCircle, 
  X, Camera, DollarSign, Loader2, Sparkles, Menu,
  Image as ImageIcon, CheckCircle2, AlertCircle, Trash2,
  Battery, Cpu, Recycle, Wrench, Settings2, Gauge,
  Printer, FileCheck, ShieldAlert, Award
} from 'lucide-react';

/**
 * CONFIGURACIÓN SEGURA DE ACCESO A VARIABLES
 */
const getSafeEnv = () => {
  try {
    const env = (import.meta && import.meta.env) ? import.meta.env : {};
    return env.VITE_CORE_TOKEN || "";
  } catch (e) { return ""; }
};

const coreAuthToken = getSafeEnv();

const runCoreAudit = async (payload) => {
  if (!coreAuthToken) return "Error: Variable VITE_CORE_TOKEN no configurada en Vercel.";
  const model = "gemini-2.5-flash-preview-09-2025";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${coreAuthToken}`;
  
  const systemPrompt = `Eres el Core Engine de DeepFix OS v1.4. 
  Genera reportes periciales de electromovilidad con formato profesional estructurado.
  DATOS: Telemetría SC-25, Caracterización Motor/Controlador y Ciclo Vida Batería.
  ESTRUCTURA:
  1. TÍTULO EN MAYÚSCULAS.
  2. RESUMEN TÉCNICO.
  3. EVALUACIÓN SC-25 VS LEY 21.088 (Chile).
  4. VEREDICTO LEGAL.
  REGLAS: Español profesional, usa saltos de línea claros (\n). Sin LaTeX.`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: payload }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      })
    });
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar el informe.";
  } catch (e) { return "Error de red con el nodo DeepFix."; }
};

const MOTOR_DB = [
  { id: 'bosch', name: 'Bosch Performance', eff: 0.92, res: 0.12 },
  { id: 'shimano', name: 'Shimano Steps', eff: 0.90, res: 0.14 },
  { id: 'bafang', name: 'Bafang Mid-Drive', eff: 0.85, res: 0.18 },
  { id: 'generic', name: 'Genérico / Kit', eff: 0.80, res: 0.22 }
];

const App = () => {
  const [auth, setAuth] = useState(false);
  const [creds, setCreds] = useState({ user: '', pass: '' });
  const [view, setView] = useState('cert');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- TELEMETRÍA SC-25 ---
  const [sc25Reading, setSc25Reading] = useState(245);
  const [sc25Serial, setSc25Serial] = useState("SC25-DFX-2025");

  // --- CARACTERIZACIÓN TÉCNICA ---
  const [motorType, setMotorType] = useState("Original");
  const [motorBrand, setMotorBrand] = useState(MOTOR_DB[2]);
  const [ctrlStatus, setCtrlStatus] = useState("Original");
  const [iMax, setIMax] = useState(15);
  const [vNominal, setVNominal] = useState(48);
  const [firmwareLocked, setFirmwareLocked] = useState(true);

  // --- BATERÍA ---
  const [batCapacity, setBatCapacity] = useState(15);
  const [batLifecycle, setBatLifecycle] = useState("Operativo");
  const [batSoh, setBatSoh] = useState(85);

  // Bitácora
  const [logs, setLogs] = useState([
    { id: 1, date: '2024-03-10', type: 'Mecánica', detail: 'Calibración inicial de sensores.', tech: 'DeepFix LAB', cost: 25000, photo: null }
  ]);

  // UI States
  const [loadingIA, setLoadingIA] = useState(false);
  const [report, setReport] = useState("");
  const [showLogForm, setShowLogForm] = useState(false);
  const [showCertPreview, setShowCertPreview] = useState(false);
  
  // Cámara
  const [camActive, setCamActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [newLog, setNewLog] = useState({ type: 'Mecánica', detail: '', tech: '', cost: '' });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const isCompliant = sc25Reading <= 250 && firmwareLocked;
  const totalInv = logs.reduce((acc, c) => acc + Number(c.cost), 0);

  const handleLogin = (e) => {
    e.preventDefault();
    if (creds.user === 'pruebacorreo' && creds.pass === 'pruebacorreo') setAuth(true);
  };

  const startCam = async () => {
    setCamActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { setCamActive(false); }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      canvasRef.current.getContext('2d').drawImage(videoRef.current, 0, 0);
      setCapturedPhoto(canvasRef.current.toDataURL('image/jpeg'));
      if (videoRef.current.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      setCamActive(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-900">
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-12 shadow-2xl text-center animate-in zoom-in duration-300">
          <div className="bg-cyan-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-900 shadow-xl shadow-cyan-500/20 animate-pulse"><Zap size={40} fill="currentColor" /></div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">DeepFix OS 1</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 text-center">Gestión Pericial SC-25</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Usuario" className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-center outline-none focus:border-cyan-500 transition-all text-slate-900" onChange={e => setCreds({...creds, user: e.target.value})} />
            <input type="password" placeholder="Clave" className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-center outline-none focus:border-cyan-500 transition-all text-slate-900" onChange={e => setCreds({...creds, pass: e.target.value})} />
            <button className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg">Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={`fixed inset-0 lg:relative z-50 lg:z-20 w-full lg:w-80 bg-slate-900 p-8 flex flex-col gap-8 text-white shadow-2xl transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4 text-cyan-400 font-black italic text-3xl tracking-tighter uppercase leading-none"><Zap size={32} fill="currentColor"/> DeepFix</div>
           <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500"><X /></button>
        </div>
        <nav className="flex flex-col gap-3 mt-8 text-left">
          <button onClick={() => { setView('cert'); setIsSidebarOpen(false); }} className={`p-5 rounded-2xl font-bold text-xs uppercase flex items-center gap-4 transition-all ${view === 'cert' ? 'bg-cyan-600 shadow-xl shadow-cyan-900/40' : 'hover:bg-slate-800 text-slate-500'}`}><Activity size={20}/> Peritaje Técnico</button>
          <button onClick={() => { setView('life'); setIsSidebarOpen(false); }} className={`p-5 rounded-2xl font-bold text-xs uppercase flex items-center gap-4 transition-all ${view === 'life' ? 'bg-cyan-600 shadow-xl shadow-cyan-900/40' : 'hover:bg-slate-800 text-slate-500'}`}><History size={20}/> Pasaporte Digital</button>
        </nav>
        <button onClick={() => setAuth(false)} className="mt-auto p-5 bg-rose-500/10 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Cerrar Sesión</button>
      </aside>

      <main className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto bg-slate-50 relative text-left">
        {/* Mobile Header */}
        <header className="lg:hidden flex justify-between items-center mb-8 bg-slate-900 p-4 rounded-2xl text-white shadow-lg">
           <div className="flex items-center gap-2"><Zap className="text-cyan-400" size={24} /><span className="font-black italic text-sm uppercase">DeepFix OS 1</span></div>
           <button onClick={() => setIsSidebarOpen(true)}><Menu /></button>
        </header>

        {view === 'cert' ? (
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
            <h2 className="text-4xl font-black uppercase tracking-tighter border-b-4 border-cyan-500 inline-block pb-1 text-slate-900">Caracterización SC-25</h2>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 space-y-10">
                
                {/* LECTURA SC-25 */}
                <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-8 relative overflow-hidden border border-slate-800 shadow-2xl">
                   <div className="absolute top-0 right-0 p-8 opacity-10"><Gauge size={120} /></div>
                   <div className="flex items-center justify-between relative z-10">
                      <h3 className="text-xs font-black uppercase text-cyan-400 tracking-widest flex items-center gap-3"><Gauge size={20}/> Telemetría SC-25</h3>
                      <span className="text-[9px] font-black bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20">{sc25Serial}</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Potencia Terminal (Watts)</label>
                         <div className="relative">
                            <input type="number" value={sc25Reading} onChange={(e) => setSc25Reading(Number(e.target.value))} className="w-full p-6 bg-slate-800 text-cyan-400 rounded-3xl font-black text-5xl text-center shadow-inner focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all" />
                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-cyan-800 font-black text-2xl">W</span>
                         </div>
                      </div>
                      <div className="flex flex-col justify-center p-6 bg-slate-800/50 rounded-3xl border border-slate-700">
                         <div className="flex items-center gap-3 mb-3">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                            <span className="text-[10px] font-black uppercase text-slate-300">Validación Técnica Certificada</span>
                         </div>
                         <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">Lectura obtenida directamente del puerto de inyección. Fuente única de verdad para el cumplimiento de 250W.</p>
                      </div>
                   </div>
                </div>

                {/* TREN DE POTENCIA */}
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10 text-left">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-3"><Cpu className="text-cyan-600" size={20}/> Caracterización de Hardware</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                     <div className="space-y-6">
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4 block">Tipo de Motor</label>
                           <select value={motorType} onChange={(e) => setMotorType(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none cursor-pointer text-sm">
                             <option value="Original">Original de Fábrica</option>
                             <option value="Reemplazo">Reemplazo de Motor</option>
                             <option value="Remanufactura">Remanufactura (Bobinado)</option>
                           </select>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4 block">Estado Controlador</label>
                           <select value={ctrlStatus} onChange={(e) => setCtrlStatus(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none cursor-pointer text-sm">
                             <option value="Original">Original</option>
                             <option value="Modificado">Modificado / Custom</option>
                             <option value="Reemplazo">Reemplazo Universal</option>
                           </select>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <div className="space-y-2 text-left"><label className="text-[10px] font-black text-slate-400 uppercase ml-4 block uppercase">Límite Corriente</label>
                           <div className="flex justify-between text-xs font-black text-cyan-600 mb-2 px-2 uppercase tracking-tighter"><span>Controller Peak</span><span>{iMax}A</span></div>
                           <input type="range" min="5" max="50" value={iMax} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-cyan-600" onChange={e => setIMax(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2 text-left"><label className="text-[10px] font-black text-slate-400 uppercase ml-4 block uppercase">Voltaje Sistema</label>
                           <div className="flex justify-between text-xs font-black text-cyan-600 mb-2 px-2 uppercase tracking-tighter"><span>Nominal</span><span>{vNominal}V</span></div>
                           <input type="range" min="24" max="72" value={vNominal} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-cyan-600" onChange={e => setVNominal(Number(e.target.value))} />
                        </div>
                     </div>
                  </div>
                </div>

                {/* BATERÍA LEY REP */}
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10 text-left">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-3"><Battery className="text-cyan-600" size={20}/> Trazabilidad de Batería (Ley REP)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-4 block uppercase">Ciclo de Vida del Activo</label>
                        <select value={batLifecycle} onChange={(e) => setBatLifecycle(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none cursor-pointer text-sm">
                          <option value="Operativo">Uso Operativo Normal</option>
                          <option value="Reparación">Reparación de Celdas/BMS</option>
                          <option value="Revalorizado">Revalorizado (2da Vida)</option>
                          <option value="Reciclaje">Disposición Final / Reciclaje</option>
                        </select>
                     </div>
                     <div className="space-y-2 text-left"><label className="text-[10px] font-black text-slate-400 uppercase ml-4 block uppercase">Salud Celular (SoH)</label>
                        <div className="flex justify-between text-xs font-black text-cyan-600 mb-2 px-2"><span>State of Health</span><span>{batSoh}%</span></div>
                        <input type="range" min="0" max="100" value={batSoh} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-cyan-600" onChange={e => setBatSoh(Number(e.target.value))} />
                     </div>
                  </div>
                </div>

                {/* REPORTE IA */}
                <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative border border-slate-800 overflow-hidden text-left">
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Sparkles size={160} /></div>
                   <div className="flex justify-between items-center relative z-10 mb-8">
                      <h3 className="text-xl font-black uppercase flex items-center gap-4 tracking-tighter text-white leading-none uppercase"><Sparkles className="text-cyan-400" size={28} /> Veredicto DeepFix IA</h3>
                      <button onClick={async () => { setLoadingIA(true); const r = await runCoreAudit(`MEDICIÓN SC-25: ${sc25Reading}W. Motor: ${motorType}. Controlador: ${ctrlStatus} @ ${iMax}A. Batería: SoH ${batSoh}% (${batLifecycle}). Cumple Ley: ${isCompliant}.`); setReport(r); setLoadingIA(false); }} className="px-10 py-3 bg-cyan-500 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:bg-cyan-400 active:scale-95 disabled:opacity-50" disabled={loadingIA}>{loadingIA ? <Loader2 className="animate-spin" size={20}/> : 'Generar Reporte'}</button>
                   </div>
                   <div className="bg-slate-800/60 p-8 rounded-[2rem] min-h-[180px] text-sm leading-relaxed whitespace-pre-wrap text-slate-300 font-light border border-slate-700 shadow-inner italic">
                      {report || "Esperando parámetros técnicos de inyección SC-25 para iniciar el procesamiento narrativo..."}
                   </div>
                </div>
              </div>

              {/* ASIDE RESULTADOS Y SELLO */}
              <aside className="space-y-10 flex flex-col items-center">
                <div className={`w-full p-14 rounded-[4rem] text-white flex flex-col items-center justify-center shadow-2xl transition-all duration-700 ${isCompliant ? 'bg-emerald-600 shadow-emerald-900/30' : 'bg-rose-600 shadow-rose-900/30'}`}>
                   <p className="text-[11px] font-black uppercase opacity-70 mb-6 tracking-widest text-center uppercase leading-none">Potencia Peritada SC-25</p>
                   <div className="flex items-baseline gap-2 text-center leading-none"><span className="text-9xl font-black tracking-tighter">{sc25Reading}</span><span className="text-3xl font-bold uppercase">W</span></div>
                   <div className="mt-12 w-full py-4 bg-black/20 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest text-center">{isCompliant ? 'CUMPLE NORMATIVA' : 'RECHAZADO'}</div>
                </div>
                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 w-full flex flex-col items-center gap-10 shadow-sm text-center">
                   <div className="p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 shadow-inner group">
                      <QrCode size={160} className={`transition-all duration-500 ${isCompliant ? 'text-slate-900 group-hover:scale-105' : 'text-slate-100 opacity-30'}`} />
                   </div>
                   <button onClick={() => setShowCertPreview(true)} disabled={!isCompliant} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-10 flex items-center justify-center gap-3">
                      <FileCheck size={20} /> Emitir Sello Físico
                   </button>
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 text-left">
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-200 pb-12 text-left">
              <div className="text-left w-full text-left">
                <h2 className="text-4xl font-black uppercase tracking-tighter block text-left uppercase">Pasaporte Digital</h2>
                <p className="text-slate-500 text-base italic block text-left text-left font-medium">Historial inmutable de vida útil con evidencia visual capturada.</p>
              </div>
              <button onClick={() => { setShowLogForm(true); setCapturedPhoto(null); }} className="px-12 py-6 bg-cyan-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-4 shadow-2xl hover:bg-cyan-700 transition-all shrink-0 leading-none"><PlusCircle size={24}/> Registrar Obra</button>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 text-left">
               <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white h-fit text-center space-y-6 shadow-2xl flex flex-col items-center border border-slate-800">
                  <DollarSign size={40} className="text-cyan-400 bg-slate-800 p-2 rounded-full shadow-xl shadow-black/40" />
                  <div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block text-center uppercase">Inversión Acumulada</p>
                    <p className="text-5xl font-black italic tracking-tighter block text-white text-center leading-none">${totalInv.toLocaleString()}</p>
                  </div>
               </div>
               
               <div className="lg:col-span-3 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-12 text-left">
                  {logs.slice().reverse().map(l => (
                    <div key={l.id} className="flex flex-col sm:flex-row gap-10 border-b border-slate-50 pb-12 last:border-0 last:pb-0 text-left">
                       <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-lg border-4 border-white ${l.type === 'Eléctrica' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{l.type === 'Eléctrica' ? <ZapOff size={28}/> : <Hammer size={28}/>}</div>
                       <div className="flex-1 space-y-6 text-left">
                          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 text-left">
                             <div className="text-left w-full">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left block leading-none">{l.date} • {l.tech}</p>
                                <h4 className="font-black text-2xl text-slate-800 uppercase tracking-tighter text-left block uppercase leading-none">{l.type}</h4>
                             </div>
                             <div className="bg-slate-900 text-white px-6 py-2 rounded-[1.2rem] font-mono text-lg font-black shadow-lg shadow-black/10 shrink-0 leading-none">${l.cost.toLocaleString()}</div>
                          </div>
                          <div className="flex flex-col md:flex-row gap-8 items-center lg:items-start text-left">
                             {l.photo && <img src={l.photo} className="w-48 h-48 rounded-[2.5rem] object-cover shadow-xl border-4 border-white shrink-0 transition-transform hover:scale-105 duration-500" alt="Evidencia" />}
                             <p className="text-base italic text-slate-600 bg-slate-50 p-10 rounded-[2.5rem] flex-1 leading-relaxed border border-slate-100 relative shadow-inner text-left block font-medium">
                                <span className="absolute -top-3 left-10 px-4 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-300 uppercase tracking-widest uppercase font-black">Glosa de Pericia</span>
                                "{l.detail}"
                             </p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* MODAL CERTIFICADO IMPRIMIBLE */}
        {showCertPreview && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[4rem] p-10 shadow-2xl relative text-slate-900 overflow-y-auto max-h-[90vh]">
               <button onClick={() => setShowCertPreview(false)} className="absolute top-10 right-10 p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors shadow-sm"><X size={28}/></button>
               
               <div id="printable-certificate" className="p-8 border-[12px] border-slate-900 rounded-[3rem] text-center space-y-10 bg-white">
                  <div className="flex flex-col items-center gap-4">
                     <div className="bg-slate-900 p-5 rounded-3xl text-white shadow-xl"><Zap size={56} fill="currentColor" /></div>
                     <h1 className="text-4xl font-black italic uppercase tracking-tighter">CERTIFICADO DE CUMPLIMIENTO</h1>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none mb-4">DeepFix OS Technical Hub Chile</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-left py-10 border-y-2 border-slate-100">
                     <div className="space-y-4">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Activo ID</p>
                        <p className="text-2xl font-black tracking-tight uppercase leading-none">QR-DFX-2201</p>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mt-8">Terminal SC-25</p>
                        <p className="text-xl font-bold uppercase leading-none">{sc25Serial}</p>
                     </div>
                     <div className="space-y-4 text-right">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Potencia Certificada</p>
                        <p className="text-5xl font-black italic leading-none">{sc25Reading}W</p>
                        <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full inline-block mt-8 uppercase tracking-widest border border-emerald-100">Cumple Ley 21.088</p>
                     </div>
                  </div>

                  <div className="flex justify-between items-end gap-10">
                     <div className="flex-1 text-left space-y-6">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Caracterización de Componentes</p>
                           <p className="text-xs font-bold uppercase leading-tight">Motor: {motorType} / {motorBrand.name}</p>
                           <p className="text-xs font-bold uppercase leading-tight">Controlador: {ctrlStatus} - Locked</p>
                           <p className="text-xs font-bold uppercase leading-tight">Batería: {batLifecycle} - SoH {batSoh}%</p>
                        </div>
                        <div className="pt-10">
                           <div className="w-48 border-t-2 border-slate-900 pt-3">
                              <p className="text-[10px] font-black uppercase tracking-widest">Firma Perito</p>
                              <p className="text-[9px] font-medium text-slate-400">DeepFix OS 1 Authorized Node</p>
                           </div>
                        </div>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-100 shadow-inner">
                        <QrCode size={120} className="text-slate-900" />
                     </div>
                  </div>

                  <p className="text-[9px] text-slate-300 font-bold uppercase text-center pt-6 tracking-widest italic leading-none">Certificado emitido digitalmente bajo protocolo DeepFix OS 1.4</p>
               </div>

               <div className="mt-12 flex gap-4">
                  <button onClick={handlePrint} className="flex-1 py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all">
                     <Printer size={24} /> Imprimir Sello Físico
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* MODAL CON CÁMARA */}
        {showLogForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 relative max-h-[90vh] overflow-y-auto text-left shadow-2xl">
              <button onClick={() => { setCamActive(false); if(videoRef.current && videoRef.current.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop()); setShowLogForm(false); }} className="absolute top-10 right-10 p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-800 transition-colors shadow-sm"><X size={28}/></button>
              <h3 className="text-3xl font-black uppercase mb-12 tracking-tighter text-slate-900 block text-left leading-none uppercase">Registrar Obra</h3>
              <div className="w-full space-y-10 text-left">
                
                <div className="space-y-4 text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 block leading-none uppercase">Captura de Sensor Visual</p>
                  {camActive ? (
                    <div className="relative rounded-[3rem] overflow-hidden bg-black aspect-video border-4 border-cyan-500 shadow-2xl animate-in zoom-in duration-500">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <button onClick={takePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-slate-900 p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all shadow-black/40"><Camera size={32}/></button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6 text-left">
                      {capturedPhoto ? (
                         <div className="relative group w-full">
                            <img src={capturedPhoto} className="w-full max-h-64 rounded-[3rem] object-cover shadow-2xl border-4 border-emerald-500 animate-in zoom-in" alt="Evidencia capturada" />
                            <button onClick={startCam} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] flex items-center justify-center text-white font-black uppercase text-[10px] tracking-widest">Recapturar Fotografía</button>
                         </div>
                      ) : (
                        <button onClick={startCam} className="w-full py-12 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] text-slate-300 flex flex-col items-center gap-4 hover:bg-cyan-50 hover:text-cyan-600 transition-all group">
                           <Camera size={48} className="group-hover:scale-110 transition-transform duration-500" />
                           <span className="font-black text-[11px] uppercase tracking-widest text-center block uppercase">Activar Sensor de Terminal</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">{['Mecánica', 'Eléctrica'].map(t => (<button key={t} onClick={() => setNewLog({...newLog, type: t})} className={`flex-1 py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${newLog.type === t ? 'bg-slate-900 text-white shadow-xl shadow-black/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{t}</button>))}</div>
                <textarea placeholder="Descripción técnica detallada de la intervención pericial..." className="w-full p-8 bg-slate-50 border-2 border-slate-50 rounded-[2.5rem] text-base min-h-[140px] outline-none focus:border-cyan-500 transition-all shadow-inner text-center font-medium" onChange={e => setNewLog({...newLog, detail: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-8 text-left">
                  <div className="space-y-2 text-left"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 block leading-none">Costo CLP</label><input type="number" placeholder="0" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-center text-xl shadow-inner outline-none focus:border-cyan-500 font-black" onChange={e => setNewLog({...newLog, cost: e.target.value})} /></div>
                  <div className="space-y-2 text-left"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 block text-left leading-none uppercase">Perito Responsable</label><input type="text" placeholder="Nombre" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-center shadow-inner outline-none focus:border-cyan-500 font-bold" onChange={e => setNewLog({...newLog, tech: e.target.value})} /></div>
                </div>
                
                <button onClick={() => { setLogs([...logs, { ...newLog, id: Date.now(), date: new Date().toISOString().split('T')[0], photo: capturedPhoto }]); setCamActive(false); setShowLogForm(false); setCapturedPhoto(null); setNewLog({ type: 'Mecánica', detail: '', tech: '', cost: '' }); }} className="w-full py-7 bg-cyan-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-cyan-700 active:scale-95 transition-all shadow-cyan-600/30">Confirmar Registro Técnico</button>
              </div>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  );
};

// --- PUNTO DE ENTRADA ROBUSTO ---
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

export default App;
