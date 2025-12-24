import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, ClipboardList, Bike, BarChart2, PlusCircle, User, 
  Clock, Camera, CheckCircle2, AlertCircle, UserPlus, FileEdit,
  DollarSign, Search, ChevronRight, X, History, Calendar, Filter, 
  Download, Activity, Zap, AlertTriangle, Settings2, ShieldCheck, 
  Briefcase, Wrench, ThumbsUp, Paperclip, File, Trash2, UploadCloud,
  Sparkles, Loader2, LogOut, Lock, Battery, BatteryCharging, Gauge,
  Cpu, ZapOff, Database, ShieldAlert
} from 'lucide-react';

// --- Configuración de IA ---
const apiKey = ""; 

const ROLES = {
  AUTORIZADOR: { id: 'AUTORIZADOR', label: 'Autorizador', icon: ShieldCheck, color: 'text-purple-400' },
  ASIGNADOR: { id: 'ASIGNADOR', label: 'Asignador', icon: Briefcase, color: 'text-orange-400' },
  EJECUTOR: { id: 'EJECUTOR', label: 'Técnico Ejecutor', icon: Wrench, color: 'text-blue-400' }
};

const CREDENTIALS = {
  'autorizador': { password: 'autorizador123', role: 'AUTORIZADOR' },
  'asignador': { password: 'asignador123', role: 'ASIGNADOR' },
  'tecnico': { password: 'tecnico123', role: 'EJECUTOR' }
};

