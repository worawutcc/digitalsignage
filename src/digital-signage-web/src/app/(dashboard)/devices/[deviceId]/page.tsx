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

/**
 * Device status indicator component
 */
function DeviceStatusIndicator({ status }: { status: 'online' | 'offline' | 'maintenance' | 'error' }) {
  const statusConfig = {
    online: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Online' },
    offline: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Offline' },
    maintenance: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Maintenance' },
    error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Error' }
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

// Mock device data - TODO: Replace with React Query hook
const mockDevice = {
  id: '1',
  name: 'Lobby Display 1',
  location: 'Main Lobby',
  status: 'online' as const,
  resolution: '1920x1080',
  lastSeen: new Date().toISOString(),
  version: '2.1.0',
  ipAddress: '192.168.1.100',
  macAddress: '00:1B:44:11:3A:B7',
  deviceGroup: 'Lobby Displays',
  uptime: 48,
  currentContent: 'Welcome Presentation',
  // Additional details
  model: 'Android TV Box Pro',
  serialNumber: 'ATV-LP-001',
  installedDate: '2024-01-15',
  lastUpdate: '2024-09-15',
  memoryUsage: 65,
  storageUsage: 42,
  temperature: 45,
  powerConsumption: 85,
}

interface DeviceConfiguration {
  displaySettings: {
    brightness: number
    contrast: number
    orientation: 'landscape' | 'portrait'
    sleepMode: boolean
    sleepTime: string
  }
  networkSettings: {
    wifi: {
      ssid: string
      signalStrength: number
    }
    ethernet: {
      enabled: boolean
      speed: string
    }
  }
  contentSettings: {
    autoUpdate: boolean
    cacheSize: number
    downloadQuality: 'high' | 'medium' | 'low'
  }
}

const mockConfiguration: DeviceConfiguration = {
  displaySettings: {
    brightness: 80,
    contrast: 75,
    orientation: 'landscape',
    sleepMode: true,
    sleepTime: '22:00'
  },
  networkSettings: {
    wifi: {
      ssid: 'DigitalSignage_5G',
      signalStrength: 85
    },
    ethernet: {
      enabled: false,
      speed: '1Gbps'
    }
  },
  contentSettings: {
    autoUpdate: true,
    cacheSize: 2048,
    downloadQuality: 'high'
  }
}

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
  const deviceId = params.deviceId as string

  // State management
  const [device] = useState(mockDevice) // TODO: Replace with React Query
  const [configuration] = useState(mockConfiguration) // TODO: Replace with React Query
  const [isLoading] = useState(false)
  const [error] = useState<Error | null>(null)
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)

  // Handlers
  const handleBack = () => {
    router.push('/devices')
  }

  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleRestart = () => {
    // TODO: Implement with device service and React Query mutation
    console.log(`Restarting device ${device.name}`)
  }

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    // TODO: Implement with device service and React Query mutation
    console.log(`Deleting device ${device.name}`)
    router.push('/devices')
  }

  const handleConfigurationSave = (newConfig: DeviceConfiguration) => {
    // TODO: Implement with device service and React Query mutation
    console.log('Saving configuration:', newConfig)
    setShowConfigModal(false)
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
                <span className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{device.location}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Monitor className="h-4 w-4" />
                  <span>{device.resolution}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Last seen: {new Date(device.lastSeen).toLocaleString()}</span>
                </span>
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
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{device.uptime}h</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Memory</p>
                  <p className="text-2xl font-bold text-gray-900">{mockDevice.memoryUsage}%</p>
                </div>
                <Monitor className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Storage</p>
                  <p className="text-2xl font-bold text-gray-900">{mockDevice.storageUsage}%</p>
                </div>
                <Monitor className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Temperature</p>
                  <p className="text-2xl font-bold text-gray-900">{mockDevice.temperature}°C</p>
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
                    <p className="text-sm text-gray-900">{mockDevice.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Serial Number</p>
                    <p className="text-sm text-gray-900">{mockDevice.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">IP Address</p>
                    <p className="text-sm text-gray-900">{device.ipAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">MAC Address</p>
                    <p className="text-sm text-gray-900">{mockDevice.macAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Firmware Version</p>
                    <p className="text-sm text-gray-900">{device.version}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Device Group</p>
                    <Badge variant="info">{device.deviceGroup}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wifi className="h-5 w-5" />
                  <span>Network Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">WiFi Network</span>
                    <Badge variant="info">{configuration.networkSettings.wifi.ssid}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Signal Strength</span>
                    <span className="text-sm text-gray-900">{configuration.networkSettings.wifi.signalStrength}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Ethernet</span>
                    <Badge variant={configuration.networkSettings.ethernet.enabled ? 'success' : 'warning'}>
                      {configuration.networkSettings.ethernet.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
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
                <Button onClick={() => setShowConfigModal(true)}>
                  Edit Configuration
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Display Settings</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Brightness:</span>
                      <span className="ml-2 font-medium">{configuration.displaySettings.brightness}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Contrast:</span>
                      <span className="ml-2 font-medium">{configuration.displaySettings.contrast}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Orientation:</span>
                      <span className="ml-2 font-medium capitalize">{configuration.displaySettings.orientation}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Sleep Mode:</span>
                      <Badge variant={configuration.displaySettings.sleepMode ? 'success' : 'warning'} size="sm">
                        {configuration.displaySettings.sleepMode ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Content Settings</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Auto Update:</span>
                      <Badge variant={configuration.contentSettings.autoUpdate ? 'success' : 'warning'} size="sm">
                        {configuration.contentSettings.autoUpdate ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Cache Size:</span>
                      <span className="ml-2 font-medium">{configuration.contentSettings.cacheSize} MB</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Download Quality:</span>
                      <span className="ml-2 font-medium capitalize">{configuration.contentSettings.downloadQuality}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Content */}
          <Card>
            <CardHeader>
              <CardTitle>Current Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Presentation</p>
                  <p className="text-lg font-semibold text-gray-900">{device.currentContent || 'No content assigned'}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Content management interface will be implemented in a future update.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Modal */}
        <Modal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          title="Edit Device Configuration"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Configuration editing interface will be implemented when the AndroidTVConfigurationForm component is available.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfigModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowConfigModal(false)}
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </Modal>

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
      </div>
    </div>
  )
}