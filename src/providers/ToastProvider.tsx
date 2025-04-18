"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
        success: {
          style: {
            border: "1px solid hsl(var(--accent-main))",
          },
          iconTheme: {
            primary: "hsl(var(--accent-main))",
            secondary: "white",
          },
        },
        error: {
          style: {
            border: "1px solid hsl(var(--destructive))",
          },
          iconTheme: {
            primary: "hsl(var(--destructive))",
            secondary: "white",
          },
        },
      }}
    />
  );
}
