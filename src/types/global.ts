import { DefaultSession } from "next-auth";

export type Role = "admin" | "business" | "customer";

// Base interface for authentication-related data
export interface AuthUserData {
  id: string;
  role: Role;
  tempEmail?: string | null;
  tempRole?: Role | null;
}

// API Response type
export interface AuthResponse extends AuthUserData {
  accessToken: string;
  refreshToken: string;
  userId: string;
  name?: string;
}

// Extend the built-in Session type
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: AuthUserData & DefaultSession["user"];
    accessToken: string;
    refreshToken: string;
  }

  // Extend the built-in User type
  interface User extends AuthUserData {
    accessToken: string;
    refreshToken: string;
  }
}

export interface ApiError {
  message: string;
  status: number;
}
