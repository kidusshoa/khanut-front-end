"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Star, Trash2, Search, Loader2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import { toast } from "react-hot-toast";
import { favoritesApi, FavoriteItem } from "@/services/favorites";
import { serviceApi } from "@/services/service";
import { useQuery } from "@tanstack/react-query";

interface FavoritesContentProps {
  customerId: string;
}

export default function FavoritesContent({
  customerId,
}: FavoritesContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch favorites using React Query
  const {
    data: favorites,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["favorites", customerId],
    queryFn: () => favoritesApi.getFavorites(customerId),
    enabled: !!session?.user?.id,
  });

  // Check authorization
  if (session?.user?.id !== customerId) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to view this page.
        </p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  const handleRemoveFavorite = async (businessId: string) => {
    try {
      await favoritesApi.toggleFavorite(businessId);
      toast.success("Removed from favorites");
      refetch(); // Refresh the favorites list
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove from favorites");
    }
  };

  const filteredFavorites = favorites?.filter((item: FavoriteItem) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      item.businessId.name.toLowerCase().includes(query) ||
      (item.businessId.category &&
        item.businessId.category.toLowerCase().includes(query)) ||
      item.businessId.description.toLowerCase().includes(query)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is handled client-side, so we just prevent the default form submission
  };

  return (
    <CustomerDashboardLayout customerId={customerId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
          <p className="text-muted-foreground">
            Your saved services and businesses
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </form>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <h3 className="text-lg font-medium mb-1 text-red-600">
              Error loading favorites
            </h3>
            <p className="text-red-500 mb-4">
              There was a problem loading your favorites. Please try again.
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Favorites List */}
        {!isLoading && !isError && (
          <>
            {filteredFavorites && filteredFavorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredFavorites.map((item: FavoriteItem) => (
                  <div
                    key={item._id}
                    className="rounded-lg overflow-hidden border border-border bg-card transition-all hover:shadow-md"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      {item.businessId.coverImage ? (
                        <img
                          src={item.businessId.coverImage}
                          alt={item.businessId.name}
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
                        onClick={() =>
                          handleRemoveFavorite(item.businessId._id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {item.businessId.category && (
                        <Badge
                          className="absolute top-2 left-2 capitalize"
                          variant="secondary"
                        >
                          {item.businessId.category}
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium line-clamp-1">
                        {item.businessId.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {item.businessId.description}
                      </p>
                      <div className="flex items-center justify-end mt-2">
                        {item.businessId.rating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                            <span className="text-sm">
                              {item.businessId.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">No favorites yet</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? `No favorites matching "${searchQuery}".`
                    : "You haven't added any businesses to your favorites yet."}
                </p>
                <Button
                  onClick={() =>
                    router.push(`/customer/${customerId}/services`)
                  }
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Browse Services
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </CustomerDashboardLayout>
  );
}
