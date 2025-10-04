/**
 * Mobile Conflict Resolution Components
 * 
 * Mobile-optimized conflict resolution UI with touch gestures and simplified workflows
 * for managing user schedule conflicts on mobile devices.
 * 
 * @see T032 - Mobile Conflict Resolution UI
 */

'use client'

import React, { useState, useCallback } from 'react'
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X, 
  Check, 
  Clock, 
  Calendar, 
  User, 
  Monitor,
  ChevronRight,
  ChevronDown,
  Zap,
  Shield,
  Target
} from 'lucide-react'
import { TouchButton, MobileDrawer } from './MobileComponents'
import { useTouchGestures, useViewport } from '@/lib/mobile-utils'
import type { ScheduleConflict } from '@/features/schedules/types'
import type { ConflictResolution } from '@/types/schedule-conflicts'
import { ResolutionStrategy } from '@/types/schedule-conflicts'

// ============================================================================
// MOBILE CONFLICT CARD COMPONENT
// ============================================================================

export interface MobileConflictCardProps {
  conflict: ScheduleConflict
  onResolve?: ((conflictId: string, strategy?: ResolutionStrategy) => void) | undefined
  onDismiss?: ((conflictId: string) => void) | undefined
  onExpand?: ((conflictId: string) => void) | undefined
  expanded?: boolean
}

/**
 * Mobile-optimized conflict card with swipe gestures
 */