const DEFAULT_UMBRAL = 80000;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  const [view, setView] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [umbralGasto, setUmbralGasto] = useState(DEFAULT_UMBRAL);

  // --- Base de Datos Antigua (Legacy) + Estado del Arte ---
  const [vehicles, setVehicles] = useState([
    { 
      id: 'V-LEGACY-01', 
      type: 'Bicicleta Eléctrica', 
      model: 'Urban-X (Legacy)', 
      plate: 'AA-11-BB',
      motorSpecs: '250W Bafang',
      batterySpecs: '36V 10Ah',
      controllerSpecs: '15A Standard',
      batterySOH: 72,
      cycles: 890,
      status: 'Revision Requerida'
    },
    { 
      id: 'V-LEGACY-02', 
      type: 'Tricicleta Eléctrica', 
      model: 'CargoMaster 2000', 
      plate: 'TR-99-CC',
      motorSpecs: '1000W Heavy Duty',
      batterySpecs: '60V 30Ah',
      controllerSpecs: '45A Vector',
      batterySOH: 85,
      cycles: 320,
      status: 'Operativo'
    }
  ]);

  const [orders, setOrders] = useState([
    {
      id: 'OT-8800',
      vehicleId: 'V-LEGACY-01',
      sc25Code: 'SC25-HISTORICO',
      status: 'Cerrada',
      category: 'Correctivo',
      problemDescription: 'Pérdida de potencia en pendiente.',
      assignedTech: 'Técnico Senior',
      workDetail: 'Revisión de estado del arte. Batería presenta alta impedancia interna.',
      cost: 15000,
      isAuthorized: true,
      attachments: [],
      dateAction: '2024-11-05',
      logs: [{ action: 'Migración de BBDD Antigua', user: 'SYSTEM', date: '2024-11-05' }]
    }
  ]);

  // --- Gestión de Autenticación ---
  const handleLogin = (e) => {
    e.preventDefault();
    const cred = CREDENTIALS[loginForm.user.toLowerCase()];
    if (cred && cred.password === loginForm.password) {
      setIsLoggedIn(true);
      setCurrentUser({ name: loginForm.user, role: cred.role });
      setLoginError('');
      // Redirigir según rol
      setView('dashboard');
    } else {
      setLoginError('Usuario o contraseña inválidos');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginForm({ user: '', password: '' });
    setCurrentUser(null);
    setSelectedOrder(null);
  };

  // --- Permisos de Vista ---
  const userRole = currentUser?.role;
  const isAuth = userRole === 'AUTORIZADOR';
  const isAsign = userRole === 'ASIGNADOR';
  const isTech = userRole === 'EJECUTOR';

  // --- Lógica de IA ---
  const generateAiAnalysis = async (problem, currentDetail) => {
    if (!apiKey) {
      setAiError("API Key no detectada.");
      return;
    }
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const prompt = `Analiza este caso técnico de electromovilidad. Problema: "${problem}". Observaciones: "${currentDetail}". Genera un diagnóstico profesional para auditoría técnica.`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const textarea = document.getElementById('workDetailInput');
        if (textarea) textarea.value = text.trim();
      }
    } catch (err) {
      setAiError("Error en IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const stats = useMemo(() => {
    const closed = orders.filter(o => o.status === 'Cerrada');
    const spent = closed.reduce((acc, curr) => acc + (curr.cost || 0), 0);
    const avgSOH = vehicles.length > 0 ? vehicles.reduce((acc, v) => acc + v.batterySOH, 0) / vehicles.length : 0;
    return { 
      availability: vehicles.length > 0 ? (((vehicles.length - orders.filter(o => o.status !== 'Cerrada').length) / vehicles.length) * 100).toFixed(0) : 0,
      spent, 
      avgSOH: avgSOH.toFixed(1), 
      pending: orders.filter(o => o.status === 'Pendiente Autorización').length 
    };
  }, [orders, vehicles]);

  // --- Handlers de Datos ---
  const handleAddVehicle = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const newV = { 
      id: `V-NEW-${Date.now()}`, 
      type: data.get('type'), 
      model: data.get('model'), 
      plate: data.get('plate').toUpperCase(),
      motorSpecs: data.get('motorSpecs'),
      batterySpecs: data.get('batterySpecs'),
      controllerSpecs: data.get('controllerSpecs'),
      batterySOH: 100,
      cycles: 0,
      status: 'Nuevo Ingreso'
    };
    setVehicles([...vehicles, newV]);
    setIsNewVehicleModalOpen(false);
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const newO = {
      id: `OT-${Math.floor(1000 + Math.random() * 8999)}`,
      vehicleId: data.get('vehicleId'),
      sc25Code: data.get('sc25'),
      status: 'Abierta',
      category: data.get('category'),
      problemDescription: data.get('problemDescription'),
      assignedTech: null,
      cost: 0,
      isAuthorized: false,
      attachments: [],
      dateAction: new Date().toISOString().split('T')[0],
      logs: [{ action: `Apertura (Ref: ${data.get('sc25')})`, user: currentUser.name, date: new Date().toLocaleString() }]
    };
    setOrders([newO, ...orders]);
    setIsNewOrderModalOpen(false);
  };

  const handleUpdateOT = (id, updates, logAction) => {
    setOrders(prev => prev.map(o => o.id === id ? {
      ...o, ...updates, 
      logs: [...(o.logs || []), { action: logAction, user: currentUser.name, date: new Date().toLocaleString() }]
    } : o));
    setSelectedOrder(null);
  };

  // --- Renderizado Condicional: Login ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-blue-500/30">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-blue-600 p-4 rounded-3xl shadow-xl mb-6">
              <ShieldAlert className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">deepfix<span className="text-blue-500 not-italic">os1</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Gestión de Parque y Activos</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Usuario</label>
              <input 
                type="text" 
                required
                value={loginForm.user}
                onChange={(e) => setLoginForm({...loginForm, user: e.target.value})}
                placeholder="Ej: autorizador"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Contraseña</label>
              <input 
                type="password" 
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            {loginError && <p className="text-red-400 text-[10px] font-bold uppercase text-center animate-pulse">{loginError}</p>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-blue-900/20 transition-all mt-4">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Restringido */}
      <aside className="w-72 border-r border-slate-800 bg-slate-900/40 p-8 flex flex-col">
        <div className="flex items-center space-x-4 mb-12">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl">
            <Settings2 className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase text-left italic leading-none">deepfix<br/><span className="text-[10px] text-blue-500 font-bold tracking-[0.3em] not-italic text-left">os1 - activos</span></h1>
        </div>
        
        <nav className="space-y-3 flex-1 text-left">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Dashboard</span>
          </button>
          <button onClick={() => setView('orders')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${view === 'orders' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>
            <ClipboardList size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Órdenes</span>
          </button>
          {isAuth && (
            <button onClick={() => setView('config')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${view === 'config' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>
              <ShieldCheck size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Configuración</span>
            </button>
          )}
        </nav>

        <div className="mt-auto space-y-4 pt-10 border-t border-slate-800">
          <div className="flex items-center space-x-3 p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="bg-slate-800 p-2 rounded-xl">
               {isAuth ? <ShieldCheck size={18} className="text-purple-400" /> : isAsign ? <Briefcase size={18} className="text-orange-400" /> : <Wrench size={18} className="text-blue-400" />}
            </div>
            <div className="text-left overflow-hidden">
               <p className="text-[10px] font-black text-white uppercase truncate">{currentUser.name}</p>
               <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{ROLES[userRole].label}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-3 p-4 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-500 rounded-2xl transition-all group">
            <LogOut size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Salir</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar text-left">
        {view === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Monitor Parque Activos</h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Base de Datos: <span className="text-blue-500">deepfix-os1_prod</span></p>
              </div>
              <div className="flex gap-4">
                 {(isAuth || isAsign) && <button onClick={() => setIsNewVehicleModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase border border-slate-700">Registrar Legacy/Nuevo</button>}
                 {(isAuth || isAsign) && <button onClick={() => setIsNewOrderModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-xl transition-all">Apertura OT</button>}
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                <Activity className="text-blue-400 mx-auto mb-4" size={24} />
                <h3 className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Disponibilidad</h3>
                <p className="text-5xl font-black text-white">{stats.availability}%</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                <Battery className="text-emerald-400 mx-auto mb-4" size={24} />
                <h3 className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Salud SOH Prom.</h3>
                <p className="text-5xl font-black text-emerald-400">{stats.avgSOH}%</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                <Database className="text-purple-400 mx-auto mb-4" size={24} />
                <h3 className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Activos BBDD</h3>
                <p className="text-5xl font-black text-white">{vehicles.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                <AlertCircle className="text-orange-400 mx-auto mb-4" size={24} />
                <h3 className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Esperando OK</h3>
                <p className="text-5xl font-black text-orange-400">{stats.pending}</p>
              </div>
            </div>

            {/* Listado de Parque: Estado del Arte */}
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
              <h3 className="font-black text-xl mb-8 uppercase flex items-center tracking-tighter"><Zap className="mr-3 text-blue-500" /> Caracterización del Parque Existente</h3>
              <div className="grid grid-cols-1 gap-4">
                 {vehicles.map(v => (
                   <div key={v.id} className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center p-6 bg-slate-950/50 rounded-[2rem] border border-slate-800 hover:border-blue-500/30 transition-all group">
                     <div className="text-left col-span-1">
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{v.plate}</p>
                       <p className="text-base font-black text-white mt-1 uppercase leading-none">{v.model}</p>
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded-full mt-2 inline-block ${v.status.includes('Legacy') ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>{v.status}</span>
                     </div>
                     <div className="text-left col-span-2 grid grid-cols-1 gap-2 border-l border-slate-800 pl-6">
                        <p className="text-[9px] font-black text-slate-500 uppercase flex items-center"><Cpu size={12} className="mr-2 text-slate-600"/> Motor: <span className="text-slate-300 ml-1">{v.motorSpecs}</span></p>
                        <p className="text-[9px] font-black text-slate-500 uppercase flex items-center"><Battery size={12} className="mr-2 text-slate-600"/> Batería: <span className="text-slate-300 ml-1">{v.batterySpecs}</span></p>
                        <p className="text-[9px] font-black text-slate-500 uppercase flex items-center"><Zap size={12} className="mr-2 text-slate-600"/> Control: <span className="text-slate-300 ml-1">{v.controllerSpecs}</span></p>
                     </div>
                     <div className="col-span-2">
                       <div className="flex justify-between items-center mb-2">
                         <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Vida Útil (SOH)</p>
                         <p className={`text-[10px] font-black ${v.batterySOH < 75 ? 'text-red-400' : 'text-emerald-400'}`}>{v.batterySOH}%</p>
                       </div>
                       <div className="h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                         <div className={`h-full transition-all duration-1000 ${v.batterySOH < 75 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${v.batterySOH}%` }}></div>
                       </div>
                       <p className="text-[8px] text-slate-500 mt-2 font-black uppercase text-right tracking-widest">{v.cycles} Ciclos Registrados</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        )}

        {view === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-bottom-6 duration-700 max-w-7xl mx-auto pb-20">
            <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-10 text-left">Mantenimiento y Auditoría</h2>
              <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-4 custom-scrollbar text-left">
                {orders.map(o => {
                  const vehicle = vehicles.find(v => v.id === o.vehicleId);
                  return (
                    <div key={o.id} onClick={() => setSelectedOrder(o)} className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer relative ${selectedOrder?.id === o.id ? 'border-blue-500 bg-blue-600/5 ring-4 ring-blue-500/5 shadow-2xl' : 'border-slate-800 bg-slate-900 hover:border-slate-700 shadow-lg'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-left">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{o.id}</span>
                          <h4 className="font-black text-xl leading-none mt-1 uppercase tracking-tight">{vehicle?.model || 'Activo'}</h4>
                          <p className="text-[9px] font-black text-blue-500 mt-1 uppercase tracking-widest">REF: {o.sc25Code}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${o.status.includes('Pendiente') ? 'border-purple-500 text-purple-400' : 'border-slate-700 text-slate-400'}`}>{o.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-12 sticky top-0 h-fit shadow-2xl min-h-[600px] flex flex-col text-left">
              {selectedOrder ? (
                <div className="space-y-10 animate-in slide-in-from-right-8 duration-500 text-left">
                  <header className="flex justify-between items-start border-b border-slate-800 pb-10">
                    <div className="text-left">
                      <h3 className="text-4xl font-black text-white tracking-tighter leading-none">{selectedOrder.id}</h3>
                      <p className="text-slate-500 text-[10px] uppercase font-black mt-3 italic tracking-widest">SC-25 Reference: <span className="text-blue-500 font-black">{selectedOrder.sc25Code}</span></p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-3xl text-center border border-slate-700 min-w-[130px] shadow-inner">
                      <p className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest leading-none">Presupuesto</p>
                      <p className="text-2xl font-black text-white leading-none">${(selectedOrder.cost || 0).toLocaleString()}</p>
                    </div>
                  </header>

                  {/* Diagnóstico IA - Solo Técnico o Autorizador */}
                  {selectedOrder.status === 'Asignada' && (isTech || isAuth) && (
                    <div className="space-y-8 text-left">
                       <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] flex items-center leading-none"><Wrench size={18} className="mr-3"/> Diagnóstico Electromecánico</label>
                          <button 
                            type="button" 
                            onClick={() => generateAiAnalysis(selectedOrder.problemDescription, document.getElementById('workDetailInput').value)} 
                            disabled={isAnalyzing} 
                            className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-blue-600/30 flex items-center transition-all disabled:opacity-30 shadow-lg"
                          >
                             {isAnalyzing ? <Loader2 size={12} className="mr-2 animate-spin"/> : <Sparkles size={12} className="mr-2"/>} Informe IA
                          </button>
                       </div>
                       <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const cost = parseFloat(formData.get('cost')) || 0;
                          const updates = { workDetail: formData.get('work'), cost };
                          if (cost > umbralGasto && !selectedOrder.isAuthorized) {
                            handleUpdateOT(selectedOrder.id, { ...updates, status: 'Pendiente Autorización' }, 'Solicitud de autorización por presupuesto elevado');
                          } else {
                            handleUpdateOT(selectedOrder.id, { ...updates, status: 'Cerrada' }, 'OT cerrada por ejecución técnica');
                          }
                       }} className="space-y-6">
                          <textarea id="workDetailInput" name="work" required rows="6" className="w-full bg-slate-800 border border-slate-700 rounded-[2rem] p-10 text-sm outline-none font-medium leading-relaxed text-white focus:ring-2 focus:ring-blue-500 shadow-inner" placeholder="Escriba aquí los detalles de la intervención técnica sobre motor, batería o controlador..."></textarea>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 text-left">
                                <label className="text-[9px] font-black text-slate-600 uppercase ml-4 tracking-widest">Gasto Incurrido ($)</label>
                                <input name="cost" required type="number" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-8 py-5 text-xl font-black text-white shadow-inner outline-none" placeholder="0" />
                            </div>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 rounded-3xl font-black text-[11px] uppercase text-white shadow-xl transition-all self-end h-[68px]">CERRAR ORDEN</button>
                          </div>
                       </form>
                    </div>
                  )}

                  {/* Acción del Autorizador */}
                  {selectedOrder.status === 'Pendiente Autorización' && isAuth && (
                    <div className="pt-10 border-t border-slate-800 text-center space-y-6">
                       <AlertTriangle size={48} className="text-purple-400 mx-auto animate-pulse" />
                       <p className="text-sm text-slate-400 italic px-8">Monto de ${selectedOrder.cost.toLocaleString()} requiere validación oficial para habilitar el cierre.</p>
                       <button onClick={() => handleUpdateOT(selectedOrder.id, { status: 'Asignada', isAuthorized: true }, 'Autorización de gasto concedida')} className="w-full bg-purple-600 hover:bg-purple-500 py-6 rounded-[2rem] font-black text-xs uppercase text-white shadow-xl flex items-center justify-center transition-all">
                          <ThumbsUp size={20} className="mr-3"/> VALIDAR PRESUPUESTO (OK)
                       </button>
                    </div>
                  )}

                  <div className="pt-12 border-t border-slate-800/50 text-left">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-10 flex items-center leading-none italic font-bold tracking-widest"><History size={16} className="mr-3" /> Trazabilidad Inmutable</h4>
                    <div className="space-y-8 relative">
                      {(selectedOrder.logs || []).map((log, idx) => (
                        <div key={idx} className="flex gap-8 relative text-left">
                          <div className={`w-4 h-4 rounded-full mt-1.5 shrink-0 z-10 border-[4px] border-slate-950 ${idx === selectedOrder.logs.length - 1 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]' : 'bg-slate-700 opacity-50'}`}></div>
                          <div className="flex-1">
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
                  <Database size={120} className="mb-8" />
                  <p className="font-black text-3xl uppercase tracking-[0.5em]">AUDIT CORE</p>
                  <p className="text-sm mt-4 font-bold tracking-widest uppercase opacity-60 text-center">Seleccione un activo para revisión técnica</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'config' && isAuth && (
          <div className="space-y-12 animate-in fade-in duration-500 max-w-4xl mx-auto text-left">
             <header>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Configuración de Sistema</h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Control Global de Umbrales y Seguridad</p>
             </header>

             <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                   <div className="text-left">
                      <h4 className="text-xl font-black text-white uppercase tracking-tight">Umbral de Aprobación Crítica</h4>
                      <p className="text-xs text-slate-500 mt-1">Defina el monto máximo que un Técnico/Asignador puede procesar sin su validación.</p>
                   </div>
                   <p className="text-4xl font-black text-blue-500 tracking-tighter">${umbralGasto.toLocaleString()}</p>
                </div>
                <input 
                  type="range" 
                  min="10000" 
                  max="500000" 
                  step="5000" 
                  value={umbralGasto}
                  onChange={(e) => setUmbralGasto(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600 mb-6"
                />
                <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
                   <span>Min: $10.000</span>
                   <span>Max: $500.000</span>
                </div>
             </div>

             <div className="bg-red-500/5 border border-red-500/20 rounded-[3rem] p-12 shadow-2xl">
                <h4 className="text-xl font-black text-red-500 uppercase tracking-tight mb-4 flex items-center"><ShieldAlert className="mr-3" /> Zona de Seguridad</h4>
                <p className="text-sm text-slate-400 mb-8 italic">Como Autorizador, usted supervisa todos los registros del parque legado. Cualquier modificación de "Estado del Arte" queda registrada con su sello digital.</p>
                <button className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Exportar Log de Auditoría Completo</button>
             </div>
          </div>
        )}
      </main>

      {/* Modals con Campos de Caracterización y Caracteristicas Legacy */}
      {isNewVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[4rem] p-16 animate-in zoom-in-95 duration-500 shadow-2xl">
            <h3 className="text-3xl font-black mb-10 text-white uppercase tracking-tighter text-center leading-none">Registrar Activo Parque</h3>
            <form onSubmit={handleAddVehicle} className="space-y-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <input name="model" required placeholder="Modelo (Ej: Urban Legacy)" className="w-full bg-slate-800 border border-slate-700 rounded-3xl px-6 py-4 text-sm font-bold text-white outline-none" />
                <input name="plate" required placeholder="Patente (XXX-000)" className="w-full bg-slate-800 border border-slate-700 rounded-3xl px-6 py-4 text-sm font-mono font-bold text-white outline-none uppercase" />
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Especificaciones de Caracterización</p>
                <div className="space-y-3">
                  <input name="motorSpecs" required placeholder="Motor (ej: 250W Bafang)" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white" />
                  <input name="batterySpecs" required placeholder="Batería (ej: 36V 10Ah)" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white" />
                  <input name="controllerSpecs" required placeholder="Controlador (ej: 15A)" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white" />
                  <select name="type" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none appearance-none">
                    <option value="Bicicleta Eléctrica">Bicicleta Eléctrica</option>
                    <option value="Tricicleta Eléctrica">Tricicleta Eléctrica</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-6 text-center">
                <button type="button" onClick={() => setIsNewVehicleModalOpen(false)} className="flex-1 py-6 rounded-[2rem] font-black text-[11px] bg-slate-800 uppercase text-slate-400 tracking-widest">Cerrar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-6 rounded-[2rem] font-black text-[11px] uppercase text-white shadow-2xl tracking-widest">Inyectar BBDD</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Apertura con SC-25 y Referencia Legacy */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-8 text-left">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[4.5rem] p-20 animate-in zoom-in-95 duration-500 shadow-2xl shadow-blue-900/10 text-left">
            <h3 className="text-4xl font-black mb-10 text-white uppercase tracking-tighter text-left leading-none">Apertura OT</h3>
            <form onSubmit={handleCreateOrder} className="space-y-8 text-left">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Seleccionar Activo</label>
                    <select name="vehicleId" className="w-full bg-slate-800 border border-slate-700 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none">
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.model} ({v.plate})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Referencia SC-25</label>
                    <input name="sc25" required placeholder="SC25-XXXX" className="w-full bg-slate-800 border border-slate-700 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none" />
                  </div>
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Categoría</label>
                  <select name="category" className="w-full bg-slate-800 border border-slate-700 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none">
                    <option value="Revisión Parque">Revisión Parque (Estado del Arte)</option>
                    <option value="Correctivo">Mantenimiento Correctivo</option>
                    <option value="Preventivo">Mantenimiento Preventivo</option>
                  </select>
              </div>
              <textarea name="problemDescription" required rows="4" className="w-full bg-slate-800 border border-slate-700 rounded-[3rem] p-10 text-sm font-medium leading-relaxed text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Descripción técnica o requerimiento de auditoría..."></textarea>
              <div className="flex gap-6 pt-6 text-center">
                <button type="button" onClick={() => setIsNewOrderModalOpen(false)} className="flex-1 py-7 rounded-[2.5rem] font-black text-[11px] bg-slate-800 uppercase text-slate-400">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-7 rounded-[2.5rem] font-black text-[11px] uppercase text-white shadow-2xl">Abrir OT</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
