"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Calendar,
  ShoppingBag,
  Heart,
  MapPin,
  ArrowRight,
  Star,
  Loader2,
  Utensils,
  Scissors,
  Car,
  Laptop,
  Home,
  Shirt,
  Book,
  Coffee,
  Store,
  Briefcase,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { appointmentApi } from "@/services/appointment";
import { orderApi } from "@/services/order";
import dayjs from "dayjs";
import Link from "next/link";
import SearchBar from "./SearchBar";

// Import dashboard API
import { dashboardApi } from "@/services/dashboard";

interface CustomerDashboardContentProps {
  customerId: string;
}

export default function CustomerDashboardContent({
  customerId,
}: CustomerDashboardContentProps) {
  // Get session
  const { data: session } = useSession();

  // Fetch dashboard stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["customerStats", customerId],
    queryFn: dashboardApi.getDashboardStats,
    enabled: !!session?.user?.id,
  });

  // Fetch upcoming appointments
  const { data: appointments, isLoading: isAppointmentsLoading } = useQuery({
    queryKey: ["customerAppointments", customerId],
    queryFn: () =>
      appointmentApi.getCustomerAppointments(customerId, {
        status: "confirmed",
        limit: 3,
      }),
  });

  // Fetch recent orders
  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["customerOrders", customerId],
    queryFn: () => orderApi.getCustomerOrders(customerId, { limit: 3 }),
  });

  // State for recommendation method
  const [recommendationMethod, setRecommendationMethod] =
    useState<string>("hybrid");

  // Fetch recommended businesses with error handling
  const {
    data: recommendedBusinesses,
    isLoading: isServicesLoading, // Keep the same variable name for UI compatibility
    refetch: refetchRecommendations,
  } = useQuery({
    queryKey: ["recommendedBusinesses", customerId, recommendationMethod],
    queryFn: () =>
      dashboardApi.getRecommendedBusinesses(4, recommendationMethod as any),
    enabled: !!session?.user?.id,
    retry: 1, // Only retry once to avoid infinite loops
  });

  // Fetch top-rated businesses as fallback when recommendations are empty
  const { data: topRatedBusinesses, isLoading: isTopRatedLoading } = useQuery({
    queryKey: ["topRatedBusinesses"],
    queryFn: () => dashboardApi.getTopRatedBusinesses(4),
    enabled:
      !!session?.user?.id &&
      (!recommendedBusinesses || recommendedBusinesses.length === 0),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "processing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <CustomerDashboardLayout customerId={customerId}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your activity and recommendations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchBar customerId={customerId} />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Appointments Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.totalAppointments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.upcomingAppointments || 0} upcoming
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Orders Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.totalOrders || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.pendingOrders || 0} pending
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Favorites Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.favoriteServices || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Saved businesses
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Nearby Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nearby</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15+</div>
              <p className="text-xs text-muted-foreground">
                Businesses in your area
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Appointments */}
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled services</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href={`/customer/${customerId}/appointments`}
                  className="flex items-center gap-1"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isAppointmentsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : appointments && appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <div
                      key={appointment._id}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {appointment.serviceId.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getStatusColor(appointment.status)}
                            variant="outline"
                          >
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {dayjs(appointment.date).format("MMM D, YYYY")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.startTime} - {appointment.endTime}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium mb-1">
                    No upcoming appointments
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You don't have any scheduled appointments.
                  </p>
                  <Button asChild className="bg-orange-600 hover:bg-orange-700">
                    <Link href={`/customer/${customerId}/services`}>
                      Book a Service
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest purchases</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href={`/customer/${customerId}/orders`}
                  className="flex items-center gap-1"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isOrdersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getStatusColor(order.status)}
                            variant="outline"
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {dayjs(order.createdAt).format("MMM D, YYYY")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium mb-1">No orders yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You haven't placed any orders yet.
                  </p>
                  <Button asChild className="bg-orange-600 hover:bg-orange-700">
                    <Link
                      href={`/customer/${customerId}/services?type=product`}
                    >
                      Shop Now
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Featured Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Featured Categories
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href={`/customer/${customerId}/search`}
                className="flex items-center gap-1"
              >
                Browse all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              {
                name: "Restaurant",
                icon: <Utensils className="h-6 w-6" />,
                color:
                  "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
              },
              {
                name: "Beauty",
                icon: <Scissors className="h-6 w-6" />,
                color:
                  "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
              },
              {
                name: "Electronics",
                icon: <Laptop className="h-6 w-6" />,
                color:
                  "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
              },
              {
                name: "Automotive",
                icon: <Car className="h-6 w-6" />,
                color:
                  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
              },
              {
                name: "Home",
                icon: <Home className="h-6 w-6" />,
                color:
                  "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
              },
              {
                name: "Fashion",
                icon: <Shirt className="h-6 w-6" />,
                color:
                  "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
              },
              {
                name: "Books",
                icon: <Book className="h-6 w-6" />,
                color:
                  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
              },
              {
                name: "Cafe",
                icon: <Coffee className="h-6 w-6" />,
                color:
                  "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
              },
              {
                name: "Retail",
                icon: <Store className="h-6 w-6" />,
                color:
                  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
              },
              {
                name: "Professional",
                icon: <Briefcase className="h-6 w-6" />,
                color:
                  "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400",
              },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/customer/${customerId}/search?category=${encodeURIComponent(
                  category.name
                )}`}
                className="group"
              >
                <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card hover:shadow-md transition-all text-center h-full">
                  <div
                    className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    {category.icon}
                  </div>
                  <span className="font-medium text-sm group-hover:text-orange-600 transition-colors">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recommended Businesses */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h2 className="text-2xl font-bold tracking-tight">
                Recommended for you
              </h2>
              <div className="flex items-center space-x-2">
                <select
                  value={recommendationMethod}
                  onChange={(e) => {
                    setRecommendationMethod(e.target.value);
                    refetchRecommendations();
                  }}
                  className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="hybrid">Hybrid Recommendations</option>
                  <option value="collaborative">Based on Similar Users</option>
                  <option value="content">Based on Your Interests</option>
                  <option value="top-rated">Top-Rated Businesses</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchRecommendations()}
                  className="h-8 w-8 p-0"
                  title="Refresh recommendations"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href={`/customer/${customerId}/search`}
                className="flex items-center gap-1"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isServicesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : recommendedBusinesses && recommendedBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommendedBusinesses.map((business: any) => (
                <Link
                  key={business._id}
                  href={`/customer/${customerId}/businesses/${business._id}`}
                  className="group"
                >
                  <div className="rounded-lg overflow-hidden border border-border bg-card transition-all hover:shadow-md">
                    <div className="aspect-video relative overflow-hidden">
                      {business.coverImage ? (
                        <img
                          src={business.coverImage}
                          alt={business.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : business.logo ? (
                        <img
                          src={business.logo}
                          alt={business.name}
                          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Store className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {business.category && (
                        <Badge className="absolute top-2 right-2 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {business.category}
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {business.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {business.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                          <span className="text-xs text-muted-foreground">
                            {business.address?.city || "Location"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {business.predictionScore ? (
                            <div
                              className="flex items-center"
                              title={`Prediction score: ${business.predictionScore}`}
                            >
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm ml-1">
                                {typeof business.predictionScore === "number"
                                  ? business.predictionScore.toFixed(1)
                                  : "4.5"}
                              </span>
                            </div>
                          ) : business.avgRating ? (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm ml-1">
                                {business.avgRating.toFixed(1)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm ml-1">4.5</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : isTopRatedLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : topRatedBusinesses && topRatedBusinesses.length > 0 ? (
            <div>
              <div className="mb-4 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md">
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  <span className="font-medium">Top-rated businesses</span> -
                  We're showing you the highest-rated businesses while we learn
                  your preferences.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {topRatedBusinesses.map((business: any) => (
                  <Link
                    key={business._id}
                    href={`/customer/${customerId}/businesses/${business._id}`}
                    className="group"
                  >
                    <div className="rounded-lg overflow-hidden border border-border bg-card transition-all hover:shadow-md">
                      <div className="aspect-video relative overflow-hidden">
                        {business.coverImage ? (
                          <img
                            src={business.coverImage}
                            alt={business.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : business.logo ? (
                          <img
                            src={business.logo}
                            alt={business.name}
                            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Store className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {business.category && (
                          <Badge className="absolute top-2 right-2 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {business.category}
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium line-clamp-1 group-hover:text-orange-600 transition-colors">
                          {business.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {business.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-xs text-muted-foreground">
                              {business.address?.city || "Location"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            {business.predictionScore ? (
                              <div
                                className="flex items-center"
                                title={`Rating: ${business.predictionScore}`}
                              >
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm ml-1">
                                  {typeof business.predictionScore === "number"
                                    ? business.predictionScore.toFixed(1)
                                    : "4.5"}
                                </span>
                              </div>
                            ) : business.avgRating ? (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm ml-1">
                                  {business.avgRating.toFixed(1)}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm ml-1">4.5</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">
                No recommendations yet
              </h3>
              <p className="text-muted-foreground mb-4">
                We'll show personalized recommendations as you use the platform.
              </p>
              <Button asChild className="bg-orange-600 hover:bg-orange-700">
                <Link href={`/customer/${customerId}/search`}>
                  Browse Businesses
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}
