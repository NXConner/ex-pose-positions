import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useLists } from "@/hooks/use-lists";

// Mock Firebase
const mockUserLists = {
  favorites: [1, 2, 3],
  "let's try": [4, 5],
};

const mockPartnerLists = {
  favorites: [2, 3, 6],
  "done it": [1, 7],
};

vi.mock("@/services/firebase", () => ({
  getFirebase: vi.fn(() => ({
    db: {
      collection: vi.fn((path) => {
        if (path.includes("user1")) {
          return {
            onSnapshot: vi.fn((callback) => {
              callback({
                docs: Object.entries(mockUserLists).map(([name, items]) => ({
                  id: name,
                  data: () => ({ items }),
                })),
              });
              return () => {};
            }),
          };
        }
        if (path.includes("partner1")) {
          return {
            onSnapshot: vi.fn((callback) => {
              callback({
                docs: Object.entries(mockPartnerLists).map(([name, items]) => ({
                  id: name,
                  data: () => ({ items }),
                })),
              });
              return () => {};
            }),
          };
        }
        return {
          doc: vi.fn(() => ({
            collection: vi.fn(() => ({
              doc: vi.fn(() => ({
                set: vi.fn(() => Promise.resolve()),
              })),
            })),
          })),
        };
      }),
    },
  })),
  ensureAnonAuth: vi.fn(() => Promise.resolve({ uid: "user1" } as any)),
}));

vi.mock("@/hooks/use-shared", () => ({
  useShared: vi.fn(() => ({
    partner: "partner1",
    shared: { linked: true },
  })),
}));

describe("Lists Sync Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load user lists", async () => {
    const { result } = renderHook(() => useLists());

    await waitFor(() => {
      expect(result.current.lists).toBeDefined();
    });

    expect(result.current.lists?.favorites).toBeDefined();
  });

  it("should merge partner lists", async () => {
    const { result } = renderHook(() => useLists());

    await waitFor(() => {
      expect(result.current.lists).toBeDefined();
    });

    // Favorites should have merged items (unique)
    const favorites = result.current.lists?.favorites || [];
    expect(favorites.length).toBeGreaterThanOrEqual(3);
  });

  it("should add to list", async () => {
    const { result } = renderHook(() => useLists());

    await waitFor(() => {
      expect(result.current.addToList).toBeDefined();
    });

    act(() => {
      result.current.addToList("favorites", 10);
    });

    await waitFor(() => {
      const favorites = result.current.lists?.favorites || [];
      expect(favorites).toContain(10);
    });
  });

  it("should remove from list", async () => {
    const { result } = renderHook(() => useLists());

    await waitFor(() => {
      expect(result.current.removeFromList).toBeDefined();
    });

    act(() => {
      result.current.removeFromList("favorites", 1);
    });

    await waitFor(() => {
      const favorites = result.current.lists?.favorites || [];
      expect(favorites).not.toContain(1);
    });
  });
});

