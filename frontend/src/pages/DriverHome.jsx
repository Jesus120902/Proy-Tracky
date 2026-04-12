import React, { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  CheckCircle2, 
  Truck, 
  Clock, 
  Phone, 
  LogOut, 
  Loader2,
  Navigation,
  ChevronRight
} from 'lucide-react';
import { driverApi } from '../services/api';
import { useToast } from '../components/Toast';

const DriverHome = ({ user, onLogout }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchMyOrders = async () => {
    try {
      const res = await driverApi.getMyOrders();
      setData(res.data);
    } catch (err) {
      addToast('Error al cargar órdenes asignadas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
    
    // Configurar geolocalización básica si está disponible
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          // Opcional: Enviar ubicación al backend periódicamente
          // driverApi.updateOrderStatus(null, null, { lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => console.log("Error de GPS:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await driverApi.updateOrderStatus(orderId, newStatus);
      addToast(`Pedido actualizado: ${newStatus}`, 'success');
      fetchMyOrders();
    } catch (err) {
      addToast('Error al actualizar pedido', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cargando Hoja de Ruta...</p>
      </div>
    );
  }

  const activeOrders = data?.orders.filter(o => o.status !== 'delivered') || [];
  const completedOrders = data?.orders.filter(o => o.status === 'delivered') || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans max-w-md mx-auto shadow-2xl">
      {/* Header Conductor */}
      <header className="bg-secondary-900 text-white p-8 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Truck size={80} />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">Panel Repartidor</span>
            <h1 className="text-2xl font-black tracking-tight mt-1">{user.name}</h1>
            <p className="text-xs text-slate-400 mt-1">{data?.driver?.vehicle?.type} • {data?.driver?.vehicle?.plate}</p>
          </div>
          <button 
            onClick={onLogout}
            className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all border border-white/5"
          >
            <LogOut size={20} />
          </button>
        </div>
        
        <div className="mt-8 flex gap-4">
           <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
              <p className="text-[9px] font-black uppercase opacity-60 mb-1">Entregas Hoy</p>
              <p className="text-2xl font-black">{completedOrders.length}</p>
           </div>
           <div className="flex-1 bg-primary-600/20 p-4 rounded-2xl border border-primary-500/20 backdrop-blur-sm">
              <p className="text-[9px] font-black uppercase text-primary-400 mb-1">Pendientes</p>
              <p className="text-2xl font-black">{activeOrders.length}</p>
           </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 -mt-4 overflow-y-auto">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Mi Misión Actual</h3>
        
        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-10 text-center border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Package className="text-slate-200" size={32} />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Sin entregas asignadas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map(order => (
              <div key={order._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 animate-in slide-in-from-bottom duration-500">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                         order.status === 'in-transit' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                       }`}>
                         {order.status === 'in-transit' ? 'En Ruta' : 'Por Iniciar'}
                       </span>
                       <h4 className="text-xl font-black mt-3 tracking-tight">{order.orderNumber}</h4>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Prioridad</p>
                       <span className={`text-[10px] font-bold ${order.priority === 'high' ? 'text-red-500' : 'text-slate-600'}`}>
                         {order.priority.toUpperCase()}
                       </span>
                    </div>
                 </div>

                 <div className="space-y-4 mb-8">
                    <div className="flex gap-4">
                       <div className="bg-slate-50 p-2 rounded-xl">
                          <MapPin size={18} className="text-primary-600" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400">Dirección</p>
                          <p className="text-sm font-bold text-slate-800 leading-tight">{order.customer.address}</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="bg-slate-50 p-2 rounded-xl">
                          <Clock size={18} className="text-primary-600" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400">Cliente</p>
                          <p className="text-sm font-bold text-slate-800">{order.customer.name}</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-3">
                    {order.status !== 'in-transit' ? (
                      <button 
                        onClick={() => handleStatusUpdate(order._id, 'in-transit')}
                        className="flex-1 bg-primary-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 text-xs uppercase tracking-widest"
                      >
                        <Navigation size={18} /> Iniciar Ruta
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusUpdate(order._id, 'delivered')}
                        className="flex-1 bg-green-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 text-xs uppercase tracking-widest"
                      >
                        <CheckCircle2 size={18} /> Confirmar Entrega
                      </button>
                    )}
                    <a 
                      href={`tel:${order.customer.phone || '555'}`}
                      className="bg-slate-100 p-4 rounded-2xl text-slate-600 active:scale-95 transition-transform"
                    >
                       <Phone size={22} />
                    </a>
                 </div>
              </div>
            ))}
          </div>
        )}

        {completedOrders.length > 0 && (
          <div className="pt-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2 mb-4">Finalizadas hoy</h3>
            <div className="space-y-3 opacity-60">
               {completedOrders.slice(0, 3).map(order => (
                 <div key={order._id} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <CheckCircle2 className="text-green-500" size={20} />
                       <div>
                          <p className="font-bold text-sm text-slate-800">{order.orderNumber}</p>
                          <p className="text-[10px] font-black uppercase text-slate-400">{order.customer.name}</p>
                       </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                 </div>
               ))}
            </div>
          </div>
        )}
      </main>

      <footer className="p-6 bg-white border-t border-slate-100 flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-primary-600">
             <Package size={24} />
             <span className="text-[8px] font-black uppercase tracking-widest">Mis Rutas</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 opacity-50">
             <Clock size={24} />
             <span className="text-[8px] font-black uppercase tracking-widest">Resumen</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 opacity-50">
             <Navigation size={24} />
             <span className="text-[8px] font-black uppercase tracking-widest">Asistencia</span>
          </button>
      </footer>
    </div>
  );
};

export default DriverHome;
