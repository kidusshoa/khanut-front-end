"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Calendar,
  DollarSign,
  ShoppingBag,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Import API services
import {
  getDashboardStats,
  getRevenueData,
  getServiceDistribution,
  getRecentOrders,
  getUpcomingAppointments,
  DashboardStats,
  Order,
  Appointment,
} from "@/services/analyticsApi";

// Extend the Order and Appointment types for UI compatibility
interface UIOrder extends Order {
  customer: string;
}

interface UIAppointment extends Appointment {
  customer: string;
  service: string;
}

// Create wrapper functions to handle null returns and map properties
const fetchRecentOrders = async (businessId: string): Promise<UIOrder[]> => {
  const result = await getRecentOrders(businessId);
  if (!result) return [];

  // The result is already in the format { id, customer, date, amount, status }
  // We just need to cast it to our UIOrder type
  return result as unknown as UIOrder[];
};

const fetchUpcomingAppointments = async (
  businessId: string
): Promise<UIAppointment[]> => {
  const result = await getUpcomingAppointments(businessId);
  if (!result) return [];

  // The result is already in the format { id, customer, service, date, duration }
  // We just need to cast it to our UIAppointment type
  return result as unknown as UIAppointment[];
};

// Create a simple date formatter function
const formatDate = (date: string | Date, format: string) => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {};
  if (format.includes("MMM")) options.month = "short";
  if (format.includes("yyyy")) options.year = "numeric";
  if (format.includes("d")) options.day = "numeric";
  if (format.includes("h")) options.hour = "numeric";
  if (format.includes("mm")) options.minute = "2-digit";
  if (format.includes("a")) options.hour12 = true;

  return new Intl.DateTimeFormat("en-US", options).format(dateObj);
};

