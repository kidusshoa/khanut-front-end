"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ShoppingBag, Heart, User, Home, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

interface CustomerNavbarProps {
  customerId: string;
  cartCount?: number;
}

export default function CustomerNavbar({ customerId, cartCount = 0 }: CustomerNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const navItems = [
    {
      name: "Home",
      href: `/customer/${customerId}`,
      icon: <Home className="h-5 w-5 md:h-4 md:w-4" />,
    },
    {
      name: "Services",
      href: `/customer/${customerId}/services`,
      icon: <Grid3X3 className="h-5 w-5 md:h-4 md:w-4" />,
    },
    {
      name: "Favorites",
      href: `/customer/${customerId}/favorites`,
      icon: <Heart className="h-5 w-5 md:h-4 md:w-4" />,
    },
    {
      name: "Profile",
      href: `/customer/${customerId}/profile`,
      icon: <User className="h-5 w-5 md:h-4 md:w-4" />,
    },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={`/customer/${customerId}`} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-orange-500 flex items-center justify-center text-white font-bold">
              K
            </div>
            <span className="font-semibold text-lg hidden sm:inline-block">Khanut</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-500"
                    : "text-foreground/60 hover:bg-muted hover:text-foreground"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => window.location.href = `/customer/${customerId}/cart`}
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

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-500"
                      : "text-foreground/60 hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
