import { Component, ReactNode } from "react";
import { logger } from "@/services/logging";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: unknown, info: unknown) {
    logger.error('ErrorBoundary', { error: String(error), info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="neon-card rounded-md p-4 text-center">
          <div className="neon-accent mb-2">Something went wrong</div>
          <div className="text-sm text-slate-300">Please refresh the app.</div>
        </div>
      );
    }
    return this.props.children;
  }
}

