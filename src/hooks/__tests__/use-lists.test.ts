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
      expect(result.current.mine).toBeDefined();
    });

    expect(result.current.mine).toEqual([]);
    expect(result.current.theirs).toEqual([]);
  });

  it("should toggle position in list", async () => {
    const { result } = renderHook(() => useLists());

    await waitFor(() => {
      expect(result.current.togglePoseInList).toBeDefined();
    });

    if (result.current.togglePoseInList) {
      await result.current.togglePoseInList(1, "favorites", true);
      // Verify pose was added
      const favoriteItem = result.current.mine.find(item => item.poseId === 1);
      expect(favoriteItem).toBeDefined();
    }
  });

  it("should remove position from list", async () => {
    const { result } = renderHook(() => useLists());

    await waitFor(() => {
      expect(result.current.togglePoseInList).toBeDefined();
    });

    // First add
    if (result.current.togglePoseInList) {
      await result.current.togglePoseInList(1, "favorites", true);
      const before = result.current.mine.filter(item => item.poseId === 1);
      expect(before.length).toBeGreaterThan(0);
      
      // Then remove
      await result.current.togglePoseInList(1, "favorites", false);
      const after = result.current.mine.filter(item => item.poseId === 1);
      expect(after.length).toBe(0);
    }
  });
});

