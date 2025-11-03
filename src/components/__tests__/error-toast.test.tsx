import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ErrorToast, toastManager } from "../error-toast";

describe("ErrorToast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    toastManager.clear();
  });

  it("should render error message", () => {
    render(<ErrorToast message="Test error" />);
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("should show correct category icon and title", () => {
    const { rerender } = render(<ErrorToast message="Network error" category="network" />);
    expect(screen.getByText("Connection Error")).toBeInTheDocument();

    rerender(<ErrorToast message="Validation error" category="validation" />);
    expect(screen.getByText("Validation Error")).toBeInTheDocument();

    rerender(<ErrorToast message="Permission error" category="permission" />);
    expect(screen.getByText("Permission Denied")).toBeInTheDocument();
  });

  it("should call onRetry when retry button is clicked", () => {
    const onRetry = vi.fn();
    render(<ErrorToast message="Error" onRetry={onRetry} />);
    
    const retryButton = screen.getByLabelText("Retry operation");
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("should call onDismiss when dismiss button is clicked", () => {
    const onDismiss = vi.fn();
    render(<ErrorToast message="Error" onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByLabelText("Dismiss error");
    fireEvent.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should show details when provided", () => {
    render(<ErrorToast message="Error" showDetails details="Stack trace here" />);
    
    const summary = screen.getByText(/show details/i);
    fireEvent.click(summary);
    
    expect(screen.getByText("Stack trace here")).toBeInTheDocument();
  });

  it("should auto-hide after duration", async () => {
    const onDismiss = vi.fn();
    render(<ErrorToast message="Error" onDismiss={onDismiss} autoHide duration={100} />);
    
    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it("should have proper ARIA attributes", () => {
    render(<ErrorToast message="Error" />);
    
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveAttribute("aria-atomic", "true");
  });
});

describe("ToastManager", () => {
  beforeEach(() => {
    toastManager.clear();
  });

  it("should show toast and return id", () => {
    const id = toastManager.show("Test message", "network");
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
  });

  it("should notify subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = toastManager.subscribe(listener);
    
    toastManager.show("Message", "network");
    
    expect(listener).toHaveBeenCalled();
    expect(listener.mock.calls[0]?.[0]).toHaveLength(1);
    
    unsubscribe();
  });

  it("should remove toast by id", () => {
    const id = toastManager.show("Message", "network");
    toastManager.remove(id);
    
    const listener = vi.fn();
    toastManager.subscribe(listener);
    toastManager.show("Another", "server");
    
    expect(listener.mock.calls[0]?.[0]).toHaveLength(1);
  });

  it("should clear all toasts", () => {
    toastManager.show("Message 1", "network");
    toastManager.show("Message 2", "server");
    toastManager.clear();
    
    const listener = vi.fn();
    toastManager.subscribe(listener);
    
    expect(listener.mock.calls[0]?.[0]).toHaveLength(0);
  });
});

