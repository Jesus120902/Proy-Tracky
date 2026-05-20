import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * useSocket — Hook de WebSocket con:
 * - Conexión segura con auth JWT
 * - Listeners registrables antes de que el socket conecte (queue)
 * - Throttle para emitir ubicación GPS
 * - Auto-reconexión integrada de socket.io
 */
const useSocket = (companyId) => {
  const socketRef     = useRef(null);
  const listenersRef  = useRef([]); // cola de listeners a registrar al conectar
  const lastEmitTime  = useRef(0);
  const THROTTLE_MS   = 5000;

  useEffect(() => {
    if (!companyId) return;

    // Obtener token JWT de la sesión activa
    let token = null;
    try {
      const session = JSON.parse(localStorage.getItem('userInfo'));
      token = session?.token || null;
    } catch { /* sin sesión */ }

    const socket = io(SOCKET_URL, {
      auth: { token },               // El servidor puede verificar identidad
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('📡 Socket conectado:', socket.id);
      socket.emit('join_company', companyId);

      // Registrar listeners que fueron encolados antes de la conexión
      listenersRef.current.forEach(({ event, cb }) => {
        socket.on(event, cb);
      });
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket error de conexión:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket desconectado:', reason);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [companyId]);

  /**
   * Registrar un listener de forma segura.
   * Si el socket aún no está conectado, lo encola para cuando conecte.
   */
  const on = useCallback((event, callback) => {
    const socket = socketRef.current;

    if (socket && socket.connected) {
      socket.off(event); // Evitar duplicados
      socket.on(event, callback);
    } else {
      // Remover listener previo del mismo evento en la cola
      listenersRef.current = listenersRef.current.filter((l) => l.event !== event);
      listenersRef.current.push({ event, cb: callback });

      // Si el socket existe pero no está conectado aún, también lo registra
      if (socket) {
        socket.off(event);
        socket.on(event, callback);
      }
    }
  }, []);

  /**
   * Desregistrar un listener.
   */
  const off = useCallback((event) => {
    socketRef.current?.off(event);
    listenersRef.current = listenersRef.current.filter((l) => l.event !== event);
  }, []);

  /**
   * Emitir un evento genérico.
   */
  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  /**
   * Emitir ubicación GPS con throttle (máx. 1 vez cada THROTTLE_MS).
   */
  const emitLocation = useCallback((data) => {
    const now = Date.now();
    if (now - lastEmitTime.current >= THROTTLE_MS) {
      socketRef.current?.emit('driver_location_update', data);
      lastEmitTime.current = now;
    }
  }, []);

  return { socket: socketRef, emit, emitLocation, on, off };
};

export default useSocket;
