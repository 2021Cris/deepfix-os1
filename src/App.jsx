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
  CheckCircle2, import React, { useState, useMemo } from 'react';
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
    const closedOrders = orders.filter(o => o.status === 'Cerrada');
    const vehicleExpenses = vehicles.map(v => {
      const total = orders
        .filter(o => o.vehicleId === v.id && o.status === 'Cerrada')
        .reduce((acc, curr) => acc + (curr.cost || 0), 0);
      return { ...v, total };
    });
    const alertedVehicles = vehicleExpenses.filter(v => v.total > expenseThreshold);
    
    // Cálculo de disponibilidad seguro (evita división por cero)
    const activeMaintenance = orders.filter(o => o.status !== 'Cerrada').length;
    const availability = vehicles.length > 0 
      ? (((vehicles.length - activeMaintenance) / vehicles.length) * 100).toFixed(0)
      : 0;

    return { availability, alertedVehicles, vehicleExpenses };
  }, [orders, vehicles, expenseThreshold]);

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
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), newFile]
      }));
    }
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

      <main className="flex-1 overflow-y-auto bg-slate-950 p-16 custom-scrollbar">
        {view === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             {canAuthorize && orders.some(o => o.status === 'Pendiente Autorización') && (
              <div className="bg-purple-500/10 border border-purple-500/30 p-5 rounded-[2rem] flex items-center justify-between shadow-lg">
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
            
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Panel Operativo</h2>
                <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Gestión de Flota y Auditoría Técnica</p>
              </div>
              <div className="flex gap-4">
                 {canAddVehicle && <button onClick={() => setIsNewVehicleModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all">Registrar Vehículo</button>}
                 {canOpenOrder && <button onClick={() => setIsNewOrderModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all">Apertura OT</button>}
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                <Activity className="text-blue-400 mb-6" size={24} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Disponibilidad Flota</h3>
                <p className="text-5xl font-black mb-2 tracking-tighter text-white">{stats.availability}%</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                <ShieldCheck className="text-purple-400 mb-6" size={24} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Umbral Aprobación</h3>
                <p className="text-5xl font-black mb-2 tracking-tighter text-white">${(APPROVAL_THRESHOLD/1000).toFixed(0)}k</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                <FileEdit className="text-emerald-400 mb-6" size={24} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">OTs Activas</h3>
                <p className="text-5xl font-black mb-2 tracking-tighter text-white">{orders.filter(o => o.status !== 'Cerrada').length}</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
              <h3 className="font-black text-xl mb-8 uppercase flex items-center tracking-tighter">
                <Paperclip className="mr-3 text-blue-500" size={24} /> Últimos Documentos Cargados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.flatMap(o => (o.attachments || []).map(a => ({ ...a, ot: o.id }))).slice(0, 6).map((file, i) => (
                  <div key={i} className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700 flex items-center space-x-4 group hover:bg-slate-800 transition-all shadow-sm">
                    <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <File size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-slate-200 truncate">{file.name}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black">{file.ot} — {file.size}</p>
                    </div>
                  </div>
                ))}
                {orders.every(o => (o.attachments || []).length === 0) && (
                  <div className="col-span-full py-10 text-center text-slate-600 italic uppercase text-[10px] tracking-widest border-2 border-dashed border-slate-800 rounded-[2rem]">
                    No hay archivos de evidencia registrados
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
            <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-10">Intervenciones</h2>
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} onClick={() => setSelectedOrder(o)} className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden ${selectedOrder?.id === o.id ? 'border-blue-500 bg-blue-600/5 ring-4 ring-blue-500/5 shadow-2xl' : 'border-slate-800 bg-slate-900 hover:border-slate-700 shadow-lg'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{o.id}</span>
                        <h4 className="font-black text-xl tracking-tight">{vehicles.find(v => v.id === o.vehicleId)?.model || 'Vehículo desconocido'}</h4>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                        o.status === 'Abierta' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 
                        o.status === 'Asignada' ? 'border-orange-500 text-orange-400 bg-orange-500/10' : 
                        o.status === 'Pendiente Autorización' ? 'border-purple-500 text-purple-400 bg-purple-500/10 animate-pulse' :
                        'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                      }`}>{o.status}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                      <Paperclip size={12} />
                      <span>{(o.attachments || []).length} archivos adjuntos</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 sticky top-0 h-fit shadow-2xl min-h-[600px] transition-all">
              {selectedOrder ? (
                <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                  <header className="flex justify-between items-start border-b border-slate-800 pb-10">
                    <div className="text-left">
                      <h3 className="text-4xl font-black text-white tracking-tighter leading-none mb-3">{selectedOrder.id}</h3>
                      <p className="text-slate-500 text-[10px] uppercase font-black mt-1">Status: <span className="text-blue-500">{selectedOrder.status}</span></p>
                    </div>
                    <div className="bg-slate-800 p-5 rounded-3xl text-center border border-slate-700 min-w-[120px] shadow-inner">
                      <p className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest leading-none">Costo</p>
                      <p className="text-2xl font-black text-white leading-none">${(selectedOrder.cost || 0).toLocaleString()}</p>
                    </div>
                  </header>

                  {/* Sección de Archivos */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center leading-none"><Paperclip size={14} className="mr-2" /> Archivos y Evidencia</label>
                       {canExecuteOrder && selectedOrder.status !== 'Cerrada' && (
                         <div className="relative">
                            <input type="file" className="hidden" id="fileInput" onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleFileUpload(selectedOrder.id, file.name);
                            }} />
                            <label htmlFor="fileInput" className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-[9px] font-bold uppercase px-4 py-2 rounded-xl border border-slate-700 flex items-center transition-all shadow-sm">
                              <UploadCloud size={14} className="mr-2" /> Cargar Nuevo
                            </label>
                         </div>
                       )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {(selectedOrder.attachments || []).map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-800 group hover:border-blue-500/50 transition-all shadow-sm">
                          <div className="flex items-center space-x-3 text-left overflow-hidden">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0"><File size={16} /></div>
                            <span className="text-xs font-bold text-slate-300 truncate">{file.name}</span>
                          </div>
                          <div className="flex items-center space-x-3 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                             <span className="text-[9px] text-slate-600 font-black uppercase">{file.size}</span>
                             <button className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                      {(selectedOrder.attachments || []).length === 0 && (
                        <div className="py-8 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center opacity-30 text-center">
                          <UploadCloud size={32} className="mb-2" />
                          <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Esperando carga de archivos técnicos</p>
                        </div>
                      )}
                    </div>
                  </div>

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
                        <textarea required name="workDetail" rows="4" className="w-full bg-slate-800 border border-slate-700 rounded-[2rem] p-8 text-sm outline-none leading-relaxed text-white focus:ring-2 focus:ring-blue-500 shadow-inner" placeholder="Descripción Trabajos Ejecutados e ingreso de análisis técnico..."></textarea>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Costo Incurrido ($)</label>
                            <input required name="cost" type="number" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm font-black text-white shadow-inner outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                          </div>
                          <button type="submit" className="bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-white shadow-2xl transition-all self-end h-[52px]">
                            Procesar Cierre / OK
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Solicitud de Autorización */}
                  {selectedOrder.status === 'Pendiente Autorización' && (
                    <div className="pt-10 border-t border-slate-800 space-y-6">
                      <div className="bg-purple-600/10 border border-purple-500/30 p-10 rounded-[3rem] text-center shadow-inner">
                        <AlertTriangle size={48} className="text-purple-400 mx-auto mb-6 animate-pulse" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-purple-400 mb-3">Esperando Aprobación de Costo</h4>
                        <p className="text-xs text-slate-400 mb-10 italic leading-relaxed px-10">La intervención de <strong>${(selectedOrder.cost || 0).toLocaleString()}</strong> supera el límite técnico permitido para cierre inmediato.</p>
                        {canAuthorize ? (
                          <button onClick={() => handleAuthorize(selectedOrder.id)} className="w-full bg-purple-600 hover:bg-purple-500 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest text-white flex items-center justify-center transition-all shadow-xl shadow-purple-900/20">
                            <ThumbsUp size={20} className="mr-3" /> Dar OK (Autorizar Gasto)
                          </button>
                        ) : (
                          <div className="py-6 border-2 border-dashed border-slate-800 rounded-3xl">
                             <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">A la espera de validación por Autorizador</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Log de Auditoría (Historia de vida útil) */}
                  <div className="pt-12 border-t border-slate-800/50 text-left">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-12 flex items-center leading-none italic"><History size={16} className="mr-3" /> historial de mantencion y reparacion de activos</h4>
                    <div className="space-y-10 relative">
                      {(selectedOrder.logs || []).map((log, idx) => (
                        <div key={idx} className="flex gap-8 relative">
                          {idx !== selectedOrder.logs.length - 1 && <div className="absolute left-[7px] top-4 bottom-[-44px] w-px bg-slate-800 shadow-sm"></div>}
                          <div className={`w-4 h-4 rounded-full mt-1.5 shrink-0 z-10 border-[4px] border-slate-950 shadow-2xl transition-all ${idx === selectedOrder.logs.length - 1 ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-125' : 'bg-slate-700 opacity-50'}`}></div>
                          <div className="flex-1">
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
                  <p className="font-black text-3xl uppercase tracking-[0.5em]">MONITOR TÉCNICO</p>
                  <p className="text-sm mt-6 font-bold tracking-[0.3em] uppercase opacity-60 leading-none">Seleccione una intervención para auditar</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modales de Gestión */}
      {isNewVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[4rem] p-16 animate-in zoom-in-95 duration-500 shadow-2xl shadow-blue-900/10">
            <h3 className="text-3xl font-black mb-12 text-white uppercase tracking-tighter text-center">Registrar Activo</h3>
            <form onSubmit={handleAddVehicle} className="space-y-8">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Tipo de Activo</label>
                <select name="type" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-inner">
                  <option value="Bicicleta Eléctrica">Bicicleta Eléctrica</option>
                  <option value="Tricicleta Eléctrica">Tricicleta Eléctrica</option>
                </select>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Modelo / Marca</label>
                <input name="model" required className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" placeholder="Ej: EcoXT 500w" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Patente / Identificador</label>
                <input name="plate" required className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-mono font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 uppercase shadow-inner" placeholder="XXX-000" />
              </div>
              <div className="flex gap-4 pt-8">
                <button type="button" onClick={() => setIsNewVehicleModalOpen(false)} className="flex-1 py-6 rounded-[2rem] font-black text-[11px] bg-slate-800 uppercase text-slate-400 hover:text-white transition-all tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-6 rounded-[2rem] font-black text-[11px] uppercase text-white shadow-2xl tracking-widest transition-all">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[4.5rem] p-20 animate-in zoom-in-95 duration-500 shadow-2xl shadow-blue-900/10">
            <h3 className="text-4xl font-black mb-10 text-white uppercase tracking-tighter leading-none">Apertura OT</h3>
            <form onSubmit={handleCreateOrder} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Seleccionar Activo</label>
                    <select name="vehicleId" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-inner">
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.model} ({v.plate})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Categoría</label>
                    <select name="category" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-inner">
                      <option value="Correctivo">Correctivo</option>
                      <option value="Preventivo">Preventivo</option>
                    </select>
                  </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Descripción Problema (Apertura)</label>
                <textarea name="problemDescription" required rows="4" className="w-full bg-slate-950 border border-slate-800 rounded-[3rem] p-10 text-sm font-medium leading-relaxed text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" placeholder="Detalle técnico inicial..."></textarea>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsNewOrderModalOpen(false)} className="flex-1 py-6 rounded-[2.5rem] font-black text-[11px] bg-slate-800 uppercase text-slate-400 tracking-widest transition-all">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-6 rounded-[2.5rem] font-black text-[11px] uppercase text-white shadow-2xl tracking-widest transition-all">Iniciar OT</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
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

  // --- Cálculos ---
  const stats = useMemo(() => {
    const closedOrders = orders.filter(o => o.status === 'Cerrada');
    const vehicleExpenses = vehicles.map(v => {
      const total = orders.filter(o => o.vehicleId === v.id && o.status === 'Cerrada')
                          .reduce((acc, curr) => acc + curr.cost, 0);
      return { ...v, total };
    });
    const alertedVehicles = vehicleExpenses.filter(v => v.total > expenseThreshold);
    const availability = (((vehicles.length - orders.filter(o => o.status !== 'Cerrada').length) / vehicles.length) * 100).toFixed(0);

    return { availability, alertedVehicles, vehicleExpenses };
  }, [orders, vehicles, expenseThreshold]);

  // --- Handlers ---
  const handleAddVehicle = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newV = { id: `V${Date.now()}`, type: formData.get('type'), model: formData.get('model'), plate: formData.get('plate') };
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
      category: formData.get('category'),
      problemDescription: formData.get('problemDescription'),
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
          logs: [...o.logs, { action: logAction, user: `${userRole}_01`, date: new Date().toLocaleString() }]
        };
      }
      return o;
    }));
    setSelectedOrder(null);
  };

  const handleFileUpload = (id, fileName) => {
    setOrders(orders.map(o => {
      if (o.id === id) {
        const newFile = { id: Date.now(), name: fileName, size: '2.4MB' };
        return {
          ...o,
          attachments: [...o.attachments, newFile],
          logs: [...o.logs, { action: `Carga de archivo: ${fileName}`, user: `${userRole}_01`, date: new Date().toLocaleString() }]
        };
      }
      return o;
    }));
    // Actualizar el seleccionado si está abierto
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder(prev => ({
        ...prev,
        attachments: [...prev.attachments, { id: Date.now(), name: fileName, size: '2.4MB' }]
      }));
    }
  };

  const handleAuthorize = (id) => {
    setOrders(orders.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: 'Asignada',
          isAuthorized: true,
          logs: [...o.logs, { action: 'Autorización de costo excedente concedida', user: `${userRole}_01`, date: new Date().toLocaleString() }]
        };
      }
      return o;
    }));
    setSelectedOrder(null);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      <aside className="w-72 border-r border-slate-800 bg-slate-900/40 p-10 flex flex-col">
        <div className="flex items-center space-x-4 mb-12">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-900/40">
            <Settings2 className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-black text-white leading-none tracking-tighter">MANTENCIÓN<br/><span className="text-[10px] font-bold text-blue-500 tracking-[0.3em]">ACTIVOS</span></h1>
        </div>
        
        <nav className="space-y-3 flex-1">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-[1.5rem] transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Dashboard</span>
          </button>
          <button onClick={() => setView('orders')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-[1.5rem] transition-all ${view === 'orders' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
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

      <main className="flex-1 overflow-y-auto bg-slate-950 p-16">
        {view === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             {canAuthorize && orders.some(o => o.status === 'Pendiente Autorización') && (
              <div className="bg-purple-500/10 border border-purple-500/30 p-5 rounded-[2rem] flex items-center justify-between">
                <div className="flex items-center space-x-4 text-purple-400">
                  <ShieldCheck size={24} />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em]">Autorizaciones Pendientes</p>
                    <p className="text-[10px] opacity-80">Hay trabajos que superan los ${APPROVAL_THRESHOLD.toLocaleString()} esperando su validación.</p>
                  </div>
                </div>
                <button onClick={() => setView('orders')} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Revisar</button>
              </div>
            )}
            
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter">Panel Operativo</h2>
                <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Gestión de Flota y Carga de Archivos</p>
              </div>
              <div className="flex gap-4">
                 {canAddVehicle && <button onClick={() => setIsNewVehicleModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700">Registrar Vehículo</button>}
                 {canOpenOrder && <button onClick={() => setIsNewOrderModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/40">Apertura OT</button>}
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
                <Activity className="text-blue-400 mb-6" size={24} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Disponibilidad Flota</h3>
                <p className="text-5xl font-black mb-2 tracking-tighter text-white">{stats.availability}%</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
                <ShieldCheck className="text-purple-400 mb-6" size={24} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Umbral Aprobación</h3>
                <p className="text-5xl font-black mb-2 tracking-tighter text-white">${(APPROVAL_THRESHOLD/1000).toFixed(0)}k</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
                <FileEdit className="text-emerald-400 mb-6" size={24} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">OTs Activas</h3>
                <p className="text-5xl font-black mb-2 tracking-tighter text-white">{orders.filter(o => o.status !== 'Cerrada').length}</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10">
              <h3 className="font-black text-xl mb-8 uppercase flex items-center">
                <Paperclip className="mr-2 text-blue-500" size={24} /> Últimos Documentos Cargados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.flatMap(o => o.attachments.map(a => ({ ...a, ot: o.id }))).slice(0, 6).map((file, i) => (
                  <div key={i} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex items-center space-x-3 group hover:bg-slate-800 transition-all">
                    <div className="bg-blue-500/10 p-2 rounded-xl text-blue-400">
                      <File size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-slate-200 truncate">{file.name}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black">{file.ot} — {file.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
            <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Intervenciones</h2>
              {orders.map(o => (
                <div key={o.id} onClick={() => setSelectedOrder(o)} className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer ${selectedOrder?.id === o.id ? 'border-blue-500 bg-blue-600/5 ring-4 ring-blue-500/5 shadow-2xl' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{o.id}</span>
                      <h4 className="font-black text-xl tracking-tight">{vehicles.find(v => v.id === o.vehicleId)?.model}</h4>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      o.status === 'Abierta' ? 'border-blue-500 text-blue-400' : 
                      o.status === 'Asignada' ? 'border-orange-500 text-orange-400' : 
                      o.status === 'Pendiente Autorización' ? 'border-purple-500 text-purple-400 animate-pulse' : 'border-emerald-500 text-emerald-400'
                    }`}>{o.status}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-bold uppercase">
                    <Paperclip size={12} />
                    <span>{o.attachments.length} archivos adjuntos</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 sticky top-0 h-fit shadow-2xl min-h-[600px]">
              {selectedOrder ? (
                <div className="space-y-10">
                  <header className="flex justify-between items-start border-b border-slate-800 pb-10">
                    <div>
                      <h3 className="text-4xl font-black text-white tracking-tighter">{selectedOrder.id}</h3>
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black mt-1">Status: <span className="text-blue-500">{selectedOrder.status}</span></p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-3xl text-center border border-slate-700">
                      <p className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Costo</p>
                      <p className="text-lg font-black text-white tracking-tighter">${selectedOrder.cost.toLocaleString()}</p>
                    </div>
                  </header>

                  {/* Sección de Archivos para Cargar / Visualizar */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center"><Paperclip size={14} className="mr-2" /> Archivos cargados y evidencia</label>
                       {canExecuteOrder && selectedOrder.status !== 'Cerrada' && (
                         <div className="relative">
                            <input type="file" className="hidden" id="fileInput" onChange={(e) => handleFileUpload(selectedOrder.id, e.target.files[0]?.name)} />
                            <label htmlFor="fileInput" className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg border border-slate-700 flex items-center transition-all">
                              <UploadCloud size={14} className="mr-2" /> Cargar Nuevo
                            </label>
                         </div>
                       )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {selectedOrder.attachments.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-800 group hover:border-blue-500/50 transition-all">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><File size={16} /></div>
                            <span className="text-xs font-bold text-slate-300">{file.name}</span>
                          </div>
                          <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all">
                             <span className="text-[9px] text-slate-600 font-black uppercase">{file.size}</span>
                             <button className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                      {selectedOrder.attachments.length === 0 && (
                        <div className="py-8 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center opacity-30">
                          <UploadCloud size={32} className="mb-2" />
                          <p className="text-[10px] font-bold uppercase">No hay archivos para cargar</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Flujos de Rol (Asignación / Ejecución) */}
                  {selectedOrder.status === 'Abierta' && (
                    <div className={`pt-8 border-t border-slate-800 space-y-6 ${!canAssignOrder ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                      <label className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] flex items-center"><UserPlus size={16} className="mr-2" /> Asignación de Técnico</label>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        updateOrderStep(selectedOrder.id, { assignedTech: new FormData(e.target).get('tech'), status: 'Asignada' }, 'Asignación de técnico');
                      }} className="flex gap-4">
                        <input required name="tech" placeholder="Técnico Ejecutor..." className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm outline-none" />
                        <button type="submit" className="bg-orange-600 hover:bg-orange-500 px-8 rounded-2xl font-black text-[10px] tracking-widest uppercase text-white">Asignar</button>
                      </form>
                    </div>
                  )}

                  {selectedOrder.status === 'Asignada' && (
                    <div className={`pt-8 border-t border-slate-800 space-y-8 ${!canExecuteOrder ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                      <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center"><Wrench size={16} className="mr-2" /> Análisis Técnico y Ejecución</label>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.target);
                        const cost = parseFloat(data.get('cost'));
                        if (cost > APPROVAL_THRESHOLD && !selectedOrder.isAuthorized) {
                          updateOrderStep(selectedOrder.id, { workDetail: data.get('workDetail'), cost: cost, status: 'Pendiente Autorización' }, 'Solicitud de autorización por costo excedente');
                        } else {
                          updateOrderStep(selectedOrder.id, { workDetail: data.get('workDetail'), cost: cost, status: 'Cerrada' }, 'Cierre de trabajo');
                        }
                      }} className="space-y-6">
                        <textarea required name="workDetail" rows="4" className="w-full bg-slate-800 border border-slate-700 rounded-[2rem] p-8 text-sm outline-none leading-relaxed" placeholder="Descripción Trabajos Ejecutados..."></textarea>
                        <div className="grid grid-cols-2 gap-6">
                          <input required name="cost" type="number" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold" placeholder="Costo ($)" />
                          <button type="button" className="bg-white text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center"><Camera size={18} className="mr-2" /> Activar Cámara</button>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[2rem] font-black text-xs tracking-[0.3em] uppercase text-white">Procesar Cierre / Solicitar OK</button>
                      </form>
                    </div>
                  )}

                  {selectedOrder.status === 'Pendiente Autorización' && (
                    <div className="pt-8 border-t border-slate-800 space-y-6">
                      <div className="bg-purple-500/10 border border-purple-500/30 p-8 rounded-[2.5rem] text-center">
                        <AlertTriangle size={32} className="text-purple-400 mx-auto mb-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 mb-2">Esperando Aprobación de Costo</h4>
                        <p className="text-xs text-slate-400 mb-8 italic">El presupuesto de ${selectedOrder.cost.toLocaleString()} requiere validación del Autorizador.</p>
                        {canAuthorize && <button onClick={() => handleAuthorize(selectedOrder.id)} className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase text-white flex items-center justify-center"><ThumbsUp size={16} className="mr-2" /> Dar OK (Autorizar)</button>}
                      </div>
                    </div>
                  )}

                  <div className="pt-10 border-t border-slate-800/50">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-10 flex items-center"><History size={14} className="mr-3" /> historial de mantencion y reparacion de activos</h4>
                    <div className="space-y-8 relative">
                      {selectedOrder.logs.map((log, idx) => (
                        <div key={idx} className="flex gap-8 relative">
                          {idx !== selectedOrder.logs.length - 1 && <div className="absolute left-[7px] top-4 bottom-[-40px] w-px bg-slate-800"></div>}
                          <div className={`w-4 h-4 rounded-full mt-1.5 shrink-0 z-10 border-[4px] border-slate-950 ${idx === selectedOrder.logs.length - 1 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                          <div>
                            <p className="text-xs font-black text-slate-200 uppercase tracking-[0.15em] leading-none">{log.action}</p>
                            <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest italic">POR: {log.user} — {log.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                  <Activity size={100} className="mb-8" />
                  <p className="font-black text-2xl uppercase tracking-[0.4em]">SISTEMA DE AUDITORÍA</p>
                  <p className="text-sm mt-4 font-bold tracking-widest">SELECCIONE UNA INTERVENCIÓN</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modales */}
      {isNewVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[3.5rem] p-16 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-3xl font-black mb-12 text-white uppercase tracking-tighter">REGISTRO ACTIVO</h3>
            <form onSubmit={handleAddVehicle} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Tipo</label>
                <select name="type" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none"><option value="Bicicleta Eléctrica">Bicicleta Eléctrica</option><option value="Tricicleta Eléctrica">Tricicleta Eléctrica</option></select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Modelo</label>
                <input name="model" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold text-white" placeholder="Ej: EcoRide XT" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Patente</label>
                <input name="plate" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm font-mono font-bold text-white uppercase" placeholder="XXX-000" />
              </div>
              <div className="flex gap-4 pt-8">
                <button type="button" onClick={() => setIsNewVehicleModalOpen(false)} className="flex-1 py-5 rounded-2xl font-black text-[10px] bg-slate-800 hover:bg-slate-700 uppercase tracking-widest text-white transition-all">Cerrar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white transition-all">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[4rem] p-16 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter">APERTURA OT</h3>
            <p className="text-slate-500 text-sm mb-12 font-medium tracking-tight italic">Documento técnico auditado para inicio de reparación.</p>
            <form onSubmit={handleCreateOrder} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Activo</label>
                    <select name="vehicleId" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold text-white">{vehicles.map(v => <option key={v.id} value={v.id}>{v.model} ({v.plate})</option>)}</select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Categoría</label>
                    <select name="category" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold text-white"><option value="Correctivo">Correctivo (Falla)</option><option value="Preventivo">Preventivo (Programado)</option></select>
                  </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Descripción Problema (Apertura)</label>
                <textarea name="problemDescription" required rows="4" className="w-full bg-slate-800 border border-slate-700 rounded-[2rem] p-8 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium leading-relaxed text-white" placeholder="Detalle técnico inicial..."></textarea>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsNewOrderModalOpen(false)} className="flex-1 py-5 rounded-2xl font-black text-[10px] bg-slate-800 hover:bg-slate-700 uppercase tracking-widest text-white">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white">Iniciar OT</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
