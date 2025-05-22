import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface DashboardStats {
  totalAppointments: number;
  upcomingAppointments: number;
  totalOrders: number;
  pendingOrders: number;
  favoriteServices: number;
}

export interface RecommendedBusiness {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  category?: string;
  rating?: number;
  predictionScore?: number;
  recommendationMethod?: string;
}

export const dashboardApi = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/api/customer/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch dashboard statistics"
        );
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
      throw error;
    }
  },

  // Get recommended businesses
  getRecommendedBusinesses: async (
    limit: number = 4,
    method: "hybrid" | "collaborative" | "content" | "top-rated" = "hybrid"
  ): Promise<RecommendedBusiness[]> => {
    try {
      // If method is top-rated, use the top-rated businesses endpoint
      if (method === "top-rated") {
        return await dashboardApi.getTopRatedBusinesses(limit);
      }

      const token = await getAuthToken();
      const endpoints = [
        `/api/customer/dashboard/recommended?limit=${limit}&method=${method}`,
        `/api/customer/recommended?limit=${limit}&method=${method}`
        
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const recommendations = data.recommendations || data || [];

            // If we got some results, return them
            if (recommendations.length > 0) {
              console.log(`Got recommendations from ${endpoint}`, recommendations);
              return Array.isArray(recommendations) ? recommendations : [recommendations];
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${endpoint}:`, error);
          // Continue to the next endpoint
        }
      }

      // If we get here, all endpoints failed or returned empty results
      console.warn("All recommendation endpoints failed or returned no results");
      return [];
    } catch (error) {
      console.error("Error in getRecommendedBusinesses:", error);
      return [];
    }
  },

  // Get top-rated businesses as fallback
  getTopRatedBusinesses: async (
    limit: number = 4
  ): Promise<RecommendedBusiness[]> => {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/customer/top?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch top-rated businesses"
        );
      }

      const data = await response.json();
      console.log("Top-rated businesses data:", data);

      // Format the data to match the RecommendedBusiness interface
      return data.map((business: any) => ({
        ...business,
        predictionScore: business.avgRating || 4.5,
        recommendationMethod: "top-rated",
      }));
    } catch (error) {
      console.error("Error fetching top-rated businesses:", error);
      return [];
    }
  },
};
