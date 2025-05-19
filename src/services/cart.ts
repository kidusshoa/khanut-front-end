import { Service } from "@/types/business";
import api from "./api";
import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface CartItem {
  serviceId: string;
  businessId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  businessName?: string;
}

export interface CartResponse {
  items: CartItem[];
  totalAmount: number;
  message?: string;
}

// Local storage cart service (fallback)
const localCartService = {
  // Get all items in the cart
  getCartItems: (): CartItem[] => {
    if (typeof window === "undefined") return [];

    try {
      const cartData = localStorage.getItem("cart");
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error("Error getting cart items:", error);
      return [];
    }
  },

  // Add an item to the cart
  addToCart: (
    service: Service,
    businessName?: string,
    quantity: number = 1
  ): CartItem[] => {
    if (typeof window === "undefined") return [];

    try {
      const cart = localCartService.getCartItems();

      // Check if the item already exists in the cart
      const existingItemIndex = cart.findIndex(
        (item) => item.serviceId === service._id
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item if it doesn't exist
        // Ensure businessId is a string
        const businessId =
          typeof service.businessId === "object" && service.businessId._id
            ? service.businessId._id.toString()
            : service.businessId.toString();

        cart.push({
          serviceId: service._id,
          businessId: businessId,
          name: service.name,
          price: service.price,
          quantity,
          image: service.image,
          businessName,
        });
      }

      // Save updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Dispatch storage event to notify other components
      window.dispatchEvent(new Event("storage"));

      return cart;
    } catch (error) {
      console.error("Error adding item to cart:", error);
      return [];
    }
  },

  // Update item quantity in the cart
  updateCartItemQuantity: (serviceId: string, quantity: number): CartItem[] => {
    if (typeof window === "undefined") return [];

    try {
      const cart = localCartService.getCartItems();

      // Find the item in the cart
      const itemIndex = cart.findIndex((item) => item.serviceId === serviceId);

      if (itemIndex >= 0) {
        // Update quantity
        cart[itemIndex].quantity = quantity;

        // Remove item if quantity is 0
        if (quantity <= 0) {
          cart.splice(itemIndex, 1);
        }

        // Save updated cart to localStorage
        localStorage.setItem("cart", JSON.stringify(cart));

        // Dispatch storage event to notify other components
        window.dispatchEvent(new Event("storage"));
      }

      return cart;
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      return [];
    }
  },

  // Remove an item from the cart
  removeFromCart: (serviceId: string): CartItem[] => {
    if (typeof window === "undefined") return [];

    try {
      let cart = localCartService.getCartItems();

      // Filter out the item to remove
      cart = cart.filter((item) => item.serviceId !== serviceId);

      // Save updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Dispatch storage event to notify other components
      window.dispatchEvent(new Event("storage"));

      return cart;
    } catch (error) {
      console.error("Error removing item from cart:", error);
      return [];
    }
  },

  // Clear the entire cart
  clearCart: (): void => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem("cart");

      // Dispatch storage event to notify other components
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  },

  // Get the total number of items in the cart
  getCartCount: (): number => {
    const cart = localCartService.getCartItems();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },

  // Get the total price of all items in the cart
  getCartTotal: (): number => {
    const cart = localCartService.getCartItems();
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  // Check if a service is already in the cart
  isInCart: (serviceId: string): boolean => {
    const cart = localCartService.getCartItems();
    return cart.some((item) => item.serviceId === serviceId);
  },

  // Get cart items grouped by business
  getCartItemsByBusiness: (): Record<string, CartItem[]> => {
    const cart = localCartService.getCartItems();

    return cart.reduce((grouped, item) => {
      // Ensure businessId is a string
      const businessId =
        typeof item.businessId === "object" && item.businessId._id
          ? item.businessId._id.toString()
          : item.businessId.toString();

      if (!grouped[businessId]) {
        grouped[businessId] = [];
      }

      grouped[businessId].push({
        ...item,
        businessId: businessId, // Ensure the item has the string businessId
      });
      return grouped;
    }, {} as Record<string, CartItem[]>);
  },
};

