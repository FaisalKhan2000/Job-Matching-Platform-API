import { describe, it, expect, vi } from "vitest";
import { comparePassword, hashPassword } from "../../../utils/password";
import { AppError } from "../../../utils/appError";

describe("Password Utils", () => {
  const testPassword = "TestPassword123!";

  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      const hashedPassword = await hashPassword(testPassword);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(testPassword);
      expect(typeof hashedPassword).toBe("string");
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for same password", async () => {
      const firstHash = await hashPassword(testPassword);
      const secondHash = await hashPassword(testPassword);

      expect(firstHash).not.toBe(secondHash);
    });

    it("should handle empty password", async () => {
      const hashedPassword = await hashPassword("");
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe("string");
    });
  });

  describe("comparePassword", () => {
    it("should return true for matching password", async () => {
      const hashedPassword = await hashPassword(testPassword);
      const isMatch = await comparePassword(testPassword, hashedPassword);

      expect(isMatch).toBe(true);
    });

    it("should return false for non-matching password", async () => {
      const hashedPassword = await hashPassword(testPassword);
      const isMatch = await comparePassword("wrongPassword", hashedPassword);

      expect(isMatch).toBe(false);
    });

    it("should handle empty password comparison", async () => {
      const hashedPassword = await hashPassword(testPassword);
      const isMatch = await comparePassword("", hashedPassword);

      expect(isMatch).toBe(false);
    });

    it("should return false for invalid hash format", async () => {
      const isMatch = await comparePassword(testPassword, "invalid-hash");
      expect(isMatch).toBe(false);
    });
  });
});
