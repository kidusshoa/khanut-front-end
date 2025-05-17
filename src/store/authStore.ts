import { create } from "zustand";
import { persist } from "zustand/middleware";
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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
      partialize: (state) => ({
        tempEmail: state.tempEmail,
        tempRole: state.tempRole,
        // Don't persist sensitive data in localStorage
        // user: state.user,
        // accessToken: state.accessToken,
      }),
    }
  )
);
