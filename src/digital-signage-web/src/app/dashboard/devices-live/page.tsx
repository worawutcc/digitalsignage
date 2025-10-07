/**
 * Device Live Status Dashboard
 * 
 * Real-time device monitoring dashboard showing health metrics, heartbeat status,
 * and alerts for all devices with SignalR integration and auto-refresh.
 * 
 * @see copilot-instructions-ui.instructions.md - Next.js App Router patterns
 * @see specs/029-ui-device-groups/ - Device monitoring requirements
 */

'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Search, Filter, RefreshCw, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DeviceStatusCard } from '@/components/devices/DeviceStatusCard'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useAllDevicesHealth, useHealthStatistics, useDeviceHealthCache } from '@/hooks/useDeviceHealth'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'
import type { DeviceHealthFilters, DeviceHealthStatus, HealthAlert } from '@/types/deviceHealth.types'

export default function DevicesLivePage() {
  const { toast } = useToast()
  const healthCache = useDeviceHealthCache()

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<DeviceHealthFilters>({
    hasAlerts: false,
    sortBy: 'healthStatus',
    sortOrder: 'desc',
  })

  // Debounced search for performance
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Fetch devices health data
  const { data: devices, isLoading, error, refetch } = useAllDevicesHealth({
    ...filters,
    searchQuery: debouncedSearch,
  })

  // Fetch statistics
  const { data: stats } = useHealthStatistics()

  // SignalR real-time updates
  const { connectionState } = useRealTimeUpdates({
    autoConnect: true,
    subscriptions: {
      devices: true,
    },
    notifications: {
      showToasts: true,
      critical: true,
    },
  })

  // Handle real-time health updates
  useEffect(() => {
    if (connectionState.isConnected) {
      // Subscribe to health updates via SignalR
      // Updates are automatically handled by useRealTimeUpdates hook
      console.log('Connected to SignalR for real-time device health updates')
    }
  }, [connectionState.isConnected])

  // Handle filter changes
  const handleStatusFilter = (status: DeviceHealthStatus) => {
    setFilters(prev => ({
      ...prev,
      healthStatus: prev.healthStatus?.includes(status)
        ? prev.healthStatus.filter(s => s !== status)
        : [...(prev.healthStatus || []), status],
    }))
  }

  const handleDeviceStatusFilter = (status: 'Online' | 'Offline' | 'Error' | 'Maintenance') => {
    setFilters(prev => ({
      ...prev,
      deviceStatus: prev.deviceStatus?.includes(status)
        ? prev.deviceStatus.filter(s => s !== status)
        : [...(prev.deviceStatus || []), status],
    }))
  }

  const handleAlertsFilter = () => {
    setFilters(prev => ({
      ...prev,
      hasAlerts: !prev.hasAlerts,
    }))
  }

  const handleClearFilters = () => {
    setFilters({
      hasAlerts: false,
      sortBy: 'healthStatus',
      sortOrder: 'desc',
    })
    setSearchQuery('')
  }

  // Device actions
  const handleRestart = async (deviceId: number) => {
    try {
      // TODO: Implement device restart API call
      toast({
        title: 'Device Restarting',
        description: 'Restart command sent to device',
        variant: 'default',
      })
    } catch (error) {
      toast({
        title: 'Restart Failed',
        description: 'Failed to restart device',
        variant: 'destructive',
      })
    }
  }

  const handleViewDetails = (deviceId: number) => {
    // Navigate to device details page
    window.location.href = `/devices/${deviceId}`
  }

  const handleAcknowledgeAlerts = async (deviceId: number) => {
    try {
      // TODO: Implement acknowledge alerts API call
      toast({
        title: 'Alerts Acknowledged',
        description: 'Device alerts have been acknowledged',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Failed',
        description: 'Failed to acknowledge alerts',
        variant: 'destructive',
      })
    }
  }

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    if (!devices) return null
    return {
      healthy: devices.filter(d => d.healthStatus === 'healthy').length,
      warning: devices.filter(d => d.healthStatus === 'warning').length,
      critical: devices.filter(d => d.healthStatus === 'critical').length,
      offline: devices.filter(d => d.healthStatus === 'offline').length,
      withAlerts: devices.filter(d => d.alerts.length > 0).length,
    }
  }, [devices])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Devices</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Device Live Status</h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring of all devices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={connectionState.isConnected ? 'success' : 'error'}>
            {connectionState.isConnected ? 'Live' : 'Disconnected'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Devices</div>
            <div className="text-2xl font-bold">{stats.totalDevices}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Healthy</div>
            <div className="text-2xl font-bold text-green-600">{stats.healthyDevices}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Warning</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.warningDevices}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Critical</div>
            <div className="text-2xl font-bold text-red-600">{stats.criticalDevices}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Offline</div>
            <div className="text-2xl font-bold text-gray-600">{stats.offlineDevices}</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search devices by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={!searchQuery && !filters.healthStatus && !filters.deviceStatus && !filters.hasAlerts}
          >
            Clear Filters
          </Button>
        </div>

        {/* Health Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">Health Status:</span>
          <Button
            variant={filters.healthStatus?.includes('healthy') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilter('healthy')}
          >
            Healthy {filterCounts && `(${filterCounts.healthy})`}
          </Button>
          <Button
            variant={filters.healthStatus?.includes('warning') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilter('warning')}
          >
            Warning {filterCounts && `(${filterCounts.warning})`}
          </Button>
          <Button
            variant={filters.healthStatus?.includes('critical') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilter('critical')}
          >
            Critical {filterCounts && `(${filterCounts.critical})`}
          </Button>
          <Button
            variant={filters.healthStatus?.includes('offline') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilter('offline')}
          >
            Offline {filterCounts && `(${filterCounts.offline})`}
          </Button>
        </div>

        {/* Device Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">Device Status:</span>
          <Button
            variant={filters.deviceStatus?.includes('Online') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleDeviceStatusFilter('Online')}
          >
            Online
          </Button>
          <Button
            variant={filters.deviceStatus?.includes('Offline') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleDeviceStatusFilter('Offline')}
          >
            Offline
          </Button>
          <Button
            variant={filters.deviceStatus?.includes('Error') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleDeviceStatusFilter('Error')}
          >
            Error
          </Button>
          <Button
            variant={filters.deviceStatus?.includes('Maintenance') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleDeviceStatusFilter('Maintenance')}
          >
            Maintenance
          </Button>
          <Button
            variant={filters.hasAlerts ? 'default' : 'outline'}
            size="sm"
            onClick={handleAlertsFilter}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Has Alerts {filterCounts && `(${filterCounts.withAlerts})`}
          </Button>
        </div>
      </div>

      {/* Device Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[300px]">
              <LoadingSkeleton />
            </div>
          ))}
        </div>
      ) : devices && devices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <DeviceStatusCard
              key={device.deviceId}
              device={device}
              onRestart={handleRestart}
              onViewDetails={handleViewDetails}
              onAcknowledgeAlerts={handleAcknowledgeAlerts}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No devices found matching your filters</p>
        </div>
      )}
    </div>
  )
}
