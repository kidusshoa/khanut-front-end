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

interface CustomerDashboardLayoutProps {
  children: React.ReactNode;
  customerId: string;
}

export default function CustomerDashboardLayout({
  children,
  customerId,
}: CustomerDashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Check if we're on a business details page
  const isBusinessPage = pathname.includes("/businesses/");
  const businessId = isBusinessPage ? pathname.split("/").pop() : null;

  // State to store business name
  const [businessName, setBusinessName] = useState<string>("");

  // Fetch business name if on a business page
  useEffect(() => {
    if (isBusinessPage && businessId) {
      const fetchBusinessName = async () => {
        try {
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          console.log("Fetching business name for ID:", businessId);
          console.log("API URL:", `${API_URL}/api/businesses/${businessId}`);

          // Use the API service instead of direct fetch
          const response = await fetch(
            `${API_URL}/api/businesses/${businessId}`
          );

          // If the response is not ok, try the alternative endpoint
          if (!response.ok) {
            console.log("First endpoint failed, trying alternative endpoint");
            const altResponse = await fetch(
              `${API_URL}/api/business/${businessId}`
            );
            if (altResponse.ok) {
              return await altResponse.json();
            }
          }
          const data = await response.json();
          console.log("Business data received:", data);

          if (data && data.name) {
            console.log("Setting business name to:", data.name);
            setBusinessName(data.name);
          } else {
            console.log("No business name found in data");
            setBusinessName("Business Details");
          }
        } catch (error) {
          console.error("Error fetching business name:", error);
          setBusinessName("Business Details");
        }
      };

      fetchBusinessName();
    }
  }, [isBusinessPage, businessId]);

  // Ensure theme component renders only after mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get cart count from local storage
  useEffect(() => {
    const getCartCount = () => {
      const cart = localStorage.getItem("cart");
      if (cart) {
        try {
          const cartItems = JSON.parse(cart);
          setCartCount(cartItems.length);
        } catch (error) {
          console.error("Error parsing cart data:", error);
          setCartCount(0);
        }
      }
    };

    getCartCount();
    window.addEventListener("storage", getCartCount);

    return () => {
      window.removeEventListener("storage", getCartCount);
    };
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.id) {
        try {
          const profile = await userService.getCustomerProfile();
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [session?.user?.id]);

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
      href: `/customer/${customerId}`,
      active: pathname === `/customer/${customerId}`,
    },
    {
      title: "Search",
      icon: <Search className="h-5 w-5" />,
      href: `/customer/${customerId}/search`,
      active:
        pathname === `/customer/${customerId}/search` ||
        pathname.startsWith(`/customer/${customerId}/businesses/`) ||
        pathname.startsWith(`/customer/${customerId}/services/`),
    },
    {
      title: "Browse Services",
      icon: <Grid className="h-5 w-5" />,
      href: `/customer/${customerId}/services`,
      active:
        pathname === `/customer/${customerId}/services` ||
        pathname.startsWith(`/customer/${customerId}/services/`),
    },
    {
      title: "Appointments",
      icon: <Calendar className="h-5 w-5" />,
      href: `/customer/${customerId}/appointments`,
      active:
        pathname === `/customer/${customerId}/appointments` ||
        pathname.startsWith(`/customer/${customerId}/appointments/`),
    },
    {
      title: "Orders",
      icon: <ShoppingBag className="h-5 w-5" />,
      href: `/customer/${customerId}/orders`,
      active:
        pathname === `/customer/${customerId}/orders` ||
        pathname.startsWith(`/customer/${customerId}/orders/`),
    },
    {
      title: "Favorites",
      icon: <Heart className="h-5 w-5" />,
      href: `/customer/${customerId}/favorites`,
      active: pathname === `/customer/${customerId}/favorites`,
    },
    {
      title: "Nearby Services",
      icon: <MapPin className="h-5 w-5" />,
      href: `/customer/${customerId}/nearby`,
      active: pathname === `/customer/${customerId}/nearby`,
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: `/customer/${customerId}/settings`,
      active: pathname === `/customer/${customerId}/settings`,
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
              <span className="font-semibold text-lg">Khanut</span>
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
                  <span className="font-semibold text-lg">Khanut</span>
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
                {isBusinessPage
                  ? businessName || "Business Details"
                  : menuItems.find((item) => item.active)?.title || "Dashboard"}
              </h1>
              {isBusinessPage ? (
                <p className="text-sm text-muted-foreground">
                  Business Profile
                </p>
              ) : (
                (userProfile?.name || session?.user?.name) && (
                  <p className="text-sm text-muted-foreground">
                    Welcome, {userProfile?.name || session?.user?.name}
                  </p>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/customer/${customerId}/search`)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => router.push(`/customer/${customerId}/cart`)}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 text-white"
                  variant="default"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>

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
                        userProfile?.profilePicture ||
                        session?.user?.image ||
                        ""
                      }
                      alt={userProfile?.name || session?.user?.name || "User"}
                    />
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {userProfile?.name
                        ? getInitials(userProfile.name)
                        : session?.user?.name
                        ? getInitials(session.user.name)
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userProfile?.name || session?.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userProfile?.email || session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/customer/${customerId}/settings`}>
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
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
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 pt-16 transition-all duration-300 md:ml-64">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
