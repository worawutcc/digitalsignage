'use client'

import { Users as UsersIcon, UserPlus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

/**
 * Users Management Page
 * @description User management with schedule assignments and permissions
 * @see specs/021-user-schedule-assignment - User-based content management
 */
export default function UsersPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage users and their schedule assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <EmptyState
          icon={UsersIcon}
          title="No users found"
          description="Get started by creating your first user. Users can be assigned schedules and permissions."
          action={{
            label: 'Add User',
            onClick: () => console.log('Add user')
          }}
        />
      </div>
    </div>
  )
}
