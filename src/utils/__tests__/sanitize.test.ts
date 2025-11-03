import { describe, it, expect } from "vitest";
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
  sanitizeForFirebase,
  validatePositionId,
  sanitizeFileName,
  safeJsonParse,
  validateEmail,
} from "@/utils/sanitize";

describe("sanitize", () => {
  describe("sanitizeHtml", () => {
    it("should remove script tags", () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeHtml(input);
      expect(result).toBe("Hello");
    });

    it("should escape HTML entities", () => {
      const input = '<div>Hello</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain("<div>");
    });
  });

  describe("sanitizeText", () => {
    it("should escape HTML entities", () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeText(input);
      expect(result).toBe("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
    });

    it("should handle normal text", () => {
      const input = "Hello World";
      const result = sanitizeText(input);
      expect(result).toBe("Hello World");
    });
  });

  describe("sanitizeUrl", () => {
    it("should allow http URLs", () => {
      const url = "http://example.com";
      const result = sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it("should allow https URLs", () => {
      const url = "https://example.com";
      const result = sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it("should reject javascript: URLs", () => {
      const url = "javascript:alert('xss')";
      const result = sanitizeUrl(url);
      expect(result).toBe("");
    });

    it("should reject data: URLs", () => {
      const url = "data:text/html,<script>alert('xss')</script>";
      const result = sanitizeUrl(url);
      expect(result).toBe("");
    });

    it("should reject invalid URLs", () => {
      const url = "not-a-url";
      const result = sanitizeUrl(url);
      expect(result).toBe("");
    });
  });

  describe("sanitizeForFirebase", () => {
    it("should sanitize normal text", () => {
      const input = "Hello World";
      const result = sanitizeForFirebase(input);
      expect(result).toBe("Hello World");
    });

    it("should remove control characters", () => {
      const input = "Hello\x00World";
      const result = sanitizeForFirebase(input);
      expect(result).toBe("HelloWorld");
    });

    it("should respect max length", () => {
      const input = "a".repeat(2000);
      const result = sanitizeForFirebase(input, 100);
      expect(result).toBeNull();
    });

    it("should trim whitespace", () => {
      const input = "  Hello World  ";
      const result = sanitizeForFirebase(input);
      expect(result).toBe("Hello World");
    });

    it("should return null for empty strings", () => {
      const result = sanitizeForFirebase("   ");
      expect(result).toBeNull();
    });
  });

  describe("validatePositionId", () => {
    it("should accept valid number", () => {
      expect(validatePositionId(1)).toBe(1);
      expect(validatePositionId(100)).toBe(100);
    });

    it("should accept valid string number", () => {
      expect(validatePositionId("1")).toBe(1);
      expect(validatePositionId("100")).toBe(100);
    });

    it("should reject negative numbers", () => {
      expect(validatePositionId(-1)).toBeNull();
    });

    it("should reject NaN", () => {
      expect(validatePositionId(NaN)).toBeNull();
      expect(validatePositionId("not-a-number")).toBeNull();
    });

    it("should reject invalid types", () => {
      expect(validatePositionId(null)).toBeNull();
      expect(validatePositionId(undefined)).toBeNull();
      expect(validatePositionId({})).toBeNull();
    });

    it("should reject numbers exceeding limit", () => {
      expect(validatePositionId(1000001)).toBeNull();
    });

    it("should reject Infinity", () => {
      expect(validatePositionId(Infinity)).toBeNull();
    });
  });

  describe("sanitizeFileName", () => {
    it("should sanitize normal filename", () => {
      expect(sanitizeFileName("test.png")).toBe("test.png");
    });

    it("should remove path traversal attempts", () => {
      expect(sanitizeFileName("../../../etc/passwd")).toBe("etcpasswd");
    });

    it("should remove special characters", () => {
      expect(sanitizeFileName("test<script>.png")).toBe("testscriptpng");
    });

    it("should limit length", () => {
      const longName = "a".repeat(300);
      expect(sanitizeFileName(longName).length).toBeLessThanOrEqual(255);
    });

    it("should handle empty string", () => {
      expect(sanitizeFileName("")).toBe("");
    });

    it("should handle non-string input", () => {
      expect(sanitizeFileName(null as any)).toBe("");
      expect(sanitizeFileName(undefined as any)).toBe("");
    });
  });

  describe("safeJsonParse", () => {
    it("should parse valid JSON", () => {
      const json = '{"key": "value"}';
      const result = safeJsonParse(json);
      expect(result).toEqual({ key: "value" });
    });

    it("should return null for invalid JSON", () => {
      const invalid = "{key: value}";
      expect(safeJsonParse(invalid)).toBeNull();
    });

    it("should return null for non-string input", () => {
      expect(safeJsonParse(null as any)).toBeNull();
      expect(safeJsonParse(123 as any)).toBeNull();
    });

    it("should reject deeply nested objects", () => {
      const deep = JSON.stringify({ level1: { level2: { level3: { level4: { level5: { level6: { level7: { level8: { level9: { level10: { level11: "deep" } } } } } } } } } } });
      expect(safeJsonParse(deep, 5)).toBeNull();
    });

    it("should accept valid nested objects within limit", () => {
      const nested = JSON.stringify({ a: { b: { c: "value" } } });
      expect(safeJsonParse(nested, 5)).toBeTruthy();
    });
  });

  describe("validateEmail", () => {
    it("should validate correct email format", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name+tag@example.co.uk")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(validateEmail("not-an-email")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
      expect(validateEmail("test.example.com")).toBe(false);
    });

    it("should reject emails exceeding length limit", () => {
      const longEmail = "a".repeat(250) + "@example.com";
      expect(validateEmail(longEmail)).toBe(false);
    });

    it("should handle non-string input", () => {
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(123 as any)).toBe(false);
    });
  });
});

