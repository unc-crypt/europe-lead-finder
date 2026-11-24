import { z } from "zod";

export const emailSchema = z.string().trim().email("Enter a valid email address.").max(255);
export const passwordSchema = z.string().min(8, "Password must contain at least 8 characters.").max(128, "Password must be at most 128 characters.");
export const loginSchema = z.object({ email: emailSchema, password: passwordSchema });
export const signupSchema = loginSchema.extend({
  first_name: z.string().trim().min(1, "First name is required.").max(100),
  last_name: z.string().trim().min(1, "Last name is required.").max(100),
  company: z.string().trim().max(255),
});
export const resetSchema = z.object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((values) => values.password === values.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] });
export function authError(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
