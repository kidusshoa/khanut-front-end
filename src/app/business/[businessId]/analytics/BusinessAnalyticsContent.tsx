"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Calendar,
  DollarSign,
  ShoppingBag,
  Clock,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { RevenueChart } from "@/components/business/RevenueChart";
import { CustomerAnalytics } from "@/components/business/CustomerAnalytics";
import { PerformanceMetrics } from "@/components/business/PerformanceMetrics";

// TypeScript interfaces
interface BusinessAnalytics {
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

interface Business {
  _id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  email: string;
  phone: string;
  profilePicture?: string;
}

// Fetch business details
const fetchBusinessDetails = async (businessId: string): Promise<Business> => {
  try {
    // Try the primary endpoint first
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/businesses/${businessId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      console.error("Primary endpoint failed:", response.status);
      // If primary endpoint fails, we'll try the fallback
    } catch (primaryError) {
      console.error("Error with primary endpoint:", primaryError);
      // Continue to fallback
    }

    // Try fallback endpoint
    const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/business/${businessId}`;

    const fallbackResponse = await fetch(fallbackUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!fallbackResponse.ok) {
      throw new Error(
        `Failed to fetch business details: ${fallbackResponse.status}`
      );
    }

    const fallbackData = await fallbackResponse.json();
    return fallbackData;
  } catch (error) {
    console.error("Error fetching business details:", error);
    throw error;
  }
};

// Fetch business analytics
const fetchBusinessAnalytics = async (
  businessId: string
): Promise<BusinessAnalytics> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/business/${businessId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // If the API is not implemented yet, return mock data
      console.warn("Analytics API not available, using mock data");
      return getMockAnalytics();
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching business analytics:", error);
    // Return mock data if API fails
    return getMockAnalytics();
  }
};

// Mock analytics data for development
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

interface BusinessAnalyticsContentProps {
  businessId: string;
}

export default function BusinessAnalyticsContent({
  businessId,
}: BusinessAnalyticsContentProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "year"
  >("month");

  // Fetch business details
  const {
    data: business,
    isLoading: isBusinessLoading,
    error: businessError,
  } = useQuery({
    queryKey: ["businessDetails", businessId],
    queryFn: () => fetchBusinessDetails(businessId),
    retry: 1,
  });

  // Fetch analytics data
  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ["businessAnalytics", businessId, dateRange],
    queryFn: () => fetchBusinessAnalytics(businessId),
    refetchInterval: 300000, // Refetch every 5 minutes
    enabled: !!business,
  });

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Loading state
  if (isBusinessLoading || isAnalyticsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (businessError || analyticsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2 max-w-md text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h2 className="text-xl font-semibold text-red-500">
              Error Loading Data
            </h2>
            <p className="text-muted-foreground">
              {businessError instanceof Error
                ? businessError.message
                : analyticsError instanceof Error
                ? analyticsError.message
                : "Failed to load data"}
            </p>
            <Button
              onClick={() => router.push(`/business/${businessId}`)}
              className="mt-4"
            >
              Back to Business
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => router.push(`/business/${businessId}/profile`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Business Profile
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {business?.name} - Analytics
              </h1>
              <p className="text-muted-foreground">
                Performance metrics and business insights
              </p>
            </div>

            <div>
              <Tabs
                defaultValue="month"
                value={dateRange}
                onValueChange={(value) => setDateRange(value as any)}
              >
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="week">This Week</TabsTrigger>
                  <TabsTrigger value="month">This Month</TabsTrigger>
                  <TabsTrigger value="year">This Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics?.revenue.total || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                +{formatCurrency(analytics?.revenue.thisMonth || 0)} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.orders.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +{analytics?.orders.thisMonth || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.customers.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +{analytics?.customers.new || 0} new customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.appointments.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics?.appointments.upcoming || 0} upcoming
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <RevenueChart dateRange={dateRange} />

        {/* Order and Appointment Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Statistics</CardTitle>
              <CardDescription>
                Order status and fulfillment metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-1/2 text-sm">Pending Orders</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">
                      {analytics?.orders.pending || 0}
                    </span>
                    <span className="text-muted-foreground">
                      {analytics?.orders.total
                        ? Math.round(
                            (analytics.orders.pending /
                              analytics.orders.total) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/2 text-sm">Completed Orders</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">
                      {analytics?.orders.completed || 0}
                    </span>
                    <span className="text-muted-foreground">
                      {analytics?.orders.total
                        ? Math.round(
                            (analytics.orders.completed /
                              analytics.orders.total) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/2 text-sm">Today's Orders</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">
                      {analytics?.orders.today || 0}
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(analytics?.revenue.today || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/2 text-sm">This Week's Orders</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">
                      {analytics?.orders.thisWeek || 0}
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(analytics?.revenue.thisWeek || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointment Statistics</CardTitle>
              <CardDescription>
                Appointment scheduling and completion metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-1/2 text-sm">Upcoming Appointments</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">
                      {analytics?.appointments.upcoming || 0}
                    </span>
                    <span className="text-muted-foreground">
                      {analytics?.appointments.total
                        ? Math.round(
                            (analytics.appointments.upcoming /
                              analytics.appointments.total) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/2 text-sm">Completed Appointments</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">
                      {analytics?.appointments.completed || 0}
                    </span>
                    <span className="text-muted-foreground">
                      {analytics?.appointments.total
                        ? Math.round(
                            (analytics.appointments.completed /
                              analytics.appointments.total) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/2 text-sm">Today's Appointments</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">
                      {analytics?.appointments.today || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/2 text-sm">This Week's Appointments</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">
                      {analytics?.appointments.thisWeek || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Analytics */}
        <CustomerAnalytics businessId={businessId} />

        {/* Performance Metrics */}
        <PerformanceMetrics businessId={businessId} />
      </div>
    </div>
  );
}
