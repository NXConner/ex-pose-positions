import { useState, useCallback } from "react";
import { ErrorToast } from "@/components/error-toast";

export interface ErrorHandlerOptions {
  showToast?: boolean;
  onRetry?: () => void;
  autoHide?: boolean;
  duration?: number;
}

/**
 * Hook for handling errors with user-friendly messages and recovery options
 */
export function useErrorHandler() {
  const [error, setError] = useState<{
    message: string;
    options?: ErrorHandlerOptions;
  } | null>(null);

  const handleError = useCallback(
    (error: Error | string, options?: ErrorHandlerOptions) => {
      const message = error instanceof Error ? error.message : error;
      setError({ message, options });
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const ErrorDisplay = error ? (
    <ErrorToast
      message={error.message}
      onRetry={error.options?.onRetry}
      onDismiss={clearError}
      autoHide={error.options?.autoHide ?? true}
      duration={error.options?.duration}
    />
  ) : null;

  return {
    handleError,
    clearError,
    ErrorDisplay,
    hasError: error !== null,
  };
}

/**
 * Get user-friendly error message from Firebase errors
 */
export function getFirebaseErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes("network") || message.includes("fetch")) {
      return "Network error. Please check your connection and try again.";
    }
    if (message.includes("permission") || message.includes("denied")) {
      return "You don't have permission to perform this action.";
    }
    if (message.includes("not found")) {
      return "The requested item was not found.";
    }
    if (message.includes("already exists")) {
      return "This item already exists.";
    }
    if (message.includes("auth")) {
      return "Authentication error. Please refresh and try again.";
    }
    
    return error.message || "An unexpected error occurred.";
  }
  
  return "An unexpected error occurred. Please try again.";
}

/**
 * Get user-friendly error message for network errors
 */
export function getNetworkErrorMessage(error: unknown): string {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return "Unable to connect. Please check your internet connection.";
  }
  return getFirebaseErrorMessage(error);
}

