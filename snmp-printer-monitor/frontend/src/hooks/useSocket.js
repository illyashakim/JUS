import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = (url = 'http://localhost:5000') => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
    });

    setSocket(socketRef.current);

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url]);

  const emit = (event, data) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket,
    connected,
    emit,
    on,
    off
  };
};