// src/stores/useAuthStore.ts
import { create } from "zustand";

interface AuthState {
  user: any | null;
  setUser: (user: any) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  fetchUser: async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: "include",
      });
      if (!res.ok) return set({ user: null });
      const data = await res.json();
      set({ user: data.user });
    } catch (e) {
      set({ user: null });
    }
  },
}));
