"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { CheckoutModal } from "@/components/customer/CheckoutModal";
import { toast } from "react-hot-toast";

export default function CartPage({
  params: { customerId },
}: {
  params: { customerId: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Check if user is authorized to view this cart
  if (session?.user?.id !== customerId) {
    // Redirect to home or show unauthorized message
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
        <p className="text-gray-600 mb-6">You don't have permission to view this cart.</p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  const handleQuantityChange = (serviceId: string, quantity: number) => {
    if (quantity >= 1) {
      updateQuantity(serviceId, quantity);
    }
  };

  const handleRemoveItem = (serviceId: string) => {
    removeFromCart(serviceId);
    toast.success("Item removed from cart");
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    setIsCheckoutModalOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(price);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button 
            onClick={() => router.push(`/customer/${customerId}`)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.serviceId} className="bg-white rounded-lg shadow p-4 flex">
                <div className="relative h-24 w-24 flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 rounded-md flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex-grow">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="font-medium text-orange-600">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.serviceId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.serviceId, parseInt(e.target.value) || 1)}
                        className="w-12 h-8 mx-1 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.serviceId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.serviceId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-1">
                    Subtotal: {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(getCartTotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between mb-6">
              <span className="text-lg font-medium">Total</span>
              <span className="text-lg font-bold text-orange-600">
                {formatPrice(getCartTotal())}
              </span>
            </div>
            
            <Button 
              onClick={handleCheckout}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Proceed to Checkout
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => router.push(`/customer/${customerId}`)}
            >
              Continue Shopping
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full mt-2 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                clearCart();
                toast.success("Cart cleared");
              }}
            >
              Clear Cart
            </Button>
          </div>
        </div>
      )}

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cart}
        customerId={customerId}
      />
    </div>
  );
}