export function MobileConflictCard({ 
  conflict, 
  onResolve, 
  onDismiss, 
  onExpand,
  expanded = false 
}: MobileConflictCardProps) {
  const [showResolutionOptions, setShowResolutionOptions] = useState(false)
  
  const touchGestures = useTouchGestures({
    onSwipeLeft: () => {
      if (conflict.severity !== 'error' && onDismiss) {
        onDismiss(conflict.id)
      }
    },
    onSwipeRight: () => {
      if (onResolve) {
        setShowResolutionOptions(true)
      }
    },
    onTouchEnd: () => {
      onExpand?.(conflict.id)
    }
  })

  const getConflictIcon = () => {
    switch (conflict.severity) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getConflictStyles = () => {
    switch (conflict.severity) {
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
    }
  }

  const getConflictTypeLabel = () => {
    switch (conflict.type) {
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
    <>
      <div
        {...touchGestures}
        className={`rounded-lg border p-4 transition-all duration-200 active:scale-[0.98] ${getConflictStyles()}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              {getConflictIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {getConflictTypeLabel()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onExpand?.(conflict.id)
                  }}
                  className="p-1 hover:bg-white/50 rounded-full"
                >
                  {expanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
              
              {conflict.severity === 'error' && (
                <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-800 dark:text-red-300 mt-1">
                  Must Fix
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {conflict.message && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 pl-8">
            {conflict.message}
          </p>
        )}

        {/* Compact Details */}
        <div className="pl-8 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>
              {conflict.timeRange ? 
                `${conflict.timeRange.start} - ${conflict.timeRange.end}` : 
                'Time conflict'
              }
            </span>
          </div>
          
          {conflict.device && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Monitor className="w-3 h-3" />
              <span>{conflict.device}</span>
            </div>
          )}
          
          {conflict.existingSchedule && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{conflict.existingSchedule.name}</span>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 pl-8">
            {conflict.devices && conflict.devices.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Affected Devices:
                </p>
                <div className="flex flex-wrap gap-1">
                  {conflict.devices.map((device, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {device}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {conflict.suggestion && (
              <div className="p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                <p className="text-xs">
                  <span className="font-medium text-blue-600 dark:text-blue-400">Suggestion:</span>{' '}
                  <span className="text-gray-700 dark:text-gray-300">{conflict.suggestion}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex gap-2">
            {onResolve && (
              <TouchButton
                onClick={(e) => {
                  e.stopPropagation()
                  setShowResolutionOptions(true)
                }}
                size="sm"
                variant="primary"
              >
                <Zap className="w-3 h-3 mr-1" />
                Resolve
              </TouchButton>
            )}
          </div>
          
          {onDismiss && conflict.severity !== 'error' && (
            <TouchButton
              onClick={(e) => {
                e.stopPropagation()
                onDismiss(conflict.id)
              }}
              size="sm"
              variant="ghost"
            >
              <X className="w-3 h-3" />
            </TouchButton>
          )}
        </div>

        {/* Swipe Indicators */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-400 dark:text-gray-600">
          {onResolve && (
            <span>← Swipe right to resolve</span>
          )}
          {onDismiss && conflict.severity !== 'error' && (
            <span>Swipe left to dismiss →</span>
          )}
        </div>
      </div>

      {/* Resolution Options Modal */}
      <MobileDrawer
        isOpen={showResolutionOptions}
        onClose={() => setShowResolutionOptions(false)}
        title="Resolve Conflict"
      >
        <MobileResolutionOptions
          conflict={conflict}
          onResolve={(strategy?) => {
            onResolve?.(conflict.id, strategy)
            setShowResolutionOptions(false)
          }}
          onCancel={() => setShowResolutionOptions(false)}
        />
      </MobileDrawer>
    </>
  )
}

// ============================================================================
// MOBILE RESOLUTION OPTIONS COMPONENT
// ============================================================================

export interface MobileResolutionOptionsProps {
  conflict: ScheduleConflict
  onResolve: (strategy?: ResolutionStrategy) => void
  onCancel: () => void
}

/**
 * Mobile-optimized resolution strategy selector
 */
export function MobileResolutionOptions({ 
  conflict, 
  onResolve, 
  onCancel 
}: MobileResolutionOptionsProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<ResolutionStrategy | null>(null)

  const resolutionStrategies = [
    {
      strategy: 'OVERRIDE_LIMITS' as ResolutionStrategy,
      icon: <Target className="w-5 h-5 text-purple-600" />,
      title: 'Priority Override',
      description: 'Resolve based on schedule priority levels',
      recommended: conflict.type === 'priority_conflict'
    },
    {
      strategy: 'RESCHEDULE' as ResolutionStrategy,
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      title: 'Reschedule',
      description: 'Move conflicting schedule to available time slot',
      recommended: conflict.type === 'overlap'
    },
    {
      strategy: 'ADD_RESOURCES' as ResolutionStrategy,
      icon: <Monitor className="w-5 h-5 text-green-600" />,
      title: 'Add Resources',
      description: 'Assign to different available device',
      recommended: conflict.type === 'device_offline'
    },
    {
      strategy: 'REQUEST_APPROVAL' as ResolutionStrategy,
      icon: <User className="w-5 h-5 text-orange-600" />,
      title: 'Manual Review',
      description: 'Escalate to administrator for manual resolution',
      recommended: false
    }
  ]

  const filteredStrategies = resolutionStrategies.filter(strategy => {
    // Filter strategies based on conflict type
    if (conflict.type === 'device_offline' && strategy.strategy === ResolutionStrategy.RESCHEDULE) return false
    if (conflict.type === 'content_unavailable' && strategy.strategy === ResolutionStrategy.ADD_RESOURCES) return false
    return true
  })

  return (
    <div className="p-4 space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Choose Resolution Strategy
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select how to resolve this {conflict.type.replace('_', ' ')} conflict
        </p>
      </div>

      <div className="space-y-3">
        {filteredStrategies.map((item) => (
          <TouchButton
            key={item.strategy}
            onClick={() => setSelectedStrategy(item.strategy)}
            variant={selectedStrategy === item.strategy ? 'primary' : 'outline'}
            className="w-full p-4 h-auto justify-start relative"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{item.title}</span>
                  {item.recommended && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      <Shield className="w-3 h-3 mr-1" />
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              {selectedStrategy === item.strategy && (
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              )}
            </div>
          </TouchButton>
        ))}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <TouchButton
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </TouchButton>
        <TouchButton
          onClick={() => selectedStrategy && onResolve(selectedStrategy)}
          disabled={!selectedStrategy}
          className="flex-1"
        >
          Apply Resolution
        </TouchButton>
      </div>
    </div>
  )
}

// ============================================================================
// MOBILE CONFLICT LIST COMPONENT
// ============================================================================

export interface MobileConflictListProps {
  conflicts: ScheduleConflict[]
  onResolve?: ((conflictId: string, strategy?: ResolutionStrategy) => void) | undefined
  onDismiss?: ((conflictId: string) => void) | undefined
  onResolveAll?: (() => void) | undefined
  className?: string
}

/**
 * Mobile-optimized conflict list with batch operations
 */
export function MobileConflictList({ 
  conflicts, 
  onResolve, 
  onDismiss, 
  onResolveAll,
  className = '' 
}: MobileConflictListProps) {
  const [expandedConflicts, setExpandedConflicts] = useState<Set<string>>(new Set())
  const viewport = useViewport()

  const handleExpand = useCallback((conflictId: string) => {
    setExpandedConflicts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(conflictId)) {
        newSet.delete(conflictId)
      } else {
        newSet.add(conflictId)
      }
      return newSet
    })
  }, [])

  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="text-center py-12">
        <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No conflicts detected</p>
      </div>
    )
  }

  const errorCount = conflicts.filter(c => c.severity === 'error').length
  const warningCount = conflicts.filter(c => c.severity === 'warning').length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Conflicts ({conflicts.length})
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {errorCount} errors, {warningCount} warnings
          </p>
        </div>
        
        {onResolveAll && errorCount === 0 && (
          <TouchButton
            onClick={onResolveAll}
            size="sm"
            variant="primary"
          >
            <Zap className="w-4 h-4 mr-2" />
            Resolve All
          </TouchButton>
        )}
      </div>

      {/* Conflicts List */}
      <div className="space-y-3">
        {conflicts.map((conflict) => (
          <MobileConflictCard
            key={conflict.id}
            conflict={conflict}
            onResolve={onResolve}
            onDismiss={onDismiss}
            onExpand={handleExpand}
            expanded={expandedConflicts.has(conflict.id)}
          />
        ))}
      </div>

      {/* Error Summary */}
      {errorCount > 0 && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-900 dark:text-red-100">
              Action Required
            </span>
          </div>
          <p className="text-sm text-red-800 dark:text-red-200">
            {errorCount} error{errorCount !== 1 ? 's' : ''} must be resolved before proceeding.
          </p>
        </div>
      )}

      {/* Usage Instructions */}
      {viewport.isMobile && (
        <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            💡 Swipe conflicts left to dismiss, right to resolve quickly
          </p>
        </div>
      )}
    </div>
  )
}