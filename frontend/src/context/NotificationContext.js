import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(`notifications_${user._id}`);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        // Initial welcome notification
        const welcome = [{
          id: 'welcome',
          title: 'Welcome to SLIIT KADE!',
          body: 'Thanks for joining us. Explore our menu for delicious meals.',
          time: new Date().toISOString(),
          read: false,
          type: 'info'
        }];
        setNotifications(welcome);
        await AsyncStorage.setItem(`notifications_${user._id}`, JSON.stringify(welcome));
      }
    } catch (err) {
      console.log('Error loading notifications:', err);
    }
  };

  const addNotification = async (notif) => {
    try {
      const newNotif = {
        ...notif,
        id: Date.now().toString(),
        time: new Date().toISOString(),
        read: false
      };
      const updated = [newNotif, ...notifications];
      setNotifications(updated);
      await AsyncStorage.setItem(`notifications_${user._id}`, JSON.stringify(updated));
    } catch (err) {
      console.log('Error adding notification:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
      setNotifications(updated);
      await AsyncStorage.setItem(`notifications_${user._id}`, JSON.stringify(updated));
    } catch (err) {
      console.log('Error marking notification read:', err);
    }
  };

  const clearAll = async () => {
    try {
      setNotifications([]);
      await AsyncStorage.setItem(`notifications_${user._id}`, JSON.stringify([]));
    } catch (err) {
      console.log('Error clearing notifications:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, clearAll, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
