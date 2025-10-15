'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  Power, 
  Trash2, 
  Settings, 
  Monitor, 
  Wifi, 
  Clock,
  MapPin,
  Activity,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import { useDeviceDetail, useDeviceConfiguration, useDeactivateDevice, useRestartDevice } from '@/hooks/useDeviceDetail'
import { DeviceConfigurationModal } from '@/features/devices/components/DeviceConfigurationModal'
import { ChangeDeviceGroupModal } from '@/features/devices/components/ChangeDeviceGroupModal'

/**
 * Device status indicator component
 */
function DeviceStatusIndicator({ status }: { status: 'Online' | 'Offline' | 'Maintenance' | 'Error' }) {
  const statusConfig = {
    Online: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Online' },
    Offline: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Offline' },
    Maintenance: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Maintenance' },
    Error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Error' }
  }
  
  const config = statusConfig[status]
  const Icon = config.icon
  
  return (
    <div className={cn('flex items-center space-x-2 px-2 py-1 rounded-full', config.bg)}>
      <Icon className={cn('h-4 w-4', config.color)} />
      <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
    </div>
  )
}

/**
 * Simple card component
 */
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-sm', className)}>
      {children}
    </div>
  )
}

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-4 border-b border-gray-200', className)}>
      {children}
    </div>
  )
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  )
}

function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

// Mock data removed - using React Query hooks

/**
 * Device details page with configuration management
 * 
 * Following UI copilot instructions:
 * - Server Components by default with client components for interactivity
 * - Feature-based organization
 * - TypeScript strict typing
 * - Tailwind CSS for styling
 * - React Hook Form + Zod for form validation (in sub-components)
 */
