'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

/**
 * Error boundary for route errors
 * 
 * Catches and displays errors that occur during rendering in route segments.
 * Provides user-friendly error messages and a reset option.
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Route error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Something went wrong
        </h1>
        
        <p className="mb-6 text-gray-600">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        {error.digest && (
          <p className="mb-6 text-sm text-gray-500">
            Error ID: {error.digest}
          </p>
        )}

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>

        <div className="mt-4">
          <a
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            Go back to dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
