"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  role: string | null;
  userId: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  role: null,
  userId: null,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for authentication on component mount
    const storedToken = Cookies.get("client-token");
    const storedRole = Cookies.get("user-role");
    const storedUserId = Cookies.get("user-id");

    if (storedToken) {
      setIsAuthenticated(true);
      setToken(storedToken);
      setRole(storedRole || null);
      setUserId(storedUserId || null);
    } else {
      setIsAuthenticated(false);
      setToken(null);
      setRole(null);
      setUserId(null);
    }
    
    setIsLoading(false);
  }, []);

  const logout = () => {
    Cookies.remove("client-token");
    Cookies.remove("user-role");
    Cookies.remove("user-id");
    setIsAuthenticated(false);
    setToken(null);
    setRole(null);
    setUserId(null);
    router.push("/login");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        role,
        userId,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
