import { ReactNode, Suspense } from "react";
import { Metadata } from "next";
import ChatBotWrapper from "@/components/customer/ChatBotWrapper";

export const metadata: Metadata = {
  title: "Khanut - Customer Dashboard",
  description: "Find and book local services in Ethiopia",
};

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      {children}
      <ChatBotWrapper />
    </Suspense>
  );
}