export default function DeviceDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const deviceId = parseInt(params.deviceId as string)

  // React Query hooks for real API data
  const { data: device, isLoading: deviceLoading, error: deviceError } = useDeviceDetail(deviceId)
  const { data: configuration, isLoading: configLoading, error: configError, refetch: refetchConfiguration } = useDeviceConfiguration(deviceId)
  const deactivateDeviceMutation = useDeactivateDevice()
  const restartDeviceMutation = useRestartDevice()

  // Combined loading state (only device loading blocks page, config can be optional)
  const isLoading = deviceLoading
  const error = deviceError as Error | null
  
  // Check if configuration not found (404)
  const isConfigNotFound = configError && (configError as any).response?.status === 404
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showChangeGroupModal, setShowChangeGroupModal] = useState(false)

  // Handlers
  const handleBack = () => {
    router.push('/devices')
  }

  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleRestart = () => {
    restartDeviceMutation.mutate(deviceId, {
      onSuccess: () => {
        console.log(`Device ${device?.name} restarted successfully`)
      },
      onError: (error) => {
        console.error('Failed to restart device:', error)
      }
    })
  }

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    deactivateDeviceMutation.mutate(deviceId, {
      onSuccess: () => {
        router.push('/devices')
      },
      onError: (error) => {
        console.error('Failed to delete device:', error)
        setShowDeleteModal(false)
      }
    })
  }

  const handleConfigurationSuccess = () => {
    // Close modal
    setShowConfigModal(false)
    // Refetch configuration to show updated data (React Query handles this automatically via mutation)
    // But we can also manually trigger if needed:
    refetchConfiguration()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800">Failed to load device</h3>
          <p className="mt-2 text-sm text-red-700">{error.message}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Device not found
  if (!device) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Device not found</h3>
          <p className="text-gray-500 mt-2">The device you're looking for doesn't exist.</p>
          <Button onClick={handleBack} className="mt-4">
            Back to Devices
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center space-x-3">
                <span>{device.name}</span>
                <DeviceStatusIndicator status={device.status} />
              </h1>
              <p className="text-sm text-gray-600 flex items-center space-x-4 mt-1">
                {device.location && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{device.location}</span>
                  </span>
                )}
                {device.displayResolution && (
                  <span className="flex items-center space-x-1">
                    <Monitor className="h-4 w-4" />
                    <span>{device.displayResolution}</span>
                  </span>
                )}
                {device.lastHeartbeat && (
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Last seen: {new Date(device.lastHeartbeat).toLocaleString()}</span>
                  </span>
                )}
              </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleRestart}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Restart</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
        <Button
          variant="outline"
          onClick={handleDelete}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </Button>
      </div>
      </div>

      <div className="space-y-6">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-2xl font-bold text-gray-900">{device.status}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Android Version</p>
                  <p className="text-2xl font-bold text-gray-900">{device.androidVersion || 'N/A'}</p>
                </div>
                <Monitor className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">API Level</p>
                  <p className="text-2xl font-bold text-gray-900">{device.apiLevel || 'N/A'}</p>
                </div>
                <Monitor className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{device.isActive ? 'Yes' : 'No'}</p>
                </div>
                <Power className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device Details Section */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="py-2 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600">
                Overview
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Configuration
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Content
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Activity Logs
              </button>
            </nav>
          </div>

          {/* Overview Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Device Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Model</p>
                    <p className="text-sm text-gray-900">{device.model || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Serial Number</p>
                    <p className="text-sm text-gray-900">{device.serialNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">IP Address</p>
                    <p className="text-sm text-gray-900">{device.ipAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">MAC Address</p>
                    <p className="text-sm text-gray-900">{device.macAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Manufacturer</p>
                    <p className="text-sm text-gray-900">{device.manufacturer || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Device Group</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="info">{device.deviceGroupId ? `Group ${device.deviceGroupId}` : 'None'}</Badge>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setShowChangeGroupModal(true)}
                        className="text-xs"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wifi className="h-5 w-5" />
                  <span>Network Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {configLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading configuration...</span>
                  </div>
                ) : isConfigNotFound ? (
                  <div className="text-center py-4">
                    <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-3">No network configuration found</p>
                    <Button size="sm" variant="outline" onClick={() => setShowConfigModal(true)}>
                      Configure Device
                    </Button>
                  </div>
                ) : configuration ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Network Config</span>
                      <span className="text-sm text-gray-900">
                        {configuration.networkConfig ? JSON.parse(configuration.networkConfig).ssid || 'Configured' : 'Not configured'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Remote Management</span>
                      <Badge variant={configuration.remoteManagementEnabled ? 'success' : 'warning'}>
                        {configuration.remoteManagementEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Proxy</span>
                      <span className="text-sm text-gray-900">{configuration.proxySettings || 'None'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Unable to load configuration</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Configuration Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Android TV Configuration</span>
                </div>
                {configuration && !configLoading && (
                  <Button onClick={() => setShowConfigModal(true)}>
                    Edit Configuration
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {configLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-500">Loading configuration...</span>
                </div>
              ) : isConfigNotFound ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-sm font-medium text-gray-900 mb-1">No configuration available</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Configure display settings, power management, and network options for this device.
                  </p>
                  <Button onClick={() => setShowConfigModal(true)}>
                    Create Configuration
                  </Button>
                </div>
              ) : configuration ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Display Settings</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Orientation:</span>
                        <span className="ml-2 font-medium capitalize">{configuration.displayOrientation}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Resolution:</span>
                        <span className="ml-2 font-medium">{configuration.resolution || 'Auto'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Refresh Rate:</span>
                        <span className="ml-2 font-medium">{configuration.refreshRate} Hz</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Screen Timeout:</span>
                        <span className="ml-2 font-medium">{configuration.screenTimeout}s</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Power & Management</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Power Management:</span>
                        <Badge variant="info" size="sm">
                          {configuration.powerManagement}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600">Remote Management:</span>
                        <Badge variant={configuration.remoteManagementEnabled ? 'success' : 'warning'} size="sm">
                          {configuration.remoteManagementEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(configuration.updatedAt).toLocaleString()} by {configuration.updatedByUserName}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Unable to load configuration</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    An error occurred while loading the device configuration.
                  </p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Logs */}
          {device.recentStatusLogs && device.recentStatusLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Status Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {device.recentStatusLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.status}</p>
                        {log.details && <p className="text-xs text-gray-500">{log.details}</p>}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Device"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{device.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete Device
              </Button>
            </div>
          </div>
        </Modal>

        {/* Change Device Group Modal */}
        <ChangeDeviceGroupModal
          isOpen={showChangeGroupModal}
          onClose={() => setShowChangeGroupModal(false)}
          deviceId={deviceId}
          deviceName={device.name}
          currentGroupId={device.deviceGroupId}
          onSuccess={() => {
            // Refetch device data to show updated group
            window.location.reload()
          }}
        />

        {/* Device Configuration Modal */}
        {showConfigModal && (
          <DeviceConfigurationModal
            isOpen={showConfigModal}
            onClose={() => setShowConfigModal(false)}
            deviceId={deviceId}
            deviceName={device.name}
            {...(configuration && { configuration })}
            onSuccess={handleConfigurationSuccess}
          />
        )}
      </div>
    </div>
  )
}