"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  businessId: string;
}

export function AddToCartModal({
  isOpen,
  onClose,
  service,
  businessId,
}: AddToCartModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, cart } = useCartStore();

  const maxQuantity = service?.inventory || 10;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= maxQuantity) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to add items to cart");
      router.push("/login");
      return;
    }

    try {
      setIsAdding(true);
      
      // Add to cart store
      addToCart({
        serviceId: service._id,
        name: service.name,
        price: service.price,
        quantity,
        businessId,
        image: service.images?.[0] || null,
      });
      
      toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`);
      onClose();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleViewCart = () => {
    router.push(`/customer/${session?.user?.id}/cart`);
    onClose();
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
          <DialogTitle className="text-xl font-bold">Add to Cart</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Product</Label>
            <p className="text-gray-700">{service?.name}</p>
          </div>

          <div>
            <Label className="text-base font-medium">Price</Label>
            <p className="text-gray-700">{formatPrice(service?.price || 0)}</p>
          </div>

          <div>
            <Label className="text-base font-medium">Quantity</Label>
            <div className="flex items-center mt-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 mx-2 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={quantity >= maxQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {maxQuantity < 10 && (
              <p className="text-sm text-orange-600 mt-1">
                Only {maxQuantity} items in stock
              </p>
            )}
          </div>

          <div>
            <Label className="text-base font-medium">Total</Label>
            <p className="text-lg font-semibold text-orange-600">
              {formatPrice((service?.price || 0) * quantity)}
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="sm:flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={handleViewCart}
            className="sm:flex-1"
          >
            View Cart
          </Button>
          <Button 
            type="button" 
            onClick={handleAddToCart} 
            disabled={isAdding}
            className="bg-orange-600 hover:bg-orange-700 sm:flex-1"
          >
            {isAdding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4" />
            )}
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
