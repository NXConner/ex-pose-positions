import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGame } from "../use-game";
import { getFirebase } from "@/services/firebase";

// Mock Firebase
vi.mock("@/services/firebase", () => ({
  getFirebase: vi.fn(() => ({
    db: {
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          onSnapshot: vi.fn((callback) => {
            callback({ data: () => null });
            return () => {};
          }),
        })),
      })),
    },
  })),
}));

describe("useGame", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with no active game", () => {
    const { result } = renderHook(() => useGame(10));
    
    expect(result.current.game).toBeNull();
    expect(result.current.elapsedMs).toBe(0);
  });

  it("should have start, nextPose, and end functions", () => {
    const { result } = renderHook(() => useGame(10));
    
    expect(typeof result.current.start).toBe("function");
    expect(typeof result.current.nextPose).toBe("function");
    expect(typeof result.current.end).toBe("function");
  });
});

