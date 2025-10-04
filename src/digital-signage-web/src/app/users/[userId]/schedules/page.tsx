import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { UserScheduleAssignment } from '@/features/users/components/UserScheduleAssignment'
import { userService } from '@/features/users/services/userService'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { EnhancedUserSchedulePage } from '../../../../features/users/components/EnhancedUserSchedulePage'

/**
 * UserSchedulesPage
 * 
 * Page for managing schedule assignments for a specific user.
 * Protected route - admin only.
 * 
 * @see copilot-instructions-web.md - Next.js 15 Page Development
 * @see specs/020-phase-1/tasks.md - T038
 */

interface PageProps {
  params: Promise<{
    userId: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params
  try {
    const user = await userService.getUserById(parseInt(userId))
    const fullName = userService.getUserFullName(user)
    return {
      title: `Manage Schedules - ${fullName} | Digital Signage`,
      description: `Manage content schedule assignments for ${fullName}`,
    }
  } catch {
    return {
      title: 'User Not Found | Digital Signage',
      description: 'The requested user could not be found',
    }
  }
}

export default async function UserSchedulesPage({ params }: PageProps) {
  // Await params (Next.js 15 requirement)
  const { userId: userIdStr } = await params
  
  // Validate userId parameter
  const userId = parseInt(userIdStr, 10)
  if (isNaN(userId) || userId <= 0) {
    notFound()
  }

  // Fetch user data
  let user
  try {
    user = await userService.getUserById(parseInt(userIdStr))
  } catch {
    // If user not found or unauthorized, show 404
    notFound()
  }

  const fullName = userService.getUserFullName(user)

  return (
    <div data-testid="user-schedules-page" className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Users', href: '/users' },
              { label: fullName, href: `/users/${userIdStr}` },
              { label: 'Schedules', current: true },
            ]}
          />
        </div>
      </div>

      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Manage Schedule Assignments
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Assign content schedules to {fullName} for display on their devices
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <EnhancedUserSchedulePage
          userId={userId}
          user={{
            id: userId,
            name: fullName,
            email: user.email,
            role: user.role,
          }}
          onSchedulesUpdated={() => {
            // Optional: Trigger any additional refresh logic if needed
            // For now, React Query handles cache invalidation automatically
          }}
        />
      </div>
    </div>
  )
}
