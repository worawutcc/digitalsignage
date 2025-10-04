/**
 * Progress Indicators & Loading States
 * 
 * Comprehensive loading states and progress feedback components
 * for bulk operations and real-time updates.
 * 
 * @see T034 - Progress Indicators & Loading States
 */

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Download, 
  Upload,
  Zap,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useViewport } from '@/lib/mobile-utils'
import { TouchButton } from '@/components/mobile/MobileComponents'

// ============================================================================
// PROGRESS BAR COMPONENT
// ============================================================================

export interface ProgressBarProps {
  value: number // 0-100
  max?: number
  label?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  animated?: boolean
  className?: string
}

/**
 * Customizable progress bar with animations
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  color = 'blue',
  size = 'md',
  showPercentage = true,
  animated = true,
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-500',
    red: 'bg-red-600',
    purple: 'bg-purple-600'
  }

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const bgColorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30'
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={cn(
        'w-full rounded-full overflow-hidden',
        bgColorClasses[color],
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            colorClasses[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// BULK OPERATION PROGRESS COMPONENT
// ============================================================================

export interface BulkOperationStatus {
  id: string
  type: 'create' | 'update' | 'delete' | 'import' | 'export' | 'sync'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused'
  progress: number // 0-100
  total: number
  processed: number
  failed: number
  message?: string | undefined
  startedAt: string
  completedAt?: string | undefined
  error?: string | undefined
  canCancel?: boolean | undefined
  canPause?: boolean | undefined
  canRetry?: boolean | undefined
}

export interface BulkOperationProgressProps {
  operation: BulkOperationStatus
  onCancel?: ((operationId: string) => void) | undefined
  onPause?: ((operationId: string) => void) | undefined
  onResume?: ((operationId: string) => void) | undefined
  onRetry?: ((operationId: string) => void) | undefined
  className?: string
}

/**
 * Progress indicator for bulk operations
 */
