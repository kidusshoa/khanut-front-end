"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  MapPin,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { orderApi } from "@/services/order";
import { paymentApi } from "@/services/payment";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import PaymentButton from "@/components/payment/PaymentButton";
import PaymentStatus from "@/components/payment/PaymentStatus";
import { toast } from "react-hot-toast";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;
  const orderId = params.orderId as string;
  const [refreshPayment, setRefreshPayment] = useState(false);

  // Fetch order details
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getOrderById(orderId),
  });

  // Fetch payment status
  const {
    data: paymentData,
    isLoading: isPaymentLoading,
    refetch: refetchPayment,
  } = useQuery({
    queryKey: ["paymentStatus", orderId, refreshPayment],
    queryFn: () => paymentApi.getOrderPaymentStatus(orderId),
    enabled: !!orderId,
    refetchInterval: order?.status === "pending_payment" ? 10000 : false, // Refetch every 10 seconds if payment is pending
  });

  // Handle refresh payment status
  const handleRefreshPayment = () => {
    setRefreshPayment(!refreshPayment);
    refetchPayment();
    toast.success("Payment status refreshed");
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_payment":
        return <Badge variant="outline">Pending Payment</Badge>;
      case "payment_received":
        return <Badge variant="secondary">Payment Received</Badge>;
      case "processing":
        return <Badge variant="warning">Processing</Badge>;
      case "shipped":
        return <Badge variant="primary">Shipped</Badge>;
      case "delivered":
        return <Badge variant="success">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "refunded":
        return <Badge variant="destructive">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <CustomerDashboardLayout customerId={customerId}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CustomerDashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <CustomerDashboardLayout customerId={customerId}>
        <div className="flex flex-col items-center justify-center py-12">
          <XCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Button onClick={() => router.push(`/customer/${customerId}/orders`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </CustomerDashboardLayout>
    );
  }

  return (
    <CustomerDashboardLayout customerId={customerId}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/customer/${customerId}/orders`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            <h1 className="text-2xl font-bold">Order Details</h1>
            {getStatusBadge(order.status)}
          </div>
          {order.status === "pending_payment" && (
            <PaymentButton
              type="order"
              id={orderId}
              onSuccess={(checkoutUrl) => {
                window.location.href = checkoutUrl;
              }}
            />
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Order #{order._id.substring(0, 8)}</CardTitle>
                <CardDescription>
                  Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}{" "}
                  at {format(new Date(order.createdAt), "h:mm a")}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <PaymentStatus orderId={orderId} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefreshPayment}
                  disabled={isPaymentLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.serviceId.images &&
                      item.serviceId.images.length > 0 ? (
                        <img
                          src={item.serviceId.images[0]}
                          alt={item.serviceId.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{item.serviceId.name}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} x {item.quantity}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            {order.shippingAddress && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Shipping Information</h3>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Shipping Address</p>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingAddress.street}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex items-start gap-2">
                      <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Tracking Number</p>
                        <p className="text-sm text-muted-foreground">
                          {order.trackingNumber}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Payment Information */}
            <Separator />
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Payment Information</h3>
              <div className="flex items-start gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Payment Method</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {order.paymentMethod}
                  </p>
                </div>
              </div>
              {paymentData?.transactionRef && (
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Transaction Reference</p>
                    <p className="text-sm text-muted-foreground">
                      {paymentData.transactionRef}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push(`/customer/${customerId}/orders`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            {order.status === "pending_payment" && (
              <PaymentButton
                type="order"
                id={orderId}
                onSuccess={(checkoutUrl) => {
                  window.location.href = checkoutUrl;
                }}
              />
            )}
          </CardFooter>
        </Card>
      </div>
    </CustomerDashboardLayout>
  );
}
