import React, { useEffect, useState } from 'react';
import { ordersApi, driversApi } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { Plus, Search, Filter, Edit2, Trash2, Eye, X, Check, Truck, MapPin, Package, Clock, User, ChevronDown } from 'lucide-react';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const { addToast } = useToast();
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  
  // New/Edit order form state
  const [formData, setFormData] = useState({
    customerName: '',
    address: '',
    priority: 'medium',
    items: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [oRes, dRes] = await Promise.all([
        ordersApi.getAll(),
        driversApi.getAll()
      ]);
      setOrders(oRes.data.orders);
      setDrivers(dRes.data.filter(d => d.status === 'available' || d.status === 'on-delivery'));
    } catch (error) {
      addToast(error.friendlyMessage || "Error cargando la lista de órdenes", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateOrder = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customer: {
          name: formData.customerName,
          address: formData.address
        },
        priority: formData.priority,
        items: formData.items,
        status: formData.status
      };

      if (editingOrder) {
        const res = await ordersApi.update(editingOrder._id, payload);
        setOrders(orders.map(o => o._id === editingOrder._id ? res.data : o));
        setEditingOrder(null);
      } else {
        const res = await ordersApi.create(payload);
        setOrders([res.data, ...orders]);
        setIsModalOpen(false);
      }
      resetForm();
      addToast(editingOrder ? "Orden actualizada con éxito" : "Orden creada correctamente", 'success');
    } catch (error) {
      addToast(error.friendlyMessage || "Error al procesar la solicitud", 'error');
    }
  };

  const resetForm = () => {
    setFormData({ customerName: '', address: '', priority: 'medium', items: '', status: 'pending' });
  };

  const handleEditClick = (order) => {
    setEditingOrder(order);
    setFormData({
      customerName: order.customer.name,
      address: order.customer.address,
      priority: order.priority,
      items: order.items || '',
      status: order.status
    });
  };

  const handleAssignDriver = async (orderId, driverId) => {
    if (!driverId) return;
    try {
      const res = await ordersApi.update(orderId, { driverId });
      setOrders(orders.map(o => o._id === orderId ? res.data : o));
      setIsAssigning(null);
      addToast("Conductor asignado satisfactoriamente", 'success');
      fetchData(); 
    } catch (error) {
      addToast(error.friendlyMessage || "No se pudo asignar el conductor", 'error');
    }
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await ordersApi.delete(orderToDelete);
      setOrders(orders.filter(o => o._id !== orderToDelete));
      addToast("Pedido eliminado del registro", 'success');
    } catch (error) {
      addToast(error.friendlyMessage || "Error al intentar eliminar la orden", 'error');
    } finally {
      setOrderToDelete(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 relative pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 tracking-tight">Órdenes Avanzadas</h1>
          <p className="text-secondary-500 mt-1 font-medium">Historial completo y filtrado dinámico para producción.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-primary-500/20 active:scale-95"
        >
          <Plus size={20} />
          NUEVA ORDEN
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-secondary-100 overflow-hidden">
        {/* Advanced Toolbar */}
        <div className="p-6 border-b border-secondary-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por orden o cliente..." 
              className="w-full pl-12 pr-4 py-3 bg-secondary-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none text-sm transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-6 py-3 border border-secondary-200 rounded-2xl text-sm font-bold text-secondary-600 hover:bg-secondary-50 transition-all uppercase tracking-widest"
            >
              <Filter size={18} />
              {statusFilter === 'all' ? 'FILTRAR' : statusFilter.replace('-', ' ')}
              <ChevronDown size={14} className={`transition-transformDuration-200 ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-secondary-100 z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                 {['all', 'pending', 'assigned', 'in-transit', 'delivered', 'cancelled'].map((st) => (
                   <button 
                     key={st}
                     onClick={() => { setStatusFilter(st); setShowFilterMenu(false); }}
                     className={`w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest hover:bg-primary-50 hover:text-primary-600 transition-all ${statusFilter === st ? 'bg-primary-50 text-primary-600' : 'text-secondary-600'}`}
                   >
                     {st === 'all' ? 'Ver Todos' : st.replace('-', ' ')}
                   </button>
                 ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-5">Orden</th>
                <th className="px-8 py-5">Cliente</th>
                <th className="px-8 py-5 text-center">Estado</th>
                <th className="px-8 py-5">Conductor</th>
                <th className="px-8 py-5 text-center">Prioridad</th>
                <th className="px-8 py-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-8 py-10"><div className="h-4 bg-secondary-100 rounded-full w-full"></div></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-32 text-center text-secondary-400 font-bold">No se encontraron órdenes para este criterio</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order._id} className="group hover:bg-primary-50/20 transition-all">
                    <td className="px-8 py-5">
                      <span className="font-black text-secondary-900 group-hover:text-primary-600 transition-colors">{order.orderNumber}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-secondary-900 uppercase">{order.customer.name}</span>
                        <span className="text-xs text-secondary-400 font-medium truncate max-w-[200px]">{order.customer.address}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <StatusBadge status={order.status === 'in-transit' ? 'in route' : order.status} />
                    </td>
                    <td className="px-8 py-5">
                      {isAssigning === order._id ? (
                        <select 
                          autoFocus
                          onBlur={() => setIsAssigning(null)}
                          onChange={(e) => handleAssignDriver(order._id, e.target.value)}
                          className="bg-white border border-primary-200 text-xs rounded-xl p-2 outline-none focus:ring-4 focus:ring-primary-500/10"
                        >
                          <option value="">Seleccionar...</option>
                          {drivers.map(d => (
                            <option key={d._id} value={d._id}>{d.name} ({d.vehicle.type})</option>
                          ))}
                        </select>
                      ) : order.driver ? (
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center text-[10px] font-black text-primary-700">
                            {order.driver.name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-secondary-700">{order.driver.name}</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsAssigning(order._id)}
                          className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-tighter hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Truck size={12} />
                          Asignar
                        </button>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <PriorityBadge priority={order.priority} />
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => setViewingOrder(order)} className="p-2.5 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="Ver Historial"><Eye size={18} /></button>
                        <button onClick={() => handleEditClick(order)} className="p-2.5 text-secondary-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar"><Edit2 size={18} /></button>
                        <button onClick={() => setOrderToDelete(order._id)} className="p-2.5 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Eliminar"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Nueva / Editar Orden */}
      {(isModalOpen || editingOrder) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-secondary-950/40 backdrop-blur-sm animate-in fade-in" onClick={() => { setIsModalOpen(false); setEditingOrder(null); }}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95">
             <div className="p-8 pb-0 flex justify-between items-center">
                <h2 className="text-2xl font-black text-secondary-900">{editingOrder ? 'Editar Orden' : 'Nueva Orden'}</h2>
                <button onClick={() => { setIsModalOpen(false); setEditingOrder(null); }} className="p-2 hover:bg-secondary-50 rounded-xl"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleCreateOrUpdateOrder} className="p-8 space-y-6">
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary-400 ml-1">Nombre del Cliente</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-secondary-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-inner"
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      />
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary-400 ml-1">Dirección de Entrega</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-secondary-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-inner"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-secondary-400 ml-1">Prioridad</label>
                        <select 
                          className="w-full bg-secondary-50 border-none rounded-2xl p-4 cursor-pointer font-bold text-secondary-700 h-[56px]"
                          value={formData.priority}
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        >
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-secondary-400 ml-1">Estado</label>
                        <select 
                          className="w-full bg-secondary-50 border-none rounded-2xl p-4 cursor-pointer font-bold text-secondary-700 h-[56px]"
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="assigned">Asignado</option>
                          <option value="in-transit">En Ruta</option>
                          <option value="delivered">Entregado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary-400 ml-1">Contenido (Items)</label>
                      <textarea 
                        className="w-full bg-secondary-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-inner min-h-[100px]"
                        value={formData.items}
                        onChange={(e) => setFormData({...formData, items: e.target.value})}
                        placeholder="Descripción de los productos..."
                      />
                   </div>
                </div>

                <div className="pt-4 flex gap-4">
                   <button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/20 transition-all uppercase tracking-widest">
                     {editingOrder ? 'GUARDAR CAMBIOS' : 'CREAR ORDEN'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* MODAL: Ver Detalles + HISTORIAL (Avanzado) */}
      {viewingOrder && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-secondary-950/40 backdrop-blur-sm animate-in fade-in" onClick={() => setViewingOrder(null)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95">
             <div className="bg-primary-600 p-8 pt-12 pb-16 text-white relative">
                <button onClick={() => setViewingOrder(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><X size={20} /></button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl"><Package size={32} /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Detalles y Auditoría</p>
                    <h2 className="text-3xl font-black tracking-tight">{viewingOrder.orderNumber}</h2>
                  </div>
                </div>
                <div className="absolute -bottom-6 left-8 right-8 bg-white rounded-2xl p-4 shadow-xl border border-secondary-50 flex items-center justify-between">
                   <StatusBadge status={viewingOrder.status === 'in-transit' ? 'in route' : viewingOrder.status} />
                   <div className="flex items-center gap-2 text-[10px] font-black text-secondary-400 uppercase tracking-widest">
                      <Clock size={14} /> Ref 00{viewingOrder._id.slice(-4)}
                   </div>
                </div>
             </div>
             
             <div className="p-8 pt-12 space-y-8 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary-600">
                        <User size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest tracking-tighter">Cliente</span>
                      </div>
                      <p className="font-bold text-secondary-900 uppercase text-sm">{viewingOrder.customer.name}</p>
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary-600">
                        <MapPin size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest tracking-tighter">Destino</span>
                      </div>
                      <p className="text-[10px] font-bold text-secondary-600 leading-tight">{viewingOrder.customer.address}</p>
                   </div>
                </div>

                {/* Historial de Auditoría */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-secondary-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock size={14} className="text-primary-500" />
                    Historial de Eventos
                  </h4>
                  <div className="space-y-3 pl-2 border-l-2 border-primary-50 ml-2">
                    <div className="relative">
                       <div className="absolute -left-[11px] top-1.5 w-4 h-4 rounded-full bg-green-500 border-4 border-white"></div>
                       <div className="pl-6">
                          <p className="text-xs font-black text-secondary-800">Creado satisfactoriamente</p>
                          <p className="text-[10px] text-secondary-400 font-bold">{new Date(viewingOrder.createdAt).toLocaleString()}</p>
                       </div>
                    </div>
                    {viewingOrder.createdAt !== viewingOrder.updatedAt && (
                      <div className="relative">
                         <div className="absolute -left-[11px] top-1.5 w-4 h-4 rounded-full bg-primary-500 border-4 border-white"></div>
                         <div className="pl-6">
                            <p className="text-xs font-black text-secondary-800">Última actualización de estado</p>
                            <p className="text-[10px] text-secondary-400 font-bold">{new Date(viewingOrder.updatedAt).toLocaleString()}</p>
                         </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                   <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsable de Entrega</span>
                      {viewingOrder.driver ? (
                         <div className="flex items-center gap-2 text-xs font-bold text-secondary-800">
                           <div className="w-6 h-6 rounded-lg bg-primary-600 text-white flex items-center justify-center text-[8px] font-black">{viewingOrder.driver.name.charAt(0)}</div>
                           {viewingOrder.driver.name}
                         </div>
                      ) : <span className="text-xs font-bold text-slate-400 italic">Pendiente de asignar</span>}
                   </div>
                   <div className="pb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Manifiesto de Carga</span>
                      <p className="text-xs font-bold text-secondary-700 bg-white p-4 rounded-2xl border border-secondary-100">{viewingOrder.items || 'Sin descripción detallada'}</p>
                   </div>
                </div>

                <button 
                  onClick={() => setViewingOrder(null)}
                  className="w-full py-4 bg-secondary-950 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-secondary-900/10 uppercase tracking-widest"
                >
                  Regresar a la Lista
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Confirmación Premium */}
      <ConfirmModal 
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar Orden?"
        message="Esta acción es irreversible y eliminará todos los registros históricos de este envío."
        confirmText="ELIMINAR PERMANENTE"
      />
    </div>
  );
};

export default Orders;
