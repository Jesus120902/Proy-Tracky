import { useEffect, useRef } from 'react';
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

  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  };

  return { socket: socketRef.current, emit, on, off };
};

export default useSocket;
