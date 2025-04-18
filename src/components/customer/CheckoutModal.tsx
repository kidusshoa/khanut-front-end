"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard } from "lucide-react";
import { z } from "zod";
import { CartItem, useCartStore } from "@/store/cartStore";
import { orderApi } from "@/services/order";
import { paymentApi } from "@/services/payment";
import { toast } from "react-hot-toast";

// Validation schema for shipping address
const shippingAddressSchema = z.object({
  street: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(2, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  customerId: string;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  customerId,
}: CheckoutModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { clearCart, getCartTotal } = useCartStore();

  // Group cart items by business
  const itemsByBusiness = cartItems.reduce((acc, item) => {
    if (!acc[item.businessId]) {
      acc[item.businessId] = [];
    }
    acc[item.businessId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Ethiopia",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Create orders for each business
      const orderPromises = Object.entries(itemsByBusiness).map(
        async ([businessId, items]) => {
          const orderData = {
            customerId,
            businessId,
            items: items.map((item) => ({
              serviceId: item.serviceId,
              quantity: item.quantity,
            })),
            shippingAddress: data,
            paymentMethod: "card", // Default to card payment
            notes: "",
          };

          return orderApi.createOrder(orderData);
        }
      );

      const orders = await Promise.all(orderPromises);

      // Initialize payment for the first order
      // In a real app, you might want to handle multiple orders differently
      if (orders.length > 0) {
        const paymentResponse = await paymentApi.initializeOrderPayment(
          orders[0]._id
        );

        // Clear cart after successful order creation
        clearCart();

        // Redirect to Chapa payment page
        if (paymentResponse.checkoutUrl) {
          window.location.href = paymentResponse.checkoutUrl;
        } else {
          // If no checkout URL, redirect to orders page
          router.push(`/customer/${customerId}/orders`);
        }
      }

      toast.success("Order placed successfully!");
      onClose();
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Checkout</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Order Summary</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="space-y-2">
                {Object.entries(itemsByBusiness).map(([businessId, items]) => (
                  <div key={businessId}>
                    <p className="font-medium">Business ID: {businessId}</p>
                    <ul className="pl-4 space-y-1">
                      {items.map((item) => (
                        <li
                          key={item.serviceId}
                          className="text-sm flex justify-between"
                        >
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span className="text-orange-600">
                  {formatPrice(getCartTotal())}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Shipping Address</h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  {...register("street")}
                  placeholder="123 Main St"
                />
                {errors.street && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.street.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="Addis Ababa"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State/Region</Label>
                  <Input
                    id="state"
                    {...register("state")}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    {...register("postalCode")}
                    placeholder="1000"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    {...register("country")}
                    defaultValue="Ethiopia"
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Payment Method</h3>
            <p className="text-sm text-gray-600 mb-2">
              You will be redirected to Chapa secure payment gateway to complete
              your purchase.
            </p>
            <div className="bg-gray-50 p-3 rounded-md flex items-center">
              <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
              <span>Credit/Debit Card</span>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              className={buttonVariants({ variant: "outline" })}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${buttonVariants()} bg-orange-600 hover:bg-orange-700`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
