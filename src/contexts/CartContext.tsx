'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CartItem } from '@/services/cart';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Create context
export const CartContext = createContext<{
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
}>({
  isCartOpen: false,
  setIsCartOpen: () => {},
  cartItems: [],
  cartCount: 0,
  cartTotal: 0,
});

export const useCartContext = () => useContext(CartContext);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = React.useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <CartContext.Provider
        value={{
          isCartOpen,
          setIsCartOpen,
          cartItems: [],
          cartCount: 0,
          cartTotal: 0,
        }}
      >
        {children}
      </CartContext.Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
