"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Store, Star, Trash2, Search, Loader2, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteItem } from "@/services/favorites";
import { toast } from "react-hot-toast";
import { useFavorites } from "@/hooks/useFavorites";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";

interface FavoritesContentProps {
  customerId: string;
}

export default function FavoritesContent({
  customerId,
}: FavoritesContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use our custom favorites hook for state management
  const { 
    favorites, 
    isLoading, 
    isError, 
    removeFavorite,
    isToggling,
    refetch 
  } = useFavorites(customerId);

  // Check authorization
  if (session?.user?.id !== customerId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-2">Unauthorized</h2>
        <p className="text-muted-foreground mb-4">
          You don't have permission to view this page.
        </p>
        <Button onClick={() => router.push("/")} variant="outline">
          Go Home
        </Button>
      </div>
    );
  }

  // Handle removing a favorite
  const handleRemoveFavorite = async (businessId: string) => {
    try {
      await removeFavorite(businessId);
      toast.success("Removed from favorites");
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove from favorites");
    }
  };

  // Filter favorites based on search query
  const filteredFavorites = favorites ? favorites.filter((item: FavoriteItem) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    return (
      (item.name?.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (item.description?.toLowerCase().includes(query))
    );
  }) : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  return (
    <CustomerDashboardLayout>
      <div className="container max-w-screen-xl mx-auto py-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Favorites</h1>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search favorites..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading favorites...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg text-red-500">
                Error loading favorites. Please try again later.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                No favorites yet
              </h2>
              <p className="text-muted-foreground max-w-md">
                You haven't added any businesses to your favorites yet. Browse
                businesses and click the heart icon to add them here.
              </p>
              <Button
                className="mt-6"
                onClick={() => router.push(`/customer/${customerId}`)}
              >
                Browse Businesses
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((item) => (
                <div
                  key={item._id}
                  className="rounded-lg overflow-hidden border border-border bg-card transition-all hover:shadow-md relative"
                >
                  <div className="aspect-video relative overflow-hidden">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.name || 'Business'}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Store className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-700 rounded-full h-8 w-8"
                      onClick={() => handleRemoveFavorite(item._id)}
                      disabled={isToggling}
                    >
                      {isToggling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                    {item.category && (
                      <Badge
                        className="absolute top-2 left-2 capitalize"
                        variant="secondary"
                      >
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium line-clamp-1">
                      {item.name || 'Business'}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {item.description || ''}
                    </p>
                    <div className="flex items-center justify-end mt-2">
                      {item.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="text-sm">
                            {item.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}
