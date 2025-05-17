"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Calendar as CalendarIcon,
  DollarSign,
  ShoppingBag,
  Clock,
  ArrowLeft,
  AlertCircle,
  Download,
  CalendarRange,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, isAfter, isBefore, isEqual } from "date-fns";
import api from "@/services/api";
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
import { getBusinessAnalytics } from "@/services/businessAnalyticsApi";
import { exportAnalyticsAsCSV } from "@/utils/exportUtils";
import {
  DateRangePicker,
  dateRangePresets,
} from "@/components/ui/date-range-picker";
import { TrendIndicator } from "@/components/ui/trend-indicator";
import { MetricTooltip } from "@/components/ui/metric-tooltip";

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

// Get the correct business ID
const getCorrectBusinessId = async (urlBusinessId: string): Promise<string> => {
  try {
    // Try to get the business ID from the business status API
    try {
      const response = await api.get("/business/status");

      if (response.data && response.data.businessId) {
        console.log(
          "Got correct business ID from status API:",
          response.data.businessId
        );
        return response.data.businessId;
      }
    } catch (statusError) {
      console.warn("Failed to get business ID from status API:", statusError);
      // Continue with URL business ID
    }

    // Return the URL business ID as a fallback
    console.log("Using URL business ID as fallback:", urlBusinessId);
    return urlBusinessId;
  } catch (error) {
    console.error("Error in getCorrectBusinessId:", error);
    return urlBusinessId;
  }
};

// Fetch business details
const fetchBusinessDetails = async (
  urlBusinessId: string
): Promise<Business> => {
  try {
    // Get the correct business ID first
    const businessId = await getCorrectBusinessId(urlBusinessId);

    // Try the primary endpoint first
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/businesses/${businessId}`;
      console.log("Trying primary URL for business details:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Business data received from primary endpoint:", data);
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
    console.log("Trying fallback URL for business details:", fallbackUrl);

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
    console.log("Business data received from fallback endpoint:", fallbackData);
    return fallbackData;
  } catch (error) {
    console.error("Error fetching business details:", error);
    throw error;
  }
};

// Fetch business analytics
const fetchBusinessAnalytics = async (
  urlBusinessId: string,
  dateRange: "today" | "week" | "month" | "year" = "month"
): Promise<BusinessAnalytics> => {
  try {
    // Use the new API service
    return await getBusinessAnalytics(urlBusinessId, dateRange);
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
    "today" | "week" | "month" | "year" | "custom"
  >("month");

  // State for custom date range
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(
    undefined
  );

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
    queryKey: ["businessAnalytics", businessId, dateRange, customDateRange],
    queryFn: () => {
      if (dateRange === "custom" && customDateRange) {
        // For custom date range, we would ideally pass the date range to the API
        // Since our API doesn't support custom date ranges yet, we'll use the month range
        // In a real implementation, we would pass the custom date range to the API
        return fetchBusinessAnalytics(businessId, "month");
      }
      // Filter out "custom" from dateRange before passing to fetchBusinessAnalytics
      return fetchBusinessAnalytics(
        businessId,
        dateRange === "custom" ? "month" : dateRange
      );
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    enabled: !!business && (dateRange !== "custom" || !!customDateRange),
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
            onClick={() => router.push(`/business/${businessId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Business Dashboard
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

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={() => {
                  if (analytics && business) {
                    exportAnalyticsAsCSV(analytics, business.name);
                  }
                }}
                disabled={isAnalyticsLoading || !analytics}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>

              <div className="flex flex-col gap-2">
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
                    <TabsTrigger value="custom">Custom</TabsTrigger>
                  </TabsList>
                </Tabs>

                {dateRange === "custom" && (
                  <DateRangePicker
                    value={
                      customDateRange &&
                      customDateRange.from &&
                      customDateRange.to
                        ? { from: customDateRange.from, to: customDateRange.to }
                        : null
                    }
                    onChange={(range) => {
                      setCustomDateRange(range ?? undefined);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                Total Revenue
                <MetricTooltip
                  title="Total Revenue"
                  description="The total amount of money earned from all orders. This includes all completed and in-progress orders."
                  iconSize="sm"
                />
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics?.revenue.total || 0)}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(analytics?.revenue.thisMonth || 0)} this month
                </p>
                <TrendIndicator value={5.2} size="sm" showValue={true} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                Total Orders
                <MetricTooltip
                  title="Total Orders"
                  description="The total number of orders placed by customers. This includes all orders regardless of their status."
                  iconSize="sm"
                />
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.orders.total || 0}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {analytics?.orders.thisMonth || 0} this month
                </p>
                <TrendIndicator value={8.7} size="sm" showValue={true} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                Total Customers
                <MetricTooltip
                  title="Total Customers"
                  description="The total number of unique customers who have placed orders or booked appointments with your business."
                  iconSize="sm"
                />
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.customers.total || 0}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {analytics?.customers.new || 0} new customers
                </p>
                <TrendIndicator value={12.3} size="sm" showValue={true} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                Total Appointments
                <MetricTooltip
                  title="Total Appointments"
                  description="The total number of appointments booked by customers. This includes both completed and upcoming appointments."
                  iconSize="sm"
                />
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.appointments.total || 0}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {analytics?.appointments.upcoming || 0} upcoming
                </p>
                <TrendIndicator value={3.8} size="sm" showValue={true} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <RevenueChart
          dateRange={dateRange === "custom" ? "month" : dateRange}
        />

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
        <CustomerAnalytics
          customerData={
            analytics?.customers || { total: 0, new: 0, returning: 0 }
          }
        />

        {/* Performance Metrics */}
        <PerformanceMetrics
          performanceData={{
            revenue: {
              total: analytics?.revenue?.total || 0,
              target: (analytics?.revenue?.total || 0) * 1.2 || 10000, // 20% higher than current as target
              growth: 5, // Mock 5% growth
            },
            orders: {
              total: analytics?.orders?.total || 0,
              target: (analytics?.orders?.total || 0) * 1.2 || 100, // 20% higher than current as target
              growth: 8, // Mock 8% growth
            },
            customers: {
              total: analytics?.customers?.total || 0,
              target: (analytics?.customers?.total || 0) * 1.2 || 50, // 20% higher than current as target
              growth: 12, // Mock 12% growth
            },
          }}
        />
      </div>
    </div>
  );
}
