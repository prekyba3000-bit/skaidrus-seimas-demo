import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { captureException } from "../monitoring";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  eventId?: string;
}

/**
 * Global Error Boundary Component
 *
 * Catches React render errors and displays a friendly error UI.
 * Automatically reports errors to Sentry if configured.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console for development
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Report to Sentry if configured
    try {
      const eventId = captureException(error, {
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        errorBoundary: true,
      });
      this.setState({ eventId });
    } catch (sentryError) {
      // If Sentry fails, just log it
      console.error("Failed to report error to Sentry:", sentryError);
    }

    // Store error info for display
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      const { error, eventId } = this.state;
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-4">
          <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-sm border border-red-900/50 rounded-lg p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <h2 className="text-lg font-semibold text-red-400">
                Something went wrong
              </h2>
            </div>

            {/* Error Message */}
            <div className="text-sm text-slate-300 mb-4">
              <p className="mb-2">
                We're sorry, but something unexpected happened. Our team has
                been notified and is looking into it.
              </p>
              {error && (
                <div className="mt-3 p-3 bg-slate-950/50 rounded border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Error details:</p>
                  <p className="text-red-400 font-mono text-xs break-words">
                    {error.message || "Unknown error"}
                  </p>
                </div>
              )}

              {/* Event ID for support */}
              {eventId && (
                <div className="mt-3 p-2 bg-slate-950/30 rounded border border-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Error ID:</p>
                  <p className="text-slate-400 font-mono text-xs break-all">
                    {eventId}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Please include this ID when reporting the issue.
                  </p>
                </div>
              )}

              {/* Development mode: show stack trace */}
              {isDev && error?.stack && (
                <details className="mt-4">
                  <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                    Stack trace (dev only)
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-950/50 rounded border border-slate-800 text-xs text-slate-400 overflow-auto max-h-48">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-900/20 border border-red-900/50 text-red-400 rounded hover:bg-red-900/40 transition-colors font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-300 rounded hover:bg-slate-800 transition-colors font-medium"
              >
                <Home className="h-4 w-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
