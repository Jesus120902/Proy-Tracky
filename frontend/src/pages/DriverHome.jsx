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
  ChevronRight,
  Camera,
  X,
  Check,
  User
} from 'lucide-react';
import { driverApi } from '../services/api';
import { useToast } from '../components/Toast';
import useSocket from '../hooks/useSocket';
import SignaturePad from '../components/SignaturePad';

const DriverHome = ({ user, onLogout }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsStatus, setGpsStatus] = useState('Buscando...');
  
  // Estados para Prueba de Entrega (POD)
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);
  const [selectedOrderForPod, setSelectedOrderForPod] = useState(null);
  const [podEvidence, setPodEvidence] = useState({
    signature: '',
    photo: '',
    recipientName: ''
  });
  const [isCapturing, setIsCapturing] = useState(false);

  const { addToast } = useToast();
  const { emitLocation } = useSocket(user.company?._id || user.company);

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
    
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setGpsStatus('GPS Activo ✅');
          if (data?.driver?._id) {
            emitLocation({
              driverId: data.driver._id,
              location: { lat: latitude, lng: longitude }
            });
          }
        },
        (error) => {
          console.error("Error de GPS:", error);
          setGpsStatus(`Error GPS: ${error.message} ❌`);
          addToast(`Error GPS: ${error.message}. Asegúrate de permitir la ubicación.`, 'error');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setGpsStatus('GPS No soportado 🚫');
    }
  }, [data?.driver?._id]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (newStatus === 'delivered') {
      setSelectedOrderForPod(orderId);
      setIsPodModalOpen(true);
      return;
    }

    try {
      await driverApi.updateOrderStatus(orderId, newStatus);
      addToast(`Pedido actualizado: ${newStatus}`, 'success');
      fetchMyOrders();
    } catch (err) {
      addToast('Error al actualizar pedido', 'error');
    }
  };

  const handlePodSubmit = async (e) => {
    e.preventDefault();
    if (!podEvidence.signature) {
      addToast('La firma es obligatoria', 'warning');
      return;
    }
    
    setIsCapturing(true);
    try {
      await driverApi.updateOrderStatus(selectedOrderForPod, 'delivered', {
        evidence: podEvidence
      });
      addToast('Entrega completada con éxito', 'success');
      setIsPodModalOpen(false);
      resetPodState();
      fetchMyOrders();
    } catch (err) {
      addToast('Error al procesar la entrega', 'error');
    } finally {
      setIsCapturing(false);
    }
  };

  const resetPodState = () => {
    setPodEvidence({ signature: '', photo: '', recipientName: '' });
    setSelectedOrderForPod(null);
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPodEvidence({ ...podEvidence, photo: reader.result });
      };
      reader.readAsDataURL(file);
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
                      href={`https://wa.me/${order.customer.phone}?text=${encodeURIComponent(`Hola ${order.customer.name}, soy tu repartidor de Tracky. Estoy en camino con tu pedido ${order.orderNumber}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 p-4 rounded-2xl text-white active:scale-95 transition-transform"
                    >
                       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
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

      {/* MODAL: PRUEBA DE ENTREGA (POD) */}
      {isPodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-secondary-950/40 backdrop-blur-sm animate-in fade-in" onClick={() => !isCapturing && setIsPodModalOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
             <div className="p-6 pb-4 flex justify-between items-center border-b border-slate-100">
                <h2 className="text-xl font-black text-secondary-900 tracking-tight">Prueba de Entrega</h2>
                <button onClick={() => setIsPodModalOpen(false)} disabled={isCapturing} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
             </div>
             
             <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* 1. Foto de Evidencia */}
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">1. Foto del Paquete</label>
                   {podEvidence.photo ? (
                     <div className="relative group rounded-3xl overflow-hidden border border-slate-200">
                        <img src={podEvidence.photo} alt="Evidencia" className="w-full h-32 object-cover" />
                        <button 
                          onClick={() => setPodEvidence({...podEvidence, photo: ''})}
                          className="absolute top-2 right-2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg text-red-500"
                        >
                          <X size={16} />
                        </button>
                     </div>
                   ) : (
                     <label className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors h-32">
                        <Camera size={24} className="text-primary-400 mb-2" />
                        <span className="text-xs font-bold text-slate-500">Tomar Fotografía</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment"
                          className="hidden"
                          onChange={handlePhotoCapture}
                        />
                     </label>
                   )}
                </div>

                {/* 2. Firma */}
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between items-end">
                      <span>2. Firma del Cliente *</span>
                   </label>
                   <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden h-40">
                      <SignaturePad 
                        onSave={(signatureUrl) => setPodEvidence({...podEvidence, signature: signatureUrl})} 
                        onClear={() => setPodEvidence({...podEvidence, signature: ''})}
                      />
                   </div>
                </div>

                {/* 3. Nombre del Receptor */}
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">3. Nombre de quien recibe *</label>
                   <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required
                        type="text" 
                        placeholder="Ej. Juan Pérez"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                        value={podEvidence.recipientName}
                        onChange={(e) => setPodEvidence({...podEvidence, recipientName: e.target.value})}
                      />
                   </div>
                </div>
             </div>

             <div className="p-6 bg-white border-t border-slate-100">
                <button 
                  onClick={handlePodSubmit}
                  disabled={isCapturing || !podEvidence.signature || !podEvidence.recipientName}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-500/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {isCapturing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {isCapturing ? 'Procesando...' : 'FINALIZAR ENTREGA'}
                </button>
             </div>
          </div>
        </div>
      )}

      <footer className="p-6 bg-white border-t border-slate-100 flex items-center justify-around z-0 relative">
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
