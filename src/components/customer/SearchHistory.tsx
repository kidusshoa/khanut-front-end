"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchHistoryProps {
  customerId: string;
  currentQuery?: string;
  onSelectQuery: (query: string) => void;
}

export default function SearchHistory({
  customerId,
  currentQuery,
  onSelectQuery,
}: SearchHistoryProps) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const router = useRouter();

  // Load search history from localStorage on component mount
  useEffect(() => {
    const storedHistory = localStorage.getItem(`search_history_${customerId}`);
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        setSearchHistory(parsedHistory);
      } catch (error) {
        console.error("Error parsing search history:", error);
        setSearchHistory([]);
      }
    }
  }, [customerId]);

  // Add current query to search history if it's not empty and not already in history
  useEffect(() => {
    if (currentQuery && currentQuery.trim() !== "") {
      setSearchHistory((prevHistory) => {
        // Remove the query if it already exists to avoid duplicates
        const filteredHistory = prevHistory.filter((q) => q !== currentQuery);
        
        // Add the new query to the beginning of the array
        const newHistory = [currentQuery, ...filteredHistory].slice(0, 5); // Keep only the 5 most recent searches
        
        // Save to localStorage
        localStorage.setItem(`search_history_${customerId}`, JSON.stringify(newHistory));
        
        return newHistory;
      });
    }
  }, [currentQuery, customerId]);

  // Clear all search history
  const clearHistory = () => {
    localStorage.removeItem(`search_history_${customerId}`);
    setSearchHistory([]);
  };

  // Remove a specific search query from history
  const removeFromHistory = (query: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    const newHistory = searchHistory.filter((q) => q !== query);
    localStorage.setItem(`search_history_${customerId}`, JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  };

  if (searchHistory.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          <span>Recent Searches</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground h-auto py-1"
          onClick={clearHistory}
        >
          Clear All
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {searchHistory.map((query) => (
          <Badge
            key={query}
            variant="outline"
            className="cursor-pointer hover:bg-muted px-3 py-1"
            onClick={() => onSelectQuery(query)}
          >
            {query}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 p-0"
              onClick={(e) => removeFromHistory(query, e)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