export default function DashboardClient({
  businessId,
}: {
  businessId: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [revenuePeriod, setRevenuePeriod] = useState<"week" | "month" | "year">(
    "week"
  );

  // Fetch dashboard stats
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["dashboardStats", businessId],
    queryFn: () => getDashboardStats(businessId),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch revenue data
  const {
    data: revenueData,
    isLoading: isRevenueLoading,
    error: revenueError,
  } = useQuery({
    queryKey: ["revenueData", businessId, revenuePeriod],
    queryFn: () => getRevenueData(businessId, revenuePeriod),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch service data
  const {
    data: serviceData,
    isLoading: isServiceLoading,
    error: serviceError,
  } = useQuery({
    queryKey: ["serviceData", businessId],
    queryFn: () => getServiceDistribution(businessId),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get query client for refetching
  const queryClient = useQueryClient();

  // Fetch recent orders
  const {
    data: recentOrders,
    isLoading: isOrdersLoading,
    error: ordersError,
  } = useQuery<UIOrder[]>({
    queryKey: ["recentOrders", businessId],
    queryFn: () => fetchRecentOrders(businessId),
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch upcoming appointments
  const {
    data: upcomingAppointments,
    isLoading: isAppointmentsLoading,
    error: appointmentsError,
  } = useQuery<UIAppointment[]>({
    queryKey: ["upcomingAppointments", businessId],
    queryFn: () => fetchUpcomingAppointments(businessId),
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "processing":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!session && !isStatsLoading) {
      router.push(`/business/login`);
    }
  }, [session, isStatsLoading, router, businessId]);

  // Function to render no data message
  const renderNoDataMessage = (message: string) => (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business performance and activities.
          </p>
        </div>

        {/* Alert for API connection issues */}
        {(statsError ||
          revenueError ||
          serviceError ||
          ordersError ||
          appointmentsError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              There was an issue connecting to the analytics service. Some data
              may not be available.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Revenue Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : statsError || !stats ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-muted-foreground">
                    No revenue data available
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 h-6 text-xs"
                    onClick={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["dashboardStats", businessId],
                      })
                    }
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats?.totalRevenue || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "inline-flex items-center",
                        stats?.revenueChange && stats.revenueChange > 0
                          ? "text-green-500"
                          : "text-red-500"
                      )}
                    >
                      {stats?.revenueChange && stats.revenueChange > 0 ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      )}
                      {stats?.revenueChange
                        ? Math.abs(stats.revenueChange).toFixed(1)
                        : 0}
                      % from last month
                    </span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Orders Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : statsError || !stats ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-muted-foreground">
                    No orders data available
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 h-6 text-xs"
                    onClick={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["dashboardStats", businessId],
                      })
                    }
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.totalOrders || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "inline-flex items-center",
                        stats?.ordersChange && stats.ordersChange > 0
                          ? "text-green-500"
                          : "text-red-500"
                      )}
                    >
                      {stats?.ordersChange && stats.ordersChange > 0 ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      )}
                      {stats?.ordersChange
                        ? Math.abs(stats.ordersChange).toFixed(1)
                        : 0}
                      % from last month
                    </span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Appointments Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : statsError || !stats ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-muted-foreground">
                    No appointments data available
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 h-6 text-xs"
                    onClick={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["dashboardStats", businessId],
                      })
                    }
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats.totalAppointments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "inline-flex items-center",
                        stats.appointmentsChange && stats.appointmentsChange > 0
                          ? "text-green-500"
                          : "text-red-500"
                      )}
                    >
                      {stats.appointmentsChange &&
                      stats.appointmentsChange > 0 ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      )}
                      {stats.appointmentsChange
                        ? Math.abs(stats.appointmentsChange).toFixed(1)
                        : 0}
                      % from last month
                    </span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Customers Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : statsError || !stats ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-muted-foreground">
                    No customers data available
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 h-6 text-xs"
                    onClick={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["dashboardStats", businessId],
                      })
                    }
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats.totalCustomers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "inline-flex items-center",
                        stats.customersChange && stats.customersChange > 0
                          ? "text-green-500"
                          : "text-red-500"
                      )}
                    >
                      {stats.customersChange && stats.customersChange > 0 ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      )}
                      {stats.customersChange
                        ? Math.abs(stats.customersChange).toFixed(1)
                        : 0}
                      % from last month
                    </span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                  Revenue Overview
                </CardTitle>
                <CardDescription>Weekly revenue comparison</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={revenuePeriod === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRevenuePeriod("week")}
                  className="h-7 text-xs"
                >
                  Week
                </Button>
                <Button
                  variant={revenuePeriod === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRevenuePeriod("month")}
                  className="h-7 text-xs"
                >
                  Month
                </Button>
                <Button
                  variant={revenuePeriod === "year" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRevenuePeriod("year")}
                  className="h-7 text-xs"
                >
                  Year
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isRevenueLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : revenueError || !revenueData ? (
                renderNoDataMessage("No revenue data available")
              ) : (
                <div className="h-[300px]">
                  <Line
                    data={revenueData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) =>
                              formatCurrency(value as number),
                          },
                        },
                      },
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Service Distribution
              </CardTitle>
              <CardDescription>Breakdown by service type</CardDescription>
            </CardHeader>
            <CardContent>
              {isServiceLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : serviceError || !serviceData ? (
                renderNoDataMessage("No service data available")
              ) : (
                <div className="h-[300px]">
                  <Bar
                    data={serviceData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders and Upcoming Appointments */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                  Recent Orders
                </CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["recentOrders", businessId],
                  })
                }
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isOrdersLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : ordersError || !recentOrders || recentOrders.length === 0 ? (
                renderNoDataMessage("No recent orders available")
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.date, "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">
                          {formatCurrency(order.amount)}
                        </p>
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-xs",
                            getStatusColor(order.status)
                          )}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>Scheduled appointments</CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["upcomingAppointments", businessId],
                  })
                }
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isAppointmentsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : appointmentsError ||
                !upcomingAppointments ||
                upcomingAppointments.length === 0 ? (
                renderNoDataMessage("No upcoming appointments available")
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {appointment.customer}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(appointment.date, "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {appointment.service}
                        </p>
                        <p className="text-xs text-right text-muted-foreground">
                          {appointment.duration}{" "}
                          {appointment.duration === 1 ? "hour" : "hours"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
