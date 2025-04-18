"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
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
  Bell
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
import { Badge } from "@/components/ui/badge";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const navItems = [
    {
      name: "Home",
      href: "/",
      active: pathname === "/",
    },
    {
      name: "Services",
      href: "/services",
      active: pathname === "/services" || pathname.startsWith("/services/"),
    },
    {
      name: "Businesses",
      href: "/businesses",
      active: pathname === "/businesses" || pathname.startsWith("/businesses/"),
    },
    {
      name: "About",
      href: "/about",
      active: pathname === "/about",
    },
    {
      name: "Contact",
      href: "/contact",
      active: pathname === "/contact",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-orange-500 flex items-center justify-center text-white font-bold">
              K
            </div>
            <span className="font-semibold text-lg hidden sm:inline-block">Khanut</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground/80",
                  item.active ? "text-foreground" : "text-foreground/60"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/60 hover:text-foreground"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/60 hover:text-foreground relative"
              onClick={() => router.push("/cart")}
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
                className="text-foreground/60 hover:text-foreground"
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
            {status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session?.user?.image || ""}
                        alt={session?.user?.name || "User"}
                      />
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {session?.user?.name
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
                        {session?.user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/appointments" className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Appointments</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favorites</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground/60 hover:text-foreground"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-background z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-orange-500 flex items-center justify-center text-white font-bold">
                      K
                    </div>
                    <span className="font-semibold text-lg">Khanut</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                  <nav className="flex flex-col gap-1 px-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          item.active
                            ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-500"
                            : "text-foreground/60 hover:bg-muted hover:text-foreground"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  {status === "authenticated" && (
                    <>
                      <div className="border-t border-border my-4" />
                      <div className="px-4 py-2 text-sm font-medium text-foreground/60">
                        Account
                      </div>
                      <nav className="flex flex-col gap-1 px-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-foreground/60 hover:bg-muted hover:text-foreground"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          href="/appointments"
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-foreground/60 hover:bg-muted hover:text-foreground"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Calendar className="h-4 w-4" />
                          Appointments
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-foreground/60 hover:bg-muted hover:text-foreground"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Orders
                        </Link>
                        <Link
                          href="/favorites"
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-foreground/60 hover:bg-muted hover:text-foreground"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4" />
                          Favorites
                        </Link>
                      </nav>
                    </>
                  )}
                </div>
                <div className="p-4 border-t border-border">
                  {status === "authenticated" ? (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          router.push("/register");
                          setIsMenuOpen(false);
                        }}
                      >
                        Sign Up
                      </Button>
                      <Button
                        variant="default"
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                        onClick={() => {
                          router.push("/login");
                          setIsMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-0 left-0 right-0 bg-background p-4 border-b border-border z-50"
            >
              <form onSubmit={handleSearch} className="container mx-auto flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Search for services, businesses..."
                  className="flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-md bg-orange-500 flex items-center justify-center text-white font-bold">
                  K
                </div>
                <span className="font-semibold text-lg">Khanut</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Connecting customers with local services and businesses in Ethiopia.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-lg mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/services?type=appointment" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Appointments
                  </Link>
                </li>
                <li>
                  <Link href="/services?type=product" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/services?type=in_person" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    In-Person Services
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Categories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Khanut. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-4 md:mt-0">
              Made with ❤️ in Ethiopia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
