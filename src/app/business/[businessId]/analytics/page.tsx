"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Calendar, 
  Users, 
  ShoppingBag, 
  DollarSign,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { appointmentApi } from "@/services/appointment";
import { orderApi } from "@/services/order";
import { serviceApi } from "@/services/service";
import { reviewApi } from "@/services/review";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function BusinessAnalyticsPage({
  params: { businessId },
}: {
  params: { businessId: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch services
        const servicesData = await serviceApi.getBusinessServices(businessId);
        setServices(servicesData);
        
        // Fetch appointments
        const appointmentsData = await appointmentApi.getBusinessAppointments(businessId);
        setAppointments(appointmentsData);
        
        // Fetch orders
        const ordersData = await orderApi.getBusinessOrders(businessId);
        setOrders(ordersData);
        
        // Fetch reviews
        const reviewsData = await reviewApi.getBusinessReviews(businessId);
        setReviews(reviewsData);
        
        // Calculate stats
        const confirmedAppointments = appointmentsData.filter(
          (appointment: any) => appointment.status === "confirmed" || appointment.status === "completed"
        );
        
        const completedOrders = ordersData.filter(
          (order: any) => 
            order.status === "payment_received" || 
            order.status === "processing" || 
            order.status === "shipped" || 
            order.status === "delivered"
        );
        
        const totalRevenue = [
          ...confirmedAppointments.map((a: any) => a.serviceId?.price || 0),
          ...completedOrders.map((o: any) => o.totalAmount || 0),
        ].reduce((sum, price) => sum + price, 0);
        
        const totalRating = reviewsData.reduce((sum: number, review: any) => sum + review.rating, 0);
        const averageRating = reviewsData.length > 0 ? totalRating / reviewsData.length : 0;
        
        setStats({
          totalAppointments: confirmedAppointments.length,
          totalOrders: completedOrders.length,
          totalRevenue,
          averageRating,
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [businessId]);

  // Filter data based on time range
  const filterDataByTimeRange = (data: any[], dateField: string = "createdAt") => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    return data.filter((item) => new Date(item[dateField]) >= startDate);
  };

  // Prepare data for revenue chart
  const prepareRevenueData = () => {
    const filteredAppointments = filterDataByTimeRange(appointments);
    const filteredOrders = filterDataByTimeRange(orders);
    
    let labels: string[] = [];
    let appointmentData: number[] = [];
    let orderData: number[] = [];
    
    if (timeRange === "week") {
      // Daily data for the past week
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 6 + i);
        return days[d.getDay()];
      });
      
      // Initialize data arrays with zeros
      appointmentData = Array(7).fill(0);
      orderData = Array(7).fill(0);
      
      // Fill in appointment data
      filteredAppointments.forEach((appointment) => {
        const date = new Date(appointment.createdAt);
        const dayIndex = (date.getDay() + 7 - new Date().getDay() + 6) % 7;
        if (dayIndex >= 0 && dayIndex < 7) {
          appointmentData[dayIndex] += appointment.serviceId?.price || 0;
        }
      });
      
      // Fill in order data
      filteredOrders.forEach((order) => {
        const date = new Date(order.createdAt);
        const dayIndex = (date.getDay() + 7 - new Date().getDay() + 6) % 7;
        if (dayIndex >= 0 && dayIndex < 7) {
          orderData[dayIndex] += order.totalAmount || 0;
        }
      });
    } else if (timeRange === "month") {
      // Weekly data for the past month
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      appointmentData = Array(4).fill(0);
      orderData = Array(4).fill(0);
      
      // Fill in appointment data
      filteredAppointments.forEach((appointment) => {
        const date = new Date(appointment.createdAt);
        const weekIndex = Math.floor((new Date().getDate() - date.getDate()) / 7);
        if (weekIndex >= 0 && weekIndex < 4) {
          appointmentData[weekIndex] += appointment.serviceId?.price || 0;
        }
      });
      
      // Fill in order data
      filteredOrders.forEach((order) => {
        const date = new Date(order.createdAt);
        const weekIndex = Math.floor((new Date().getDate() - date.getDate()) / 7);
        if (weekIndex >= 0 && weekIndex < 4) {
          orderData[weekIndex] += order.totalAmount || 0;
        }
      });
    } else {
      // Monthly data for the past year
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      labels = months;
      appointmentData = Array(12).fill(0);
      orderData = Array(12).fill(0);
      
      // Fill in appointment data
      filteredAppointments.forEach((appointment) => {
        const date = new Date(appointment.createdAt);
        appointmentData[date.getMonth()] += appointment.serviceId?.price || 0;
      });
      
      // Fill in order data
      filteredOrders.forEach((order) => {
        const date = new Date(order.createdAt);
        orderData[date.getMonth()] += order.totalAmount || 0;
      });
    }
    
    return {
      labels,
      datasets: [
        {
          label: "Appointments",
          data: appointmentData,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.5)",
        },
        {
          label: "Orders",
          data: orderData,
          borderColor: "rgb(249, 115, 22)",
          backgroundColor: "rgba(249, 115, 22, 0.5)",
        },
      ],
    };
  };

  // Prepare data for service popularity chart
  const prepareServicePopularityData = () => {
    const serviceMap = new Map();
    
    // Count appointments per service
    appointments.forEach((appointment) => {
      const serviceId = appointment.serviceId?._id;
      if (serviceId) {
        const serviceName = appointment.serviceId?.name || "Unknown";
        if (serviceMap.has(serviceId)) {
          serviceMap.set(serviceId, {
            name: serviceName,
            count: serviceMap.get(serviceId).count + 1,
          });
        } else {
          serviceMap.set(serviceId, { name: serviceName, count: 1 });
        }
      }
    });
    
    // Count orders per service
    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        const serviceId = item.serviceId;
        const serviceName = item.serviceName || "Unknown";
        if (serviceMap.has(serviceId)) {
          serviceMap.set(serviceId, {
            name: serviceName,
            count: serviceMap.get(serviceId).count + item.quantity,
          });
        } else {
          serviceMap.set(serviceId, { name: serviceName, count: item.quantity });
        }
      });
    });
    
    // Convert map to arrays for chart
    const serviceData = Array.from(serviceMap.values());
    serviceData.sort((a, b) => b.count - a.count);
    
    // Take top 5 services
    const topServices = serviceData.slice(0, 5);
    
    return {
      labels: topServices.map((service) => service.name),
      datasets: [
        {
          data: topServices.map((service) => service.count),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for service type distribution chart
  const prepareServiceTypeData = () => {
    const serviceTypes = {
      appointment: 0,
      product: 0,
      in_person: 0,
    };
    
    services.forEach((service) => {
      if (service.serviceType in serviceTypes) {
        serviceTypes[service.serviceType as keyof typeof serviceTypes]++;
      }
    });
    
    return {
      labels: ["Appointment", "Product", "In-Person"],
      datasets: [
        {
          data: [serviceTypes.appointment, serviceTypes.product, serviceTypes.in_person],
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 206, 86, 0.6)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for ratings chart
  const prepareRatingsData = () => {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingCounts[review.rating as keyof typeof ratingCounts]++;
      }
    });
    
    return {
      labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
      datasets: [
        {
          label: "Number of Reviews",
          data: [ratingCounts[1], ratingCounts[2], ratingCounts[3], ratingCounts[4], ratingCounts[5]],
          backgroundColor: "rgba(249, 115, 22, 0.6)",
          borderColor: "rgba(249, 115, 22, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="year">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Appointments</p>
                <h3 className="text-2xl font-bold">{stats.totalAppointments}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-4">
                <ShoppingBag className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Orders</p>
                <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Revenue</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Rating</p>
                <h3 className="text-2xl font-bold">{stats.averageRating.toFixed(1)}/5</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue" className="flex items-center">
            <LineChart className="h-4 w-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="popularity" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Service Popularity
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center">
            <PieChart className="h-4 w-4 mr-2" />
            Service Types
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Ratings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Line 
                  data={prepareRevenueData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Revenue (ETB)',
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="popularity">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar 
                  data={prepareServicePopularityData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                      x: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Bookings/Orders',
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Service Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex justify-center">
                <div className="w-1/2">
                  <Pie 
                    data={prepareServiceTypeData()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar 
                  data={prepareRatingsData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Reviews',
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
