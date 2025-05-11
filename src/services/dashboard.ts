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

      const response = await fetch(
        `${API_URL}/api/customer/dashboard/recommended?limit=${limit}&method=${method}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch recommendations");
      }

      const data = await response.json();
      console.log("Recommended businesses data:", data); // Debug log
      return data.recommendations || [];
    } catch (error) {
      console.error("Error fetching recommended businesses:", error);
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
