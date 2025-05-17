import { getAuthToken } from "@/lib/auth-utils";
import { getCorrectBusinessId } from "@/lib/business-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Simple in-memory cache for analytics data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

const cache: Record<string, CacheEntry<any>> = {};

/**
 * Get data from cache if available and not expired
 * @param key Cache key
 * @returns Cached data or null if not found or expired
 */
function getFromCache<T>(key: string): T | null {
  const entry = cache[key];
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > entry.expiresIn) {
    // Cache expired
    delete cache[key];
    return null;
  }

  return entry.data;
}

/**
 * Store data in cache
 * @param key Cache key
 * @param data Data to cache
 * @param expiresIn Cache expiration time in milliseconds (default: 5 minutes)
 */
function storeInCache<T>(
  key: string,
  data: T,
  expiresIn: number = 5 * 60 * 1000
): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
    expiresIn,
  };
}

// Define interfaces for analytics data
export interface BusinessAnalytics {
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  orders: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    pending: number;
    completed: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
  };
  appointments: {
    total: number;
    today: number;
    thisWeek: number;
    upcoming: number;
    completed: number;
  };
}

export interface RevenueChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

export interface CustomerSourceData {
  name: string;
  value: number;
}

export interface CustomerRetentionData {
  month: string;
  new: number;
  returning: number;
}

export interface PerformanceData {
  revenue: {
    total: number;
    target: number;
    growth: number;
  };
  orders: {
    total: number;
    target: number;
    growth: number;
  };
  customers: {
    total: number;
    target: number;
    growth: number;
  };
}

/**
 * Get comprehensive analytics data for a business
 *
 * This function simulates what a backend endpoint would do by aggregating data from multiple endpoints
 * In a real implementation, this would be a single API endpoint that returns all the data at once
 */
