'use client'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Plus, Calendar, List, Filter, Users, Settings, UserCheck, Copy, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { ScheduleCalendar } from '@/features/schedules/components/ScheduleCalendar'
import { ScheduleBuilder } from '@/features/schedules/components/ScheduleBuilder'
import { ConflictDetection } from '@/features/schedules/components/ConflictDetection'
import { DefaultScheduleToggle } from '@/features/users/components/DefaultScheduleToggle'
import { ContentSourceBadge } from '@/features/schedules/components/ContentSourceBadge'
import { AssignedUsersList } from '@/features/schedules/components/AssignedUsersList'
import { UserScheduleAssignment } from '@/features/users/components/UserScheduleAssignment'
import { Modal } from '@/components/ui/Modal'
import {
  useSchedules,
  useScheduleCalendar,
  useScheduleStats,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from '@/features/schedules/hooks/useSchedules'
import type { CreateScheduleRequest, CalendarEvent } from '@/features/schedules/types'
import type { BulkOperation, BulkOperationResult, OptimisticUpdate, PerformanceMetric } from '@/types/enhanced-ui'

/**
 * Schedule Management Page
 * Main page for managing schedules with calendar view, schedule builder, and conflict detection
 */
export default function SchedulesPage() {
  const [view, setView] = useState<'calendar' | 'list' | 'users'>('calendar')
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [showUsersModal, setShowUsersModal] = useState(false)
  const [selectedScheduleForUsers, setSelectedScheduleForUsers] = useState<string | null>(null)
  
  // Enhanced state for user assignment features
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const [enhancedFeaturesEnabled, setEnhancedFeaturesEnabled] = useState(
    process.env.NEXT_PUBLIC_ENABLE_ENHANCED_UI === 'true'
  )
  const [selectedScheduleForAssignment, setSelectedScheduleForAssignment] = useState<any>(null)

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

  const handleViewUsers = (scheduleId: string) => {
    setSelectedScheduleForUsers(scheduleId)
    setShowUsersModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Create and manage content schedules with enhanced user assignment capabilities
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {enhancedFeaturesEnabled && (
                <div className="text-right mr-4">
                  <div className="text-sm font-medium text-gray-900">
                    Enhanced UI Active
                  </div>
                  <div className="text-xs text-gray-500">
                    Bulk assignment • Real-time updates
                  </div>
                </div>
              )}
              <Link href="/schedules/templates">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                  <Copy className="h-5 w-5" />
                  Templates
                </button>
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Plus className="h-5 w-5" />
                Create Schedule
              </button>
            </div>
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
        {/* Enhanced View Toggle with User Assignment */}
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
            <button
              onClick={() => setView('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              User Assignment
              {enhancedFeaturesEnabled && (
                <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Enhanced
                </span>
              )}
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
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Devices
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Default
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedulesLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                        Loading schedules...
                      </td>
                    </tr>
                  ) : schedules.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <ContentSourceBadge contentSource="Default" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.priority}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.targetDevices.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedScheduleForAssignment(schedule);
                              setView('users');
                            }}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-900"
                          >
                            <Users className="h-4 w-4" />
                            <span>Assign Users</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(schedule.startDate).toLocaleDateString()} -{' '}
                          {new Date(schedule.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <DefaultScheduleToggle
                            scheduleId={parseInt(schedule.id)}
                            isDefault={false}
                            onToggle={() => {}}
                          />
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

        {/* Enhanced User Assignment View */}
        {view === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Schedule-to-User Assignment
                </h2>
                <p className="text-sm text-gray-600">
                  Assign schedules to users with enhanced bulk operations and real-time feedback
                </p>
              </div>

              {selectedScheduleForAssignment ? (
                <div className="space-y-6">
                  {/* Schedule Info Panel */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                            {selectedScheduleForAssignment.name}
                          </h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            {selectedScheduleForAssignment.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600 dark:text-blue-400">
                            <span>Priority: {selectedScheduleForAssignment.priority}</span>
                            <span>Status: {selectedScheduleForAssignment.status}</span>
                            <span>Devices: {selectedScheduleForAssignment.targetDevices.length}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* Quick Schedule Switcher */}
                        {enhancedFeaturesEnabled && schedules && schedules.length > 1 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-blue-600 dark:text-blue-400">Switch to:</span>
                            <select
                              value={selectedScheduleForAssignment.id}
                              onChange={(e) => {
                                const newSchedule = schedules.find(s => s.id === e.target.value);
                                if (newSchedule) {
                                  setSelectedScheduleForAssignment(newSchedule);
                                }
                              }}
                              className="text-sm border border-blue-300 dark:border-blue-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              {schedules.map(schedule => (
                                <option key={schedule.id} value={schedule.id}>
                                  {schedule.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setSelectedScheduleForAssignment(null);
                            setView('list');
                          }}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm font-medium flex items-center space-x-1"
                        >
                          <span>← Back to Schedules</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics Dashboard for Schedules */}
                  {enhancedFeaturesEnabled && performanceMetrics.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
                          Assignment Performance Metrics
                        </h3>
                        <button
                          onClick={() => setPerformanceMetrics([])}
                          className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        {performanceMetrics.slice(-4).map((metric, index) => (
                          <div key={index} className="text-center">
                            <div className="font-medium text-green-800 dark:text-green-200">
                              {metric.value.toFixed(1)}{metric.unit}
                            </div>
                            <div className="text-green-600 dark:text-green-400">
                              {metric.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Bulk Operations for Schedule Assignment */}
                  {bulkOperations.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                      <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                        Active User Assignment Operations ({bulkOperations.length})
                      </h3>
                      <div className="space-y-2">
                        {bulkOperations.map((operation) => (
                          <div key={operation.id} className="flex items-center justify-between text-xs">
                            <span className="text-yellow-800 dark:text-yellow-200">
                              {operation.type}: {operation.selectedItems.length} users
                            </span>
                            <span className="text-yellow-600 dark:text-yellow-400">
                              In Progress...
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enhanced User Assignment Interface */}
                  <div className="space-y-6">
                    {/* Bulk Operations Control Panel */}
                    {enhancedFeaturesEnabled && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Bulk User Assignment Operations
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Assign "{selectedScheduleForAssignment.name}" to multiple users efficiently
                          </p>
                        </div>
                        
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Quick Assignment Actions */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                <UserCheck className="w-4 h-4 mr-2 text-blue-500" />
                                Quick Assignment
                              </h4>
                              <div className="space-y-2">
                                <button 
                                  onClick={() => {
                                    // Simulate bulk assign to active users
                                    const newOperation: BulkOperation = {
                                      id: Date.now().toString(),
                                      type: 'assign',
                                      selectedItems: ['1', '2', '3', '4', '5'], // Mock user IDs
                                      options: { scheduleIds: [selectedScheduleForAssignment.id] },
                                      progress: { total: 5, completed: 0, failed: 0, skipped: 0 },
                                      validation: { warnings: [], errors: [], canProceed: true }
                                    };
                                    setBulkOperations(prev => [...prev, newOperation]);
                                    setTimeout(() => setBulkOperations(prev => prev.filter(op => op.id !== newOperation.id)), 4000);
                                  }}
                                  className="w-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-2 rounded text-sm hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                >
                                  Assign to Active Users
                                </button>
                                <button 
                                  onClick={() => {
                                    // Simulate bulk assign to role-based users
                                    const newOperation: BulkOperation = {
                                      id: Date.now().toString(),
                                      type: 'assign',
                                      selectedItems: ['6', '7', '8'], // Mock user IDs
                                      options: { scheduleIds: [selectedScheduleForAssignment.id] },
                                      progress: { total: 3, completed: 0, failed: 0, skipped: 0 },
                                      validation: { warnings: [], errors: [], canProceed: true }
                                    };
                                    setBulkOperations(prev => [...prev, newOperation]);
                                    setTimeout(() => setBulkOperations(prev => prev.filter(op => op.id !== newOperation.id)), 3500);
                                  }}
                                  className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                  Assign by Role
                                </button>
                                <button 
                                  onClick={() => {
                                    // Simulate bulk assign to department users
                                    const newOperation: BulkOperation = {
                                      id: Date.now().toString(),
                                      type: 'assign',
                                      selectedItems: ['9', '10'], // Mock user IDs
                                      options: { scheduleIds: [selectedScheduleForAssignment.id] },
                                      progress: { total: 2, completed: 0, failed: 0, skipped: 0 },
                                      validation: { warnings: [], errors: [], canProceed: true }
                                    };
                                    setBulkOperations(prev => [...prev, newOperation]);
                                    setTimeout(() => setBulkOperations(prev => prev.filter(op => op.id !== newOperation.id)), 3000);
                                  }}
                                  className="w-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-2 rounded text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                >
                                  Assign by Department
                                </button>
                              </div>
                            </div>

                            {/* Bulk Management */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                <Settings className="w-4 h-4 mr-2 text-orange-500" />
                                Bulk Management
                              </h4>
                              <div className="space-y-2">
                                <button 
                                  onClick={() => {
                                    // Simulate priority update
                                    const newOperation: BulkOperation = {
                                      id: Date.now().toString(),
                                      type: 'change-priority',
                                      selectedItems: ['1', '2', '3'],
                                      options: { priority: 1 },
                                      progress: { total: 3, completed: 0, failed: 0, skipped: 0 },
                                      validation: { warnings: [], errors: [], canProceed: true }
                                    };
                                    setBulkOperations(prev => [...prev, newOperation]);
                                    setTimeout(() => setBulkOperations(prev => prev.filter(op => op.id !== newOperation.id)), 2500);
                                  }}
                                  className="w-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-3 py-2 rounded text-sm hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                                >
                                  Update Priorities
                                </button>
                                <button 
                                  onClick={() => {
                                    // Simulate bulk remove assignments
                                    const newOperation: BulkOperation = {
                                      id: Date.now().toString(),
                                      type: 'remove',
                                      selectedItems: ['4', '5'],
                                      options: { scheduleIds: [selectedScheduleForAssignment.id] },
                                      progress: { total: 2, completed: 0, failed: 0, skipped: 0 },
                                      validation: { warnings: [], errors: [], canProceed: true }
                                    };
                                    setBulkOperations(prev => [...prev, newOperation]);
                                    setTimeout(() => setBulkOperations(prev => prev.filter(op => op.id !== newOperation.id)), 2000);
                                  }}
                                  className="w-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                  Remove Assignments
                                </button>
                                <button className="w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                  Copy to Schedule
                                </button>
                              </div>
                            </div>

                               {/* Assignment Analytics */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                <Users className="w-4 h-4 mr-2 text-indigo-500" />
                                Assignment Stats
                              </h4>
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Total Users</span>
                                  <span className="font-medium text-gray-900 dark:text-white">24</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Assigned</span>
                                  <span className="font-medium text-green-600 dark:text-green-400">8</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Conflicts</span>
                                  <span className="font-medium text-yellow-600 dark:text-yellow-400">2</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Available</span>
                                  <span className="font-medium text-blue-600 dark:text-blue-400">14</span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '33%' }}></div>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">33% assigned</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced User List Interface */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            User Assignment for: {selectedScheduleForAssignment.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {enhancedFeaturesEnabled && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Enhanced Mode
                              </span>
                            )}
                            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">
                              Export List
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        {/* This will be the enhanced user assignment component */}
                        <AssignedUsersList 
                          scheduleId={parseInt(selectedScheduleForAssignment.id)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No schedule selected
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a schedule from the List View to manage user assignments
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setView('list')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <List className="w-4 h-4 mr-2" />
                      View Schedules
                    </button>
                  </div>
                </div>
              )}
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

      {/* Assigned Users Modal */}
      {showUsersModal && selectedScheduleForUsers && (
        <Modal
          isOpen={showUsersModal}
          onClose={() => {
            setShowUsersModal(false)
            setSelectedScheduleForUsers(null)
          }}
          title="Assigned Users"
          size="lg"
        >
          <div className="p-6">
            <AssignedUsersList scheduleId={parseInt(selectedScheduleForUsers)} />
          </div>
        </Modal>
      )}
    </div>
  )
}
