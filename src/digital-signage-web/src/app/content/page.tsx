'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Content page redirect
 * Redirects to Media page since Content and Media are the same functionality
 */
export default function ContentPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/media')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to Media Library...</p>
      </div>
    </div>
  )
}
