import { DefaultSession } from "next-auth";

export type Role = "admin" | "business" | "customer";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    accessToken: string;
    refreshToken: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: Role;
    accessToken: string;
    refreshToken: string;
  }
}