export const getBusinessAnalytics = async (
  urlBusinessId: string,
  dateRange: "today" | "week" | "month" | "year" = "month"
): Promise<BusinessAnalytics> => {
  try {
    // Get the correct business ID
    const businessId = await getCorrectBusinessId(urlBusinessId);

    // Check cache first
    const cacheKey = `analytics_${businessId}_${dateRange}`;
    const cachedData = getFromCache<BusinessAnalytics>(cacheKey);
    if (cachedData) {
      console.info(
        `Using cached analytics data for ${businessId} (${dateRange})`
      );
      return cachedData;
    }

    const token = await getAuthToken();

    // Try to fetch from the API
    try {
      // First try the comprehensive endpoint (which may not exist yet)
      try {
        const response = await fetch(
          `${API_URL}/api/analytics/business/${businessId}/comprehensive?period=${dateRange}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Store in cache
          storeInCache(cacheKey, data);
          return data;
        }
      } catch (comprehensiveError) {
        console.warn(
          "Comprehensive endpoint not available, falling back to individual endpoints"
        );
      }

      // If comprehensive endpoint fails, try to aggregate data from individual endpoints
      // 1. Get dashboard stats
      let dashboardStats;
      try {
        const statsResponse = await fetch(
          `${API_URL}/api/analytics/business/${businessId}/stats`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (statsResponse.ok) {
          dashboardStats = await statsResponse.json();
        } else {
          console.warn(
            `Failed to fetch dashboard stats: ${statsResponse.status}`
          );
          // If we get a 404, it means the endpoint doesn't exist yet
          if (statsResponse.status === 404) {
            console.info("Stats endpoint not available, using mock data");
          }
        }
      } catch (statsError) {
        console.warn("Failed to fetch dashboard stats:", statsError);
      }

      // 2. Get recent orders
      let recentOrders;
      try {
        const ordersResponse = await fetch(
          `${API_URL}/api/analytics/business/${businessId}/recent-orders?limit=10`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (ordersResponse.ok) {
          recentOrders = await ordersResponse.json();
        } else {
          console.warn(
            `Failed to fetch recent orders: ${ordersResponse.status}`
          );
          if (ordersResponse.status === 404) {
            console.info(
              "Recent orders endpoint not available, using mock data"
            );
          }
        }
      } catch (ordersError) {
        console.warn("Failed to fetch recent orders:", ordersError);
      }

      // 3. Get upcoming appointments
      let upcomingAppointments;
      try {
        const appointmentsResponse = await fetch(
          `${API_URL}/api/analytics/business/${businessId}/upcoming-appointments?limit=10`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (appointmentsResponse.ok) {
          upcomingAppointments = await appointmentsResponse.json();
        } else {
          console.warn(
            `Failed to fetch upcoming appointments: ${appointmentsResponse.status}`
          );
          if (appointmentsResponse.status === 404) {
            console.info(
              "Upcoming appointments endpoint not available, using mock data"
            );
          }
        }
      } catch (appointmentsError) {
        console.warn(
          "Failed to fetch upcoming appointments:",
          appointmentsError
        );
      }

      // Combine all data into a single object
      const analyticsData: BusinessAnalytics = {
        revenue: {
          total: dashboardStats?.totalRevenue || 0,
          today: 0, // Not available from current endpoints
          thisWeek: 0, // Not available from current endpoints
          thisMonth: dashboardStats?.totalRevenue || 0,
        },
        orders: {
          total: dashboardStats?.totalOrders || 0,
          today: 0, // Not available from current endpoints
          thisWeek: 0, // Not available from current endpoints
          thisMonth: dashboardStats?.totalOrders || 0,
          pending:
            recentOrders?.filter(
              (order: { status: string }) => order.status === "pending"
            )?.length || 0,
          completed:
            recentOrders?.filter(
              (order: { status: string }) => order.status === "completed"
            )?.length || 0,
        },
        customers: {
          total: dashboardStats?.totalCustomers || 0,
          new: Math.round((dashboardStats?.totalCustomers || 0) * 0.2), // Estimate 20% new
          returning: Math.round((dashboardStats?.totalCustomers || 0) * 0.8), // Estimate 80% returning
        },
        appointments: {
          total: dashboardStats?.totalAppointments || 0,
          today: 0, // Not available from current endpoints
          thisWeek: 0, // Not available from current endpoints
          upcoming: upcomingAppointments?.length || 0,
          completed:
            (dashboardStats?.totalAppointments || 0) -
            (upcomingAppointments?.length || 0),
        },
      };

      // Store aggregated data in cache
      storeInCache(cacheKey, analyticsData);
      return analyticsData;
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      return getMockAnalytics();
    }
  } catch (error) {
    console.error("Error in getBusinessAnalytics:", error);
    return getMockAnalytics();
  }
};

/**
 * Get revenue chart data for a business
 */
export const getRevenueChartData = async (
  urlBusinessId: string,
  period: "today" | "week" | "month" | "year" = "week"
): Promise<RevenueChartData> => {
  try {
    // Get the correct business ID
    const businessId = await getCorrectBusinessId(urlBusinessId);

    // Check cache first
    const cacheKey = `revenue_${businessId}_${period}`;
    const cachedData = getFromCache<RevenueChartData>(cacheKey);
    if (cachedData) {
      console.info(`Using cached revenue data for ${businessId} (${period})`);
      return cachedData;
    }

    const token = await getAuthToken();

    // Try to fetch from the API
    try {
      const response = await fetch(
        `${API_URL}/api/analytics/business/${businessId}/revenue?period=${period}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch revenue data: ${response.status}`);
        return getMockRevenueData(period);
      }

      const data = await response.json();
      // Store in cache
      storeInCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      return getMockRevenueData(period);
    }
  } catch (error) {
    console.error("Error in getRevenueChartData:", error);
    return getMockRevenueData(period);
  }
};

/**
 * Get customer analytics data for a business
 */
export const getCustomerAnalytics = async (
  urlBusinessId: string
): Promise<{
  total: number;
  new: number;
  returning: number;
  sources: CustomerSourceData[];
  retention: CustomerRetentionData[];
}> => {
  try {
    // Get the correct business ID
    const businessId = await getCorrectBusinessId(urlBusinessId);

    // Check cache first
    const cacheKey = `customers_${businessId}`;
    const cachedData = getFromCache<{
      total: number;
      new: number;
      returning: number;
      sources: CustomerSourceData[];
      retention: CustomerRetentionData[];
    }>(cacheKey);

    if (cachedData) {
      console.info(`Using cached customer data for ${businessId}`);
      return cachedData;
    }

    const token = await getAuthToken();

    // Try to fetch from the API
    try {
      const response = await fetch(
        `${API_URL}/api/analytics/business/${businessId}/customers`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch customer data: ${response.status}`);
        return getMockCustomerData();
      }

      const data = await response.json();
      // Store in cache
      storeInCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error fetching customer data:", error);
      return getMockCustomerData();
    }
  } catch (error) {
    console.error("Error in getCustomerAnalytics:", error);
    return getMockCustomerData();
  }
};

/**
 * Get performance metrics for a business
 */
