// @ts-nocheck
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, Calendar, Clock, Target, Film, FileImage, Play, CheckCircle2, AlertCircle, Search, FileText } from 'lucide-react'
import type {
  CreateScheduleRequest,
  TimeSlot,
  TargetDevice,
  ScheduleContent,
  RecurrenceConfig,
} from '../types'
import { ConflictDetection } from './ConflictDetection'
import { useValidateSchedule } from '../hooks/useSchedules'
import { useMediaScheduleIntegration } from '@/hooks/useMediaScheduleIntegration'
import { useDevices } from '@/features/devices/hooks/useDevices'
import { useMedia } from '@/hooks/useMedia'
import { Button } from '@/components/ui/Button'

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
        deviceId: z.number(),  // Device ID as number
        groupId: z.number().optional(),
        name: z.string(),
        type: z.enum(['specific', 'group']),
      })
    )
    .min(1, 'At least one target device or group is required'),
  content: z
    .array(
      z.object({
        id: z.string(),  // Local form field ID
        mediaId: z.number(),  // Media ID as number
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
  const [deviceSearch, setDeviceSearch] = useState('')
  const [mediaSearch, setMediaSearch] = useState('')
  const validateMutation = useValidateSchedule()
  
  // Fetch devices and media
  const devicesResult = useDevices()
  const devices = Array.isArray(devicesResult?.devices) ? devicesResult.devices : []
  const devicesLoading = devicesResult?.isLoading || false
  
  const { data: mediaFiles = [], isLoading: mediaLoading } = useMedia()

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

  // Tab validation status
  const tabValidation = useMemo(() => {
    // Basic validation
    const basicValid = !!(formData.name && formData.startDate && formData.endDate)
    
    // Time slots validation - check all required fields
    const timeValid = formData.timeSlots?.length > 0 && 
      formData.timeSlots.every(slot => 
        slot.startTime && 
        slot.endTime && 
        slot.daysOfWeek && 
        slot.daysOfWeek.length > 0
      )
    
    // Targets validation
    const targetsValid = formData.targetDevices?.length > 0
    
    // Content validation
    const contentValid = formData.content?.length > 0
    
    return {
      basic: basicValid,
      time: timeValid,
      targets: targetsValid,
      content: contentValid,
    }
  }, [formData.name, formData.startDate, formData.endDate, formData.timeSlots, formData.targetDevices, formData.content])

  const isFormValid = useMemo(() => {
    return tabValidation.basic && tabValidation.time && tabValidation.targets && tabValidation.content
  }, [tabValidation])

  // Real-time validation (disabled to avoid 405 error)
  // useEffect(() => {
  //   if (
  //     formData.name &&
  //     formData.startDate &&
  //     formData.endDate &&
  //     formData.timeSlots.length > 0 &&
  //     formData.targetDevices.length > 0
  //   ) {
  //     const timer = setTimeout(() => {
  //       validateMutation.mutate({
  //         name: formData.name,
  //         startDate: formData.startDate,
  //         endDate: formData.endDate,
  //         timeSlots: formData.timeSlots,
  //         targetDevices: formData.targetDevices as TargetDevice[],
  //         priority: formData.priority,
  //       })
  //     }, 1000)
  //     return () => clearTimeout(timer)
  //   }
  //   return undefined
  // }, [
  //   formData.name,
  //   formData.startDate,
  //   formData.endDate,
  //   formData.timeSlots,
  //   formData.targetDevices,
  //   formData.priority,
  //   validateMutation,
  // ])

  const onSubmit = (data: ScheduleFormData) => {
    console.log('💾 Form submitted with data:', data)
    onSave(data as CreateScheduleRequest)
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {[
            { id: 'basic', label: 'Basic Info', icon: Calendar, key: 'basic' as const },
            { id: 'time', label: 'Time Slots', icon: Clock, key: 'time' as const },
            { id: 'targets', label: 'Target Devices', icon: Target, key: 'targets' as const },
            { id: 'content', label: 'Content', icon: Film, key: 'content' as const },
          ].map((tab) => {
            const Icon = tab.icon
            const isValid = tabValidation[tab.key]
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 relative ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {/* Validation Indicator */}
                {isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      {...register(`timeSlots.${index}.endTime`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Target Devices</h3>
              <div className="text-sm text-gray-600">
                {targetDeviceFields.length} device{targetDeviceFields.length !== 1 ? 's' : ''} selected
              </div>
            </div>

            {/* Device Search & Selection */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
                placeholder="Search devices..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
              />
            </div>

            {devicesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading devices...</p>
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No devices available</p>
                <p className="text-xs text-gray-500 mt-1">Add devices first to create schedules</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Array.isArray(devices) && devices
                  .filter(device => 
                    device.name?.toLowerCase().includes(deviceSearch.toLowerCase()) ||
                    device.deviceId?.toLowerCase().includes(deviceSearch.toLowerCase())
                  )
                  .map((device) => {
                    const deviceId = device.id  // Keep as number
                    const isSelected = targetDeviceFields.some(
                      (field) => field.deviceId === deviceId
                    )
                    
                    return (
                      <label
                        key={device.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              // Check if already exists before adding
                              const exists = targetDeviceFields.some(
                                (field) => field.deviceId === deviceId
                              )
                              
                              if (!exists) {
                                appendTargetDevice({
                                  deviceId: deviceId,
                                  name: device.name || '',
                                  type: 'specific',
                                })
                              }
                            } else {
                              const index = targetDeviceFields.findIndex(
                                (field) => field.deviceId === deviceId
                              )
                              if (index !== -1) {
                                removeTargetDevice(index)
                              }
                            }
                          }}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{device.name}</p>
                          <p className="text-xs text-gray-500">
                            {device.deviceId} • {device.status || 'Unknown'}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        )}
                      </label>
                    )
                  })}
              </div>
            )}

            {errors.targetDevices && (
              <p className="text-sm text-red-600">{errors.targetDevices.message}</p>
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Content Items</h3>
              <div className="text-sm text-gray-600">
                {contentFields.length} item{contentFields.length !== 1 ? 's' : ''} selected
              </div>
            </div>

            {/* Media Search & Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  placeholder="Search media..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                />
              </div>
            </div>

            {mediaLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading media files...</p>
              </div>
            ) : mediaFiles.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No media files available</p>
                <p className="text-xs text-gray-500 mt-1">Upload media first to create schedules</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {Array.isArray(mediaFiles) && mediaFiles
                  .filter(media => 
                    media.name?.toLowerCase().includes(mediaSearch.toLowerCase()) ||
                    media.type?.toLowerCase().includes(mediaSearch.toLowerCase())
                  )
                  .map((media) => {
                    const mediaId = media.id  // Keep as number
                    const isSelected = contentFields.some(
                      (field) => field.mediaId === mediaId
                    )
                    
                    return (
                      <label
                        key={media.id}
                        className={`relative flex flex-col p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              appendContent({
                                id: crypto.randomUUID(),
                                mediaId: mediaId,  // Store as number
                                mediaName: media.name || '',
                                order: contentFields.length + 1,
                                duration: 15,
                                transition: 'fade',
                              })
                            } else {
                              const index = contentFields.findIndex(
                                (field) => field.mediaId === mediaId
                              )
                              if (index !== -1) {
                                removeContent(index)
                              }
                            }
                          }}
                          className="absolute top-3 right-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        
                        {/* Media Preview */}
                        <div className="aspect-video bg-gray-100 rounded-md mb-2 overflow-hidden">
                          {media.type?.toLowerCase().includes('image') ? (
                            <img
                              src={media.url || '/placeholder-image.svg'}
                              alt={media.name || 'Media'}
                              className="w-full h-full object-cover"
                            />
                          ) : media.type?.toLowerCase().includes('video') ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Play className="h-8 w-8 text-gray-400" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Media Info */}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate mb-1">
                            {media.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="px-2 py-0.5 bg-gray-100 rounded">
                              {media.type}
                            </span>
                            {media.size && (
                              <span>{(media.size / 1024 / 1024).toFixed(1)} MB</span>
                            )}
                          </div>
                        </div>
                        
                        {isSelected && (
                          <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-blue-600 bg-white rounded-full" />
                        )}
                      </label>
                    )
                  })}
              </div>
            )}

            {/* Selected Content Configuration */}
            {contentFields.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  Configure Selected Items ({contentFields.length})
                </h4>
                <div className="space-y-3">
                  {contentFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {field.mediaName || `Item ${index + 1}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          {...register(`content.${index}.duration`, { valueAsNumber: true })}
                          min={1}
                          className="w-20 px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                          placeholder="15"
                        />
                        <span className="text-xs text-gray-600">sec</span>
                        <select
                          {...register(`content.${index}.transition`)}
                          className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                        >
                          <option value="none">None</option>
                          <option value="fade">Fade</option>
                          <option value="slide">Slide</option>
                          <option value="zoom">Zoom</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeContent(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

        {/* Validation Summary */}
        {!isFormValid && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  Please complete all required sections:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                  {!tabValidation.basic && (
                    <li>Basic Info: Name, start date, and end date are required</li>
                  )}
                  {!tabValidation.time && (
                    <li>Time Slots: Add at least one time slot</li>
                  )}
                  {!tabValidation.targets && (
                    <li>Target Devices: Select at least one device or group</li>
                  )}
                  {!tabValidation.content && (
                    <li>Content: Add at least one media item</li>
                  )}
                </ul>
              </div>
            </div>
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
            disabled={!isFormValid}
            title={
              !isFormValid
                ? 'Please complete all required sections (Basic Info, Time Slots, Target Devices, Content)'
                : 'Save schedule'
            }
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isFormValid ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Save Schedule
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                Complete All Sections
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
