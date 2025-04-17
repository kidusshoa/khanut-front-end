import { create } from "zustand";

export interface AuthState {
  tempEmail: string | null;
  tempRole: string | null;
  setTempEmail: (email: string | null) => void;
  setTempRole: (role: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  tempEmail: null,
  tempRole: null,
  setTempEmail: (email) => set({ tempEmail: email }),
  setTempRole: (role) => set({ tempRole: role }),
}));
