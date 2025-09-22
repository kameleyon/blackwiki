'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorState } from './ErrorState';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI instead of ErrorState */
  fallback?: (error: Error, errorInfo: ErrorInfo, resetError: () => void) => ReactNode;
  /** Callback when an error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Show debug information */
  showDebug?: boolean;
}

/**
 * React Error Boundary that catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI using our ErrorState component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo!, this.resetError);
      }

      // Default to ErrorState component
      return (
        <ErrorState
          type="generic"
          title="Application Error"
          message="Something unexpected happened. The error has been logged and our team will investigate."
          error={this.state.error}
          onRetry={this.resetError}
          showDebug={this.props.showDebug}
          announcementPriority="assertive"
          actions={
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
            >
              Reload Page
            </button>
          }
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export function useErrorBoundary() {
  const throwError = (error: Error) => {
    throw error;
  };

  return { throwError };
}