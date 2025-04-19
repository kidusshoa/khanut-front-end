"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface SearchBarProps {
  initialValue?: string;
  placeholder?: string;
  className?: string;
  customerId?: string;
}

export default function SearchBar({
  initialValue = "",
  placeholder = "Search for services, businesses...",
  className = "",
  customerId,
}: SearchBarProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialValue);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      if (customerId) {
        // Use customer-based search route if customerId is provided
        router.push(
          `/customer/${customerId}/search?q=${encodeURIComponent(search)}`
        );
      } else {
        // Fall back to general search route
        router.push(`/search?query=${encodeURIComponent(search)}`);
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10 pr-20 py-6 rounded-lg border-muted bg-background"
      />
      <Button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-orange-600 hover:bg-orange-700"
      >
        Search
      </Button>
    </form>
  );
}
