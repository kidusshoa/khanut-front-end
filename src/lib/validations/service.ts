import { z } from "zod";

// Base service schema
export const serviceBaseSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  businessId: z.string(),
  serviceType: z.enum(["appointment", "product", "in_person"]),
  images: z.any().optional(),
});

// Appointment service schema
export const appointmentServiceSchema = serviceBaseSchema.extend({
  serviceType: z.literal("appointment"),
  duration: z.coerce.number().min(15, "Duration must be at least 15 minutes"),
  availability: z.object({
    days: z.array(z.string()).min(1, "Select at least one day"),
    startTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    endTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  }),
});

// Product service schema
export const productServiceSchema = serviceBaseSchema.extend({
  serviceType: z.literal("product"),
  inventory: z.coerce.number().nonnegative("Inventory must be 0 or positive"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  weight: z.coerce.number().optional(),
  dimensions: z
    .object({
      length: z.coerce.number(),
      width: z.coerce.number(),
      height: z.coerce.number(),
    })
    .optional(),
  shippingInfo: z
    .object({
      freeShipping: z.boolean().default(false),
      shippingCost: z.coerce
        .number()
        .nonnegative("Shipping cost must be 0 or positive"),
    })
    .optional(),
});

// In-person service schema
export const inPersonServiceSchema = serviceBaseSchema.extend({
  serviceType: z.literal("in_person"),
});

// Combined service schema using discriminated union
export const serviceSchema = z.discriminatedUnion("serviceType", [
  appointmentServiceSchema,
  productServiceSchema,
  inPersonServiceSchema,
]);

// Appointment booking schema
export const appointmentBookingSchema = z.object({
  serviceId: z.string(),
  businessId: z.string(),
  customerId: z.string(),
  staffId: z.string().optional(),
  date: z.string(),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional().default(false),
  recurrencePattern: z
    .enum(["daily", "weekly", "biweekly", "monthly"])
    .optional(),
  recurrenceEndDate: z.string().optional(),
  recurrenceCount: z.number().optional(),
});

// Recurring appointment schema
export const recurringAppointmentSchema = z.object({
  serviceId: z.string(),
  businessId: z.string(),
  customerId: z.string(),
  staffId: z.string().optional(),
  recurrencePattern: z.enum(["daily", "weekly", "biweekly", "monthly"]),
  startDate: z.string(),
  endDate: z.string().optional(),
  recurrenceCount: z.number().optional(),
  dayOfWeek: z.number().min(0).max(6).optional(), // 0-6 for Sunday-Saturday
  dayOfMonth: z.number().min(1).max(31).optional(), // 1-31
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  notes: z.string().optional(),
});

// Order schema
export const orderItemSchema = z.object({
  serviceId: z.string(),
  quantity: z.coerce.number().positive("Quantity must be positive"),
});

export const orderSchema = z.object({
  customerId: z.string(),
  businessId: z.string(),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  shippingAddress: z.object({
    street: z.string().min(3, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().optional(),
    postalCode: z.string().min(2, "Postal code is required"),
    country: z.string().min(2, "Country is required"),
  }),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().optional(),
});

// Types
export type ServiceInput = z.infer<typeof serviceSchema>;
export type AppointmentServiceInput = z.infer<typeof appointmentServiceSchema>;
export type ProductServiceInput = z.infer<typeof productServiceSchema>;
export type InPersonServiceInput = z.infer<typeof inPersonServiceSchema>;
export type AppointmentBookingInput = z.infer<typeof appointmentBookingSchema>;
export type RecurringAppointmentInput = z.infer<
  typeof recurringAppointmentSchema
>;
export type OrderInput = z.infer<typeof orderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
