"use client";

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return <body className="font-sans antialiased">{children}</body>;
}
