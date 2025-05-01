"use client";

import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/providers/QueryProvider";
import ToastProvider from "@/providers/ToastProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NotificationProvider>
            {children}
            <ToastProvider />
          </NotificationProvider>
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
