import api from "./api";
import { getAuthToken, getUserId } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Define the business structure based on the actual API response
export interface Business {
  _id: string;
  name: string;
  description: string;
  email?: string;
  phone?: string;
  logo?: string;
  coverImage?: string;
  category?: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

// The FavoriteItem interface now reflects that the API directly returns business objects
export interface FavoriteItem extends Business {
  // Additional fields if needed
}

const cache = {
  favorites: [] as FavoriteItem[],
  lastUpdated: 0,
  cacheDuration: 5 * 60 * 1000, // 5 minutes
};

export const favoritesApi = {
  // Get all favorites for a specific customer
  getFavorites: async (customerId?: string) => {
    try {
      // Check if we have cached data that's still valid
      if (cache.favorites && Date.now() - cache.lastUpdated < cache.cacheDuration) {
        return cache.favorites;
      }

      const token = await getAuthToken();
      
      if (!token) {
        console.error("No authentication token found");
        throw new Error("Authentication required");
      }
      
      // Log the URL for debugging
      console.log(`Sending request to: ${API_URL}/api/customer/favorites`);
      console.log(`Using token: ${token.substring(0, 10)}...`);

      const response = await fetch(`${API_URL}/api/customer/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // Remove credentials to avoid CORS issues
        mode: "cors",
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

      const data = await response.json();
      console.log('Favorites API response:', data);
      
      // The API returns an array of business objects directly
      // No need to process the data, just use it as is
      const processedData = Array.isArray(data) ? data : [];
      
      cache.favorites = processedData;
      cache.lastUpdated = Date.now();

      return processedData;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw error;
    }
  },

  // Toggle favorite status for a business
  toggleFavorite: async (id: string, customerId?: string) => {
    try {
      const token = await getAuthToken();

      if (!token) {
        console.error("No authentication token found");
        throw new Error("Authentication required");
      }
      
      // Check if this is a service ID (contains 'service')
      // If it is, we need to extract the business ID from it
      let businessId = id;
      
      // If this is a service ID, it might be in the format "service-{businessId}-{serviceId}"
      // or it might contain the business ID as part of the string
      if (id.includes('service') || id.length > 24) {
        // Try to extract a 24-character MongoDB ObjectId from the string
        const objectIdMatch = id.match(/([0-9a-f]{24})/i);
        if (objectIdMatch && objectIdMatch[1]) {
          businessId = objectIdMatch[1];
          console.log(`Extracted business ID from service ID: ${businessId}`);
        } else {
          // If we can't extract a valid ObjectId, use the first 24 characters
          // This is a fallback and might not work in all cases
          businessId = id.substring(0, 24);
          console.log(`Using first 24 chars as business ID: ${businessId}`);
        }
      }
      
      // Clean the businessId - ensure it's a valid MongoDB ObjectId format
      const cleanBusinessId = businessId.replace(/[^a-f0-9]/gi, '').substring(0, 24);
      
      // Log the URL and businessId for debugging
      console.log(`Original ID: ${id}`);
      console.log(`Processed business ID: ${businessId}`);
      console.log(`Final cleaned business ID: ${cleanBusinessId}`);
      console.log(`Sending request to: ${API_URL}/api/customer/favorites/${cleanBusinessId}`);

      // Make sure businessId is a valid string
      if (typeof cleanBusinessId !== "string" || cleanBusinessId.length === 0) {
        console.error("Invalid businessId after processing");
        throw new Error("BusinessId must be a valid string");
      }

      const response = await fetch(
        `${API_URL}/api/customer/favorites/${cleanBusinessId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          // Remove credentials to avoid CORS issues
          mode: "cors",
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
  isFavorite: async (businessId: string, customerId?: string) => {
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
      
      // Clean the businessId to ensure consistent format
      const cleanBusinessId = businessId.replace(/[^a-f0-9]/gi, '').substring(0, 24);

      const favorites = await favoritesApi.getFavorites(customerId);

      // Log for debugging
      console.log("Checking if business is in favorites:", businessId);
      console.log("Cleaned business ID for comparison:", cleanBusinessId);
      console.log("Available favorites:", favorites);

      return favorites.some((fav: FavoriteItem) => {
        // The API returns business objects directly, so we need to check the _id
        const favId = fav._id;
        
        // Clean the favorite ID for comparison
        const cleanFavId = favId.replace(/[^a-f0-9]/gi, '').substring(0, 24);
        
        // Log the comparison
        console.log(`Comparing: ${cleanBusinessId} === ${cleanFavId}`);
        
        return cleanFavId === cleanBusinessId;
      });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  },
};
