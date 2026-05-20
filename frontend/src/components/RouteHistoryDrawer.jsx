import React, { useState, useEffect, useCallback } from 'react';
import {
  X, MapPin, Calendar, Clock, Activity, Route,
  ChevronDown, ChevronUp, Loader2, Navigation, TrendingUp
} from 'lucide-react';
import { driversApi } from '../services/api';

// ── Cálculo de distancia Haversine entre dos puntos GPS ──────────
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calcRouteMetrics = (path) => {
  if (!path || path.length < 2) return { distanceKm: 0, durationMin: 0, points: path?.length || 0 };
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += haversineKm(path[i].lat, path[i].lng, path[i + 1].lat, path[i + 1].lng);
  }
  // Velocidad promedio estimada ~30 km/h en ciudad
  const durationMin = Math.round((total / 30) * 60);
  return { distanceKm: total.toFixed(2), durationMin, points: path.length };
};

const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  return new Date(isoString).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit'
  });
};

// ── Componente principal ─────────────────────────────────────────
const RouteHistoryDrawer = ({ driver, isOpen, onClose, onRouteLoaded }) => {
  const [date, setDate]           = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading]     = useState(false);
  const [historyData, setHistory] = useState(null);
  const [expanded, setExpanded]   = useState(null); // índice del punto expandido

  // Cargar historial al abrir o cambiar fecha/conductor
  const loadHistory = useCallback(async () => {
    if (!driver?._id) return;
    setLoading(true);
    setHistory(null);
    try {
      const { data } = await driversApi.getHistory(driver._id, date);
      setHistory(data);
      // Pasar los puntos al mapa padre para dibujar la polyline
      if (onRouteLoaded) {
        onRouteLoaded(data.path?.map(p => [p.lat, p.lng]) || []);
      }
    } catch (err) {
      console.error('Error cargando historial:', err);
      setHistory({ path: [] });
      if (onRouteLoaded) onRouteLoaded([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver?._id, date]);

  useEffect(() => {
    if (isOpen && driver) loadHistory();
  }, [isOpen, driver, loadHistory]);

  // Limpiar al cerrar
  const handleClose = () => {
    if (onRouteLoaded) onRouteLoaded([]);
    onClose();
  };

  const metrics = historyData ? calcRouteMetrics(historyData.path) : null;
  const path    = historyData?.path || [];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-[1000] w-full max-w-md bg-white shadow-2xl
          transform transition-transform duration-400 ease-out flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-slate-950 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">
                {driver?.name?.charAt(0) || '?'}
              </div>
              <div>
                <h2 className="font-black text-base leading-none">{driver?.name || 'Conductor'}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {driver?.vehicle?.plate || '---'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Selector de fecha */}
          <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3 border border-white/10">
            <Calendar size={18} className="text-primary-400 flex-shrink-0" />
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-white text-sm font-black outline-none flex-1 cursor-pointer"
            />
            <button
              onClick={loadHistory}
              className="text-[10px] font-black text-primary-400 hover:text-primary-300 uppercase tracking-widest"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Métricas */}
        {metrics && !loading && (
          <div className="flex-shrink-0 grid grid-cols-3 gap-px bg-slate-100">
            <div className="bg-white p-4 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Distancia
              </p>
              <p className="text-xl font-black text-slate-900">{metrics.distanceKm}</p>
              <p className="text-[10px] text-slate-400 font-bold">km</p>
            </div>
            <div className="bg-white p-4 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Duración
              </p>
              <p className="text-xl font-black text-slate-900">{metrics.durationMin}</p>
              <p className="text-[10px] text-slate-400 font-bold">min est.</p>
            </div>
            <div className="bg-white p-4 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Puntos GPS
              </p>
              <p className="text-xl font-black text-slate-900">{metrics.points}</p>
              <p className="text-[10px] text-slate-400 font-bold">registros</p>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
              <Loader2 size={36} className="animate-spin text-primary-500" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Recuperando historial GPS...
              </p>
            </div>
          ) : path.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300 p-8">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center">
                <Route size={36} className="text-slate-200" />
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">
                Sin registros GPS
              </p>
              <p className="text-xs text-slate-300 font-medium text-center">
                El conductor no ha tenido actividad en fecha<br />
                <span className="font-black text-slate-400">{date}</span>
              </p>
              <p className="text-[10px] text-slate-300 bg-slate-50 px-4 py-2 rounded-xl font-bold">
                Los datos se registran cuando el conductor activa su GPS desde la app móvil
              </p>
            </div>
          ) : (
            <div className="p-6">
              {/* Barra de resumen de ruta */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Navigation size={16} className="text-green-600" />
                </div>
                <div className="flex-1 h-1 bg-gradient-to-r from-green-400 via-primary-500 to-red-400 rounded-full opacity-60" />
                <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-red-500" />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Activity size={14} className="text-primary-500" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Línea de Tiempo · {path.length} registros
                </p>
              </div>

              {/* Timeline de puntos GPS */}
              <div className="relative">
                {/* Línea vertical */}
                <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-green-400 via-primary-400 to-red-400 opacity-30" />

                <div className="space-y-1">
                  {path.map((point, i) => {
                    const isFirst  = i === 0;
                    const isLast   = i === path.length - 1;
                    const isExpand = expanded === i;

                    // Distancia acumulada hasta este punto
                    let distAcc = 0;
                    for (let j = 0; j < i; j++) {
                      distAcc += haversineKm(path[j].lat, path[j].lng, path[j+1].lat, path[j+1].lng);
                    }

                    return (
                      <div key={i} className="relative">
                        <button
                          onClick={() => setExpanded(isExpand ? null : i)}
                          className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left
                            ${isExpand ? 'bg-primary-50 ring-1 ring-primary-100' : 'hover:bg-slate-50'}`}
                        >
                          {/* Dot */}
                          <div className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-black
                            ${isFirst  ? 'bg-green-500 border-green-400 text-white' :
                              isLast   ? 'bg-red-500 border-red-400 text-white' :
                              isExpand ? 'bg-primary-500 border-primary-400 text-white' :
                                         'bg-white border-slate-200 text-slate-500'}`}
                          >
                            {isFirst ? '▶' : isLast ? '⚑' : i + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black text-slate-700">
                                {isFirst ? 'Inicio de Ruta' : isLast ? 'Último Registro' : `Punto ${i + 1}`}
                              </p>
                              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                <Clock size={10} />
                                {formatTime(point.timestamp)}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                            </p>
                          </div>

                          {isExpand ? (
                            <ChevronUp size={14} className="text-primary-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown size={14} className="text-slate-300 flex-shrink-0" />
                          )}
                        </button>

                        {/* Detalle expandido */}
                        {isExpand && (
                          <div className="ml-13 mx-3 mb-2 p-4 bg-white rounded-2xl border border-primary-100 shadow-sm animate-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Latitud</p>
                                <p className="text-xs font-mono font-bold text-slate-700">{point.lat.toFixed(7)}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Longitud</p>
                                <p className="text-xs font-mono font-bold text-slate-700">{point.lng.toFixed(7)}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Hora exacta</p>
                                <p className="text-xs font-bold text-slate-700">
                                  {point.timestamp
                                    ? new Date(point.timestamp).toLocaleString('es-ES')
                                    : 'N/D'}
                                </p>
                              </div>
                              {i > 0 && (
                                <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dist. acumulada</p>
                                  <p className="text-xs font-bold text-primary-600">{distAcc.toFixed(2)} km</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-100 p-4 bg-slate-50">
          <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest">
            Datos GPS registrados por Socket.io en tiempo real
          </p>
        </div>
      </div>
    </>
  );
};

export default RouteHistoryDrawer;
