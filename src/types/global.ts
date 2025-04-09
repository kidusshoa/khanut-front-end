import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
    accessToken: string;
    refreshToken: string;
  }

  interface User {
    id: string;
    role: Role;
    accessToken: string;
    refreshToken: string;
  }
}

export type Role = "admin" | "business" | "customer";

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  role: Role;
  userId: string;
};

export type ApiError = {
  message: string;
  status: number;
};
