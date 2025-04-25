import { Service } from "@/types/business";

export interface CartItem {
  serviceId: string;
  businessId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  businessName?: string;
}

export const cartService = {
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
  addToCart: (service: Service, businessName?: string, quantity: number = 1): CartItem[] => {
    if (typeof window === "undefined") return [];
    
    try {
      const cart = cartService.getCartItems();
      
      // Check if the item already exists in the cart
      const existingItemIndex = cart.findIndex(item => item.serviceId === service._id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item if it doesn't exist
        cart.push({
          serviceId: service._id,
          businessId: service.businessId,
          name: service.name,
          price: service.price,
          quantity,
          image: service.image,
          businessName
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
      const cart = cartService.getCartItems();
      
      // Find the item in the cart
      const itemIndex = cart.findIndex(item => item.serviceId === serviceId);
      
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
      let cart = cartService.getCartItems();
      
      // Filter out the item to remove
      cart = cart.filter(item => item.serviceId !== serviceId);
      
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
    const cart = cartService.getCartItems();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },

  // Get the total price of all items in the cart
  getCartTotal: (): number => {
    const cart = cartService.getCartItems();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  // Check if a service is already in the cart
  isInCart: (serviceId: string): boolean => {
    const cart = cartService.getCartItems();
    return cart.some(item => item.serviceId === serviceId);
  },

  // Get cart items grouped by business
  getCartItemsByBusiness: (): Record<string, CartItem[]> => {
    const cart = cartService.getCartItems();
    
    return cart.reduce((grouped, item) => {
      if (!grouped[item.businessId]) {
        grouped[item.businessId] = [];
      }
      
      grouped[item.businessId].push(item);
      return grouped;
    }, {} as Record<string, CartItem[]>);
  }
};
