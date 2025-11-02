import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { usePlans } from "@/hooks/use-plans";

// Mock Firebase
vi.mock("@/services/firebase", () => ({
  getFirebase: vi.fn(() => ({
    db: {
      doc: vi.fn(() => ({
        onSnapshot: vi.fn((callback) => {
          callback({
            data: () => ({
              status: "pending",
              poses: [],
              time: "",
              place: "",
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

describe("Plans Workflow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should propose a plan", async () => {
    const { result } = renderHook(() => usePlans());

    await waitFor(() => {
      expect(result.current.proposePlan).toBeDefined();
    });

    const planData = {
      poses: [1, 2, 3],
      time: "2024-01-01T20:00",
      place: "Home",
    };

    act(() => {
      result.current.proposePlan(planData);
    });

    await waitFor(() => {
      expect(result.current.plan?.poses).toEqual([1, 2, 3]);
    });
  });

  it("should respond to a plan", async () => {
    const { result } = renderHook(() => usePlans());

    await waitFor(() => {
      expect(result.current.respondPlan).toBeDefined();
    });

    act(() => {
      result.current.respondPlan("accepted");
    });

    await waitFor(() => {
      expect(result.current.plan?.status).toBe("accepted");
    });
  });

  it("should update notes", async () => {
    const { result } = renderHook(() => usePlans());

    await waitFor(() => {
      expect(result.current.updateNotes).toBeDefined();
    });

    act(() => {
      result.current.updateNotes("Sounds great!");
    });

    await waitFor(() => {
      expect(result.current.plan?.notes).toBe("Sounds great!");
    });
  });

  it("should handle complete workflow", async () => {
    const { result } = renderHook(() => usePlans());

    // Propose
    act(() => {
      result.current.proposePlan({
        poses: [1, 2],
        time: "2024-01-01T20:00",
        place: "Home",
      });
    });

    await waitFor(() => {
      expect(result.current.plan?.status).toBe("pending");
    });

    // Respond
    act(() => {
      result.current.respondPlan("accepted");
    });

    await waitFor(() => {
      expect(result.current.plan?.status).toBe("accepted");
    });

    // Update notes
    act(() => {
      result.current.updateNotes("Can't wait!");
    });

    await waitFor(() => {
      expect(result.current.plan?.notes).toBe("Can't wait!");
    });
  });
});

