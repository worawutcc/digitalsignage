'use client'

/**
 * AssignedUsersList Component
 * 
 * Displays list of users assigned to a schedule with pagination support.
 * Integrates with useScheduleUsers hook for data fetching.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 */

import { Users, Mail, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { AssignedUsersListProps } from './AssignedUsersList.types'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useScheduleUsers } from '../hooks/useScheduleUsers'
import type { ScheduleAssignedUser } from '../types/schedule'

export function AssignedUsersList({
  scheduleId,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
  className,
}: Omit<AssignedUsersListProps, 'users' | 'isLoading' | 'totalPages' | 'totalCount' | 'onRemoveUser'>) {
  // Fetch users using the hook
  const { data, isLoading, error } = useScheduleUsers(scheduleId, {
    page: currentPage,
    limit: pageSize,
  })
  
  const users = (data as any)?.users || []
  const totalCount = users.length // Use actual users length since API doesn't provide totalCount
  const totalPages = Math.ceil(totalCount / pageSize)

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div data-testid="loading-skeleton" className={cn('space-y-3', className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
        <p className="text-sm text-red-700 dark:text-red-300">
          Failed to load users: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div data-testid="empty-state">
        <EmptyState
          icon={Users}
          title="No users assigned"
          description="This schedule hasn't been assigned to any users yet."
          {...(className && { className })}
        />
      </div>
    )
  }

  return (
    <div data-testid="assigned-users-list" className={cn('space-y-4', className)}>
      {/* Summary */}
      <div
        data-testid="users-summary"
        className="flex items-center justify-between border-b pb-2 dark:border-gray-700"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {totalCount} user{totalCount !== 1 ? 's' : ''} assigned
        </span>
        {totalPages > 1 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Users Grid */}
      <div data-testid="users-grid" className="grid gap-3">
        {users.map((user: ScheduleAssignedUser) => (
          <div
            key={user.id}
            data-testid={`user-card-${user.id}`}
            className={cn(
              'flex items-center justify-between rounded-lg border p-4',
              'border-gray-200 bg-white hover:shadow-sm',
              'dark:border-gray-700 dark:bg-gray-800',
              'transition-all'
            )}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <span className="text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* User Info */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {user.name}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-3 w-3" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            {/* Device Count */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {user.deviceCount} device{user.deviceCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          data-testid="pagination"
          className="flex items-center justify-between border-t pt-4 dark:border-gray-700"
        >
          <Button
            data-testid="prev-page"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          <span
            data-testid="page-indicator"
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            Page {currentPage} of {totalPages}
          </span>

          <Button
            data-testid="next-page"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

