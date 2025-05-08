"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Menu, X } from "lucide-react";

export default function BusinessViewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [businessId, setBusinessId] = useState<string>("");

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setBusinessId(resolvedParams.businessId);
      } catch (error) {
        console.error("Error resolving params:", error);
      }
    };

    resolveParams();
  }, [params]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Khanut</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/")}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => router.push("/login")}>
              Login
            </Button>
            <Button onClick={() => router.push("/register")}>Register</Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t p-4 space-y-3 bg-white dark:bg-gray-950">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                router.push("/");
                setIsMobileMenuOpen(false);
              }}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                router.push("/login");
                setIsMobileMenuOpen(false);
              }}
            >
              Login
            </Button>
            <Button
              className="w-full"
              onClick={() => {
                router.push("/register");
                setIsMobileMenuOpen(false);
              }}
            >
              Register
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Business Details</h1>
            <p className="text-muted-foreground">
              View information about this business
            </p>
          </div>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Khanut. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
