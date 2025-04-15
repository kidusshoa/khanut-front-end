import * as z from "zod";

export const businessRegistrationSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Business category is required"),
  city: z.string().min(2, "City is required"),
  latitude: z.string().or(z.number()),
  longitude: z.string().or(z.number()),
  email: z.string().email("Invalid email").optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-]{10,}$/, "Invalid phone number format")
    .optional(),
  profilePicture: z.instanceof(File).optional(),
});

export type BusinessRegistrationInput = z.infer<
  typeof businessRegistrationSchema
>;
