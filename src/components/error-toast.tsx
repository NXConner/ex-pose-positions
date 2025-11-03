import { useState, useEffect } from "react";
import { hapticError, hapticPress } from "@/utils/haptic";

type ErrorCategory = 'network' | 'validation' | 'permission' | 'server' | 'unknown';

interface ErrorToastProps {
  message: string;
  category?: ErrorCategory;
  onRetry?: () => void;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
  showDetails?: boolean;
  details?: string;
}

function getErrorIcon(category: ErrorCategory): string {
  switch (category) {
    case 'network':
      return '🌐';
    case 'validation':
      return '⚠️';
    case 'permission':
      return '🔒';
    case 'server':
      return '⚙️';
    default:
      return '❌';
  }
}

function getErrorTitle(category: ErrorCategory): string {
  switch (category) {
    case 'network':
      return 'Connection Error';
    case 'validation':
      return 'Validation Error';
    case 'permission':
      return 'Permission Denied';
    case 'server':
      return 'Server Error';
    default:
      return 'Error';
  }
}

function getErrorColor(category: ErrorCategory): string {
  switch (category) {
    case 'network':
      return 'bg-yellow-900/90 border-yellow-500';
    case 'validation':
      return 'bg-orange-900/90 border-orange-500';
    case 'permission':
      return 'bg-purple-900/90 border-purple-500';
    case 'server':
      return 'bg-red-900/90 border-red-500';
    default:
      return 'bg-red-900/90 border-red-500';
  }
}

export function ErrorToast({
  message,
  category = 'unknown',
  onRetry,
  onDismiss,
  autoHide = true,
  duration = 5000,
  showDetails = false,
  details,
}: ErrorToastProps) {
  const [visible, setVisible] = useState(true);
  const [showFullDetails, setShowFullDetails] = useState(false);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onDismiss]);

  useEffect(() => {
    hapticError();
  }, []);

  if (!visible) return null;

  const errorColor = getErrorColor(category);
  const errorIcon = getErrorIcon(category);
  const errorTitle = getErrorTitle(category);

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-fade-in"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={`neon-card ${errorColor} rounded-lg p-4 shadow-lg`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl" aria-hidden="true">{errorIcon}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-red-200 mb-1">{errorTitle}</div>
            <div className="text-sm text-red-100 break-words">{message}</div>
            {showDetails && details && (
              <details className="mt-2">
                <summary 
                  className="text-xs text-red-300 cursor-pointer hover:text-red-200"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowFullDetails(!showFullDetails);
                  }}
                >
                  {showFullDetails ? 'Hide' : 'Show'} Details
                </summary>
                {showFullDetails && (
                  <pre className="text-xs text-red-200 mt-2 p-2 bg-red-950/50 rounded overflow-auto max-h-32">
                    {details}
                  </pre>
                )}
              </details>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {onRetry && (
              <button
                onClick={() => {
                  hapticPress();
                  onRetry();
                  setVisible(false);
                }}
                className="neon-focus bg-red-700 hover:bg-red-600 text-white rounded px-3 py-1 text-sm font-medium transition-colors"
                aria-label="Retry operation"
              >
                Retry
              </button>
            )}
            <button
              onClick={() => {
                hapticPress();
                setVisible(false);
                onDismiss?.();
              }}
              className="neon-focus bg-slate-700 hover:bg-slate-600 text-white rounded px-3 py-1 text-sm font-medium transition-colors"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast manager for multiple toasts
interface ToastItem {
  id: string;
  message: string;
  category: ErrorCategory;
  onRetry?: () => void;
  details?: string;
}

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Array<(toasts: ToastItem[]) => void> = [];

  subscribe(listener: (toasts: ToastItem[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  show(message: string, category: ErrorCategory = 'unknown', onRetry?: () => void, details?: string): string {
    const id = `toast-${Date.now()}-${Math.random()}`;
    this.toasts.push({ id, message, category, onRetry, details });
    this.notify();
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.remove(id);
    }, 5000);
    
    return id;
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  clear(): void {
    this.toasts = [];
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
}

export const toastManager = new ToastManager();

