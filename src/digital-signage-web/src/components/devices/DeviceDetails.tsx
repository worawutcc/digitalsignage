'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { DeviceDetailsProps, DeviceDetailsTab } from './DeviceDetails.types'
import {
  Monitor,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  Edit,
  Trash2,
  RotateCcw,
  Settings,
  Activity,
  Network,
  Shield,
  Smartphone,
  Info,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Device details component with configuration tabs
 * Provides comprehensive device information and management capabilities
 */
export function DeviceDetails({
  device,
  configuration,
  statusLogs = [],
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onRestart,
  onConfigurationUpdate,
  onStatusChange,
  className
}: DeviceDetailsProps) {
  const [activeTab, setActiveTab] = useState<DeviceDetailsTab>('overview')

  // Get status styling
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <Wifi className="h-4 w-4" />,
          dot: 'bg-green-500'
        }
      case 'offline':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <WifiOff className="h-4 w-4" />,
          dot: 'bg-red-500'
        }
      case 'pending':
        return {
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: <Clock className="h-4 w-4" />,
          dot: 'bg-yellow-500'
        }
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <Monitor className="h-4 w-4" />,
          dot: 'bg-gray-500'
        }
    }
  }

  const statusConfig = getStatusConfig(device.status)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Info className="h-4 w-4" /> },
    { id: 'configuration', label: 'Configuration', icon: <Settings className="h-4 w-4" /> },
    { id: 'status', label: 'Status & Health', icon: <Activity className="h-4 w-4" /> },
    { id: 'logs', label: 'Activity Logs', icon: <Clock className="h-4 w-4" /> },
    { id: 'network', label: 'Network', icon: <Network className="h-4 w-4" /> }
  ]

  if (loading) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading device details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <p className="text-red-600">Error loading device details: {error}</p>
      </div>
    )
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Device Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Monitor className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{device.name}</h1>
            <p className="text-gray-500 font-mono">{device.deviceKey}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('w-3 h-3 rounded-full', statusConfig.dot)} />
          <span className={cn(
            'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border',
            statusConfig.color
          )}>
            {statusConfig.icon}
            {device.status}
          </span>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Location & Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{device.location || 'No location set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{device.resolution}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                {device.lastHeartbeat
                  ? `Last seen ${new Date(device.lastHeartbeat).toLocaleString()}`
                  : 'Never seen'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Hardware Information</h3>
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium">Manufacturer:</span> {device.manufacturer || 'Unknown'}
            </div>
            <div className="text-sm">
              <span className="font-medium">Model:</span> {device.model || 'Unknown'}
            </div>
            <div className="text-sm">
              <span className="font-medium">Serial:</span> {device.serialNumber || 'Unknown'}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Android System</h3>
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium">Version:</span> {device.androidVersion || 'Unknown'}
            </div>
            <div className="text-sm">
              <span className="font-medium">API Level:</span> {device.apiLevel || 'Unknown'}
            </div>
            <div className="text-sm">
              <span className="font-medium">Active:</span> {device.isActive ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        {onEdit && (
          <Button onClick={() => onEdit(device)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Device
          </Button>
        )}
        {onRestart && (
          <Button variant="outline" onClick={() => onRestart(device)} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Restart
          </Button>
        )}
        {onDelete && (
          <Button variant="destructive" onClick={() => onDelete(device)} className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  )

  const renderConfigurationTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Device Configuration</h2>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Edit Configuration
        </Button>
      </div>

      {configuration ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Display Settings</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Orientation:</span> {configuration.displayOrientation}
              </div>
              <div className="text-sm">
                <span className="font-medium">Screen Timeout:</span> {configuration.screenTimeout}s
              </div>
              <div className="text-sm">
                <span className="font-medium">Auto Rotate:</span> {configuration.autoRotate ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Power Management</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Mode:</span> {configuration.powerManagement}
              </div>
              <div className="text-sm">
                <span className="font-medium">Status:</span> {configuration.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No configuration data available</p>
        </div>
      )}
    </div>
  )

  const renderStatusTab = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Status & Health</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn('w-3 h-3 rounded-full', statusConfig.dot)} />
            <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
          </div>
          <p className="text-2xl font-bold">{device.status}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Network</h3>
          <p className="text-lg font-medium">{device.ipAddress || 'Unknown'}</p>
          <p className="text-sm text-gray-500">{device.macAddress || 'MAC not available'}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Last Activity</h3>
          <p className="text-lg font-medium">
            {device.lastHeartbeat 
              ? new Date(device.lastHeartbeat).toLocaleString()
              : 'Never'
            }
          </p>
        </div>
      </div>
    </div>
  )

  const renderLogsTab = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Activity Logs</h2>
      
      {statusLogs.length > 0 ? (
        <div className="bg-white rounded-lg border">
          <div className="divide-y">
            {statusLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">
                        Status changed to {log.status}
                      </p>
                      {log.message && (
                        <p className="text-sm text-gray-500">{log.message}</p>
                      )}
                    </div>
                  </div>
                  <time className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </time>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No activity logs available</p>
        </div>
      )}
    </div>
  )

  const renderNetworkTab = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Network Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Network Details</h3>
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium">IP Address:</span> {device.ipAddress || 'Unknown'}
            </div>
            <div className="text-sm">
              <span className="font-medium">MAC Address:</span> {device.macAddress || 'Unknown'}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Connection Status</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {device.status === 'Online' ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">{device.status === 'Online' ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab()
      case 'configuration':
        return renderConfigurationTab()
      case 'status':
        return renderStatusTab()
      case 'logs':
        return renderLogsTab()
      case 'network':
        return renderNetworkTab()
      default:
        return renderOverviewTab()
    }
  }

  return (
    <div className={cn('w-full max-w-6xl mx-auto', className)}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DeviceDetailsTab)}
              className={cn(
                'flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  )
}