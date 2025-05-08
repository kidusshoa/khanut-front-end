import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi, CartItem, CartResponse } from "@/services/cart";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";

// Cart query keys
export const cartKeys = {
  all: ["cart"] as const,
  items: () => [...cartKeys.all, "items"] as const,
  item: (id: string) => [...cartKeys.items(), id] as const,
  count: () => [...cartKeys.all, "count"] as const,
  total: () => [...cartKeys.all, "total"] as const,
  byBusiness: () => [...cartKeys.all, "byBusiness"] as const,
};

export const useCart = () => {
  const queryClient = useQueryClient();
  const [isStorageUpdated, setIsStorageUpdated] = useState(false);

  // Listen for storage events (for multi-tab synchronization)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsStorageUpdated((prev) => !prev);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Get cart items
  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: [...cartKeys.items(), isStorageUpdated], // Include storage state in key to trigger refetch
    queryFn: cartApi.getCartItems,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add item to cart
  const addToCartMutation = useMutation({
    mutationFn: ({
      serviceId,
      quantity,
    }: {
      serviceId: string;
      quantity: number;
    }) => cartApi.addToCart(serviceId, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.items(), data);
      toast.success("Item added to cart");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add item to cart");
    },
  });

  // Update item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: ({
      serviceId,
      quantity,
    }: {
      serviceId: string;
      quantity: number;
    }) => cartApi.updateCartItemQuantity(serviceId, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.items(), data);
      toast.success("Cart updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update cart");
    },
  });

  // Remove item from cart
  const removeFromCartMutation = useMutation({
    mutationFn: (serviceId: string) => cartApi.removeFromCart(serviceId),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.items(), data);
      toast.success("Item removed from cart");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove item from cart");
    },
  });

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.items(), data);
      toast.success("Cart cleared");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clear cart");
    },
  });

  // Check if item is in cart
  const isInCart = (serviceId: string): boolean => {
    if (!cartData?.items) return false;
    return cartData.items.some((item) => item.serviceId === serviceId);
  };

  // Get cart item by service ID
  const getCartItem = (serviceId: string): CartItem | undefined => {
    if (!cartData?.items) return undefined;
    return cartData.items.find((item) => item.serviceId === serviceId);
  };

  // Get cart count
  const cartCount =
    cartData?.items?.reduce((count, item) => count + item.quantity, 0) || 0;

  // Get cart total
  const cartTotal = cartData?.totalAmount || 0;

  // Get cart items grouped by business
  const cartItemsByBusiness = (): Record<string, CartItem[]> => {
    if (!cartData?.items) return {};

    return cartData.items.reduce((grouped, item) => {
      if (!grouped[item.businessId]) {
        grouped[item.businessId] = [];
      }

      grouped[item.businessId].push(item);
      return grouped;
    }, {} as Record<string, CartItem[]>);
  };

  return {
    // Data
    cartItems: cartData?.items || [],
    cartCount,
    cartTotal,
    isCartLoading,

    // Actions
    addToCart: (serviceId: string, quantity = 1) =>
      addToCartMutation.mutate({ serviceId, quantity }),
    updateQuantity: (serviceId: string, quantity: number) =>
      updateQuantityMutation.mutate({ serviceId, quantity }),
    removeFromCart: (serviceId: string) =>
      removeFromCartMutation.mutate(serviceId),
    clearCart: () => clearCartMutation.mutate(),

    // Helpers
    isInCart,
    getCartItem,
    cartItemsByBusiness: cartItemsByBusiness(),

    // Mutation states
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateQuantityMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
};
