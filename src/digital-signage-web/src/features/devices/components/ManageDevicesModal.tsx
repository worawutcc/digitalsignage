/**
 * Manage Devices Modal Component
 * 
 * Modal for managing devices within a device group
 * - View current devices in group
 * - Add devices to group
 * - Remove devices from group
 * 
 * Following copilot-instructions-ui.instructions.md patterns
 * @see copilot-instructions-ui.instructions.md - Form Handling Rules, State Management
 */

'use client'

import React, { useState, useMemo } from 'react'
import { Users, Loader2, Trash2, Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { deviceApi } from '@/services/deviceApi'
import { toast } from 'react-hot-toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface Device {
  id: number
  name: string
  deviceKey?: string
  status?: string
  location?: string
  deviceGroupId?: number | null
}

interface ManageDevicesModalProps {
  isOpen: boolean
  onClose: () => void
  groupId: number
  groupName: string
  onSuccess?: () => void
}

/**
 * Manage Devices Modal Component
 */
export function ManageDevicesModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  onSuccess,
}: ManageDevicesModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDevicesToAdd, setSelectedDevicesToAdd] = useState<number[]>([])
  const queryClient = useQueryClient()

  // Fetch all devices
  const { data: allDevicesResponse, isLoading: devicesLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await deviceApi.getDevices()
      console.log('📱 All devices response:', response)
      return response
    },
  })

  // Extract devices array from response
  const allDevices = useMemo(() => {
    if (!allDevicesResponse) return []
    // Handle different response structures
    if (Array.isArray(allDevicesResponse)) return allDevicesResponse
    if (allDevicesResponse.data && Array.isArray(allDevicesResponse.data)) return allDevicesResponse.data
    return []
  }, [allDevicesResponse])

  // Filter devices by group
  const devicesInGroup = useMemo(() => {
    return allDevices.filter((device: Device) => device.deviceGroupId === groupId)
  }, [allDevices, groupId])

  const devicesNotInGroup = useMemo(() => {
    return allDevices.filter((device: Device) => device.deviceGroupId !== groupId)
  }, [allDevices, groupId])

  // Search filter for available devices
  const filteredAvailableDevices = useMemo(() => {
    if (!searchTerm) return devicesNotInGroup
    return devicesNotInGroup.filter((device: Device) =>
      device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [devicesNotInGroup, searchTerm])

  /**
   * Toggle device selection
   */
  const toggleDeviceSelection = (deviceId: number) => {
    setSelectedDevicesToAdd(prev =>
      prev.includes(deviceId)
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    )
  }

  /**
   * Add selected devices to group
   */
  const handleAddDevices = async () => {
    if (selectedDevicesToAdd.length === 0) {
      toast.error('Please select at least one device')
      return
    }

    setIsUpdating(true)
    try {
      let successCount = 0
      let failCount = 0

      // Update each device individually
      for (const deviceId of selectedDevicesToAdd) {
        try {
          await deviceApi.updateDeviceGroup(deviceId, groupId)
          successCount++
        } catch (error) {
          console.error(`Failed to add device ${deviceId}:`, error)
          failCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Added ${successCount} device(s) to ${groupName}`)
        // Refresh devices list
        await queryClient.invalidateQueries({ queryKey: ['devices'] })
        await queryClient.invalidateQueries({ queryKey: ['device-groups'] })
        setSelectedDevicesToAdd([])
        onSuccess?.()
      }

      if (failCount > 0) {
        toast.error(`Failed to add ${failCount} device(s)`)
      }
    } catch (error) {
      console.error('Failed to add devices:', error)
      toast.error('Failed to add devices to group')
    } finally {
      setIsUpdating(false)
    }
  }

  /**
   * Remove device from group
   */
  const handleRemoveDevice = async (deviceId: number, deviceName: string) => {
    if (!confirm(`Remove "${deviceName}" from "${groupName}"?`)) {
      return
    }

    setIsUpdating(true)
    try {
      // Set deviceGroupId to null to remove from group
      await deviceApi.updateDeviceGroup(deviceId, null)
      
      toast.success(`Removed "${deviceName}" from group`)
      
      // Refresh devices list
      await queryClient.invalidateQueries({ queryKey: ['devices'] })
      await queryClient.invalidateQueries({ queryKey: ['device-groups'] })
      onSuccess?.()
    } catch (error) {
      console.error('Failed to remove device:', error)
      toast.error('Failed to remove device from group')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Devices - ${groupName}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Group Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                {groupName}
              </p>
              <p className="text-xs text-blue-700">
                {devicesInGroup.length} device(s) in this group
              </p>
            </div>
          </div>
        </div>

        {devicesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">Loading devices...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Current Devices in Group */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Current Devices ({devicesInGroup.length})
              </h3>
              <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                {devicesInGroup.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No devices in this group</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {devicesInGroup.map((device: Device) => (
                      <div
                        key={device.id}
                        className="p-3 hover:bg-gray-50 flex items-center justify-between group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {device.name}
                          </p>
                          {device.location && (
                            <p className="text-xs text-gray-500 truncate">
                              {device.location}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveDevice(device.id, device.name)}
                          disabled={isUpdating}
                          className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          title="Remove from group"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Available Devices to Add */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Add Devices ({selectedDevicesToAdd.length} selected)
              </h3>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
                {filteredAvailableDevices.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      {searchTerm ? 'No devices found' : 'All devices are in groups'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredAvailableDevices.map((device: Device) => (
                      <label
                        key={device.id}
                        className="p-3 hover:bg-gray-50 flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDevicesToAdd.includes(device.id)}
                          onChange={() => toggleDeviceSelection(device.id)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {device.name}
                          </p>
                          {device.location && (
                            <p className="text-xs text-gray-500 truncate">
                              {device.location}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Button */}
              {selectedDevicesToAdd.length > 0 && (
                <Button
                  onClick={handleAddDevices}
                  disabled={isUpdating}
                  className="w-full"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add {selectedDevicesToAdd.length} Device(s)
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUpdating}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ManageDevicesModal
