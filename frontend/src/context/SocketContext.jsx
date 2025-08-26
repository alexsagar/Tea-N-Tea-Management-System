import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(API_BASE, {
        transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
        setSocket(newSocket);
        
        // Join user-specific room by MongoDB _id
        newSocket.emit('join-room', `user-${user._id}`);
      });

      newSocket.on('connect_error', (error) => {
        console.warn('Socket connection failed:', error.message);
        // Don't set socket to null, keep trying to reconnect
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          newSocket.connect();
        }
      });

      // Handler functions to allow cleanup on unmount
      const handleNewOrder = (order) => {
        addNotification({
          type: 'info',
          message: `New order received: ${order.orderNumber}`,
          data: order
        });
      };

      const handleOrderStatusUpdate = (order) => {
        addNotification({
          type: 'success',
          message: `Order ${order.orderNumber} status updated to ${order.status}`,
          data: order
        });
      };

      const handleLowStockAlert = (alert) => {
        addNotification({
          type: 'warning',
          message: `Low stock alert: ${alert.item} (${alert.currentStock}/${alert.minStock})`,
          data: alert
        });
      };

      newSocket.on('new-order', handleNewOrder);
      newSocket.on('order-status-update', handleOrderStatusUpdate);
      newSocket.on('low-stock-alert', handleLowStockAlert);

      return () => {
        newSocket.off('new-order', handleNewOrder);
        newSocket.off('order-status-update', handleOrderStatusUpdate);
        newSocket.off('low-stock-alert', handleLowStockAlert);
        newSocket.off('connect');
        newSocket.off('connect_error');
        newSocket.off('disconnect');
        newSocket.close();
      };
    }
  }, [user]);

  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = { ...notification, id, timestamp: new Date() };
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const value = {
    socket,
    notifications,
    addNotification,
    removeNotification
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
