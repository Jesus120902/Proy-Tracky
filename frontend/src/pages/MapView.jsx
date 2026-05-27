import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { driversApi, ordersApi } from '../services/api';
import {
  Truck, MapPin, Navigation, Package, User, Clock,
  X, Calendar, Activity, ChevronRight, Route, History
} from 'lucide-react';
import useSocket from '../hooks/useSocket';
import RouteHistoryDrawer from '../components/RouteHistoryDrawer';

// ── Fix iconos Leaflet ────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icono personalizado por estado ──────────────────────────────────
const makeIcon = (color) =>
  L.divIcon({
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 4px 12px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      font-size:16px;font-weight:900;color:white;
    ">🚚</div>`
  });

const driverIcon = {
  'on-delivery': makeIcon('#3b82f6'),
  'available':   makeIcon('#22c55e'),
  'offline':     makeIcon('#94a3b8'),
};

// Recentrar mapa animado ──────────────────────────────────────────
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1.5 });
  }, [center, map]);
  return null;
};

const MapView = ({ user }) => {
  const [drivers, setDrivers]             = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [mapCenter, setMapCenter]         = useState([-12.0464, -77.0428]);
  const [loading, setLoading]             = useState(true);
  const [routeHistory, setRouteHistory]   = useState([]);  // [[lat,lng], ...]
  const [drawerOpen, setDrawerOpen]       = useState(false);

  const companyId  = user?.company?._id || user?.company;
  const { on, off } = useSocket(companyId);

  // ── Cargar datos iniciales ────────────────────────────────────
  const fetchInitialData = useCallback(async () => {
    try {
      const [dRes, oRes] = await Promise.all([
        driversApi.getAll(),
        ordersApi.getAll(),
      ]);
      const activeOrders = oRes.data.orders.filter(o =>
        ['assigned', 'in-transit'].includes(o.status)
      );
      const driversWithOrders = dRes.data.map(d => ({
        ...d,
        activeOrder: activeOrders.find(o => o.driver?._id === d._id),
      }));
      setDrivers(driversWithOrders);
    } catch (err) {
      console.error('Error datos mapa:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
    const syncInterval = setInterval(fetchInitialData, 30000);
    return () => clearInterval(syncInterval);
  }, [fetchInitialData]);

  // ── Escuchar actualizaciones GPS en tiempo real ───────────────
  useEffect(() => {
    on('driver_location_update', (data) => {
      setDrivers(prev =>
        prev.map(d =>
          d._id === data.driverId ? { ...d, location: data.location } : d
        )
      );
      // Si el drawer está abierto y es este conductor, añadir punto al trace
      if (drawerOpen && selectedDriver?._id === data.driverId) {
        setRouteHistory(prev => [...prev, [data.location.lat, data.location.lng]]);
      }
    });

    return () => off('driver_location_update');
  }, [on, off, selectedDriver, drawerOpen]);

  // ── Seleccionar conductor y centrar el mapa ───────────────────
  const handleSelectDriver = (driver) => {
    setSelectedDriver(driver);
    setMapCenter([driver.location.lat, driver.location.lng]);
    setRouteHistory([]);
  };

  // ── Abrir drawer de historial ─────────────────────────────────
  const handleOpenHistory = (driver) => {
    setSelectedDriver(driver);
    setDrawerOpen(true);
  };

  const activeDrivers = drivers.filter(d => d.status === 'on-delivery');

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in duration-700 relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-500/20">
              <Navigation size={24} />
            </div>
            Seguimiento Real-Time
          </h1>
          <p className="text-secondary-500 mt-1 font-medium italic">
            Monitoreo en vivo · Historial GPS por conductor
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-2xl border border-secondary-100 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500" />
            </span>
            <span className="text-sm font-black text-secondary-700 uppercase tracking-tighter">
              {activeDrivers.length} EN RUTA
            </span>
          </div>
          <div className="w-px h-6 bg-secondary-100 mx-2" />
          <button
            onClick={fetchInitialData}
            className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest"
          >
            Sincronizar
          </button>
        </div>
      </div>

      {/* Cuerpo principal */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">

        {/* Panel lateral: Lista de conductores */}
        <div className="w-full lg:w-80 bg-white rounded-[2.5rem] border border-secondary-100 flex flex-col shadow-sm overflow-hidden">
          <div className="p-6 border-b border-secondary-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-secondary-500 uppercase tracking-[0.2em]">
              Flota en Tránsito
            </h3>
            <span className="text-[10px] bg-primary-100 text-primary-600 px-2 py-1 rounded-full font-black">
              {activeDrivers.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
              ))
            ) : activeDrivers.length === 0 ? (
              <div className="p-10 text-center opacity-40">
                <Truck size={48} className="mx-auto mb-4" />
                <p className="text-sm font-bold uppercase tracking-tight">No hay entregas activas</p>
              </div>
            ) : (
              activeDrivers.map(driver => (
                <div
                  key={driver._id}
                  className={`p-3 rounded-2xl border transition-all ${
                    selectedDriver?._id === driver._id
                      ? 'bg-primary-600 border-primary-500 text-white shadow-xl shadow-primary-500/30'
                      : 'bg-white border-slate-100 hover:border-primary-100 hover:bg-primary-50'
                  }`}
                >
                  <button
                    onClick={() => handleSelectDriver(driver)}
                    className="w-full flex items-center gap-3 text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                      selectedDriver?._id === driver._id
                        ? 'bg-white/20 text-white'
                        : 'bg-primary-100 text-primary-700'
                    }`}>
                      {driver.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-black truncate text-sm leading-none ${
                        selectedDriver?._id === driver._id ? 'text-white' : 'text-secondary-900'
                      }`}>
                        {driver.name}
                      </p>
                      <p className={`text-[10px] mt-1 flex items-center gap-1 font-bold ${
                        selectedDriver?._id === driver._id ? 'text-white/70' : 'text-primary-600'
                      }`}>
                        <Package size={10} />
                        {driver.activeOrder?.orderNumber || 'SIN ORDEN'}
                      </p>
                    </div>
                    <ChevronRight
                      size={14}
                      className={`transition-transform flex-shrink-0 ${
                        selectedDriver?._id === driver._id ? 'opacity-100 translate-x-1 text-white' : 'opacity-0'
                      }`}
                    />
                  </button>

                  {/* Botón historial */}
                  <button
                    onClick={() => handleOpenHistory(driver)}
                    className={`mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedDriver?._id === driver._id
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        : 'bg-slate-50 hover:bg-primary-50 text-slate-500 hover:text-primary-600'
                    }`}
                  >
                    <History size={12} />
                    Ver historial de ruta
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Todos los conductores (disponibles + offline) */}
          {!loading && drivers.filter(d => d.status !== 'on-delivery').length > 0 && (
            <div className="p-4 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">
                Flota completa
              </p>
              <div className="space-y-1">
                {drivers.filter(d => d.status !== 'on-delivery').map(driver => (
                  <button
                    key={driver._id}
                    onClick={() => handleOpenHistory(driver)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                      {driver.name.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-500 font-bold truncate flex-1">{driver.name}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      driver.status === 'available' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {driver.status === 'available' ? 'Libre' : 'Offline'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mapa principal */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-secondary-100 shadow-sm overflow-hidden relative">
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; Tracky Logistics"
            />

            {/* Polyline del historial de ruta */}
            {routeHistory.length > 1 && (
              <>
                <Polyline
                  positions={routeHistory}
                  pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8 }}
                />
                {/* Punto de inicio */}
                <CircleMarker
                  center={routeHistory[0]}
                  radius={8}
                  pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1, weight: 2 }}
                />
                {/* Punto final */}
                <CircleMarker
                  center={routeHistory[routeHistory.length - 1]}
                  radius={8}
                  pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1, weight: 2 }}
                />
              </>
            )}

            {/* Marcadores de conductores */}
            {drivers.map(driver => (
              <Marker
                key={driver._id}
                position={[driver.location.lat, driver.location.lng]}
                icon={driverIcon[driver.status] || driverIcon.offline}
                opacity={driver.status === 'offline' ? 0.4 : 1}
                eventHandlers={{ click: () => handleSelectDriver(driver) }}
              >
                <Popup className="custom-popup">
                  <div className="p-3 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black text-sm">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-secondary-900 text-sm leading-none">{driver.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{driver.vehicle.plate}</p>
                      </div>
                    </div>

                    {driver.activeOrder ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Package size={13} className="text-primary-500 mt-0.5" />
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Orden Actual</p>
                            <p className="text-xs font-bold text-slate-800">{driver.activeOrder.orderNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <User size={13} className="text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Cliente</p>
                            <p className="text-xs font-bold text-slate-800">{driver.activeOrder.customer.name}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin size={13} className="text-red-400 mt-0.5" />
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Destino</p>
                            <p className="text-[10px] font-bold text-slate-600 leading-tight">{driver.activeOrder.customer.address}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] font-black text-slate-400 text-center py-2 uppercase">
                        Sin orden activa
                      </p>
                    )}

                    <button
                      onClick={() => handleOpenHistory(driver)}
                      className="mt-3 w-full bg-slate-900 text-white text-[10px] font-black py-2 rounded-xl uppercase tracking-widest hover:bg-primary-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <History size={12} /> Ver Historial
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            <RecenterMap center={mapCenter} />
          </MapContainer>

          {/* HUD: Conductor seleccionado con orden activa */}
          {selectedDriver?.activeOrder && (
            <div className="absolute bottom-6 right-6 z-[1000] w-80 animate-in slide-in-from-bottom-4">
              <div className="bg-slate-950/95 backdrop-blur-xl text-white p-5 rounded-[2rem] shadow-2xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-600 rounded-2xl shadow-lg shadow-primary-500/30">
                      <Truck size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">En Seguimiento</p>
                      <h4 className="text-sm font-black text-white leading-none mt-0.5">{selectedDriver.name}</h4>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedDriver(null); setRouteHistory([]); }}
                    className="p-1.5 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <X size={16} className="text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Vehículo</p>
                    <p className="text-sm font-black">{selectedDriver.vehicle.plate}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Orden</p>
                    <p className="text-sm font-black">{selectedDriver.activeOrder.orderNumber}</p>
                  </div>
                </div>

                <div className="bg-primary-600 rounded-2xl p-3 flex items-center justify-between shadow-lg shadow-primary-500/20">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <p className="text-[10px] font-black leading-tight opacity-90 max-w-[160px] truncate">
                      {selectedDriver.activeOrder.customer.address}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenHistory(selectedDriver)}
                    className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1"
                  >
                    <History size={11} /> Ruta
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Leyenda */}
          <div className="absolute bottom-6 left-6 z-[1000]">
            <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-4">
              {[
                { color: '#3b82f6', label: 'En ruta' },
                { color: '#22c55e', label: 'Libre' },
                { color: '#94a3b8', label: 'Offline' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] font-black text-slate-500 uppercase">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer de historial */}
      <RouteHistoryDrawer
        driver={selectedDriver}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRouteLoaded={(points) => setRouteHistory(points)}
      />
    </div>
  );
};

export default MapView;
