'use client'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Plus, Calendar, List, Filter } from 'lucide-react'
import { ScheduleCalendar } from '@/features/schedules/components/ScheduleCalendar'
import { ScheduleBuilder } from '@/features/schedules/components/ScheduleBuilder'
import { ConflictDetection } from '@/features/schedules/components/ConflictDetection'
import {
  useSchedules,
  useScheduleCalendar,
  useScheduleStats,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from '@/features/schedules/hooks/useSchedules'
import type { CreateScheduleRequest, CalendarEvent } from '@/features/schedules/types'

/**
 * Schedule Management Page
 * Main page for managing schedules with calendar view, schedule builder, and conflict detection
 */
export default function SchedulesPage() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)

  // Get current date range for calendar
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

  // Fetch data
  const { data: schedules = [], isLoading: schedulesLoading } = useSchedules({
    status: ['active', 'draft'],
  })
  const { data: calendarData, isLoading: calendarLoading } = useScheduleCalendar(
    startOfMonth,
    endOfMonth,
    undefined,
    calendarView
  )
  const { data: stats } = useScheduleStats()

  // Mutations
  const createMutation = useCreateSchedule()
  const updateMutation = useUpdateSchedule()
  const deleteMutation = useDeleteSchedule()

  const handleCreateSchedule = async (schedule: CreateScheduleRequest) => {
    try {
      await createMutation.mutateAsync(schedule)
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create schedule:', error)
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedScheduleId(event.id)
    // Could open a detail modal or navigate to edit page
  }

  const handleDeleteSchedule = async (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete schedule:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Create and manage content schedules for your digital signage devices
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Plus className="h-5 w-5" />
              Create Schedule
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-900">
                  {stats.totalSchedules}
                </div>
                <div className="text-sm text-blue-700">Total Schedules</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-900">
                  {stats.activeSchedules}
                </div>
                <div className="text-sm text-green-700">Active</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-900">
                  {stats.draftSchedules}
                </div>
                <div className="text-sm text-yellow-700">Drafts</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-900">
                  {stats.conflictCount}
                </div>
                <div className="text-sm text-red-700">Conflicts</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Calendar View
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-4 w-4" />
              List View
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {calendarLoading ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="animate-pulse">Loading calendar...</div>
                </div>
              ) : (
                <ScheduleCalendar
                  events={calendarData?.events || []}
                  conflicts={calendarData?.conflicts || []}
                  onEventClick={handleEventClick}
                  view={calendarView}
                  onViewChange={setCalendarView}
                />
              )}
            </div>

            <div className="space-y-6">
              {/* Conflicts Panel */}
              {calendarData?.conflicts && calendarData.conflicts.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Schedule Conflicts
                  </h3>
                  <ConflictDetection conflicts={calendarData.conflicts} />
                </div>
              )}

              {/* Recent Schedules */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Schedules
                </h3>
                <div className="space-y-3">
                  {schedules.slice(0, 5).map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedScheduleId(schedule.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {schedule.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {schedule.targetDevices.length} device(s) • Priority{' '}
                            {schedule.priority}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            schedule.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : schedule.status === 'draft'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {schedule.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Devices
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedulesLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        Loading schedules...
                      </td>
                    </tr>
                  ) : schedules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No schedules found. Create your first schedule to get started.
                      </td>
                    </tr>
                  ) : (
                    schedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {schedule.name}
                          </div>
                          {schedule.description && (
                            <div className="text-xs text-gray-500">
                              {schedule.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              schedule.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : schedule.status === 'draft'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {schedule.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.priority}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.targetDevices.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(schedule.startDate).toLocaleDateString()} -{' '}
                          {new Date(schedule.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedScheduleId(schedule.id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create New Schedule
              </h2>
              <ScheduleBuilder
                onSave={handleCreateSchedule}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
