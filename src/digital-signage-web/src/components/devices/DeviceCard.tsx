'use client'

import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { DeviceCardProps } from './DeviceCard.types'
import {
  Monitor,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  Edit,
  Trash2,
  MoreVertical,
  Power,
  Settings,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Device card component for displaying device information in a card layout
 * Optimized for grid views and mobile responsiveness
 */
export function DeviceCard({
  device,
  onEdit,
  onDelete,
  onClick,
  onStatusChange,
  selected = false,
  onSelect,
  showActions = true,
  compact = false,
  className
}: DeviceCardProps) {
  // Get status styling
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <Wifi className="h-3 w-3" />,
          dot: 'bg-green-500'
        }
      case 'offline':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <WifiOff className="h-3 w-3" />,
          dot: 'bg-red-500'
        }
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="h-3 w-3" />,
          dot: 'bg-yellow-500'
        }
      case 'registered':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Activity className="h-3 w-3" />,
          dot: 'bg-blue-500'
        }
      case 'error':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <WifiOff className="h-3 w-3" />,
          dot: 'bg-red-500'
        }
      case 'maintenance':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Settings className="h-3 w-3" />,
          dot: 'bg-gray-500'
        }
      case 'inactive':
        return {
          color: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: <Power className="h-3 w-3" />,
          dot: 'bg-gray-400'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Monitor className="h-3 w-3" />,
          dot: 'bg-gray-500'
        }
    }
  }

  const statusConfig = getStatusConfig(device.status)

  const handleCardClick = () => {
    if (onClick) {
      onClick(device)
    }
  }

  const handleSelectChange = (checked: boolean) => {
    if (onSelect) {
      onSelect(device, checked)
    }
  }

  return (
    <div
      className={cn(
        'group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200',
        selected && 'ring-2 ring-blue-500 border-blue-300',
        onClick && 'cursor-pointer hover:border-gray-300',
        compact ? 'p-4' : 'p-6',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected}
            onChange={handleSelectChange}
          />
        </div>
      )}

      {/* Actions Menu */}
      {showActions && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(device)
                }}
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(device)
                }}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Device Info */}
      <div className={cn('space-y-3', onSelect && 'ml-8')}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Monitor className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <h3 className={cn(
                'font-semibold text-gray-900 truncate',
                compact ? 'text-sm' : 'text-base'
              )}>
                {device.name}
              </h3>
            </div>
            <p className="text-xs text-gray-500 font-mono truncate">
              {device.deviceKey}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', statusConfig.dot)} />
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
              statusConfig.color
            )}>
              {statusConfig.icon}
              {device.status}
            </span>
          </div>
        </div>

        {/* Device Details */}
        <div className="space-y-2">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="truncate">{device.location || 'No location'}</span>
          </div>

          {/* Resolution */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Monitor className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span>{device.resolution}</span>
          </div>

          {/* Last Heartbeat */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {device.lastHeartbeat
                ? `Last seen ${new Date(device.lastHeartbeat).toLocaleString()}`
                : 'Never seen'
              }
            </span>
          </div>

          {/* Android TV Specific Info */}
          {!compact && (device.manufacturer || device.model) && (
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 space-y-1">
                {device.manufacturer && (
                  <div>Manufacturer: {device.manufacturer}</div>
                )}
                {device.model && (
                  <div>Model: {device.model}</div>
                )}
                {device.androidVersion && (
                  <div>Android: {device.androidVersion}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Network Info */}
        {!compact && device.ipAddress && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              IP: {device.ipAddress}
            </div>
            {device.macAddress && (
              <div className="text-xs text-gray-500">
                MAC: {device.macAddress}
              </div>
            )}
          </div>
        )}

        {/* Activity Indicator */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {device.isActive ? (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Active
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                Inactive
              </div>
            )}
          </div>

          {/* Device Group */}
          {device.deviceGroupId && (
            <div className="text-xs text-gray-500">
              Group: {device.deviceGroupId}
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-gray-200 pointer-events-none transition-colors" />
    </div>
  )
}