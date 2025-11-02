import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useShared } from "@/hooks/use-shared";

// Mock Firebase
vi.mock("@/services/firebase", () => ({
  getFirebase: vi.fn(() => ({
    db: {
      doc: vi.fn(() => ({
        onSnapshot: vi.fn((callback) => {
          callback({ data: () => ({ a: "user1", b: "user2", linked: false, updatedAt: Date.now() }) });
          return () => {};
        }),
      })),
    },
  })),
  ensureAnonAuth: vi.fn(() => Promise.resolve({ uid: "user1" } as any)),
}));

describe("Partner Linking Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle partner linking workflow", async () => {
    const { result } = renderHook(() => useShared());

    await waitFor(() => {
      expect(result.current.me).toBeDefined();
    });

    // Test partner save
    if (result.current.savePartner) {
      await result.current.savePartner("user2");
      expect(result.current.partner).toBe("user2");
    }
  });
});

