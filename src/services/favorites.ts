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

      // Log the URL for debugging
      console.log(`Sending request to: ${API_URL}/api/customer/favorites`);

      const response = await fetch(`${API_URL}/api/customer/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // Add credentials to handle CORS
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch favorites";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
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

      // Log the URL and businessId for debugging
      console.log(
        `Sending request to: ${API_URL}/api/customer/favorites/${businessId}`
      );

      // Make sure businessId is a string
      if (typeof businessId !== "string") {
        console.error(
          "Invalid businessId type:",
          typeof businessId,
          businessId
        );
        throw new Error("BusinessId must be a string");
      }

      const response = await fetch(
        `${API_URL}/api/customer/favorites/${businessId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          // Add credentials to handle CORS
          credentials: "include",
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to toggle favorite status";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
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
      // Make sure businessId is a string
      if (typeof businessId !== "string") {
        console.error(
          "Invalid businessId type in isFavorite:",
          typeof businessId,
          businessId
        );
        throw new Error("BusinessId must be a string");
      }

      const favorites = await favoritesApi.getFavorites();

      // Log for debugging
      console.log("Checking if business is in favorites:", businessId);
      console.log("Available favorites:", favorites);

      return favorites.some((fav: FavoriteItem) => {
        // Handle both object and string IDs
        const favBusinessId =
          typeof fav.businessId === "object"
            ? fav.businessId._id
            : fav.businessId;
        return favBusinessId === businessId;
      });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  },
};