export function BulkOperationProgress({
  operation,
  onCancel,
  onPause,
  onResume,
  onRetry,
  className = ''
}: BulkOperationProgressProps) {
  const viewport = useViewport()

  const getStatusIcon = () => {
    switch (operation.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-500" />
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />
      case 'paused':
        return <PauseCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getOperationIcon = () => {
    switch (operation.type) {
      case 'create':
        return <Users className="w-4 h-4" />
      case 'update':
        return <RefreshCw className="w-4 h-4" />
      case 'delete':
        return <XCircle className="w-4 h-4" />
      case 'import':
        return <Download className="w-4 h-4" />
      case 'export':
        return <Upload className="w-4 h-4" />
      case 'sync':
        return <Zap className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getOperationLabel = () => {
    switch (operation.type) {
      case 'create':
        return 'Creating'
      case 'update':
        return 'Updating'
      case 'delete':
        return 'Deleting'
      case 'import':
        return 'Importing'
      case 'export':
        return 'Exporting'
      case 'sync':
        return 'Synchronizing'
      default:
        return 'Processing'
    }
  }

  const getProgressColor = (): 'blue' | 'green' | 'yellow' | 'red' | 'purple' => {
    switch (operation.status) {
      case 'completed':
        return 'green'
      case 'failed':
        return 'red'
      case 'paused':
        return 'yellow'
      case 'cancelled':
        return 'red'
      default:
        return 'blue'
    }
  }

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000)
    
    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`
  }

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              {getOperationIcon()}
              <span className="text-sm font-medium">
                {getOperationLabel()} {operation.total} items
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {operation.canPause && operation.status === 'running' && onPause && (
            <TouchButton
              onClick={() => onPause(operation.id)}
              variant="ghost"
              size="sm"
              className="p-1"
            >
              <PauseCircle className="w-4 h-4" />
            </TouchButton>
          )}
          
          {operation.status === 'paused' && onResume && (
            <TouchButton
              onClick={() => onResume(operation.id)}
              variant="ghost"
              size="sm"
              className="p-1"
            >
              <PlayCircle className="w-4 h-4" />
            </TouchButton>
          )}
          
          {operation.canRetry && (operation.status === 'failed' || operation.status === 'cancelled') && onRetry && (
            <TouchButton
              onClick={() => onRetry(operation.id)}
              variant="ghost"
              size="sm"
              className="p-1"
            >
              <RotateCcw className="w-4 h-4" />
            </TouchButton>
          )}
          
          {operation.canCancel && (operation.status === 'running' || operation.status === 'paused') && onCancel && (
            <TouchButton
              onClick={() => onCancel(operation.id)}
              variant="ghost"
              size="sm"
              className="p-1 text-red-600 hover:text-red-700"
            >
              <XCircle className="w-4 h-4" />
            </TouchButton>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        value={operation.progress}
        color={getProgressColor()}
        showPercentage={false}
        animated={operation.status === 'running'}
        className="mb-3"
      />

      {/* Stats */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 dark:text-gray-400">
            {operation.processed} / {operation.total} processed
          </span>
          {operation.failed > 0 && (
            <span className="text-red-600 dark:text-red-400">
              {operation.failed} failed
            </span>
          )}
        </div>
        
        <div className="text-gray-500 dark:text-gray-400">
          {formatDuration(operation.startedAt, operation.completedAt)}
        </div>
      </div>

      {/* Message or Error */}
      {(operation.message || operation.error) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {operation.error ? (
            <div className="flex items-start space-x-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{operation.error}</span>
            </div>
          ) : operation.message ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {operation.message}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// OPERATION QUEUE COMPONENT
// ============================================================================

export interface OperationQueueProps {
  operations: BulkOperationStatus[]
  onCancel?: ((operationId: string) => void) | undefined
  onPause?: ((operationId: string) => void) | undefined
  onResume?: ((operationId: string) => void) | undefined
  onRetry?: ((operationId: string) => void) | undefined
  onClearCompleted?: (() => void) | undefined
  className?: string
}

/**
 * Queue of bulk operations with management controls
 */
export function OperationQueue({
  operations,
  onCancel,
  onPause,
  onResume,
  onRetry,
  onClearCompleted,
  className = ''
}: OperationQueueProps) {
  const [showCompleted, setShowCompleted] = useState(false)

  const activeOperations = operations.filter(op => 
    op.status === 'pending' || op.status === 'running' || op.status === 'paused'
  )
  
  const completedOperations = operations.filter(op => 
    op.status === 'completed' || op.status === 'failed' || op.status === 'cancelled'
  )

  if (operations.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Operations ({activeOperations.length} active)
        </h3>
        
        <div className="flex items-center space-x-2">
          {completedOperations.length > 0 && (
            <>
              <TouchButton
                onClick={() => setShowCompleted(!showCompleted)}
                variant="ghost"
                size="sm"
              >
                {showCompleted ? 'Hide' : 'Show'} Completed ({completedOperations.length})
              </TouchButton>
              
              {onClearCompleted && (
                <TouchButton
                  onClick={onClearCompleted}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Clear Completed
                </TouchButton>
              )}
            </>
          )}
        </div>
      </div>

      {/* Active Operations */}
      {activeOperations.length > 0 && (
        <div className="space-y-3">
          {activeOperations.map(operation => (
            <BulkOperationProgress
              key={operation.id}
              operation={operation}
              onCancel={onCancel}
              onPause={onPause}
              onResume={onResume}
              onRetry={onRetry}
            />
          ))}
        </div>
      )}

      {/* Completed Operations */}
      {showCompleted && completedOperations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-t pt-4">
            Completed Operations
          </h4>
          {completedOperations.map(operation => (
            <BulkOperationProgress
              key={operation.id}
              operation={operation}
              onCancel={onCancel}
              onPause={onPause}
              onResume={onResume}
              onRetry={onRetry}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// LOADING STATES COMPONENT
// ============================================================================

export interface LoadingStateProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'wave'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  fullscreen?: boolean
  className?: string
}

/**
 * Various loading state indicators
 */
export function LoadingState({
  type = 'spinner',
  size = 'md',
  message,
  fullscreen = false,
  className = ''
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const LoadingSpinner = () => (
    <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
  )

  const LoadingDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={cn('bg-blue-600 rounded-full animate-pulse', {
            'w-2 h-2': size === 'sm',
            'w-3 h-3': size === 'md',
            'w-4 h-4': size === 'lg',
            'w-6 h-6': size === 'xl'
          })}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )

  const LoadingPulse = () => (
    <div className={cn('bg-blue-600 rounded-full animate-pulse', sizeClasses[size])} />
  )

  const LoadingSkeleton = () => (
    <div className="space-y-3 w-full max-w-md">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )

  const LoadingWave = () => (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn('bg-blue-600 animate-pulse', {
            'w-1 h-8': size === 'sm',
            'w-2 h-12': size === 'md',
            'w-3 h-16': size === 'lg',
            'w-4 h-20': size === 'xl'
          })}
          style={{ 
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  )

  const getLoadingComponent = () => {
    switch (type) {
      case 'dots':
        return <LoadingDots />
      case 'pulse':
        return <LoadingPulse />
      case 'skeleton':
        return <LoadingSkeleton />
      case 'wave':
        return <LoadingWave />
      default:
        return <LoadingSpinner />
    }
  }

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      fullscreen && 'min-h-screen',
      className
    )}>
      {getLoadingComponent()}
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {message}
        </p>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}

// ============================================================================
// REAL-TIME UPDATE INDICATOR
// ============================================================================

export interface RealTimeUpdateProps {
  connected: boolean
  lastUpdate?: string
  updateCount?: number
  onReconnect?: (() => void) | undefined
  className?: string
}

/**
 * Real-time connection status and update indicator
 */
export function RealTimeUpdateIndicator({
  connected,
  lastUpdate,
  updateCount = 0,
  onReconnect,
  className = ''
}: RealTimeUpdateProps) {
  const [showDetails, setShowDetails] = useState(false)

  const formatLastUpdate = (timestamp: string) => {
    const now = new Date()
    const update = new Date(timestamp)
    const diff = Math.floor((now.getTime() - update.getTime()) / 1000)
    
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return update.toLocaleDateString()
  }

  return (
    <div className={cn('relative', className)}>
      <TouchButton
        onClick={() => setShowDetails(!showDetails)}
        variant="ghost"
        size="sm"
        className="flex items-center space-x-2"
      >
        <div className={cn(
          'w-2 h-2 rounded-full',
          connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        )} />
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {connected ? 'Live' : 'Disconnected'}
        </span>
      </TouchButton>

      {showDetails && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-48 z-10">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={connected ? 'text-green-600' : 'text-red-600'}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {lastUpdate && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last update:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatLastUpdate(lastUpdate)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Updates:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {updateCount}
              </span>
            </div>
            
            {!connected && onReconnect && (
              <TouchButton
                onClick={onReconnect}
                size="sm"
                className="w-full mt-2"
              >
                Reconnect
              </TouchButton>
            )}
          </div>
        </div>
      )}
    </div>
  )
}