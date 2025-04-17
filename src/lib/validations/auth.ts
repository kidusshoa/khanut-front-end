import * as z from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*]/,
      "Password must contain at least one special character"
    ),
  role: z.enum(["business", "customer", "admin"]),
});

export const twoFactorSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type TwoFactorInput = z.infer<typeof twoFactorSchema>;
