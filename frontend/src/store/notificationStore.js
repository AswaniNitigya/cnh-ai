import { create } from 'zustand';
import api from '../lib/api';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  fetchNotifications: async () => {
    try {
      const { data } = await api.get('/push/notifications');
      set({ 
        notifications: data.notifications,
        unreadCount: data.notifications.filter(n => !n.is_read).length
      });
    } catch (err) {
      console.error('Fetch notifications error', err);
    }
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/push/${id}/read`);
      if (id === 'all') {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, is_read: true })),
          unreadCount: 0
        }));
      } else {
        set(state => {
          const newNotifs = state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
          return { notifications: newNotifs, unreadCount: newNotifs.filter(n => !n.is_read).length };
        });
      }
    } catch (err) {
      console.error('Mark read error', err);
    }
  },

  setupPushNotifications: async () => {
    if (!('serviceWorker' in navigator)) return;
    
    // Optional: Only ask if they haven't denied
    if (Notification.permission === 'denied') return;

    try {
      const register = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // We only prompt permission if the user clicks a dedicated "Enable Notifications" button 
      // OR we just ask directly. Let's try to subscribe.
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const { data: { publicKey } } = await api.get('/push/public-key');
      
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      await api.post('/push/subscribe', subscription);
    } catch (err) {
      console.error('Push setup error:', err);
    }
  }
}));

export default useNotificationStore;
