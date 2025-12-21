import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Activity, Zap, ShieldCheck, QrCode, Lock, 
  Barcode, History, Hammer, ZapOff, PlusCircle, 
  X, Camera, DollarSign, Loader2, Sparkles, Menu,
  Image as ImageIcon, CheckCircle2, AlertCircle, Trash2,
  ChevronRight, ArrowLeft, RefreshCcw
} from 'lucide-react';

/**
 * CONFIGURACIÓN DE SEGURIDAD PARA TOKEN DE IA
 * Se ha optimizado el acceso a variables de entorno para evitar errores de compilación.
 */
const getAuthToken = () => {
  try {
    // Intento de acceso seguro compatible con diversos entornos de compilación
    const env = (import.meta && import.meta.env) ? import.meta.env : {};
    return env.VITE_CORE_TOKEN || "";
  } catch (e) {
    return "";
  }
};

const coreAuthToken = getAuthToken();

const runCoreAudit = async (payload) => {
  if (!coreAuthToken) return "Error: Variable VITE_CORE_TOKEN no configurada en el panel de Vercel.";
  
  const model = "gemini-2.5-flash-preview-09-2025";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${coreAuthToken}`;
  
  const systemPrompt = `Eres el Core Engine de DeepFix OS v1.0. 
  Genera reportes periciales de electromovilidad con formato profesional narrativo.
  ESTRUCTURA DEL INFORME:
  1. TÍTULO PERICIAL EN MAYÚSCULAS.
  2. RESUMEN EJECUTIVO (Párrafo claro sobre el estado del vehículo).
  3. HALLAZGOS TÉCNICOS (Usa viñetas '-' para los puntos críticos).
  4. VEREDICTO LEGAL (Basado en Ley 21.088 de Chile, límite 250W y seguridad de firmware).
  REGLAS: Español profesional de Chile, usa saltos de línea (\n) para separar secciones, no uses LaTeX ni códigos.`;

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
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo sintetizar el informe inteligente.";
  } catch (e) {
    return "Error crítico de comunicación con el núcleo DeepFix.";
  }
};

const MOTOR_DB = [
  { id: 'bosch', name: 'Bosch Performance Line', eff: 0.92, res: 0.12 },
  { id: 'shimano', name: 'Shimano Steps E-Series', eff: 0.90, res: 0.14 },
  { id: 'bafang', name: 'Bafang M-Series (Mid)', eff: 0.85, res: 0.18 },
  { id: 'generic', name: 'Motor Genérico / Kit', eff: 0.80, res: 0.22 }
];

const App = () => {
  const [auth, setAuth] = useState(false);
  const [creds, setCreds] = useState({ user: '', pass: '' });
  const [view, setView] = useState('cert');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Estados Peritaje
  const [v, setV] = useState(48);
  const [a, setA] = useState(15);
  const [motor, setMotor] = useState(MOTOR_DB[2]);
  const [locked, setLocked] = useState(true);
  const [loadingIA, setLoadingIA] = useState(false);
  const [report, setReport] = useState("");

  // Estados Pasaporte y Cámara
  const [logs, setLogs] = useState([
    { id: 1, date: '2024-03-10', type: 'Mecánica', detail: 'Ajuste inicial de frenos y lubricación completa.', tech: 'Taller Central', cost: 45000, photo: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400' }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [camActive, setCamActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [newLog, setNewLog] = useState({ type: 'Mecánica', detail: '', tech: '', cost: '' });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Cálculos de Potencia Estimada
  const pReal = Math.round(((v * a) - (Math.pow(a, 2) * motor.res)) * motor.eff);
  const compliant = pReal <= 250 && locked;
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
    } catch { 
      setCamActive(false); 
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      canvasRef.current.getContext('2d').drawImage(videoRef.current, 0, 0);
      setCapturedPhoto(canvasRef.current.toDataURL('image/jpeg'));
      if (videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
      setCamActive(false);
    }
  };

  const stopCam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setCamActive(false);
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-900">
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-12 shadow-2xl text-center animate-in zoom-in duration-300">
          <div className="bg-cyan-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-900 shadow-xl shadow-cyan-500/20"><Zap size={40} fill="currentColor" /></div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">DeepFix OS 1</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 text-center">Control Pericial de Activos</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Usuario" className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-center outline-none focus:border-cyan-500 transition-all" onChange={e => setCreds({...creds, user: e.target.value})} />
            <input type="password" placeholder="Clave" className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-center outline-none focus:border-cyan-500 transition-all" onChange={e => setCreds({...creds, pass: e.target.value})} />
            <button className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-black/20">Acceder al Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-0 lg:relative z-50 lg:z-20 w-full lg:w-80 bg-slate-900 text-white p-8 flex flex-col gap-8 shadow-2xl transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4 text-cyan-400 font-black italic text-3xl tracking-tighter uppercase leading-none"><Zap size={32} fill="currentColor"/> DeepFix</div>
           <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500"><X /></button>
        </div>
        <nav className="flex flex-col gap-3 mt-8">
          <button onClick={() => { setView('cert'); setIsSidebarOpen(false); }} className={`p-5 rounded-2xl font-bold text-xs uppercase flex items-center gap-4 transition-all ${view === 'cert' ? 'bg-cyan-600 shadow-xl shadow-cyan-900/40' : 'hover:bg-slate-800 text-slate-500'}`}><Activity size={20}/> Peritaje Técnico</button>
          <button onClick={() => { setView('life'); setIsSidebarOpen(false); }} className={`p-5 rounded-2xl font-bold text-xs uppercase flex items-center gap-4 transition-all ${view === 'life' ? 'bg-cyan-600 shadow-xl shadow-cyan-900/40' : 'hover:bg-slate-800 text-slate-500'}`}><History size={20}/> Pasaporte Digital</button>
        </nav>
        <button onClick={() => setAuth(false)} className="mt-auto p-5 bg-rose-500/10 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Cerrar Sesión</button>
      </aside>

      <main className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto bg-slate-50 relative text-left">
        {/* Mobile Header */}
        <header className="lg:hidden flex justify-between items-center mb-8 bg-slate-900 p-4 rounded-2xl text-white shadow-lg">
           <div className="flex items-center gap-2"><Zap className="text-cyan-400" size={24} /><span className="font-black italic text-sm uppercase">DeepFix OS 1</span></div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2"><Menu /></button>
        </header>

        {view === 'cert' ? (
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
            <h2 className="text-4xl font-black uppercase tracking-tighter border-b-4 border-cyan-500 inline-block pb-1">Certificación</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
              <div className="lg:col-span-2 space-y-10">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-3 uppercase leading-none"><Barcode className="text-cyan-600" size={20}/> Identidad</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2 text-left"><label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest block">ID QR</label><input type="text" value="QR-DFX-2201" className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-3xl font-black text-center outline-none" readOnly /></div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest block">Marca de Motor</label>
                        <select onChange={(e) => setMotor(MOTOR_DB.find(m => m.id === e.target.value))} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-3xl font-bold outline-none cursor-pointer appearance-none text-center">
                          {MOTOR_DB.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                     </div>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                  <div className="space-y-8">
                    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Inyección Real</h4>
                    <div className="space-y-6 text-left">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase"><span>Voltaje</span><span className="text-cyan-600 font-black">{v}V</span></div>
                        <input type="range" min="24" max="72" value={v} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-cyan-600" onChange={e => setV(Number(e.target.value))} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase"><span>Amperaje Peak</span><span className="text-cyan-600 font-black">{a}A</span></div>
                        <input type="range" min="5" max="45" value={a} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-cyan-600" onChange={e => setA(Number(e.target.value))} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Bloqueo Firmware</h4>
                    <button onClick={() => setLocked(!locked)} className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase flex items-center justify-center gap-3 transition-all shadow-lg ${locked ? 'bg-cyan-500 text-slate-900 shadow-cyan-500/20' : 'bg-slate-300 text-slate-500'}`}>
                      <Lock size={20}/> {locked ? 'LOCKED' : 'OPEN ACCESS'}
                    </button>
                    <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-tight">Estado mandatorio Ley 21.088.</p>
                  </div>
                </div>

                {/* REPORTE IA */}
                <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden text-left">
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Sparkles size={160} /></div>
                   <div className="flex justify-between items-center relative z-10 mb-8">
                      <h3 className="text-xl font-black uppercase flex items-center gap-4 tracking-tighter text-white leading-none"><Sparkles className="text-cyan-400" size={28} /> Veredicto DeepFix IA</h3>
                      <button onClick={async () => { setLoadingIA(true); const r = await runCoreAudit(`Activo DFX-2201. Potencia Rueda: ${pReal}W. Cumple Ley Chile: ${compliant}. Motor: ${motor.name}. Bloqueado: ${locked}`); setReport(r); setLoadingIA(false); }} className="px-10 py-3 bg-cyan-500 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:bg-cyan-400 disabled:opacity-50" disabled={loadingIA}>{loadingIA ? <Loader2 className="animate-spin" size={20}/> : 'Generar Reporte'}</button>
                   </div>
                   <div className="bg-slate-800/60 p-8 rounded-[2rem] min-h-[180px] text-sm leading-relaxed whitespace-pre-line text-slate-300 font-light border border-slate-700 shadow-inner">
                      {report || "Esperando parámetros técnicos de inyección para iniciar el procesamiento narrativo del informe pericial..."}
                   </div>
                </div>
              </div>

              <aside className="space-y-10 flex flex-col items-center">
                <div className={`w-full p-14 rounded-[4rem] text-white flex flex-col items-center justify-center shadow-2xl transition-all duration-700 ${compliant ? 'bg-emerald-600 shadow-emerald-900/30' : 'bg-rose-600 shadow-rose-900/30'}`}>
                   <p className="text-[11px] font-black uppercase opacity-70 mb-6 tracking-widest text-center">Potencia Real</p>
                   <div className="flex items-baseline gap-2 text-center"><span className="text-9xl font-black tracking-tighter leading-none">{pReal}</span><span className="text-3xl font-bold uppercase">W</span></div>
                   <div className="mt-12 w-full py-4 bg-black/20 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest text-center">{compliant ? 'CUMPLE LEY 250W' : 'RECHAZADO'}</div>
                </div>
                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 w-full flex flex-col items-center gap-12 shadow-sm text-center">
                   <div className="p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 shadow-inner">
                      <QrCode size={160} className={compliant ? 'text-slate-900' : 'text-slate-100 opacity-30'} />
                   </div>
                   <button disabled={!compliant} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-10">Emitir Certificado Digital</button>
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 text-left">
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-200 pb-12 text-left">
              <div className="text-left w-full">
                <h2 className="text-4xl font-black uppercase tracking-tighter block text-left">Pasaporte Digital</h2>
                <p className="text-slate-500 text-base italic block text-left">Trazabilidad inmutable con evidencia fotográfica del activo peritado.</p>
              </div>
              <button onClick={() => { setShowModal(true); setCapturedPhoto(null); }} className="px-12 py-6 bg-cyan-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-4 shadow-2xl hover:bg-cyan-700 transition-all shrink-0"><PlusCircle size={24}/> Registrar Obra</button>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
               <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white h-fit text-center space-y-6 shadow-2xl flex flex-col items-center">
                  <DollarSign size={40} className="text-cyan-400 bg-slate-800 p-2 rounded-full shadow-xl" />
                  <div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block text-center uppercase">Inversión Total</p>
                    <p className="text-5xl font-black italic tracking-tighter block text-white text-center tracking-tighter leading-none">${totalInv.toLocaleString()}</p>
                  </div>
               </div>
               
               <div className="lg:col-span-3 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-12">
                  {logs.slice().reverse().map(l => (
                    <div key={l.id} className="flex flex-col sm:flex-row gap-10 border-b border-slate-50 pb-12 last:border-0 last:pb-0 text-left">
                       <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-lg border-4 border-white ${l.type === 'Eléctrica' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{l.type === 'Eléctrica' ? <ZapOff size={28}/> : <Hammer size={28}/>}</div>
                       <div className="flex-1 space-y-6 text-left">
                          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 text-left">
                             <div className="text-left w-full">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left block">{l.date} • Resp: {l.tech}</p>
                                <h4 className="font-black text-2xl text-slate-800 uppercase tracking-tighter text-left block">{l.type}</h4>
                             </div>
                             <div className="bg-slate-900 text-white px-6 py-2 rounded-[1.2rem] font-mono text-lg font-black shadow-lg shadow-black/10 shrink-0">${l.cost.toLocaleString()}</div>
                          </div>
                          <div className="flex flex-col md:flex-row gap-8 items-center lg:items-start text-left">
                             {l.photo && <img src={l.photo} className="w-48 h-48 rounded-[2.5rem] object-cover shadow-xl border-4 border-white shrink-0 transition-transform hover:scale-105 duration-500" alt="Evidencia" />}
                             <p className="text-base italic text-slate-600 bg-slate-50 p-10 rounded-[2.5rem] flex-1 leading-relaxed border border-slate-100 relative shadow-inner text-left block">
                                <span className="absolute -top-3 left-10 px-4 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-300 uppercase tracking-widest">Glosa Pericial</span>
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

        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 relative max-h-[90vh] overflow-y-auto text-left">
              <button onClick={() => { stopCam(); setShowModal(false); }} className="absolute top-10 right-10 p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-800 transition-colors shadow-sm"><X size={28}/></button>
              <h3 className="text-3xl font-black uppercase mb-12 tracking-tighter text-slate-900 block text-left">Nueva Intervención</h3>
              <div className="w-full space-y-10">
                <div className="space-y-4 text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 block uppercase">Evidencia Visual</p>
                  {camActive ? (
                    <div className="relative rounded-[3rem] overflow-hidden bg-black aspect-video border-4 border-cyan-500 shadow-2xl animate-in zoom-in duration-500">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <button onClick={takePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-slate-900 p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"><Camera size={32}/></button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6">
                      {capturedPhoto ? (
                         <div className="relative group w-full">
                            <img src={capturedPhoto} className="w-full max-h-64 rounded-[3rem] object-cover shadow-2xl border-4 border-emerald-500 animate-in zoom-in" alt="Prev" />
                            <button onClick={startCam} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] flex items-center justify-center text-white font-black uppercase text-xs">Capturar de nuevo</button>
                         </div>
                      ) : (
                        <button onClick={startCam} className="w-full py-12 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] text-slate-300 flex flex-col items-center gap-4 hover:bg-cyan-50 hover:text-cyan-600 transition-all group">
                           <Camera size={48} className="group-hover:scale-110 transition-transform" />
                           <span className="font-black text-[11px] uppercase tracking-widest text-center block">Activar Sensor de Captura</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">{['Mecánica', 'Eléctrica'].map(t => (<button key={t} onClick={() => setNewLog({...newLog, type: t})} className={`flex-1 py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${newLog.type === t ? 'bg-slate-900 text-white shadow-xl shadow-black/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{t}</button>))}</div>
                <textarea placeholder="Descripción técnica detallada..." className="w-full p-8 bg-slate-50 border-2 border-slate-50 rounded-[2.5rem] text-base min-h-[140px] outline-none focus:border-cyan-500 transition-all shadow-inner text-center" onChange={e => setNewLog({...newLog, detail: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2 text-left"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 text-left block uppercase">Costo CLP</label><input type="number" placeholder="0" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-center text-xl shadow-inner outline-none focus:border-cyan-500" onChange={e => setNewLog({...newLog, cost: e.target.value})} /></div>
                  <div className="space-y-2 text-left"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 text-left block uppercase">Perito Responsable</label><input type="text" placeholder="Nombre" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-center shadow-inner outline-none focus:border-cyan-500" onChange={e => setNewLog({...newLog, tech: e.target.value})} /></div>
                </div>
                
                <button onClick={() => { setLogs([...logs, { ...newLog, id: Date.now(), date: new Date().toISOString().split('T')[0], photo: capturedPhoto }]); stopCam(); setShowModal(false); setCapturedPhoto(null); setNewLog({ type: 'Mecánica', detail: '', tech: '', cost: '' }); }} className="w-full py-7 bg-cyan-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-cyan-700 active:scale-95 transition-all shadow-cyan-600/30">Confirmar Registro</button>
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
