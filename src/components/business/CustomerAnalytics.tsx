import React, { useEffect, useState } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { getCustomerAnalytics } from "@/services/businessAnalyticsApi";
import { useParams } from "next/navigation";

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

export function CustomerAnalytics({
  customerData,
}: CustomerAnalyticsProps): React.ReactNode {
  const params = useParams();
  const businessId = params.businessId as string;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sources, setSources] = useState<CustomerSourceData[]>([]);
  const [retention, setRetention] = useState<CustomerRetentionData[]>([]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      setIsLoading(true);
      try {
        const data = await getCustomerAnalytics(businessId);
        setSources(data.sources || []);
        setRetention(data.retention || []);
      } catch (error) {
        console.error("Failed to fetch customer analytics data:", error);
        // Set default values on error
        setSources([]);
        setRetention([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [businessId]);

  // Customer type breakdown data for pie chart
  const customerTypeData = [
    { name: "New Customers", value: customerData.new },
    { name: "Returning Customers", value: customerData.returning },
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

  // Loading component
  const LoadingState = () => (
    <div className="h-[300px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-muted-foreground">Loading customer data...</p>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = (message: string) => (
    <div className="h-[300px] flex items-center justify-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

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
            {customerData.total === 0 ? (
              EmptyState("No customer data available")
            ) : (
              <>
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
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {customerTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      New Customers
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {customerData.new}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {((customerData.new / customerData.total) * 100).toFixed(
                        1
                      )}
                      % of total
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Returning Customers
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {customerData.returning}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (customerData.returning / customerData.total) *
                        100
                      ).toFixed(1)}
                      % of total
                    </p>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="sources">
            {isLoading ? (
              <LoadingState />
            ) : sources.length === 0 ? (
              EmptyState("No customer source data available")
            ) : (
              <>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sources}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {sources.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
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
                    Direct traffic represents customers who directly visit your
                    business page.
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="retention">
            {isLoading ? (
              <LoadingState />
            ) : retention.length === 0 ? (
              EmptyState("No customer retention data available")
            ) : (
              <>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={retention}
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
                      <Bar
                        dataKey="returning"
                        name="Returning Customers"
                        fill="#3b82f6"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-muted-foreground text-center">
                    This chart shows the trend of new vs. returning customers
                    over time. A growing number of returning customers indicates
                    good customer retention.
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
