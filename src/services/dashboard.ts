import api from "./api";
import { getAuthToken } from "@/lib/auth";

const API_URL = "http://localhost:4000";

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
    method: "hybrid" | "collaborative" | "content" = "hybrid"
  ): Promise<RecommendedBusiness[]> => {
    try {
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

      return response.json();
    } catch (error) {
      console.error("Error fetching recommended businesses:", error);
      throw error;
    }
  },
};
