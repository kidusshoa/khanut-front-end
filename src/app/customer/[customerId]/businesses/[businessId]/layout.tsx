import { Metadata } from "next";
import axios from "axios";

// Generate static metadata for the page
export const metadata: Metadata = {
  title: "Business Profile | Khanut",
  description: "View detailed business information, services, and reviews",
};

// We're using static metadata instead of dynamic metadata to avoid the params issue
// The actual business name will be set client-side

export default function BusinessDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
