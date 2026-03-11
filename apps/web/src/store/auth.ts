import { create } from 'zustand';

type Role = 'DEVELOPER' | 'DEVOPS' | 'ADMIN';

interface AuthState {
  user: null | { id: string; username: string; role: Role };
  isBootstrapping: boolean;
  setUser: (user: AuthState['user']) => void;
  setBootstrapping: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isBootstrapping: true,
  setUser: (user) => set({ user }),
  setBootstrapping: (value) => set({ isBootstrapping: value })
}));
