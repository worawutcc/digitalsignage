/**
 * HeartbeatIndicator Component
 * 
 * Shows real-time heartbeat status with pulse animation and last seen timestamp.
 * 
 * @example
 * ```typescript
 * <HeartbeatIndicator 
 *   lastHeartbeat={device.lastHeartbeat}
 *   timeSince={device.timeSinceLastHeartbeat}
 *   status={device.status}
 * />
 * ```
 */

'use client'

import React from 'react'
import { Activity, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface HeartbeatIndicatorProps {
  /** Last heartbeat timestamp */
  lastHeartbeat: string
  /** Time since last heartbeat in seconds */
  timeSince: number
  /** Device status */
  status: 'Online' | 'Offline' | 'Error' | 'Maintenance'
  /** Show detailed info */
  showDetails?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

/**
 * Get heartbeat indicator color
 */
function getHeartbeatColor(status: string, timeSince: number): string {
  if (status === 'Offline') return 'bg-gray-400'
  if (status === 'Error') return 'bg-red-600'
  if (status === 'Maintenance') return 'bg-yellow-500'
  if (timeSince > 60) return 'bg-orange-500'
  if (timeSince > 30) return 'bg-yellow-500'
  return 'bg-green-500'
}

/**
 * Get pulse animation based on status
 */
function shouldPulse(status: string, timeSince: number): boolean {
  return status === 'Online' && timeSince < 30
}

export const HeartbeatIndicator = React.memo(function HeartbeatIndicator({
  lastHeartbeat,
  timeSince,
  status,
  showDetails = true,
  size = 'md',
  className,
}: HeartbeatIndicatorProps) {
  const color = getHeartbeatColor(status, timeSince)
  const pulse = shouldPulse(status, timeSince)
  
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Pulse Indicator */}
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            'rounded-full',
            sizeClasses[size],
            color,
            pulse && 'animate-pulse'
          )}
        />
        {pulse && (
          <div
            className={cn(
              'absolute rounded-full animate-ping opacity-75',
              sizeClasses[size],
              color
            )}
          />
        )}
      </div>

      {/* Details */}
      {showDetails && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            <span className="font-medium">{status}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTimestamp(timeSince)}</span>
          </div>
        </div>
      )}
    </div>
  )
})

HeartbeatIndicator.displayName = 'HeartbeatIndicator'
