"use client";

import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-4 px-6 border-t border-border mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="text-sm text-muted-foreground">
          © {currentYear} Khanut. All rights reserved.
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Made with</span>
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          <span>in Ethiopia</span>
        </div>
      </div>
    </footer>
  );
}
