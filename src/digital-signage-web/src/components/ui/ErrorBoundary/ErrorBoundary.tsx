'use client'

import React, { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary.types'

/**
 * Error boundary component for graceful error handling
 * 
 * Catches JavaScript errors in child component tree and displays fallback UI.
 * Can be customized with fallback prop or uses default error UI.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 * 
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <h1>Error: {error.message}</h1>
 *       <button onClick={reset}>Try again</button>
 *     </div>
 *   )}
 *   onError={(error, errorInfo) => {
 *     logErrorToService(error, errorInfo)
 *   }}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call optional onError callback
    this.props.onError?.(error, errorInfo)
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state when resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      !this.areResetKeysEqual(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.reset()
    }
  }

  areResetKeysEqual(
    prevKeys: Array<string | number | boolean | null | undefined>,
    nextKeys: Array<string | number | boolean | null | undefined>
  ): boolean {
    if (prevKeys.length !== nextKeys.length) return false
    return prevKeys.every((key, index) => key === nextKeys[index])
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.reset)
        }
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8">
          <div className="text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Something went wrong
            </h3>
            
            <p className="mb-4 text-sm text-gray-600">
              {this.state.error.message || 'An unexpected error occurred'}
            </p>

            <button
              onClick={this.reset}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
