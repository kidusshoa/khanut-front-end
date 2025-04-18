import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
  businessId: string;
  image: string | null;
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      
      addToCart: (item: CartItem) => {
        const { cart } = get();
        const existingItem = cart.find((i) => i.serviceId === item.serviceId);
        
        if (existingItem) {
          // Update quantity if item already exists
          set({
            cart: cart.map((i) =>
              i.serviceId === item.serviceId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          // Add new item
          set({ cart: [...cart, item] });
        }
      },
      
      removeFromCart: (serviceId: string) => {
        const { cart } = get();
        set({
          cart: cart.filter((item) => item.serviceId !== serviceId),
        });
      },
      
      updateQuantity: (serviceId: string, quantity: number) => {
        const { cart } = get();
        set({
          cart: cart.map((item) =>
            item.serviceId === serviceId ? { ...item, quantity } : item
          ),
        });
      },
      
      clearCart: () => {
        set({ cart: [] });
      },
      
      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getItemCount: () => {
        const { cart } = get();
        return cart.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "khanut-cart",
    }
  )
);
