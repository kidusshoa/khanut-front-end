import * as z from "zod";

export const businessRegistrationSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Business category is required"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Address is required"),
  latitude: z.number(),
  longitude: z.number(),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/, "Invalid phone number format"),
  website: z.string().url("Invalid website URL").optional(),
  profilePicture: z.any().optional(), // For file upload - renamed to match backend
});

export type BusinessRegistrationInput = z.infer<
  typeof businessRegistrationSchema
>;
