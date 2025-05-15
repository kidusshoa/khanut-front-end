import * as z from "zod";

export const inventoryUpdateSchema = z.object({
  inventory: z
    .number()
    .int("Inventory must be a whole number")
    .min(0, "Inventory cannot be negative"),
  reason: z.string().optional(),
});

export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>;
