import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, ClipboardList, Bike, BarChart2, PlusCircle, User, 
  Clock, Camera, CheckCircle2, AlertCircle, UserPlus, FileEdit,
  DollarSign, Search, ChevronRight, X, History, Calendar, Filter, 
  Download, Activity, Zap, AlertTriangle, Settings2, ShieldCheck, 
  Briefcase, Wrench, ThumbsUp, Paperclip, File, Trash2, UploadCloud,
  Sparkles, Loader2
} from 'lucide-react';

// --- Configuration ---
// Note: For Vercel deployment, you can use: const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
// To prevent compilation errors in the preview environment, we use an empty string here.
const apiKey = ""; 

const ROLES = {
  AUTORIZADOR: { id: 'AUTORIZADOR', label: 'Autorizador', icon: ShieldCheck, color: 'text-purple-400' },
  ASIGNADOR: { id: 'ASIGNADOR', label: 'Asignador', icon: Briefcase, color: 'text-orange-400' },
  EJECUTOR: { id: 'EJECUTOR', label: 'Ejecutor', icon: Wrench, color: 'text-blue-400' }
};

const UMBRAL_APROBACION = 80000;

export default function App() {
  const [view, setView] = useState('dashboard');
  const [userRole, setUserRole] = useState(ROLES.AUTORIZADOR.id);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);

  const [vehicles, setVehicles] = useState([
    { id: 'V1', type: 'Bicicleta Eléctrica', model: 'EcoRide 500', plate: 'BE-2024-01' },
    { id: 'V2', type: 'Tricicleta Eléctrica', model: 'CargoPlus 3000', plate: 'TE-2024-99' },
  ]);

  const [orders, setOrders] = useState([
    {
      id: 'OT-1001',
      vehicleId: 'V1',
      status: 'Cerrada',
      category: 'Correctivo',
      problemDescription: 'Falla en el sistema de frenado.',
      assignedTech: 'Juan Técnico',
      workDetail: 'Se reemplazaron las pastillas de freno.',
      cost: 45000,
      isAuthorized: true,
      attachments: [],
      dateAction: '2024-12-20',
      logs: [{ action: 'Apertura', user: 'SISTEMA', date: '2024-12-20' }]
    }
  ]);

  const stats = useMemo(() => {
    const closed = orders.filter(o => o.status === 'Cerrada');
    const spent = closed.reduce((acc, curr) => acc + (curr.cost || 0), 0);
    const maintenanceCount = orders.filter(o => o.status !== 'Cerrada').length;
    const availability = vehicles.length > 0 
      ? (((vehicles.length - maintenanceCount) / vehicles.length) * 100).toFixed(0)
      : 0;
    return { availability, spent, pending: orders.filter(o => o.status === 'Pendiente Autorización').length };
  }, [orders, vehicles]);

  const handleUpdateOT = (id, updates, logAction) => {
    setOrders(prev => prev.map(o => o.id === id ? {
      ...o, ...updates, 
      logs: [...(o.logs || []), { action: logAction, user: userRole, date: new Date().toLocaleString() }]
    } : o));
    setSelectedOrder(null);
  };

  const handleFileUpload = (id, fileName) => {
    setOrders(prev => prev.map(o => o.id === id ? {
      ...o, 
      attachments: [...(o.attachments || []), { id: Date.now(), name: fileName, size: '2.5MB' }],
      logs: [...(o.logs || []), { action: `Archivo subido: ${fileName}`, user: userRole, date: new Date().toLocaleString() }]
    } : o));
  };

  const generateAiAnalysis = async (problem, currentDetail) => {
    if (!apiKey) {
      setAiError("API Key no detectada. Configure VITE_GEMINI_API_KEY en Vercel.");
      return;
    }
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Como experto en mantenimiento de vehículos eléctricos, genera un informe técnico detallado basado en el siguiente problema: "${problem}". El técnico anotó lo siguiente: "${currentDetail}". Redacta una descripción profesional de los trabajos ejecutados para un sistema de auditoría.` }] }]
        })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const textarea = document.getElementById('workDetailInput');
        if (textarea) textarea.value = text;
      }
    } catch (err) {
      setAiError("Error al generar el análisis técnico con IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const perms = {
    isAutorizador: userRole === ROLES.AUTORIZADOR.id,
    canManage: userRole === ROLES.AUTORIZADOR.id || userRole === ROLES.ASIGNADOR.id,
    canExecute: userRole === ROLES.AUTORIZADOR.id || userRole === ROLES.EJECUTOR.id
  };

  const handleAddVehicle = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    setVehicles([...vehicles, { 
      id: `V${Date.now()}`, 
      type: data.get('type'), 
      model: data.get('model'), 
      plate: data.get('plate').toUpperCase() 
    }]);
    setIsNewVehicleModalOpen(false);
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const newO = {
      id: `OT-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: data.get('vehicleId'),
      status: 'Abierta',
      category: data.get('category'),
      problemDescription: data.get('problemDescription'),
      assignedTech: null,
      workDetail: '',
      cost: 0,
      isAuthorized: false,
      attachments: [],
      dateAction: new Date().toISOString().split('T')[0],
      logs: [{ action: 'Apertura del caso', user: userRole, date: new Date().toLocaleString() }]
    };
    setOrders([newO, ...orders]);
    setIsNewOrderModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-800 bg-slate-900/40 p-8 flex flex-col">
        <div className="flex items-center space-x-4 mb-12">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-900/40">
            <Settings2 className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase text-left">deepfix<br/><span className="text-[10px] text-blue-500 font-bold tracking-[0.3em]">os1 - flota</span></h1>
        </div>
        
        <nav className="space-y-3 flex-1 text-left">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Dashboard</span>
          </button>
          <button onClick={() => setView('orders')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${view === 'orders' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
            <ClipboardList size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Órdenes</span>
          </button>
        </nav>

        <div className="mt-auto space-y-4 pt-10 border-t border-slate-800">
          <p className="text-[9px] font-black text-slate-600 uppercase text-center tracking-widest">Perfil Activo</p>
          <div className="grid grid-cols-1 gap-2">
            {Object.values(ROLES).map(role => (
              <button key={role.id} onClick={() => { setUserRole(role.id); setSelectedOrder(null); }} className={`flex items-center space-x-3 p-3 rounded-2xl border transition-all ${userRole === role.id ? 'bg-slate-800 border-blue-500 shadow-lg' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                <role.icon size={16} className={role.color} />
                <span className="text-[10px] font-bold uppercase text-white">{role.label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-16 custom-scrollbar text-left">
        {view === 'dashboard' ? (
          <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none text-left">Resumen de Flota</h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2 text-left">Monitor de Gestión deepfix-os1</p>
              </div>
              <div className="flex gap-4">
                 {perms.canManage && <button onClick={() => setIsNewVehicleModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase border border-slate-700">Nuevo Vehículo</button>}
                 {perms.canManage && <button onClick={() => setIsNewOrderModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-xl">Apertura OT</button>}
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-xl text-center">
                <Activity className="text-blue-400 mx-auto mb-6" size={28} />
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Disponibilidad</h3>
                <p className="text-6xl font-black text-white">{stats.availability}%</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-xl text-center">
                <DollarSign className="text-emerald-400 mx-auto mb-6" size={28} />
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Gasto Total</h3>
                <p className="text-4xl font-black text-white">${stats.spent.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-xl text-center">
                <AlertCircle className="text-orange-400 mx-auto mb-6" size={28} />
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Pendientes OK</h3>
                <p className="text-6xl font-black text-white">{stats.pending}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-in slide-in-from-bottom-6 duration-700 max-w-7xl mx-auto pb-20">
            <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-10 text-left">Intervenciones</h2>
              <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-4 custom-scrollbar text-left">
                {orders.map(o => (
                  <div key={o.id} onClick={() => setSelectedOrder(o)} className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer relative ${selectedOrder?.id === o.id ? 'border-blue-500 bg-blue-600/5 ring-4 ring-blue-500/5 shadow-2xl' : 'border-slate-800 bg-slate-900 shadow-lg'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-left">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{o.id}</span>
                        <h4 className="font-black text-xl leading-none mt-1">{vehicles.find(v => v.id === o.vehicleId)?.model || 'Desconocido'}</h4>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${o.status.includes('Pendiente') ? 'border-purple-500 text-purple-400' : 'border-slate-700 text-slate-400'}`}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-12 sticky top-0 h-fit shadow-2xl min-h-[600px] flex flex-col text-left">
              {selectedOrder ? (
                <div className="space-y-10 animate-in slide-in-from-right-8 duration-500 text-left">
                  <header className="flex justify-between items-start border-b border-slate-800 pb-10">
                    <div className="text-left">
                      <h3 className="text-4xl font-black text-white tracking-tighter leading-none">{selectedOrder.id}</h3>
                      <p className="text-slate-500 text-[10px] uppercase font-black mt-3">Sello Temporal: {selectedOrder.logs[0].date}</p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-3xl text-center border border-slate-700 min-w-[130px] shadow-inner">
                      <p className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest leading-none">Costo</p>
                      <p className="text-2xl font-black text-white leading-none">${(selectedOrder.cost || 0).toLocaleString()}</p>
                    </div>
                  </header>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center leading-none"><Paperclip size={14} className="mr-2" /> Evidencia y Adjuntos</label>
                    <div className="grid grid-cols-1 gap-2">
                      {(selectedOrder.attachments || []).map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                          <div className="flex items-center space-x-3 text-xs font-bold text-slate-200 truncate">
                            <File size={16} className="text-blue-400" /> <span>{f.name}</span>
                          </div>
                        </div>
                      ))}
                      {selectedOrder.status !== 'Cerrada' && perms.canExecute && (
                        <label className="cursor-pointer border-2 border-dashed border-slate-800 p-8 rounded-3xl flex flex-col items-center hover:bg-blue-500/5 transition-all text-slate-500 hover:text-blue-400">
                          <UploadCloud size={24} className="mb-2" />
                          <span className="text-[9px] font-black uppercase">Subir Documento</span>
                          <input type="file" className="hidden" onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload(selectedOrder.id, e.target.files[0].name);
                          }} />
                        </label>
                      )}
                    </div>
                  </div>

                  {selectedOrder.status === 'Asignada' && perms.canExecute && (
                    <div className="pt-10 border-t border-slate-800 space-y-8 text-left">
                       <div className="flex justify-between items-center text-left">
                          <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] flex items-center leading-none"><Wrench size={18} className="mr-3"/> Análisis Técnico de Ejecución</label>
                          <button 
                            type="button" 
                            onClick={() => generateAiAnalysis(selectedOrder.problemDescription, document.getElementById('workDetailInput').value)} 
                            disabled={isAnalyzing} 
                            className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border border-blue-600/30 flex items-center transition-all disabled:opacity-30"
                          >
                             {isAnalyzing ? <Loader2 size={12} className="mr-2 animate-spin"/> : <Sparkles size={12} className="mr-2"/>} IA: Redactar Informe
                          </button>
                       </div>
                       <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const cost = parseFloat(formData.get('cost')) || 0;
                          const updates = { workDetail: formData.get('work'), cost };
                          if (cost > UMBRAL_APROBACION && !selectedOrder.isAuthorized) {
                            handleUpdateOT(selectedOrder.id, { ...updates, status: 'Pendiente Autorización' }, 'Solicitud de autorización por costo');
                          } else {
                            handleUpdateOT(selectedOrder.id, { ...updates, status: 'Cerrada' }, 'Trabajo finalizado y auditado');
                          }
                       }} className="space-y-6">
                          <textarea id="workDetailInput" name="work" required rows="4" className="w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 text-sm outline-none font-medium leading-relaxed text-white focus:ring-2 focus:ring-blue-500 shadow-inner" placeholder="Escriba aquí los detalles técnicos..."></textarea>
                          {aiError && <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest">{aiError}</p>}
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 text-left">
                                <label className="text-[9px] font-black text-slate-600 uppercase ml-4 tracking-widest">Costo Trabajo ($)</label>
                                <input name="cost" required type="number" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm font-black text-white shadow-inner outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                            </div>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-[10px] uppercase text-white shadow-xl transition-all self-end h-[52px]">FINALIZAR OT</button>
                          </div>
                       </form>
                    </div>
                  )}

                  {selectedOrder.status === 'Pendiente Autorización' && perms.isAutorizador && (
                    <div className="pt-10 border-t border-slate-800 text-center space-y-6">
                       <AlertTriangle size={48} className="text-purple-400 mx-auto animate-pulse" />
                       <p className="text-xs text-slate-400 italic">Monto de ${selectedOrder.cost.toLocaleString()} requiere validación oficial para el cierre.</p>
                       <button onClick={() => handleUpdateOT(selectedOrder.id, { status: 'Asignada', isAuthorized: true }, 'Autorización de costo concedida')} className="w-full bg-purple-600 hover:bg-purple-500 py-6 rounded-[2rem] font-black text-xs uppercase text-white shadow-xl flex items-center justify-center transition-all">
                          <ThumbsUp size={20} className="mr-3"/> DAR VISTO BUENO (OK)
                       </button>
                    </div>
                  )}

                  <div className="pt-12 border-t border-slate-800/50 text-left">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-10 flex items-center leading-none italic font-bold tracking-widest text-left"><History size={16} className="mr-3" /> historial de auditoría</h4>
                    <div className="space-y-10 relative">
                      {(selectedOrder.logs || []).map((log, idx) => (
                        <div key={idx} className="flex gap-8 relative text-left">
                          <div className={`w-4 h-4 rounded-full mt-1.5 shrink-0 z-10 border-[4px] border-slate-950 ${idx === selectedOrder.logs.length - 1 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]' : 'bg-slate-700 opacity-50'}`}></div>
                          <div>
                            <p className="text-xs font-black text-slate-200 uppercase tracking-widest leading-none mb-2 text-left">{log.action}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic opacity-80 leading-none text-left">{log.user} — {log.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-60">
                  <Activity size={100} className="mb-8" />
                  <p className="font-black text-2xl uppercase tracking-[0.5em]">DEEPFIX OS1</p>
                  <p className="text-sm mt-4 font-bold tracking-widest uppercase opacity-60">Seleccione una intervención</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {isNewVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[4rem] p-16 animate-in zoom-in-95 duration-500 shadow-2xl">
            <h3 className="text-3xl font-black mb-10 text-white uppercase tracking-tighter text-center leading-none">Registrar Activo</h3>
            <form onSubmit={handleAddVehicle} className="space-y-8 text-left">
              <select name="type" className="w-full bg-slate-800 border border-slate-700 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-inner">
                <option value="Bicicleta Eléctrica">Bicicleta Eléctrica</option>
                <option value="Tricicleta Eléctrica">Tricicleta Eléctrica</option>
              </select>
              <input name="model" required placeholder="Modelo (Ej: EcoRide XT)" className="w-full bg-slate-800 border border-slate-700 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" />
              <input name="plate" required placeholder="Patente (XXX-000)" className="w-full bg-slate-800 border border-slate-700 rounded-3xl px-8 py-5 text-sm font-mono font-bold text-white outline-none uppercase shadow-inner" />
              <div className="flex gap-4 pt-6 text-center">
                <button type="button" onClick={() => setIsNewVehicleModalOpen(false)} className="flex-1 py-6 rounded-[2rem] font-black text-[11px] bg-slate-800 uppercase text-slate-400 hover:text-white transition-all tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-6 rounded-[2rem] font-black text-[11px] uppercase text-white shadow-2xl tracking-widest transition-all">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-8 text-left">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[4.5rem] p-20 animate-in zoom-in-95 duration-500 shadow-2xl shadow-blue-900/10 text-left">
            <h3 className="text-4xl font-black mb-10 text-white uppercase tracking-tighter text-left leading-none">Apertura OT</h3>
            <form onSubmit={handleCreateOrder} className="space-y-10 text-left">
              <div className="grid grid-cols-2 gap-8 text-left">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Activo</label>
                    <select name="vehicleId" className="w-full bg-slate-800 border border-slate-700 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-inner text-left">
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.model} ({v.plate})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Categoría</label>
                    <select name="category" className="w-full bg-slate-800 border border-slate-700 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-inner text-left">
                      <option value="Correctivo">Correctivo (Falla)</option>
                      <option value="Preventivo">Mantenimiento Programado</option>
                    </select>
                  </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Detalle del Problema</label>
                <textarea name="problemDescription" required rows="4" className="w-full bg-slate-800 border border-slate-700 rounded-[3rem] p-10 text-sm font-medium leading-relaxed text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" placeholder="Descripción técnica inicial..."></textarea>
              </div>
              <div className="flex gap-6 pt-6 text-center">
                <button type="button" onClick={() => setIsNewOrderModalOpen(false)} className="flex-1 py-7 rounded-[2.5rem] font-black text-[11px] bg-slate-800 uppercase text-slate-400 tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-7 rounded-[2.5rem] font-black text-[11px] uppercase text-white shadow-2xl tracking-widest">Iniciar Orden</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
