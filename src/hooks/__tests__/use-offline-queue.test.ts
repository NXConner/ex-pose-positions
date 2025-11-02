import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useOfflineQueue } from "@/hooks/use-offline-queue";

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  configurable: true,
  value: false,
});

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
    navigator.onLine = false;
    const { result } = renderHook(() => useOfflineQueue());

    const mockAction = vi.fn(() => Promise.resolve());

    result.current.queueAction(mockAction, "test-action");

    expect(result.current.queueLength).toBe(1);
    expect(mockAction).not.toHaveBeenCalled();
  });

  it("should execute action immediately when online", async () => {
    navigator.onLine = true;
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

