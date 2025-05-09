import api from "./api";
import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface FavoriteItem {
  _id: string;
  businessId: {
    _id: string;
    name: string;
    description: string;
    logo?: string;
    coverImage?: string;
    category?: string;
    rating?: number;
  };
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

export const favoritesApi = {
  // Get all favorites for a customer
  getFavorites: async () => {
    try {
      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/api/customer/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch favorites");
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw error;
    }
  },

  // Toggle favorite status for a business
  toggleFavorite: async (businessId: string) => {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/customer/favorites/${businessId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to toggle favorite status"
        );
      }

      return response.json();
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      throw error;
    }
  },

  // Check if a business is favorited
  isFavorite: async (businessId: string) => {
    try {
      const favorites = await favoritesApi.getFavorites();
      return favorites.some(
        (fav: FavoriteItem) => fav.businessId._id === businessId
      );
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  },
};
