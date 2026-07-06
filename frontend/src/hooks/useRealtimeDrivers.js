/**
 * useRealtimeDrivers.js
 * Hook que reemplaza useSocket.js.
 * Escucha ubicaciones de conductores en Firebase Realtime Database
 * y permite que un conductor publique su propia ubicación.
 *
 * Estructura en Realtime DB:
 * companies/{companyId}/drivers/{driverId} = { lat, lng, name, status, updatedAt }
 * companies/{companyId}/events/orderUpdates/{timestamp} = { orderId, status }
 */
import { useEffect, useRef, useCallback } from 'react';
import { ref, onValue, set, off as dbOff, serverTimestamp } from 'firebase/database';
import { database } from '../firebase';

const THROTTLE_MS = 5000;

/**
 * Para el ADMIN MAP: escucha todas las ubicaciones de conductores de la empresa
 */
export const useDriverLocations = (companyId, onUpdate) => {
  useEffect(() => {
    if (!companyId) return;

    const driversRef = ref(database, `companies/${companyId}/drivers`);

    const unsubscribe = onValue(driversRef, (snapshot) => {
      const data = snapshot.val();
      if (data && onUpdate) {
        onUpdate(data); // { [driverId]: { lat, lng, name, status, updatedAt } }
      }
    });

    return () => dbOff(driversRef);
  }, [companyId, onUpdate]);
};

/**
 * Para el ADMIN: escucha actualizaciones de estado de órdenes
 */
export const useOrderStatusUpdates = (companyId, onUpdate) => {
  useEffect(() => {
    if (!companyId) return;

    const eventsRef = ref(database, `companies/${companyId}/events/orderUpdates`);
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data && onUpdate) {
        // Tomar el último evento
        const events = Object.values(data);
        const latest = events[events.length - 1];
        if (latest) onUpdate(latest);
      }
    });

    return () => dbOff(eventsRef);
  }, [companyId, onUpdate]);
};

/**
 * Para el CONDUCTOR: publica su ubicación GPS con throttle
 */
export const usePublishDriverLocation = (companyId, driverId, driverName) => {
  const lastEmitTime = useRef(0);

  const publishLocation = useCallback(
    (lat, lng, status = 'on-delivery') => {
      if (!companyId || !driverId) return;

      const now = Date.now();
      if (now - lastEmitTime.current < THROTTLE_MS) return;
      lastEmitTime.current = now;

      const driverRef = ref(database, `companies/${companyId}/drivers/${driverId}`);
      set(driverRef, {
        lat,
        lng,
        name: driverName || 'Conductor',
        status,
        updatedAt: now,
      }).catch((err) => console.error('Error publicando ubicación:', err));
    },
    [companyId, driverId, driverName]
  );

  const stopPublishing = useCallback(() => {
    if (!companyId || !driverId) return;
    const driverRef = ref(database, `companies/${companyId}/drivers/${driverId}`);
    set(driverRef, null); // Limpiar ubicación al salir
  }, [companyId, driverId]);

  return { publishLocation, stopPublishing };
};

/**
 * Para el CONDUCTOR/BACKEND: publicar actualización de estado de orden
 */
export const publishOrderStatusUpdate = (companyId, orderId, status) => {
  if (!companyId || !orderId) return;
  const eventRef = ref(database, `companies/${companyId}/events/orderUpdates/${Date.now()}`);
  set(eventRef, { orderId, status, timestamp: Date.now() }).catch(console.error);
};
