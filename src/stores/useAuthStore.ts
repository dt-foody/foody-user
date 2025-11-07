// src/stores/useAuthStore.ts
import { authService } from "@/services";
import { create } from "zustand";

interface AuthState {
  user: any | null;
  me: any | null;
  setUser: (user: any) => void;
  setMe: (me: any) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  me: null,
  setUser: (user) => set({ user }),
  setMe: (me) => set({ me }),
  clearUser: () => set({ user: null }),
  fetchUser: async () => {
    try {
      const data = await authService.getMe();
      if (data) {
        set({ user: data.user });
        set({ me: data.me });
      }
    } catch (e) {
      set({ user: null });
    }
  },
}));
