import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import dayjs from "dayjs";
// Replaced date-fns with dayjs
import {
  Clock,
  Package,
  TruckIcon,
  CheckCircle,
  XCircle,
  MapPin,
  User,
  Mail,
  Phone,
} from "lucide-react";

interface OrderItem {
  serviceId: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
  };
  businessId: string;
  items: OrderItem[];
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

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onStatusUpdate: (orderId: string, status: string) => Promise<void>;
}

export function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  onStatusUpdate,
}: OrderDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    | "pending_payment"
    | "payment_received"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded"
  >(order.status);

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_payment":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending Payment
          </Badge>
        );
      case "payment_received":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Payment Received
          </Badge>
        );
      case "processing":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Package className="mr-1 h-3 w-3" />
            Processing
          </Badge>
        );
      case "shipped":
        return (
          <Badge
            variant="outline"
            className="bg-indigo-50 text-indigo-700 border-indigo-200"
          >
            <TruckIcon className="mr-1 h-3 w-3" />
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      case "refunded":
        return (
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-200"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Refunded
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
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
  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "paid":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Paid
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
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) return;

    try {
      setIsUpdating(true);
      await onStatusUpdate(order._id, selectedStatus);
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Get available status options based on current status
  const getStatusOptions = () => {
    switch (order.status) {
      case "pending_payment":
        return [
          { value: "pending_payment", label: "Pending Payment" },
          { value: "payment_received", label: "Payment Received" },
          { value: "cancelled", label: "Cancelled" },
        ];
      case "payment_received":
        return [
          { value: "payment_received", label: "Payment Received" },
          { value: "processing", label: "Processing" },
          { value: "cancelled", label: "Cancelled" },
        ];
      case "processing":
        return [
          { value: "processing", label: "Processing" },
          { value: "shipped", label: "Shipped" },
          { value: "cancelled", label: "Cancelled" },
        ];
      case "shipped":
        return [
          { value: "shipped", label: "Shipped" },
          { value: "delivered", label: "Delivered" },
          { value: "cancelled", label: "Cancelled" },
        ];
      case "delivered":
        return [
          { value: "delivered", label: "Delivered" },
          { value: "refunded", label: "Refunded" },
        ];
      case "cancelled":
        return [{ value: "cancelled", label: "Cancelled" }];
      case "refunded":
        return [{ value: "refunded", label: "Refunded" }];
      default:
        return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Order #{order.orderNumber}</span>
            {getStatusBadge(order.status)}
          </DialogTitle>
          <DialogDescription>
            Placed on{" "}
            {dayjs(new Date(order.createdAt)).format(
              "MMMM d, yyyy 'at' h:mm a"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Customer Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{order.customerId.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{order.customerId.email}</span>
              </div>
              {order.customerId.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customerId.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Shipping Address</h3>
            {order.shippingAddress ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No shipping address provided
              </p>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {item.serviceId.images && item.serviceId.images.length > 0 ? (
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
                      ${item.serviceId.price.toFixed(2)} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Order Summary */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping:</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax:</span>
              <span>$0.00</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Payment Information */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">Payment Information</h3>
            {getPaymentBadge(order.paymentStatus)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <span>Chapa Payment Gateway</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span>CH{order.orderNumber.substring(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                setSelectedStatus(
                  value as
                    | "pending_payment"
                    | "payment_received"
                    | "processing"
                    | "shipped"
                    | "delivered"
                    | "cancelled"
                    | "refunded"
                )
              }
              disabled={
                order.status === "delivered" ||
                order.status === "cancelled" ||
                order.status === "refunded"
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={
                isUpdating ||
                selectedStatus === order.status ||
                order.status === "delivered" ||
                order.status === "cancelled" ||
                order.status === "refunded"
              }
            >
              Update Status
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
