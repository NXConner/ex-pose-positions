import { describe, it, expect, vi } from "vitest";
import { generateImageSrcSet, supportsWebP, preloadImage } from "../image-utils";

describe("Image Utils", () => {
  describe("generateImageSrcSet", () => {
    it("should generate srcset for image", () => {
      const result = generateImageSrcSet("images/positions", "test.png");
      
      expect(result.src).toBe("images/positions/test.png");
      expect(result.srcSet).toBeDefined();
    });

    it("should return custom image if exists in localStorage", () => {
      localStorage.setItem("custom_image_123", "data:image/png;base64,test");
      
      const result = generateImageSrcSet("images/positions", "123-test.png");
      
      expect(result.src).toBe("data:image/png;base64,test");
      
      localStorage.removeItem("custom_image_123");
    });
  });

  describe("supportsWebP", () => {
    it("should return a promise", () => {
      const result = supportsWebP();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe("preloadImage", () => {
    it("should return a promise", () => {
      const result = preloadImage("test.jpg");
      expect(result).toBeInstanceOf(Promise);
    });

    it("should resolve when image loads", async () => {
      // Mock Image constructor
      const mockImage = {
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        src: "",
      };
      
      global.Image = vi.fn(() => mockImage as any) as any;
      
      const promise = preloadImage("test.jpg");
      
      // Simulate load
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 10);
      
      await expect(promise).resolves.toBeUndefined();
    });
  });
});

