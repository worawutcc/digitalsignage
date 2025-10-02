'use client'

/**
 * ErrorBoundary Component
 * 
 * React error boundary that catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the entire app.
 * 
 * Based on React 19 best practices with proper error logging and recovery mechanisms.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 * 
 * @example With custom fallback
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <h1>Something went wrong</h1>
 *       <button onClick={reset}>Try again</button>
 *     </div>
 *   )}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 * 
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 * @see copilot-instructions-web.md - Error Handling Rules
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './Button'

interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode
  
  /** Custom fallback UI function that receives error and reset callback */
  fallback?: (error: Error, reset: () => void) => ReactNode
  
  /** Callback when error occurs (for logging to external service) */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  
  /** Optional identifier for this error boundary (useful for logging) */
  boundaryName?: string
}

interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean
  
  /** The error that occurred */
  error: Error | null
  
  /** Additional error information from React */
  errorInfo: ErrorInfo | null
  
  /** Number of times user has retried */
  retryCount: number
}

/**
 * ErrorBoundary class component
 * 
 * Note: Error boundaries must be class components as React doesn't support
 * error boundaries with hooks yet (as of React 19).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    }
  }

  /**
   * Static method called when an error is thrown in a child component
   * Updates state to trigger fallback UI rendering
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  /**
   * Called after error is caught to log error details
   * This is where you'd send errors to monitoring services like Sentry
   */
  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, boundaryName } = this.props
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', {
        boundaryName: boundaryName || 'unnamed',
        error,
        errorInfo,
        componentStack: errorInfo.componentStack,
      })
    }
    
    // Update state with error info
    this.setState({ errorInfo })
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo)
    }
    
    // In production, you would send to monitoring service:
    // Example with Sentry:
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //       boundaryName: boundaryName || 'unnamed',
    //     },
    //   },
    // })
  }

  /**
   * Reset error boundary state to retry rendering
   * Increments retry count for analytics
   */
  handleReset = (): void => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }))
  }

  /**
   * Navigate to home page (fallback recovery)
   */
  handleGoHome = (): void => {
    // Use window.location for full page reload
    // This ensures complete state reset
    window.location.href = '/'
  }

  /**
   * Reload current page
   */
  handleReload = (): void => {
    window.location.reload()
  }

  override render(): ReactNode {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    // No error: render children normally
    if (!hasError || !error) {
      return children
    }

    // Error occurred: render fallback UI
    if (fallback) {
      return fallback(error, this.handleReset)
    }

    // Default fallback UI
    return <DefaultErrorFallback error={error} onReset={this.handleReset} />
  }
}

/**
 * Default error fallback UI component
 * Shown when no custom fallback is provided
 */
interface DefaultErrorFallbackProps {
  error: Error
  onReset: () => void
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps): React.JSX.Element {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div 
      role="alert"
      className="flex min-h-[400px] w-full flex-col items-center justify-center gap-6 rounded-lg border-2 border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-950/20"
      data-testid="error-boundary-fallback"
    >
      {/* Error Icon */}
      <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
        <AlertTriangle 
          className="h-12 w-12 text-red-600 dark:text-red-400" 
          aria-hidden="true"
        />
      </div>

      {/* Error Message */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">
          Something went wrong
        </h2>
        <p className="text-red-700 dark:text-red-300">
          We're sorry, but something unexpected happened.
        </p>
        
        {/* Show error message in development */}
        {isDevelopment && error.message && (
          <details className="mt-4 max-w-xl">
            <summary className="cursor-pointer text-sm font-medium text-red-800 dark:text-red-200">
              Technical details (development only)
            </summary>
            <div className="mt-2 rounded border border-red-300 bg-red-100 p-4 text-left dark:border-red-700 dark:bg-red-900/20">
              <p className="font-mono text-xs text-red-900 dark:text-red-100">
                {error.message}
              </p>
              {error.stack && (
                <pre className="mt-2 overflow-auto text-xs text-red-800 dark:text-red-200">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={onReset}
          variant="default"
          data-testid="error-boundary-retry"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </Button>
        
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
          data-testid="error-boundary-home"
          className="gap-2"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Go to Home
        </Button>
      </div>

      {/* Help Text */}
      <p className="text-sm text-red-600 dark:text-red-400">
        If the problem persists, please contact support.
      </p>
    </div>
  )
}

/**
 * Convenience wrapper for feature-specific error boundaries
 * Provides consistent naming and error handling
 */
export interface FeatureErrorBoundaryProps {
  children: ReactNode
  featureName: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export function FeatureErrorBoundary({
  children,
  featureName,
  onError,
}: FeatureErrorBoundaryProps): React.JSX.Element {
  return (
    <ErrorBoundary
      boundaryName={featureName}
      onError={(error, errorInfo) => {
        // Log with feature context
        console.error(`Error in ${featureName}:`, error)
        
        // Call custom handler if provided
        if (onError) {
          onError(error, errorInfo)
        }
      }}
      fallback={(error, reset) => (
        <div 
          role="alert"
          className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/20"
        >
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
          <div className="space-y-1 text-center">
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              {featureName} Error
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              This feature encountered an error. Please try again.
            </p>
          </div>
          <Button
            onClick={reset}
            variant="default"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * HOC (Higher-Order Component) to wrap any component with error boundary
 * Useful for quickly adding error boundaries to existing components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryName?: string
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary boundaryName={boundaryName || Component.displayName || Component.name}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}
