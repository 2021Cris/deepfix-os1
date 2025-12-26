import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, ClipboardList, Bike, BarChart2, PlusCircle, User, 
  Clock, Camera, CheckCircle2, AlertCircle, UserPlus, FileEdit,
  DollarSign, Search, ChevronRight, X, History, Calendar, Filter, 
  Download, Activity, Zap, AlertTriangle, Settings2, ShieldCheck, 
  Briefcase, Wrench, ThumbsUp, Paperclip, File, Trash2, UploadCloud,
  Sparkles, Loader2, LogOut, Lock, Battery, BatteryCharging, Gauge,
  Cpu, ZapOff, Database, ShieldAlert, Save, RefreshCw, QrCode, 
  ArrowLeftRight, Recycle, HardDrive, Shield, Printer, FileCheck, FileText,
  Tool
} from 'lucide-react';

// --- Configuración de IA ---
const apiKey = ""; 

// --- Perfiles y Seguridad ---
const ROLES = {
  ADMINISTRADOR: { id: 'ADMINISTRADOR', label: 'Administrador', icon: Shield, color: 'text-red-400' },
  SUPERVISOR: { id: 'SUPERVISOR', label: 'Supervisor', icon: ShieldCheck, color: 'text-purple-400' },
  TECNICO: { id: 'TECNICO', label: 'Técnico Perito', icon: Wrench, color: 'text-blue-400' },
  CLIENTE: { id: 'CLIENTE', label: 'Cliente Final', icon: User, color: 'text-emerald-400' }
};

const CREDENTIALS = {
  'administrador': { password: 'administrador123', role: 'ADMINISTRADOR' },
  'supervisor': { password: 'supervisor123', role: 'SUPERVISOR' },
  'tecnico': { password: 'tecnico123', role: 'TECNICO' },
  'cliente': { password: 'cliente123', role: 'CLIENTE' }
};

