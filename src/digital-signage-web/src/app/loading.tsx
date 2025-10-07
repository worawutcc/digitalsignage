import { Loader2 } from 'lucide-react'

/**
 * Global loading state for route transitions
 * 
 * Displays while a route segment is loading or during navigation.
 * Uses Suspense boundary under the hood.
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/loading
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
