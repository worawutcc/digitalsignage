'use client'

/**
 * EnhancedConfirmationModal Component
 * 
 * Enhanced confirmation modal with preview functionality, action variants, 
 * loading states, and enhanced accessibility. Extends the existing Modal system.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  Eye,
  Clock,
  Zap,
  Shield,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { cn } from '@/lib/utils'

// Enhanced confirmation modal props
export interface EnhancedConfirmationModalProps {
  // Base props (extending ConfirmationModalProps)
  /** Whether the modal is visible */
  isOpen: boolean
  /** Function to call when modal should be closed */
  onClose: () => void
  /** Function to call when user confirms action */
  onConfirm: () => void
  /** Modal title */
  title: string
  /** Modal message/description */
  message: string
  /** Confirmation button text */
  confirmText?: string
  /** Cancel button text */
  cancelText?: string
  /** Whether to require checkbox confirmation */
  requireConfirm?: boolean
  /** Checkbox label text */
  confirmCheckboxLabel?: string
  /** Variant determines color scheme */
  variant?: 'warning' | 'danger' | 'info' | 'success'
  /** Whether the confirm action is loading */
  isLoading?: boolean
  /** Additional CSS classes */
  className?: string

  // Enhanced features
  /** Action type for different UI treatments */
  actionType?: 'delete' | 'replace' | 'bulk' | 'assign' | 'custom'
  
  // Preview functionality
  /** Enable preview section */
  showPreview?: boolean
  /** Preview title */
  previewTitle?: string
  /** Preview content */
  previewContent?: React.ReactNode
  /** Custom preview component */
  previewComponent?: React.ComponentType<any>
  /** Preview data passed to custom component */
  previewData?: any
  /** Maximum height for preview section */
  previewMaxHeight?: number
  
  // Action variants
  /** Primary action configuration */
  primaryAction?: {
    text: string
    variant: 'default' | 'destructive' | 'secondary'
    icon?: React.ComponentType<{ className?: string }>
    shortcut?: string
  }
  /** Secondary action configuration */
  secondaryAction?: {
    text: string
    onClick: () => void
    variant: 'outline' | 'ghost'
    icon?: React.ComponentType<{ className?: string }>
  }
  /** Additional actions */
  additionalActions?: Array<{
    text: string
    onClick: () => void
    variant: 'outline' | 'ghost' | 'link'
    icon?: React.ComponentType<{ className?: string }>
  }>

  // Loading states
  /** Custom loading text */
  loadingText?: string
  /** Show progress indicator */
  showProgress?: boolean
  /** Progress percentage (0-100) */
  progress?: number
  /** Progress steps */
  progressSteps?: Array<{
    label: string
    completed: boolean
    loading?: boolean
  }>

  // Enhanced accessibility
  /** Enhanced ARIA labels */
  enhancedAriaLabels?: boolean
  /** Screen reader description */
  ariaDescription?: string
  /** Focus trap enabled */
  focusTrap?: boolean
  /** Auto-focus element selector */
  autoFocus?: 'confirm' | 'cancel' | 'checkbox' | string

  // Analytics and monitoring
  /** Enable interaction tracking */
  enableAnalytics?: boolean
  /** Custom analytics event name */
  analyticsEvent?: string
  /** Analytics callback */
  onAnalyticsEvent?: (eventName: string, data: any) => void
  
  // Timing and behavior
  /** Auto-close timeout in milliseconds */
  autoCloseTimeout?: number
  /** Confirm button cooldown in seconds */
  confirmCooldown?: number
  /** Show confirmation countdown */
  showCountdown?: boolean
}

const variantConfig = {
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  danger: {
    icon: XCircle,
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
  },
}

const actionTypeConfig = {
  delete: { variant: 'danger' as const, icon: XCircle },
  replace: { variant: 'warning' as const, icon: AlertTriangle },
  bulk: { variant: 'info' as const, icon: Zap },
  assign: { variant: 'info' as const, icon: Shield },
  custom: { variant: 'info' as const, icon: Info },
}

