import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema, resetSchema } from "@/lib/auth-validation";
import { bearerToken, isServiceAuthorized, isUserAuthorized } from "../../supabase/functions/_shared/access";

describe("authentication validation", () => {
  it("requires a valid email", () => {
    expect(loginSchema.safeParse({ email: "invalid", password: "12345678" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "user@example.com", password: "12345678" }).success).toBe(true);
  });
  it("requires a minimum of 8 password characters", () => {
    expect(loginSchema.safeParse({ email: "user@example.com", password: "1234567" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "user@example.com", password: "12345678" }).success).toBe(true);
  });
  it("requires first name", () => {
    expect(signupSchema.safeParse({ email: "user@example.com", password: "12345678", first_name: " ", last_name: "Smith", company: "" }).success).toBe(false);
  });
  it("requires last name", () => {
    expect(signupSchema.safeParse({ email: "user@example.com", password: "12345678", first_name: "Sam", last_name: " ", company: "" }).success).toBe(false);
  });
  it("requires matching new passwords", () => {
    expect(resetSchema.safeParse({ password: "12345678", confirmPassword: "12345679" }).success).toBe(false);
    expect(resetSchema.safeParse({ password: "12345678", confirmPassword: "12345678" }).success).toBe(true);
  });
});
describe("backend authorization", () => {
  const serviceKey = "test-service-credential";
  it("background access allows exactly the service credential", () => {
    expect(isServiceAuthorized(`Bearer ${serviceKey}`, serviceKey)).toBe(true);
    for (const header of [null, "Bearer anon-key", "Bearer normal-user-jwt", `Bearer ${serviceKey}x`, `Basic ${serviceKey}`]) expect(isServiceAuthorized(header, serviceKey)).toBe(false);
    expect(isServiceAuthorized(`Bearer ${serviceKey}`, undefined)).toBe(false);
  });
  it("user access requires a validated signed-in identity", async () => {
    expect(await isUserAuthorized(null, async () => true)).toBe(false);
    expect(await isUserAuthorized("Bearer invalid", async () => false)).toBe(false);
    expect(await isUserAuthorized("Bearer signed-in-token", async token => token === "signed-in-token")).toBe(true);
    expect(await isUserAuthorized("Bearer signed-in-token", async () => { throw new Error("expired"); })).toBe(false);
  });
  it("does not accept malformed Authorization headers", () => {
    expect(bearerToken("Bearer token extra")).toBe(null);
    expect(bearerToken("Basic token")).toBe(null);
  });
});
