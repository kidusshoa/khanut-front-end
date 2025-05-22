"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";

interface FavoriteButtonProps {
  businessId: string | { _id: string };
  customerId?: string;
  initialIsFavorite?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  showText?: boolean;
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
}

const sizeClasses = {
  sm: "h-8 min-w-8",
  md: "h-10 min-w-10",
  lg: "h-12 min-w-12",
};

export function FavoriteButton({
  businessId,
  customerId,
  initialIsFavorite = false,
  size = "md",
  variant = "outline",
  showText = true,
  className,
  onToggle,
}: FavoriteButtonProps) {
  // Extract the business ID string
  const id = typeof businessId === 'string' ? businessId : businessId._id;
  
  // Use our custom hook for favorites management
  const { isFavorite, addFavorite, removeFavorite, isToggling } = useFavorites(customerId);
  
  // Check if this business is favorited
  const isFav = isFavorite(id) || initialIsFavorite;
  
  // Toast hook for notifications
  const { toast } = useToast();

  const toggleFavorite = async () => {
    try {
      // Clean the ID to ensure it's a valid MongoDB ObjectId
      const cleanId = id.replace(/[^a-f0-9]/gi, '').substring(0, 24);
      
      // Add debugging info
      console.log("Business ID:", id);
      console.log("Clean business ID for API call:", cleanId);
      console.log("Customer ID:", customerId);
      console.log("Current favorite status:", isFav);
      
      // Toggle the favorite status
      if (isFav) {
        removeFavorite(cleanId);
        toast({
          title: "Removed from favorites",
          description: "Business has been removed from your favorites",
          variant: "default",
        });
      } else {
        addFavorite(cleanId);
        toast({
          title: "Added to favorites",
          description: "Business has been added to your favorites",
          variant: "default",
        });
      }
      
      // Call the onToggle callback if provided
      if (onToggle) onToggle(!isFav);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <Button
      variant={variant}
      size={size === "lg" ? "lg" : "default"}
      className={cn(
        sizeClasses[size],
        isFav && "text-red-500 hover:text-red-600",
        !showText && "px-0 w-10",
        className
      )}
      onClick={toggleFavorite}
      disabled={isToggling}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-colors",
          isFav ? "fill-current" : "fill-none"
        )}
      />
      {showText && (
        <span className="ml-2">{isFav ? "Favorited" : "Favorite"}</span>
      )}
    </Button>
  );
}
