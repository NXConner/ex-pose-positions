import { Component, ReactNode } from "react";
import { logger } from "@/services/logging";

type Props = { children: ReactNode };
type State = { 
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { 
    hasError: false, 
    error: null, 
    errorInfo: null,
    retryCount: 0 
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary', { 
      error: error.message, 
      stack: error.stack,
      componentStack: errorInfo.componentStack 
    });
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    if (this.state.retryCount < 3) {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        retryCount: this.state.retryCount + 1 
      });
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
              {this.state.error?.message || 'An unexpected error occurred'}
            </div>
            
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

