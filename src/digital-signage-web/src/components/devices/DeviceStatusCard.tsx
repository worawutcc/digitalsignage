/**
 * DeviceStatusCard Component
 * 
 * Displays comprehensive device status information including health metrics,
 * last heartbeat, alerts, and action buttons for device management.
 * 
 * @example
 * ```typescript
 * <DeviceStatusCard 
 *   device={deviceHealth}
 *   onRestart={handleRestart}
 *   onViewDetails={handleViewDetails}
 * />
 * ```
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Thermometer, 
  Wifi, 
  Clock,
  AlertTriangle,
  RefreshCw,
  Eye,
  Power
} from 'lucide-react'
import type { DeviceHealth, DeviceHealthStatus } from '@/types/deviceHealth.types'
import { cn } from '@/lib/utils'

export interface DeviceStatusCardProps {
  /** Device health data */
  device: DeviceHealth
  /** Show compact version */
  compact?: boolean
  /** Callback when restart button is clicked */
  onRestart?: (deviceId: number) => void
  /** Callback when view details button is clicked */
  onViewDetails?: (deviceId: number) => void
  /** Callback when acknowledge alerts button is clicked */
  onAcknowledgeAlerts?: (deviceId: number) => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Get health status badge variant
 */
function getHealthStatusVariant(status: DeviceHealthStatus): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'healthy':
      return 'success'
    case 'warning':
      return 'warning'
    case 'critical':
      return 'error'
    case 'offline':
      return 'info'
    default:
      return 'default'
  }
}

/**
 * Get device status badge variant
 */
function getDeviceStatusVariant(status: string): 'default' | 'success' | 'error' | 'info' {
  switch (status) {
    case 'Online':
      return 'success'
    case 'Error':
      return 'error'
    case 'Maintenance':
      return 'info'
    default:
      return 'default'
  }
}

/**
 * Format time since last heartbeat
 */
function formatTimeSince(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

/**
 * Get metric status color
 */
function getMetricColor(value: number, warningThreshold: number, criticalThreshold: number): string {
  if (value >= criticalThreshold) return 'text-red-600'
  if (value >= warningThreshold) return 'text-yellow-600'
  return 'text-green-600'
}

export const DeviceStatusCard = React.memo(function DeviceStatusCard({
  device,
  compact = false,
  onRestart,
  onViewDetails,
  onAcknowledgeAlerts,
  className,
}: DeviceStatusCardProps) {
  const criticalAlerts = device.alerts.filter(a => a.severity === 'critical')
  const hasUnacknowledgedAlerts = device.alerts.some(a => !a.acknowledged)

  return (
    <div className={cn('relative border rounded-lg shadow-sm bg-white', className)}>
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {device.deviceName}
            </h3>
            {device.location && (
              <p className="text-sm text-muted-foreground">
                {device.location}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant={getDeviceStatusVariant(device.status)}>
              {device.status}
            </Badge>
            <Badge variant={getHealthStatusVariant(device.healthStatus)}>
              {device.healthStatus}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Health Metrics */}
        {!compact && (
          <div className="grid grid-cols-2 gap-3">
            {/* CPU Usage */}
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">CPU</span>
                  <span className={cn('font-medium', getMetricColor(device.currentMetrics.cpuUsage, 75, 90))}>
                    {device.currentMetrics.cpuUsage}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full transition-all',
                      device.currentMetrics.cpuUsage >= 90 ? 'bg-red-600' :
                      device.currentMetrics.cpuUsage >= 75 ? 'bg-yellow-500' : 'bg-green-600'
                    )}
                    style={{ width: `${device.currentMetrics.cpuUsage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Memory</span>
                  <span className={cn('font-medium', getMetricColor(device.currentMetrics.memoryUsage, 80, 95))}>
                    {device.currentMetrics.memoryUsage}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full transition-all',
                      device.currentMetrics.memoryUsage >= 95 ? 'bg-red-600' :
                      device.currentMetrics.memoryUsage >= 80 ? 'bg-yellow-500' : 'bg-green-600'
                    )}
                    style={{ width: `${device.currentMetrics.memoryUsage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Storage Usage */}
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Storage</span>
                  <span className={cn('font-medium', getMetricColor(device.currentMetrics.storageUsage, 85, 95))}>
                    {device.currentMetrics.storageUsage}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full transition-all',
                      device.currentMetrics.storageUsage >= 95 ? 'bg-red-600' :
                      device.currentMetrics.storageUsage >= 85 ? 'bg-yellow-500' : 'bg-green-600'
                    )}
                    style={{ width: `${device.currentMetrics.storageUsage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Temperature */}
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Temp</span>
                  <span className={cn('font-medium', getMetricColor(device.currentMetrics.temperature, 70, 85))}>
                    {device.currentMetrics.temperature}°C
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compact Metrics */}
        {compact && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              <span className={getMetricColor(device.currentMetrics.cpuUsage, 75, 90)}>
                {device.currentMetrics.cpuUsage}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span className={getMetricColor(device.currentMetrics.memoryUsage, 80, 95)}>
                {device.currentMetrics.memoryUsage}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              <span className={getMetricColor(device.currentMetrics.temperature, 70, 85)}>
                {device.currentMetrics.temperature}°C
              </span>
            </div>
          </div>
        )}

        {/* Last Heartbeat & Network */}
        <div className="flex items-center justify-between text-sm border-t pt-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTimeSince(device.timeSinceLastHeartbeat)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wifi className="h-4 w-4" />
            <span>{device.currentMetrics.networkLatency}ms</span>
          </div>
        </div>

        {/* Alerts */}
        {device.alerts.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium">
                {device.alerts.length} Alert{device.alerts.length > 1 ? 's' : ''}
              </span>
              {criticalAlerts.length > 0 && (
                <Badge variant="error" className="text-xs">
                  {criticalAlerts.length} Critical
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 border-t pt-3">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(device.deviceId)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Details
            </Button>
          )}
          {onRestart && device.status === 'Online' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestart(device.deviceId)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {onAcknowledgeAlerts && hasUnacknowledgedAlerts && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAcknowledgeAlerts(device.deviceId)}
            >
              <Power className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Critical Alert Indicator */}
      {criticalAlerts.length > 0 && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full animate-pulse m-2" />
      )}
    </div>
  )
})

DeviceStatusCard.displayName = 'DeviceStatusCard'
