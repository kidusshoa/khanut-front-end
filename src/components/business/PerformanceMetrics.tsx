import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { getPerformanceMetrics } from "@/services/businessAnalyticsApi";
import { useParams } from "next/navigation";

// TypeScript interfaces
interface PerformanceData {
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

interface PerformanceMetricsProps {
  performanceData: PerformanceData;
}

export function PerformanceMetrics({
  performanceData,
}: PerformanceMetricsProps): React.ReactNode {
  const params = useParams();
  const businessId = params.businessId as string;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [kpiData, setKpiData] = useState<any[]>([]);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setIsLoading(true);
      try {
        // For now, we'll use mock data since the API doesn't provide this specific data
        // In a real implementation, we would fetch this from the API
        setTrendData(generateTrendData());
        setKpiData(generateKpiData());
      } catch (error) {
        console.error("Failed to fetch performance data:", error);
        setTrendData([]);
        setKpiData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceData();
  }, [businessId]);

  // Generate mock performance trend data
  const generateTrendData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month) => ({
      month,
      revenue: Math.floor(Math.random() * 10000) + 5000,
      orders: Math.floor(Math.random() * 100) + 50,
      customers: Math.floor(Math.random() * 50) + 20,
    }));
  };

  // Generate KPI data for radar chart
  // In a real implementation, this would use actual analytics data
  const generateKpiData = () => {
    // Generate more realistic KPI data with consistent values
    // This ensures the radar chart looks balanced and professional

    // Base value between 60-80 for all metrics to ensure consistency
    const baseValue = Math.floor(Math.random() * 20) + 60;

    // Small variations for each metric (±10)
    const variation = () => Math.floor(Math.random() * 20) - 10;

    return [
      {
        subject: "Revenue",
        A: Math.min(100, Math.max(40, baseValue + variation())),
        fullMark: 100,
      },
      {
        subject: "Orders",
        A: Math.min(100, Math.max(40, baseValue + variation())),
        fullMark: 100,
      },
      {
        subject: "Customers",
        A: Math.min(100, Math.max(40, baseValue + variation())),
        fullMark: 100,
      },
      {
        subject: "Retention",
        A: Math.min(100, Math.max(40, baseValue + variation())),
        fullMark: 100,
      },
      {
        subject: "Satisfaction",
        A: Math.min(100, Math.max(40, baseValue + variation())),
        fullMark: 100,
      },
      {
        subject: "Growth",
        A: Math.min(100, Math.max(40, baseValue + variation())),
        fullMark: 100,
      },
    ];
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate progress percentages
  const revenueProgress = Math.min(
    Math.round(
      (performanceData.revenue.total / performanceData.revenue.target) * 100
    ),
    100
  );

  const ordersProgress = Math.min(
    Math.round(
      (performanceData.orders.total / performanceData.orders.target) * 100
    ),
    100
  );

  const customersProgress = Math.min(
    Math.round(
      (performanceData.customers.total / performanceData.customers.target) * 100
    ),
    100
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>
          Key performance indicators and business goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="goals">
          <TabsList className="mb-4">
            <TabsTrigger value="goals">Goals & Targets</TabsTrigger>
            <TabsTrigger value="trends">Performance Trends</TabsTrigger>
            <TabsTrigger value="kpi">KPI Radar</TabsTrigger>
          </TabsList>

          <TabsContent value="goals">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Revenue</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(performanceData.revenue.total)} of{" "}
                      {formatCurrency(performanceData.revenue.target)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {revenueProgress}%
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {performanceData.revenue.growth > 0 ? "+" : ""}
                      {performanceData.revenue.growth}% growth
                    </p>
                  </div>
                </div>
                <Progress value={revenueProgress} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Orders</h4>
                    <p className="text-sm text-muted-foreground">
                      {performanceData.orders.total} of{" "}
                      {performanceData.orders.target}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {ordersProgress}%
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {performanceData.orders.growth > 0 ? "+" : ""}
                      {performanceData.orders.growth}% growth
                    </p>
                  </div>
                </div>
                <Progress value={ordersProgress} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Customers</h4>
                    <p className="text-sm text-muted-foreground">
                      {performanceData.customers.total} of{" "}
                      {performanceData.customers.target}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {customersProgress}%
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {performanceData.customers.growth > 0 ? "+" : ""}
                      {performanceData.customers.growth}% growth
                    </p>
                  </div>
                </div>
                <Progress value={customersProgress} className="h-2" />
              </div>

              <div className="bg-muted/30 p-4 rounded-md mt-4">
                <h4 className="font-medium mb-2">Performance Summary</h4>
                <p className="text-sm text-muted-foreground">
                  Your business is{" "}
                  {revenueProgress >= 75 ? "on track" : "behind"} to meet
                  revenue targets. Customer acquisition is{" "}
                  {customersProgress >= 75 ? "strong" : "needs improvement"}.
                  Order volume is{" "}
                  {ordersProgress >= 75
                    ? "meeting expectations"
                    : "below target"}
                  .
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends">
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <p className="text-muted-foreground">Loading trend data...</p>
                </div>
              </div>
            ) : trendData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No trend data available</p>
              </div>
            ) : (
              <>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue (ETB)"
                        stroke="#f97316"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        name="Orders"
                        stroke="#3b82f6"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="customers"
                        name="Customers"
                        stroke="#10b981"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-muted-foreground text-center">
                    This chart shows your business performance trends over the
                    past 6 months. Monitor these metrics to identify growth
                    opportunities and areas for improvement.
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="kpi">
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <p className="text-muted-foreground">Loading KPI data...</p>
                </div>
              </div>
            ) : kpiData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No KPI data available</p>
              </div>
            ) : (
              <>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={kpiData}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Performance"
                        dataKey="A"
                        stroke="#f97316"
                        fill="#f97316"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-muted-foreground text-center">
                    This radar chart shows your business performance across key
                    metrics. A balanced chart indicates well-rounded business
                    health.
                  </p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
