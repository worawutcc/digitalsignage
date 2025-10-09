'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Monitor, MapPin, Clock, Activity, Info, MoreVertical, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useApprovedDevices } from '@/features/devices/hooks/useDevices'

/**
 * Approved Devices Page
 * Displays all approved Android TV devices with status monitoring
 * 
 * @see copilot-instructions-ui.md - React Query for server state management
 * @see copilot-instructions-ui.md - Service Layer API Calls
 */
export default function ApprovedDevicesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  // Use custom hook from service layer
  const { data: devices = [], isLoading, error } = useApprovedDevices({
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Filter devices based on search
  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetails = (deviceId: number) => {
    router.push(`/devices/${deviceId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Approved Devices</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredDevices.length} approved device{filteredDevices.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search devices..."
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading approved devices...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to load approved devices: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredDevices.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Devices</h3>
          <p className="text-gray-600">
            {searchTerm ? 'No devices match your search criteria.' : 'No devices have been approved yet.'}
          </p>
        </div>
      )}

      {/* Devices Grid */}
      {!isLoading && !error && filteredDevices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <div
              key={device.id}
              className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Device Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${device.status === 'Online' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Monitor className={`h-6 w-6 ${device.status === 'Online' ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{device.name}</h3>
                      <p className="text-sm text-gray-500">{device.deviceKey}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    device.status === 'Online'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {device.status}
                  </span>
                </div>

                {/* Device Details */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{device.location || 'N/A'}</span>
                  </div>
                  {device.lastHeartbeat && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Activity className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Last heartbeat: {new Date(device.lastHeartbeat).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Registered: {new Date(device.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{device.model || 'Unknown'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewDetails(device.id)}
                    className="w-full"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
