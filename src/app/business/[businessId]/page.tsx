"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Calendar, 
  DollarSign, 
  Package, 
  ShoppingBag, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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
import { toast } from "react-hot-toast";

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

// Mock API calls - replace with actual API calls
const fetchDashboardStats = async (businessId: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  return {
    totalRevenue: 15750,
    totalOrders: 124,
    totalAppointments: 87,
    totalCustomers: 210,
    revenueChange: 12.5,
    ordersChange: 8.3,
    appointmentsChange: -3.2,
    customersChange: 15.7,
  };
};

const fetchRevenueData = async (businessId: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  return {
    labels: days,
    datasets: [
      {
        label: "This Week",
        data: [1200, 1900, 1500, 2200, 1800, 2500, 2100],
        borderColor: "hsl(24, 100%, 50%)",
        backgroundColor: "hsla(24, 100%, 50%, 0.5)",
      },
      {
        label: "Last Week",
        data: [1000, 1700, 1400, 1900, 1600, 2200, 1800],
        borderColor: "hsl(210, 100%, 50%)",
        backgroundColor: "hsla(210, 100%, 50%, 0.5)",
      },
    ],
  };
};

const fetchServiceData = async (businessId: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1200));
  
  return {
    labels: ["Appointments", "Products", "In-Person"],
    datasets: [
      {
        label: "Service Types",
        data: [42, 38, 20],
        backgroundColor: [
          "hsla(210, 100%, 50%, 0.7)",
          "hsla(24, 100%, 50%, 0.7)",
          "hsla(130, 100%, 40%, 0.7)",
        ],
        borderColor: [
          "hsl(210, 100%, 50%)",
          "hsl(24, 100%, 50%)",
          "hsl(130, 100%, 40%)",
        ],
        borderWidth: 1,
      },
    ],
  };
};

const fetchRecentOrders = async (businessId: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  return [
    {
      id: "ORD-001",
      customer: "John Doe",
      date: new Date(2023, 6, 15),
      amount: 125.99,
      status: "delivered",
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      date: new Date(2023, 6, 14),
      amount: 89.50,
      status: "shipped",
    },
    {
      id: "ORD-003",
      customer: "Bob Johnson",
      date: new Date(2023, 6, 14),
      amount: 210.75,
      status: "processing",
    },
    {
      id: "ORD-004",
      customer: "Alice Brown",
      date: new Date(2023, 6, 13),
      amount: 45.25,
      status: "delivered",
    },
  ];
};

const fetchUpcomingAppointments = async (businessId: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 700));
  
  return [
    {
      id: "APT-001",
      customer: "Sarah Wilson",
      service: "Haircut",
      date: new Date(2023, 6, 16, 10, 30),
      duration: 60,
    },
    {
      id: "APT-002",
      customer: "Michael Davis",
      service: "Massage",
      date: new Date(2023, 6, 16, 14, 0),
      duration: 90,
    },
    {
      id: "APT-003",
      customer: "Emily Taylor",
      service: "Manicure",
      date: new Date(2023, 6, 17, 11, 0),
      duration: 45,
    },
  ];
};

export default function BusinessDashboardPage({
  params: { businessId },
}: {
  params: { businessId: string };
}) {
  // Fetch dashboard stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboardStats", businessId],
    queryFn: () => fetchDashboardStats(businessId),
  });

  // Fetch revenue data
  const { data: revenueData, isLoading: isRevenueLoading } = useQuery({
    queryKey: ["revenueData", businessId],
    queryFn: () => fetchRevenueData(businessId),
  });

  // Fetch service data
  const { data: serviceData, isLoading: isServiceLoading } = useQuery({
    queryKey: ["serviceData", businessId],
    queryFn: () => fetchServiceData(businessId),
  });

  // Fetch recent orders
  const { data: recentOrders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["recentOrders", businessId],
    queryFn: () => fetchRecentOrders(businessId),
  });

  // Fetch upcoming appointments
  const { data: upcomingAppointments, isLoading: isAppointmentsLoading } = useQuery({
    queryKey: ["upcomingAppointments", businessId],
    queryFn: () => fetchUpcomingAppointments(businessId),
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
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading...</p>
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
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
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
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.totalAppointments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "inline-flex items-center",
                        stats?.appointmentsChange && stats.appointmentsChange > 0
                          ? "text-green-500"
                          : "text-red-500"
                      )}
                    >
                      {stats?.appointmentsChange && stats.appointmentsChange > 0 ? (
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
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Weekly revenue comparison</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isRevenueLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                revenueData && <Line data={revenueData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `ETB ${value}`
                      }
                    }
                  }
                }} />
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
              ) : (
                serviceData && <Bar data={serviceData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    }
                  }
                }} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Orders */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              {isOrdersLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders?.map((order) => (
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
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(order.date, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {isAppointmentsLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments?.map((appointment) => (
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
                          {format(appointment.date, "h:mm a")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(appointment.date, "MMM d, yyyy")}
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
