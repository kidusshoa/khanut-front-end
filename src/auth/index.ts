import axios from "axios";
import { NextAuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { getSession } from "next-auth/react";
import type { AuthResponse, Role } from "@/types/global";

// Extend JWT type to match our auth data structure
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    accessToken: string;
    refreshToken: string;
    tempEmail?: string | null;
    tempRole?: Role | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          const { data } = await axios.post<AuthResponse>(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          if (!data.accessToken) {
            throw new Error("Invalid credentials");
          }

          // Convert AuthResponse to User
          const user: User = {
            id: data.userId,
            email: credentials.email,
            name: data.name || credentials.email,
            role: data.role,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            tempEmail: data.tempEmail,
            tempRole: data.tempRole,
          };

          return user;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(
              error.response?.data?.message || "Authentication failed"
            );
          }
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Update token with user data
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.tempEmail = user.tempEmail;
        token.tempRole = user.tempRole;
      }
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          tempEmail: token.tempEmail,
          tempRole: token.tempRole,
        },
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      };
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}

export async function getAccessToken(): Promise<string> {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("No access token available");
  }
  return session.accessToken;
}