const UMBRAL_AUTORIZACION = 80000;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [printDoc, setPrintDoc] = useState(null);

  // --- Base de Datos: Clientes ---
  const [customers, setCustomers] = useState([
    { id: 'C1', name: 'Juan Pérez', email: 'juan@email.com', phone: '+56912345678' },
    { id: 'C2', name: 'Flota LastMile SpA', email: 'contacto@lastmile.cl', phone: '+5622334455' }
  ]);

  // --- Base de Datos: Activos ---
  const [vehicles, setVehicles] = useState([
    { 
      id: 'DF-CH-1001', 
      customerId: 'C1',
      type: 'Bicicleta Eléctrica', 
      model: 'EcoRide Pro 250', 
      plate: 'BE-55-90',
      motorSerial: 'MOT-99821-X',
      batterySerial: 'BAT-LIT-2024-001',
      controllerSerial: 'CTRL-V22',
      currentSoH: 85,
      poutActual: 242.5,
      maxSpeed: 25,
      status: 'Certificado',
      legalCompliance: true,
      batteryTrace: {
        stage: 'Certificación',
        document: 'Sello de Eficiencia',
        gestor: 'REP Chile',
        folio: 'SID-9921',
        date: '2024-12-20'
      }
    }
  ]);

  const [orders, setOrders] = useState([
    {
      id: 'AUDIT-900',
      vehicleId: 'DF-CH-1001',
      sc25Ref: 'SC25-2024-A',
      status: 'Cerrada',
      category: 'Auditoría Mixta',
      problemDescription: 'Certificación Ley Retrofit y estado de celdas.',
      assignedTech: 'Técnico_Perito',
      workType: 'Mixto',
      workDetail: 'Vehículo cumple con los 250W nominales tras cálculo Pout. Batería en fase de movilidad activa.',
      cost: 45000,
      isAuthorized: true,
      logs: [{ action: 'Certificación Emitida', user: 'tecnico', date: '2024-12-20' }]
    }
  ]);

  // --- Lógica de Ingeniería ---
  const calculatePout = (v, i, r, eta = 0.85) => {
    return parseFloat(((v * i) - (Math.pow(i, 2) * r)) * eta).toFixed(1);
  };

  const getCircularDestination = (soh) => {
    if (soh >= 80) return { label: 'Movilidad (Pedalear)', color: 'bg-emerald-500', text: 'text-emerald-400', icon: Bike };
    if (soh >= 40) return { label: 'Reuse (BESS)', color: 'bg-blue-500', text: 'text-blue-400', icon: RefreshCw };
    return { label: 'Ley REP (Reciclaje)', color: 'bg-red-500', text: 'text-red-400', icon: Recycle };
  };

  // --- Estado de Trazabilidad ---
  const [traceState, setTraceState] = useState({
    stage: 'Diagnóstico',
    document: 'Certificado de Disposición',
    gestor: 'REP Chile'
  });

  // --- Manejo de Sesión ---
  const handleLogin = (e) => {
    e.preventDefault();
    const username = loginForm.user.toLowerCase().trim();
    const cred = CREDENTIALS[username];
    if (cred && cred.password === loginForm.password) {
      setIsLoggedIn(true);
      setCurrentUser({ name: username, role: cred.role });
      setView('dashboard');
      setLoginError('');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginForm({ user: '', password: '' });
  };

  const isClient = currentUser?.role === 'CLIENTE';
  const isTech = currentUser?.role === 'TECNICO';
  const isAuthUser = currentUser?.role === 'ADMINISTRADOR' || currentUser?.role === 'SUPERVISOR';

  // --- Impresión de PDF ---
  const triggerPrint = (type, orderId) => {
    const order = orders.find(o => o.id === orderId);
    const vehicle = vehicles.find(v => v.id === order.vehicleId);
    const client = customers.find(c => c.id === vehicle.customerId);
    setPrintDoc({ type, order, vehicle, client });
    setTimeout(() => window.print(), 500);
  };

  // --- Renderizado de Documento ---
  if (printDoc) {
    const { type, order, vehicle, client } = printDoc;
    const isBatteryHistory = type === 'BATTERY';
    const isCert = type === 'CERT';

    return (
      <div className="fixed inset-0 bg-white text-slate-900 z-[999] p-12 overflow-y-auto font-sans printable-area text-left">
        <button onClick={() => setPrintDoc(null)} className="fixed top-8 right-8 bg-slate-900 text-white p-3 rounded-full no-print shadow-xl">
          <X size={20}/>
        </button>
        
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">DeepFix<span className="text-blue-600 not-italic">OS</span></h1>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">Gestión Técnica y Economía Circular</p>
          </div>
          <div className="text-right">
            <div className="bg-slate-900 text-white px-5 py-2 text-xs font-black uppercase mb-2 leading-none">
              {isCert ? 'Certificado de Cumplimiento' : isBatteryHistory ? 'Hoja de Vida de Batería' : 'Comprobante de Servicio'}
            </div>
            <p className="text-xs font-bold uppercase">Activo: {vehicle.id}</p>
            <p className="text-[10px] text-slate-500">Fecha: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
           <div className="space-y-6">
              <section>
                 <h2 className="text-[10px] font-black uppercase text-blue-600 border-b border-slate-200 mb-3 pb-1">Identificación</h2>
                 <p className="text-xs"><strong>Cliente:</strong> {client.name}</p>
                 <p className="text-xs"><strong>Vehículo:</strong> {vehicle.model} ({vehicle.plate})</p>
                 <p className="text-xs"><strong>ID Chasis:</strong> {vehicle.id}</p>
                 <p className="text-xs"><strong>Técnico Responsable:</strong> {order.assignedTech}</p>
              </section>
              <section>
                 <h2 className="text-[10px] font-black uppercase text-blue-600 border-b border-slate-200 mb-3 pb-1">Estado Técnico</h2>
                 <p className="text-xs"><strong>Potencia Real ($P_{out}$):</strong> {vehicle.poutActual}W</p>
                 <p className="text-xs"><strong>Salud Batería (SoH):</strong> {vehicle.currentSoH}%</p>
                 <p className="text-xs"><strong>Destino Circular:</strong> {getCircularDestination(vehicle.currentSoH).label}</p>
              </section>
           </div>
           <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase">Validación SHA-256</p>
              <QrCode size={120} className="text-slate-900" />
              <p className="text-[8px] font-mono text-center break-all opacity-50 uppercase leading-relaxed px-4">
                DFOS_CERT_{vehicle.id}_{order.id}_{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
           </div>
        </div>

        {isBatteryHistory && (
          <div className="mb-12">
            <h2 className="text-[10px] font-black uppercase text-blue-600 border-b border-slate-200 mb-4 pb-1 italic">Bitácora de Trazabilidad</h2>
            <table className="w-full text-left text-[11px]">
               <thead>
                  <tr className="border-b-2 border-slate-100">
                     <th className="py-2">Etapa</th>
                     <th className="py-2">Documento</th>
                     <th className="py-2">Gestor</th>
                     <th className="py-2">Folio SIDREP</th>
                  </tr>
               </thead>
               <tbody>
                  <tr className="border-b border-slate-50">
                     <td className="py-3 font-bold">{vehicle.batteryTrace?.stage || 'Diagnóstico'}</td>
                     <td className="py-3">{vehicle.batteryTrace?.document || 'Acta Inicial'}</td>
                     <td className="py-3">{vehicle.batteryTrace?.gestor || 'DeepFix'}</td>
                     <td className="py-3">{vehicle.batteryTrace?.folio || 'N/A'}</td>
                  </tr>
               </tbody>
            </table>
          </div>
        )}

        {!isCert && !isBatteryHistory && (
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 mb-12">
            <h2 className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Resumen de Intervención ({order.workType})</h2>
            <p className="text-xs italic text-slate-700 leading-relaxed">"{order.workDetail}"</p>
            <div className="mt-6 pt-6 border-t border-slate-200">
               <p className="text-[9px] font-black text-slate-400 uppercase">Presupuesto Final</p>
               <p className="text-2xl font-black">${order.cost.toLocaleString()} CLP</p>
            </div>
          </div>
        )}

        <div className="mt-24 pt-10 border-t border-slate-200 grid grid-cols-2 gap-20 text-center">
           <div>
              <p className="text-xs font-black uppercase underline">{order.assignedTech}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Firma Técnico Perito</p>
           </div>
           <div>
              <p className="text-xs font-black uppercase underline">DeepFix OS Chile</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Sello de Cumplimiento Legal</p>
           </div>
        </div>
      </div>
    );
  }

  // --- Render Login ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 duration-500 text-center">
          <div className="flex flex-col items-center mb-10">
             <div className="bg-blue-600 p-4 rounded-3xl shadow-xl mb-6 shadow-blue-900/40">
                <RefreshCw className="text-white" size={32} />
             </div>
             <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">DeepFix<span className="text-blue-500 not-italic">OS</span></h1>
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-3">Peritaje de Electromovilidad</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5 text-left">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Usuario</label>
                <input type="text" placeholder="ej: administrador" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={loginForm.user} onChange={e => setLoginForm({...loginForm, user: e.target.value})} />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Contraseña</label>
                <input type="password" placeholder="••••••••" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
             </div>
             {loginError && <p className="text-red-400 text-[10px] font-bold uppercase text-center">{loginError}</p>}
             <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all mt-4 leading-none">Acceso Auditado</button>
          </form>
          <div className="mt-8 pt-8 border-t border-slate-800 flex justify-center space-x-6 opacity-20">
             <Shield size={16}/> <Recycle size={16}/> <Zap size={16}/>
          </div>
        </div>
      </div>
    );
  }

  // Extracción del icono de rol para evitar error de sintaxis JSX
  const CurrentRoleIcon = currentUser ? ROLES[currentUser.role].icon : Shield;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-800 bg-slate-900/40 p-8 flex flex-col no-print">
        <div className="flex items-center space-x-4 mb-12 px-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg"><RefreshCw size={20} className="text-white"/></div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none text-left">DeepFix<br/><span className="text-blue-500 not-italic text-[10px] tracking-[0.4em]">os1 - Chile</span></h1>
        </div>

        <nav className="space-y-2 flex-1 text-left">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
          </button>
          <button onClick={() => setView('orders')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${view === 'orders' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>
            <ClipboardList size={20} /> <span className="text-xs font-black uppercase tracking-widest">Órdenes</span>
          </button>
          {!isClient && (
            <button onClick={() => setView('customers')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${view === 'customers' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>
              <UserPlus size={20} /> <span className="text-xs font-black uppercase tracking-widest leading-none text-left">Clientes</span>
            </button>
          )}
        </nav>

        <div className="mt-auto space-y-4 border-t border-slate-800 pt-8 text-left">
           <div className="flex items-center space-x-3 p-3 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="bg-slate-800 p-2 rounded-xl shrink-0">
                 <CurrentRoleIcon size={16} className={ROLES[currentUser.role].color} />
              </div>
              <div className="overflow-hidden">
                 <p className="text-[10px] font-black text-white uppercase truncate">{currentUser.name}</p>
                 <p className="text-[8px] text-slate-500 font-bold uppercase">{ROLES[currentUser.role].label}</p>
              </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-3 p-4 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-500 rounded-2xl transition-all group">
              <LogOut size={16} /> <span className="text-[10px] font-black uppercase tracking-widest leading-none">Cerrar Sesión</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar text-left no-print">
        {view === 'dashboard' && (
          <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 text-left">
            <header className="flex justify-between items-end leading-none">
                <div className="text-left leading-none">
                   <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic">Monitor de Parque</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2 leading-none">Celdas de Litio y Cumplimiento Normativo</p>
                </div>
                {!isClient && isAuthUser && (
                   <button onClick={() => setIsNewVehicleModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-2xl text-[10px] font-black uppercase shadow-xl transition-all leading-none">Registrar Activo</button>
                )}
            </header>

            {/* Monitor Circular SoH */}
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl text-left">
               <h3 className="font-black text-xl mb-10 uppercase flex items-center italic tracking-tighter leading-none"><BatteryCharging className="mr-3 text-emerald-400" /> Trazabilidad de Salud de Baterías</h3>
               <div className="space-y-12">
                  {vehicles.map(v => {
                    const dest = getCircularDestination(v.currentSoH);
                    const DestIcon = dest.icon;
                    return (
                      <div key={v.id} className="space-y-4">
                        <div className="flex justify-between items-end px-2">
                           <div className="text-left">
                              <p className="text-xs font-black text-blue-500 uppercase leading-none">{v.id}</p>
                              <h4 className="text-lg font-black text-white uppercase leading-none mt-1">{v.model}</h4>
                           </div>
                           <div className={`px-4 py-1.5 rounded-xl bg-opacity-20 border border-current flex items-center space-x-2 ${dest.text}`}>
                              <DestIcon size={12}/>
                              <span className="text-[10px] font-black uppercase tracking-widest">{dest.label}</span>
                           </div>
                        </div>
                        <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden shadow-inner group">
                           <div className={`h-full transition-all duration-1000 ${dest.color}`} style={{ width: `${v.currentSoH}%` }}></div>
                           <div className="absolute top-0 left-[40%] bottom-0 w-0.5 bg-slate-950 opacity-40"></div>
                           <div className="absolute top-0 left-[80%] bottom-0 w-0.5 bg-slate-950 opacity-40"></div>
                        </div>
                        <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] px-1">
                           <span>Reciclaje (Ley REP)</span>
                           <span>Second Life (BESS)</span>
                           <span>Movilidad (Pedalear)</span>
                           <span>Estado Nuevo</span>
                        </div>
                      </div>
                    )
                  })}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
               <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl text-left">
                  <div className="flex justify-between items-start mb-6 text-left leading-none">
                    <div className="p-3 bg-blue-600/20 rounded-2xl"><Zap className="text-blue-400" size={24}/></div>
                    <p className="text-3xl font-black">250W</p>
                  </div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Cumplimiento Ley Retrofit</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">Activos auditados operando bajo el límite legal de potencia para ciclos livianos.</p>
               </div>
               <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl text-left">
                  <div className="flex justify-between items-start mb-6 text-left leading-none">
                    <div className="p-3 bg-red-600/20 rounded-2xl"><Recycle className="text-red-400" size={24}/></div>
                    <p className="text-3xl font-black">Ley REP</p>
                  </div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Revalorización de Residuos</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">Trazabilidad inmutable para la gestión responsable de baterías al final de su vida útil.</p>
               </div>
            </div>
          </div>
        )}

        {view === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto animate-in fade-in duration-700 pb-20 text-left">
             <div className="space-y-6 text-left">
                <div className="flex justify-between items-center mb-10 text-left leading-none">
                   <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Consola de Peritaje</h2>
                   {!isClient && (isTech || isAuthUser) && <button onClick={() => setIsNewOrderModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-xl transition-all leading-none">+ Nuevo Ticket</button>}
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[75vh] pr-4 custom-scrollbar text-left">
                   {orders.map(o => {
                     const v = vehicles.find(veh => veh.id === o.vehicleId);
                     return (
                       <div key={o.id} onClick={() => setSelectedOrderId(o.id)} className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden ${selectedOrderId === o.id ? 'border-blue-500 bg-blue-600/5 ring-4 ring-blue-500/5 shadow-2xl' : 'border-slate-800 bg-slate-900 shadow-lg'}`}>
                          <div className="flex justify-between items-start mb-4 text-left leading-none">
                             <div className="text-left leading-none">
                                <span className="text-[10px] font-black text-slate-600 uppercase leading-none">{o.id}</span>
                                <h4 className="font-black text-xl leading-none mt-2 uppercase tracking-tight">{v?.model}</h4>
                                <p className="text-[9px] font-bold text-blue-400 mt-2 uppercase leading-none">Perfil Técnico: {o.workType || 'Híbrido'}</p>
                             </div>
                             <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${o.status === 'Cerrada' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-blue-500 text-blue-400'}`}>{o.status}</span>
                          </div>
                          {o.status === 'Cerrada' && (
                            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-800/50 leading-none">
                               <button onClick={(e) => { e.stopPropagation(); triggerPrint('CERT', o.id); }} className="flex items-center space-x-2 text-[9px] font-black text-blue-400 uppercase hover:text-white transition-colors leading-none">
                                 <Printer size={12}/> <span>Certificado QR</span>
                               </button>
                               <button onClick={(e) => { e.stopPropagation(); triggerPrint('BATTERY', o.id); }} className="flex items-center space-x-2 text-[9px] font-black text-emerald-500 uppercase hover:text-white transition-colors leading-none">
                                 <Battery size={12}/> <span>Hoja Vida Litio</span>
                               </button>
                               <button onClick={(e) => { e.stopPropagation(); triggerPrint('WORK', o.id); }} className="flex items-center space-x-2 text-[9px] font-black text-slate-400 uppercase hover:text-white transition-colors leading-none">
                                 <FileCheck size={12}/> <span>Comprobante</span>
                               </button>
                            </div>
                          )}
                       </div>
                     )
                   })}
                </div>
             </div>

             <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-12 sticky top-0 h-fit shadow-2xl min-h-[600px] flex flex-col text-left leading-none">
                {selectedOrderId && orders.find(o => o.id === selectedOrderId) ? (
                  <div className="space-y-10 animate-in slide-in-from-right-8 duration-500 text-left leading-none">
                     <header className="flex justify-between items-start border-b border-slate-800 pb-10 text-left leading-none">
                        <div className="text-left leading-none">
                           <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{selectedOrderId}</h3>
                           <p className="text-slate-500 text-[10px] font-black mt-3 italic uppercase leading-none">Auditoría de Componentes Críticos</p>
                        </div>
                     </header>

                     {orders.find(o => o.id === selectedOrderId)?.status === 'Asignada' && (isTech || isAuthUser) && (
                       <form onSubmit={(e) => {
                         e.preventDefault();
                         const fd = new FormData(e.currentTarget);
                         const v_val = parseFloat(fd.get('v')) || 0;
                         const i_val = parseFloat(fd.get('i')) || 0;
                         const r_val = parseFloat(fd.get('r')) || 0;
                         const pout = calculatePout(v_val, i_val, r_val);
                         const cost = parseFloat(fd.get('cost')) || 0;
                         
                         setVehicles(prev => prev.map(v => v.id === orders.find(ord => ord.id === selectedOrderId).vehicleId ? {
                           ...v,
                           poutActual: parseFloat(pout),
                           currentSoH: parseInt(fd.get('soh')),
                           legalCompliance: parseFloat(pout) <= 250,
                           batteryTrace: {
                              stage: traceState.stage,
                              document: traceState.document,
                              gestor: traceState.gestor,
                              folio: fd.get('folio') || 'N/A',
                              date: fd.get('traceDate') || new Date().toLocaleDateString()
                           }
                         } : v));

                         handleUpdateOT(selectedOrderId, { 
                           workDetail: fd.get('detail'), 
                           cost: cost,
                           workType: fd.get('workType'),
                           status: (cost > UMBRAL_AUTORIZACION) ? 'Pendiente Autorización' : 'Cerrada' 
                         }, `Peritaje finalizado como ${fd.get('workType')}.`);
                       }} className="space-y-8 text-left leading-none">
                          
                          <div className="grid grid-cols-2 gap-4 text-left leading-none">
                             <div className="space-y-1 text-left leading-none">
                                <label className="text-[10px] font-black text-slate-600 uppercase ml-2 leading-none">Especialidad Perito</label>
                                <select name="workType" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-white outline-none appearance-none shadow-inner">
                                   <option value="Eléctrico">Eléctrico</option>
                                   <option value="Mecánico">Mecánico</option>
                                   <option value="Mixto">Híbrido (Mixto)</option>
                                </select>
                             </div>
                             <div className="space-y-1 text-left leading-none">
                                <label className="text-[10px] font-black text-slate-600 uppercase ml-2 leading-none">Salud Litio (SoH %)</label>
                                <input name="soh" type="number" required defaultValue="85" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-white outline-none shadow-inner" />
                             </div>
                          </div>

                          <div className="p-8 bg-slate-950/50 border border-slate-800 rounded-[2.5rem] space-y-6 text-left leading-none">
                             <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] flex items-center leading-none italic"><Battery size={14} className="mr-2"/> Trazabilidad Ley REP</p>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left leading-none">
                                <div className="space-y-1 leading-none text-left">
                                   <label className="text-[8px] font-black text-slate-600 uppercase ml-2">Selector A: Etapa</label>
                                   <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-[10px] text-white outline-none" value={traceState.stage} onChange={e => setTraceState({...traceState, stage: e.target.value})}>
                                      <option>Diagnóstico</option><option>Clasificación</option><option>Recuperación</option><option>Certificación</option>
                                   </select>
                                </div>
                                <div className="space-y-1 leading-none text-left">
                                   <label className="text-[8px] font-black text-slate-600 uppercase ml-2">Selector B: Acción</label>
                                   <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-[10px] text-white outline-none" value={traceState.document} onChange={e => setTraceState({...traceState, document: e.target.value})}>
                                      <option>Certificado de Disposición</option><option>Certificado de Reciclaje</option><option>Acta de BESS</option>
                                   </select>
                                </div>
                                <div className="space-y-1 leading-none text-left">
                                   <label className="text-[8px] font-black text-slate-600 uppercase ml-2">Selector C: Gestor</label>
                                   <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-[10px] text-white outline-none" value={traceState.gestor} onChange={e => setTraceState({...traceState, gestor: e.target.value})}>
                                      <option>REP Chile</option><option>Prolitio</option><option>Depura Rec.</option><option>Litio Electric</option><option>Otro</option>
                                   </select>
                                </div>
                             </div>

                             {(traceState.document === 'Certificado de Reciclaje' || traceState.document === 'Certificado de Disposición') && (
                               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 animate-in slide-in-from-top-2 duration-300 text-left">
                                  <div className="space-y-1 text-left leading-none">
                                     <label className="text-[8px] font-black text-red-500 uppercase ml-2 leading-none">Folio SIDREP</label>
                                     <input name="folio" required placeholder="SID-XXXX" className="w-full bg-slate-900 border border-red-500/20 rounded-xl px-4 py-3 text-[10px] text-white outline-none" />
                                  </div>
                                  <div className="space-y-1 text-left leading-none">
                                     <label className="text-[8px] font-black text-red-500 uppercase ml-2 leading-none">Fecha Emisión</label>
                                     <input name="traceDate" type="date" required className="w-full bg-slate-900 border border-red-500/20 rounded-xl px-4 py-3 text-[10px] text-white outline-none" />
                                  </div>
                               </div>
                             )}
                          </div>

                          <div className="p-8 bg-slate-950/50 border border-slate-800 rounded-[2.5rem] space-y-6 text-left leading-none">
                             <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] flex items-center leading-none italic"><Cpu size={14} className="mr-2"/> Motor de Reglas (Compliance)</p>
                             <div className="grid grid-cols-3 gap-4 text-left leading-none">
                                <input name="v" placeholder="Volt (V)" required type="number" step="0.1" className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-center leading-none" />
                                <input name="i" placeholder="Amp (I)" required type="number" step="0.1" className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-center leading-none" />
                                <input name="r" placeholder="Res (Ω)" required type="number" step="0.001" className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-center leading-none" />
                             </div>
                          </div>

                          <div className="space-y-6 text-left leading-none">
                             <textarea name="detail" required rows="3" className="w-full bg-slate-800 border border-slate-700 rounded-[2rem] p-10 text-sm outline-none text-white focus:ring-2 focus:ring-blue-500" placeholder="Análisis pericial detallado..."></textarea>
                             <div className="grid grid-cols-2 gap-6 items-end text-left leading-none">
                                <div className="space-y-2 text-left leading-none">
                                   <label className="text-[9px] font-black text-slate-600 uppercase ml-4 tracking-widest leading-none">Valorización ($)</label>
                                   <input name="cost" required type="number" defaultValue="0" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-8 py-5 text-xl font-black text-white shadow-inner outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-500 rounded-3xl font-black text-[11px] uppercase text-white shadow-xl transition-all h-[68px] tracking-[0.2em] leading-none">GENERAR AUDITORÍA</button>
                             </div>
                          </div>
                       </form>
                     )}

                     {orders.find(o => o.id === selectedOrderId)?.status === 'Pendiente Autorización' && isAuthUser && (
                       <div className="pt-10 border-t border-slate-800 space-y-8 animate-in fade-in duration-700 text-center leading-none">
                          <div className="bg-purple-600/10 border border-purple-500/30 p-10 rounded-[3rem] text-center shadow-inner leading-none">
                             <ShieldCheck size={48} className="text-purple-400 mx-auto mb-6 animate-pulse" />
                             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 mb-4 leading-none">Autorización Requerida</h4>
                             <p className="text-xs text-slate-400 italic px-8 mb-10 leading-relaxed text-center">El peritaje excede los $80.000. Requiere su firma para emitir certificados legales.</p>
                             <button onClick={() => handleUpdateOT(selectedOrderId, { status: 'Cerrada', isAuthorized: true }, 'Certificación autorizada por supervisión.')} className="w-full bg-purple-600 hover:bg-purple-500 py-6 rounded-[2rem] font-black text-xs uppercase text-white shadow-xl flex items-center justify-center transition-all tracking-[0.2em] leading-none">
                                <ThumbsUp size={20} className="mr-3"/> FIRMAR Y AUTORIZAR (OK)
                             </button>
                          </div>
                       </div>
                     )}

                     <div className="pt-12 border-t border-slate-800/50 text-left">
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-10 flex items-center italic font-bold tracking-widest leading-none text-left"><History size={16} className="mr-3" /> Bitácora Inmutable</h4>
                        <div className="space-y-8 relative text-left">
                           {(orders.find(o => o.id === selectedOrderId)?.logs || []).map((log, idx) => (
                             <div key={idx} className="flex gap-8 relative text-left leading-none">
                                <div className={`w-4 h-4 rounded-full mt-1.5 shrink-0 z-10 border-[4px] border-slate-950 ${idx === 0 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]' : 'bg-slate-700 opacity-50'}`}></div>
                                <div className="flex-1 text-left leading-none">
                                   <p className="text-xs font-black text-slate-200 uppercase tracking-widest leading-none mb-2 text-left">{log.action}</p>
                                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic opacity-80 leading-none text-left">{log.user} — {log.date}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-60 leading-none">
                     <RefreshCw size={120} className="mb-8" />
                     <p className="font-black text-3xl uppercase tracking-[0.5em] leading-none">AUDIT CORE</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {view === 'customers' && !isClient && (
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 text-left leading-none">
             <header className="flex justify-between items-end leading-none">
                <div className="text-left leading-none">
                   <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic">Mantenedor de Clientes</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2 leading-none">Gestión de Propiedad de Flota</p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-2xl text-[10px] font-black uppercase shadow-xl transition-all leading-none">+ Nuevo Titular</button>
             </header>

             <div className="grid grid-cols-1 gap-6 text-left leading-none">
                {customers.map(c => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] shadow-xl text-left leading-none">
                     <div className="flex justify-between items-start mb-8 border-b border-slate-800 pb-8 text-left leading-none">
                        <div className="text-left leading-none">
                           <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{c.name}</h4>
                           <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest leading-none">{c.email} | {c.phone}</p>
                        </div>
                        <div className="bg-slate-800 px-6 py-3 rounded-2xl text-center leading-none">
                           <p className="text-[9px] font-black text-slate-500 uppercase leading-none">Activos</p>
                           <p className="text-xl font-black text-emerald-400 leading-none mt-1">{vehicles.filter(v => v.customerId === c.id).length}</p>
                        </div>
                     </div>

                     <div className="space-y-4 text-left leading-none">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 flex items-center leading-none text-left italic leading-none"><Bike size={14} className="mr-2"/> Activos Bajo Gestión</p>
                        {vehicles.filter(v => v.customerId === c.id).map(v => (
                          <div key={v.id} className="flex items-center justify-between p-6 bg-slate-950/50 rounded-[2rem] border border-slate-800 group hover:border-blue-500/30 transition-all text-left leading-none">
                             <div className="text-left leading-none">
                                <p className="text-sm font-black text-white uppercase leading-none">{v.model}</p>
                                <p className="text-[9px] font-bold text-blue-500 mt-2 uppercase tracking-widest leading-none">SERIE: {v.id}</p>
                             </div>
                             <div className="flex items-center space-x-6 text-left leading-none">
                                <div className="text-right leading-none">
                                   <p className="text-[9px] font-black text-slate-500 uppercase leading-none">Potencia</p>
                                   <p className="text-xs font-bold text-white mt-1 leading-none">{v.poutActual}W</p>
                                </div>
                                {isAuthUser && (
                                  <button onClick={() => { setIsTransferModalOpen(v.id); }} className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all flex items-center leading-none">
                                     <ArrowLeftRight size={14} className="mr-2"/> Traspasar
                                  </button>
                                )}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>

      {/* Modal Traspaso */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-8">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[4rem] p-16 animate-in zoom-in-95 duration-500 shadow-2xl text-center leading-none">
              <h3 className="text-3xl font-black mb-8 text-white uppercase tracking-tighter italic text-center leading-none">Traspaso Legal</h3>
              <div className="space-y-4 mb-10 text-left leading-none">
                 {customers.map(c => (
                   <button key={c.id} onClick={() => {
                     setVehicles(prev => prev.map(v => v.id === isTransferModalOpen ? { ...v, customerId: c.id } : v));
                     setIsTransferModalOpen(null);
                   }} className="w-full p-6 bg-slate-950 border border-slate-800 rounded-[2rem] text-left hover:border-blue-500 transition-all group flex items-center justify-between leading-none">
                      <div className="leading-none text-left">
                         <p className="text-sm font-black text-white uppercase leading-none">{c.name}</p>
                         <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase leading-none">ID: {c.id}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                   </button>
                 ))}
              </div>
              <button onClick={() => setIsTransferModalOpen(null)} className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors leading-none">Cancelar Operación</button>
           </div>
        </div>
      )}

      {/* Estilos */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; height: auto; padding: 0; background: white !important; }
          .no-print { display: none !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );

  function handleUpdateOT(id, updates, logAction) {
    setOrders(prev => prev.map(o => o.id === id ? {
      ...o, ...updates, 
      logs: [...(o.logs || []), { action: logAction, user: currentUser.name, date: new Date().toLocaleString() }]
    } : o));
    if (updates.status === 'Cerrada') setSelectedOrderId(null);
  }
}
