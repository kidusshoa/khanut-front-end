"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { useTheme } from "next-themes";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  FileBarChart,
  Settings,
  Menu,
  X,
  Search,
  User,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Brain,
  DollarSign,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { AdminNotificationDropdown } from "@/components/admin/AdminNotificationDropdown";

// Wrapper component that uses AuthProvider
export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AuthProvider>
  );
}

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Main layout component
function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, token, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration issues and authentication check
  useEffect(() => {
    setMounted(true);

    // Check if authenticated
    if (!isAuthenticated && !token) {
      router.push("/login");
    }
  }, [isAuthenticated, token, router]);

  const pathParts = pathname.split("/");
  const adminId = pathParts[2] || "defaultAdminId";

  // Get current page name for breadcrumbs
  const getCurrentPageName = () => {
    const path = pathname.split("/");
    if (path.length <= 3) return "Dashboard";
    return path[3].charAt(0).toUpperCase() + path[3].slice(1);
  };

  const navItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: `/admin/${adminId}/`,
    },
    {
      name: "Businesses",
      icon: Building2,
      path: `/admin/${adminId}/businesses/list`,
    },
    { name: "Users", icon: Users, path: `/admin/${adminId}/users` },
    { name: "Reviews", icon: MessageSquare, path: `/admin/${adminId}/reviews` },
    { name: "Revenue", icon: DollarSign, path: `/admin/${adminId}/revenue` },
    { name: "Reports", icon: FileBarChart, path: `/admin/${adminId}/reports` },
    {
      name: "Recommendations",
      icon: Brain,
      path: `/admin/${adminId}/recommendations`,
    },
    { name: "Settings", icon: Settings, path: `/admin/${adminId}/settings` },
  ];

  if (!mounted) {
    return null; // Prevent hydration issues
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-card shadow-lg border-r border-border flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        initial={false}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Khanut Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
              Khanut Admin
            </h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <Input
              placeholder="Search..."
              className="pl-9 bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(({ name, icon: Icon, path }) => {
            const isActive =
              pathname === path || pathname.startsWith(path + "/");
            return (
              <Link
                key={name}
                href={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={(e) => {
                  // Close sidebar on mobile
                  setSidebarOpen(false);

                  // If not authenticated, prevent default navigation and redirect to login
                  if (!isAuthenticated && !token) {
                    e.preventDefault();
                    router.push("/login");
                  }
                }}
              >
                <Icon
                  size={20}
                  className={`${
                    isActive
                      ? "text-orange-500"
                      : "text-gray-500 group-hover:text-gray-700"
                  }`}
                />
                <span
                  className={`font-medium ${isActive ? "font-semibold" : ""}`}
                >
                  {name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute right-0 w-1 h-8 bg-orange-500 rounded-l-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
            <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <User size={18} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Admin User</p>
              <p className="text-xs text-gray-500">admin@khanut.com</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.aside>

      {/* Content with topbar */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100 md:hidden"
              >
                <Menu size={20} />
              </button>

              {/* Breadcrumbs */}
              <nav className="hidden md:flex items-center text-sm">
                <Link
                  href={`/admin/${adminId}/`}
                  className="text-gray-500 hover:text-orange-600"
                  onClick={(e) => {
                    // If not authenticated, prevent default navigation and redirect to login
                    if (!isAuthenticated && !token) {
                      e.preventDefault();
                      router.push("/login");
                    }
                  }}
                >
                  Admin
                </Link>
                <ChevronRight size={16} className="mx-1 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {getCurrentPageName()}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <AdminNotificationDropdown />

              <div className="h-6 w-px bg-border"></div>

              {/* Theme toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="mr-2"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              )}

              <div className="h-6 w-px bg-border"></div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <User size={16} />
                    </div>
                    <span className="hidden md:inline font-medium">Admin</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>

        <footer className="border-t border-border p-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Khanut Admin Panel. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
