import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const useSocket = (companyId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!companyId) return;

    // Conectar al servidor de WebSockets
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('📡 Conectado al servidor de tiempo real');
      // Unirse a la sala de la empresa inmediatamente
      socketRef.current.emit('join_company', companyId);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [companyId]);

  const lastEmitTime = useRef(0);
  const THROTTLE_MS = 5000; // Emitir máximo cada 5 segundos

  const emitLocation = (data) => {
    const now = Date.now();
    if (now - lastEmitTime.current >= THROTTLE_MS) {
      if (socketRef.current) {
        socketRef.current.emit('driver_location_update', data);
        lastEmitTime.current = now;
      }
    }
  };

  const emit = useCallback((event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      // Quitar listener previo del mismo evento antes de agregar uno nuevo
      socketRef.current.off(event);
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  }, []);

  return { socket: socketRef.current, emit, emitLocation, on, off };
};

export default useSocket;
