/**
 * Change Device Group Modal Component
 * 
 * Modal for changing device's group assignment
 * Following copilot-instructions-ui.instructions.md patterns
 * 
 * @see copilot-instructions-ui.instructions.md - Form Handling Rules
 */

'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Folder, Users, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useDeviceGroups } from '@/hooks/useDeviceGroups'
import { deviceApi } from '@/services/deviceApi'
import { toast } from 'react-hot-toast'

/**
 * Validation schema for device group change
 */
const changeGroupSchema = z.object({
  deviceGroupId: z.string().nullable(),
})

type ChangeGroupFormData = z.infer<typeof changeGroupSchema>

interface ChangeDeviceGroupModalProps {
  isOpen: boolean
  onClose: () => void
  deviceId: number
  deviceName: string
  currentGroupId?: number | null
  onSuccess?: () => void
}

/**
 * Change Device Group Modal Component
 */
export function ChangeDeviceGroupModal({
  isOpen,
  onClose,
  deviceId,
  deviceName,
  currentGroupId,
  onSuccess,
}: ChangeDeviceGroupModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Fetch device groups
  const { data: groups = [], isLoading: groupsLoading } = useDeviceGroups()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ChangeGroupFormData>({
    resolver: zodResolver(changeGroupSchema),
    defaultValues: {
      deviceGroupId: currentGroupId?.toString() ?? null,
    },
  })

  const selectedGroupId = watch('deviceGroupId')

  /**
   * Handle form submission
   */
  const onSubmit = async (data: ChangeGroupFormData) => {
    setIsSubmitting(true)
    try {
      // Convert string to number or null
      const deviceGroupId = data.deviceGroupId === null || data.deviceGroupId === '' 
        ? null 
        : Number(data.deviceGroupId)
      
      // Call API to update device group
      const response = await deviceApi.updateDeviceGroup(deviceId, deviceGroupId)
      
      // Show success message
      toast.success(response.data.message || 'Device group updated successfully')
      
      console.log('Device group updated:', response.data)

      // Call success callback and close modal
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to change device group:', error)
      
      // Show error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update device group'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Device Group"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Device Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Device: {deviceName}</p>
              <p className="text-xs text-blue-700">
                {currentGroupId ? `Current Group: ${currentGroupId}` : 'Not assigned to any group'}
              </p>
            </div>
          </div>
        </div>

        {/* Group Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Device Group
          </label>
          
          {groupsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Loading groups...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {/* Option: No Group */}
              <label className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 ${
                selectedGroupId === null || selectedGroupId === ''
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  value=""
                  {...register('deviceGroupId')}
                  className="h-4 w-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <X className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-700">No Group</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Remove device from all groups
                  </p>
                </div>
                {(selectedGroupId === null || selectedGroupId === '') && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </label>

              {/* Group Options */}
              {groups.map((group) => (
                <label
                  key={group.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 ${
                    selectedGroupId === group.id.toString()
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    value={group.id.toString()}
                    {...register('deviceGroupId')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Folder className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-900">{group.name}</span>
                    </div>
                    {group.description && (
                      <p className="text-xs text-gray-500 mt-1">{group.description}</p>
                    )}
                    {group.deviceCount !== undefined && (
                      <p className="text-xs text-gray-400 mt-1">
                        {group.deviceCount} device(s) in this group
                      </p>
                    )}
                  </div>
                  {selectedGroupId === group.id.toString() && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </label>
              ))}

              {groups.length === 0 && (
                <div className="text-center py-8">
                  <Folder className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No device groups available</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Create a device group first
                  </p>
                </div>
              )}
            </div>
          )}

          {errors.deviceGroupId && (
            <p className="text-sm text-red-600 mt-1">{errors.deviceGroupId.message}</p>
          )}
        </div>

        {/* Info Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            💡 <strong>Note:</strong> Changing the device group will affect content assignments 
            and configurations associated with this device.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Group'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ChangeDeviceGroupModal
