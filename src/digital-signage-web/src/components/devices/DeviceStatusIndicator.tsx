'use client'

import { useEffect, useState } from 'react'
import { DeviceStatusIndicatorProps } from './DeviceStatusIndicator.types'
import {
  Wifi,
  WifiOff,
  Clock,
  Activity,
  AlertCircle,
  Settings,
  Power,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Device status indicator component with real-time updates
 * Shows device status with appropriate styling and animations
 */
export function DeviceStatusIndicator({
  status,
  lastHeartbeat,
  withLabel = true,
  withTimestamp = false,
  animated = true,
  size = 'md',
  className
}: DeviceStatusIndicatorProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  // Trigger animation when status changes
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 300)
    return () => clearTimeout(timer)
  }, [status])

  // Get status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Online':
        return {
          icon: <Wifi className={cn('text-green-600', getIconSize())} />,
          dot: 'bg-green-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          label: 'Online',
          description: 'Device is connected and responsive',
          pulse: true
        }
      case 'Offline':
        return {
          icon: <WifiOff className={cn('text-red-600', getIconSize())} />,
          dot: 'bg-red-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          label: 'Offline',
          description: 'Device is not responding',
          pulse: false
        }
      case 'Pending':
        return {
          icon: <Clock className={cn('text-yellow-600', getIconSize())} />,
          dot: 'bg-yellow-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          label: 'Pending',
          description: 'Waiting for device registration',
          pulse: true
        }
      case 'Registered':
        return {
          icon: <CheckCircle className={cn('text-blue-600', getIconSize())} />,
          dot: 'bg-blue-500',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          label: 'Registered',
          description: 'Device is registered but not connected',
          pulse: false
        }
      case 'Error':
        return {
          icon: <AlertCircle className={cn('text-red-600', getIconSize())} />,
          dot: 'bg-red-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          label: 'Error',
          description: 'Device has encountered an error',
          pulse: true
        }
      case 'Maintenance':
        return {
          icon: <Settings className={cn('text-gray-600', getIconSize())} />,
          dot: 'bg-gray-500',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          label: 'Maintenance',
          description: 'Device is under maintenance',
          pulse: false
        }
      case 'Inactive':
        return {
          icon: <Power className={cn('text-gray-400', getIconSize())} />,
          dot: 'bg-gray-400',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          label: 'Inactive',
          description: 'Device is disabled',
          pulse: false
        }
      default:
        return {
          icon: <Activity className={cn('text-gray-600', getIconSize())} />,
          dot: 'bg-gray-500',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          label: 'Unknown',
          description: 'Status unknown',
          pulse: false
        }
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3'
      case 'md':
        return 'h-4 w-4'
      case 'lg':
        return 'h-5 w-5'
      default:
        return 'h-4 w-4'
    }
  }

  const getDotSize = () => {
    switch (size) {
      case 'sm':
        return 'h-2 w-2'
      case 'md':
        return 'h-3 w-3'
      case 'lg':
        return 'h-4 w-4'
      default:
        return 'h-3 w-3'
    }
  }

  const getContainerSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs'
      case 'md':
        return 'text-sm'
      case 'lg':
        return 'text-base'
      default:
        return 'text-sm'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}d ago`
    }
  }

  const config = getStatusConfig(status)

  return (
    <div className={cn('flex items-center gap-2', getContainerSize(), className)}>
      {/* Status Dot with Icon */}
      <div className="relative flex items-center">
        <div
          className={cn(
            'relative rounded-full flex items-center justify-center transition-all duration-300',
            config.dot,
            getDotSize(),
            animated && config.pulse && 'animate-pulse',
            isAnimating && 'scale-110'
          )}
        />
        
        {/* Icon overlay for larger sizes */}
        {size !== 'sm' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {config.icon}
          </div>
        )}
        
        {/* Pulse ring for online status */}
        {animated && config.pulse && status === 'Online' && (
          <div
            className={cn(
              'absolute inset-0 rounded-full animate-ping',
              config.dot,
              'opacity-25'
            )}
          />
        )}
      </div>

      {/* Status Label */}
      {withLabel && (
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('font-medium', config.textColor)}>
              {config.label}
            </span>
            
            {/* Real-time indicator for online status */}
            {status === 'Online' && animated && (
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-medium">LIVE</span>
              </div>
            )}
          </div>

          {/* Timestamp */}
          {withTimestamp && lastHeartbeat && (
            <div className="text-xs text-gray-500 mt-1">
              Last seen: {formatTimestamp(lastHeartbeat)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Compact version for use in tables or small spaces
 */
export function DeviceStatusDot({
  status,
  animated = true,
  className
}: Pick<DeviceStatusIndicatorProps, 'status' | 'animated' | 'className'>) {
  return (
    <DeviceStatusIndicator
      status={status}
      animated={animated}
      withLabel={false}
      size="sm"
      className={className || ''}
    />
  )
}

/**
 * Badge version with background
 */
export function DeviceStatusBadge({
  status,
  animated = true,
  size = 'md',
  className
}: Pick<DeviceStatusIndicatorProps, 'status' | 'animated' | 'size' | 'className'>) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Online':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        }
      case 'Offline':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200'
        }
      case 'Pending':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200'
        }
      case 'Error':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200'
        }
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200'
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      <DeviceStatusDot status={status} animated={animated} />
      {status}
    </span>
  )
}