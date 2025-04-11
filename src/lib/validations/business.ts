import * as z from "zod";

export const businessRegistrationSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  businessAddress: z.string().min(5, "Address must be at least 5 characters"),
  businessType: z.string().min(2, "Business type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s-]{10,}$/, "Invalid phone number format"),
  taxId: z.string().optional(),
  website: z.string().url("Invalid website URL").optional(),
  profilePicture: z.instanceof(File).optional(),
});

export type BusinessRegistrationInput = z.infer<
  typeof businessRegistrationSchema
>;
