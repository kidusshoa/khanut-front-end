import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Define TypeScript interfaces for the revenue data
export interface PlatformRevenue {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  monthlyRevenueData: {
    month: string;
    revenue: number;
  }[];
  topBusinesses: {
    businessId: string;
    businessName: string;
    total: number;
    count: number;
  }[];
}

export interface FeeTransaction {
  _id: string;
  paymentId: {
    _id: string;
    amount: number;
    status: string;
  };
  businessId: {
    _id: string;
    name: string;
  };
  originalAmount: number;
  feePercentage: number;
  feeAmount: number;
  createdAt: string;
}

export interface TransactionsResponse {
  transactions: FeeTransaction[];
  pagination: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Admin revenue API service
export const adminRevenueApi = {
  // Get platform revenue statistics
  getPlatformRevenue: async (): Promise<PlatformRevenue> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_URL}/api/admin/revenue`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch platform revenue statistics"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching platform revenue statistics:", error);
      throw error;
    }
  },

  // Get platform fee transactions with pagination
  getPlatformFeeTransactions: async (params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    sort?: string;
    order?: "asc" | "desc";
  }): Promise<TransactionsResponse> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Build query string
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.sort) queryParams.append("sort", params.sort);
      if (params.order) queryParams.append("order", params.order);

      const response = await fetch(
        `${API_URL}/api/admin/revenue/transactions?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch platform fee transactions"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching platform fee transactions:", error);
      throw error;
    }
  },
};
