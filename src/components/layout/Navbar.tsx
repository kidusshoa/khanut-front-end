"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Search, Moon, Sun, Menu, X, HelpCircle, Info, Mail } from "lucide-react";
import { ConditionalNotificationDropdown } from "@/components/notifications/ConditionalNotificationDropdown";
import { motion, AnimatePresence } from "framer-motion";
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
import Link from "next/link";

interface NavbarProps {
  businessId: string;
  onMobileMenuToggle: () => void;
}

export default function Navbar({
  businessId,
  onMobileMenuToggle,
}: NavbarProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ensure theme component renders only after mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="h-16 border-b border-border bg-card/80 backdrop-blur-md fixed top-0 right-0 left-0 z-20 flex items-center px-4 md:px-6">
      <div className="flex items-center w-full">
        <div className="md:hidden mr-2">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex-1 flex items-center">
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 ml-6">
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center">
              <Info className="h-4 w-4 mr-1" />
              About
            </Link>
            <Link href="/help" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center">
              <HelpCircle className="h-4 w-4 mr-1" />
              Help
            </Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              Contact
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className={`fixed inset-0 z-40 md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-card border-r border-border overflow-y-auto">
              <div className="p-4 flex items-center justify-between border-b border-border">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="p-4 space-y-4">
                <Link 
                  href="/about" 
                  className="flex items-center p-3 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Info className="h-5 w-5 mr-3" />
                  <span>About</span>
                </Link>
                <Link 
                  href="/help" 
                  className="flex items-center p-3 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HelpCircle className="h-5 w-5 mr-3" />
                  <span>Help</span>
                </Link>
                <Link 
                  href="/contact" 
                  className="flex items-center p-3 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Mail className="h-5 w-5 mr-3" />
                  <span>Contact</span>
                </Link>
              </nav>
            </div>
          </div>
          
          <div className="ml-auto">
            <AnimatePresence initial={false}>
              {showSearch ? (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100%" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full max-w-md"
                >
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="w-full pr-8"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowSearch(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hidden md:flex"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSearch(true)}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <ConditionalNotificationDropdown />

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || "User"}
                  />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {session?.user?.name ? getInitials(session.user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/business/${businessId}/profile`}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/business/${businessId}/settings`}>Settings</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
