// src/stores/useAuthStore.ts
import { authService } from "@/services";
import { create } from "zustand";

interface AuthState {
  user: any | null;
  me: any | null;
  listReferral: any | null;
  setListReferral: (listReferral: any) => void;
  setUser: (user: any) => void;
  setMe: (me: any) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  me: null,
  listReferral: null,
  setListReferral: (listReferral) => set({ listReferral }),
  setUser: (user) => set({ user }),
  setMe: (me) => set({ me }),
  clearUser: () => set({ user: null }),
  fetchUser: async () => {
    try {
      const data = await authService.getMe();
      if (data) {
        set({ user: data.user });
        set({ me: data.me });
        set({ listReferral: data.listReferral });
      }
    } catch (e) {
      set({ user: null });
    }
  },
}));
