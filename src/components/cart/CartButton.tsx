'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface CartButtonProps {
  customerId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function CartButton({ customerId, variant = 'outline', size = 'icon' }: CartButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { cartItems } = useCart();
  
  const cartCount = cartItems?.length || 0;
  
  const handleClick = () => {
    if (!session) {
      toast.error('Please log in to view your cart');
      if (customerId) {
        router.push(`/customer/${customerId}/login`);
      } else {
        router.push('/login');
      }
      return;
    }
    
    if (customerId) {
      router.push(`/customer/${customerId}/cart`);
    } else {
      router.push('/cart');
    }
  };
  
  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleClick}
      className="relative"
    >
      <ShoppingCart className="h-5 w-5" />
      {cartCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {cartCount > 99 ? '99+' : cartCount}
        </Badge>
      )}
    </Button>
  );
}
