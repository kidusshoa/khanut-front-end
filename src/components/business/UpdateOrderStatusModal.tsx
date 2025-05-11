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
import { Loader2 } from "lucide-react";

interface OrderItem {
  serviceId: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

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

interface UpdateOrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
}

export function UpdateOrderStatusModal({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
}: UpdateOrderStatusModalProps) {
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

  // Handle status update
  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) return;

    try {
      setIsUpdating(true);
      await onUpdateStatus(order._id, selectedStatus);
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the status of order #{order.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Current Status: {order.status}
            </p>
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
                isUpdating ||
                order.status === "delivered" ||
                order.status === "cancelled" ||
                order.status === "refunded"
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
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
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
