"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
      router.push("/login");
    } else if (status === "authenticated") {
      // Here you would check if the user has access to this business
      // For now, we'll just set loading to false
      setIsLoading(false);
    }
  }, [status, router, businessId]);

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
        
        <main className={cn(
          "flex-1 pt-16 transition-all duration-300",
          "md:ml-[280px]" // Adjust based on sidebar width
        )}>
          <div className="container mx-auto p-6">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
