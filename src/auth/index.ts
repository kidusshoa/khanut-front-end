import axios from "axios";
import { catchServerActionError } from "@/lib/util";
import { NextAuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { getSession } from "next-auth/react";
import type { AuthResponse } from "@/types/global";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          const { data } = await axios.post<AuthResponse>(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          if (!data.accessToken) {
            throw new Error("Invalid credentials");
          }

          return {
            id: data.userId,
            role: data.role,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
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
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
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
  const session = await getServerSession(authOptions);
  return session;
}

export async function getAccessToken(): Promise<string> {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("No access token available");
  }
  return session.accessToken;
}

export async function getUserProfile() {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }
  return {
    id: session.user.id,
    role: session.user.role,
  };
}
