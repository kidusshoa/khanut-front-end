import React from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays, subMonths } from "date-fns";

// TypeScript interfaces
interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  dateRange: "today" | "week" | "month" | "year";
}

export function RevenueChart({ dateRange }: RevenueChartProps): React.ReactNode {
  // Generate mock data based on date range
  const generateMockData = (): RevenueData[] => {
    const data: RevenueData[] = [];
    
    if (dateRange === "today") {
      // Hourly data for today
      for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}:00` : `${i}:00`;
        data.push({
          date: hour,
          revenue: Math.floor(Math.random() * 500) + 50,
          orders: Math.floor(Math.random() * 5) + 1,
        });
      }
    } else if (dateRange === "week") {
      // Daily data for the past week
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        data.push({
          date: format(date, "EEE"),
          revenue: Math.floor(Math.random() * 2000) + 200,
          orders: Math.floor(Math.random() * 15) + 3,
        });
      }
    } else if (dateRange === "month") {
      // Weekly data for the past month
      for (let i = 0; i < 4; i++) {
        const weekStart = subDays(new Date(), i * 7 + 6);
        const weekEnd = subDays(new Date(), i * 7);
        data.push({
          date: `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`,
          revenue: Math.floor(Math.random() * 8000) + 1000,
          orders: Math.floor(Math.random() * 50) + 10,
        });
      }
    } else if (dateRange === "year") {
      // Monthly data for the past year
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        data.push({
          date: format(date, "MMM"),
          revenue: Math.floor(Math.random() * 25000) + 5000,
          orders: Math.floor(Math.random() * 200) + 50,
        });
      }
    }
    
    return data;
  };
  
  const data = generateMockData();
  
  // Format currency for tooltip
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
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
          <p className="text-sm text-blue-600">
            Orders: {payload[1].value}
          </p>
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
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
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
      </CardContent>
    </Card>
  );
}
