"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  Calendar,
  User,
  LogOut,
  Heart,
  Moon,
  Sun,
  Bell,
  Home,
  Grid,
  Settings,
  Clock,
  MapPin,
  CreditCard,
  BarChart,
  Users,
  Package,
  MessageSquare,
  Briefcase,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { authService } from "@/services/auth";
import { userService } from "@/services/user";
import { Badge } from "@/components/ui/badge";

interface BusinessDashboardLayoutProps {
  children: React.ReactNode;
  businessId?: string;
}

export default function BusinessDashboardLayout({
  children,
  businessId,
}: BusinessDashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<any>(null);

  // Get businessId from session if not provided
  const currentBusinessId = businessId || (session?.user as any)?.businessId;

  // Ensure theme component renders only after mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch business profile
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (currentBusinessId) {
        try {
          // Replace with your actual API call to get business profile
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          const response = await fetch(
            `${API_URL}/api/businesses/${currentBusinessId}`
          );
          if (response.ok) {
            const data = await response.json();
            setBusinessProfile(data);
          }
        } catch (error) {
          console.error("Error fetching business profile:", error);
        }
      }
    };

    fetchBusinessProfile();
  }, [currentBusinessId]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      href: `/business/${currentBusinessId}`,
      active: pathname === `/business/${currentBusinessId}`,
    },
    {
      title: "Services",
      icon: <Briefcase className="h-5 w-5" />,
      href: `/business/${currentBusinessId}/services`,
      active: pathname.startsWith(`/business/${currentBusinessId}/services`),
    },
    {
      title: "Products",
      icon: <Package className="h-5 w-5" />,
      href: `/business/${currentBusinessId}/products`,
      active: pathname.startsWith(`/business/${currentBusinessId}/products`),
    },
    {
      title: "Appointments",
      icon: <Calendar className="h-5 w-5" />,
      href: `/business/${currentBusinessId}/appointments`,
      active: pathname.startsWith(
        `/business/${currentBusinessId}/appointments`
      ),
    },
    {
      title: "Orders",
      icon: <ShoppingBag className="h-5 w-5" />,
      href: `/business/${currentBusinessId}/orders`,
      active: pathname.startsWith(`/business/${currentBusinessId}/orders`),
    },
    {
      title: "Transactions",
      icon: <CreditCard className="h-5 w-5" />,
      href: `/business/${currentBusinessId}/transactions`,
      active: pathname === `/business/${currentBusinessId}/transactions`,
    },
    {
      title: "Customers",
      icon: <Users className="h-5 w-5" />,
      href: `/business/${currentBusinessId}/customers`,
      active: pathname.startsWith(`/business/${currentBusinessId}/customers`),
    },
    {
      title: "Analytics",
      icon: <BarChart className="h-5 w-5" />,
      href: `/business/${currentBusinessId}/analytics`,
      active: pathname === `/business/${currentBusinessId}/analytics`,
    },
    {
      title: "Messages",
      icon: <MessageSquare className="h-5 w-5" />,
      href: `/business/${currentBusinessId}/messages`,
      active: pathname === `/business/${currentBusinessId}/messages`,
    },
    {
      title: "Profile",
      icon: <Store className="h-5 w-5" />,
      href: `/business/${currentBusinessId}/profile`,
      active: pathname.startsWith(`/business/${currentBusinessId}/profile`),
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: `/business/${currentBusinessId}/settings`,
      active: pathname === `/business/${currentBusinessId}/settings`,
    },
  ];

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <div className="h-screen w-64 bg-card border-r border-border flex flex-col fixed left-0 top-0 z-30">
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-orange-500 flex items-center justify-center text-white font-bold">
                K
              </div>
              <span className="font-semibold text-lg">Khanut Business</span>
            </div>
          </div>

          <div className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 mx-2 rounded-md transition-colors",
                  item.active
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-500"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-border mt-auto">
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 text-muted-foreground hover:text-destructive"
              onClick={async () => {
                try {
                  // Call the logout API
                  if (session?.refreshToken) {
                    await authService.logout(session.refreshToken);
                  }
                  // Then sign out from NextAuth
                  await signOut({ callbackUrl: "/login" });
                } catch (error) {
                  console.error("Logout error:", error);
                  // If API call fails, still try to sign out from NextAuth
                  await signOut({ callbackUrl: "/login" });
                }
              }}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
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
              className="fixed top-0 left-0 bottom-0 w-64 bg-card z-50 md:hidden"
            >
              <div className="p-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-orange-500 flex items-center justify-center text-white font-bold">
                    K
                  </div>
                  <span className="font-semibold text-lg">Khanut Business</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 mx-2 rounded-md transition-colors",
                      item.active
                        ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-500"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="font-medium">{item.title}</span>
                  </Link>
                ))}
              </div>

              <div className="p-4 border-t border-border mt-auto">
                <Button
                  variant="ghost"
                  className="w-full flex items-center gap-3 text-muted-foreground hover:text-destructive"
                  onClick={async () => {
                    try {
                      // Call the logout API
                      if (session?.refreshToken) {
                        await authService.logout(session.refreshToken);
                      }
                      // Then sign out from NextAuth
                      await signOut({ callbackUrl: "/login" });
                    } catch (error) {
                      console.error("Logout error:", error);
                      // If API call fails, still try to sign out from NextAuth
                      await signOut({ callbackUrl: "/login" });
                    }
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md fixed top-0 right-0 left-0 z-20 flex items-center px-4 md:px-6 md:left-64">
          <div className="md:hidden mr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 flex items-center">
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold">
                {menuItems.find((item) => item.active)?.title || "Dashboard"}
              </h1>
              {(businessProfile?.name ||
                (session?.user as any)?.businessName) && (
                <p className="text-sm text-muted-foreground">
                  {businessProfile?.name ||
                    (session?.user as any)?.businessName}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        businessProfile?.profilePicture ||
                        session?.user?.image ||
                        ""
                      }
                      alt={
                        businessProfile?.name ||
                        session?.user?.name ||
                        "Business"
                      }
                    />
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {businessProfile?.name
                        ? getInitials(businessProfile.name)
                        : session?.user?.name
                        ? getInitials(session.user.name)
                        : "B"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {businessProfile?.name || session?.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {businessProfile?.email || session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/business/${currentBusinessId}/profile`}>
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/business/${currentBusinessId}/settings`}>
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={async () => {
                    try {
                      if (session?.refreshToken) {
                        await authService.logout(session.refreshToken);
                      }
                      await signOut({ callbackUrl: "/login" });
                    } catch (error) {
                      console.error("Logout error:", error);
                      await signOut({ callbackUrl: "/login" });
                    }
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pt-16 md:pl-64 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
