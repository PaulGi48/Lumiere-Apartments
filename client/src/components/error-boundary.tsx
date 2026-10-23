import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorPage } from "@/components/error-page";

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean; error: Error | null };

function getStatus(error: Error | null) {
  const status = (error as Error & { status?: unknown } | null)?.status;
  if (typeof status === "number") return status;
  const match = error?.message.match(/\b(4\d\d|5\d\d)\b/);
  return match ? Number(match[1]) : 500;
}

export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled application error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const status = getStatus(this.state.error);
      return <ErrorPage status={status} />;
    }
    return this.props.children;
  }
}
