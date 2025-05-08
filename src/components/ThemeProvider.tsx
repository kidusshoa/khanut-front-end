"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Define our own props type
type CustomThemeProviderProps = {
  children: React.ReactNode;
  // Add any other props you need
};

export function ThemeProvider({ children }: CustomThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration issues by rendering a simple div until client-side
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
