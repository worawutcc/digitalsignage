'use client'

import { cn } from '@/lib/utils'
import { Wifi, WifiOff, AlertTriangle, Wrench } from 'lucide-react'
import { DeviceStatusProps, DeviceStatusType, StatusConfig, SizeConfig } from './DeviceStatus.types'

const statusConfig = {
  Pending: {
    label: 'Pending',
    color: 'bg-gray-400',
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    icon: WifiOff,
  },
  Registered: {
    label: 'Registered',
    color: 'bg-blue-400',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Wifi,
  },
  Online: {
    label: 'Online',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: Wifi,
  },
  Offline: {
    label: 'Offline',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: WifiOff,
  },
  Error: {
    label: 'Error',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    icon: AlertTriangle,
  },
  Maintenance: {
    label: 'Maintenance',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: Wrench,
  },
  Inactive: {
    label: 'Inactive',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: WifiOff,
  },
}

const sizeConfig = {
  sm: {
    dot: 'h-2 w-2',
    text: 'text-xs',
    icon: 'h-3 w-3',
    padding: 'px-2 py-1',
  },
  md: {
    dot: 'h-3 w-3',
    text: 'text-sm',
    icon: 'h-4 w-4',
    padding: 'px-3 py-1',
  },
  lg: {
    dot: 'h-4 w-4',
    text: 'text-base',
    icon: 'h-5 w-5',
    padding: 'px-4 py-2',
  },
}

/**
 * Device status indicator component
 * Shows device status with color-coded indicator, optional text and icon
 * 
 * @param status - Device status
 * @param showText - Whether to show status text
 * @param showIcon - Whether to show status icon
 * @param size - Size variant
 * @param className - Additional CSS classes
 */
export function DeviceStatus({
  status,
  showText = false,
  showIcon = false,
  size = 'md',
  className
}: DeviceStatusProps) {
  const config = statusConfig[status as DeviceStatusType]
  const sizes = sizeConfig[size]
  
  // Guard: if config is undefined (unknown status), use fallback UI
  if (!config) {
    console.warn(`Unknown device status: ${status}`)
    return (
      <div className={cn('inline-flex items-center space-x-2', className)} title="Unknown Status">
        <div className={cn('rounded-full bg-gray-500', sizes.dot)} />
        {showText && <span className="text-xs text-gray-600">Unknown</span>}
      </div>
    )
  }
  
  const Icon = config.icon

  if (showText && showIcon) {
    return (
      <div
        className={cn(
          'inline-flex items-center space-x-2 rounded-full',
          config.bgColor,
          config.textColor,
          sizes.padding,
          sizes.text,
          className
        )}
      >
        <Icon className={sizes.icon} />
        <span className="font-medium">{config.label}</span>
      </div>
    )
  }

  if (showText) {
    return (
      <div
        className={cn(
          'inline-flex items-center space-x-2 rounded-full',
          config.bgColor,
          config.textColor,
          sizes.padding,
          sizes.text,
          className
        )}
      >
        <div className={cn('rounded-full', config.color, sizes.dot)} />
        <span className="font-medium">{config.label}</span>
      </div>
    )
  }

  if (showIcon) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          config.bgColor,
          config.textColor,
          sizes.padding,
          className
        )}
      >
        <Icon className={sizes.icon} />
      </div>
    )
  }

  // Just the dot indicator
  return (
    <div
      className={cn(
        'inline-flex items-center space-x-2',
        className
      )}
      title={config.label}
    >
      <div className={cn('rounded-full', config.color, sizes.dot)} />
    </div>
  )
}