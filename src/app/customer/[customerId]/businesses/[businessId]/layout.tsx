import { Metadata } from "next";
import axios from "axios";

// Generate static metadata for the page
export const metadata: Metadata = {
  title: "Business Profile | Khanut",
  description: "View detailed business information, services, and reviews",
};

// Note: We're using static metadata because dynamic metadata requires server components
// and we're using client components for this page. The actual business name will be
// displayed in the UI and in the browser tab via document.title in useEffect

export default function BusinessDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
