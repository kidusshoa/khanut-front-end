"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  businessId: string;
}

export default function DashboardLayout({
  children,
  businessId,
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has access to this business
    if (status === "unauthenticated") {
      console.log("User is unauthenticated, redirecting to login");
      router.push("/login");
      return;
    } else if (status === "authenticated") {
      const checkBusinessStatus = async () => {
        try {
          // Try to get token from session first
          const accessToken =
            session?.accessToken ||
            localStorage.getItem("accessToken") ||
            Cookies.get("client-token");

          if (!accessToken) {
            console.error("No access token found");
            router.push("/login");
            return;
          }

          // Store token in both places to ensure consistency and prevent logout on refresh
          localStorage.setItem("accessToken", accessToken);

          // Set cookies with longer expiration (30 days)
          if (!Cookies.get("client-token")) {
            Cookies.set("client-token", accessToken, { expires: 30 });
          }

          // Also set user role and ID cookies if they don't exist
          if (!Cookies.get("user-role") && session?.user?.role) {
            Cookies.set("user-role", session.user.role, { expires: 30 });
          }

          if (!Cookies.get("user-id") && session?.user?.id) {
            Cookies.set("user-id", session.user.id, { expires: 30 });
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/business/status`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!response.ok) {
            if (response.status === 401) {
              console.error("Unauthorized access, redirecting to login");
              router.push("/login");
              return;
            }
            throw new Error("Failed to check business status");
          }

          const data = await response.json();
          console.log("Dashboard business status check:", data);

          // Check if the business is approved
          if (data.status !== "approved" || !data.approved) {
            // If not approved, redirect to pending page
            console.log("Business not approved, redirecting to pending page");
            router.push(`/business/${businessId}/pending`);
            return;
          }

          // If approved, continue loading the dashboard
          setIsLoading(false);
        } catch (error) {
          console.error("Error checking business status:", error);
          setIsLoading(false);
        }
      };

      checkBusinessStatus();
    }
  }, [status, router, businessId, session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar businessId={businessId} />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed top-0 left-0 bottom-0 z-50 md:hidden"
            >
              <Sidebar businessId={businessId} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar
          businessId={businessId}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main
          className={cn(
            "flex-1 pt-16 transition-all duration-300",
            "md:ml-[280px]" // Adjust based on sidebar width
          )}
        >
          <div className="container mx-auto p-6">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
