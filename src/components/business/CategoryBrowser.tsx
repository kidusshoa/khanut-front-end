"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Coffee,
  Store,
  Laptop,
  Shirt,
  Book,
  Car,
  Heart,
  Scissors,
  Home,
  Briefcase,
  ShoppingCart,
  Tag,
  LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

interface CategoryBrowserProps {
  customerId: string;
  onCategorySelect?: (category: string) => void;
  className?: string;
}

export function CategoryBrowser({
  customerId,
  onCategorySelect,
  className,
}: CategoryBrowserProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories: Category[] = [
    {
      id: "restaurant",
      name: "Restaurant",
      icon: Utensils,
      color: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    },
    {
      id: "cafe",
      name: "Cafe",
      icon: Coffee,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    },
    {
      id: "retail",
      name: "Retail",
      icon: Store,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      id: "electronics",
      name: "Electronics",
      icon: Laptop,
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    },
    {
      id: "clothing",
      name: "Clothing",
      icon: Shirt,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    },
    {
      id: "books",
      name: "Books",
      icon: Book,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    },
    {
      id: "automotive",
      name: "Automotive",
      icon: Car,
      color: "bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400",
    },
    {
      id: "health",
      name: "Health",
      icon: Heart,
      color: "bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
    },
    {
      id: "beauty",
      name: "Beauty",
      icon: Scissors,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
    },
    {
      id: "home",
      name: "Home",
      icon: Home,
      color: "bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
    },
    {
      id: "professional",
      name: "Professional",
      icon: Briefcase,
      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400",
    },
    {
      id: "shopping",
      name: "Shopping",
      icon: ShoppingCart,
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    },
  ];

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category.id);
    
    if (onCategorySelect) {
      onCategorySelect(category.name);
    } else {
      // Navigate to search page with category filter
      router.push(`/customer/${customerId}/search?category=${encodeURIComponent(category.name)}`);
    }
  };

  return (
    <Card className={cn("border shadow-sm", className)}>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Browse by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              className={cn(
                "h-auto flex flex-col items-center justify-center py-4 px-2 gap-2 hover:bg-muted",
                selectedCategory === category.id && "border-2 border-primary"
              )}
              onClick={() => handleCategoryClick(category)}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  category.color
                )}
              >
                <category.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-center">
                {category.name}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
