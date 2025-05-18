"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { adminRevenueApi } from "@/services/adminRevenueApi";
// Define types
interface PlatformRevenue {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  monthlyRevenueData: {
    month: string;
    revenue: number;
  }[];
  topBusinesses: {
    businessId: string;
    businessName: string;
    total: number;
    count: number;
  }[];
}

interface FeeTransaction {
  _id: string;
  paymentId: {
    _id: string;
    amount: number;
    status: string;
  };
  businessId: {
    _id: string;
    name: string;
  };
  originalAmount: number;
  feePercentage: number;
  feeAmount: number;
  createdAt: string;
}

// Define table columns
const columns: ColumnDef<FeeTransaction>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => dayjs(row.original.createdAt).format("MMM DD, YYYY"),
  },
  {
    accessorKey: "businessId.name",
    header: "Business",
  },
  {
    accessorKey: "originalAmount",
    header: "Transaction Amount",
    cell: ({ row }) => `ETB ${row.original.originalAmount.toFixed(2)}`,
  },
  {
    accessorKey: "feePercentage",
    header: "Fee %",
    cell: ({ row }) => `${row.original.feePercentage}%`,
  },
  {
    accessorKey: "feeAmount",
    header: "Platform Fee",
    cell: ({ row }) => `ETB ${row.original.feeAmount.toFixed(2)}`,
  },
];

export default function AdminRevenuePage() {
  const params = useParams();
  const adminId = params.adminId as string;

  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<PlatformRevenue | null>(null);
  const [transactions, setTransactions] = useState<FeeTransaction[]>([]);
  const [dateRange, setDateRange] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const data = await adminRevenueApi.getPlatformRevenue();
        setRevenueData(data);

        // Also fetch transactions
        const transactionsData =
          await adminRevenueApi.getPlatformFeeTransactions({
            page: 1,
            limit: 10,
            startDate: dateRange?.from
              ? dayjs(dateRange.from).format("YYYY-MM-DD")
              : undefined,
            endDate: dateRange?.to
              ? dayjs(dateRange.to).format("YYYY-MM-DD")
              : undefined,
          });
        setTransactions(transactionsData.transactions);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [dateRange]);

  const handleDateRangeChange = (
    range: { from: Date; to: Date } | undefined
  ) => {
    setDateRange(range);
  };

  const handleExportData = async () => {
    try {
      // Implement export functionality
      alert("Export functionality will be implemented");
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Platform Revenue</h1>
          <p className="text-muted-foreground">
            Monitor platform fees and revenue statistics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DatePickerWithRange onChange={handleDateRangeChange} />
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="businesses">Top Businesses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Revenue Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ETB {revenueData?.totalRevenue.toFixed(2) || "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Lifetime platform fees
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ETB {revenueData?.todayRevenue.toFixed(2) || "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +
                      {(
                        ((revenueData?.todayRevenue || 0) /
                          (revenueData?.totalRevenue || 1)) *
                        100
                      ).toFixed(1)}
                      % of total
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ETB {revenueData?.weekRevenue.toFixed(2) || "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +
                      {(
                        ((revenueData?.weekRevenue || 0) /
                          (revenueData?.totalRevenue || 1)) *
                        100
                      ).toFixed(1)}
                      % of total
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ETB {revenueData?.monthRevenue.toFixed(2) || "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +
                      {(
                        ((revenueData?.monthRevenue || 0) /
                          (revenueData?.totalRevenue || 1)) *
                        100
                      ).toFixed(1)}
                      % of total
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData?.monthlyRevenueData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `ETB ${Number(value).toFixed(2)}`,
                        "Revenue",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      fill="#f97316"
                      name="Platform Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Fee Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <DataTable columns={columns} data={transactions} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="businesses">
          <Card>
            <CardHeader>
              <CardTitle>Top Revenue Generating Businesses</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <div className="space-y-8">
                  {revenueData?.topBusinesses.map((business) => (
                    <div
                      key={business.businessId}
                      className="flex items-center"
                    >
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">
                          {business.businessName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {business.count} transactions
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        ETB {business.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
