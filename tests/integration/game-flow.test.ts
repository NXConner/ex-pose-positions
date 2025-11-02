import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useGame } from "@/hooks/use-game";

// Mock Firebase
vi.mock("@/services/firebase", () => ({
  getFirebase: vi.fn(() => ({
    db: {
      doc: vi.fn(() => ({
        onSnapshot: vi.fn((callback) => {
          callback({
            data: () => ({
              active: false,
              startTime: null,
              currentPoseIndex: null,
              streak: 0,
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

describe("Game Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start a game session", async () => {
    const { result } = renderHook(() => useGame(100));

    await waitFor(() => {
      expect(result.current.game).toBeDefined();
    });

    expect(result.current.game?.active).toBe(false);

    act(() => {
      result.current.start();
    });

    await waitFor(() => {
      expect(result.current.game?.active).toBe(true);
    });

    expect(result.current.game?.startTime).toBeDefined();
  });

  it("should advance to next pose", async () => {
    const { result } = renderHook(() => useGame(100));

    await waitFor(() => {
      expect(result.current.start).toBeDefined();
    });

    act(() => {
      result.current.start();
    });

    await waitFor(() => {
      expect(result.current.game?.active).toBe(true);
    });

    const initialStreak = result.current.game?.streak || 0;

    act(() => {
      result.current.nextPose();
    });

    await waitFor(() => {
      expect(result.current.game?.streak).toBeGreaterThan(initialStreak);
    });
  });

  it("should end game session", async () => {
    const { result } = renderHook(() => useGame(100));

    act(() => {
      result.current.start();
    });

    await waitFor(() => {
      expect(result.current.game?.active).toBe(true);
    });

    act(() => {
      result.current.end();
    });

    await waitFor(() => {
      expect(result.current.game?.active).toBe(false);
    });
  });

  it("should track elapsed time", async () => {
    const { result } = renderHook(() => useGame(100));

    act(() => {
      result.current.start();
    });

    await waitFor(() => {
      expect(result.current.game?.active).toBe(true);
    });

    // Wait a bit for time to pass
    await new Promise((resolve) => setTimeout(resolve, 100));

    const elapsed = result.current.elapsedMs;
    expect(elapsed).toBeGreaterThan(0);
  });
});

