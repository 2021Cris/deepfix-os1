import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, ClipboardList, Bike, BarChart2, PlusCircle, User, 
  Clock, Camera, CheckCircle2, AlertCircle, UserPlus, FileEdit,
  DollarSign, Search, ChevronRight, X, History, Calendar, Filter, 
  Download, Activity, Zap, AlertTriangle, Settings2, ShieldCheck, 
  Briefcase, Wrench, ThumbsUp, Paperclip, File, Trash2, UploadCloud
} from 'lucide-react';

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

  // --- Estado de Vehículos ---
  const [vehicles, setVehicles] = useState([
    { id: 'V1', type: 'Bicicleta Eléctrica', model: 'EcoRide 500', plate: 'BE-2024-01' },
    { id: 'V2', type: 'Tricicleta Eléctrica', model: 'CargoPlus 3000', plate: 'TE-2024-99' },
  ]);

  // --- Estado de Órdenes de Trabajo ---
  const [orders, setOrders] = useState([
    {
      id: 'OT-1200',
      vehicleId: 'V1',
      status: 'Cerrada',
      category: 'Correctivo',
      problemDescription: 'Falla en el motor de asistencia al pedaleo.',
      assignedTech: 'Juan Técnico',
      workDetail: 'Se reemplazó el sensor de torque y se reajustaron los conectores de fase.',
      cost: 45000,
      isAuthorized: true,
      attachments: [{ id: 1, name: 'diagnostico_motor.jpg', size: '1.4MB' }],
      logs: [{ action: 'Apertura de caso', user: 'Asignador_Demo', date: '2024-12-20 10:00' }]
    }
  ]);

  // --- Permisos por Rol ---
  const perms = {
    canRegisterVehicle: userRole === ROLES.AUTORIZADOR.id || userRole === ROLES.ASIGNADOR.id,
    canOpenOT: userRole === ROLES.AUTORIZADOR.id || userRole === ROLES.ASIGNADOR.id,
    canAssignTech: userRole === ROLES.AUTORIZADOR.id || userRole === ROLES.ASIGNADOR.id,
    canExecuteWork: userRole === ROLES.AUTORIZADOR.id || userRole === ROLES.EJECUTOR.id,
    canAuthorizeExpense: userRole === ROLES.AUTORIZADOR.id
  };

  // --- Manejadores de Estado ---
  const handleUpdateOrder = (id, updates, logAction) => {
    setOrders(orders.map(o => o.id === id ? {
      ...o, ...updates, 
      logs: [...o.logs, { action: logAction, user: userRole, date: new Date().toLocaleString() }]
    } : o));
    setSelectedOrder(null);
  };

  const handleFileUpload = (id, fileName) => {
    setOrders(orders.map(o => o.id === id ? {
      ...o, 
      attachments: [...o.attachments, { id: Date.now(), name: fileName, size: '2.0MB' }],
      logs: [...o.logs, { action: `Carga de archivo: ${fileName}`, user: userRole, date: new Date().toLocaleString() }]
    } : o));
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar de Navegación */}
      <aside className="w-72 border-r border-slate-800 bg-slate-900/40 p-8 flex flex-col">
        <div className="flex items-center space-x-3 mb-12">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-900/40">
            <Settings2 className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none uppercase">Mantención</h1>
            <p className="text-[9px] font-bold text-blue-500 tracking-[0.3em] uppercase">Activos Flota</p>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Dashboard</span>
          </button>
          <button onClick={() => setView('orders')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${view === 'orders' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>
            <ClipboardList size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Órdenes</span>
          </button>
        </nav>

        {/* Simulador de Login para la demo */}
        <div className="mt-auto space-y-4 pt-10 border-t border-slate-800">
          <p className="text-[9px] font-black text-slate-600 uppercase text-center tracking-widest">Simular Perfil</p>
          <div className="grid grid-cols-1 gap-2">
            {Object.values(ROLES).map(role => (
              <button key={role.id} onClick={() => { setUserRole(role.id); setSelectedOrder(null); }} className={`flex items-center space-x-3 p-3.5 rounded-2xl border transition-all ${userRole === role.id ? 'bg-slate-800 border-blue-500 ring-2 ring-blue-500/10 shadow-lg shadow-blue-500/10' : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100'}`}>
                <role.icon size={16} className={role.color} />
                <span className="text-[10px] font-bold uppercase text-white">{role.label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Área Principal de Contenido */}
      <main className="flex-1 overflow-y-auto p-16 custom-scrollbar">
        {view === 'dashboard' ? (
          <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Panel Operativo</h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Gestión de Mantención de Activos</p>
              </div>
              <div className="flex gap-4">
                {perms.canRegisterVehicle && <button onClick={() => setIsNewVehicleModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all">Registrar Vehículo</button>}
                {perms.canOpenOT && <button onClick={() => setIsNewOrderModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all">Apertura OT</button>}
              </div>
            </header>

            {/* Resumen de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-xl hover:border-blue-500/50 transition-all">
                <Activity className="text-blue-400 mb-6" size={28} />
                <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Disponibilidad</h3>
                <p className="text-6xl font-black text-white tracking-tighter">92%</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-xl hover:border-emerald-500/50 transition-all">
                <DollarSign className="text-emerald-400 mb-6" size={28} />
                <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Gastos acumulados</h3>
                <p className="text-4xl font-black text-white tracking-tighter">${orders.reduce((acc, o) => acc + o.cost, 0).toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-xl hover:border-purple-500/50 transition-all text-center">
                <ShieldCheck className="text-purple-400 mb-6 mx-auto" size={28} />
                <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Límite Aprobación</h3>
                <p className="text-5xl font-black text-white tracking-tighter">${(COST_APPROVAL_LIMIT/1000).toFixed(0)}k</p>
              </div>
            </div>

            {/* Control de Umbral Crítico (Solo Autorizador) */}
            {perms.canModifyConfig && (
              <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="font-black text-2xl uppercase flex items-center tracking-tight"><Settings2 className="mr-4 text-blue-500" size={28}/> Umbral Alerta Presupuesto</h3>
                  <p className="text-slate-500 text-sm mt-2 font-medium">Ajuste el límite de gasto acumulado para alertas visuales de la flota.</p>
                </div>
                <div className="flex items-center space-x-10 bg-slate-950 p-6 rounded-3xl border border-slate-800 w-full md:w-auto">
                  <input type="range" min="50000" max="1000000" step="50000" value={expenseThreshold} onChange={(e) => setExpenseThreshold(parseInt(e.target.value))} className="flex-1 md:w-48" />
                  <span className="text-3xl font-black text-blue-400 min-w-[150px] text-right">${expenseThreshold.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-in slide-in-from-bottom-6 duration-700 max-w-7xl mx-auto pb-20">
            {/* Lista de Órdenes de Trabajo */}
            <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-10">Órdenes de Trabajo</h2>
              <div className="grid grid-cols-1 gap-4">
                {orders.map(o => (
                  <div key={o.id} onClick={() => setSelectedOrder(o)} className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden ${selectedOrder?.id === o.id ? 'border-blue-500 bg-blue-600/5 ring-4 ring-blue-500/5 shadow-2xl' : 'border-slate-800 bg-slate-900 hover:border-slate-700 shadow-lg'}`}>
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{o.id}</span>
                        <h4 className="font-black text-2xl tracking-tight leading-none mt-1">{vehicles.find(v => v.id === o.vehicleId)?.model}</h4>
                      </div>
                      <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                        o.status === 'Abierta' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 
                        o.status === 'Asignada' ? 'border-orange-500 text-orange-400 bg-orange-500/10' : 
                        o.status.includes('Pendiente') ? 'border-purple-500 text-purple-400 bg-purple-500/10 animate-pulse' :
                        'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                      }`}>{o.status}</span>
                    </div>
                    <p className="text-xs text-slate-400 italic mt-2 font-medium">"{o.problemDescription}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel de Gestión y Ejecución */}
            <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-12 sticky top-10 h-fit shadow-2xl min-h-[600px] glass-panel">
              {selectedOrder ? (
                <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
                  <header className="flex justify-between items-start border-b border-slate-800 pb-10">
                    <div>
                      <h3 className="text-5xl font-black text-white tracking-tighter leading-none mb-3">{selectedOrder.id}</h3>
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] italic">Apertura: {selectedOrder.logs[0].date}</p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-[2.5rem] text-center border border-slate-700 min-w-[140px] shadow-inner">
                      <p className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Costo Trabajo</p>
                      <p className="text-2xl font-black text-white tracking-tighter leading-none">${selectedOrder.cost.toLocaleString()}</p>
                    </div>
                  </header>

                  <div className="space-y-5">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center leading-none"><Paperclip size={14} className="mr-3" /> Archivos y Evidencia</label>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedOrder.attachments.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-slate-800/40 rounded-3xl border border-slate-800 hover:border-blue-500/50 transition-all group">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all"><File size={18} /></div>
                            <span className="text-xs font-bold text-slate-200">{f.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{f.size}</span>
                        </div>
                      ))}
                      {perms.canExecuteWork && selectedOrder.status !== 'Cerrada' && (
                        <label className="cursor-pointer border-2 border-dashed border-slate-800 p-10 rounded-[2.5rem] flex flex-col items-center justify-center hover:bg-blue-500/5 hover:border-blue-500/50 transition-all group">
                          <UploadCloud size={32} className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Activar Camara / Cargar Evidencia</span>
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(selectedOrder.id, e.target.files[0].name)} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Acciones de Flujo basadas en Rol */}
                  {selectedOrder.status === 'Abierta' && perms.canAssignTech && (
                    <div className="pt-10 border-t border-slate-800 space-y-6">
                      <label className="text-[10px] font-black text-orange-400 uppercase tracking-[0.4em] flex items-center leading-none"><UserPlus size={18} className="mr-3"/> Asignar Técnico Responsable</label>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateOrder(selectedOrder.id, { assignedTech: e.target.tech.value, status: 'Asignada' }, 'Técnico responsable asignado');
                      }} className="flex gap-4">
                        <input name="tech" required className="flex-1 bg-slate-800 border border-slate-700 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-orange-500" placeholder="Nombre completo técnico..." />
                        <button type="submit" className="bg-orange-600 hover:bg-orange-500 px-10 rounded-[2rem] font-black text-[10px] tracking-widest uppercase text-white shadow-xl transition-all">Asignar</button>
                      </form>
                    </div>
                  )}

                  {selectedOrder.status === 'Asignada' && perms.canExecuteWork && (
                    <div className="pt-10 border-t border-slate-800 space-y-8">
                       <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] flex items-center leading-none"><Wrench size={18} className="mr-3"/> Descripción Trabajos Ejecutados</label>
                       <form onSubmit={(e) => {
                          e.preventDefault();
                          const cost = parseFloat(e.target.cost.value);
                          const work = e.target.work.value;
                          if (cost > COST_APPROVAL_LIMIT && !selectedOrder.isAuthorized) {
                            handleUpdateOrder(selectedOrder.id, { workDetail: work, cost, status: 'Pendiente Autorización' }, 'Solicitud de autorización enviada por presupuesto');
                          } else {
                            handleUpdateOrder(selectedOrder.id, { workDetail: work, cost, status: 'Cerrada' }, 'Trabajo finalizado y auditado');
                          }
                       }} className="space-y-6">
                          <textarea name="work" required rows="4" className="w-full bg-slate-800 border border-slate-700 rounded-[2.5rem] p-10 text-sm outline-none font-medium leading-relaxed text-white focus:ring-2 focus:ring-blue-500" placeholder="Ingrese el detalle técnico de la intervención y análisis..."></textarea>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Gasto Trabajo ($)</label>
                                <input name="cost" required type="number" className="w-full bg-slate-800 border border-slate-700 rounded-3xl px-8 py-5 text-lg font-black text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
                            </div>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] text-white shadow-2xl transition-all h-[70px] self-end">FINALIZAR TRABAJO</button>
                          </div>
                       </form>
                    </div>
                  )}

                  {selectedOrder.status === 'Pendiente Autorización' && (
                    <div className="pt-10 border-t border-slate-800">
                      <div className="bg-purple-600/10 border border-purple-500/40 p-12 rounded-[3.5rem] text-center shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                        <AlertTriangle size={56} className="text-purple-400 mx-auto mb-8 animate-pulse" />
                        <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.5em] mb-4">Requiere Acción Autorizador</h4>
                        <p className="text-sm text-slate-300 mb-12 italic leading-relaxed font-medium">La intervención de <strong>${selectedOrder.cost.toLocaleString()}</strong> supera el límite técnico permitido. El técnico no puede cerrar el trabajo sin su validación.</p>
                        {perms.canAuthorizeSpend ? (
                          <button onClick={() => handleUpdateOrder(selectedOrder.id, { isAuthorized: true, status: 'Asignada' }, 'Autorización de gasto concedida')} className="w-full bg-purple-600 hover:bg-purple-500 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all shadow-xl text-white group">
                            <ThumbsUp size={24} className="mr-4 group-hover:scale-125 transition-transform"/> DAR OK (Autorizar)
                          </button>
                        ) : (
                          <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] border-2 border-dashed border-slate-800 py-6 rounded-3xl italic">A la espera de autorización superior</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Log de Auditoría Inmutable */}
                  <div className="pt-12 border-t border-slate-800/50">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-12 flex items-center leading-none italic"><History size={16} className="mr-3" /> Historial de mantención y reparación de activos</h4>
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
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-48">
                  <Activity size={150} className="mb-12 text-slate-700" />
                  <p className="font-black text-4xl uppercase tracking-[0.5em]">Consola Técnica</p>
                  <p className="text-sm mt-6 font-bold tracking-[0.3em] uppercase opacity-60">Seleccione una intervención para auditar</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal: Registro de Activo (Solo Autorizador/Asignador) */}
      {isNewVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[4rem] p-16 animate-in zoom-in-95 duration-500 shadow-2xl">
            <h3 className="text-3xl font-black mb-12 text-white uppercase tracking-tighter text-center">Registrar Activo</h3>
            <form onSubmit={handleAddVehicle} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Tipo de Vehículo</label>
                <select name="type" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="Bicicleta Eléctrica">Bicicleta Eléctrica</option>
                  <option value="Tricicleta Eléctrica">Tricicleta Eléctrica</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Modelo / Marca</label>
                <input name="model" required className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: EcoRide XT" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Patente / Serie</label>
                <input name="plate" required className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-mono font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 uppercase" placeholder="XXX-000" />
              </div>
              <div className="flex gap-4 pt-8">
                <button type="button" onClick={() => setIsNewVehicleModalOpen(false)} className="flex-1 py-6 rounded-[2rem] font-black text-[11px] bg-slate-800 uppercase text-slate-400 hover:text-white transition-all tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-6 rounded-[2rem] font-black text-[11px] uppercase text-white shadow-2xl tracking-widest transition-all">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Apertura OT (Solo Autorizador/Asignador) */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[4rem] p-20 animate-in zoom-in-95 duration-500 shadow-2xl">
            <h3 className="text-4xl font-black mb-12 text-white uppercase tracking-tighter">Apertura Caso Técnico</h3>
            <form onSubmit={handleCreateOrder} className="space-y-10">
              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Seleccionar Activo</label>
                    <select name="vehicleId" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none">
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.model} ({v.plate})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Categoría</label>
                    <select name="category" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none">
                      <option value="Correctivo">Correctivo (Falla)</option>
                      <option value="Preventivo">Preventivo (Programado)</option>
                    </select>
                  </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Descripción Problema (Apertura)</label>
                <textarea name="problemDescription" required rows="4" className="w-full bg-slate-950 border border-slate-800 rounded-[3rem] p-10 text-sm font-medium leading-relaxed text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Detalle técnico inicial del problema detectado o la mantención requerida..."></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsNewOrderModalOpen(false)} className="flex-1 py-6 rounded-[2.5rem] font-black text-[11px] bg-slate-800 uppercase text-slate-400 tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-6 rounded-[2.5rem] font-black text-[11px] uppercase text-white shadow-2xl tracking-widest">Iniciar OT</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
