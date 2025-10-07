import React from 'react'

/**
 * Props for the ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: React.ReactNode
  
  /**
   * Optional fallback UI to render when an error occurs
   */
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode)
  
  /**
   * Optional callback when an error is caught
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  
  /**
   * Optional flag to reset error boundary when props change
   */
  resetKeys?: Array<string | number | boolean | null | undefined>
}

/**
 * State for the ErrorBoundary component
 */
export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}
