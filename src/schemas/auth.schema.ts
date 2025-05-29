import { z } from "zod";

export const registerSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, "Name must be at least 2 characters long")
        .max(50, "Name must be less than 50 characters"),
      email: z.string().email("Invalid email format"),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
      confirmPassword: z
        .string()
        .min(6, "Confirm password must be at least 6 characters long"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
