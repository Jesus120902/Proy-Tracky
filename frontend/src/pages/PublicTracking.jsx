import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Package, Truck, MapPin, Clock, Search, ArrowLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { StatusBadge } from '../components/Badges';
import useSocket from '../hooks/useSocket';

// Solución para iconos de Leaflet en React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 13);
  }, [position, map]);
  return null;
};

const PublicTracking = () => {
  const { id } = useParams();
  const [orderNumber, setOrderNumber] = useState(id || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTracking = async (number) => {
    if (!number) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/orders/track/${number}`);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo encontrar el pedido');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTracking(id);
  }, [id]);

  // Tiempo Real para el cliente final
  const { on } = useSocket(order?.company?._id || order?.company);

  useEffect(() => {
    if (order) {
      on('driver_location_update', (data) => {
        if (order.driver && data.driverId === order.driver._id) {
          setOrder(prev => ({
            ...prev,
            driver: { ...prev.driver, location: data.location }
          }));
        }
      });

      on('order_status_update', (data) => {
        if (data.orderId === order._id || data.orderNumber === order.orderNumber) {
          setOrder(prev => ({ ...prev, status: data.status }));
        }
      });
    }
  }, [order, on]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTracking(orderNumber);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header Público */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-2 rounded-xl text-white">
            <Truck size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter">TRACKY <span className="text-primary-600">LIVE</span></span>
        </div>
        <Link to="/" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Volver al Inicio
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Buscador de Tracking */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <h2 className="text-2xl font-black mb-2 tracking-tight">Rastrea tu Envío</h2>
          <p className="text-slate-400 text-sm font-medium mb-6">Ingresa el número de seguimiento proporcionado por tu proveedor.</p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Ej: ORD-1712853752631" 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-slate-700"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="bg-primary-600 text-white font-black px-10 py-4 rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all uppercase tracking-widest text-sm"
            >
              Consultar
            </button>
          </form>
        </section>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Localizando paquete...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-8 rounded-[2rem] border border-red-100 text-center animate-in zoom-in-95">
            <h3 className="font-black text-lg mb-1">Lo sentimos</h3>
            <p className="font-bold text-sm opacity-80">{error}</p>
          </div>
        )}

        {order && (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
            {/* Cabecera de Resultado */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100">
              <div className="bg-secondary-900 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Estado del Envío</p>
                   <div className="flex items-center gap-4">
                      <h3 className="text-3xl font-black">{order.orderNumber}</h3>
                      <StatusBadge status={order.status === 'in-transit' ? 'in route' : order.status} />
                   </div>
                </div>
                {order.company && (
                  <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl border border-white/5">
                    <p className="text-right">
                      <span className="text-[10px] block opacity-60 font-black uppercase tracking-widest">Enviado por</span>
                      <span className="font-bold">{order.company.name}</span>
                    </p>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-secondary-900 overflow-hidden shadow-lg">
                       {order.company.logoUrl ? <img src={order.company.logoUrl} alt="logo" className="w-full h-full object-cover" /> : <Package size={20} />}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                          <MapPin size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Destino</p>
                          <p className="font-bold text-slate-700 leading-snug">{order.address}</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
                          <Package size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Items en ruta</p>
                          <p className="font-bold text-slate-700 leading-snug">{order.items || 'Carga General'}</p>
                       </div>
                    </div>
                    {order.driver && (
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                               {order.driver.name.charAt(0)}
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tu repartidor</p>
                               <p className="font-bold text-slate-900">{order.driver.name}</p>
                            </div>
                         </div>
                         <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${order.driver.status === 'on-delivery' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                            {order.driver.status === 'on-delivery' ? 'En Movimiento' : 'Detenido'}
                         </div>
                      </div>
                    )}
                 </div>

                 {/* Mapa en Vivo */}
                 <div className="bg-slate-200 rounded-[2rem] overflow-hidden min-h-[300px] shadow-inner relative ring-1 ring-slate-100">
                    <MapContainer 
                      center={order.driver?.location ? [order.driver.location.lat, order.driver.location.lng] : [40.7128, -74.006]} 
                      zoom={13} 
                      className="w-full h-full"
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {order.driver?.location && (
                        <>
                          <Marker position={[order.driver.location.lat, order.driver.location.lng]}>
                            <Popup>
                              Ubicación actual de tu pedido
                            </Popup>
                          </Marker>
                          <RecenterMap position={[order.driver.location.lat, order.driver.location.lng]} />
                        </>
                      )}
                    </MapContainer>
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg border border-white/20">
                      🛰️ Actualizando posición por satélite...
                    </div>
                 </div>
              </div>
            </div>

            {/* Timeline simplified */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex items-center justify-between">
               <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${order.status !== 'pending' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase">Confirmado</span>
               </div>
               <div className="h-0.5 flex-1 bg-slate-100 mx-4"></div>
               <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${(order.status === 'in-transit' || order.status === 'delivered') ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Truck size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase">En Camino</span>
               </div>
               <div className="h-0.5 flex-1 bg-slate-100 mx-4"></div>
               <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${order.status === 'delivered' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Package size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase">Entregado</span>
               </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-12 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
        Propulsado por <span className="text-secondary-900 border-b-2 border-primary-500">Tracky Enterprise</span> &copy; 2026
      </footer>
    </div>
  );
};

export default PublicTracking;
