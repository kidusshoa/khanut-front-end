"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FavoriteButton } from "@/components/business/FavoriteButton";
import { favoritesApi } from "@/services/favorites";
import { toast } from "react-hot-toast";

export default function TestFavoritePage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testBusinessId, setTestBusinessId] = useState("");

  // Fetch favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      if (status === "authenticated") {
        try {
          setIsLoading(true);
          const data = await favoritesApi.getFavorites();
          setFavorites(data);
          
          // Set a test business ID if we have favorites
          if (data && data.length > 0) {
            setTestBusinessId(data[0].businessId._id);
          }
        } catch (error) {
          console.error("Error fetching favorites:", error);
          toast.error("Failed to fetch favorites");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchFavorites();
  }, [status]);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const data = await favoritesApi.getFavorites();
      setFavorites(data);
      toast.success("Favorites refreshed");
    } catch (error) {
      console.error("Error refreshing favorites:", error);
      toast.error("Failed to refresh favorites");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Loading...</h1>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Please sign in to test favorites</h1>
        <Button onClick={() => window.location.href = "/api/auth/signin"}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Test Favorite Functionality</h1>
      
      <div className="mb-6">
        <Button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh Favorites"}
        </Button>
      </div>
      
      {testBusinessId && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Favorite Button</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Business ID: {testBusinessId}</p>
              <FavoriteButton 
                businessId={testBusinessId}
                showText={true}
                variant="outline"
                size="md"
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Your Favorites ({favorites.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading favorites...</p>
          ) : favorites.length > 0 ? (
            <ul className="space-y-2">
              {favorites.map((fav) => (
                <li key={fav._id} className="p-2 border rounded">
                  <p><strong>Business:</strong> {fav.businessId.name}</p>
                  <p><strong>ID:</strong> {fav.businessId._id}</p>
                  <div className="mt-2">
                    <FavoriteButton 
                      businessId={fav.businessId._id}
                      initialIsFavorite={true}
                      showText={true}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No favorites found. Add some businesses to your favorites!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
