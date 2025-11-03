import { Component, ReactNode } from "react";
import { logger } from "@/services/logging";
import { analytics } from "@/services/analytics";

type Props = { children: ReactNode; level?: 'app' | 'component'; onRetry?: () => void };
type State = { 
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  errorCategory: 'network' | 'render' | 'state' | 'unknown';
};

type ErrorCategory = 'network' | 'render' | 'state' | 'unknown';

function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  if (message.includes('network') || message.includes('fetch') || message.includes('http')) {
    return 'network';
  }
  if (message.includes('render') || message.includes('component')) {
    return 'render';
  }
  if (message.includes('state') || message.includes('context')) {
    return 'state';
  }
  return 'unknown';
}

function getErrorMessage(category: ErrorCategory): string {
  switch (category) {
    case 'network':
      return 'Network connection issue. Please check your internet and try again.';
    case 'render':
      return 'Display error occurred. Refreshing may help.';
    case 'state':
      return 'Application state error. Reloading the app may resolve this.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

function calculateBackoff(retryCount: number): number {
  return Math.min(1000 * Math.pow(2, retryCount), 10000);
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { 
    hasError: false, 
    error: null, 
    errorInfo: null,
    retryCount: 0,
    errorCategory: 'unknown'
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorCategory: categorizeError(error)
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const category = categorizeError(error);
    
    logger.error('ErrorBoundary', { 
      error: error.message, 
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      category,
      level: this.props.level || 'app'
    });

    // Report to analytics
    analytics.error({
      message: error.message,
      category,
      componentStack: errorInfo.componentStack,
      level: this.props.level || 'app'
    });

    this.setState({ error, errorInfo, errorCategory: category });
  }

  handleRetry = () => {
    if (this.state.retryCount < 3) {
      const backoffDelay = calculateBackoff(this.state.retryCount);
      
      setTimeout(() => {
        this.setState({ 
          hasError: false, 
          error: null, 
          errorInfo: null,
          retryCount: this.state.retryCount + 1 
        }, () => {
          this.props.onRetry?.();
        });
      }, backoffDelay);
    } else {
      // After 3 retries, force full reload
      window.location.reload();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="neon-card rounded-lg p-6 max-w-md w-full text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="neon-accent text-xl font-bold mb-2">
              Something went wrong
            </div>
            <div className="text-sm text-slate-300 mb-4">
              {getErrorMessage(this.state.errorCategory)}
            </div>
            {import.meta.env.DEV && this.state.error?.message && (
              <div className="text-xs text-slate-400 mb-2">
                Technical: {this.state.error.message}
              </div>
            )}
            
            {this.state.retryCount < 3 && (
              <button
                onClick={this.handleRetry}
                className="neon-focus bg-pink-600 hover:bg-pink-700 duration-200 text-white rounded-lg px-6 py-2 mb-2 mr-2"
              >
                🔄 Retry ({3 - this.state.retryCount} attempts left)
              </button>
            )}
            
            <button
              onClick={this.handleReload}
              className="neon-focus bg-slate-700 hover:bg-slate-600 duration-200 text-white rounded-lg px-6 py-2"
            >
              🔃 Reload App
            </button>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-slate-400 mb-2">
                  Error Details (Dev Only)
                </summary>
                <pre className="text-xs text-red-400 bg-slate-900 p-2 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

