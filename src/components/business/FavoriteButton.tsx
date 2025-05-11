"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { favoritesApi } from "@/services/favorites";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  businessId: string;
  initialIsFavorite?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  showText?: boolean;
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({
  businessId,
  initialIsFavorite = false,
  size = "md",
  variant = "outline",
  showText = true,
  className,
  onToggle,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if business is in favorites on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const isFav = await favoritesApi.isFavorite(businessId);
        setIsFavorite(isFav);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    if (!initialIsFavorite) {
      checkFavoriteStatus();
    }
  }, [businessId, initialIsFavorite]);

  const toggleFavorite = async () => {
    try {
      setIsLoading(true);

      const result = await favoritesApi.toggleFavorite(businessId);

      if (isFavorite) {
        toast({
          title: "Removed from favorites",
          description: "Business has been removed from your favorites",
          variant: "default",
        });
      } else {
        toast({
          title: "Added to favorites",
          description: "Business has been added to your favorites",
          variant: "default",
        });
      }

      setIsFavorite(!isFavorite);
      if (onToggle) onToggle(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 px-3",
    md: "h-10 px-4",
    lg: "h-12 px-6",
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
        isFavorite && "text-red-500 hover:text-red-600",
        !showText && "px-0 w-10",
        className
      )}
      onClick={toggleFavorite}
      disabled={isLoading}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-colors",
          isFavorite ? "fill-current" : "fill-none"
        )}
      />
      {showText && (
        <span className="ml-2">{isFavorite ? "Favorited" : "Favorite"}</span>
      )}
    </Button>
  );
}
