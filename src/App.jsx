import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Bike, 
  BarChart2, 
  PlusCircle, 
  User, 
  Clock, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  FileEdit,
  DollarSign,
  Search, 
  ChevronRight, 
  X, 
  History, 
  Calendar, 
  Filter, 
  Download, 
  Activity, 
  Zap, 
  AlertTriangle, 
  Settings2, 
  ShieldCheck, 
  Briefcase, 
  Wrench, 
  ThumbsUp, 
  Paperclip, 
  File, 
  Trash2, 
  UploadCloud 
} from 'lucide-react';

// --- Roles de Usuario ---
const ROLES = {
  AUTORIZADOR: { id: 'AUTORIZADOR', label: 'Autorizador', icon: ShieldCheck, color: 'text-purple-400' },
  ASIGNADOR: { id: 'ASIGNADOR', label: 'Asignador', icon: Briefcase, color: 'text-orange-400' },
  EJECUTOR: { id: 'EJECUTOR', label: 'Ejecutor', icon: Wrench, color: 'text-blue-400' }
};

const APPROVAL_THRESHOLD = 80000;

const App = () => {
  // --- Estados de la Aplicación ---
  const [view, setView] = useState('dashboard');
  const [userRole, setUserRole] = useState(ROLES.AUTORIZADOR.id);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expenseThreshold, setExpenseThreshold] = useState(200000);

  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    tech: 'Todos',
    type: 'Todos'
  });

  const [vehicles, setVehicles] = useState([
    { id: 'V1', type: 'Bicicleta Eléctrica', model: 'EcoRide 500', plate: 'BE-2024-01' },
    { id: 'V2', type: 'Tricicleta Eléctrica', model: 'CargoPlus 3000', plate: 'TE-2024-99' },
    { id: 'V3', type: 'Bicicleta Eléctrica', model: 'Urban S1', plate: 'BE-2024-05' },
  ]);

  const [orders, setOrders] = useState([
    {
      id: 'OT-1001',
      vehicleId: 'V1',
      status: 'Cerrada',
      category: 'Correctivo',
      problemDescription: 'Falla en el sistema de frenado regenerativo.',
      assignedTech: 'Juan Técnico',
      workDetail: 'Se reemplazaron las pastillas de freno y se recalibró el sensor de torque.',
      cost: 45000,
      isAuthorized: true,
      attachments: [{ id: 1, name: 'evidencia_frenos.jpg', size: '1.2MB' }],
      dateAction: '2024-03-10',
      dateClosed: '2024-03-12',
      logs: [
        { action: 'Apertura del caso', user: 'Asignador_01', date: '2024-03-10 09:15' },
        { action: 'Asignación de técnico', user: 'Asignador_01', date: '2024-03-10 10:30' },
        { action: 'Cierre de trabajo', user: 'Juan Técnico', date: '2024-03-12 14:00' }
      ]
    },
    {
      id: 'OT-1005',
      vehicleId: 'V3',
      status: 'Pendiente Autorización',
      category: 'Correctivo',
      problemDescription: 'Cambio de motor central por falla crítica.',
      assignedTech: 'Roberto Tech',
      workDetail: 'Se requiere cambio completo de unidad motriz.',
      cost: 125000,
      isAuthorized: false,
      attachments: [{ id: 2, name: 'presupuesto_motor.pdf', size: '450KB' }],
      dateAction: '2024-03-22',
      dateClosed: null,
      logs: [
        { action: 'Apertura del caso', user: 'Asignador_01', date: '2024-03-21 10:00' },
        { action: 'Asignación de técnico', user: 'Asignador_01', date: '2024-03-21 11:00' },
        { action: 'Solicitud de autorización por costo', user: 'Roberto Tech', date: '2024-03-22 09:00' }
      ]
    }
  ]);

  // --- Lógica de Permisos ---
  const canModifyThreshold = userRole === ROLES.AUTORIZADOR.id;
  const canAddVehicle = userRole === ROLES.AUTORIZADOR.id || userRole === ROLES.ASIGNADOR.id;
  const canOpenOrder = userRole === ROLES.AUTORIZADOR.id || userRole === ROLES.ASIGNADOR.id;
  const canAssignOrder = userRole === ROLES.ASIGNADOR.id || userRole === ROLES.AUTORIZADOR.id;
  const canExecuteOrder = userRole === ROLES.EJECUTOR.id || userRole === ROLES.AUTORIZADOR.id;
  const canAuthorize = userRole === ROLES.AUTORIZADOR.id;

  // --- Cálculos de KPIs Dinámicos ---
  const stats = useMemo(() => {
    const activeMaintenance = orders.filter(o => o.status !== 'Cerrada').length;
    const availability = vehicles.length > 0 
      ? (((vehicles.length - activeMaintenance) / vehicles.length) * 100).toFixed(0)
      : 0;

    return { availability };
  }, [orders, vehicles]);

  // --- Handlers ---
  const handleAddVehicle = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newV = { 
      id: `V${Date.now()}`, 
      type: formData.get('type') || 'Bicicleta Eléctrica', 
      model: formData.get('model') || 'Modelo Genérico', 
      plate: formData.get('plate') || 'SIN-PATENTE' 
    };
    setVehicles([...vehicles, newV]);
    setIsNewVehicleModalOpen(false);
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newO = {
      id: `OT-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: formData.get('vehicleId'),
      status: 'Abierta',
      category: formData.get('category') || 'Correctivo',
      problemDescription: formData.get('problemDescription') || 'Sin descripción',
      assignedTech: null,
      workDetail: '',
      cost: 0,
      isAuthorized: false,
      attachments: [],
      dateAction: new Date().toISOString().split('T')[0],
      logs: [{ action: 'Apertura del caso', user: `${userRole}_01`, date: new Date().toLocaleString() }]
    };
    setOrders([newO, ...orders]);
    setIsNewOrderModalOpen(false);
  };

  const updateOrderStep = (id, updates, logAction) => {
    setOrders(orders.map(o => {
      if (o.id === id) {
        return {
          ...o,
          ...updates,
          logs: [...(o.logs || []), { action: logAction, user: `${userRole}_01`, date: new Date().toLocaleString() }]
        };
      }
      return o;
    }));
    setSelectedOrder(null);
  };

  const handleFileUpload = (id, fileName) => {
    const newFile = { id: Date.now(), name: fileName, size: '2.4MB' };
    setOrders(orders.map(o => {
      if (o.id === id) {
        return {
          ...o,
          attachments: [...(o.attachments || []), newFile],
          logs: [...(o.logs || []), { action: `Carga de archivo: ${fileName}`, user: `${userRole}_01`, date: new Date().toLocaleString() }]
        };
      }
      return o;
    }));
  };

  const handleAuthorize = (id) => {
    setOrders(orders.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: 'Asignada',
          isAuthorized: true,
          logs: [...(o.logs || []), { action: 'Autorización de costo excedente concedida', user: `${userRole}_01`, date: new Date().toLocaleString() }]
        };
      }
      return o;
    }));
    setSelectedOrder(null);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-800 bg-slate-900/40 p-10 flex flex-col">
        <div className="flex items-center space-x-4 mb-12">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-900/40">
            <Settings2 className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-black text-white leading-none tracking-tighter">MANTENCIÓN<br/><span className="text-[10px] font-bold text-blue-500 tracking-[0.3em]">ACTIVOS</span></h1>
        </div>
        
        <nav className="space-y-3 flex-1">
          <button onClick={() => setView('dashboard')} className={`w-full text-left flex items-center space-x-4 px-6 py-4 rounded-[1.5rem] transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Dashboard</span>
          </button>
          <button onClick={() => setView('orders')} className={`w-full text-left flex items-center space-x-4 px-6 py-4 rounded-[1.5rem] transition-all ${view === 'orders' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>
            <ClipboardList size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Órdenes Trabajo</span>
          </button>
        </nav>

        <div className="mt-auto space-y-4">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">Perfil Activo</p>
          <div className="grid grid-cols-1 gap-2">
            {Object.values(ROLES).map(role => (
              <button key={role.id} onClick={() => { setUserRole(role.id); setSelectedOrder(null); }} className={`flex items-center space-x-3 p-3 rounded-2xl border transition-all ${userRole === role.id ? 'bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                <role.icon size={16} className={role.color} />
                <span className="text-[10px] font-bold uppercase text-white">{role.label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-950 p-16 custom-scrollbar text-left">
        {view === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             {canAuthorize && orders.some(o => o.status === 'Pendiente Autorización') && (
              <div className="bg-purple-500/10 border border-purple-500/30 p-5 rounded-[2rem] flex items-center justify-between shadow-lg text-left">
                <div className="flex items-center space-x-4 text-purple-400">
                  <ShieldCheck size={24} />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em]">Autorizaciones Pendientes</p>
                    <p className="text-[10px] opacity-80">Hay trabajos que superan los ${APPROVAL_THRESHOLD.toLocaleString()} esperando su validación.</p>
                  </div>
                </div>
                <button onClick={() => setView('orders')} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Revisar</button>
              </div>
            )}
            
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
              <div className="text-left">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Panel Operativo</h2>
                <p className="text-slate-500 text-sm mt-2 uppercase tracking-widest font-bold">Gestión de Flota y Auditoría Técnica</p>
              </div>
              <div className="flex gap-4">
                 {canAddVehicle && <button onClick={() => setIsNewVehicleModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all">Registrar Vehículo</button>}
                 {canOpenOrder && <button onClick={() => setIsNewOrderModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all">Apertura OT</button>}
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl text-center">
                <Activity className="text-blue-400 mx-auto mb-6" size={24} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Disponibilidad Flota</h3>
                <p className="text-5xl font-black tracking-tighter text-white">{stats.availability}%</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl text-center">
                <ShieldCheck className="text-purple-400 mx-auto mb-6" size={24} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Umbral Aprobación</h3>
                <p className="text-5xl font-black tracking-tighter text-white">${(APPROVAL_THRESHOLD/1000).toFixed(0)}k</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl text-center">
                <FileEdit className="text-emerald-400 mx-auto mb-6" size={24} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">OTs Activas</h3>
                <p className="text-5xl font-black tracking-tighter text-white">{orders.filter(o => o.status !== 'Cerrada').length}</p>
              </div>
            </div>
          </div>
        )}

        {view === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500 text-left">
            <div className="space-y-6 text-left">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-10">Intervenciones</h2>
              <div className="space-y-4 text-left">
                {orders.map(o => (
                  <div key={o.id} onClick={() => setSelectedOrder(o)} className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden ${selectedOrder?.id === o.id ? 'border-blue-500 bg-blue-600/5 ring-4 ring-blue-500/5 shadow-2xl' : 'border-slate-800 bg-slate-900 hover:border-slate-700 shadow-lg'}`}>
                    <div className="flex justify-between items-start mb-4 text-left">
                      <div className="text-left">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">{o.id}</span>
                        <h4 className="font-black text-xl tracking-tight mt-2">{vehicles.find(v => v.id === o.vehicleId)?.model || 'Vehículo desconocido'}</h4>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                        o.status === 'Abierta' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 
                        o.status === 'Asignada' ? 'border-orange-500 text-orange-400 bg-orange-500/10' : 
                        o.status === 'Pendiente Autorización' ? 'border-purple-500 text-purple-400 bg-purple-500/10 animate-pulse' :
                        'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                      }`}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 sticky top-0 h-fit shadow-2xl min-h-[600px] transition-all text-left">
              {selectedOrder ? (
                <div className="space-y-10 animate-in slide-in-from-right-8 duration-500 text-left">
                  <header className="flex justify-between items-start border-b border-slate-800 pb-10 text-left">
                    <div className="text-left">
                      <h3 className="text-4xl font-black text-white tracking-tighter leading-none mb-3">{selectedOrder.id}</h3>
                      <p className="text-slate-500 text-[10px] uppercase font-black mt-1">Status: <span className="text-blue-500">{selectedOrder.status}</span></p>
                    </div>
                    <div className="bg-slate-800 p-5 rounded-3xl text-center border border-slate-700 min-w-[120px] shadow-inner">
                      <p className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest leading-none">Costo</p>
                      <p className="text-2xl font-black text-white leading-none">${(selectedOrder.cost || 0).toLocaleString()}</p>
                    </div>
                  </header>

                  {/* Acciones de Flujo (Asignación) */}
                  {selectedOrder.status === 'Abierta' && (
                    <div className={`pt-10 border-t border-slate-800 space-y-6 ${!canAssignOrder ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                      <label className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] flex items-center leading-none"><UserPlus size={16} className="mr-2" /> Asignación de Técnico</label>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        updateOrderStep(selectedOrder.id, { assignedTech: formData.get('tech'), status: 'Asignada' }, 'Asignación de técnico responsable');
                      }} className="flex gap-4">
                        <input name="tech" required placeholder="Nombre del Técnico Ejecutor..." className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-orange-500 shadow-inner" />
                        <button type="submit" className="bg-orange-600 hover:bg-orange-500 px-8 rounded-2xl font-black text-[10px] tracking-widest uppercase text-white shadow-xl transition-all">Asignar</button>
                      </form>
                    </div>
                  )}

                  {/* Acciones de Flujo (Ejecución) */}
                  {selectedOrder.status === 'Asignada' && (
                    <div className={`pt-10 border-t border-slate-800 space-y-8 ${!canExecuteOrder ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                      <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center leading-none"><Wrench size={16} className="mr-2" /> Análisis Técnico y Ejecución</label>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const cost = parseFloat(formData.get('cost')) || 0;
                        const workDetail = formData.get('workDetail');
                        
                        if (cost > APPROVAL_THRESHOLD && !selectedOrder.isAuthorized) {
                          updateOrderStep(selectedOrder.id, { workDetail, cost, status: 'Pendiente Autorización' }, 'Solicitud de autorización por costo excedente enviada');
                        } else {
                          updateOrderStep(selectedOrder.id, { workDetail, cost, status: 'Cerrada' }, 'Cierre de trabajo finalizado y auditado');
                        }
                      }} className="space-y-6">
                        <textarea required name="workDetail" rows="4" className="w-full bg-slate-800 border border-slate-700 rounded-[2rem] p-8 text-sm outline-none leading-relaxed text-white focus:ring-2 focus:ring-blue-500 shadow-inner" placeholder="Descripción Trabajos Ejecutados..."></textarea>
                        <div className="grid grid-cols-2 gap-6 text-left">
                          <div className="space-y-2 text-left">
                            <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Costo Incurrido ($)</label>
                            <input required name="cost" type="number" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm font-black text-white shadow-inner outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                          </div>
                          <button type="submit" className="bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-white shadow-2xl transition-all self-end h-[52px]">
                            Procesar Cierre
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Solicitud de Autorización */}
                  {selectedOrder.status === 'Pendiente Autorización' && (
                    <div className="pt-10 border-t border-slate-800 space-y-6 text-center">
                      <div className="bg-purple-600/10 border border-purple-500/30 p-10 rounded-[3rem] text-center shadow-inner">
                        <AlertTriangle size={48} className="text-purple-400 mx-auto mb-6 animate-pulse" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-purple-400 mb-3 leading-none">Aprobación Pendiente</h4>
                        <p className="text-xs text-slate-400 mb-10 italic leading-relaxed px-10">La intervención de <strong>${(selectedOrder.cost || 0).toLocaleString()}</strong> supera el límite técnico permitido para cierre inmediato.</p>
                        {canAuthorize ? (
                          <button onClick={() => handleAuthorize(selectedOrder.id)} className="w-full bg-purple-600 hover:bg-purple-500 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest text-white flex items-center justify-center transition-all shadow-xl shadow-purple-900/20">
                            <ThumbsUp size={20} className="mr-3" /> Autorizar Gasto
                          </button>
                        ) : (
                          <div className="py-6 border-2 border-dashed border-slate-800 rounded-3xl">
                             <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Esperando validación de nivel Autorizador</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Log de Auditoría */}
                  <div className="pt-12 border-t border-slate-800/50 text-left">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-12 flex items-center leading-none italic"><History size={16} className="mr-3" /> historial de trazabilidad</h4>
                    <div className="space-y-10 relative text-left">
                      {(selectedOrder.logs || []).map((log, idx) => (
                        <div key={idx} className="flex gap-8 relative text-left">
                          <div className={`w-4 h-4 rounded-full mt-1.5 shrink-0 z-10 border-[4px] border-slate-950 shadow-2xl transition-all ${idx === selectedOrder.logs.length - 1 ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-125' : 'bg-slate-700 opacity-50'}`}></div>
                          <div className="flex-1 text-left">
                            <p className="text-xs font-black text-slate-200 uppercase tracking-widest leading-none mb-2">{log.action}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic opacity-80 leading-none">Auditado: {log.user} — {log.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-48">
                  <Activity size={150} className="mb-12 text-slate-700" />
                  <p className="font-black text-3xl uppercase tracking-[0.5em]">DEEPFIX OS</p>
                  <p className="text-sm mt-6 font-bold tracking-[0.3em] uppercase opacity-60 leading-none">Seleccione una intervención para auditar</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modales */}
      {isNewVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[4rem] p-16 animate-in zoom-in-95 duration-500 shadow-2xl">
            <h3 className="text-3xl font-black mb-12 text-white uppercase tracking-tighter text-center leading-none">Registrar Activo</h3>
            <form onSubmit={handleAddVehicle} className="space-y-8 text-left">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 leading-none">Tipo de Vehículo</label>
                <select name="type" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-inner">
                  <option value="Bicicleta Eléctrica">Bicicleta Eléctrica</option>
                  <option value="Tricicleta Eléctrica">Tricicleta Eléctrica</option>
                </select>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 leading-none">Modelo / Marca</label>
                <input name="model" required className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" placeholder="Ej: EcoXT 500w" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 leading-none">Patente / Identificador</label>
                <input name="plate" required className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-mono font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 uppercase shadow-inner" placeholder="XXX-000" />
              </div>
              <div className="flex gap-4 pt-8 text-center">
                <button type="button" onClick={() => setIsNewVehicleModalOpen(false)} className="flex-1 py-6 rounded-[2rem] font-black text-[11px] bg-slate-800 uppercase text-slate-400 hover:text-white transition-all tracking-widest leading-none">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-6 rounded-[2rem] font-black text-[11px] uppercase text-white shadow-2xl tracking-widest leading-none">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-8 text-left">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[4.5rem] p-20 animate-in zoom-in-95 duration-500 shadow-2xl text-left">
            <h3 className="text-4xl font-black mb-10 text-white uppercase tracking-tighter leading-none text-left">Apertura OT</h3>
            <form onSubmit={handleCreateOrder} className="space-y-8 text-left">
              <div className="grid grid-cols-2 gap-6 text-left">
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 leading-none">Seleccionar Activo</label>
                    <select name="vehicleId" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-inner text-left">
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.model} ({v.plate})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 leading-none">Categoría</label>
                    <select name="category" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-inner text-left">
                      <option value="Correctivo">Correctivo</option>
                      <option value="Preventivo">Preventivo</option>
                    </select>
                  </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 leading-none">Descripción Inicial</label>
                <textarea name="problemDescription" required rows="4" className="w-full bg-slate-950 border border-slate-800 rounded-[3rem] p-10 text-sm font-medium leading-relaxed text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner text-left" placeholder="Detalle técnico inicial..."></textarea>
              </div>
              <div className="flex gap-4 pt-6 text-center">
                <button type="button" onClick={() => setIsNewOrderModalOpen(false)} className="flex-1 py-6 rounded-[2.5rem] font-black text-[11px] bg-slate-800 uppercase text-slate-400 tracking-widest transition-all leading-none">Cerrar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-6 rounded-[2.5rem] font-black text-[11px] uppercase text-white shadow-2xl tracking-widest transition-all leading-none">Iniciar OT</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
