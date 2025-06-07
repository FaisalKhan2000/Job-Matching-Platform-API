import jwt from "jsonwebtoken";
import { afterEach } from "node:test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JwtPayload } from "../../../types/types";
import { AppError } from "../../../utils/appError";
import { createToken, verifyToken } from "../../../utils/jwt";

describe("JWT Utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const validPayload: JwtPayload = {
    userId: "1",
    role: "user",
    email: "user@gmail.com",
  };

  describe("Token Creation", () => {
    it("should create token successfully", () => {
      const token = createToken(validPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT format: header.payload.signature
    });

    it("should create unique tokens for same payload", () => {
      // Set initial time
      vi.setSystemTime(new Date("2025-01-01"));
      const firstToken = createToken(validPayload);

      // Advance time by 1 second
      vi.setSystemTime(new Date("2025-01-01").getTime() + 1000);
      const secondToken = createToken(validPayload);

      expect(firstToken).not.toBe(secondToken);

      // Decode both tokens to verify payload
      const firstDecoded = jwt.decode(firstToken) as any;
      const secondDecoded = jwt.decode(secondToken) as any;

      // Core payload should match
      expect(firstDecoded.userId).toBe(validPayload.userId);
      expect(firstDecoded.role).toBe(validPayload.role);
      expect(firstDecoded.email).toBe(validPayload.email);

      // But timestamps should differ
      expect(firstDecoded.iat).not.toBe(secondDecoded.iat);
    });

    it("should handle payload with special characters", () => {
      const specialPayload = {
        ...validPayload,
        email: "user+special@example.com",
      };
      expect(() => createToken(specialPayload)).not.toThrow();
    });
  });

  describe("Token Verification", () => {
    it("should verify and decode token correctly", () => {
      const token = createToken(validPayload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(validPayload.userId);
      expect(decoded.role).toBe(validPayload.role);
      expect(decoded.email).toBe(validPayload.email);
    });

    it("should reject invalid token format", () => {
      expect(() => verifyToken("invalid-token")).toThrow(AppError);
    });

    it("should reject tampered token", () => {
      const token = createToken(validPayload);
      const tamperedToken = token.slice(0, -5) + "xxxxx";

      expect(() => verifyToken(tamperedToken)).toThrow(AppError);
    });

    it("should reject expired token", () => {
      // Create an expired token using a negative expiration
      const expiredToken = jwt.sign(
        validPayload,
        process.env.JWT_SECRET || "test-secret",
        {
          expiresIn: -1, // Token that expired immediately
        }
      );

      expect(() => verifyToken(expiredToken)).toThrow(AppError);
    });
  });

  describe("Edge Cases", () => {
    it("should handle maximum payload size", () => {
      const largePayload = {
        ...validPayload,
        data: "x".repeat(4096), // Max JWT size is typically 4KB
      };
      expect(() => createToken(largePayload)).not.toThrow();
    });

    it("should reject null values in payload", () => {
      const invalidPayload = {
        ...validPayload,
        email: null,
      };
      expect(() => createToken(invalidPayload as any)).toThrow();
    });

    it("should reject undefined values in payload", () => {
      const invalidPayload = {
        ...validPayload,
        role: undefined,
      };
      expect(() => createToken(invalidPayload as any)).toThrow();
    });
  });

  describe("Security Aspects", () => {
    it("should use correct algorithm (HS256)", () => {
      const token = createToken(validPayload);
      const [header] = token.split(".");
      const decodedHeader = JSON.parse(
        Buffer.from(header, "base64url").toString()
      );

      expect(decodedHeader.alg).toBe("HS256");
    });

    it("should not accept token signed with different secret", () => {
      // Create a token with a different secret
      const tokenWithDifferentSecret = jwt.sign(validPayload, "wrong-secret");

      // Should fail verification with our actual secret
      expect(() => verifyToken(tokenWithDifferentSecret)).toThrow(AppError);
    });
  });
});
