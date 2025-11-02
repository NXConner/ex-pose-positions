import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePlans } from "@/hooks/use-plans";

vi.mock("@/services/firebase", () => ({
  getFirebase: vi.fn(() => ({
    db: {
      doc: vi.fn(() => ({
        onSnapshot: vi.fn((callback) => {
          callback({
            data: () => ({
              status: "pending",
              poses: [1, 2, 3],
              time: "2024-01-01T20:00",
              place: "Home",
              notes: "",
            }),
          });
          return () => {};
        }),
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            set: vi.fn(() => Promise.resolve()),
          })),
        })),
      })),
    },
  })),
  ensureAnonAuth: vi.fn(() => Promise.resolve({ uid: "user1" } as any)),
}));

describe("usePlans", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load plan from Firestore", async () => {
    const { result } = renderHook(() => usePlans());

    await waitFor(() => {
      expect(result.current.plan).toBeDefined();
    });

    expect(result.current.plan?.status).toBe("pending");
    expect(result.current.plan?.poses).toEqual([1, 2, 3]);
  });

  it("should propose plan", async () => {
    const { result } = renderHook(() => usePlans());

    await waitFor(() => {
      expect(result.current.proposePlan).toBeDefined();
    });

    if (result.current.proposePlan) {
      await result.current.proposePlan({
        poses: [1, 2],
        time: "2024-01-01T20:00",
        place: "Home",
      });

      expect(result.current.plan?.poses).toEqual([1, 2]);
    }
  });

  it("should respond to plan", async () => {
    const { result } = renderHook(() => usePlans());

    await waitFor(() => {
      expect(result.current.respondPlan).toBeDefined();
    });

    if (result.current.respondPlan) {
      await result.current.respondPlan("accepted");
      expect(result.current.plan?.status).toBe("accepted");
    }
  });
});

