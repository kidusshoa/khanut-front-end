"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { CheckoutModal } from "@/components/customer/CheckoutModal";
import { toast } from "react-hot-toast";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import Image from "next/image";

interface CartContentProps {
  customerId: string;
}

export default function CartContent({ customerId }: CartContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCartStore();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is authorized
  if (session?.user?.id !== customerId) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to view this cart.
        </p>
        <button className={buttonVariants()} onClick={() => router.push("/")}>
          Go Home
        </button>
      </div>
    );
  }

  const handleRemoveItem = (serviceId: string) => {
    removeFromCart(serviceId);
    toast.success("Item removed from cart");
  };

  const handleQuantityChange = (serviceId: string, quantity: number) => {
    if (quantity < 1) return;
    updateQuantity(serviceId, quantity);
  };

  const handleCheckout = () => {
    setIsCheckoutModalOpen(true);
  };

  const closeCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  return (
    <CustomerDashboardLayout customerId={customerId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground">
            Review and checkout your selected items
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-1">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              You haven't added any items to your cart yet.
            </p>
            <button
              onClick={() => router.push(`/customer/${customerId}`)}
              className={`${buttonVariants()} bg-orange-600 hover:bg-orange-700`}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-7">
            {/* Cart Items */}
            <div className="md:col-span-5">
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
                  <Separator className="mb-4" />

                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.serviceId}
                        className="flex items-start justify-between py-4 border-b border-border last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-md overflow-hidden bg-muted">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.businessName}
                            </p>
                            <p className="text-sm font-medium text-orange-600 mt-1">
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <button
                              type="button"
                              className={`${buttonVariants({
                                variant: "outline",
                                size: "icon",
                              })} h-8 w-8`}
                              onClick={() =>
                                handleQuantityChange(
                                  item.serviceId,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className={`${buttonVariants({
                                variant: "outline",
                                size: "icon",
                              })} h-8 w-8`}
                              onClick={() =>
                                handleQuantityChange(
                                  item.serviceId,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            className={`${buttonVariants({
                              variant: "ghost",
                              size: "sm",
                            })} text-red-500 hover:text-red-700 hover:bg-red-50`}
                            onClick={() => handleRemoveItem(item.serviceId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-2">
              <div className="rounded-lg border bg-card sticky top-4">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  <Separator className="mb-4" />

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatCurrency(getCartTotal() * 0.15)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(getCartTotal() * 1.15)}</span>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className={`${buttonVariants()} w-full bg-orange-600 hover:bg-orange-700`}
                    >
                      Proceed to Checkout
                    </button>

                    <button
                      className={`${buttonVariants({
                        variant: "outline",
                      })} w-full mt-2`}
                      onClick={() => router.push(`/customer/${customerId}`)}
                    >
                      Continue Shopping
                    </button>

                    <button
                      className={`${buttonVariants({
                        variant: "ghost",
                      })} w-full mt-2 text-red-500 hover:text-red-700 hover:bg-red-50`}
                      onClick={() => {
                        clearCart();
                        toast.success("Cart cleared");
                      }}
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={closeCheckoutModal}
          cartItems={cart}
          customerId={customerId}
        />
      </div>
    </CustomerDashboardLayout>
  );
}
