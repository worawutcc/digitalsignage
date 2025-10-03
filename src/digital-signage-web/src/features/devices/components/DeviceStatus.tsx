'use client'

import { cn } from '@/lib/utils'
import { Wifi, WifiOff, AlertTriangle, Wrench } from 'lucide-react'

export interface DeviceStatusProps {
  status: 'Online' | 'Offline' | 'Error' | 'Maintenance'
  showText?: boolean
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const statusConfig = {
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
  const config = statusConfig[status]
  const sizes = sizeConfig[size]
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