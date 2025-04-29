import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// TypeScript interfaces
interface CustomerData {
  total: number;
  new: number;
  returning: number;
}

interface CustomerSourceData {
  name: string;
  value: number;
}

interface CustomerRetentionData {
  month: string;
  new: number;
  returning: number;
}

interface CustomerAnalyticsProps {
  customerData: CustomerData;
}

export function CustomerAnalytics({ customerData }: CustomerAnalyticsProps): React.ReactNode {
  // Customer type breakdown data for pie chart
  const customerTypeData = [
    { name: "New Customers", value: customerData.new },
    { name: "Returning Customers", value: customerData.returning },
  ];
  
  // Customer source data for pie chart (mock data)
  const customerSourceData: CustomerSourceData[] = [
    { name: "Direct", value: Math.floor(customerData.total * 0.4) },
    { name: "Search", value: Math.floor(customerData.total * 0.25) },
    { name: "Social", value: Math.floor(customerData.total * 0.2) },
    { name: "Referral", value: Math.floor(customerData.total * 0.15) },
  ];
  
  // Customer retention data for bar chart (mock data)
  const customerRetentionData: CustomerRetentionData[] = [
    { month: "Jan", new: 12, returning: 8 },
    { month: "Feb", new: 15, returning: 10 },
    { month: "Mar", new: 18, returning: 12 },
    { month: "Apr", new: 14, returning: 15 },
    { month: "May", new: 10, returning: 18 },
    { month: "Jun", new: 8, returning: 20 },
  ];
  
  // Colors for pie charts
  const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6"];
  
  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">
            Count: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm">
            Percentage:{" "}
            <span className="font-medium">
              {((payload[0].value / customerData.total) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Analytics</CardTitle>
        <CardDescription>
          Customer acquisition and retention metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="breakdown">
          <TabsList className="mb-4">
            <TabsTrigger value="breakdown">Customer Breakdown</TabsTrigger>
            <TabsTrigger value="sources">Customer Sources</TabsTrigger>
            <TabsTrigger value="retention">Customer Retention</TabsTrigger>
          </TabsList>
          
          <TabsContent value="breakdown">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {customerTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-orange-50 p-4 rounded-md">
                <p className="text-sm text-muted-foreground">New Customers</p>
                <p className="text-2xl font-bold text-orange-600">{customerData.new}</p>
                <p className="text-xs text-muted-foreground">
                  {((customerData.new / customerData.total) * 100).toFixed(1)}% of total
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-muted-foreground">Returning Customers</p>
                <p className="text-2xl font-bold text-blue-600">{customerData.returning}</p>
                <p className="text-xs text-muted-foreground">
                  {((customerData.returning / customerData.total) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sources">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {customerSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground text-center">
                This chart shows where your customers are coming from.
                Direct traffic represents customers who directly visit your business page.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="retention">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={customerRetentionData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="new" name="New Customers" fill="#f97316" />
                  <Bar dataKey="returning" name="Returning Customers" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground text-center">
                This chart shows the trend of new vs. returning customers over time.
                A growing number of returning customers indicates good customer retention.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
