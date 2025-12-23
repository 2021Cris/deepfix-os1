import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, ClipboardList, Bike, BarChart2, PlusCircle, User, 
  Clock, Camera, CheckCircle2, AlertCircle, UserPlus, FileEdit,
  DollarSign, Search, ChevronRight, X, History, Calendar, Filter, 
  Download, Activity, Zap, AlertTriangle, Settings2, ShieldCheck, 
  Briefcase, Wrench, ThumbsUp, Paperclip, File, Trash2, UploadCloud,
  Sparkles, Loader2
} from 'lucide-react';

// --- Configuración de Inteligencia Artificial ---
// REGLA: En este entorno se debe usar una cadena vacía. 
// Para tu despliegue en Vercel, la clave se inyectará automáticamente si configuras el entorno.
const apiKey = ""; 

// --- Roles de Usuario ---
const ROLES = {
  AUTORIZADOR: { id: 'AUTORIZADOR', label: 'Autorizador', icon: ShieldCheck, color: 'text-purple-400' },
  ASIGNADOR: { id: 'ASIGNADOR', label: 'Asignador', icon: Briefcase, color: 'text-orange-400' },
  EJECUTOR: { id: 'EJECUTOR', label: 'Ejecutor', icon: Wrench, color: 'text-blue-400' }
};

const COST_APPROVAL_LIMIT = 80000;

