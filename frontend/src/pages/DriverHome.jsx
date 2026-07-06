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
import { usePublishDriverLocation } from '../hooks/useRealtimeDrivers';
import SignaturePad from '../components/SignaturePad';

const DriverHome = ({ user, onLogout }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsStatus, setGpsStatus] = useState('Buscando...');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    try {
      const res = await driverApi.optimizeRoute();
      addToast(res.data.message || 'Ruta reordenada por cercanía', 'success');
      fetchMyOrders();
    } catch (err) {
      addToast('Error al optimizar la ruta', 'error');
    } finally {
      setIsOptimizing(false);
    }
  };
  
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
  
  // Firebase Realtime Database: publicar ubicación GPS con throttle
  const companyId = user?.company?.id || user?.company?._id || user?.company;
  const driverId = user?.driverId || null;
  const { publishLocation, stopPublishing } = usePublishDriverLocation(companyId, driverId, user?.name);

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

  // ── Auto-Simulador de GPS ───────────────────
  const [isSimulating, setIsSimulating] = useState(false);
  const simIntervalRef = React.useRef(null);
  const simCoordsRef = React.useRef(null);
  const dataRef = React.useRef(data);

  // Mantener el ref de data actualizado
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Cargar órdenes al inicio
  useEffect(() => {
    fetchMyOrders();
  }, []);

  // Lógica de simulación reactiva al estado "in-transit"
  useEffect(() => {
    simIntervalRef.current = setInterval(() => {
      const activeTransitOrders = dataRef.current?.orders?.filter(o => o.status === 'in-transit') || [];

      if (activeTransitOrders.length === 0) {
        // Si no hay órdenes activas en tránsito, apagar el simulador
        setIsSimulating(prev => {
          if (prev) return false;
          return prev;
        });
        setGpsStatus(prev => {
          if (prev !== 'Simulador Inactivo 💤') return 'Simulador Inactivo 💤';
          return prev;
        });
        simCoordsRef.current = null; // Reiniciar coordenadas para la siguiente simulación
        return;
      }

      // Si hay órdenes en tránsito
      setIsSimulating(prev => {
        if (!prev) return true;
        return prev;
      });
      setGpsStatus(prev => {
        if (prev !== 'Autopilot Activo 🛰️') return 'Autopilot Activo 🛰️';
        return prev;
      });

      // Inicializar coordenadas si no están cargadas
      if (!simCoordsRef.current) {
        simCoordsRef.current = {
          lat: dataRef.current?.driver?.locationLat || -12.0464,
          lng: dataRef.current?.driver?.locationLng || -77.0428
        };
      }

      if (!simCoordsRef.current) return;

      const activeOrdersList = dataRef.current?.orders?.filter(o => o.status === 'in-transit' || o.status === 'assigned') || [];
      const currentOrder = activeOrdersList[0];
      
      const targetLat = currentOrder?.customerLat;
      const targetLng = currentOrder?.customerLng;

      let currentLat = simCoordsRef.current.lat || -12.0464;
      let currentLng = simCoordsRef.current.lng || -77.0428;

      if (targetLat && targetLng) {
        const dLat = targetLat - currentLat;
        const dLng = targetLng - currentLng;
        const distance = Math.sqrt(dLat * dLat + dLng * dLng);

        // Si llegó a destino (~50 metros), se queda ahí
        if (distance < 0.0008) {
          currentLat = targetLat;
          currentLng = targetLng;
        } else {
          const step = 0.0006; // velocidad del simulador
          currentLat += (dLat / distance) * step;
          currentLng += (dLng / distance) * step;
        }
      } else {
        // Si no hay coordenadas (drift aleatorio)
        currentLat += (Math.random() * 0.002) - 0.001; 
        currentLng += (Math.random() * 0.002) - 0.001;
      }

      // Guardar coordenadas actualizadas en el ref
      simCoordsRef.current = { lat: currentLat, lng: currentLng };

      if (dataRef.current?.driver?._id || dataRef.current?.driver?.id) {
        // Publicar en Firebase Realtime Database (reemplaza Socket.io)
        publishLocation(currentLat, currentLng, 'on-delivery');
      }
    }, 1000);

    return () => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      // Limpiar presencia en Realtime DB al desmontar
      stopPublishing();
    };
  }, [publishLocation, stopPublishing]);

  // ── Sincronización offline en segundo plano ─────────────────
  useEffect(() => {
    const syncOfflineDeliveries = async () => {
      if (!navigator.onLine) return;
      try {
        const stored = localStorage.getItem('tracky:pending_deliveries');
        if (!stored) return;
        const pending = JSON.parse(stored);
        if (pending.length === 0) return;

        console.log(`🔄 Sincronizando ${pending.length} entrega(s) pendiente(s) offline...`);
        let successCount = 0;

        for (let i = 0; i < pending.length; i++) {
          const item = pending[i];
          try {
            await driverApi.updateOrderStatus(item.orderId, item.status, {
              evidence: item.evidence,
              location: item.location
            });
            successCount++;
          } catch (err) {
            console.error(`Error sincronizando orden ${item.orderId}:`, err);
            if (!err.response) break; // Error de red temporario, detener lote
          }
        }

        if (successCount > 0) {
          const remaining = pending.slice(successCount);
          if (remaining.length === 0) {
            localStorage.removeItem('tracky:pending_deliveries');
          } else {
            localStorage.setItem('tracky:pending_deliveries', JSON.stringify(remaining));
          }
          addToast(`Sincronización completa: ${successCount} entrega(s) subida(s) al servidor.`, 'success');
          fetchMyOrders();
        }
      } catch (err) {
        console.error('Error en proceso de sincronización:', err);
      }
    };

    const interval = setInterval(syncOfflineDeliveries, 15000); // verificar cada 15 segundos
    window.addEventListener('online', syncOfflineDeliveries);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', syncOfflineDeliveries);
    };
  }, [data]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (newStatus === 'delivered') {
      setSelectedOrderForPod(orderId);
      setIsPodModalOpen(true);
      return;
    }

    try {
      await driverApi.updateOrderStatus(orderId, newStatus);
      addToast(`Pedido actualizado: ${newStatus}`, 'success');
      if (newStatus === 'in-transit') {
        simCoordsRef.current = {
          lat: -12.046374,
          lng: -77.042793
        };
      }
      fetchMyOrders();
    } catch (err) {
      if (!err.response || !navigator.onLine) {
        try {
          const stored = localStorage.getItem('tracky:pending_deliveries');
          const pending = stored ? JSON.parse(stored) : [];
          pending.push({
            orderId,
            status: newStatus,
            timestamp: Date.now()
          });
          localStorage.setItem('tracky:pending_deliveries', JSON.stringify(pending));

          if (data) {
            const updatedOrders = data.orders.map(o => 
              (o.id || o._id) === orderId ? { ...o, status: newStatus } : o
            );
            setData({ ...data, orders: updatedOrders });
          }
          addToast('Sin conexión. Estado de ruta guardado localmente.', 'info');
        } catch (stErr) {
          addToast('Error de almacenamiento local', 'error');
        }
      } else {
        addToast('Error al actualizar pedido', 'error');
      }
    }
  };

  const handlePodSubmit = async (e) => {
    e.preventDefault();
    if (!podEvidence.signature) {
      addToast('La firma es obligatoria', 'warning');
      return;
    }
    
    setIsCapturing(true);
    const location = data?.driver?.location || null;

    try {
      await driverApi.updateOrderStatus(selectedOrderForPod, 'delivered', {
        evidence: podEvidence,
        location
      });
      addToast('Entrega completada con éxito', 'success');
      setIsPodModalOpen(false);
      resetPodState();
      fetchMyOrders();
    } catch (err) {
      if (!err.response || !navigator.onLine) {
        try {
          const stored = localStorage.getItem('tracky:pending_deliveries');
          const pending = stored ? JSON.parse(stored) : [];
          pending.push({
            orderId: selectedOrderForPod,
            status: 'delivered',
            evidence: podEvidence,
            location,
            timestamp: Date.now()
          });
          localStorage.setItem('tracky:pending_deliveries', JSON.stringify(pending));

          if (data) {
            const updatedOrders = data.orders.map(o => 
              (o.id || o._id) === selectedOrderForPod ? { ...o, status: 'delivered', evidence: podEvidence } : o
            );
            setData({ ...data, orders: updatedOrders });
          }

          addToast('Sin conexión a internet. Entrega guardada localmente para sincronización automática.', 'info');
          setIsPodModalOpen(false);
          resetPodState();
        } catch (storageErr) {
          console.error(storageErr);
          addToast('Error al guardar datos offline', 'error');
        }
      } else {
        addToast(err.friendlyMessage || 'Error al procesar la entrega', 'error');
      }
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
            <p className="text-xs text-slate-400 mt-1">{data?.driver?.vehicleType} • {data?.driver?.vehiclePlate}</p>
            <p className="text-[10px] font-mono mt-2 bg-black/30 inline-block px-2 py-1 rounded-lg border border-white/10 uppercase tracking-widest text-slate-300">
               {gpsStatus}
            </p>
          </div>
          <button 
            onClick={onLogout}
            className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all border border-white/5"
          >
            <LogOut size={20} />
          </button>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-4">
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
              <p className="text-[9px] font-black uppercase opacity-60 mb-1">Entregas Hoy</p>
              <p className="text-2xl font-black">{completedOrders.length}</p>
           </div>
           <div className="bg-primary-600/20 p-4 rounded-2xl border border-primary-500/20 backdrop-blur-sm">
              <p className="text-[9px] font-black uppercase text-primary-400 mb-1">Pendientes</p>
              <p className="text-2xl font-black">{activeOrders.length}</p>
           </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 -mt-4 overflow-y-auto">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Mi Misión Actual</h3>
          {activeOrders.length > 1 && (
            <button
              onClick={handleOptimizeRoute}
              disabled={isOptimizing}
              className="text-[10px] bg-slate-900 text-white font-black px-4 py-2.5 rounded-xl uppercase tracking-widest hover:bg-primary-600 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md active:scale-95 border border-white/10"
            >
              🗺️ Optimizar Ruta
            </button>
          )}
        </div>
        
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
              <div key={order.id || order._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 animate-in slide-in-from-bottom duration-500">
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
                          <p className="text-sm font-bold text-slate-800 leading-tight">{order.customerAddress}</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="bg-slate-50 p-2 rounded-xl">
                          <Clock size={18} className="text-primary-600" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400">Cliente</p>
                          <p className="text-sm font-bold text-slate-800">{order.customerName}</p>
                       </div>
                    </div>
                 </div>

                  <div className="flex gap-3">
                    {order.status !== 'in-transit' ? (
                      <button 
                        onClick={() => handleStatusUpdate(order.id || order._id, 'in-transit')}
                        className="flex-1 bg-primary-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 text-xs uppercase tracking-widest"
                      >
                        <Navigation size={18} /> Iniciar Ruta
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusUpdate(order.id || order._id, 'delivered')}
                        className="flex-1 bg-green-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 text-xs uppercase tracking-widest"
                      >
                        <CheckCircle2 size={18} /> Confirmar Entrega
                      </button>
                    )}
                    <a 
                      href={`https://wa.me/${order.customerPhone}?text=${encodeURIComponent(`Hola ${order.customerName}, soy tu repartidor de Tracky. Estoy en camino con tu pedido ${order.orderNumber}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 p-4 rounded-2xl text-white active:scale-95 transition-transform"
                    >
                       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
                    <a 
                      href={`tel:${order.customerPhone || '555'}`}
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
                          <p className="text-[10px] font-black uppercase text-slate-400">{order.customerName}</p>
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

      {/* ── Modal Prueba de Entrega (POD) ── */}
      {isPodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-secondary-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3 text-secondary-900">
                <CheckCircle2 size={24} className="text-primary-600" />
                <h3 className="font-black text-lg">Prueba de Entrega</h3>
              </div>
              <button 
                onClick={() => { setIsPodModalOpen(false); resetPodState(); }}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePodSubmit} className="p-6 space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nombre del Receptor</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    required
                    value={podEvidence.recipientName}
                    onChange={e => setPodEvidence({...podEvidence, recipientName: e.target.value})}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex justify-between items-center">
                  <span>Evidencia Fotográfica</span>
                  <span className="text-secondary-400 opacity-60">(Opcional)</span>
                </label>
                <label className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${podEvidence.photo ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                  {podEvidence.photo ? (
                    <div className="relative w-full h-full p-2">
                       <img src={podEvidence.photo} alt="Evidencia" className="w-full h-full object-cover rounded-xl" />
                       <div className="absolute top-4 right-4 bg-primary-600 text-white p-1.5 rounded-lg shadow-lg">
                         <Check size={16} />
                       </div>
                    </div>
                  ) : (
                    <>
                      <Camera size={28} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">Tomar foto del paquete</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    onChange={handlePhotoCapture}
                  />
                </label>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex justify-between items-center">
                  <span>Firma Digital</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <SignaturePad 
                    onSave={(signatureUrl) => setPodEvidence({...podEvidence, signature: signatureUrl})}
                    onClear={() => setPodEvidence({...podEvidence, signature: ''})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isCapturing || !podEvidence.signature}
                className="w-full bg-secondary-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all disabled:shadow-none flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
              >
                {isCapturing ? (
                  <><Loader2 className="animate-spin" size={20} /> Procesando...</>
                ) : (
                  <><CheckCircle2 size={20} /> Finalizar</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverHome;
