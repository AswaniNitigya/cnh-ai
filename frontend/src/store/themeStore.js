import { create } from 'zustand';

const useThemeStore = create((set) => ({
  theme: localStorage.getItem('cnh_theme') || 'light',

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('cnh_theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    });
  },

  initTheme: () => {
    const savedTheme = localStorage.getItem('cnh_theme') || 'light';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    set({ theme: savedTheme });
  },
}));

export default useThemeStore;
