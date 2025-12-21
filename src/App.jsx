import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Activity, Zap, ShieldCheck, QrCode, Lock, 
  Barcode, History, Hammer, ZapOff, PlusCircle, 
  X, Camera, DollarSign, Loader2, Sparkles, Menu,
  Fingerprint, ClipboardList, Battery, AlertTriangle,
  ChevronDown, RefreshCcw, CheckCircle2
} from 'lucide-react';

/**
 * DEEPFIX INTELLIGENCE - GESTIÓN DE TOKEN
 * Se obtiene la API Key desde las Environment Variables de Vercel.
 */
const getSafeToken = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.VITE_CORE_TOKEN || "";
    }
    return "";
  } catch (e) { return ""; }
};

const coreAuthToken = getSafeToken();

/**
 * MOTOR DE IA - AUDITORÍA NARRATIVA
 */
const runCoreAudit = async (payload) => {
  if (!coreAuthToken) return "Error: Token VITE_CORE_TOKEN no configurado en Vercel.";
  
  const model = "gemini-2.5-flash-preview-09-2025";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${coreAuthToken}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: payload }] }],
        systemInstruction: { parts: [{ text: "Eres DeepFix OS Core. Genera reportes periciales técnicos de electromovilidad en español profesional. Analiza cumplimiento de Ley 250W." }] }
      })
    });
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo sintetizar el informe.";
  } catch (e) {
    return "Error de comunicación con el nodo central de DeepFix.";
  }
};

