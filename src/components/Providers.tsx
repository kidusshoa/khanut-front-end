"use client";

import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/providers/QueryProvider";
import ToastProvider from "@/providers/ToastProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ThemeProvider>
          <TooltipProvider>
            <NotificationProvider>
              {children}
              <ToastProvider />
            </NotificationProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
