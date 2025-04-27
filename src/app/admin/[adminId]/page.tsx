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

// Mock data for charts
const weeklyData = [
  { name: "Mon", businesses: 4, users: 7 },
  { name: "Tue", businesses: 3, users: 5 },
  { name: "Wed", businesses: 5, users: 9 },
  { name: "Thu", businesses: 7, users: 12 },
  { name: "Fri", businesses: 2, users: 8 },
  { name: "Sat", businesses: 6, users: 10 },
  { name: "Sun", businesses: 8, users: 15 },
];

const monthlyData = [
  { name: "Jan", businesses: 20, users: 45 },
  { name: "Feb", businesses: 15, users: 30 },
  { name: "Mar", businesses: 25, users: 50 },
  { name: "Apr", businesses: 30, users: 65 },
  { name: "May", businesses: 18, users: 40 },
  { name: "Jun", businesses: 32, users: 70 },
];

// Activity feed data
const activities = [
  {
    id: 1,
    type: "business_registration",
    message: "User JohnDoe registered a new business: Tech Gurus",
    time: "2 hours ago",
    icon: Building2,
    iconColor: "text-blue-500 bg-blue-100",
  },
  {
    id: 2,
    type: "review",
    message: "Review submitted for Local Bites by user SaraA",
    time: "5 hours ago",
    icon: Star,
    iconColor: "text-yellow-500 bg-yellow-100",
  },
  {
    id: 3,
    type: "approval",
    message: "Business Fast Clean approved by admin",
    time: "Yesterday",
    icon: CheckCircle2,
    iconColor: "text-green-500 bg-green-100",
  },
  {
    id: 4,
    type: "user_registration",
    message: "New user MikeT joined the platform",
    time: "Yesterday",
    icon: User,
    iconColor: "text-purple-500 bg-purple-100",
  },
  {
    id: 5,
    type: "alert",
    message: "Business Speedy Delivery reported for policy violation",
    time: "2 days ago",
    icon: AlertCircle,
    iconColor: "text-red-500 bg-red-100",
  },
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState(weeklyData);
  const [chartPeriod, setChartPeriod] = useState("weekly");

  // Handle hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
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
  ];

  if (!mounted) {
    return null; // Prevent hydration issues
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
                onValueChange={(value) => {
                  setChartPeriod(value);
                  setChartData(value === "weekly" ? weeklyData : monthlyData);
                }}
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
