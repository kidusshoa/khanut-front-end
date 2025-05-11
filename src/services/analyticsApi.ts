import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Define interfaces for analytics data
export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalAppointments: number;
  appointmentsChange: number;
  totalCustomers: number;
  customersChange: number;
}

export interface RevenueData {
  data: { date: string; revenue: number }[];
  totalRevenue: number;
  period: string;
  previousPeriodChange: number;
}

export interface ServiceDistribution {
  serviceDistribution: {
    appointment: number;
    product: number;
    in_person: number;
  };
  servicePerformance?: {
    name: string;
    type: string;
    bookings?: number;
    sales?: number;
    visits?: number;
    revenue: number;
  }[];
}

export interface Order {
  id: string;
  customerName: string;
  customerId: string;
  productName: string;
  amount: number;
  status: string;
  date: string;
}

export interface OrdersData {
  recentOrders: Order[];
  totalOrders: number;
  pendingOrders?: number;
  completedOrders?: number;
  cancelledOrders?: number;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerId: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  duration: number;
}

export interface AppointmentsData {
  upcomingAppointments: Appointment[];
  totalAppointments: number;
  pendingAppointments?: number;
  confirmedAppointments?: number;
  cancelledAppointments?: number;
}

/**
 * Get dashboard statistics for a business
 */
export const getDashboardStats = async (
  businessId: string
): Promise<DashboardStats | null> => {
  try {
    const token = await getAuthToken();

    const response = await fetch(
      `${API_URL}/api/analytics/business/${businessId}/stats`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch dashboard stats:", response.status);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
};

/**
 * Get revenue data for a business
 */
export const getRevenueData = async (
  businessId: string,
  period: "week" | "month" | "year" = "week"
) => {
  try {
    const token = await getAuthToken();

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
      console.error("Failed to fetch revenue data:", response.status);
      return null;
    }

    const data = await response.json();
    return formatRevenueChartData(data, period);
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return null;
  }
};

// Helper function to format revenue data for Chart.js
function formatRevenueChartData(data: RevenueData, period: string) {
  if (!data || !data.data) {
    return null;
  }

  const labels = data.data.map((item: any) => item.date);
  const values = data.data.map((item: any) => item.revenue);

  return {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: values,
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        tension: 0.2,
      },
    ],
  };
}

/**
 * Get service distribution data for a business
 */
export const getServiceDistribution = async (businessId: string) => {
  try {
    const token = await getAuthToken();

    const response = await fetch(
      `${API_URL}/api/analytics/business/${businessId}/services`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Failed to fetch service distribution data:",
        response.status
      );
      return null;
    }

    const data = await response.json();
    return formatServiceChartData(data);
  } catch (error) {
    console.error("Error fetching service distribution data:", error);
    return null;
  }
};

// Helper function to format service data for Chart.js
function formatServiceChartData(data: ServiceDistribution) {
  if (!data || !data.serviceDistribution) {
    return null;
  }

  const { serviceDistribution } = data;

  return {
    labels: ["Appointments", "Products", "In-Person Services"],
    datasets: [
      {
        label: "Service Distribution",
        data: [
          serviceDistribution.appointment || 0,
          serviceDistribution.product || 0,
          serviceDistribution.in_person || 0,
        ],
        backgroundColor: [
          "rgba(99, 102, 241, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(249, 115, 22, 0.7)",
        ],
        borderColor: [
          "rgb(99, 102, 241)",
          "rgb(16, 185, 129)",
          "rgb(249, 115, 22)",
        ],
        borderWidth: 1,
      },
    ],
  };
}

/**
 * Get recent orders for a business
 */
export const getRecentOrders = async (
  businessId: string,
  limit: number = 5
) => {
  try {
    const token = await getAuthToken();

    const response = await fetch(
      `${API_URL}/api/analytics/business/${businessId}/recent-orders?limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch recent orders:", response.status);
      return null;
    }

    const data = await response.json();
    return formatRecentOrders(data);
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    return null;
  }
};

// Helper function to format recent orders
function formatRecentOrders(data: OrdersData) {
  if (!data || !data.recentOrders) {
    return [];
  }

  return data.recentOrders.map((order: any) => ({
    id: order.id,
    customer: order.customerName,
    date: order.date,
    amount: order.amount,
    status: order.status,
  }));
}

/**
 * Get upcoming appointments for a business
 */
export const getUpcomingAppointments = async (
  businessId: string,
  limit: number = 5
) => {
  try {
    const token = await getAuthToken();

    const response = await fetch(
      `${API_URL}/api/analytics/business/${businessId}/upcoming-appointments?limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch upcoming appointments:", response.status);
      return null;
    }

    const data = await response.json();
    return formatUpcomingAppointments(data);
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    return null;
  }
};

// Helper function to format upcoming appointments
function formatUpcomingAppointments(data: AppointmentsData) {
  if (!data || !data.upcomingAppointments) {
    return [];
  }

  return data.upcomingAppointments.map((appointment: any) => {
    // Create a date object from the date and time
    const dateStr = appointment.date;
    const timeStr = appointment.time || "09:00";
    const dateTime = new Date(`${dateStr}T${timeStr}`);

    return {
      id: appointment.id,
      customer: appointment.customerName,
      service: appointment.serviceName,
      date: dateTime,
      duration: appointment.duration || 1,
    };
  });
}