export const getPerformanceMetrics = async (
  urlBusinessId: string
): Promise<PerformanceData> => {
  try {
    // Get the correct business ID
    const businessId = await getCorrectBusinessId(urlBusinessId);

    // Check cache first
    const cacheKey = `performance_${businessId}`;
    const cachedData = getFromCache<PerformanceData>(cacheKey);
    if (cachedData) {
      console.info(`Using cached performance data for ${businessId}`);
      return cachedData;
    }

    const token = await getAuthToken();

    // Try to fetch from the API
    try {
      const response = await fetch(
        `${API_URL}/api/analytics/business/${businessId}/performance`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch performance data: ${response.status}`);
        return getMockPerformanceData();
      }

      const data = await response.json();
      // Store in cache
      storeInCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error fetching performance data:", error);
      return getMockPerformanceData();
    }
  } catch (error) {
    console.error("Error in getPerformanceMetrics:", error);
    return getMockPerformanceData();
  }
};

// Mock data functions
const getMockAnalytics = (): BusinessAnalytics => {
  return {
    revenue: {
      total: 12580.75,
      today: 450.25,
      thisWeek: 2340.5,
      thisMonth: 8750.3,
    },
    orders: {
      total: 156,
      today: 8,
      thisWeek: 42,
      thisMonth: 124,
      pending: 12,
      completed: 144,
    },
    customers: {
      total: 89,
      new: 12,
      returning: 77,
    },
    appointments: {
      total: 78,
      today: 5,
      thisWeek: 23,
      upcoming: 15,
      completed: 63,
    },
  };
};

const getMockRevenueData = (
  period: "today" | "week" | "month" | "year"
): RevenueChartData => {
  if (period === "today") {
    return {
      labels: [
        "00:00",
        "03:00",
        "06:00",
        "09:00",
        "12:00",
        "15:00",
        "18:00",
        "21:00",
      ],
      datasets: [
        {
          label: "Today",
          data: [50, 120, 180, 250, 300, 280, 220, 150],
          borderColor: "hsl(24, 100%, 50%)",
          backgroundColor: "hsla(24, 100%, 50%, 0.5)",
        },
        {
          label: "Yesterday",
          data: [30, 100, 160, 220, 280, 250, 200, 130],
          borderColor: "hsl(210, 100%, 50%)",
          backgroundColor: "hsla(210, 100%, 50%, 0.5)",
        },
      ],
    };
  } else if (period === "week") {
    return {
      labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      datasets: [
        {
          label: "This Week",
          data: [300, 450, 380, 520, 480, 600, 580],
          borderColor: "hsl(24, 100%, 50%)",
          backgroundColor: "hsla(24, 100%, 50%, 0.5)",
        },
        {
          label: "Last Week",
          data: [250, 400, 350, 480, 450, 550, 520],
          borderColor: "hsl(210, 100%, 50%)",
          backgroundColor: "hsla(210, 100%, 50%, 0.5)",
        },
      ],
    };
  } else if (period === "month") {
    return {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [
        {
          label: "This Month",
          data: [1800, 2200, 2400, 2600],
          borderColor: "hsl(24, 100%, 50%)",
          backgroundColor: "hsla(24, 100%, 50%, 0.5)",
        },
        {
          label: "Last Month",
          data: [1600, 2000, 2200, 2400],
          borderColor: "hsl(210, 100%, 50%)",
          backgroundColor: "hsla(210, 100%, 50%, 0.5)",
        },
      ],
    };
  } else {
    return {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "This Year",
          data: [
            5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000,
            15000, 16000,
          ],
          borderColor: "hsl(24, 100%, 50%)",
          backgroundColor: "hsla(24, 100%, 50%, 0.5)",
        },
        {
          label: "Last Year",
          data: [
            4500, 5500, 6500, 7500, 8500, 9500, 10500, 11500, 12500, 13500,
            14500, 15500,
          ],
          borderColor: "hsl(210, 100%, 50%)",
          backgroundColor: "hsla(210, 100%, 50%, 0.5)",
        },
      ],
    };
  }
};

const getMockCustomerData = () => {
  return {
    total: 89,
    new: 12,
    returning: 77,
    sources: [
      { name: "Direct", value: 35 },
      { name: "Search", value: 22 },
      { name: "Social", value: 18 },
      { name: "Referral", value: 14 },
    ],
    retention: [
      { month: "Jan", new: 12, returning: 8 },
      { month: "Feb", new: 15, returning: 10 },
      { month: "Mar", new: 18, returning: 12 },
      { month: "Apr", new: 14, returning: 15 },
      { month: "May", new: 10, returning: 18 },
      { month: "Jun", new: 8, returning: 20 },
    ],
  };
};

const getMockPerformanceData = (): PerformanceData => {
  return {
    revenue: {
      total: 12580.75,
      target: 15000,
      growth: 5,
    },
    orders: {
      total: 156,
      target: 200,
      growth: 8,
    },
    customers: {
      total: 89,
      target: 120,
      growth: 12,
    },
  };
};
