"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Search,
  Package,
  AlertCircle,
  ArrowUpDown,
  ArrowLeft,
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderDetailsModal } from "@/components/business/OrderDetailsModal";
import { UpdateOrderStatusModal } from "./../../../../components/business/UpdateOrderStatusModal";
import { getBusinessOrders, updateOrderStatus } from "@/services/orderApi";
import { getBusinessDetails } from "@/services/businessApi";

// TypeScript interfaces
interface Order {
  _id: string;
  orderNumber: string; // Added to match OrderDetailsModal
  customerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  businessId: string;
  items: Array<{
    serviceId: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status:
    | "pending_payment"
    | "payment_received"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface OrdersContentProps {
  businessId: string;
}

export default function OrdersContent({ businessId }: OrdersContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Fetch business details
  const {
    data: business,
    isLoading: isBusinessLoading,
    error: businessError,
  } = useQuery({
    queryKey: ["businessDetails", businessId],
    queryFn: () => getBusinessDetails(businessId),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch orders with search and filter options
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    refetch,
    error: ordersError,
  } = useQuery({
    queryKey: ["businessOrders", businessId, activeTab],
    queryFn: async () => {
      // Get orders from API
      const allOrders = await getBusinessOrders(businessId, {
        status: activeTab !== "all" ? activeTab : undefined,
      });

      // Add orderNumber field if not present
      return allOrders.map((order: any) => ({
        ...order,
        orderNumber: order.orderNumber || order._id.slice(-6).toUpperCase(),
      }));
    },
    retry: 1,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Handle order status update
  const handleUpdateStatus = async (
    orderId: string,
    status: string
  ): Promise<void> => {
    try {
      await updateOrderStatus(orderId, status);
      toast({
        title: "Status Updated",
        description: `Order status has been updated to ${status}.`,
      });
      refetch();
      setIsStatusModalOpen(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  // Handle view order details
  const handleViewDetails = (order: Order): void => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  // Handle update order status
  const handleOpenStatusModal = (order: Order): void => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status: string): React.ReactNode => {
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
            className="bg-purple-50 text-purple-700 border-purple-200"
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
            className="bg-indigo-50 text-indigo-700 border-indigo-200"
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
            className="bg-orange-50 text-orange-700 border-orange-200"
          >
            Refunded
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            {status
              .replace(/_/g, " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </Badge>
        );
    }
  };

  // Get payment status badge
  const getPaymentBadge = (status: string): React.ReactNode => {
    switch (status) {
      case "paid":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Failed
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
    }
  };

  // Filter and sort orders
  const filteredOrders = [...orders]
    .filter((order: Order) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        order._id.toLowerCase().includes(searchLower) ||
        order.customerId.name.toLowerCase().includes(searchLower) ||
        order.customerId.email.toLowerCase().includes(searchLower) ||
        order.items.some((item) =>
          item.serviceId.name.toLowerCase().includes(searchLower)
        )
      );
    })
    .filter((order) => {
      if (activeTab === "all") return true;
      return order.status === activeTab;
    })
    .sort((a: Order, b: Order) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "amount") {
        return sortOrder === "asc"
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount;
      } else if (sortBy === "customer") {
        return sortOrder === "asc"
          ? a.customerId.name.localeCompare(b.customerId.name)
          : b.customerId.name.localeCompare(a.customerId.name);
      }
      return 0;
    });

  // Define table columns
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "_id",
      header: "Order ID",
      cell: ({ row }) => (
        <div className="font-medium">
          #{row.original._id.slice(-6).toUpperCase()}
        </div>
      ),
    },
    {
      accessorKey: "customerId",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            if (sortBy === "customer") {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
              setSortBy("customer");
              setSortOrder("asc");
            }
          }}
          className="p-0 hover:bg-transparent"
        >
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const customer = row.original.customerId;
        return (
          <div>
            <div className="font-medium">{customer.name}</div>
            <div className="text-xs text-muted-foreground">
              {customer.email}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => {
        const items = row.original.items;
        return (
          <div>
            <div className="font-medium">{items.length} item(s)</div>
            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
              {items.map((item) => item.serviceId.name).join(", ")}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            if (sortBy === "amount") {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
              setSortBy("amount");
              setSortOrder("desc");
            }
          }}
          className="p-0 hover:bg-transparent"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          ${row.original.totalAmount.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => getPaymentBadge(row.original.paymentStatus),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            if (sortBy === "date") {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
              setSortBy("date");
              setSortOrder("desc");
            }
          }}
          className="p-0 hover:bg-transparent"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => dayjs(row.original.createdAt).format("MMM D, YYYY"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetails(order)}
            >
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenStatusModal(order)}
            >
              Update
            </Button>
          </div>
        );
      },
    },
  ];

  // Calculate order statistics
  const totalOrders = orders.length;
  const pendingPaymentOrders = orders.filter(
    (o: Order) => o.status === "pending_payment"
  ).length;
  const paymentReceivedOrders = orders.filter(
    (o: Order) => o.status === "payment_received"
  ).length;
  const processingOrders = orders.filter(
    (o: Order) => o.status === "processing"
  ).length;
  const shippedOrders = orders.filter(
    (o: Order) => o.status === "shipped"
  ).length;
  const deliveredOrders = orders.filter(
    (o: Order) => o.status === "delivered"
  ).length;
  const cancelledOrders = orders.filter(
    (o: Order) => o.status === "cancelled"
  ).length;
  const refundedOrders = orders.filter(
    (o: Order) => o.status === "refunded"
  ).length;

  // Calculate total revenue
  const totalRevenue = orders.reduce(
    (sum: number, order: Order) =>
      order.status !== "cancelled" ? sum + order.totalAmount : sum,
    0
  );

  // Loading state
  if (isBusinessLoading || isOrdersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (businessError || ordersError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2 max-w-md text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h2 className="text-xl font-semibold text-red-500">
              Error Loading Data
            </h2>
            <p className="text-muted-foreground">
              {businessError instanceof Error
                ? businessError.message
                : ordersError instanceof Error
                ? ordersError.message
                : "Failed to load data"}
            </p>
            <Button
              onClick={() => router.push(`/business/${businessId}`)}
              className="mt-4"
            >
              Back to Business
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => router.push(`/business/${businessId}/profile`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Business Profile
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {business?.name} - Orders
              </h1>
              <p className="text-muted-foreground">
                Manage and track customer orders
              </p>
            </div>
          </div>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingPaymentOrders}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {processingOrders}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending_payment">Pending Payment</TabsTrigger>
            <TabsTrigger value="payment_received">Payment Received</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="refunded">Refunded</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Orders Found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No orders match your search criteria."
                    : activeTab === "all"
                    ? "This business hasn't received any orders yet."
                    : `No ${activeTab} orders found.`}
                </p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredOrders}
                searchColumn="_id"
                searchPlaceholder="Filter orders..."
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Order Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="w-1/2 text-sm">Pending Payment</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">{pendingPaymentOrders}</span>
                    <span className="text-muted-foreground">
                      {totalOrders
                        ? Math.round((pendingPaymentOrders / totalOrders) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <div className="w-1/2 text-sm">Payment Received</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">{paymentReceivedOrders}</span>
                    <span className="text-muted-foreground">
                      {totalOrders
                        ? Math.round(
                            (paymentReceivedOrders / totalOrders) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <div className="w-1/2 text-sm">Processing</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">{processingOrders}</span>
                    <span className="text-muted-foreground">
                      {totalOrders
                        ? Math.round((processingOrders / totalOrders) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                  <div className="w-1/2 text-sm">Shipped</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">{shippedOrders}</span>
                    <span className="text-muted-foreground">
                      {totalOrders
                        ? Math.round((shippedOrders / totalOrders) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <div className="w-1/2 text-sm">Delivered</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">{deliveredOrders}</span>
                    <span className="text-muted-foreground">
                      {totalOrders
                        ? Math.round((deliveredOrders / totalOrders) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-1/2 text-sm">Cancelled</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">{cancelledOrders}</span>
                    <span className="text-muted-foreground">
                      {totalOrders
                        ? Math.round((cancelledOrders / totalOrders) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <div className="w-1/2 text-sm">Refunded</div>
                  <div className="w-1/2 flex justify-between">
                    <span className="font-medium">{refundedOrders}</span>
                    <span className="text-muted-foreground">
                      {totalOrders
                        ? Math.round((refundedOrders / totalOrders) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Process Orders Promptly</h3>
                    <p className="text-sm text-muted-foreground">
                      Aim to process new orders within 24 hours to improve
                      customer satisfaction.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Update Shipping Status</h3>
                    <p className="text-sm text-muted-foreground">
                      Keep customers informed by updating order status as soon
                      as items are shipped.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Confirm Deliveries</h3>
                    <p className="text-sm text-muted-foreground">
                      Mark orders as delivered once you've confirmed the
                      customer has received their items.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Handle Cancellations</h3>
                    <p className="text-sm text-muted-foreground">
                      Process cancellations quickly and provide clear
                      communication about refunds.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          order={selectedOrder}
          onStatusUpdate={handleUpdateStatus}
        />
      )}

      {/* Update Status Modal */}
      {selectedOrder && (
        <UpdateOrderStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          order={selectedOrder}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
