import { create } from 'zustand';
export const useAuthStore = create((set) => ({
    user: null,
    isBootstrapping: true,
    setUser: (user) => set({ user }),
    setBootstrapping: (value) => set({ isBootstrapping: value })
}));
