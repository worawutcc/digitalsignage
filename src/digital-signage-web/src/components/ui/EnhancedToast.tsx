/**
 * Enhanced Toast Notification System
 * 
 * Enhanced toast system for immediate feedback with different types, action buttons,
 * progress indicators, and integration with bulk operations and optimistic updates.
 * 
 * @see specs/021-user-schedule-assignment/tasks.md - T029
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

'use client'

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  RefreshCw, 
  Clock,
  Zap,
  Users,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Toast types and interfaces
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'progress'
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'

export interface ToastAction {
  label: string
  action: () => void
  variant?: 'primary' | 'secondary' | 'danger'
}

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number | 'persistent'
  actions?: ToastAction[]
  progress?: {
    value: number
    max: number
    showPercentage?: boolean
  }
  context?: {
    feature?: string
    userId?: string
    scheduleId?: string
    bulkOperationId?: string
  }
  onDismiss?: () => void
  dismissible?: boolean
  showProgress?: boolean
  animate?: boolean
}

export interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  updateToast: (id: string, updates: Partial<Toast>) => void
  clearAllToasts: () => void
  clearToastsByType: (type: ToastType) => void
  clearToastsByContext: (context: Partial<Toast['context']>) => void
}

// Toast Context
const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast Provider Component
export interface ToastProviderProps {
  children: ReactNode
  position?: ToastPosition
  maxToasts?: number
  defaultDuration?: number
}

export function ToastProvider({ 
  children, 
  position = 'top-right',
  maxToasts = 5,
  defaultDuration = 5000 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = {
      id,
      duration: defaultDuration,
      dismissible: true,
      animate: true,
      ...toast,
    }

    setToasts(prev => {
      const updated = [newToast, ...prev]
      // Limit the number of toasts
      return updated.slice(0, maxToasts)
    })

    // Auto-dismiss toast if duration is set
    if (newToast.duration && newToast.duration !== 'persistent') {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [defaultDuration, maxToasts])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const clearToastsByType = useCallback((type: ToastType) => {
    setToasts(prev => prev.filter(toast => toast.type !== type))
  }, [])

  const clearToastsByContext = useCallback((context: Partial<Toast['context']>) => {
    if (!context) return
    setToasts(prev => prev.filter(toast => {
      if (!toast.context) return true
      return !Object.entries(context).every(([key, value]) => 
        toast.context![key as keyof Toast['context']] === value
      )
    }))
  }, [])

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    updateToast,
    clearAllToasts,
    clearToastsByType,
    clearToastsByContext,
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer position={position} toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast Container Component
interface ToastContainerProps {
  position: ToastPosition
  toasts: Toast[]
  onRemove: (id: string) => void
}

function ToastContainer({ position, toasts, onRemove }: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
  }

  if (toasts.length === 0) return null

  return (
    <div className={cn(positionClasses[position], 'space-y-2 max-w-sm w-full')}>
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

// Individual Toast Component
interface ToastComponentProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastComponent({ toast, onRemove }: ToastComponentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = useCallback(() => {
    if (toast.onDismiss) {
      toast.onDismiss()
    }
    
    if (toast.animate) {
      setIsRemoving(true)
      setTimeout(() => onRemove(toast.id), 200)
    } else {
      onRemove(toast.id)
    }
  }, [toast, onRemove])

  const typeConfig = getToastTypeConfig(toast.type)

  return (
    <div
      className={cn(
        'relative flex items-start p-4 rounded-lg shadow-lg border transition-all duration-200 transform',
        typeConfig.bgClass,
        typeConfig.borderClass,
        toast.animate && isVisible && 'translate-x-0 opacity-100',
        toast.animate && !isVisible && 'translate-x-full opacity-0',
        toast.animate && isRemoving && 'translate-x-full opacity-0 scale-95'
      )}
      role="alert"
      aria-live="polite"
      data-testid={`toast-${toast.type}`}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 mt-0.5', typeConfig.iconClass)}>
        {typeConfig.icon}
      </div>

      {/* Content */}
      <div className="ml-3 flex-1 min-w-0">
        <div className={cn('text-sm font-medium', typeConfig.titleClass)}>
          {toast.title}
        </div>
        
        {toast.message && (
          <div className={cn('mt-1 text-sm', typeConfig.messageClass)}>
            {toast.message}
          </div>
        )}

        {/* Progress Bar */}
        {toast.progress && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={typeConfig.messageClass}>Progress</span>
              {toast.progress.showPercentage && (
                <span className={typeConfig.messageClass}>
                  {Math.round((toast.progress.value / toast.progress.max) * 100)}%
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className={cn('h-2 rounded-full transition-all duration-300', typeConfig.progressClass)}
                style={{ 
                  width: `${Math.min(100, (toast.progress.value / toast.progress.max) * 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        {toast.actions && toast.actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {toast.actions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded text-xs font-medium transition-colors',
                  getActionButtonClasses(action.variant || 'secondary', toast.type)
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Context Information */}
        {toast.context && (
          <div className="mt-2 text-xs opacity-75">
            {toast.context.feature && (
              <span className="inline-flex items-center gap-1">
                <span>{toast.context.feature}</span>
                {toast.context.userId && <ChevronRight className="h-3 w-3" />}
              </span>
            )}
            {toast.context.userId && (
              <span>User {toast.context.userId}</span>
            )}
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      {toast.dismissible && (
        <button
          onClick={handleRemove}
          className={cn(
            'flex-shrink-0 ml-3 mt-0.5 rounded-md p-1 transition-colors',
            typeConfig.dismissButtonClass
          )}
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

// Enhanced Toast Hooks for Specific Use Cases

/**
 * Hook for bulk operation toasts
 */
export function useBulkOperationToast() {
  const { addToast, updateToast, removeToast } = useToast()

  const showBulkStart = useCallback((operation: { 
    type: string
    itemCount: number
    operationId: string
  }) => {
    return addToast({
      type: 'loading',
      title: `Starting ${operation.type}`,
      message: `Processing ${operation.itemCount} items...`,
      duration: 'persistent',
      context: {
        feature: 'bulk-operations',
        bulkOperationId: operation.operationId,
      },
      dismissible: false,
      progress: {
        value: 0,
        max: operation.itemCount,
        showPercentage: true,
      },
    })
  }, [addToast])

  const updateBulkProgress = useCallback((toastId: string, progress: {
    processed: number
    total: number
    currentItem?: string
  }) => {
    updateToast(toastId, {
      message: progress.currentItem 
        ? `Processing ${progress.currentItem}... (${progress.processed}/${progress.total})`
        : `Processed ${progress.processed}/${progress.total} items`,
      progress: {
        value: progress.processed,
        max: progress.total,
        showPercentage: true,
      },
    })
  }, [updateToast])

  const showBulkComplete = useCallback((
    toastId: string,
    result: { successful: number; failed: number; total: number }
  ) => {
    // Remove the progress toast
    removeToast(toastId)

    // Show completion toast
    const hasFailures = result.failed > 0
    const toastData: Omit<Toast, 'id'> = {
      type: hasFailures ? 'warning' : 'success',
      title: hasFailures ? 'Bulk Operation Completed with Issues' : 'Bulk Operation Completed',
      message: hasFailures 
        ? `${result.successful} successful, ${result.failed} failed out of ${result.total} items`
        : `Successfully processed all ${result.successful} items`,
      duration: hasFailures ? 10000 : 5000,
    }

    if (hasFailures) {
      toastData.actions = [
        {
          label: 'View Details',
          action: () => {
            console.log('Show bulk operation details')
          },
          variant: 'primary',
        },
        {
          label: 'Retry Failed',
          action: () => {
            console.log('Retry failed items')
          },
          variant: 'secondary',
        },
      ]
    }

    return addToast(toastData)
  }, [addToast, removeToast])

  return {
    showBulkStart,
    updateBulkProgress,
    showBulkComplete,
  }
}

/**
 * Hook for optimistic update toasts
 */
export function useOptimisticUpdateToast() {
  const { addToast, updateToast, removeToast } = useToast()

  const showOptimisticUpdate = useCallback((update: {
    action: string
    target: string
    id: string
  }) => {
    return addToast({
      type: 'info',
      title: `${update.action} ${update.target}`,
      message: 'Changes saved (pending confirmation)',
      duration: 'persistent',
      context: {
        feature: 'optimistic-updates',
        [update.target.toLowerCase() + 'Id']: update.id,
      },
      dismissible: false,
    })
  }, [addToast])

  const confirmOptimisticUpdate = useCallback((toastId: string, success: boolean) => {
    if (success) {
      updateToast(toastId, {
        type: 'success',
        title: 'Changes Confirmed',
        message: 'Your changes have been saved successfully',
        duration: 3000,
        dismissible: true,
      })
    } else {
      updateToast(toastId, {
        type: 'error',
        title: 'Changes Failed',
        message: 'Your changes could not be saved and have been reverted',
        duration: 8000,
        dismissible: true,
        actions: [
          {
            label: 'Retry',
            action: () => {
              console.log('Retry optimistic update')
            },
            variant: 'primary',
          },
        ],
      })
    }
  }, [updateToast])

  return {
    showOptimisticUpdate,
    confirmOptimisticUpdate,
  }
}

// Helper functions
function getToastTypeConfig(type: ToastType) {
  const configs = {
    success: {
      icon: <CheckCircle className="h-5 w-5" />,
      bgClass: 'bg-green-50 dark:bg-green-950/20',
      borderClass: 'border-green-200 dark:border-green-800',
      iconClass: 'text-green-600 dark:text-green-400',
      titleClass: 'text-green-900 dark:text-green-100',
      messageClass: 'text-green-700 dark:text-green-300',
      dismissButtonClass: 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200',
      progressClass: 'bg-green-600 dark:bg-green-400',
    },
    error: {
      icon: <XCircle className="h-5 w-5" />,
      bgClass: 'bg-red-50 dark:bg-red-950/20',
      borderClass: 'border-red-200 dark:border-red-800',
      iconClass: 'text-red-600 dark:text-red-400',
      titleClass: 'text-red-900 dark:text-red-100',
      messageClass: 'text-red-700 dark:text-red-300',
      dismissButtonClass: 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200',
      progressClass: 'bg-red-600 dark:bg-red-400',
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5" />,
      bgClass: 'bg-yellow-50 dark:bg-yellow-950/20',
      borderClass: 'border-yellow-200 dark:border-yellow-800',
      iconClass: 'text-yellow-600 dark:text-yellow-400',
      titleClass: 'text-yellow-900 dark:text-yellow-100',
      messageClass: 'text-yellow-700 dark:text-yellow-300',
      dismissButtonClass: 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200',
      progressClass: 'bg-yellow-600 dark:bg-yellow-400',
    },
    info: {
      icon: <Info className="h-5 w-5" />,
      bgClass: 'bg-blue-50 dark:bg-blue-950/20',
      borderClass: 'border-blue-200 dark:border-blue-800',
      iconClass: 'text-blue-600 dark:text-blue-400',
      titleClass: 'text-blue-900 dark:text-blue-100',
      messageClass: 'text-blue-700 dark:text-blue-300',
      dismissButtonClass: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200',
      progressClass: 'bg-blue-600 dark:bg-blue-400',
    },
    loading: {
      icon: <Loader2 className="h-5 w-5 animate-spin" />,
      bgClass: 'bg-gray-50 dark:bg-gray-950/20',
      borderClass: 'border-gray-200 dark:border-gray-800',
      iconClass: 'text-gray-600 dark:text-gray-400',
      titleClass: 'text-gray-900 dark:text-gray-100',
      messageClass: 'text-gray-700 dark:text-gray-300',
      dismissButtonClass: 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
      progressClass: 'bg-gray-600 dark:bg-gray-400',
    },
    progress: {
      icon: <Clock className="h-5 w-5" />,
      bgClass: 'bg-purple-50 dark:bg-purple-950/20',
      borderClass: 'border-purple-200 dark:border-purple-800',
      iconClass: 'text-purple-600 dark:text-purple-400',
      titleClass: 'text-purple-900 dark:text-purple-100',
      messageClass: 'text-purple-700 dark:text-purple-300',
      dismissButtonClass: 'text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200',
      progressClass: 'bg-purple-600 dark:bg-purple-400',
    },
  }

  return configs[type] || configs.info
}

function getActionButtonClasses(variant: string, toastType: ToastType): string {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded text-xs font-medium transition-colors'
  
  if (variant === 'primary') {
    switch (toastType) {
      case 'success':
        return cn(baseClasses, 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600')
      case 'error':
        return cn(baseClasses, 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600')
      case 'warning':
        return cn(baseClasses, 'bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600')
      default:
        return cn(baseClasses, 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600')
    }
  } else if (variant === 'danger') {
    return cn(baseClasses, 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600')
  } else {
    // secondary variant
    switch (toastType) {
      case 'success':
        return cn(baseClasses, 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/50')
      case 'error':
        return cn(baseClasses, 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50')
      case 'warning':
        return cn(baseClasses, 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50')
      default:
        return cn(baseClasses, 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50')
    }
  }
}