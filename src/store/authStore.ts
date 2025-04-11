import { create } from "zustand";

interface AuthState {
  user: any;
  tempEmail: string | null;
  tempRole: string | null;
  accessToken: string | null;
  setUser: (user: any) => void;
  setTempEmail: (email: string) => void;
  setTempRole: (role: string) => void;
  setAccessToken: (token: string) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tempEmail: null,
  tempRole: null,
  accessToken: null,
  setUser: (user) => set({ user }),
  setTempEmail: (email) => set({ tempEmail: email }),
  setTempRole: (role) => set({ tempRole: role }),
  setAccessToken: (token) => set({ accessToken: token }),
  reset: () =>
    set({ user: null, tempEmail: null, tempRole: null, accessToken: null }),
}));
