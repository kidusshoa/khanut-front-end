"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  Loader2,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orderApi } from "@/services/order";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { UpdateShippingModal } from "@/components/business/UpdateShippingModal";

export default function BusinessOrdersPage({
  params: { businessId },
}: {
  params: { businessId: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        const params: any = {};
        if (activeTab !== "all") {
          params.status = activeTab;
        }
        
        const data = await orderApi.getBusinessOrders(businessId, params.status);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [businessId, activeTab]);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await orderApi.updateOrderStatus(orderId, status);
      
      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, status }
            : order
        )
      );
      
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const openShippingModal = (order: any) => {
    setSelectedOrder(order);
    setIsShippingModalOpen(true);
  };

  const handleShippingUpdate = (orderId: string, trackingNumber: string) => {
    // Update local state
    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId
          ? { ...order, trackingNumber }
          : order
      )
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_payment":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Payment</Badge>;
      case "payment_received":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Payment Received</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case "shipped":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Shipped</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      case "refunded":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(price);
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
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
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : orders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {orders.map((order) => (
                <Card key={order._id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">
                          Order #{order._id.slice(-6)}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>
                            {order.customerId?.name || "Customer"}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {format(new Date(order.createdAt), "PPP")}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600 font-medium">
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          <span>
                            {order.items.length} {order.items.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-900 font-semibold">
                          Total: {formatPrice(order.totalAmount)}
                        </div>
                      </div>
                      
                      {order.trackingNumber && (
                        <div className="bg-gray-50 p-2 rounded-md text-sm text-gray-600 mb-4">
                          <p className="font-medium">Tracking #: {order.trackingNumber}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {order.status === "payment_received" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleStatusChange(order._id, "processing")}
                            >
                              <Package className="h-4 w-4 mr-1" />
                              Process Order
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleStatusChange(order._id, "cancelled")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        
                        {order.status === "processing" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                              onClick={() => openShippingModal(order)}
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Ship Order
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleStatusChange(order._id, "cancelled")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        
                        {order.status === "shipped" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusChange(order._id, "delivered")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark as Delivered
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/business/${businessId}/orders/${order._id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === "all"
                  ? "You don't have any orders yet."
                  : `You don't have any ${activeTab.replace("_", " ")} orders.`}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedOrder && (
        <UpdateShippingModal
          isOpen={isShippingModalOpen}
          onClose={() => setIsShippingModalOpen(false)}
          order={selectedOrder}
          onUpdate={handleShippingUpdate}
        />
      )}
    </div>
  );
}
