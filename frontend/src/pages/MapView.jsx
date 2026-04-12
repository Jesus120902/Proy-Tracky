import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { driversApi, ordersApi } from '../services/api';
import { Truck, MapPin, Navigation, Package, User, Clock, X } from 'lucide-react';
import useSocket from '../hooks/useSocket';

// Corregir iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para recentrar el mapa suavemente
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1.5 });
  }, [center, map]);
  return null;
};

const MapView = ({ user }) => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.006]);
  const [loading, setLoading] = useState(true);
  
  // Custom Hook de Tiempo Real (filtrado por empresa)
  const { on } = useSocket(user?.company?._id || user?.company);

  useEffect(() => {
    fetchInitialData();

    // Escuchar actualizaciones de ubicación en tiempo real
    on('driver_location_update', (data) => {
      setDrivers(prevDrivers => 
        prevDrivers.map(d => 
          d._id === data.driverId 
            ? { ...d, location: data.location } 
            : d
        )
      );
    });

    // Intervalo de sincronización con API (cada 30 segundos)
    const syncInterval = setInterval(fetchInitialData, 30000);

    return () => {
      clearInterval(syncInterval);
    };
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const dRes = await driversApi.getAll();
      // Para cada conductor, podríamos buscar su orden activa si quisiéramos ser ultra precisos,
      // pero el API ya debería poblar esto si lo configuramos. 
      // Aquí simularemos el enlace con órdenes para el MVP del mapa.
      const oRes = await ordersApi.getAll();
      const activeOrders = oRes.data.orders.filter(o => o.status === 'assigned' || o.status === 'in route' || o.status === 'in-transit');
      
      const driversWithOrders = dRes.data.map(d => ({
        ...d,
        activeOrder: activeOrders.find(o => o.driver?._id === d._id)
      }));

      setDrivers(driversWithOrders);
      driversRef.current = driversWithOrders;
    } catch (error) {
      console.error("Error en datos de mapa:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeDrivers = drivers.filter(d => d.status === 'on-delivery');

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in duration-700 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 flex items-center gap-3 tracking-tight">
             <div className="p-2 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-500/20">
                <Navigation size={24} />
             </div>
             Seguimiento Real-Time
          </h1>
          <p className="text-secondary-500 mt-1 font-medium italic">Simulando movimiento activo de la flota...</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-2xl border border-secondary-100 shadow-sm">
           <div className="flex items-center gap-2">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
              </span>
              <span className="text-sm font-black text-secondary-700 uppercase tracking-tighter">{activeDrivers.length} EN RUTA</span>
           </div>
           <div className="w-px h-6 bg-secondary-100 mx-2"></div>
           <button onClick={fetchInitialData} className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest">Sincronizar</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Panel lateral: Flota Activa */}
        <div className="w-full lg:w-80 bg-white rounded-[2.5rem] border border-secondary-100 flex flex-col shadow-sm overflow-hidden animate-in slide-in-from-left-4">
          <div className="p-6 border-b border-secondary-100 bg-slate-50/50">
            <h3 className="text-[10px] font-black text-secondary-500 uppercase tracking-[0.2em]">Flota en Tránsito</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeDrivers.length === 0 ? (
              <div className="p-10 text-center opacity-40">
                <Truck size={48} className="mx-auto mb-4" />
                <p className="text-sm font-bold uppercase tracking-tight">No hay entregas activas</p>
              </div>
            ) : (
              activeDrivers.map(driver => (
                <button 
                  key={driver._id}
                  onClick={() => {
                    setSelectedDriver(driver);
                    setMapCenter([driver.location.lat, driver.location.lng]);
                  }}
                  className={`w-full p-4 flex items-center gap-4 rounded-2xl transition-all group ${selectedDriver?._id === driver._id ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/30' : 'hover:bg-primary-50'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black border-2 ${selectedDriver?._id === driver._id ? 'bg-white/20 border-white text-white' : 'bg-primary-100 border-primary-50 text-primary-700'}`}>
                    {driver.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className={`font-black truncate text-sm leading-none ${selectedDriver?._id === driver._id ? 'text-white' : 'text-secondary-900'}`}>{driver.name}</p>
                    <p className={`text-[10px] mt-1 flex items-center gap-1 font-bold tracking-tight ${selectedDriver?._id === driver._id ? 'text-white/70' : 'text-primary-600'}`}>
                      <Package size={10} /> {driver.activeOrder?.orderNumber || 'ORD-SYNC'}
                    </p>
                  </div>
                  <ChevronRight size={16} className={`transition-transform ${selectedDriver?._id === driver._id ? 'opacity-100 translate-x-1' : 'opacity-0'}`} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Mapa Principal */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-secondary-100 shadow-sm overflow-hidden relative group animate-in zoom-in-95 duration-700">
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; Tracky Logistics'
            />
            {drivers.map(driver => (
              <Marker 
                key={driver._id} 
                position={[driver.location.lat, driver.location.lng]}
                opacity={driver.status === 'offline' ? 0.3 : 1}
              >
                <Popup className="custom-popup">
                  <div className="p-4 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-4 border-b border-secondary-50 pb-3">
                       <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black text-sm">
                        {driver.name.charAt(0)}
                       </div>
                       <div>
                         <p className="font-black text-secondary-900 text-sm leading-none">{driver.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{driver.vehicle.plate}</p>
                       </div>
                    </div>
                    
                    {driver.activeOrder ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                           <Package size={14} className="text-primary-500 mt-0.5" />
                           <div>
                             <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest leading-none">Orden Actual</p>
                             <p className="text-xs font-bold text-secondary-800 mt-1">{driver.activeOrder.orderNumber}</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-2">
                           <User size={14} className="text-secondary-400 mt-0.5" />
                           <div>
                             <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest leading-none">Cliente</p>
                             <p className="text-xs font-bold text-secondary-800 mt-1">{driver.activeOrder.customer.name}</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-2">
                           <MapPin size={14} className="text-red-400 mt-0.5" />
                           <div>
                             <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest leading-none">Destino</p>
                             <p className="text-[10px] font-bold text-secondary-600 mt-1 leading-tight">{driver.activeOrder.customer.address}</p>
                           </div>
                        </div>
                        <div className="bg-primary-50 p-2 rounded-xl flex items-center justify-center gap-2 mt-2">
                           <Clock size={12} className="text-primary-600" />
                           <span className="text-[10px] font-black text-primary-700">ENTREGA ESTIMADA: 20 MIN</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                         <p className="text-[10px] font-black text-slate-400 uppercase">Sin órdenes activas</p>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
            <RecenterMap center={mapCenter} />
          </MapContainer>
          
          {/* HUD Overlay: Detalles Rápidos */}
          {selectedDriver && selectedDriver.activeOrder && (
            <div className="absolute top-6 left-6 right-6 z-[1000] lg:left-auto lg:top-auto lg:bottom-10 lg:right-10 lg:w-[400px] animate-in slide-in-from-bottom-10">
               <div className="glass-panel p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                 {/* Efecto Radar de fondo */}
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-600/10 rounded-full animate-ping"></div>
                 
                 <div className="relative z-10">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-500/30">
                          <Truck size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">En Seguimiento</p>
                          <h4 className="text-lg font-black text-secondary-900 leading-none mt-1">{selectedDriver.name}</h4>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedDriver(null)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                      >
                        <X size={20} className="text-slate-400" />
                      </button>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-50/50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Velocidad</p>
                        <p className="text-xl font-black text-secondary-900">42 <span className="text-xs text-slate-500 font-bold uppercase">km/h</span></p>
                     </div>
                     <div className="bg-slate-50/50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batería</p>
                        <p className="text-xl font-black text-green-600 uppercase">86%</p>
                     </div>
                   </div>
                   
                   <div className="mt-4 p-4 bg-primary-600 rounded-2xl flex items-center justify-between text-white shadow-xl shadow-primary-500/20">
                      <div className="flex items-center gap-3">
                        <Package size={20} />
                        <div>
                           <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">Orden Actual</p>
                           <p className="text-sm font-black">{selectedDriver.activeOrder.orderNumber}</p>
                        </div>
                      </div>
                      <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-black transition-all">DETALLES</button>
                   </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Icono decorativo para botones
const ChevronRight = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export default MapView;
