'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, Calendar, Clock, FileText, AlertTriangle, Target, Edit } from 'lucide-react'
import { assignmentService } from '@/features/assignments/services/assignmentService'
import { AssignmentPriority } from '@/features/assignments/components/AssignmentPriority'

export default function AssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = Number(params.id)

  const { data: assignment, isLoading: loading, error } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => assignmentService.getById(assignmentId),
    enabled: !!assignmentId && !isNaN(assignmentId),
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-center h-64 p-6">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">Assignment Not Found</h3>
              <p className="text-gray-600">
                {error ? (typeof error === 'object' && 'message' in error ? String(error.message) : 'An error occurred') : 'The assignment you are looking for does not exist.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active': return 'success'
      case 'scheduled': return 'warning'
      case 'expired': return 'info'
      case 'cancelled': return 'error'
      case 'paused': return 'warning'
      default: return 'default'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'schedule': return <Calendar className="h-4 w-4" />
      case 'playlist': return <FileText className="h-4 w-4" />
      case 'emergency': return <AlertTriangle className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: number): string => {
    if (priority >= 8) return 'text-red-600 bg-red-100'
    if (priority >= 6) return 'text-orange-600 bg-orange-100'
    if (priority >= 4) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignment Details</h1>
            <p className="text-gray-600">ID: {assignment.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(assignment.status) as any}>
            {assignment.status}
          </Badge>
          <div className={`px-2 py-1 rounded text-sm font-medium ${getPriorityColor(assignment.priority)}`}>
            Priority: {assignment.priority}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium flex items-center gap-2">
                {getTypeIcon(assignment.assignmentType)}
                Assignment Information
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-sm text-gray-900 capitalize">{assignment.assignmentType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Target Type</label>
                  <p className="text-sm text-gray-900 capitalize">{assignment.targetType}</p>
                </div>
              </div>

              {assignment.contentName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Content</label>
                  <p className="text-sm text-gray-900">{assignment.contentName}</p>
                </div>
              )}

              {assignment.targetName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Target</label>
                  <p className="text-sm text-gray-900">{assignment.targetName}</p>
                </div>
              )}

              {assignment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{assignment.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Information */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule Information
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {assignment.startDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(assignment.startDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {assignment.endDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">End Date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(assignment.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {assignment.startTime && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Time</label>
                    <p className="text-sm text-gray-900">{assignment.startTime}</p>
                  </div>
                )}
                {assignment.endTime && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">End Time</label>
                    <p className="text-sm text-gray-900">{assignment.endTime}</p>
                  </div>
                )}
              </div>

              {assignment.isRecurring && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="info">Recurring</Badge>
                  </div>
                  {assignment.daysOfWeek && assignment.daysOfWeek.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Days of Week</label>
                      <div className="flex gap-2 mt-1">
                        {assignment.daysOfWeek.split(',').map((day: string) => (
                          <Badge key={day.trim()} variant="info" className="text-xs">
                            {day.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Emergency Broadcast */}
          {assignment.isEmergencyBroadcast && (
            <div className="bg-red-50 border border-red-200 rounded-lg shadow-sm">
              <div className="p-4 border-b border-red-200">
                <h3 className="text-lg font-medium flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  Emergency Broadcast
                </h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-red-700">
                  This assignment is marked as an emergency broadcast and will take priority over other content.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <Button 
                className="w-full" 
                onClick={() => router.push(`/assignments/${assignment.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Assignment
              </Button>
              <Button variant="outline" className="w-full">
                Duplicate
              </Button>
              <div className="border-t pt-2 mt-2" />
              <Button variant="destructive" className="w-full">
                Delete Assignment
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Metadata</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-sm text-gray-900">
                  {new Date(assignment.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Updated At</label>
                <p className="text-sm text-gray-900">
                  {new Date(assignment.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}