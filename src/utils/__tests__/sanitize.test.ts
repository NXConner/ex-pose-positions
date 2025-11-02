import { describe, it, expect } from "vitest";
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
  sanitizeForFirebase,
  validatePositionId,
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
  });
});

