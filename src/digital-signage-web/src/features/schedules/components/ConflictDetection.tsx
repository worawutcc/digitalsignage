'use client'

import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import type { ScheduleConflict } from '../types'

export interface ConflictDetectionProps {
  conflicts: ScheduleConflict[]
  onResolve?: (conflictId: string) => void
  onDismiss?: (conflictId: string) => void
  className?: string
}

/**
 * ConflictDetection Component
 * Displays real-time schedule conflict warnings and errors
 */
export function ConflictDetection({
  conflicts,
  onResolve,
  onDismiss,
  className = '',
}: ConflictDetectionProps) {
  if (!conflicts || conflicts.length === 0) {
    return null
  }

  const getConflictIcon = (severity: ScheduleConflict['severity']) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getConflictStyles = (severity: ScheduleConflict['severity']) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900'
    }
  }

  const getConflictTypeLabel = (type: ScheduleConflict['type']) => {
    switch (type) {
      case 'overlap':
        return 'Time Overlap'
      case 'device_offline':
        return 'Device Offline'
      case 'priority_conflict':
        return 'Priority Conflict'
      case 'content_unavailable':
        return 'Content Unavailable'
      default:
        return 'Conflict'
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Detected Conflicts ({conflicts.length})
        </h3>
      </div>

      <div className="space-y-2">
        {conflicts.map((conflict) => (
          <div
            key={conflict.id}
            className={`rounded-lg border p-4 ${getConflictStyles(conflict.severity)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 mt-0.5">
                  {getConflictIcon(conflict.severity)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">
                      {getConflictTypeLabel(conflict.type)}
                    </span>
                    {conflict.severity === 'error' && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                        Must Fix
                      </span>
                    )}
                  </div>

                  {conflict.message && (
                    <p className="text-sm mb-2">{conflict.message}</p>
                  )}

                  {/* Conflict Details */}
                  <div className="space-y-1 text-xs">
                    {conflict.existingSchedule && (
                      <p>
                        <span className="font-medium">Conflicting Schedule:</span>{' '}
                        {conflict.existingSchedule.name}
                      </p>
                    )}
                    {conflict.device && (
                      <p>
                        <span className="font-medium">Device:</span> {conflict.device}
                      </p>
                    )}
                    {conflict.devices && conflict.devices.length > 0 && (
                      <p>
                        <span className="font-medium">Devices:</span>{' '}
                        {conflict.devices.join(', ')}
                      </p>
                    )}
                    {conflict.timeRange && (
                      <p>
                        <span className="font-medium">Time Range:</span>{' '}
                        {conflict.timeRange.start} - {conflict.timeRange.end}
                      </p>
                    )}
                  </div>

                  {/* Suggestion */}
                  {conflict.suggestion && (
                    <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs">
                      <span className="font-medium">Suggestion:</span>{' '}
                      {conflict.suggestion}
                    </div>
                  )}

                  {/* Actions */}
                  {onResolve && conflict.severity === 'error' && (
                    <div className="mt-3">
                      <button
                        onClick={() => onResolve(conflict.id)}
                        className="text-xs font-medium underline hover:no-underline"
                      >
                        Resolve Conflict
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {onDismiss && conflict.severity !== 'error' && (
                <button
                  onClick={() => onDismiss(conflict.id)}
                  className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-30 rounded"
                  aria-label="Dismiss conflict"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {conflicts.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              {conflicts.filter((c) => c.severity === 'error').length} Errors,{' '}
              {conflicts.filter((c) => c.severity === 'warning').length} Warnings
            </span>
            {conflicts.some((c) => c.severity === 'error') && (
              <span className="text-red-600 font-medium">
                Fix all errors before saving
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
