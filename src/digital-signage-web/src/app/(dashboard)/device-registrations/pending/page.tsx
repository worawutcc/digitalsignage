import { Metadata } from 'next'
import { PendingRegistrationsPage } from '@/features/devices/components/PendingRegistrationsPage'
import { RefreshButton } from '@/features/devices/components/RefreshButton'

/**
 * Pending Device Registrations Admin Page
 * 
 * Page for managing pending device registration requests.
 * Protected route - admin only.
 * 
 * @see copilot-instructions-ui.md - Next.js 15 Page Development
 * @see CODE-REVIEW-UI-REQUIREMENTS.md - Device Registration Admin UI
 */

export const metadata: Metadata = {
  title: 'Pending Device Registrations | Digital Signage Admin',
  description: 'Review and approve pending device registration requests',
}

export default function AdminPendingRegistrationsPage() {
  return (
    <div data-testid="pending-registrations-page" className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Pending Device Registrations
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Review and approve Android TV self-registration requests
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-3">
              <RefreshButton 
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PendingRegistrationsPage />
      </div>
    </div>
  )
}