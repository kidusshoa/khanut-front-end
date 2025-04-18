"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  ShoppingBag,
  Loader2,
  Building,
  Clock,
  MapPin,
  Truck,
  Calendar,
} from "lucide-react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import { orderApi } from "@/services/order";
import { toast } from "react-hot-toast";

interface OrdersContentProps {
  customerId: string;
}

export default function OrdersContent({ customerId }: OrdersContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("all");

  // Check if user is authorized
  if (session?.user?.id !== customerId) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to view this page.
        </p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  // Fetch orders
  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["customerOrders", customerId, activeTab],
    queryFn: async () => {
      const params: any = {};
      if (activeTab !== "all") {
        params.status = activeTab;
      }
      return orderApi.getCustomerOrders(customerId, params);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_payment":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending Payment
          </Badge>
        );
      case "payment_received":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Payment Received
          </Badge>
        );
      case "processing":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Processing
          </Badge>
        );
      case "shipped":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Cancelled
          </Badge>
        );
      case "refunded":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  return (
    <CustomerDashboardLayout customerId={customerId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Orders</h1>
          <p className="text-muted-foreground">
            View and track your order history
          </p>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending_payment">Pending Payment</TabsTrigger>
            <TabsTrigger value="payment_received">Payment Received</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <div
                    key={order._id}
                    className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              Order #{order._id.slice(-6).toUpperCase()}
                            </h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Placed on {dayjs(order.createdAt).format("MMM D, YYYY")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg">
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length}{" "}
                            {order.items.length === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-4">
                        {order.items.map((item: any) => (
                          <div
                            key={item._id}
                            className="flex items-start justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 rounded-md overflow-hidden bg-muted">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {item.businessName}
                                </p>
                                <p className="text-sm mt-1">
                                  {formatCurrency(item.price)} x {item.quantity}
                                </p>
                              </div>
                            </div>
                            <p className="font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.push(`/customer/${customerId}/orders/${order._id}`)
                          }
                        >
                          View Details
                        </Button>
                        {order.status === "delivered" && (
                          <Button className="bg-orange-600 hover:bg-orange-700">
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">No orders yet</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === "all"
                    ? "You haven't placed any orders yet."
                    : `You don't have any ${activeTab} orders.`}
                </p>
                <Button
                  onClick={() =>
                    router.push(`/customer/${customerId}/services?type=product`)
                  }
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Shop Now
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CustomerDashboardLayout>
  );
}
