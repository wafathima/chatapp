import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must have at least 3 characters")
    .max(30, "Username must have at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can contain letters, numbers, and underscores only"
    ),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(255)
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must have at least 8 characters")
    .max(72, "Password must not exceed 72 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(255)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
