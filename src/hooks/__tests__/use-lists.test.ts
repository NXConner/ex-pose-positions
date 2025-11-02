import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useLists } from "@/hooks/use-lists";

vi.mock("@/services/firebase", () => ({
  getFirebase: vi.fn(() => ({
    db: {
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({
            onSnapshot: vi.fn((callback) => {
              callback({ docs: [] });
              return () => {};
            }),
          })),
        })),
      })),
    },
  })),
  ensureAnonAuth: vi.fn(() => Promise.resolve({ uid: "user1" } as any)),
}));

describe("useLists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should initialize with empty lists", async () => {
    const { result } = renderHook(() => useLists());

    await waitFor(() => {
      expect(result.current.lists).toBeDefined();
    });

    expect(result.current.lists).toEqual({});
  });

  it("should add position to list", async () => {
    const { result } = renderHook(() => useLists());

    await waitFor(() => {
      expect(result.current.addToList).toBeDefined();
    });

    if (result.current.addToList) {
      await result.current.addToList("favorites", 1);
      // Verify list was updated
      expect(result.current.lists?.favorites).toContain(1);
    }
  });

  it("should remove position from list", async () => {
    const { result } = renderHook(() => useLists());

    await waitFor(() => {
      expect(result.current.removeFromList).toBeDefined();
    });

    // First add
    if (result.current.addToList) {
      await result.current.addToList("favorites", 1);
    }

    // Then remove
    if (result.current.removeFromList) {
      await result.current.removeFromList("favorites", 1);
      expect(result.current.lists?.favorites).not.toContain(1);
    }
  });
});

