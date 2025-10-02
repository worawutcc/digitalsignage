'use client'

/**
 * UserScheduleAssignment Component
 * 
 * Main container component for managing user schedule assignments.
 * Integrates all child components and hooks for the following flow:
 * - Display current assignments
 * - Assign new schedules (with REPLACE warning)
 * - Remove all schedules (with confirmation)
 * 
 * Wrapped with ErrorBoundary to handle errors gracefully.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 * @see specs/020-phase-1/contracts/component-contracts.md
 */

import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Loader2, AlertCircle } from 'lucide-react'
import { UserScheduleAssignmentProps } from './UserScheduleAssignment.types'
import { AssignedSchedulesList } from './AssignedSchedulesList'
import { ScheduleSelector } from './ScheduleSelector'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { Button } from '@/components/ui/Button'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { cn } from '@/lib/utils'
import { useUserSchedules } from '../hooks/useUserSchedules'
import { useAssignSchedules } from '../hooks/useAssignSchedules'
import { useRemoveUserSchedules } from '../hooks/useRemoveUserSchedules'
import { useQuery } from '@tanstack/react-query'
import { scheduleService } from '@/features/schedules/services/scheduleService'

function UserScheduleAssignmentContent({
  userId,
  user,
  onSchedulesUpdated,
  className,
}: UserScheduleAssignmentProps) {
  // State for modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<number[]>([])
  
  // Fetch user's current schedules
  const { data: userSchedulesData, isLoading: isLoadingSchedules, error } = useUserSchedules(userId)
  
  // Fetch available schedules for the selector
  const { data: availableSchedules = [], isLoading: isLoadingAvailable } = useQuery({
    queryKey: ['schedules', 'available'],
    queryFn: () => scheduleService.getAll({ status: ['active'] }),
    enabled: isAssignModalOpen,
  })
  
  // Mutations
  const assignSchedules = useAssignSchedules({
    onSuccess: () => {
      setIsAssignModalOpen(false)
      setSelectedScheduleIds([])
      onSchedulesUpdated?.()
    },
  })
  
  const removeSchedules = useRemoveUserSchedules({
    onSuccess: () => {
      setIsRemoveModalOpen(false)
      onSchedulesUpdated?.()
    },
  })
  
  const currentSchedules = userSchedulesData?.schedules || []
  const hasExistingSchedules = currentSchedules.length > 0
  
  // Reset selected schedules when opening modal
  useEffect(() => {
    if (isAssignModalOpen) {
      setSelectedScheduleIds([])
    }
  }, [isAssignModalOpen])
  
  // Handle assign schedules
  const handleAssignSchedules = () => {
    if (selectedScheduleIds.length === 0) return
    assignSchedules.mutate({ userId, scheduleIds: selectedScheduleIds })
  }
  
  // Handle remove all schedules
  const handleRemoveAll = () => {
    removeSchedules.mutate(userId)
  }

  return (
    <div data-testid="user-schedule-assignment" className={cn('space-y-4 sm:space-y-6', className)}>
      {/* User Info Card */}
      <div
        data-testid="user-info"
        className={cn(
          'rounded-lg border border-gray-200 bg-white p-4 sm:p-6',
          'dark:border-gray-700 dark:bg-gray-800'
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              <User className="h-8 w-8" />
            </div>
            
            {/* User Details */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
                {user.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                <Mail className="h-4 w-4" />
                <span className="break-all">{user.email}</span>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300 sm:text-sm">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          
          {/* Stats - Moves below on mobile */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700 sm:border-0 sm:pt-0 sm:block sm:text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Assigned Schedules
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
              {currentSchedules.length}
            </div>
          </div>
        </div>
      </div>
      
      {/* Assigned Schedules Section */}
      <div data-testid="assigned-schedules-section" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">
              Assigned Content Schedules
            </h3>
          </div>
          
          <Button
            data-testid="assign-schedules-button"
            onClick={() => setIsAssignModalOpen(true)}
            disabled={isLoadingSchedules}
            variant="default"
            className="w-full sm:w-auto"
            style={{ minHeight: '44px' }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Assign Schedules
          </Button>
        </div>
        
        {/* Loading State */}
        {isLoadingSchedules && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-200">
                  Failed to load schedules
                </h4>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Schedules List */}
        {!isLoadingSchedules && !error && (
          <AssignedSchedulesList
            schedules={currentSchedules.map(us => ({
              id: us.scheduleId,
              name: us.scheduleName,
              ...(us.scheduleDescription && { description: us.scheduleDescription }),
              startDate: us.assignedAt,
              endDate: us.assignedAt, // Using assignedAt as placeholder since we don't have actual endDate
              isActive: us.isActive,
              createdBy: us.assignedBy,
              createdAt: us.assignedAt,
            }))}
            isLoading={false}
            onRemoveAll={() => setIsRemoveModalOpen(true)}
            disableRemove={!hasExistingSchedules || removeSchedules.isPending}
          />
        )}
      </div>
      
      {/* Schedule Selector Modal */}
      <ScheduleSelector
        isOpen={isAssignModalOpen}
        availableSchedules={availableSchedules.map(s => ({
          id: parseInt(s.id),
          name: s.name,
          ...(s.description && { description: s.description }),
          startDate: s.startDate,
          endDate: s.endDate || s.startDate, // Use startDate as fallback
          isActive: s.status === 'active',
        }))}
        selectedScheduleIds={selectedScheduleIds}
        hasExistingSchedules={hasExistingSchedules}
        isLoading={isLoadingAvailable}
        isSubmitting={assignSchedules.isPending}
        onSelectionChange={setSelectedScheduleIds}
        onConfirm={handleAssignSchedules}
        onCancel={() => setIsAssignModalOpen(false)}
      />
      
      {/* Remove All Confirmation Modal */}
      <ConfirmationModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onConfirm={handleRemoveAll}
        title="Remove All Schedules"
        message={`Are you sure you want to remove all ${currentSchedules.length} schedule(s) from ${user.name}? This action cannot be undone.`}
        confirmText="Remove All"
        cancelText="Cancel"
        variant="danger"
        requireConfirm
        confirmCheckboxLabel="I understand this will remove all schedule assignments"
        isLoading={removeSchedules.isPending}
      />
    </div>
  )
}

/**
 * UserScheduleAssignment with Error Boundary
 * 
 * Wraps the main component with ErrorBoundary to catch and handle
 * any errors that occur during rendering or in lifecycle methods.
 */
export function UserScheduleAssignment(props: UserScheduleAssignmentProps) {
  return (
    <ErrorBoundary
      boundaryName="UserScheduleAssignment"
      onError={(error, errorInfo) => {
        console.error('User Schedule Assignment Error:', {
          userId: props.userId,
          error,
          componentStack: errorInfo.componentStack,
        })
        
        // In production, send to monitoring service:
        // Sentry.captureException(error, {
        //   tags: { feature: 'user-schedule-assignment', userId: props.userId },
        //   contexts: { react: { componentStack: errorInfo.componentStack } },
        // })
      }}
    >
      <UserScheduleAssignmentContent {...props} />
    </ErrorBoundary>
  )
}

