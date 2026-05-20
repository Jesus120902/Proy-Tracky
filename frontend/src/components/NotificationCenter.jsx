import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Package,
  Truck,
  AlertTriangle,
  Info,
  Clock,
  CheckCheck,
} from 'lucide-react';

// ── Context ──────────────────────────────────────────────────────
const NotificationContext = createContext(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
};

// ── Tipos de notificación ────────────────────────────────────────
const NOTIFICATION_TYPES = {
  order_status:   { icon: Package,      color: 'text-blue-500',   bg: 'bg-blue-50',   label: 'Orden' },
  driver_alert:   { icon: Truck,        color: 'text-purple-500', bg: 'bg-purple-50', label: 'Conductor' },
  warning:        { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50',  label: 'Alerta' },
  success:        { icon: CheckCircle2, color: 'text-green-500',  bg: 'bg-green-50',  label: 'Éxito' },
  info:           { icon: Info,         color: 'text-slate-500',  bg: 'bg-slate-50',  label: 'Info' },
};

const statusLabels = {
  pending:    'Pendiente',
  assigned:   'Asignado',
  'in-transit': 'En Ruta',
  delivered:  'Entregado',
  cancelled:  'Cancelado',
};

let notifCounter = 0;

// ── Provider ─────────────────────────────────────────────────────
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen]               = useState(false);

  const addNotification = useCallback((type, title, message, meta = {}) => {
    const id = ++notifCounter;
    const newNotif = {
      id,
      type,
      title,
      message,
      meta,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev].slice(0, 50)); // máx. 50
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const remove = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markRead, markAllRead, remove, clearAll, unreadCount, isOpen, setIsOpen }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// ── Panel de notificaciones ───────────────────────────────────────
const NotificationPanel = () => {
  const { notifications, markRead, markAllRead, remove, clearAll, unreadCount, isOpen, setIsOpen } =
    useNotifications();
  const panelRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, setIsOpen]);

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `hace ${diff}s`;
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón campana */}
      <button
        id="notifications-bell"
        onClick={() => {
          setIsOpen((o) => !o);
          if (!isOpen) markAllRead();
        }}
        className="relative p-2.5 rounded-xl hover:bg-secondary-100 transition-all text-secondary-500 hover:text-secondary-900"
        title="Notificaciones"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-3 w-[380px] bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-900/10 z-50 overflow-hidden"
          style={{ animation: 'slideDown 0.2s ease-out' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Centro de Alertas</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {notifications.length === 0
                  ? 'Sin alertas'
                  : `${notifications.length} evento${notifications.length !== 1 ? 's' : ''} reciente${notifications.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                >
                  Limpiar
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center">
                  <CheckCheck size={28} className="text-slate-300" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  Todo al día
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const typeConfig = NOTIFICATION_TYPES[notif.type] || NOTIFICATION_TYPES.info;
                const Icon = typeConfig.icon;
                return (
                  <div
                    key={notif.id}
                    className={`flex gap-4 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer group ${
                      !notif.read ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => markRead(notif.id)}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-2xl ${typeConfig.bg} flex items-center justify-center mt-0.5`}>
                      <Icon size={18} className={typeConfig.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-black text-slate-900 leading-tight">{notif.title}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); remove(notif.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-slate-300 hover:text-red-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{notif.message}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock size={10} className="text-slate-300" />
                        <span className="text-[10px] text-slate-400 font-bold">
                          {formatTime(notif.timestamp)}
                        </span>
                        {!notif.read && (
                          <span className="ml-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Hook para conectar Socket.io con las notificaciones ───────────
/**
 * Debe llamarse dentro de un componente que tenga acceso a useSocket y useNotifications.
 * Registra los eventos de Socket.io y los convierte en notificaciones.
 */
export const useSocketNotifications = (socketHook) => {
  const { addNotification } = useNotifications();
  const { on, off } = socketHook;

  useEffect(() => {
    if (!on) return;

    // Evento: cambio de estado de una orden
    on('order_status_update', (data) => {
      const statusLabel = statusLabels[data?.status] || data?.status?.toUpperCase() || 'ACTUALIZADO';
      const isDelivered = data?.status === 'delivered';
      const isCancelled = data?.status === 'cancelled';

      addNotification(
        isDelivered ? 'success' : isCancelled ? 'warning' : 'order_status',
        `Orden ${data?.orderNumber || 'S/N'} → ${statusLabel}`,
        isDelivered
          ? 'Entrega completada exitosamente ✅'
          : isCancelled
          ? 'La orden fue cancelada'
          : `Estado actualizado en tiempo real`,
        { orderId: data?.orderId, status: data?.status }
      );
    });

    // Evento: conductor inicia ruta
    on('driver_started_route', (data) => {
      addNotification(
        'driver_alert',
        `${data?.driverName || 'Conductor'} inició ruta`,
        `Saliendo hacia ${data?.destination || 'destino'}`,
        { driverId: data?.driverId }
      );
    });

    // Evento: retraso detectado
    on('delivery_delayed', (data) => {
      addNotification(
        'warning',
        `Retraso detectado en ${data?.orderNumber || 'orden'}`,
        data?.reason || 'El conductor se ha detenido por tiempo inusual',
        { orderId: data?.orderId }
      );
    });

    return () => {
      off('order_status_update');
      off('driver_started_route');
      off('delivery_delayed');
    };
  }, [on, off, addNotification]);
};

// ── Animación CSS inline (para el panel) ─────────────────────────
const NotificationStyles = () => (
  <style>{`
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }
  `}</style>
);

export { NotificationPanel, NotificationStyles, NOTIFICATION_TYPES };
export default NotificationPanel;
