'use client'

import { useState } from 'react'
import { XCircle, MapPin, Clock, AlertCircle, Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRejectedDevices, useReconsiderDevice } from '@/features/devices/hooks/useDevices'
import type { RejectedDevice } from '../types'

/**
 * Rejected Devices Page
 * Displays all rejected device registration requests with rejection reasons
 * 
 * @see copilot-instructions-ui.md - React Query for server state management
 * @see copilot-instructions-ui.md - Service Layer API Calls
 * 
 * Note: Uses local RejectedDevice type until API Device type includes rejection fields
 */
export default function RejectedDevicesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Use custom hooks from service layer
  // TODO: API Device type needs rejectionReason, rejectedAt, rejectedBy fields
  const { data: apiDevices = [], isLoading, error } = useRejectedDevices({
    refetchInterval: 60000, // Refresh every 60 seconds
  })

  // Map API Device to RejectedDevice for UI (temporary until API types updated)
  const devices: RejectedDevice[] = apiDevices.map(device => ({
    id: device.id,
    deviceId: device.deviceKey,
    deviceName: device.name,
    location: device.location || 'N/A',
    rejectedAt: device.createdAt, // Temporary: use createdAt as rejectedAt
    rejectedBy: 'System', // Temporary: hardcoded
    rejectionReason: 'Registration rejected', // Temporary: hardcoded
    requestedAt: device.createdAt,
    deviceModel: device.model || 'Unknown',
    resolution: device.resolution || 'N/A',
  }))

  const reconsiderMutation = useReconsiderDevice()

  // Filter devices based on search
  const filteredDevices = devices.filter(device =>
    device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.rejectionReason.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleReconsider = async (deviceId: number) => {
    if (confirm('Move this device back to pending registrations?')) {
      await reconsiderMutation.mutateAsync(deviceId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Rejected Devices</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredDevices.length} rejected device{filteredDevices.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search rejected devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading rejected devices...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to load rejected devices: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredDevices.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Rejected Devices</h3>
          <p className="text-gray-600">
            {searchTerm ? 'No devices match your search criteria.' : 'No devices have been rejected yet.'}
          </p>
        </div>
      )}

      {/* Rejected Devices List */}
      {!isLoading && !error && filteredDevices.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rejection Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rejected
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-red-100 rounded-lg">
                          <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{device.deviceName}</div>
                          <div className="text-sm text-gray-500">{device.deviceId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {device.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start text-sm text-gray-900">
                        <AlertCircle className="h-4 w-4 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{device.rejectionReason}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(device.rejectedAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">by {device.rejectedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReconsider(device.id)}
                        disabled={reconsiderMutation.isPending}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reconsider
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
