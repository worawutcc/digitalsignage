'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Copy, 
  Clock, 
  Calendar,
  Monitor,
  Users,
  Settings,
  FileImage,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { useUpdateSchedule, useDeleteSchedule } from '@/features/schedules/hooks/useSchedules'
import { useScheduleById } from '@/hooks/useSchedules'
import { ConflictDetection } from '@/features/schedules/components/ConflictDetection'
import { getAssignmentTypeDisplay, getAssignmentTypeClasses } from '@/utils/assignmentHelpers'

// Simplified Schedule type for detail page
interface ScheduleDetail {
  id: number
  name: string
  description?: string
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  priority?: number
  isActive: boolean
  status?: 'active' | 'inactive' | 'draft'
  createdAt: string
  updatedAt: string
}
import { AssignedUsersList } from '@/features/schedules/components/AssignedUsersList'
import { ContentSourceBadge } from '@/features/schedules/components/ContentSourceBadge'
import { ScheduleBuilder } from '@/features/schedules/components/ScheduleBuilder'
import { Modal } from '@/components/ui/Modal'

/**
 * Schedule Details Page
 * 
 * Enhanced schedule detail view following copilot-instructions-ui.instructions.md
 * - Server Components by default (using 'use client' only when needed)
 * - TypeScript strict mode with proper interfaces
 * - Tailwind CSS for styling
 * - React Query for server state management
 * - Layout Group pattern: Inside (dashboard) layout for consistent sidebar
 * - Clean URLs: /schedules/123 (not /schedules/details/123)
 */
export default function ScheduleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const scheduleId = params.id as string

  // Form states
  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showConflictModal, setShowConflictModal] = useState(false)

  // API hooks
  const { data: schedule, isLoading, error } = useScheduleById(scheduleId)
  const updateMutation = useUpdateSchedule()
  const deleteMutation = useDeleteSchedule()

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <div className="h-8 bg-gray-300 rounded w-64"></div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">Failed to load schedule</h2>
          <p className="text-gray-600 mt-2">Please try again later</p>
          <button
            onClick={() => router.push('/schedules')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schedules
          </button>
        </div>
      </div>
    )
  }

  // Schedule not found
  if (!schedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">Schedule not found</h2>
          <p className="text-gray-600 mt-2">The schedule you're looking for doesn't exist</p>
          <button
            onClick={() => router.push('/schedules')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schedules
          </button>
        </div>
      </div>
    )
  }

  // Delete handler
  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(scheduleId)
      router.push('/schedules')
    } catch (error) {
      console.error('Failed to delete schedule:', error)
    }
  }

  // Toggle active status
  const handleToggleActive = async () => {
    try {
      await updateMutation.mutateAsync({
        id: scheduleId,
        updates: {
          status: schedule.isActive ? 'inactive' : 'active'
        }
      })
    } catch (error) {
      console.error('Failed to toggle schedule status:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Breadcrumb & Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/schedules')}
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Schedules
              </button>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">{schedule.name}</h1>
                <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
                  </span>
                  {schedule.startTime && schedule.endTime && (
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {schedule.startTime} - {schedule.endTime}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Monitor className="mr-1 h-4 w-4" />
                    {schedule.deviceCount || 0} device(s)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Status Badge */}
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  schedule.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {schedule.isActive ? 'active' : 'inactive'}
              </span>

              {/* Toggle Active */}
              <button
                onClick={handleToggleActive}
                className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                  schedule.isActive
                    ? 'border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100'
                    : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                }`}
              >
                {schedule.isActive ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </button>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditMode(true)}
                className="inline-flex items-center px-3 py-2 border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 text-sm font-medium rounded-md"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </button>

              {/* More Actions Dropdown */}
              <div className="relative">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium rounded-md">
                  <Settings className="mr-2 h-4 w-4" />
                  More
                </button>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 text-sm font-medium rounded-md"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Schedule Information Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Schedule Details</h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Schedule Name</label>
                    <p className="mt-1 text-sm text-gray-900">{schedule.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <p className="mt-1 text-sm text-gray-900">Standard Priority</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(schedule.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(schedule.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <p className="mt-1 text-sm text-gray-900">{schedule.startTime}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <p className="mt-1 text-sm text-gray-900">{schedule.endTime}</p>
                  </div>
                </div>
                {schedule.description && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{schedule.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Content Sources */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileImage className="mr-2 h-5 w-5" />
                  Content Sources
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {/* Assignment Type - Dynamic display with helper function */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Assignment Type:</span>
                    <span className={getAssignmentTypeClasses('Schedule')}>
                      {getAssignmentTypeDisplay('Schedule')}
                    </span>
                  </div>
                  
                  {/* Media Files Information */}
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-2">Media Content:</span>
                    <div className="space-y-2">
                      {schedule.mediaFiles && schedule.mediaFiles.length > 0 ? (
                        schedule.mediaFiles.map((media, index) => (
                          <div key={`media-${media.mediaId}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <FileImage className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Media ID: {media.mediaId}</p>
                                <p className="text-xs text-gray-500">
                                  Duration: {media.durationSeconds ? `${media.durationSeconds}s` : 'No duration'}
                                </p>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Order: {media.order}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <FileImage className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">No media content assigned</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recurrence Pattern */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Recurrence Pattern
                </h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-900">No recurrence</p>
              </div>
            </div>

            {/* Conflict Detection */}
            <ConflictDetection 
              conflicts={[]} 
              onResolve={(conflictId, strategy) => {
                console.log('Resolving conflict:', conflictId, strategy)
              }}
              onDismiss={(conflictId) => {
                console.log('Dismissing conflict:', conflictId)
              }}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Assigned Users */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Assigned Users
                </h2>
              </div>
              <div className="px-6 py-4">
                <AssignedUsersList scheduleId={Number(scheduleId)} />
              </div>
            </div>

            {/* Target Devices */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Monitor className="mr-2 h-5 w-5" />
                  Target Devices
                </h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-500">No devices assigned</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              <div className="px-6 py-4 space-y-2">
                <button
                  onClick={() => setShowConflictModal(true)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Check for Conflicts
                </button>
                <button
                  onClick={() => {/* Navigate to duplicate */}}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate Schedule
                </button>
                <button
                  onClick={() => {/* Export functionality */}}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Export Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditMode}
        onClose={() => setIsEditMode(false)}
        title="Edit Schedule"
        size="xl"
      >
        <ScheduleBuilder
          initialData={{
            name: schedule.name,
            description: schedule.description || '',
          }}
          onSave={() => {
            setIsEditMode(false)
            // Refetch data
          }}
          onCancel={() => setIsEditMode(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Schedule"
      >
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete "{schedule.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Delete Schedule
            </button>
          </div>
        </div>
      </Modal>

      {/* Conflict Detection Modal */}
      <Modal
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        title="Conflict Detection Results"
        size="lg"
      >
        <div className="p-6">
          <ConflictDetection 
            conflicts={[]} 
            onResolve={(conflictId, strategy) => {
              console.log('Resolving conflict in modal:', conflictId, strategy)
            }}
          />
        </div>
      </Modal>
    </div>
  )
}