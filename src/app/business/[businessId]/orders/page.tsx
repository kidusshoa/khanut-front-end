"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Package,
  User,
  CheckCircle,
  XCircle,
  Truck as TruckIcon,
  Loader2,
  Eye,
  CalendarDays,
  DollarSign,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { badgeVariants } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { orderApi } from "@/services/order";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import weekOfYear from "dayjs/plugin/weekOfYear";

// Extend dayjs with plugins
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(weekOfYear);
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { UpdateShippingModal } from "@/components/business/UpdateShippingModal";

interface Order {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
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
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BusinessOrdersPage({
  params: { businessId },
}: {
  params: { businessId: string };
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

  // Fetch orders
  const {
    data: orders,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["orders", businessId, activeTab, selectedDate],
    queryFn: () => {
      const params: any = {};

      if (activeTab !== "all") {
        params.status = activeTab;
      }

      if (selectedDate) {
        params.startDate = dayjs(selectedDate).format("YYYY-MM-DD");
        // Set end date to the same day to get orders for that specific day
        params.endDate = dayjs(selectedDate).format("YYYY-MM-DD");
      }

      return orderApi.getBusinessOrders(businessId, params);
    },
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Order ${newStatus} successfully`);
      refetch();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const openShippingModal = (order: Order) => {
    setSelectedOrder(order);
    setIsShippingModalOpen(true);
  };

  const handleShippingUpdate = async (orderId: string, shippingData: any) => {
    try {
      await orderApi.updateShippingInfo(orderId, shippingData);
      await handleStatusChange(orderId, "shipped");
      toast.success("Shipping information updated");
      refetch();
    } catch (error) {
      console.error("Error updating shipping info:", error);
      toast.error("Failed to update shipping information");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Package className="h-4 w-4 mr-1" />;
      case "pending":
        return <ShoppingBag className="h-4 w-4 mr-1" />;
      case "shipped":
        return <TruckIcon className="h-4 w-4 mr-1" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "pending":
        return <DollarSign className="h-4 w-4 mr-1" />;
      case "failed":
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = dayjs(dateString);
    if (date.isToday()) return "Today";
    if (date.isTomorrow()) return "Tomorrow";
    if (date.week() === dayjs().week()) return date.format("dddd"); // Day name
    return date.format("MMM D, YYYY");
  };

  // Define table columns
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderId",
      header: "Order",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-medium">
              #{order._id.slice(-6).toUpperCase()}
            </div>
            <div className="text-sm text-muted-foreground">
              {getDateLabel(order.createdAt)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-medium flex items-center">
              <User className="h-4 w-4 mr-1 text-muted-foreground" />
              {order.customerId.name}
            </div>
            <div className="text-sm text-muted-foreground">
              {order.customerId.email}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-medium">{order.items.length} item(s)</div>
            <div className="text-sm text-muted-foreground line-clamp-1">
              {order.items.map((item) => item.serviceId.name).join(", ")}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "ETB",
            }).format(order.totalAmount)}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div
              className={`${badgeVariants({
                variant: "outline",
              })} ${getStatusColor(order.status)}`}
            >
              <div className="flex items-center">
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
            <div
              className={`${badgeVariants({
                variant: "outline",
              })} ${getPaymentStatusColor(order.paymentStatus)}`}
            >
              <div className="flex items-center">
                {getPaymentStatusIcon(order.paymentStatus)}
                {order.paymentStatus.charAt(0).toUpperCase() +
                  order.paymentStatus.slice(1)}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        const isPending = order.status === "pending";
        const isProcessing = order.status === "processing";
        const isShipped = order.status === "shipped";
        const isDelivered = order.status === "delivered";
        const isCancelled = order.status === "cancelled";

        return (
          <div className="flex items-center gap-2">
            <button
              className={buttonVariants({ variant: "ghost", size: "icon" })}
              onClick={() => router.push(`/orders/${order._id}`)}
            >
              <Eye className="h-4 w-4" />
            </button>

            {isPending && (
              <button
                className={`${buttonVariants({
                  variant: "outline",
                  size: "sm",
                })} text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700`}
                onClick={() => handleStatusChange(order._id, "processing")}
              >
                <Package className="h-4 w-4 mr-1" />
                Process
              </button>
            )}

            {isProcessing && (
              <button
                className={`${buttonVariants({
                  variant: "outline",
                  size: "sm",
                })} text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700`}
                onClick={() => openShippingModal(order)}
              >
                <TruckIcon className="h-4 w-4 mr-1" />
                Ship
              </button>
            )}

            {isShipped && (
              <button
                className={`${buttonVariants({
                  variant: "outline",
                  size: "sm",
                })} text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700`}
                onClick={() => handleStatusChange(order._id, "delivered")}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Deliver
              </button>
            )}

            {(isPending || isProcessing) && !isDelivered && !isCancelled && (
              <button
                className={`${buttonVariants({
                  variant: "outline",
                  size: "sm",
                })} text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700`}
                onClick={() => handleStatusChange(order._id, "cancelled")}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // Filter orders based on active tab
  const filteredOrders = orders || [];

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage your customer orders and shipments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`${buttonVariants({
                    variant: "outline",
                  })} flex items-center gap-2`}
                >
                  <CalendarDays className="h-4 w-4" />
                  {selectedDate
                    ? dayjs(selectedDate).format("MMM D, YYYY")
                    : "Filter by date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
                {selectedDate && (
                  <div className="p-3 border-t border-border">
                    <button
                      className={`${buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })} w-full`}
                      onClick={() => setSelectedDate(undefined)}
                    >
                      Clear date filter
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : filteredOrders.length > 0 ? (
              <DataTable
                columns={columns}
                data={filteredOrders}
                searchColumn="customer"
                searchPlaceholder="Search orders..."
              />
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No orders found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {selectedDate
                    ? `No orders for ${dayjs(selectedDate).format(
                        "MMMM D, YYYY"
                      )}`
                    : activeTab === "all"
                    ? "You don't have any orders yet."
                    : `You don't have any ${activeTab} orders.`}
                </p>
                {selectedDate && (
                  <button
                    className={buttonVariants({ variant: "outline" })}
                    onClick={() => setSelectedDate(undefined)}
                  >
                    Clear date filter
                  </button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedOrder && (
        <UpdateShippingModal
          isOpen={isShippingModalOpen}
          onClose={() => setIsShippingModalOpen(false)}
          order={selectedOrder}
          onUpdate={handleShippingUpdate}
        />
      )}
    </DashboardLayout>
  );
}
