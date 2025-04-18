"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Package, 
  Building, 
  Calendar, 
  Truck, 
  Loader2,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { orderApi } from "@/services/order";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

export default function CustomerOrdersPage({
  params: { customerId },
}: {
  params: { customerId: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Check if user is authorized to view this page
  if (session?.user?.id !== customerId) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
        <p className="text-gray-600 mb-6">You don't have permission to view this page.</p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        const params: any = {};
        if (activeTab !== "all") {
          params.status = activeTab;
        }
        
        const data = await orderApi.getCustomerOrders(customerId, params.status);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [customerId, activeTab]);

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        
        <Button 
          onClick={() => router.push(`/customer/${customerId}/cart`)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          View Cart
        </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          <Building className="h-4 w-4 mr-2" />
                          <span>
                            {order.businessId?.name || "Business"}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {format(new Date(order.createdAt), "PPP")}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600 font-medium">
                          <Package className="h-4 w-4 mr-2" />
                          <span>
                            {order.items.length} {order.items.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-900 font-semibold">
                          Total: {formatPrice(order.totalAmount)}
                        </div>
                      </div>
                      
                      {order.trackingNumber && (
                        <div className="bg-gray-50 p-2 rounded-md text-sm text-gray-600 mb-4 flex items-center">
                          <Truck className="h-4 w-4 mr-2 text-purple-600" />
                          <p className="font-medium">Tracking #: {order.trackingNumber}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {order.status === "pending_payment" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => router.push(`/customer/${customerId}/orders/${order._id}/pay`)}
                          >
                            Complete Payment
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/customer/${customerId}/orders/${order._id}`)}
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
                  ? "You haven't placed any orders yet."
                  : `You don't have any ${activeTab.replace("_", " ")} orders.`}
              </p>
              <Button 
                onClick={() => router.push(`/customer/${customerId}`)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Start Shopping
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
