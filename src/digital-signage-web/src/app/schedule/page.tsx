'use client';

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Schedule Page - Redirects to Schedules for better UX
 * This prevents user confusion between /schedule and /schedules
 */
export default function SchedulePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main schedules page
    router.replace('/schedules');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to Schedules...</p>
      </div>
    </div>
  );
}