export function EnhancedConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  requireConfirm = false,
  confirmCheckboxLabel = 'I understand the consequences',
  variant: propVariant,
  isLoading = false,
  className,
  // Enhanced props
  actionType = 'custom',
  showPreview = false,
  previewTitle = 'Preview',
  previewContent,
  previewComponent: PreviewComponent,
  previewData,
  previewMaxHeight = 300,
  primaryAction,
  secondaryAction,
  additionalActions = [],
  loadingText = 'Processing...',
  showProgress = false,
  progress = 0,
  progressSteps = [],
  enhancedAriaLabels = true,
  ariaDescription,
  focusTrap = true,
  autoFocus = 'confirm',
  enableAnalytics = false,
  analyticsEvent = 'confirmation_modal_action',
  onAnalyticsEvent,
  autoCloseTimeout,
  confirmCooldown = 0,
  showCountdown = false,
}: EnhancedConfirmationModalProps) {
  // State management
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [showPreviewSection, setShowPreviewSection] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(confirmCooldown)
  const [autoCloseRemaining, setAutoCloseRemaining] = useState(autoCloseTimeout || 0)
  
  // Refs
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const checkboxRef = useRef<HTMLInputElement>(null)
  
  // Determine variant based on actionType if not explicitly provided
  const variant = propVariant || actionTypeConfig[actionType].variant
  const config = variantConfig[variant]
  const Icon = config.icon
  
  // Reset state when modal opens/closes
  const handleClose = useCallback(() => {
    setIsConfirmed(false)
    setShowPreviewSection(false)
    setCooldownRemaining(confirmCooldown)
    setAutoCloseRemaining(autoCloseTimeout || 0)
    
    if (enableAnalytics && onAnalyticsEvent) {
      onAnalyticsEvent(analyticsEvent, {
        action: 'cancel',
        actionType,
        timestamp: Date.now()
      })
    }
    
    onClose()
  }, [confirmCooldown, autoCloseTimeout, enableAnalytics, onAnalyticsEvent, analyticsEvent, actionType, onClose])
  
  // Handle confirm with analytics
  const handleConfirm = useCallback(() => {
    if (requireConfirm && !isConfirmed) return
    if (cooldownRemaining > 0) return
    
    if (enableAnalytics && onAnalyticsEvent) {
      onAnalyticsEvent(analyticsEvent, {
        action: 'confirm',
        actionType,
        timestamp: Date.now(),
        hadCooldown: confirmCooldown > 0,
        requiredConfirmation: requireConfirm
      })
    }
    
    onConfirm()
  }, [
    requireConfirm, 
    isConfirmed, 
    cooldownRemaining, 
    enableAnalytics, 
    onAnalyticsEvent, 
    analyticsEvent, 
    actionType, 
    confirmCooldown, 
    onConfirm
  ])
  
  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining > 0 && isOpen) {
      const timer = setTimeout(() => {
        setCooldownRemaining(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [cooldownRemaining, isOpen])
  
  // Auto-close timer
  useEffect(() => {
    if (autoCloseRemaining > 0 && isOpen && !isLoading) {
      const timer = setTimeout(() => {
        setAutoCloseRemaining(prev => {
          if (prev <= 1) {
            handleClose()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [autoCloseRemaining, isOpen, isLoading, handleClose])
  
  // Auto focus management
  useEffect(() => {
    if (isOpen && !isLoading) {
      const focusElement = () => {
        switch (autoFocus) {
          case 'confirm':
            confirmButtonRef.current?.focus()
            break
          case 'cancel':
            cancelButtonRef.current?.focus()
            break
          case 'checkbox':
            checkboxRef.current?.focus()
            break
          default:
            if (typeof autoFocus === 'string') {
              const element = document.querySelector(autoFocus) as HTMLElement
              element?.focus()
            }
        }
      }
      
      // Delay focus to ensure modal is rendered
      const timer = setTimeout(focusElement, 100)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isOpen, isLoading, autoFocus])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isLoading) return
      
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleConfirm()
      }
      
      if (primaryAction?.shortcut && e.key === primaryAction.shortcut) {
        e.preventDefault()
        handleConfirm()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, handleConfirm, primaryAction])
  
  const canConfirm = (!requireConfirm || isConfirmed) && cooldownRemaining === 0 && !isLoading
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      closeOnOverlayClick={!isLoading}
      {...(className && { className })}
    >
      <div
        className="space-y-6"
        role={enhancedAriaLabels ? 'alertdialog' : 'dialog'}
        aria-describedby={ariaDescription ? 'modal-description' : 'modal-message'}
        aria-labelledby="modal-title"
      >
        {/* Header with Icon */}
        <div className={cn(
          'flex items-start gap-4 p-4 rounded-lg border',
          config.bgColor,
          config.borderColor
        )}>
          <Icon className={cn('h-6 w-6 flex-shrink-0 mt-0.5', config.iconColor)} />
          <div className="flex-1 min-w-0">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h2>
            <p id="modal-message" className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
            {ariaDescription && (
              <p id="modal-description" className="sr-only">
                {ariaDescription}
              </p>
            )}
            
            {/* Auto-close countdown */}
            {showCountdown && autoCloseRemaining > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Auto-closing in {autoCloseRemaining} seconds</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Preview Section */}
        {showPreview && (previewContent || PreviewComponent) && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowPreviewSection(!showPreviewSection)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Eye className="h-4 w-4" />
              {previewTitle}
              {showPreviewSection ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            
            {showPreviewSection && (
              <div 
                className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 overflow-auto"
                style={{ maxHeight: previewMaxHeight }}
              >
                {PreviewComponent ? (
                  <PreviewComponent {...previewData} />
                ) : (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {previewContent}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Progress Section */}
        {(showProgress || progressSteps.length > 0) && isLoading && (
          <div className="space-y-3">
            {showProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{loadingText}</span>
                  <span className="text-gray-500 dark:text-gray-500">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {progressSteps.length > 0 && (
              <div className="space-y-2">
                {progressSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    {step.loading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    ) : step.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={cn(
                      step.completed ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                    )}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Confirmation Checkbox */}
        {requireConfirm && (
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {confirmCheckboxLabel}
            </span>
          </label>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            ref={cancelButtonRef}
            onClick={secondaryAction?.onClick || handleClose}
            disabled={isLoading}
            variant={secondaryAction?.variant || 'outline'}
            className="w-full sm:w-auto"
          >
            {secondaryAction?.icon && <secondaryAction.icon className="h-4 w-4 mr-2" />}
            {secondaryAction?.text || cancelText}
          </Button>
          
          {/* Additional Actions */}
          {additionalActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              disabled={isLoading}
              variant={action.variant}
              className="w-full sm:w-auto"
            >
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.text}
            </Button>
          ))}
          
          <Button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            disabled={!canConfirm}
            variant={primaryAction?.variant || (variant === 'danger' ? 'destructive' : 'default')}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {loadingText}
              </>
            ) : (
              <>
                {primaryAction?.icon && <primaryAction.icon className="h-4 w-4 mr-2" />}
                {primaryAction?.text || confirmText}
                {cooldownRemaining > 0 && ` (${cooldownRemaining}s)`}
                {primaryAction?.shortcut && (
                  <span className="ml-2 text-xs opacity-60">
                    {primaryAction.shortcut}
                  </span>
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}