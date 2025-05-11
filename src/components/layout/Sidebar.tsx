"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Package,
  BarChart,
  Settings,
  Users,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Store,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface SidebarProps {
  businessId: string;
}

export default function Sidebar({ businessId }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: `/business/${businessId}`,
      active:
        pathname === `/business/${businessId}` ||
        pathname === `/business/${businessId}/dashboard`,
    },
    {
      title: "Services",
      icon: <Store className="h-5 w-5" />,
      href: `/business/${businessId}/services`,
      active:
        pathname === `/business/${businessId}/services` ||
        pathname.startsWith(`/business/${businessId}/services/`),
    },
    {
      title: "Appointments",
      icon: <Calendar className="h-5 w-5" />,
      href: `/business/${businessId}/appointments`,
      active:
        pathname === `/business/${businessId}/appointments` ||
        pathname.startsWith(`/business/${businessId}/appointments/`),
    },
    {
      title: "Orders",
      icon: <ShoppingBag className="h-5 w-5" />,
      href: `/business/${businessId}/orders`,
      active:
        pathname === `/business/${businessId}/orders` ||
        pathname.startsWith(`/business/${businessId}/orders/`),
    },
    {
      title: "Products",
      icon: <Package className="h-5 w-5" />,
      href: `/business/${businessId}/products`,
      active:
        pathname === `/business/${businessId}/products` ||
        pathname.startsWith(`/business/${businessId}/products/`),
    },
    {
      title: "Analytics",
      icon: <BarChart className="h-5 w-5" />,
      href: `/business/${businessId}/analytics`,
      active: pathname === `/business/${businessId}/analytics`,
    },
    {
      title: "Customers",
      icon: <Users className="h-5 w-5" />,
      href: `/business/${businessId}/customers`,
      active:
        pathname === `/business/${businessId}/customers` ||
        pathname.startsWith(`/business/${businessId}/customers/`),
    },
    {
      title: "Messages",
      icon: <MessageSquare className="h-5 w-5" />,
      href: `/business/${businessId}/messages`,
      active:
        pathname === `/business/${businessId}/messages` ||
        pathname.startsWith(`/business/${businessId}/messages/`),
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: `/business/${businessId}/settings`,
      active: pathname === `/business/${businessId}/settings`,
    },
  ];

  return (
    <motion.div
      initial={{ width: collapsed ? 80 : 280 }}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 z-30"
    >
      <div className="p-4 flex items-center justify-between border-b border-border">
        <motion.div
          initial={{ opacity: collapsed ? 0 : 1 }}
          animate={{ opacity: collapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className={cn("flex items-center gap-2", collapsed && "hidden")}
        >
          <div className="h-8 w-8 rounded-md bg-orange-500 flex items-center justify-center text-white font-bold">
            K
          </div>
          <span className="font-semibold text-lg">Khanut</span>
        </motion.div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
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
          >
            {item.icon}
            <motion.span
              initial={{
                opacity: collapsed ? 0 : 1,
                display: collapsed ? "none" : "block",
              }}
              animate={{
                opacity: collapsed ? 0 : 1,
                display: collapsed ? "none" : "block",
              }}
              transition={{ duration: 0.2 }}
              className={cn("font-medium", collapsed && "hidden")}
            >
              {item.title}
            </motion.span>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-3 text-muted-foreground hover:text-destructive",
            collapsed && "justify-center"
          )}
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5" />
          <motion.span
            initial={{
              opacity: collapsed ? 0 : 1,
              display: collapsed ? "none" : "block",
            }}
            animate={{
              opacity: collapsed ? 0 : 1,
              display: collapsed ? "none" : "block",
            }}
            transition={{ duration: 0.2 }}
            className={cn("font-medium", collapsed && "hidden")}
          >
            Logout
          </motion.span>
        </Button>
      </div>
    </motion.div>
  );
}
