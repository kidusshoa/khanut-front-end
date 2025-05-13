import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Define TypeScript interfaces for the dashboard data
export interface ActivityLog {
  _id: string;
  message: string;
  createdAt: string;
  type?: string;
  userId?: string;
  userName?: string;
  businessId?: string;
  businessName?: string;
}

export interface DashboardStats {
  totalBusinesses: number;
  totalUsers: number;
  pendingApprovals: number;
  pendingReviews: number;
  recentActivity: ActivityLog[];
}

export interface ChartDataPoint {
  name: string;
  businesses: number;
  users: number;
}

export interface MonthlyData {
  month: string;
  count: number;
}

export interface AdminReportData {
  totalUsers: number;
  totalBusinesses: number;
  totalReviews: number;
  pendingApprovals: number;
  pendingReviews: number;
  monthlyUsers: MonthlyData[];
  monthlyBusinesses: MonthlyData[];
}

// Admin dashboard API service
export const adminDashboardApi = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
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

      return await response.json();
    } catch (error) {
      console.error("Error fetching admin dashboard statistics:", error);
      throw error;
    }
  },

  // Get report data for charts
  getReportData: async (): Promise<AdminReportData> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_URL}/api/admin/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch report data");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching admin report data:", error);
      throw error;
    }
  },

  // Convert monthly data to chart format
  convertToChartData: (
    monthlyUsers: MonthlyData[],
    monthlyBusinesses: MonthlyData[]
  ): ChartDataPoint[] => {
    // Create a map of all months from both arrays
    const monthsMap = new Map<string, ChartDataPoint>();

    // Initialize with user data
    monthlyUsers.forEach((item) => {
      monthsMap.set(item.month, {
        name: item.month,
        users: item.count,
        businesses: 0,
      });
    });

    // Add business data
    monthlyBusinesses.forEach((item) => {
      if (monthsMap.has(item.month)) {
        const existing = monthsMap.get(item.month)!;
        existing.businesses = item.count;
      } else {
        monthsMap.set(item.month, {
          name: item.month,
          users: 0,
          businesses: item.count,
        });
      }
    });

    // Convert map to array and sort by month order
    const monthOrder = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return Array.from(monthsMap.values()).sort(
      (a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name)
    );
  },

  // Get weekly chart data
  getWeeklyChartData: async (): Promise<ChartDataPoint[]> => {
    // This would ideally come from the API, but for now we'll return mock data
    return [
      { name: "Mon", businesses: 4, users: 7 },
      { name: "Tue", businesses: 3, users: 5 },
      { name: "Wed", businesses: 5, users: 9 },
      { name: "Thu", businesses: 7, users: 12 },
      { name: "Fri", businesses: 2, users: 8 },
      { name: "Sat", businesses: 6, users: 10 },
      { name: "Sun", businesses: 8, users: 15 },
    ];
  },
};
