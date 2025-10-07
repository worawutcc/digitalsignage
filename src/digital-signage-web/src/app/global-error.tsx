'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

/**
 * Global error boundary for root-level errors
 * 
 * Catches errors in the root layout or other critical failures.
 * This is the last line of defense for unhandled errors.
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            
            <h1 className="mb-2 text-3xl font-bold text-white">
              Critical Error
            </h1>
            
            <p className="mb-6 text-gray-400">
              The application encountered a critical error and needs to reload.
            </p>

            {error.digest && (
              <p className="mb-6 text-sm text-gray-500">
                Error ID: {error.digest}
              </p>
            )}

            <button
              onClick={reset}
              className="rounded-lg bg-red-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Reload Application
            </button>

            <div className="mt-6">
              <a
                href="/"
                className="text-sm text-gray-400 hover:text-white"
              >
                Return to home page
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
