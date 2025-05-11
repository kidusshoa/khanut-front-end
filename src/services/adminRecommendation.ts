import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RecommendationServiceHealth {
  status: string;
  data_files_exist: boolean;
  model_files_exist: boolean;
  mongodb_connected: boolean;
  version: string;
}

export interface RecommendationStats {
  totalReviews: number;
  totalBusinesses: number;
  lastTrainingDate: string | null;
  modelStatus: string;
  serviceHealth: RecommendationServiceHealth | null;
}

export interface SyncResponse {
  message: string;
}

export const adminRecommendationApi = {
  // Get recommendation service health
  getRecommendationHealth: async (): Promise<RecommendationServiceHealth> => {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/recommendations/health`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch recommendation health"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching recommendation health:", error);
      throw error;
    }
  },

  // Get recommendation system statistics
  getRecommendationStats: async (): Promise<RecommendationStats> => {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/recommendations/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch recommendation stats"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching recommendation stats:", error);
      throw error;
    }
  },

  // Trigger recommendation data sync and model retraining
  syncRecommendationData: async (): Promise<SyncResponse> => {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/recommendations/sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to sync recommendation data"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error syncing recommendation data:", error);
      throw error;
    }
  },
};
