import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('cnh_token') || null,
  isLoading: false,
  error: null,

  // Initialize - check stored token
  init: async () => {
    const token = localStorage.getItem('cnh_token');
    if (!token) return;

    try {
      set({ isLoading: true });
      const { data } = await api.get('/auth/me');
      set({ user: data.user, token, isLoading: false });
    } catch (err) {
      localStorage.removeItem('cnh_token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  // Login
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('cnh_token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.error || 'Login failed.',
        isLoading: false,
      });
      return false;
    }
  },

  // Register
  register: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const { data, status } = await api.post('/auth/register', userData);
      
      if (status === 202) {
        set({ isLoading: false });
        // Return a special pending state to the UI
        return { pending: true };
      }

      localStorage.setItem('cnh_token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return { success: true };
    } catch (err) {
      set({
        error: err.response?.data?.error || 'Registration failed.',
        isLoading: false,
      });
      return { success: false };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('cnh_token');
    set({ user: null, token: null, error: null });
  },

  // Check role
  hasRole: (...roles) => {
    const user = get().user;
    return user && roles.includes(user.role);
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
