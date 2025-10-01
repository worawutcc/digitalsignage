/**
 * Error Boundary Components
 * Graceful error handling with fallback UI and retry mechanisms
 */

'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { Button } from '@/components/ui/Button'

/**
 * Error boundary props
 */
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
}

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Base Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * 
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.handleReset)
        }
        return this.props.fallback
      }

      // Default fallback
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Default error fallback UI
 */
interface DefaultErrorFallbackProps {
  error: Error
  errorInfo: ErrorInfo | null
  onReset: () => void
}

function DefaultErrorFallback({ error, errorInfo, onReset }: DefaultErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          An error occurred while rendering this component. Please try again.
        </p>

        {isDevelopment && (
          <details className="mt-4 rounded-lg bg-red-50 p-4 text-left dark:bg-red-900/20">
            <summary className="cursor-pointer font-semibold text-red-900 dark:text-red-300">
              Error Details (Development Only)
            </summary>
            <div className="mt-2 space-y-2">
              <p className="text-sm font-mono text-red-800 dark:text-red-400">
                {error.toString()}
              </p>
              {errorInfo && (
                <pre className="mt-2 overflow-auto text-xs text-red-700 dark:text-red-500">
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          </details>
        )}

        <div className="flex justify-center gap-4 pt-4">
          <Button onClick={onReset} variant="default">
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Page-level Error Boundary
 * Used for wrapping entire pages
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-lg space-y-6 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <div className="text-center">
              <div className="text-6xl mb-4">😕</div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Page Error
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                This page encountered an error and couldn't be displayed.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-sm font-mono text-red-900 dark:text-red-300">
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={reset} variant="default" className="flex-1">
                Reload Page
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="flex-1"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      )}
      onError={(error, errorInfo) => {
        // Log to error reporting service in production
        if (process.env.NODE_ENV === 'production') {
          console.error('Page Error:', error, errorInfo)
          // TODO: Send to error monitoring service (e.g., Sentry)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Feature-level Error Boundary
 * Used for wrapping feature modules with custom recovery
 */
export function FeatureErrorBoundary({
  children,
  featureName,
}: {
  children: ReactNode
  featureName: string
}) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start gap-4">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-red-900 dark:text-red-300">
                {featureName} Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                This feature encountered an error. You can continue using other parts of the
                application.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs font-mono text-red-600 dark:text-red-500">
                  {error.message}
                </p>
              )}
              <Button onClick={reset} size="sm" variant="secondary">
                Retry {featureName}
              </Button>
            </div>
          </div>
        </div>
      )}
      onError={(error) => {
        console.error(`${featureName} Error:`, error)
        // Track feature-specific errors
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * API Error Boundary
 * Specialized error boundary for API-related errors
 */
export function ApiErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => {
        const isNetworkError = error.message.includes('network') || error.message.includes('fetch')
        const isAuthError = error.message.includes('401') || error.message.includes('403')

        return (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-3xl">
                  {isNetworkError ? '📡' : isAuthError ? '🔒' : '⚠️'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-300">
                    {isNetworkError
                      ? 'Connection Error'
                      : isAuthError
                      ? 'Authentication Error'
                      : 'API Error'}
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                    {isNetworkError
                      ? 'Unable to connect to the server. Please check your internet connection.'
                      : isAuthError
                      ? 'Your session may have expired. Please log in again.'
                      : 'An error occurred while communicating with the server.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={reset} size="sm" variant="default">
                  Retry
                </Button>
                {isAuthError && (
                  <Button
                    onClick={() => window.location.href = '/login'}
                    size="sm"
                    variant="outline"
                  >
                    Log In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}
