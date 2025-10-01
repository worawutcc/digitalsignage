'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, Calendar, Clock, Target, Film } from 'lucide-react'
import type {
  CreateScheduleRequest,
  TimeSlot,
  TargetDevice,
  ScheduleContent,
  RecurrenceConfig,
} from '../types'
import { ConflictDetection } from './ConflictDetection'
import { useValidateSchedule } from '../hooks/useSchedules'

// Validation schema
const scheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  description: z.string().optional(),
  priority: z.number().min(1).max(10),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  timeSlots: z
    .array(
      z.object({
        id: z.string(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
        daysOfWeek: z.array(z.number()),
        timezone: z.string(),
      })
    )
    .min(1, 'At least one time slot is required'),
  recurrence: z.object({
    type: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom', 'never']),
    interval: z.number().min(1),
    endType: z.enum(['never', 'date', 'count']),
    endDate: z.string().optional(),
    endCount: z.number().optional(),
  }),
  targetDevices: z
    .array(
      z.object({
        id: z.string().optional(),
        groupId: z.string().optional(),
        name: z.string(),
        type: z.enum(['specific', 'group']),
      })
    )
    .min(1, 'At least one target device or group is required'),
  content: z
    .array(
      z.object({
        id: z.string(),
        mediaId: z.string(),
        mediaName: z.string(),
        order: z.number(),
        duration: z.number().min(1, 'Duration must be at least 1 second'),
        transition: z.enum(['fade', 'slide', 'zoom', 'none']).optional(),
      })
    )
    .min(1, 'At least one content item is required'),
})

type ScheduleFormData = z.infer<typeof scheduleSchema>

export interface ScheduleBuilderProps {
  initialData?: Partial<CreateScheduleRequest>
  onSave: (schedule: CreateScheduleRequest) => void
  onCancel: () => void
  className?: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

/**
 * ScheduleBuilder Component
 * Comprehensive schedule creation and editing interface
 */
export function ScheduleBuilder({
  initialData,
  onSave,
  onCancel,
  className = '',
}: ScheduleBuilderProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'time' | 'targets' | 'content'>('basic')
  const validateMutation = useValidateSchedule()

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: (initialData as ScheduleFormData) || {
      name: '',
      description: '',
      priority: 5,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      timeSlots: [
        {
          id: crypto.randomUUID(),
          startTime: '09:00',
          endTime: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
          timezone: 'Asia/Bangkok',
        },
      ],
      recurrence: {
        type: 'never' as const,
        interval: 1,
        endType: 'never' as const,
      },
      targetDevices: [],
      content: [],
    },
  })

  const {
    fields: timeSlotFields,
    append: appendTimeSlot,
    remove: removeTimeSlot,
  } = useFieldArray({
    control,
    name: 'timeSlots',
  })

  const {
    fields: targetDeviceFields,
    append: appendTargetDevice,
    remove: removeTargetDevice,
  } = useFieldArray({
    control,
    name: 'targetDevices',
  })

  const {
    fields: contentFields,
    append: appendContent,
    remove: removeContent,
  } = useFieldArray({
    control,
    name: 'content',
  })

  const formData = watch()

  // Real-time validation
  useEffect(() => {
    if (
      formData.name &&
      formData.startDate &&
      formData.endDate &&
      formData.timeSlots.length > 0 &&
      formData.targetDevices.length > 0
    ) {
      const timer = setTimeout(() => {
        validateMutation.mutate({
          name: formData.name,
          startDate: formData.startDate,
          endDate: formData.endDate,
          timeSlots: formData.timeSlots,
          targetDevices: formData.targetDevices as TargetDevice[],
          priority: formData.priority,
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [
    formData.name,
    formData.startDate,
    formData.endDate,
    formData.timeSlots,
    formData.targetDevices,
    formData.priority,
    validateMutation,
  ])

  const onSubmit = (data: ScheduleFormData) => {
    onSave(data as CreateScheduleRequest)
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {[
            { id: 'basic', label: 'Basic Info', icon: Calendar },
            { id: 'time', label: 'Time Slots', icon: Clock },
            { id: 'targets', label: 'Target Devices', icon: Target },
            { id: 'content', label: 'Content', icon: Film },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter schedule name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter schedule description"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority (1-10) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('priority', { valueAsNumber: true })}
                  min={1}
                  max={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recurrence
              </label>
              <select
                {...register('recurrence.type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="never">No Recurrence</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        )}

        {/* Time Slots Tab */}
        {activeTab === 'time' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Time Slots</h3>
              <button
                type="button"
                onClick={() =>
                  appendTimeSlot({
                    id: crypto.randomUUID(),
                    startTime: '09:00',
                    endTime: '17:00',
                    daysOfWeek: [1, 2, 3, 4, 5],
                    timezone: 'Asia/Bangkok',
                  })
                }
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
              >
                <Plus className="h-4 w-4" />
                Add Time Slot
              </button>
            </div>

            {timeSlotFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Time Slot {index + 1}
                  </h4>
                  {timeSlotFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      {...register(`timeSlots.${index}.startTime`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      {...register(`timeSlots.${index}.endTime`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Days of Week
                  </label>
                  <div className="flex gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <label
                        key={day.value}
                        className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          value={day.value}
                          {...register(`timeSlots.${index}.daysOfWeek`)}
                          className="sr-only peer"
                        />
                        <span className="text-xs font-medium peer-checked:text-blue-600 peer-checked:font-bold">
                          {day.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {errors.timeSlots && (
              <p className="text-sm text-red-600">{errors.timeSlots.message}</p>
            )}
          </div>
        )}

        {/* Target Devices Tab */}
        {activeTab === 'targets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Target Devices</h3>
              <button
                type="button"
                onClick={() =>
                  appendTargetDevice({
                    id: '',
                    name: '',
                    type: 'specific',
                  })
                }
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
              >
                <Plus className="h-4 w-4" />
                Add Target
              </button>
            </div>

            {targetDeviceFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  {...register(`targetDevices.${index}.name`)}
                  placeholder="Device or group name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <select
                  {...register(`targetDevices.${index}.type`)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="specific">Specific Device</option>
                  <option value="group">Device Group</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeTargetDevice(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {errors.targetDevices && (
              <p className="text-sm text-red-600">{errors.targetDevices.message}</p>
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Content Items</h3>
              <button
                type="button"
                onClick={() =>
                  appendContent({
                    id: crypto.randomUUID(),
                    mediaId: '',
                    mediaName: '',
                    order: contentFields.length + 1,
                    duration: 15,
                    transition: 'fade',
                  })
                }
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
              >
                <Plus className="h-4 w-4" />
                Add Content
              </button>
            </div>

            {contentFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Item {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeContent(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Media Name
                    </label>
                    <input
                      type="text"
                      {...register(`content.${index}.mediaName`)}
                      placeholder="Enter media name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      {...register(`content.${index}.duration`, { valueAsNumber: true })}
                      min={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Transition
                    </label>
                    <select
                      {...register(`content.${index}.transition`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="none">None</option>
                      <option value="fade">Fade</option>
                      <option value="slide">Slide</option>
                      <option value="zoom">Zoom</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>
        )}

        {/* Conflict Detection */}
        {validateMutation.data && (
          <div className="mt-6">
            <ConflictDetection
              conflicts={[
                ...(validateMutation.data.conflicts || []),
                ...(validateMutation.data.warnings || []),
              ]}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              validateMutation.data?.conflicts?.some((c) => c.severity === 'error')
            }
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Schedule
          </button>
        </div>
      </form>
    </div>
  )
}
