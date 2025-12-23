import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Activity, Zap, ShieldCheck, QrCode, Lock, 
  Barcode, History, Hammer, ZapOff, PlusCircle, 
  X, Camera, DollarSign, Loader2, Sparkles, Menu,
  Image as ImageIcon, CheckCircle2, AlertCircle, Trash2,
  Battery, Cpu, Recycle, Wrench, Settings2, Gauge,
  Printer, FileCheck, Award, Info, Timer, Clock
} from 'lucide-react';

/**
 * DEEPFIX CORE - GESTIÓN DE SEGURIDAD
 */
const getAuthToken = () => {
  try {
    const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
    return env.VITE_CORE_TOKEN || "";
  } catch (e) { return ""; }
};

const coreAuthToken = getAuthToken();

const runCoreAudit = async (payload) => {
  if (!coreAuthToken) return "Error: Variable VITE_CORE_TOKEN no configurada.";
  const model = "gemini-2.5-flash-preview-09-2025";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${coreAuthToken}`;
  
  const systemPrompt = `Eres el Core Engine de DeepFix OS v1.5. 
  Genera reportes periciales de cumplimiento legal (Ley 21.088 Chile).
  CRITERIOS TÉCNICOS 2025:
  1. El estándar legal es Potencia NOMINAL Continua Máxima (250W).
  2. Los peaks de potencia medida por SC-25 son aceptables SOLO si duran menos de 30 segundos.
  3. Si un peak se sostiene por más de 30s, se considera potencia continua y debe ser rechazado.
  4. El corte de energía DEBE ocurrir a los 25 km/h.
  REGLAS: Español profesional chileno, títulos en mayúsculas, saltos de línea claros.`;

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
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar el veredicto.";
  } catch (e) { return "Error de red con el nodo DeepFix."; }
};

const App = () => {
  const [auth, setAuth] = useState(false);
  const [creds, setCreds] = useState({ user: '', pass: '' });
  const [view, setView] = useState('cert');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- TELEMETRÍA SC-25 (Digitación) ---
  const [sc25Peak, setSc25Peak] = useState(480);
  const [sc25PeakDuration, setSc25PeakDuration] = useState(15); // Segundos sostenidos
  const [sc25Serial, setSc25Serial] = useState("SC25-DFX-2025");

  // --- CARACTERIZACIÓN TÉCNICA (Sliders) ---
  const [pNominal, setPNominal] = useState(250); 
  const [motorType, setMotorType] = useState("Original");
  const [vNominal, setVNominal] = useState(48);
  const [iMax, setIMax] = useState(15);
  const [ctrlStatus, setCtrlStatus] = useState("Original");
  const [speedCutoff, setSpeedCutoff] = useState(true); 
  const [firmwareLocked, setFirmwareLocked] = useState(true);

  // --- BATERÍA ---
  const [batCapacity, setBatCapacity] = useState(15);
  const [batSoh, setBatSoh] = useState(85);
  const [batLifecycle, setBatLifecycle] = useState("Operativo");

  // UI States
  const [loadingIA, setLoadingIA] = useState(false);
  const [report, setReport] = useState("");
  const [showLogForm, setShowLogForm] = useState(false);
  const [showCertPreview, setShowCertPreview] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [newLog, setNewLog] = useState({ type: 'Mecánica', detail: '', tech: '', cost: '' });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ALGORITMO DE CUMPLIMIENTO 2025
  const isLegalNominal = pNominal <= 250;
  const isPeakAllowed = sc25PeakDuration <= 30; // Peak no puede sostenerse > 30s
  const isCompliant = isLegalNominal && isPeakAllowed && speedCutoff && firmwareLocked;

  const handleLogin = (e) => {
    e.preventDefault();
    if (creds.user === 'pruebacorreo' && creds.pass === 'pruebacorreo') setAuth(true);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      canvasRef.current.getContext('2d').drawImage(videoRef.current, 0, 0);
      setCapturedPhoto(canvasRef.current.toDataURL('image/jpeg'));
    }
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-900">
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-12 shadow-2xl text-center animate-in zoom-in duration-300">
          <div className="bg-cyan-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-900 shadow-xl shadow-cyan-500/20"><Zap size={40} fill="currentColor" /></div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">DeepFix OS 1.5</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 text-center">Compliance Hub 2025</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Perito" className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-center outline-none focus:border-cyan-500 transition-all text-slate-900" onChange={e => setCreds({...creds, user: e.target.value})} />
            <input type="password" placeholder="Clave" className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-center outline-none focus:border-cyan-500 transition-all text-slate-900" onChange={e => setCreds({...creds, pass: e.target.value})} />
            <button className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg">Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-slate-900">
      <aside className={`fixed inset-0 lg:relative z-50 lg:z-20 w-full lg:w-80 bg-slate-900 p-8 flex flex-col gap-8 text-white shadow-2xl transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4 text-cyan-400 font-black italic text-3xl tracking-tighter uppercase leading-none"><Zap size={32} fill="currentColor"/> DeepFix</div>
           <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500"><X /></button>
        </div>
        <nav className="flex flex-col gap-3 mt-8">
          <button onClick={() => setView('cert')} className={`p-5 rounded-2xl font-bold text-xs uppercase flex items-center gap-4 transition-all ${view === 'cert' ? 'bg-cyan-600 shadow-xl shadow-cyan-900/40' : 'hover:bg-slate-800 text-slate-500'}`}><Activity size={20}/> Peritaje</button>
          <button onClick={() => setView('life')} className={`p-5 rounded-2xl font-bold text-xs uppercase flex items-center gap-4 transition-all ${view === 'life' ? 'bg-cyan-600 shadow-xl shadow-cyan-900/40' : 'hover:bg-slate-800 text-slate-500'}`}><History size={20}/> Pasaporte</button>
        </nav>
        <button onClick={() => setAuth(false)} className="mt-auto p-5 bg-rose-500/10 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 transition-all">Salir</button>
      </aside>

      <main className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto bg-slate-50 relative text-left">
        {/* Mobile Header */}
        <header className="lg:hidden flex justify-between items-center mb-8 bg-slate-900 p-4 rounded-2xl text-white shadow-lg">
           <div className="flex items-center gap-2"><Zap className="text-cyan-400" size={24} /><span className="font-black italic text-sm">DeepFix OS 1.5</span></div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2"><Menu /></button>
        </header>

        {view === 'cert' ? (
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 text-left">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-cyan-500 pb-1 text-slate-900 gap-4">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Validación Peaks SC-25</h2>
              <div className="flex items-center gap-2 bg-slate-900 text-cyan-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                  <Gauge size={16} /> Protocolo de Continuidad
               </div>
            </header>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 space-y-10">
                
                {/* LECTURA MANUAL PEAK SC-25 */}
                <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-8 relative overflow-hidden border border-slate-800 shadow-2xl text-left">
                   <div className="absolute top-0 right-0 p-8 opacity-10"><Gauge size={120} /></div>
                   <div className="flex items-center justify-between relative z-10">
                      <h3 className="text-xs font-black uppercase text-cyan-400 tracking-widest flex items-center gap-3"><Zap size={20}/> Telemetría de Peak Power</h3>
                      <input type="text" value={sc25Serial} onChange={(e) => setSc25Serial(e.target.value)} className="bg-transparent border-b border-cyan-500/30 text-[10px] font-black text-cyan-400 outline-none text-right px-2" placeholder="ID Terminal" />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10 text-left">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Potencia Peak Máxima (Watts)</label>
                         <div className="relative">
                            <input type="number" value={sc25Peak} onChange={(e) => setSc25Peak(Number(e.target.value))} className="w-full p-6 bg-slate-800 text-cyan-400 rounded-3xl font-black text-6xl text-center shadow-inner focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all" />
                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-cyan-800 font-black text-2xl uppercase">W</span>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Tiempo Sostenido (Segundos)</label>
                         <div className="space-y-4">
                            <div className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700">
                               <Timer className={sc25PeakDuration > 30 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'} size={24} />
                               <span className={`text-4xl font-black ${sc25PeakDuration > 30 ? 'text-rose-500' : 'text-white'}`}>{sc25PeakDuration}s</span>
                            </div>
                            <input type="range" min="1" max="60" value={sc25PeakDuration} className="w-full h-2 bg-slate-800 rounded-full appearance-none accent-cyan-600" onChange={e => setSc25PeakDuration(Number(e.target.value))} />
                         </div>
                         <p className="text-[9px] text-slate-500 font-bold italic uppercase tracking-tighter">Si el peak se sostiene por más de 30s se considera potencia nominal continua.</p>
                      </div>
                   </div>
                </div>

                {/* CARACTERIZACIÓN TÉCNICA (SLIDERS) */}
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10 text-left">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-3 leading-none uppercase text-left"><ShieldCheck className="text-cyan-600" size={20}/> Caracterización Nominal Legal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                     <div className="space-y-8 text-left">
                        <div className="space-y-4 text-left">
                           <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 text-left"><span>Potencia Nominal Continua</span><span className="text-cyan-600">{pNominal}W</span></div>
                           <input type="range" min="100" max="1000" step="50" value={pNominal} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-cyan-600" onChange={e => setPNominal(Number(e.target.value))} />
                           <p className="text-[9px] text-slate-400 italic">Estándar: 250W constantes según Ley 21.088.</p>
                        </div>
                        <div className="space-y-4 text-left">
                           <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 text-left"><span>Voltaje Nominal Sistema</span><span className="text-cyan-600">{vNominal}V</span></div>
                           <input type="range" min="24" max="72" step="12" value={vNominal} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-cyan-600" onChange={e => setVNominal(Number(e.target.value))} />
                        </div>
                     </div>
                     <div className="space-y-8 text-left">
                        <div className="space-y-4 text-left">
                           <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 text-left"><span>Límite Corriente (Amperaje)</span><span className="text-cyan-600">{iMax}A</span></div>
                           <input type="range" min="5" max="50" step="1" value={iMax} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-cyan-600" onChange={e => setIMax(Number(e.target.value))} />
                        </div>
                        <div className="space-y-4 text-left">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block uppercase leading-none text-left">Corte Energía a 25 km/h</label>
                           <button onClick={() => setSpeedCutoff(!speedCutoff)} className={`w-full py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 transition-all ${speedCutoff ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                             {speedCutoff ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
                             {speedCutoff ? 'Corte Validado' : 'Sin Corte'}
                           </button>
                        </div>
                     </div>
                  </div>
                </div>

                {/* BATERÍA (SLIDERS) */}
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10 text-left">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-3 leading-none uppercase"><Battery className="text-cyan-600" size={20}/> Trazabilidad de Energía (Ley REP)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                     <div className="space-y-8 text-left">
                        <div className="space-y-4 text-left">
                           <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 text-left"><span>Capacidad Acumulada</span><span className="text-cyan-600">{batCapacity}Ah</span></div>
                           <input type="range" min="5" max="100" step="1" value={batCapacity} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-cyan-600" onChange={e => setBatCapacity(Number(e.target.value))} />
                        </div>
                        <div className="space-y-4 text-left">
                           <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 text-left"><span>Salud (SoH)</span><span className="text-cyan-600">{batSoh}%</span></div>
                           <input type="range" min="0" max="100" value={batSoh} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-cyan-600" onChange={e => setBatSoh(Number(e.target.value))} />
                        </div>
                     </div>
                     <div className="space-y-4 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block uppercase leading-none text-left">Estado Ciclo de Vida</label>
                        <select value={batLifecycle} onChange={(e) => setBatLifecycle(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none cursor-pointer appearance-none text-sm text-left">
                          <option value="Operativo">Uso Operativo</option>
                          <option value="Revalorizado">Revalorizado (2da Vida)</option>
                          <option value="Reciclaje">Derivado a Reciclaje</option>
                        </select>
                        <div className="mt-4 flex items-center justify-between p-4 bg-slate-900 rounded-2xl shadow-xl">
                           <span className="text-[10px] font-black uppercase text-slate-500 ml-2">Lock Firmware</span>
                           <button onClick={() => setFirmwareLocked(!firmwareLocked)} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${firmwareLocked ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-slate-500'}`}>{firmwareLocked ? 'LOCKED' : 'OPEN'}</button>
                        </div>
                     </div>
                  </div>
                </div>

                {/* REPORTE IA */}
                <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative border border-slate-800 overflow-hidden text-left">
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Sparkles size={160} /></div>
                   <div className="flex justify-between items-center relative z-10 mb-8 text-left">
                      <h3 className="text-xl font-black uppercase flex items-center gap-4 tracking-tighter text-white leading-none uppercase"><Sparkles className="text-cyan-400" size={28} /> Veredicto DeepFix IA</h3>
                      <button onClick={async () => { setLoadingIA(true); const r = await runCoreAudit(`Peak: ${sc25Peak}W por ${sc25PeakDuration}s. Nominal: ${pNominal}W. Corte 25kmh: ${speedCutoff}. Lock: ${firmwareLocked}. Bat: ${batLifecycle}. Cumple: ${isCompliant}.`); setReport(r); setLoadingIA(false); }} className="px-10 py-3 bg-cyan-500 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:bg-cyan-400 active:scale-95 disabled:opacity-50" disabled={loadingIA}>{loadingIA ? <Loader2 className="animate-spin" size={20}/> : 'Generar Reporte'}</button>
                   </div>
                   <div className="bg-slate-800/60 p-8 rounded-[2rem] min-h-[180px] text-sm leading-relaxed whitespace-pre-wrap text-slate-300 font-light border border-slate-700 shadow-inner italic">
                      {report || "Esperando caracterización avanzada para procesar el veredicto narrativo..."}
                   </div>
                </div>
              </div>

              {/* ASIDE STATUS BOARD */}
              <aside className="space-y-10 flex flex-col items-center">
                <div className={`w-full p-14 rounded-[4rem] text-white flex flex-col items-center justify-center shadow-2xl transition-all duration-700 ${isCompliant ? 'bg-emerald-600 shadow-emerald-900/30' : 'bg-rose-600 shadow-rose-900/30'}`}>
                   <p className="text-[11px] font-black uppercase opacity-70 mb-6 tracking-widest text-center uppercase leading-none">Clasificación Nominal</p>
                   <div className="flex items-baseline gap-2 text-center leading-none"><span className="text-9xl font-black tracking-tighter">{pNominal}</span><span className="text-3xl font-bold uppercase">W</span></div>
                   <div className="mt-12 w-full py-4 bg-black/20 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest text-center">{isCompliant ? 'APROBADO: CICLO' : 'CATEGORÍA: VEH. MOTOR'}</div>
                </div>
                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 w-full flex flex-col items-center gap-10 shadow-sm text-center">
                   <div className="p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 shadow-inner group">
                      <QrCode size={160} className={`transition-all duration-500 ${isCompliant ? 'text-slate-900 group-hover:scale-105' : 'text-slate-100 opacity-30'}`} />
                   </div>
                   <button onClick={() => setShowCertPreview(true)} disabled={!isCompliant} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-10 flex items-center justify-center gap-3">
                      <Award size={20} /> Emitir Sello SC-25
                   </button>
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 text-left">
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-200 pb-12 text-left">
              <div className="text-left w-full">
                <h2 className="text-4xl font-black uppercase tracking-tighter block text-left uppercase">Pasaporte Digital</h2>
                <p className="text-slate-500 text-base italic block text-left text-left font-medium uppercase tracking-tight">Trazabilidad inmutable técnica v2025.</p>
              </div>
              <button onClick={() => setShowLogForm(true)} className="px-12 py-6 bg-cyan-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-4 shadow-2xl hover:bg-cyan-700 transition-all shrink-0 leading-none"><PlusCircle size={24}/> Registrar Obra</button>
            </header>
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 text-center text-slate-300 italic uppercase text-[10px] tracking-widest">
               No hay registros adicionales en la memoria del nodo.
            </div>
          </div>
        )}

        {/* MODAL CERTIFICADO FÍSICO */}
        {showCertPreview && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300 text-left">
            <div className="bg-white w-full max-w-2xl rounded-[4rem] p-10 shadow-2xl relative text-slate-900 overflow-y-auto max-h-[90vh] text-center">
               <button onClick={() => setShowCertPreview(false)} className="absolute top-10 right-10 p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors shadow-sm"><X size={28}/></button>
               <div id="printable-certificate" className="p-8 border-[12px] border-slate-900 rounded-[3rem] text-center space-y-10 bg-white">
                  <div className="flex flex-col items-center gap-4">
                     <div className="bg-slate-900 p-5 rounded-3xl text-white"><Zap size={56} fill="currentColor" /></div>
                     <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">CERTIFICADO TÉCNICO SC-25</h1>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">DeepFix OS compliance chile v2025</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-left py-10 border-y-2 border-slate-100">
                     <div className="space-y-4 text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Potencia Nominal</p>
                        <p className="text-4xl font-black tracking-tight leading-none">{pNominal}W</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-8">Peak Sostenido (SC-25)</p>
                        <p className="text-2xl font-bold uppercase leading-none">{sc25Peak}W @ {sc25PeakDuration}s</p>
                     </div>
                     <div className="space-y-4 text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Corte Energía</p>
                        <p className="text-2xl font-black italic text-emerald-600 uppercase leading-none">VALIDADO 25KM/H</p>
                        <div className="mt-12 bg-slate-900 text-white p-4 rounded-2xl inline-block">
                           <QrCode size={80} />
                        </div>
                     </div>
                  </div>
                  <p className="text-[9px] text-slate-300 font-bold uppercase text-center pt-6 tracking-widest italic leading-none uppercase">Documento de cumplimiento pericial bajo protocolo DeepFix OS 1.5</p>
               </div>
               <button onClick={() => window.print()} className="mt-12 w-full py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all">
                  <Printer size={24} /> Imprimir Sello Legal
               </button>
            </div>
          </div>
        )}
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
