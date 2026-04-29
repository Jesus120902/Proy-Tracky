import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { driversApi, ordersApi } from '../services/api';
import { Truck, MapPin, Navigation, Package, User, Clock, X, Calendar, Activity, ChevronRight } from 'lucide-react';
import useSocket from '../hooks/useSocket';

// --- Simulación de Movimiento Automático ---
// Cada conductor "on-delivery" avanza ~30m por tick en una dirección ligeramente variable
const MOVE_INTERVAL_MS = 2000;
const BASE_STEP = 0.00027; // ~30 metros por tick

// Genera un ángulo inicial aleatorio por conductor (para que no vayan todos en la misma dirección)
const driverAngles = {};
const getAngle = (driverId) => {
  if (!driverAngles[driverId]) {
    driverAngles[driverId] = Math.random() * 2 * Math.PI;
  }
  return driverAngles[driverId];
};
const updateAngle = (driverId) => {
  // Gira levemente (±15°) para simular curvas
  driverAngles[driverId] = (driverAngles[driverId] || 0) + (Math.random() - 0.5) * 0.5;
  return driverAngles[driverId];
};

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
  const [routeHistory, setRouteHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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

      // Si el conductor seleccionado está en pantalla, actualizar su historial levemente si está activo el modo historial
      if (selectedDriver?._id === data.driverId && showHistory) {
        setRouteHistory(prev => [...prev, [data.location.lat, data.location.lng]]);
      }
    });

    const syncInterval = setInterval(fetchInitialData, 30000);
    return () => clearInterval(syncInterval);
  }, [user, selectedDriver, showHistory]);

  const fetchInitialData = async () => {
    try {
      const dRes = await driversApi.getAll();
      const oRes = await ordersApi.getAll();
      const activeOrders = oRes.data.orders.filter(o => ['assigned', 'in-transit'].includes(o.status));

      setDrivers(prevDrivers => {
        return dRes.data.map(d => {
          // Preservar la posición simulada actual si el conductor ya existe en el estado
          const existing = prevDrivers.find(p => p._id === d._id);
          return {
            ...d,
            // Mantener la posición simulada, si no hay una usar la del API
            location: existing ? existing.location : d.location,
            activeOrder: activeOrders.find(o => o.driver?._id === d._id)
          };
        });
      });
    } catch (error) {
      console.error("Error en datos de mapa:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Generador de rutas históricas simuladas ---
  // Cuando el API no tiene datos reales, genera una ruta creíble para esa fecha
  const generateSimulatedRoute = (driverId, date, startLat, startLng) => {
    // Semilla determinista basada en fecha + driverId → misma ruta siempre para la misma fecha
    const seed = date.split('-').join('') + (driverId?.toString().slice(-4) || '0000');
    let rng = parseInt(seed, 10) % 99991; // número primo para mejor distribución
    const rand = () => {
      rng = (rng * 16807 + 0) % 2147483647;
      return (rng - 1) / 2147483646;
    };

    // Parámetros del día: cada fecha tiene distinta zona de inicio y número de puntos
    const dayOffsets = { 0: [0.012, -0.008], 1: [-0.005, 0.018], 2: [0.020, 0.003], 3: [-0.018, -0.012] };
    const dayIndex = parseInt(date.slice(-2)) % 4;
    const [offLat, offLng] = dayOffsets[dayIndex] || [0, 0];

    let lat = startLat + offLat;
    let lng = startLng + offLng;
    let angle = rand() * 2 * Math.PI;

    const points = [[lat, lng]];
    const totalPoints = 40 + Math.floor(rand() * 30); // entre 40 y 70 puntos

    for (let i = 0; i < totalPoints; i++) {
      // Curvas más pronunciadas para simular calles (ángulo varía ±25°)
      angle += (rand() - 0.5) * 0.9;
      // Paso variable: a veces para (semáforos), a veces avanza más rápido
      const step = 0.0002 + rand() * 0.0004;
      lat += Math.sin(angle) * step;
      lng += Math.cos(angle) * step;
      points.push([lat, lng]);
    }

    return points;
  };

  const fetchHistory = async (driverId, date) => {
    try {
      const { data } = await driversApi.getHistory(driverId, date);

      if (data.path && data.path.length > 0) {
        // Datos reales del API
        setRouteHistory(data.path.map(p => [p.lat, p.lng]));
      } else {
        // Sin datos reales → generar ruta simulada para la demo
        const driver = drivers.find(d => d._id === driverId);
        const baseLat = driver?.location?.lat || 40.7128;
        const baseLng = driver?.location?.lng || -74.006;
        const simulated = generateSimulatedRoute(driverId, date, baseLat, baseLng);
        setRouteHistory(simulated);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  // --- Movimiento automático cada 2 segundos ---
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers(prevDrivers =>
        prevDrivers.map(driver => {
          if (driver.status !== 'on-delivery') return driver;

          const angle = updateAngle(driver._id);
          const newLat = driver.location.lat + Math.sin(angle) * BASE_STEP;
          const newLng = driver.location.lng + Math.cos(angle) * BASE_STEP;

          return {
            ...driver,
            location: { lat: newLat, lng: newLng }
          };
        })
      );

      // Si hay un conductor seleccionado con historial activo, añadir su nueva posición al trail
      setSelectedDriver(prev => {
        if (!prev || prev.status !== 'on-delivery') return prev;
        const angle = driverAngles[prev._id] || getAngle(prev._id);
        const newLat = prev.location.lat + Math.sin(angle) * BASE_STEP;
        const newLng = prev.location.lng + Math.cos(angle) * BASE_STEP;
        const updated = { ...prev, location: { lat: newLat, lng: newLng } };
        if (showHistory) {
          setRouteHistory(h => [...h, [newLat, newLng]]);
        }
        return updated;
      });
    }, MOVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [showHistory]);

  const handleSelectDriver = (driver) => {
    setSelectedDriver(driver);
    setMapCenter([driver.location.lat, driver.location.lng]);
    if (showHistory) {
      fetchHistory(driver._id, selectedDate);
    }
  };

  const toggleHistory = () => {
    const nextState = !showHistory;
    setShowHistory(nextState);
    if (nextState && selectedDriver) {
      fetchHistory(selectedDriver._id, selectedDate);
    } else {
      setRouteHistory([]);
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
                  onClick={() => handleSelectDriver(driver)}
                  className={`w-full p-4 flex items-center gap-4 rounded-2xl transition-all group ${selectedDriver?._id === driver._id ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/30' : 'hover:bg-primary-50'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black border-2 ${selectedDriver?._id === driver._id ? 'bg-white/20 border-white text-white' : 'bg-primary-100 border-primary-50 text-primary-700'}`}>
                    {driver.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className={`font-black truncate text-sm leading-none ${selectedDriver?._id === driver._id ? 'text-white' : 'text-secondary-900'}`}>{driver.name}</p>
                    <p className={`text-[10px] mt-1 flex items-center gap-1 font-bold tracking-tight ${selectedDriver?._id === driver._id ? 'text-white/70' : 'text-primary-600'}`}>
                      <Package size={10} /> {driver.activeOrder?.orderNumber || 'SIN ORDEN'}
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
          {/* Botones Flotantes del Mapa */}
          <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
            <button
              onClick={toggleHistory}
              className={`p-4 rounded-2xl shadow-xl flex items-center gap-2 transition-all font-black text-xs uppercase tracking-widest ${showHistory ? 'bg-secondary-900 text-white' : 'bg-white text-secondary-600 hover:bg-slate-50'}`}
            >
              <Activity size={18} className={showHistory ? 'animate-pulse text-primary-400' : ''} />
              {showHistory ? 'Viendo Historial' : 'Modo Historial'}
            </button>

            {showHistory && (
              <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-left-4">
                <Calendar size={18} className="text-primary-600" />
                <input
                  type="date"
                  className="outline-none text-xs font-black uppercase"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (selectedDriver) fetchHistory(selectedDriver._id, e.target.value);
                  }}
                />
              </div>
            )}
          </div>

          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; Tracky Logistics'
            />

            {showHistory && routeHistory.length > 0 && (
              <Polyline
                positions={routeHistory}
                pathOptions={{
                  color: '#ef4444',
                  weight: 6,
                  opacity: 0.9
                }}
              />
            )}
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

                  {/* Badge de simulación activa */}
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Movimiento simulado · cada 2 seg</p>
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

export default MapView;