// Server-side cart service
export const cartApi = {
  // Get all items in the cart
  getCartItems: async (): Promise<CartResponse> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        // Fallback to local storage if not authenticated
        const items = localCartService.getCartItems();
        const totalAmount = localCartService.getCartTotal();
        return { items, totalAmount };
      }

      const response = await fetch(`${API_URL}/api/customer/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch cart items");
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching cart items:", error);

      // Fallback to local storage on error
      const items = localCartService.getCartItems();
      const totalAmount = localCartService.getCartTotal();
      return { items, totalAmount };
    }
  },

  // Add an item to the cart
  addToCart: async (
    serviceId: string,
    quantity: number = 1
  ): Promise<CartResponse> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        // Fallback to local storage if not authenticated
        const service = await api.get(`/services/${serviceId}`);
        localCartService.addToCart(
          service.data,
          service.data.businessId?.name,
          quantity
        );
        const items = localCartService.getCartItems();
        const totalAmount = localCartService.getCartTotal();
        return {
          items,
          totalAmount,
          message: "Item added to cart",
        };
      }

      const response = await fetch(`${API_URL}/api/customer/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serviceId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add item to cart");
      }

      return response.json();
    } catch (error) {
      console.error("Error adding item to cart:", error);
      throw error;
    }
  },

  // Update item quantity in the cart
  updateCartItemQuantity: async (
    serviceId: string,
    quantity: number
  ): Promise<CartResponse> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        // Fallback to local storage if not authenticated
        localCartService.updateCartItemQuantity(serviceId, quantity);
        const items = localCartService.getCartItems();
        const totalAmount = localCartService.getCartTotal();
        return {
          items,
          totalAmount,
          message: "Cart updated",
        };
      }

      const response = await fetch(
        `${API_URL}/api/customer/cart/${serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update cart item");
      }

      return response.json();
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  },

  // Remove an item from the cart
  removeFromCart: async (serviceId: string): Promise<CartResponse> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        // Fallback to local storage if not authenticated
        localCartService.removeFromCart(serviceId);
        const items = localCartService.getCartItems();
        const totalAmount = localCartService.getCartTotal();
        return {
          items,
          totalAmount,
          message: "Item removed from cart",
        };
      }

      const response = await fetch(
        `${API_URL}/api/customer/cart/${serviceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove item from cart");
      }

      return response.json();
    } catch (error) {
      console.error("Error removing item from cart:", error);
      throw error;
    }
  },

  // Clear the entire cart
  clearCart: async (): Promise<CartResponse> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        // Fallback to local storage if not authenticated
        localCartService.clearCart();
        return {
          items: [],
          totalAmount: 0,
          message: "Cart cleared",
        };
      }

      const response = await fetch(`${API_URL}/api/customer/cart`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to clear cart");
      }

      return response.json();
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  },

  // Check if a service is already in the cart
  isInCart: async (serviceId: string): Promise<boolean> => {
    try {
      const { items } = await cartApi.getCartItems();
      return items.some((item) => item.serviceId === serviceId);
    } catch (error) {
      console.error("Error checking if item is in cart:", error);
      return localCartService.isInCart(serviceId);
    }
  },

  // Get cart items grouped by business
  getCartItemsByBusiness: async (): Promise<Record<string, CartItem[]>> => {
    try {
      const { items } = await cartApi.getCartItems();

      return items.reduce((grouped, item) => {
        // Ensure businessId is a string
        const businessId =
          typeof item.businessId === "object" && item.businessId._id
            ? item.businessId._id.toString()
            : item.businessId.toString();

        if (!grouped[businessId]) {
          grouped[businessId] = [];
        }

        grouped[businessId].push({
          ...item,
          businessId: businessId, // Ensure the item has the string businessId
        });
        return grouped;
      }, {} as Record<string, CartItem[]>);
    } catch (error) {
      console.error("Error getting cart items by business:", error);
      return localCartService.getCartItemsByBusiness();
    }
  },
};

// For backward compatibility
export const cartService = localCartService;
