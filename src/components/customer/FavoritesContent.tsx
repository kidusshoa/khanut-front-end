"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Star, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import { toast } from "react-hot-toast";

interface FavoriteItem {
  id: number;
  name: string;
  type: string;
  businessName: string;
  price: number;
  rating: number;
  image: string;
}

interface FavoritesContentProps {
  customerId: string;
}

export default function FavoritesContent({ customerId }: FavoritesContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock favorites data - replace with actual API call
  const [favorites, setFavorites] = useState<FavoriteItem[]>([
    {
      id: 1,
      name: "Delicious Eats",
      type: "restaurant",
      businessName: "Tasty Foods Inc.",
      price: 250,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    {
      id: 2,
      name: "Haircut & Styling",
      type: "salon",
      businessName: "Chic Salon",
      price: 500,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    },
    {
      id: 3,
      name: "Deep Tissue Massage",
      type: "spa",
      businessName: "Relaxation Spa",
      price: 800,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    {
      id: 4,
      name: "Handcrafted Leather Wallet",
      type: "product",
      businessName: "Artisan Goods",
      price: 450,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    },
  ]);

  // Check if user is authorized
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

  const handleRemoveFavorite = (id: number) => {
    setFavorites(favorites.filter(item => item.id !== id));
    toast.success("Removed from favorites");
  };

  const filteredFavorites = favorites.filter(item => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.businessName.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Favorites List */}
        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFavorites.map((item) => (
              <div
                key={item.id}
                className="rounded-lg overflow-hidden border border-border bg-card transition-all hover:shadow-md"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-700 rounded-full h-8 w-8"
                    onClick={() => handleRemoveFavorite(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Badge
                    className="absolute top-2 left-2 capitalize"
                    variant="secondary"
                  >
                    {item.type}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {item.businessName}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-medium text-orange-600">
                      {formatCurrency(item.price)}
                    </p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="text-sm">{item.rating.toFixed(1)}</span>
                    </div>
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
                : "You haven't added any services or businesses to your favorites yet."}
            </p>
            <Button
              onClick={() => router.push(`/customer/${customerId}/services`)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Browse Services
            </Button>
          </div>
        )}
      </div>
    </CustomerDashboardLayout>
  );
}
