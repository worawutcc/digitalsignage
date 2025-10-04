import { useState } from 'react'
import { Repeat, Calendar, Clock, Settings, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  interval: number
  daysOfWeek?: number[] // 0 = Sunday, 1 = Monday, etc.
  dayOfMonth?: number
  endType: 'never' | 'date' | 'count'
  endDate?: string
  endCount?: number
  exceptions?: string[] // dates to skip
}

export interface RecurringSchedule {
  id: string
  name: string
  description: string
  pattern: RecurringPattern
  nextRun: string
  totalRuns: number
  completedRuns: number
  status: 'active' | 'paused' | 'completed'
  createdAt: string
}

interface RecurringSchedulesProps {
  schedules: RecurringSchedule[]
  onCreateRecurring: (pattern: RecurringPattern) => void
  onEditRecurring: (scheduleId: string) => void
  onPauseRecurring: (scheduleId: string) => void
  onResumeRecurring: (scheduleId: string) => void
  onDeleteRecurring: (scheduleId: string) => void
  className?: string
}

/**
 * Recurring schedules management component
 * Handles creation and management of recurring schedule patterns
 */
export function RecurringSchedules({
  schedules,
  onCreateRecurring,
  onEditRecurring,
  onPauseRecurring,
  onResumeRecurring,
  onDeleteRecurring,
  className = ''
}: RecurringSchedulesProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<RecurringPattern['type']>('daily')

  const getPatternDescription = (pattern: RecurringPattern) => {
    switch (pattern.type) {
      case 'daily':
        return `Every ${pattern.interval} day${pattern.interval > 1 ? 's' : ''}`
      case 'weekly':
        return `Every ${pattern.interval} week${pattern.interval > 1 ? 's' : ''}`
      case 'monthly':
        return `Every ${pattern.interval} month${pattern.interval > 1 ? 's' : ''}`
      case 'custom':
        return 'Custom pattern'
      default:
        return 'Unknown pattern'
    }
  }

  const getStatusColor = (status: RecurringSchedule['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Recurring Schedules
        </h3>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Recurring
        </Button>
      </div>

      {/* Recurring schedules list */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-gray-900">{schedule.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(schedule.status)}`}>
                    {schedule.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {schedule.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Repeat className="h-4 w-4" />
                    <span>{getPatternDescription(schedule.pattern)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Next: {formatDate(schedule.nextRun)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {schedule.completedRuns} / {
                        schedule.pattern.endType === 'count' 
                          ? schedule.pattern.endCount 
                          : '∞'
                      } runs
                    </span>
                  </div>
                </div>

                {/* Progress bar for count-based schedules */}
                {schedule.pattern.endType === 'count' && schedule.pattern.endCount && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((schedule.completedRuns / schedule.pattern.endCount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(schedule.completedRuns / schedule.pattern.endCount) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEditRecurring(schedule.id)}
                >
                  <Settings className="h-3 w-3" />
                </Button>
                
                {schedule.status === 'active' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onPauseRecurring(schedule.id)}
                  >
                    Pause
                  </Button>
                ) : schedule.status === 'paused' ? (
                  <Button
                    size="sm"
                    onClick={() => onResumeRecurring(schedule.id)}
                  >
                    Resume
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {schedules.length === 0 && (
        <div className="text-center py-12">
          <Repeat className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring schedules</h3>
          <p className="text-gray-500 mb-4">
            Create recurring schedules to automate your content scheduling
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Recurring Schedule
          </Button>
        </div>
      )}

      {/* Create recurring schedule modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border shadow-lg w-full max-w-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create Recurring Schedule</h3>
              
              {/* Pattern selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recurrence Pattern
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['daily', 'weekly', 'monthly', 'custom'] as const).map((pattern) => (
                    <Button
                      key={pattern}
                      variant={selectedPattern === pattern ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setSelectedPattern(pattern)}
                      className="capitalize"
                    >
                      {pattern}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="text-gray-600 mb-6">
                Recurring schedule configuration form would go here...
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // Create basic recurring pattern
                    onCreateRecurring({
                      type: selectedPattern,
                      interval: 1,
                      endType: 'never'
                    })
                    setShowCreateForm(false)
                  }}
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}