export default function App() {
  const [view, setView] = useState('dashboard');
  const [userRole, setUserRole] = useState(ROLES.AUTORIZADOR.id);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [expenseThreshold, setExpenseThreshold] = useState(250000);
  
  // Estados para la integración con IA
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);

  // --- Datos de Vehículos ---
  const [vehicles, setVehicles] = useState([
    { id: 'V1', type: 'Bicicleta Eléctrica', model: 'EcoRide 500', plate: 'BE-2024-01' },
    { id: 'V2', type: 'Tricicleta Eléctrica', model: 'CargoPlus 3000', plate: 'TE-2024-99' },
    { id: 'V3', type: 'Bicicleta Eléctrica', model: 'Urban S1', plate: 'BE-2024-05' },
  ]);

  // --- Estado de Órdenes de Trabajo ---
  const [orders, setOrders] = useState([
    {
      id: 'OT-8821',
      vehicleId: 'V1',
      status: 'Cerrada',
      category: 'Correctivo',
      problemDescription: 'Falla en el sistema de frenado regenerativo.',
      assignedTech: 'Roberto Técnico',
      workDetail: 'Se reemplazaron las pastillas de freno y se recalibró el sensor de torque.',
      cost: 45000,
      isAuthorized: true,
      attachments: [{ id: 1, name: 'frenos_antes.jpg', size: '1.2MB' }],
      dateAction: '2024-03-10',
      logs: [
        { action: 'Apertura de caso', user: 'ASIGNADOR_LOG', date: '2024-03-10 09:15' },
        { action: 'Asignación de técnico', user: 'ASIGNADOR_LOG', date: '2024-03-10 10:30' },
        { action: 'Cierre de trabajo', user: 'Roberto Técnico', date: '2024-03-12 14:00' }
      ]
    },
    {
      id: 'OT-9042',
      vehicleId: 'V3',
      status: 'Pendiente Autorización',
      category: 'Correctivo',
      problemDescription: 'Motor central presenta recalentamiento constante bajo carga.',
      assignedTech: 'Juan Técnico',
      workDetail: 'Se requiere el reemplazo de la placa controladora del motor.',
      cost: 115000,
      isAuthorized: false,
      attachments: [{ id: 2, name: 'presupuesto_controlador.pdf', size: '890KB' }],
      dateAction: '2024-03-22',
      logs: [
        { action: 'Apertura del caso', user: 'ASIGNADOR_LOG', date: '2024-03-21 15:20' },
        { action: 'Asignación de técnico', user: 'ASIGNADOR_LOG', date: '2024-03-21 16:00' },
        { action: 'Solicitud de autorización por costo excedente', user: 'EJECUTOR_LOG', date: '2024-03-22 10:30' }
      ]
    }
  ]);

  // --- Lógica de IA con Gemini ---
  const generateAiAnalysis = async (problem, partialWork) => {
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const prompt = `Actúa como un ingeniero especialista en micromovilidad eléctrica. Redacta una "Descripción de Trabajos Ejecutados" profesional y detallada basada en el problema reportado: "${problem}" y estas notas breves: "${partialWork}". El resultado debe ser formal para un sistema de auditoría técnica.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) throw new Error();
      
      const result = await response.json();
      const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (aiText) {
        const textarea = document.getElementById('workDetailInput');
        if (textarea) textarea.value = aiText.trim();
      }
    } catch (err) {
      setAiError("No se pudo conectar con el servicio de análisis de IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Permisos y Cálculos Dinámicos ---
  const perms = {
    canModifyConfig: userRole === ROLES.AUTORIZADOR.id,
    canRegisterAsset: userRole === ROLES.AUTORIZADOR.id || userRole === ROLES.ASIGNADOR.id,
    canOpenOT: userRole === ROLES.AUTORIZADOR.id || userRole === ROLES.ASIGNADOR.id,
    canAssignTech: userRole === ROLES.AUTORIZADOR.id || userRole === ROLES.ASIGNADOR.id,
    canExecuteWork: userRole === ROLES.AUTORIZADOR.id || userRole === ROLES.EJECUTOR.id,
    canAuthorizeSpend: userRole === ROLES.AUTORIZADOR.id
  };

  const stats = useMemo(() => {
    const closed = orders.filter(o => o.status === 'Cerrada');
    const totalExpenses = closed.reduce((acc, curr) => acc + curr.cost, 0);
    const availability = (((vehicles.length - orders.filter(o => o.status !== 'Cerrada').length) / vehicles.length) * 100).toFixed(0);
    const vehicleStats = vehicles.map(v => ({
      ...v,
      spent: orders.filter(o => o.vehicleId === v.id && o.status === 'Cerrada').reduce((acc, curr) => acc + curr.cost, 0)
    }));
    return { totalExpenses, availability, vehicleStats, pendingAuth: orders.filter(o => o.status === 'Pendiente Autorización').length };
  }, [orders, vehicles]);

  // --- Handlers ---
  const handleAddVehicle = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    setVehicles([...vehicles, { id: `V${Date.now()}`, type: data.get('type'), model: data.get('model'), plate: data.get('plate').toUpperCase() }]);
    setIsNewVehicleModalOpen(false);
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const newO = {
      id: `OT-${Math.floor(1000 + Math.random() * 8999)}`,
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

  const handleUpdateOT = (id, updates, logText) => {
    setOrders(orders.map(o => o.id === id ? {
      ...o, ...updates, 
      logs: [...o.logs, { action: logText, user: userRole, date: new Date().toLocaleString() }]
    } : o));
    setSelectedOrder(null);
  };

  const handleFileUpload = (id, name) => {
    setOrders(orders.map(o => o.id === id ? {
      ...o, 
      attachments: [...o.attachments, { id: Date.now(), name, size: '2.5MB' }],
      logs: [...o.logs, { action: `Evidencia cargada: ${name}`, user: userRole, date: new Date().toLocaleString() }]
    } : o));
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-800 bg-slate-900/40 p-8 flex flex-col">
        <div className="flex items-center space-x-4 mb-16 px-2">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-900/40">
            <Settings2 className="text-white" size={24} />
          </div>
          <div className="leading-none">
            <h1 className="text-xl font-black tracking-tighter uppercase">Mantención</h1>
            <p className="text-[9px] font-black text-blue-500 tracking-[0.4em] mt-1 uppercase">Activos Flota</p>
          </div>
        </div>
        
        <nav className="space-y-3 flex-1">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-[1.5rem] transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}>
            <LayoutDashboard size={20} /> <span className="text-sm font-bold uppercase tracking-widest text-left">Dashboard</span>
          </button>
          <button onClick={() => setView('orders')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-[1.5rem] transition-all ${view === 'orders' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}>
            <ClipboardList size={20} /> <span className="text-sm font-bold uppercase tracking-widest text-left">Órdenes</span>
          </button>
        </nav>

        <div className="mt-auto space-y-4 pt-10 border-t border-slate-800">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">Perfil Activo</p>
          <div className="grid grid-cols-1 gap-2">
            {Object.values(ROLES).map(role => (
              <button key={role.id} onClick={() => { setUserRole(role.id); setSelectedOrder(null); }} className={`flex items-center space-x-3 p-3.5 rounded-2xl border transition-all ${userRole === role.id ? 'bg-slate-800 border-blue-500 ring-2 ring-blue-500/10 shadow-lg' : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100'}`}>
                <role.icon size={16} className={role.color} />
                <span className="text-[10px] font-bold uppercase text-white">{role.label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-16 custom-scrollbar">
        {view === 'dashboard' ? (
          <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto">
            {perms.canAuthorizeSpend && stats.pendingAuth > 0 && (
              <div className="bg-purple-600/20 border border-purple-500/50 p-6 rounded-[2rem] flex items-center justify-between shadow-2xl">
                <div className="flex items-center space-x-5 text-purple-300">
                  <div className="bg-purple-500/30 p-3 rounded-2xl"><ShieldCheck size={28}/></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-1 text-left">Autorizaciones Críticas</p>
                    <p className="text-sm opacity-80 text-left">Hay {stats.pendingAuth} intervenciones esperando validación de presupuesto.</p>
                  </div>
                </div>
                <button onClick={() => setView('orders')} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all">Gestionar</button>
              </div>
            )}

            <header className="flex justify-between items-end">
              <div className="text-left">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Panel Operativo</h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Gestión de Mantención de Activos</p>
              </div>
              <div className="flex gap-4">
                {perms.canRegisterAsset && <button onClick={() => setIsNewVehicleModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all">Registrar Vehículo</button>}
                {perms.canOpenOT && <button onClick={() => setIsNewOrderModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all">Apertura OT</button>}
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-xl hover:border-blue-500/50 transition-all">
                <Activity className="text-blue-400 mx-auto mb-6" size={28} />
                <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Disponibilidad</h3>
                <p className="text-6xl font-black text-white tracking-tighter">{stats.availability}%</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-xl hover:border-emerald-500/50 transition-all">
                <DollarSign className="text-emerald-400 mx-auto mb-6" size={28} />
                <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Gastos acumulados</h3>
                <p className="text-4xl font-black text-white tracking-tighter">${stats.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-xl hover:border-orange-500/50 transition-all">
                <AlertCircle className="text-orange-400 mx-auto mb-6" size={28} />
                <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">OTs Activas</h3>
                <p className="text-5xl font-black text-white tracking-tighter">{orders.filter(o => o.status !== 'Cerrada').length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-32">
              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
                <h3 className="font-black text-xl mb-8 uppercase flex items-center tracking-tighter text-left"><Zap className="mr-2 text-blue-500" size={24}/> Estado Presupuestario por Activo</h3>
                <div className="space-y-6">
                  {stats.vehicleStats.map(v => (
                    <div key={v.id} className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-slate-200">{v.model} ({v.plate})</span>
                        <span className="font-black text-emerald-400">${v.spent.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-blue-600" style={{ width: `${Math.min(100, (v.spent/expenseThreshold)*100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
                <h3 className="font-black text-xl mb-8 uppercase flex items-center tracking-tighter text-left"><History className="mr-2 text-blue-500" size={24}/> Registro de Auditoría Global</h3>
                <div className="space-y-6 overflow-y-auto max-h-[350px] pr-4 custom-scrollbar text-left">
                  {orders.flatMap(o => o.logs).sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((log, i) => (
                    <div key={i} className="flex space-x-4 pb-4 border-b border-slate-800 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
                      <div>
                        <p className="text-xs font-bold text-slate-100 leading-none">{log.action}</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-widest">{log.user} — {log.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-in slide-in-from-bottom-6 duration-700 max-w-7xl mx-auto pb-40">
            {/* OT List */}
            <div className="space-y-6 text-left">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Intervenciones</h2>
                {perms.canOpenOT && <button onClick={() => setIsNewOrderModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all">+ Apertura OT</button>}
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[75vh] pr-4 custom-scrollbar">
                {orders.map(o => (
                  <div key={o.id} onClick={() => setSelectedOrder(o)} className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden ${selectedOrder?.id === o.id ? 'border-blue-500 bg-blue-600/5 ring-4 ring-blue-500/5 shadow-2xl' : 'border-slate-800 bg-slate-900 hover:border-slate-700 shadow-lg'}`}>
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{o.id}</span>
                        <h4 className="font-black text-2xl tracking-tight leading-none mt-1">{vehicles.find(v => v.id === o.vehicleId)?.model}</h4>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                        o.status === 'Abierta' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 
                        o.status === 'Asignada' ? 'border-orange-500 text-orange-400 bg-orange-500/10' : 
                        o.status.includes('Pendiente') ? 'border-purple-500 text-purple-400 bg-purple-500/10 animate-pulse' :
                        'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                      }`}>{o.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 italic mt-2 font-medium">"{o.problemDescription}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* OT Logic / Execution Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-12 sticky top-0 h-fit shadow-2xl min-h-[600px] flex flex-col glass-panel text-left">
              {selectedOrder ? (
                <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
                  <header className="flex justify-between items-start border-b border-slate-800 pb-10">
                    <div>
                      <h3 className="text-5xl font-black text-white tracking-tighter leading-none mb-3">{selectedOrder.id}</h3>
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest italic">Apertura: {selectedOrder.logs[0].date}</p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-[2.5rem] text-center border border-slate-700 min-w-[130px] shadow-inner">
                      <p className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Costo Acum.</p>
                      <p className="text-2xl font-black text-white tracking-tighter leading-none">${selectedOrder.cost.toLocaleString()}</p>
                    </div>
                  </header>

                  <div className="space-y-6">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center leading-none"><Paperclip size={14} className="mr-2" /> Archivos y Evidencia Visual</label>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedOrder.attachments.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-slate-800/40 rounded-[1.5rem] border border-slate-800 hover:border-blue-500/50 transition-all group shadow-sm">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg"><File size={18} /></div>
                            <span className="text-xs font-bold text-slate-200">{f.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{f.size}</span>
                        </div>
                      ))}
                      {perms.canExecuteWork && selectedOrder.status !== 'Cerrada' && (
                        <label className="cursor-pointer border-2 border-dashed border-slate-800 p-10 rounded-[2.5rem] flex flex-col items-center hover:bg-blue-500/5 hover:border-blue-500/50 transition-all group">
                          <UploadCloud size={32} className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Activar Camara / Subir Evidencia</span>
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(selectedOrder.id, e.target.files[0]?.name)} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Contextual Action based on Status and Profile */}
                  {selectedOrder.status === 'Abierta' && perms.canAssignTech && (
                    <div className="pt-10 border-t border-slate-800 space-y-6">
                      <label className="text-[10px] font-black text-orange-400 uppercase tracking-[0.4em] flex items-center leading-none"><UserPlus size={18} className="mr-3"/> Asignar Técnico Responsable</label>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateOT(selectedOrder.id, { assignedTech: e.target.tech.value, status: 'Asignada' }, 'Técnico asignado para intervención');
                      }} className="flex gap-4">
                        <input name="tech" required className="flex-1 bg-slate-800 border border-slate-700 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-orange-500 shadow-inner" placeholder="Nombre completo del técnico..." />
                        <button type="submit" className="bg-orange-600 hover:bg-orange-500 px-10 rounded-[2rem] font-black text-[10px] tracking-widest uppercase text-white shadow-xl transition-all">Asignar</button>
                      </form>
                    </div>
                  )}

                  {selectedOrder.status === 'Asignada' && perms.canExecuteWork && (
                    <div className="pt-10 border-t border-slate-800 space-y-8">
                       <div className="flex justify-between items-center mb-2">
                          <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] flex items-center leading-none"><Wrench size={18} className="mr-3"/> Descripción Trabajos Ejecutados</label>
                          <button 
                            type="button"
                            disabled={isAnalyzing}
                            onClick={() => {
                              const textarea = document.getElementById('workDetailInput');
                              generateAiAnalysis(selectedOrder.problemDescription, textarea?.value || "");
                            }}
                            className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-600/30 transition-all flex items-center shadow-lg"
                          >
                            {isAnalyzing ? <Loader2 size={14} className="mr-2 animate-spin"/> : <Sparkles size={14} className="mr-2"/>}
                            {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
                          </button>
                       </div>
                       
                       <form onSubmit={(e) => {
                          e.preventDefault();
                          const cost = parseFloat(e.target.cost.value);
                          const work = e.target.work.value;
                          if (cost > COST_APPROVAL_LIMIT && !selectedOrder.isAuthorized) {
                            handleUpdateOT(selectedOrder.id, { workDetail: work, cost, status: 'Pendiente Autorización' }, 'Solicitud de autorización por presupuesto elevado');
                          } else {
                            handleUpdateOT(selectedOrder.id, { workDetail: work, cost, status: 'Cerrada' }, 'Trabajo finalizado y auditado');
                          }
                       }} className="space-y-8">
                          <textarea 
                            id="workDetailInput"
                            name="work" 
                            required 
                            rows="4" 
                            className="w-full bg-slate-800 border border-slate-700 rounded-[2.5rem] p-10 text-sm outline-none font-medium leading-relaxed text-white focus:ring-2 focus:ring-blue-500 shadow-inner" 
                            placeholder="Detalle exhaustivo del análisis técnico y reparación realizada..."
                          ></textarea>
                          {aiError && <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest text-center italic">{aiError}</p>}
                          <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Gasto de Trabajo ($)</label>
                                <input name="cost" required type="number" className="w-full bg-slate-800 border border-slate-700 rounded-3xl px-8 py-5 text-xl font-black text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" placeholder="0.00" />
                            </div>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] text-white shadow-2xl transition-all h-[70px] self-end">FINALIZAR INTERVENCIÓN</button>
                          </div>
                       </form>
                    </div>
                  )}

                  {selectedOrder.status === 'Pendiente Autorización' && perms.canAuthorizeSpend && (
                    <div className="pt-10 border-t border-slate-800 text-center space-y-8">
                       <AlertTriangle size={56} className="text-purple-400 mx-auto animate-pulse" />
                       <p className="text-sm text-slate-400 italic font-medium leading-relaxed px-12">Monto de <strong>${selectedOrder.cost.toLocaleString()}</strong> requiere su validación oficial como Autorizador por exceder el límite de firma inmediata.</p>
                       <button onClick={() => handleUpdateOT(selectedOrder.id, { status: 'Asignada', isAuthorized: true }, 'Autorización de presupuesto concedida oficialmente')} className="w-full bg-purple-600 hover:bg-purple-500 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest text-white shadow-xl flex items-center justify-center transition-all">
                          <ThumbsUp size={24} className="mr-4"/> DAR OK (Autorizar Gasto)
                       </button>
                    </div>
                  )}

                  {/* Inmutable Audit History */}
                  <div className="pt-12 border-t border-slate-800/50">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-12 flex items-center leading-none italic"><History size={16} className="mr-3" /> historial de mantencion y reparacion de activos</h4>
                    <div className="space-y-12 relative">
                      {selectedOrder.logs.map((log, idx) => (
                        <div key={idx} className="flex gap-10 relative">
                          {idx !== selectedOrder.logs.length - 1 && <div className="absolute left-[9px] top-5 bottom-[-48px] w-px bg-slate-800 shadow-sm"></div>}
                          <div className={`w-5 h-5 rounded-full mt-2 shrink-0 z-10 border-[5px] border-slate-950 shadow-2xl transition-all ${idx === selectedOrder.logs.length - 1 ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-125' : 'bg-slate-700 opacity-50'}`}></div>
                          <div>
                            <p className="text-sm font-black text-slate-200 uppercase tracking-widest leading-none mb-3">{log.action}</p>
                            <div className="flex items-center space-x-4 opacity-70">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-lg">ID: {log.user}</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{log.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-60">
                  <Activity size={180} className="mb-14 text-slate-700" />
                  <p className="font-black text-4xl uppercase tracking-[0.5em]">Consola de Auditoría</p>
                  <p className="text-sm mt-8 font-bold tracking-[0.3em] uppercase opacity-60">Seleccione una intervención para gestionar</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modales: Asset and OT Registration */}
      {isNewVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[4rem] p-16 animate-in zoom-in-95 duration-500 shadow-2xl shadow-blue-900/10">
            <h3 className="text-3xl font-black mb-12 text-white uppercase tracking-tighter text-center">Registrar Activo</h3>
            <form onSubmit={handleAddVehicle} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Tipo de Vehículo</label>
                <select name="type" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner appearance-none">
                  <option value="Bicicleta Eléctrica">Bicicleta Eléctrica</option>
                  <option value="Tricicleta Eléctrica">Tricicleta Eléctrica</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Modelo / Marca</label>
                <input name="model" required className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" placeholder="Ej: EcoRide XT-100" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Patente / Serie</label>
                <input name="plate" required className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-mono font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 uppercase shadow-inner" placeholder="XXX-000" />
              </div>
              <div className="flex gap-4 pt-8">
                <button type="button" onClick={() => setIsNewVehicleModalOpen(false)} className="flex-1 py-6 rounded-[2rem] font-black text-[11px] bg-slate-800 uppercase text-slate-400 hover:text-white transition-all tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-6 rounded-[2rem] font-black text-[11px] uppercase text-white shadow-2xl tracking-widest">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[5rem] p-20 animate-in zoom-in-95 duration-500 shadow-2xl shadow-blue-900/10">
            <h3 className="text-4xl font-black mb-12 text-white uppercase tracking-tighter">Apertura Caso Técnico</h3>
            <form onSubmit={handleCreateOrder} className="space-y-10">
              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Seleccionar Activo</label>
                    <select name="vehicleId" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner appearance-none">
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.model} ({v.plate})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Categoría de Trabajo</label>
                    <select name="category" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner appearance-none">
                      <option value="Correctivo">Correctivo (Falla)</option>
                      <option value="Preventivo">Preventivo (Programado)</option>
                    </select>
                  </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Descripción del Problema (Apertura)</label>
                <textarea name="problemDescription" required rows="4" className="w-full bg-slate-950 border border-slate-800 rounded-[3rem] p-10 text-sm font-medium leading-relaxed text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" placeholder="Detalle técnico inicial del problema detectado o requerimiento..."></textarea>
              </div>
              <div className="flex gap-6 pt-6">
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
