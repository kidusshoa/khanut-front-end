"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Truck } from "lucide-react";
import { z } from "zod";
import { orderApi } from "@/services/order";
import { toast } from "react-hot-toast";

// Validation schema
const shippingSchema = z.object({
  trackingNumber: z.string().min(3, "Tracking number is required"),
});

interface UpdateShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onUpdate: (orderId: string, trackingNumber: string) => void;
}

export function UpdateShippingModal({
  isOpen,
  onClose,
  order,
  onUpdate,
}: UpdateShippingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      trackingNumber: order?.trackingNumber || "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Update shipping info
      await orderApi.updateShippingInfo(order._id, {
        trackingNumber: data.trackingNumber,
      });

      // Update order status to shipped
      await orderApi.updateOrderStatus(order._id, "shipped");

      // Notify parent component
      onUpdate(order._id, data.trackingNumber);

      toast.success("Order marked as shipped");
      onClose();
    } catch (error) {
      console.error("Error updating shipping info:", error);
      toast.error("Failed to update shipping information");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Ship Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="order-id">Order ID</Label>
            <Input
              id="order-id"
              value={order?._id || ""}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="tracking-number">Tracking Number</Label>
            <Input
              id="tracking-number"
              {...register("trackingNumber")}
              placeholder="Enter tracking number"
            />
            {errors.trackingNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.trackingNumber.message?.toString()}
              </p>
            )}
          </div>

          <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800">
            <p>
              Once you mark this order as shipped, the customer will be notified
              and the order status will be updated.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Truck className="mr-2 h-4 w-4" />
              )}
              Mark as Shipped
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