const MOTOR_DB = [
  { id: 'bosch', name: 'Bosch Performance Line', eff: 0.92, res: 0.12 },
  { id: 'shimano', name: 'Shimano Steps E-Series', eff: 0.90, res: 0.14 },
  { id: 'bafang', name: 'Bafang M-Series (Mid)', eff: 0.85, res: 0.18 },
  { id: 'mxus', name: 'MXUS Hub Motor', eff: 0.84, res: 0.20 },
  { id: 'generic', name: 'Genérico / Otros', eff: 0.80, res: 0.25 },
];

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ user: '', pass: '' });
  const [authError, setAuthError] = useState("");
  const [view, setView] = useState('diagnostic');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- ESTADOS TÉCNICOS ---
  const [existingCode, setExistingCode] = useState("QR-DFX-2201");
  const [serialNumber, setSerialNumber] = useState("SN-2025-X84");
  const [vNominal, setVNominal] = useState(48);
  const [iMax, setIMax] = useState(15);
  const [selectedBrand, setSelectedBrand] = useState(MOTOR_DB[2]);
  const [firmwareLocked, setFirmwareLocked] = useState(true);
  
  // Bitácora
  const [logs, setLogs] = useState([
    { id: 1, date: '2024-03-10', type: 'Mecánica', detail: 'Ajuste de frenos y lubricación.', tech: 'Taller Central', cost: 45000 },
    { id: 2, date: '2024-05-20', type: 'Eléctrica', detail: 'Test de celdas y balanceo.', tech: 'DeepFix LAB', cost: 85000 }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [reportResult, setReportResult] = useState("");
  const [showLogForm, setShowLogForm] = useState(false);
  const [newLog, setNewLog] = useState({ type: 'Mecánica', detail: '', tech: '', cost: '' });

  // Cálculos de Potencia
  const pOut = Math.round(((vNominal * iMax) - (Math.pow(iMax, 2) * selectedBrand.res)) * selectedBrand.eff);
  const isCompliant = pOut <= 250 && firmwareLocked;
  const totalInvestment = logs.reduce((acc, curr) => acc + Number(curr.cost), 0);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.user === 'pruebacorreo' && loginData.pass === 'pruebacorreo') {
      setIsAuthenticated(true);
      setAuthError("");
    } else { 
      setAuthError("Credenciales incorrectas."); 
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl text-center animate-in zoom-in duration-300">
          <div className="bg-cyan-500 p-6 rounded-[2rem] inline-block mb-8 text-slate-900 shadow-xl"><Zap size={48} fill="currentColor" /></div>
          <h2 className="text-4xl font-black italic text-slate-900 uppercase tracking-tighter">DeepFix <span className="text-cyan-600">OS 1</span></h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2 mb-10">Control de Activos Técnicos</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Usuario" className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-3xl text-center font-bold outline-none focus:border-cyan-500 transition-all" onChange={e => setLoginData({...loginData, user: e.target.value})} required />
            <input type="password" placeholder="Contraseña" className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-3xl text-center font-bold outline-none focus:border-cyan-500 transition-all" onChange={e => setLoginData({...loginData, pass: e.target.value})} required />
            {authError && <p className="text-rose-500 text-[10px] font-black uppercase">{authError}</p>}
            <button className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-xl">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-0 lg:relative z-50 lg:z-20 w-full lg:w-80 bg-slate-900 text-white p-8 flex flex-col gap-8 shadow-2xl transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-cyan-400 font-black italic text-3xl uppercase tracking-tighter">
            <Zap size={36} fill="currentColor" /> DeepFix
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2"><X /></button>
        </div>
        <nav className="flex flex-col gap-3 mt-6 text-left">
          <button onClick={() => { setView('diagnostic'); setIsSidebarOpen(false); }} className={`p-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest flex items-center gap-4 transition-all ${view === 'diagnostic' ? 'bg-cyan-600 text-white shadow-xl shadow-cyan-900/40' : 'hover:bg-slate-800 text-slate-500'}`}><Activity size={20}/> Peritaje Técnico</button>
          <button onClick={() => { setView('lifecycle'); setIsSidebarOpen(false); }} className={`p-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest flex items-center gap-4 transition-all ${view === 'lifecycle' ? 'bg-cyan-600 text-white shadow-xl shadow-cyan-900/40' : 'hover:bg-slate-800 text-slate-500'}`}><History size={20}/> Pasaporte Digital</button>
        </nav>
        <button onClick={() => setIsAuthenticated(false)} className="mt-auto p-5 bg-rose-500/10 text-rose-500 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-rose-500 hover:text-white transition-all">Cerrar Sesión</button>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto text-left relative">
        <header className="lg:hidden flex justify-between items-center mb-8 bg-slate-900 p-4 rounded-[1.5rem] text-white">
          <div className="flex items-center gap-2"><Zap className="text-cyan-400" size={24} /><span className="font-black italic uppercase text-sm">DeepFix OS 1</span></div>
          <button onClick={() => setIsSidebarOpen(true)}><Menu /></button>
        </header>

        {view === 'diagnostic' && (
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
            <h2 className="text-4xl font-black uppercase text-slate-900 tracking-tighter border-b-4 border-cyan-500 inline-block pb-2">Certificación Técnica</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10 text-left">
                {/* Identidad */}
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-3"><Barcode className="text-cyan-600" size={20} /> Identidad del Vehículo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">ID QR Taller</label><input type="text" value={existingCode} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-3xl font-black text-center outline-none focus:border-cyan-500" onChange={e => setExistingCode(e.target.value)} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Serial Chasis</label><input type="text" value={serialNumber} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-3xl font-black text-center outline-none focus:border-cyan-500" onChange={e => setSerialNumber(e.target.value)} /></div>
                  </div>
                </div>

                {/* Parámetros Eléctricos */}
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                  <div className="space-y-8">
                    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Inyección Eléctrica</h4>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold uppercase"><span>Voltaje</span><span className="text-cyan-600 font-black">{vNominal}V</span></div>
                        <input type="range" min="24" max="72" value={vNominal} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-cyan-600" onChange={e => setVNominal(Number(e.target.value))} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold uppercase"><span>Amperaje</span><span className="text-cyan-600 font-black">{iMax}A</span></div>
                        <input type="range" min="5" max="45" value={iMax} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-cyan-600" onChange={e => setIMax(Number(e.target.value))} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Seguridad</h4>
                    <button onClick={() => setFirmwareLocked(!firmwareLocked)} className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase flex items-center justify-center gap-3 transition-all shadow-lg ${firmwareLocked ? 'bg-cyan-500 text-slate-900 shadow-cyan-500/30' : 'bg-slate-300 text-slate-500'}`}>
                      <Lock size={20}/> {firmwareLocked ? 'LOCKED' : 'OPEN'}
                    </button>
                    <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-tight">Requerido para certificación legal.</p>
                  </div>
                </div>

                {/* IA Audit Report */}
                <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden text-left">
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Sparkles size={160} /></div>
                   <div className="flex justify-between items-center relative z-10 mb-8">
                      <h3 className="text-xl font-black uppercase flex items-center gap-4 tracking-tighter text-white"><Sparkles className="text-cyan-400" size={28} /> Veredicto DeepFix IA</h3>
                      <button onClick={async () => { setIsProcessing(true); const r = await runCoreAudit(`Potencia: ${pOut}W, Cumple: ${isCompliant}, Lock: ${firmwareLocked}`); setReportResult(r); setIsProcessing(false); }} className="px-10 py-3 bg-cyan-500 text-slate-900 rounded-2xl font-black text-xs uppercase shadow-xl transition-all hover:bg-cyan-400 active:scale-95 disabled:opacity-50" disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin" size={20}/> : 'Generar Reporte'}</button>
                   </div>
                   <div className="bg-slate-800/60 p-8 rounded-[2rem] border border-slate-700 min-h-[140px] text-sm leading-relaxed text-slate-300 italic">
                      {reportResult || "Procese los parámetros técnicos para obtener un veredicto sintético basado en inteligencia artificial."}
                   </div>
                </div>
              </div>

              {/* Status Board */}
              <aside className="space-y-10 flex flex-col items-center">
                <div className={`w-full p-14 rounded-[4rem] text-white flex flex-col items-center justify-center shadow-2xl transition-all duration-700 ${isCompliant ? 'bg-emerald-600 shadow-emerald-900/30' : 'bg-rose-600 shadow-rose-900/30'}`}>
                  <p className="text-[11px] font-black uppercase opacity-70 mb-6 tracking-[0.2em] text-center">Potencia Estimada</p>
                  <div className="flex items-baseline gap-2"><span className="text-9xl font-black tracking-tighter leading-none">{pOut}</span><span className="text-3xl font-bold uppercase">W</span></div>
                  <div className="mt-12 w-full py-4 bg-black/20 rounded-[1.5rem] font-black text-[12px] uppercase text-center tracking-widest">{isCompliant ? 'APTO PARA USO PÚBLICO' : 'RECHAZADO POR EXCESO'}</div>
                </div>
                
                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 w-full flex flex-col items-center gap-12 shadow-sm text-center">
                  <div className="p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 shadow-inner">
                    <QrCode size={160} className={isCompliant ? 'text-slate-900 opacity-100' : 'text-slate-100 opacity-30'} />
                  </div>
                  <button disabled={!isCompliant} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest disabled:opacity-10 active:scale-95 transition-all shadow-xl shadow-black/10">Emitir Sello Digital</button>
                </div>
              </aside>
            </div>
          </div>
        )}

        {view === 'lifecycle' && (
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 text-left">
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-200 pb-12">
               <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Pasaporte Digital</h2>
                  <p className="text-slate-500 text-base italic leading-relaxed">Trazabilidad inmutable de vida útil e intervenciones técnicas.</p>
               </div>
               <button onClick={() => setShowLogForm(true)} className="px-12 py-6 bg-cyan-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-4 shadow-2xl hover:bg-cyan-700 active:scale-95 transition-all shadow-cyan-600/30"><PlusCircle size={24} /> Registrar Intervención</button>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
               <div className="bg-slate-900 p-12 rounded-[3rem] text-white h-fit text-center space-y-6 shadow-2xl flex flex-col items-center">
                  <DollarSign size={40} className="text-cyan-400 bg-slate-800 p-2 rounded-full shadow-xl" />
                  <div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-center">Inversión Total</p>
                    <p className="text-5xl font-black italic tracking-tighter text-white">${totalInvestment.toLocaleString()}</p>
                  </div>
                  <div className="w-full pt-6 border-t border-slate-800 flex justify-between text-[11px] font-bold uppercase text-slate-500 px-2">
                    <span>Eventos</span>
                    <span className="text-cyan-400">{logs.length}</span>
                  </div>
               </div>
               
               <div className="lg:col-span-3 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-12">
                  {logs.slice().reverse().map(log => (
                    <div key={log.id} className="flex flex-col sm:flex-row gap-10 border-b border-slate-50 pb-12 last:border-0 last:pb-0">
                       <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-lg border-4 border-white ${log.type === 'Eléctrica' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{log.type === 'Eléctrica' ? <ZapOff size={28} /> : <Hammer size={28} />}</div>
                       <div className="flex-1 space-y-6">
                          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                             <div className="text-left">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{log.date} • {log.tech}</p>
                                <h4 className="font-black text-2xl text-slate-800 uppercase tracking-tighter leading-none">{log.type}</h4>
                             </div>
                             <div className="bg-slate-900 text-white px-6 py-2 rounded-[1.2rem] font-mono text-lg font-black shadow-lg">${log.cost.toLocaleString()}</div>
                          </div>
                          <p className="text-base italic text-slate-600 bg-slate-50 p-10 rounded-[2.5rem] flex-1 leading-relaxed border border-slate-100 text-left relative">
                            <span className="absolute -top-3 left-10 px-4 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-300 uppercase tracking-widest">Glosa Pericial</span>
                            "{log.detail}"
                          </p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* Modal Intervención */}
        {showLogForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[4rem] p-12 relative flex flex-col items-center text-center shadow-2xl">
              <button onClick={() => setShowLogForm(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-600 transition-colors p-3 bg-slate-50 rounded-full"><X size={28}/></button>
              <h3 className="text-3xl font-black uppercase mb-12 tracking-tighter text-slate-900">Nueva Intervención</h3>
              <div className="w-full space-y-10">
                <div className="flex gap-4">{['Mecánica', 'Eléctrica'].map(t => (<button key={t} onClick={() => setNewLog({...newLog, type: t})} className={`flex-1 py-6 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all shadow-sm ${newLog.type === t ? 'bg-slate-900 text-white shadow-xl shadow-black/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{t}</button>))}</div>
                <textarea value={newLog.detail} onChange={(e) => setNewLog({...newLog, detail: e.target.value})} className="w-full p-8 bg-slate-50 border-2 border-slate-50 rounded-[2.5rem] text-base min-h-[140px] outline-none focus:border-cyan-500 text-center font-medium shadow-inner transition-all" placeholder="Descripción de los trabajos técnicos realizados..." />
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Costo CLP</label><input type="number" value={newLog.cost} onChange={(e) => setNewLog({...newLog, cost: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-3xl font-black text-center text-xl outline-none focus:border-cyan-500 shadow-inner" placeholder="0" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Perito Responsable</label><input type="text" value={newLog.tech} onChange={(e) => setNewLog({...newLog, tech: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-3xl font-bold text-center outline-none focus:border-cyan-500 shadow-inner" placeholder="Nombre" /></div>
                </div>
                <button onClick={() => { setLogs([...logs, { ...newLog, id: Date.now(), date: new Date().toISOString().split('T')[0] }]); setShowLogForm(false); }} className="w-full py-7 bg-cyan-600 text-white rounded-[2.2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-cyan-700 active:scale-95 transition-all shadow-cyan-600/30">Confirmar en Pasaporte Digital</button>
              </div>
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
