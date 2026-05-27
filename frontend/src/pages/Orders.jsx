import React, { useEffect, useState } from 'react';
import { ordersApi, driversApi } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { Plus, Search, Filter, Edit2, Trash2, Eye, X, Check, Truck, MapPin, Package, Clock, User, ChevronDown, CheckCircle2 } from 'lucide-react';
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
    status: 'pending',
    coordinates: { lat: null, lng: null }
  });

  const [geocodingLoading, setGeocodingLoading] = useState(false);

  const handleGeocodeAddress = async () => {
    if (!formData.address.trim()) {
      addToast("Por favor ingresa una dirección primero", "warning");
      return;
    }
    setGeocodingLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          formData.address
        )}&limit=1`,
        {
          headers: {
            "User-Agent": "TrackyLogisticsApp/1.0"
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({
          ...prev,
          coordinates: { lat: parseFloat(lat), lng: parseFloat(lon) }
        }));
        addToast(`Dirección geolocalizada con éxito: ${parseFloat(lat).toFixed(5)}, ${parseFloat(lon).toFixed(5)}`, "success");
      } else {
        addToast("No se pudo encontrar las coordenadas para esta dirección. Intenta detallar la ciudad y país.", "warning");
      }
    } catch (err) {
      console.error(err);
      addToast("Error al conectar con el servicio de geolocalización", "error");
    } finally {
      setGeocodingLoading(false);
    }
  };

  // Paginación y Filtrado backend
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    // Usamos debounce simple para no saturar al tipear
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [page, searchTerm, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [oRes, dRes] = await Promise.all([
        ordersApi.getAll({ page, limit: 10, status: statusFilter !== 'all' ? statusFilter : '', search: searchTerm }),
        driversApi.getAll()
      ]);
      setOrders(oRes.data.orders);
      setTotalPages(oRes.data.totalPages || 1);
      setTotalOrders(oRes.data.total || 0);
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
          address: formData.address,
          coordinates: formData.coordinates || { lat: null, lng: null }
        },
        priority: formData.priority,
        items: formData.items,
        status: formData.status
      };

      if (editingOrder) {
        await ordersApi.update(editingOrder._id, payload);
        setEditingOrder(null);
      } else {
        await ordersApi.create(payload);
        setIsModalOpen(false);
      }
      resetForm();
      fetchData();
      addToast(editingOrder ? "Orden actualizada con éxito" : "Orden creada correctamente", 'success');
    } catch (error) {
      addToast(error.friendlyMessage || "Error al procesar la solicitud", 'error');
    }
  };

  const resetForm = () => {
    setFormData({ customerName: '', address: '', priority: 'medium', items: '', status: 'pending', coordinates: { lat: null, lng: null } });
  };

  const handleEditClick = (order) => {
    setEditingOrder(order);
    setFormData({
      customerName: order.customer.name,
      address: order.customer.address,
      priority: order.priority,
      items: order.items || '',
      status: order.status,
      coordinates: order.customer.coordinates || { lat: null, lng: null }
    });
  };

  const handleAssignDriver = async (orderId, driverId) => {
    if (!driverId) return;
    try {
      await ordersApi.update(orderId, { driverId });
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
      addToast("Pedido eliminado del registro", 'success');
      fetchData();
    } catch (error) {
      addToast(error.friendlyMessage || "Error al intentar eliminar la orden", 'error');
    } finally {
      setOrderToDelete(null);
    }
  };

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
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-6 py-3 border border-secondary-200 rounded-2xl text-sm font-bold text-secondary-600 hover:bg-secondary-50 transition-all uppercase tracking-widest"
            >
              <Filter size={18} />
              {statusFilter === 'all' ? 'FILTRAR' : statusFilter.replace('-', ' ')}
              <ChevronDown size={14} className={`transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-secondary-100 z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                 {['all', 'pending', 'assigned', 'in-transit', 'delivered', 'cancelled'].map((st) => (
                   <button 
                     key={st}
                     onClick={() => { setStatusFilter(st); setPage(1); setShowFilterMenu(false); }}
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
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-32 text-center text-secondary-400 font-bold">No se encontraron órdenes para este criterio</td>
                </tr>
              ) : (
                orders.map(order => (
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
                        <button 
                          onClick={() => {
                            const trackingUrl = `${window.location.origin}/track/${order.orderNumber}`;
                            const msg = `Hola ${order.customer.name}, tu pedido ${order.orderNumber} está siendo gestionado. Puedes rastrearlo aquí: ${trackingUrl}`;
                            window.open(`https://wa.me/${order.customer.phone}?text=${encodeURIComponent(msg)}`, '_blank');
                          }} 
                          className="p-2.5 text-green-500 hover:bg-green-50 rounded-xl transition-all" 
                          title="Enviar por WhatsApp"
                        >
                          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </button>
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

        {/* Paginación UI */}
        {!loading && totalPages > 1 && (
          <div className="p-6 border-t border-secondary-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary-400">
              Mostrando {orders.length} de {totalOrders} resultados
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-secondary-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-secondary-600 hover:bg-white disabled:opacity-40"
              >
                Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-xl text-[10px] font-black flex items-center justify-center transition-all ${page === p ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30' : 'text-secondary-500 hover:bg-white'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-secondary-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-secondary-600 hover:bg-white disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <label className="text-[10px] font-black uppercase tracking-widest text-secondary-400 ml-1">Teléfono (WhatsApp)</label>
                          <input 
                            required
                            type="tel" 
                            placeholder="Ej: 34600112233"
                            className="w-full bg-secondary-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-inner"
                            value={formData.phone || ''}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                       </div>
                    </div>
                   
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-secondary-400 ml-1">Dirección de Entrega</label>
                        {formData.coordinates?.lat && (
                          <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
                            📍 Localizado ({formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)})
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          required
                          type="text" 
                          placeholder="Calle, Ciudad, País..."
                          className="flex-1 bg-secondary-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-inner"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                        <button
                          type="button"
                          disabled={geocodingLoading}
                          onClick={handleGeocodeAddress}
                          className="bg-secondary-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white text-[10px] font-black uppercase tracking-widest px-4 rounded-2xl transition-all"
                        >
                          {geocodingLoading ? "Buscando..." : "Localizar"}
                        </button>
                      </div>
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

                 {viewingOrder.status === 'delivered' && viewingOrder.evidence && (
                   <div className="space-y-4 animate-in slide-in-from-bottom-4">
                      <h4 className="text-xs font-black text-secondary-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-green-500" />
                        Prueba de Entrega (POD)
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Firma del Receptor</span>
                            {viewingOrder.evidence.signature ? (
                               <img src={viewingOrder.evidence.signature} alt="Firma" className="max-h-24 object-contain" />
                            ) : <p className="text-[10px] font-bold text-slate-300 py-6">Sin firma</p>}
                         </div>
                         <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Foto de Paquete</span>
                            {viewingOrder.evidence.photo ? (
                               <img src={viewingOrder.evidence.photo} alt="Evidencia" className="max-h-24 w-full object-cover rounded-xl" />
                            ) : <p className="text-[10px] font-bold text-slate-300 py-6">Sin foto</p>}
                         </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-2xl flex items-center justify-between border border-green-100">
                         <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Recibido por:</span>
                         <span className="text-xs font-black text-green-900 uppercase">{viewingOrder.evidence.recipientName || 'No especificado'}</span>
                      </div>
                   </div>
                 )}

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
