"use client";

import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/providers/QueryProvider";
import ToastProvider from "@/providers/ToastProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
