import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useShared } from "@/hooks/use-shared";

vi.mock("@/services/firebase", () => ({
  getFirebase: vi.fn(() => ({
    db: {
      doc: vi.fn(() => ({
        onSnapshot: vi.fn((callback) => {
          callback({
            data: () => ({
              a: "user1",
              b: "user2",
              linked: true,
              updatedAt: Date.now(),
            }),
          });
          return () => {};
        }),
        set: vi.fn(() => Promise.resolve()),
        update: vi.fn(() => Promise.resolve()),
      })),
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve({ exists: false })),
        })),
      })),
    },
  })),
  ensureAnonAuth: vi.fn(() => Promise.resolve({ uid: "user1" } as any)),
}));

describe("useShared", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should initialize with current user", async () => {
    const { result } = renderHook(() => useShared());

    await waitFor(() => {
      expect(result.current.me).toBeDefined();
    });

    expect(result.current.me).toBe("user1");
  });

  it("should save partner ID", async () => {
    const { result } = renderHook(() => useShared());

    await waitFor(() => {
      expect(result.current.me).toBeDefined();
    });

    if (result.current.savePartner) {
      await result.current.savePartner("user2");
      expect(result.current.partner).toBe("user2");
    }
  });

  it("should detect linked status", async () => {
    const { result } = renderHook(() => useShared());

    await waitFor(() => {
      expect(result.current.shared).toBeDefined();
    });

    expect(result.current.shared?.linked).toBe(true);
  });
});

