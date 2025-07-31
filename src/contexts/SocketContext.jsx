import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

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
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  console.log('🔄 SocketProvider rendered, notifications count:', notifications.length);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server');
      setIsConnected(true);
      
      // Join user's personal room if authenticated
      const token = localStorage.getItem('authToken');
      console.log('🔍 Socket token check:', token ? 'Token exists' : 'No token found');
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload._id || payload.id;
          console.log('🆔 Extracted user ID from token:', userId);
          
          if (userId) {
            newSocket.emit('join', userId);
            console.log(`👤 Joined personal room for user: ${userId}`);
          } else {
            console.warn('⚠️ No user ID found in token payload');
          }
        } catch (error) {
          console.error('💥 Error parsing token:', error);
        }
      } else {
        console.warn('⚠️ No token found, cannot join personal room');
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    // Listen for new notifications
    newSocket.on('newNotification', (notification) => {
      console.log('🔔 Received real-time notification:', notification);
      console.log('📋 Current notifications before adding:', notifications.length);
      
      setNotifications(prev => {
        const updated = [notification, ...prev];
        console.log('📋 Updated notifications count:', updated.length);
        return updated;
      });
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('New Assignment!', {
          body: notification.message,
          icon: '/favicon.ico'
        });
        console.log('🔔 Browser notification shown');
      } else {
        console.log('🔔 Browser notification permission not granted');
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.close();
    };
  }, []);

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    isConnected,
    notifications,
    clearNotification,
    clearAllNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;