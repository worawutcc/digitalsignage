// Error boundary component for React error handling
// Catches JavaScript errors anywhere in the child component tree

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundaryState, ErrorBoundaryProps } from '@/types/errors';

/**
 * Default error display component for ErrorBoundary
 */
interface DefaultErrorDisplayProps {
  error: Error;
  errorInfo: ErrorInfo;
  onRetry?: () => void;
  isDevelopment?: boolean;
}

function DefaultErrorDisplay({ 
  error, 
  errorInfo, 
  onRetry, 
  isDevelopment = process.env.NODE_ENV === 'development' 
}: DefaultErrorDisplayProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-600">
              An unexpected error occurred while displaying this page.
            </p>
          </div>
        </div>

        {isDevelopment && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <h2 className="text-sm font-medium text-red-800 mb-2">
              Error Details (Development Mode)
            </h2>
            <div className="text-xs text-red-700">
              <div className="mb-2">
                <strong>Message:</strong> {error.message}
              </div>
              <div className="mb-2">
                <strong>Component Stack:</strong>
                <pre className="mt-1 whitespace-pre-wrap text-xs">
                  {errorInfo.componentStack}
                </pre>
              </div>
              {error.stack && (
                <div>
                  <strong>Stack Trace:</strong>
                  <pre className="mt-1 whitespace-pre-wrap text-xs">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reload Page
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ErrorBoundary class component that catches JavaScript errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error details
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });

    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to monitoring service if available
    if (typeof window !== 'undefined' && (window as any).reportError) {
      (window as any).reportError(error);
    }
  }

  handleRetry = () => {
    // Reset error state
    this.setState({ 
      hasError: false
    });
  };

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Render fallback UI
      if (this.props.fallback) {
        // If fallback is a React element, render it directly
        if (React.isValidElement(this.props.fallback)) {
          return this.props.fallback;
        }
        
        // If fallback is a component, render it with props
        if (typeof this.props.fallback === 'function') {
          const FallbackComponent = this.props.fallback as React.ComponentType<any>;
          return (
            <FallbackComponent
              error={this.state.error}
              resetError={this.handleRetry}
              level={this.props.level || 'component'}
            />
          );
        }
      }

      // Use default error display
      return (
        <DefaultErrorDisplay
          error={this.state.error}
          errorInfo={this.state.errorInfo || { componentStack: '' }}
          onRetry={this.handleRetry}
        />
      );
    }

    // Render children normally when no error
    return this.props.children;
  }
}

/**
 * HOC to wrap components with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook for error boundary functionality in functional components
 * Note: This doesn't actually catch errors like class-based ErrorBoundary,
 * but provides error handling utilities
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  // Throw error on next render to trigger parent ErrorBoundary
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}