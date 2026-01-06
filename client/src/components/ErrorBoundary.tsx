import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-4">
            <div className="max-w-md w-full bg-red-950/20 border border-red-900/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4 text-red-500">
                    <AlertCircle className="h-6 w-6" />
                    <h2 className="text-lg font-semibold">Something went wrong</h2>
                </div>
                 <div className="text-sm text-red-400 mb-4 font-mono">
                  {this.state.error?.message}
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="w-full py-2 bg-red-900/20 border border-red-900/50 text-red-400 rounded hover:bg-red-900/40 transition-colors"
                >
                    Reload Page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
