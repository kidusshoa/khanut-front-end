import { create } from "zustand";
import type { Role, AuthUserData } from "@/types/global";

interface AuthStore {
  tempEmail: string | null;
  tempRole: Role | null;
  user: AuthUserData | null;
  accessToken: string | null;
  setTempEmail: (email: string) => void;
  setTempRole: (role: Role) => void;
  setUser: (user: AuthUserData) => void;
  setAccessToken: (token: string) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  tempEmail: null,
  tempRole: null,
  user: null,
  accessToken: null,
  setTempEmail: (email) => set({ tempEmail: email }),
  setTempRole: (role) => set({ tempRole: role }),
  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  reset: () =>
    set({ tempEmail: null, tempRole: null, user: null, accessToken: null }),
}));
