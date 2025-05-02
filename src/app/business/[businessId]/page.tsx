"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Calendar,
  DollarSign,
  ShoppingBag,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  customer: string;
  date: string | Date;
  amount: number;
  status: string;
}

interface Appointment {
  id: string;
  customer: string;
  service: string;
  date: string | Date;
  duration: number;
}
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
} from "@/services/analyticsApi";

export default function BusinessDashboardPage() {
  const params = useParams();
  const businessId = params.businessId as string;
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
  } = useQuery<Order[]>({
    queryKey: ["recentOrders", businessId],
    queryFn: () => getRecentOrders(businessId),
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch upcoming appointments
  const {
    data: upcomingAppointments,
    isLoading: isAppointmentsLoading,
    error: appointmentsError,
  } = useQuery<Appointment[]>({
    queryKey: ["upcomingAppointments", businessId],
    queryFn: () => getUpcomingAppointments(businessId),
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

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business performance and activities.
          </p>
        </div>

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
              ) : statsError ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-muted-foreground">
                    Failed to load stats
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
              ) : statsError ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-muted-foreground">
                    Failed to load stats
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
              ) : statsError ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-muted-foreground">
                    Failed to load stats
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
                    {stats?.totalAppointments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "inline-flex items-center",
                        stats?.appointmentsChange &&
                          stats.appointmentsChange > 0
                          ? "text-green-500"
                          : "text-red-500"
                      )}
                    >
                      {stats?.appointmentsChange &&
                      stats.appointmentsChange > 0 ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      )}
                      {stats?.appointmentsChange
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
              ) : statsError ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-muted-foreground">
                    Failed to load stats
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
                    {stats?.totalCustomers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "inline-flex items-center",
                        stats?.customersChange && stats.customersChange > 0
                          ? "text-green-500"
                          : "text-red-500"
                      )}
                    >
                      {stats?.customersChange && stats.customersChange > 0 ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      )}
                      {stats?.customersChange
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

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  {revenuePeriod === "week"
                    ? "Weekly"
                    : revenuePeriod === "month"
                    ? "Monthly"
                    : "Yearly"}{" "}
                  revenue comparison
                </CardDescription>
              </div>
              <select
                value={revenuePeriod}
                onChange={(e) =>
                  setRevenuePeriod(e.target.value as "week" | "month" | "year")
                }
                className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </CardHeader>
            <CardContent className="h-80">
              {isRevenueLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : revenueError ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground">
                    Failed to load revenue data
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const queryClient = useQueryClient();
                      queryClient.invalidateQueries({
                        queryKey: ["revenueData", businessId, revenuePeriod],
                      });
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                revenueData && (
                  <Line
                    data={revenueData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => `ETB ${value}`,
                          },
                        },
                      },
                    }}
                  />
                )
              )}
            </CardContent>
          </Card>

          {/* Service Types Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Service Distribution</CardTitle>
              <CardDescription>Breakdown by service type</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isServiceLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : serviceError ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground">
                    Failed to load service distribution data
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      queryClient.invalidateQueries({
                        queryKey: ["serviceData", businessId],
                      });
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                serviceData && (
                  <Bar
                    data={serviceData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                )
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Orders */}
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
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
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : ordersError ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground">
                    Failed to load recent orders
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["recentOrders", businessId],
                      })
                    }
                  >
                    Try Again
                  </Button>
                </div>
              ) : recentOrders && recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{order.customer}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {order.id}
                          </p>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              getStatusColor(order.status)
                            )}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(order.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.date, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-center">
                  <p className="text-muted-foreground">
                    No recent orders found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Scheduled appointments</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
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
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : appointmentsError ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground">
                    Failed to load upcoming appointments
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["upcomingAppointments", businessId],
                      })
                    }
                  >
                    Try Again
                  </Button>
                </div>
              ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{appointment.customer}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.service}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatDate(appointment.date, "h:mm a")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(appointment.date, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-center">
                  <p className="text-muted-foreground">
                    No upcoming appointments found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
