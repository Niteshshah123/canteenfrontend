import { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => disconnectSocket();
  }, [user]);

  const connectSocket = () => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Order events
    newSocket.on('order:new', (data) => {
      addNotification('New order received!', 'info');
    });

    newSocket.on('order:update', (data) => {
      addNotification(`Order status updated to ${data.newStatus}`, 'info');
    });

    newSocket.on('order:paid', (data) => {
      addNotification('Payment confirmed!', 'success');
    });

    newSocket.on('order:item_update', (data) => {
      addNotification(`${data.itemName} status: ${data.newStatus}`, 'info');
    });

    newSocket.on('order:item_ready', (data) => {
      addNotification(
        `${data.itemName} is ready! ${data.remainingItems} items remaining`,
        'success'
      );
    });

    newSocket.on('order:all_ready', (data) => {
      addNotification('Your order is ready for pickup!', 'success');
    });

    // Product events
    newSocket.on('product:new', (data) => {
      addNotification(`New product: ${data.name}`, 'info');
    });

    newSocket.on('product:update', (data) => {
      addNotification(`Product updated: ${data.name}`, 'info');
    });

    newSocket.on('discount:update', (data) => {
      addNotification(
        `${data.name} now ${data.discountPercent}% off!`,
        'success'
      );
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        clearNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

