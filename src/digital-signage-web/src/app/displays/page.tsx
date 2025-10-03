'use client';

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Displays Page - Redirects to Devices for better UX
 * This prevents user confusion between /displays and /devices
 * Following copilot-instructions-ui.instructions.md guidelines
 */
export default function DisplaysPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main devices page (comprehensive device management)
    router.replace('/devices');
  }, [router]);

  // Show loading while redirecting - following UI guidelines for loading states
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to Device Management...</p>
      </div>
    </div>
  );
}