import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getRevenueChartData } from "@/services/businessAnalyticsApi";
import { useParams } from "next/navigation";

// TypeScript interfaces
interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  dateRange: "today" | "week" | "month" | "year";
}

export function RevenueChart({
  dateRange,
}: RevenueChartProps): React.ReactNode {
  const params = useParams();
  const businessId = params.businessId as string;
  const [chartData, setChartData] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setIsLoading(true);
      try {
        const response = await getRevenueChartData(businessId, dateRange);

        // Transform the data to match our component's expected format
        const transformedData = response.labels.map((label, index) => ({
          date: label,
          revenue: response.datasets[0].data[index] || 0,
          orders: response.datasets[1]
            ? response.datasets[1].data[index] || 0
            : 0,
        }));

        setChartData(transformedData);
      } catch (error) {
        console.error("Failed to fetch revenue data:", error);
        // Set empty data on error
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueData();
  }, [businessId, dateRange]);

  // Format currency for tooltip
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-orange-600">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-blue-600">Orders: {payload[1].value}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>
          {dateRange === "today" && "Today's revenue by hour"}
          {dateRange === "week" && "This week's daily revenue"}
          {dateRange === "month" && "This month's weekly revenue"}
          {dateRange === "year" && "This year's monthly revenue"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-muted-foreground">Loading revenue data...</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No revenue data available</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                  tickMargin={10}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (ETB)"
                  stroke="#f97316"
                  fill="#fdba74"
                  fillOpacity={0.3}
                  activeDot={{ r: 8 }}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
