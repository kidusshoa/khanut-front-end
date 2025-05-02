import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Package, Plus, Minus } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  businessId: string;
  serviceType: "product";
  inventory: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

interface InventoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onUpdate: (productId: string, inventory: number, reason?: string) => void;
}

export function InventoryEditModal({
  isOpen,
  onClose,
  product,
  onUpdate,
}: InventoryEditModalProps) {
  const [inventory, setInventory] = useState(product.inventory);
  const [reason, setReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle inventory change
  const handleInventoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setInventory(value);
    }
  };

  // Increase inventory
  const increaseInventory = () => {
    setInventory(inventory + 1);
  };

  // Decrease inventory
  const decreaseInventory = () => {
    if (inventory > 0) {
      setInventory(inventory - 1);
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (inventory === product.inventory) {
      onClose();
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdate(product._id, inventory, reason);
      onClose();
    } catch (error) {
      console.error("Failed to update inventory:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Inventory</DialogTitle>
          <DialogDescription>
            Update the inventory level for {product.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Product Information */}
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                Current inventory: {product.inventory}
              </p>
            </div>
          </div>

          <Separator />

          {/* Inventory Input */}
          <div className="space-y-2">
            <Label htmlFor="inventory">New Inventory Level</Label>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decreaseInventory}
                disabled={inventory <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="inventory"
                type="number"
                min="0"
                value={inventory}
                onChange={handleInventoryChange}
                className="mx-2 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={increaseInventory}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Update (Optional)</Label>
            <Input
              id="reason"
              placeholder="e.g., New shipment, Inventory correction"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Inventory Change Summary */}
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="flex justify-between text-sm">
              <span>Previous inventory:</span>
              <span>{product.inventory}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>New inventory:</span>
              <span>{inventory}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Change:</span>
              <span
                className={
                  inventory > product.inventory
                    ? "text-green-600"
                    : inventory < product.inventory
                    ? "text-red-600"
                    : ""
                }
              >
                {inventory > product.inventory && "+"}
                {inventory - product.inventory}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || inventory === product.inventory}
          >
            Update Inventory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
