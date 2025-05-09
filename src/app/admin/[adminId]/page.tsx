"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Clock,
  Star,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  User,
  Store,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  adminDashboardApi,
  ChartDataPoint,
  ActivityLog,
} from "@/services/adminDashboard";
import Cookies from "js-cookie";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Define activity icon mapping
type ActivityType =
  | "business_registration"
  | "review"
  | "approval"
  | "user_registration"
  | "alert"
  | string;

interface ActivityIconMapping {
  [key: string]: {
    icon: React.ElementType;
    iconColor: string;
  };
}

const activityIconMapping: ActivityIconMapping = {
  business_registration: {
    icon: Building2,
    iconColor: "text-blue-500 bg-blue-100",
  },
  review: {
    icon: Star,
    iconColor: "text-yellow-500 bg-yellow-100",
  },
  approval: {
    icon: CheckCircle2,
    iconColor: "text-green-500 bg-green-100",
  },
  user_registration: {
    icon: User,
    iconColor: "text-purple-500 bg-purple-100",
  },
  alert: {
    icon: AlertCircle,
    iconColor: "text-red-500 bg-red-100",
  },
  default: {
    icon: AlertCircle,
    iconColor: "text-gray-500 bg-gray-100",
  },
};

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  change: string;
  trend: "up" | "down";
}

interface FormattedActivity {
  id: string;
  type: ActivityType;
  message: string;
  time: string;
  icon: React.ElementType;
  iconColor: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dashboard data
  const [stats, setStats] = useState<StatItem[]>([]);
  const [activities, setActivities] = useState<FormattedActivity[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartPeriod, setChartPeriod] = useState<"weekly" | "monthly">(
    "weekly"
  );
  const [weeklyChartData, setWeeklyChartData] = useState<ChartDataPoint[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<ChartDataPoint[]>(
    []
  );

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const token = Cookies.get("client-token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Fetch dashboard stats
      const dashboardStats = await adminDashboardApi.getDashboardStats();

      // Fetch report data for charts
      const reportData = await adminDashboardApi.getReportData();

      // Get weekly chart data
      const weeklyData = await adminDashboardApi.getWeeklyChartData();

      // Convert monthly data to chart format
      const monthlyData = adminDashboardApi.convertToChartData(
        reportData.monthlyUsers,
        reportData.monthlyBusinesses
      );

      // Set chart data based on selected period
      setWeeklyChartData(weeklyData);
      setMonthlyChartData(monthlyData);
      setChartData(chartPeriod === "weekly" ? weeklyData : monthlyData);

      // Format activities
      const formattedActivities = formatActivities(
        dashboardStats.recentActivity
      );
      setActivities(formattedActivities);

      // Create stats array
      const statsArray: StatItem[] = [
        {
          label: "Total Businesses",
          value: reportData.totalBusinesses,
          icon: Building2,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          change: "+12%", // This would ideally come from the API
          trend: "up",
        },
        {
          label: "Total Users",
          value: reportData.totalUsers,
          icon: Users,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          change: "+8%", // This would ideally come from the API
          trend: "up",
        },
        {
          label: "Pending Approvals",
          value: reportData.pendingApprovals,
          icon: Clock,
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          change: `-${reportData.pendingApprovals}`, // This would ideally come from the API
          trend: "down",
        },
        {
          label: "Reviews Awaiting",
          value: reportData.pendingReviews,
          icon: Star,
          color: "text-green-600",
          bgColor: "bg-green-50",
          change: `+${reportData.pendingReviews}`, // This would ideally come from the API
          trend: "up",
        },
      ];

      setStats(statsArray);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);

      // Use mock data as fallback
      setStats([
        {
          label: "Total Businesses",
          value: 120,
          icon: Building2,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          change: "+12%",
          trend: "up",
        },
        {
          label: "Total Users",
          value: 350,
          icon: Users,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          change: "+8%",
          trend: "up",
        },
        {
          label: "Pending Approvals",
          value: 12,
          icon: Clock,
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          change: "-3",
          trend: "down",
        },
        {
          label: "Reviews Awaiting",
          value: 8,
          icon: Star,
          color: "text-green-600",
          bgColor: "bg-green-50",
          change: "+2",
          trend: "up",
        },
      ]);
    }
  };

  // Format activities from API response
  const formatActivities = (
    activityLogs: ActivityLog[]
  ): FormattedActivity[] => {
    return activityLogs.map((log) => {
      // Determine activity type from message
      let type: ActivityType = "default";

      if (log.message.includes("registered a new business")) {
        type = "business_registration";
      } else if (log.message.includes("review")) {
        type = "review";
      } else if (log.message.includes("approved")) {
        type = "approval";
      } else if (log.message.includes("joined")) {
        type = "user_registration";
      } else if (
        log.message.includes("reported") ||
        log.message.includes("violation")
      ) {
        type = "alert";
      }

      // Use the type from the log if available
      if (log.type && activityIconMapping[log.type]) {
        type = log.type;
      }

      // Get icon and color from mapping
      const { icon, iconColor } =
        activityIconMapping[type] || activityIconMapping.default;

      return {
        id: log._id,
        type,
        message: log.message,
        time: dayjs(log.createdAt).fromNow(),
        icon,
        iconColor,
      };
    });
  };

  // Handle hydration issues and fetch data
  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, [router]);

  // Handle chart period change
  const handleChartPeriodChange = (value: "weekly" | "monthly") => {
    setChartPeriod(value);
    setChartData(value === "weekly" ? weeklyChartData : monthlyChartData);
  };

  if (!mounted) {
    return null; // Prevent hydration issues
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
          <p className="text-lg font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back to your admin dashboard.
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 text-red-600" />
            <div>
              <h3 className="font-medium">Error loading dashboard data</h3>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to your admin dashboard.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Calendar className="h-4 w-4" />
            <span>June 2023</span>
          </Button>
          <Button className="gap-1 bg-orange-600 hover:bg-orange-700">
            <BarChart3 className="h-4 w-4" />
            <span>View Reports</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs mt-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-red-500 mr-1 rotate-180" />
                  )}
                  <span
                    className={
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Growth Overview</CardTitle>
              <Tabs
                defaultValue="weekly"
                value={chartPeriod}
                onValueChange={(value) =>
                  handleChartPeriodChange(value as "weekly" | "monthly")
                }
                className="w-[200px]"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription>
              New businesses and users over time
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    stroke="hsl(var(--foreground))"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    stroke="hsl(var(--foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="businesses"
                    fill="hsl(var(--accent-main))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="users"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <span>View all</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Latest actions and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 last:pb-0 last:border-0 border-b border-border"
                >
                  <div className={`p-2 rounded-full ${activity.iconColor}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <p className="text-xs text-muted-foreground">
              Showing 5 of 24 activities
            </p>
            <Button variant="outline" size="sm" className="gap-1">
              <Store className="h-4 w-4" />
              <span>Business Activity</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
