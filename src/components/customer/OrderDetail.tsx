"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  MapPin,
  CreditCard,
  Receipt,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import dayjs from "dayjs";
// Replaced date-fns with dayjs
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { Order, orderApi } from "@/services/order";
import { paymentApi } from "@/services/payment";
import { ChapaPaymentButton } from "@/components/payment/ChapaPaymentButton";

interface OrderDetailProps {
  order: Order;
  customerId: string;
  onOrderUpdate?: () => void;
}

export function OrderDetail({
  order,
  customerId,
  onOrderUpdate,
}: OrderDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return dayjs(new Date(dateString)).format("PPP p");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_payment":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
          >
            <Clock className="mr-1 h-3 w-3" />
            Awaiting Payment
          </Badge>
        );
      case "payment_received":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
          >
            <CreditCard className="mr-1 h-3 w-3" />
            Payment Received
          </Badge>
        );
      case "processing":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Processing
          </Badge>
        );
      case "shipped":
        return (
          <Badge
            variant="outline"
            className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400"
          >
            <Truck className="mr-1 h-3 w-3" />
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      case "refunded":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Refunded
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async () => {
    try {
      setIsLoading(true);
      await orderApi.cancelOrder(order._id, cancelReason);
      toast.success("Order cancelled successfully");
      setShowCancelDialog(false);
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error("Cancel order error:", error);
      toast.error("Failed to cancel order");
    } finally {
      setIsLoading(false);
    }
  };

  // Get business name
  const getBusinessName = () => {
    if (typeof order.businessId === "string") {
      return "Business";
    } else {
      return order.businessId.name;
    }
  };

  // Check if order can be cancelled
  const canCancel = [
    "pending_payment",
    "payment_received",
    "processing",
  ].includes(order.status);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <CardTitle className="text-xl">
              Order #{order._id.substring(order._id.length - 8)}
            </CardTitle>
            <CardDescription>
              Placed on {formatDate(order.createdAt)}
            </CardDescription>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Items */}
        <div>
          <h3 className="font-medium mb-3">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 border rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                    <Package className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {item.serviceName || `Product #${item.serviceId}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {item.price.toLocaleString()} ETB
                    </p>
                  </div>
                </div>
                <p className="font-medium">
                  {(item.quantity * item.price).toLocaleString()} ETB
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
          <h3 className="font-medium mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{order.totalAmount.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>0 ETB</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{order.totalAmount.toLocaleString()} ETB</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h3 className="font-medium mb-3">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Payment Method</span>
              </div>
              <p className="text-sm">{order.paymentMethod}</p>
            </div>
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Payment Status</span>
              </div>
              <p className="text-sm">
                {order.paymentDetails?.paymentStatus === "completed"
                  ? "Paid"
                  : order.paymentDetails?.paymentStatus || "Pending"}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        {order.shippingAddress && (
          <div>
            <h3 className="font-medium mb-3">Shipping Information</h3>
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Shipping Address</span>
              </div>
              <p className="text-sm">
                {order.shippingAddress.street}, {order.shippingAddress.city}
                {order.shippingAddress.state &&
                  `, ${order.shippingAddress.state}`}
                {order.shippingAddress.postalCode &&
                  ` ${order.shippingAddress.postalCode}`}
                {order.shippingAddress.country &&
                  `, ${order.shippingAddress.country}`}
              </p>
            </div>
          </div>
        )}

        {/* Tracking Information */}
        {order.trackingNumber && (
          <div>
            <h3 className="font-medium mb-3">Tracking Information</h3>
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tracking Number</span>
              </div>
              <p className="text-sm">{order.trackingNumber}</p>
            </div>
          </div>
        )}

        {/* Seller Information */}
        <div>
          <h3 className="font-medium mb-3">Seller Information</h3>
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() =>
              router.push(
                `/customer/${customerId}/businesses/${
                  typeof order.businessId === "string"
                    ? order.businessId
                    : order.businessId._id
                }`
              )
            }
          >
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                <Package className="h-4 w-4 text-gray-500" />
              </div>
              <span>{getBusinessName()}</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-0">
        {order.status === "pending_payment" && (
          <ChapaPaymentButton
            orderId={order._id}
            amount={order.totalAmount}
            customerEmail={
              typeof order.customerId === "string"
                ? ""
                : (order.customerId as any).email || ""
            }
            customerName={
              typeof order.customerId === "string"
                ? "Customer"
                : (order.customerId as any).name || "Customer"
            }
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
            onSuccess={(txRef) => {
              toast.success("Payment initiated successfully!");
              console.log(
                "Payment initiated with transaction reference:",
                txRef
              );
              if (onOrderUpdate) onOrderUpdate();
            }}
            onError={(error) => {
              toast.error("Payment initialization failed. Please try again.");
              console.error("Payment error:", error);
            }}
          />
        )}

        {order.status === "shipped" && order.trackingNumber && (
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() =>
              router.push(
                `/customer/${customerId}/orders/${order._id}/tracking`
              )
            }
          >
            <Truck className="mr-2 h-4 w-4" />
            Track Order
          </Button>
        )}

        {canCancel && (
          <>
            <Button
              variant="outline"
              className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950"
              onClick={() => setShowCancelDialog(true)}
              disabled={isLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Order
            </Button>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Order</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel this order? This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <label className="text-sm font-medium mb-2 block">
                    Reason for cancellation (optional)
                  </label>
                  <Textarea
                    placeholder="Please provide a reason for cancellation"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelDialog(false)}
                    disabled={isLoading}
                  >
                    Keep Order
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancelOrder}
                    disabled={isLoading}
                  >
                    {isLoading ? "Cancelling..." : "Cancel Order"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
