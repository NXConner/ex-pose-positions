import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useOfflineQueue } from "@/hooks/use-offline-queue";

describe("useOfflineQueue", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should initialize with empty queue", () => {
    const { result } = renderHook(() => useOfflineQueue());
    expect(result.current.queue).toEqual([]);
    expect(result.current.queueLength).toBe(0);
  });

  it("should queue action when offline", () => {
    Object.defineProperty(window, 'navigator', {
      value: { ...navigator, onLine: false },
      writable: true,
      configurable: true,
    });
    
    const { result } = renderHook(() => useOfflineQueue());

    const mockAction = vi.fn(() => Promise.resolve());

    result.current.queueAction(mockAction, "test-action");

    expect(result.current.queueLength).toBe(1);
    expect(mockAction).not.toHaveBeenCalled();
  });

  it("should execute action immediately when online", async () => {
    Object.defineProperty(window, 'navigator', {
      value: { ...navigator, onLine: true },
      writable: true,
      configurable: true,
    });
    
    const { result } = renderHook(() => useOfflineQueue());

    const mockAction = vi.fn(() => Promise.resolve());

    result.current.queueAction(mockAction, "test-action");

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalled();
    });
  });

  it("should clear queue", () => {
    const { result } = renderHook(() => useOfflineQueue());

    const mockAction = vi.fn(() => Promise.resolve());
    result.current.queueAction(mockAction, "test-action");

    expect(result.current.queueLength).toBeGreaterThan(0);

    result.current.clearQueue();

    expect(result.current.queueLength).toBe(0);
  });
});

