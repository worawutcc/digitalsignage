/**
 * EnhancedConfirmationModal Component Type Definitions
 * 
 * Type definitions for the EnhancedConfirmationModal component with preview functionality,
 * action variants, loading states, and enhanced accessibility features.
 * 
 * @see components/ui/EnhancedConfirmationModal.tsx
 * @see copilot-instructions-web.md - Component Development Rules
 */

import { ReactNode } from 'react'

/**
 * Preview data interface for showing bulk operation details
 */
export interface PreviewData {
  /** Total items affected */
  totalItems: number
  /** Items to show in preview list */
  items: Array<{
    id: string | number
    name: string
    description?: string
    metadata?: Record<string, any>
  }>
  /** Summary statistics */
  summary?: {
    /** Items added */
    added?: number
    /** Items removed */
    removed?: number
    /** Items modified */
    modified?: number
    /** Items unchanged */
    unchanged?: number
  }
  /** Whether preview is truncated (showing subset) */
  isTruncated?: boolean
  /** Custom preview content */
  customContent?: ReactNode
}

/**
 * Action button configuration
 */
export interface ActionButtonConfig {
  /** Button text */
  text: string
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success'
  /** Loading state for this specific button */
  isLoading?: boolean
  /** Whether button is disabled */
  disabled?: boolean
  /** Icon to display */
  icon?: ReactNode
  /** Keyboard shortcut hint */
  shortcut?: string
  /** Additional button props */
  buttonProps?: Record<string, any>
}

/**
 * Accessibility configuration
 */
export interface AccessibilityConfig {
  /** Enhanced ARIA labels */
  enhancedAriaLabels?: boolean
  /** Focus trap enabled */
  focusTrap?: boolean
  /** Auto-focus element ID */
  autoFocusId?: string
  /** Screen reader announcements */
  announcements?: {
    onOpen?: string
    onConfirm?: string
    onCancel?: string
    onError?: string
  }
  /** Keyboard navigation overrides */
  keyboardNav?: {
    confirmKey?: string
    cancelKey?: string
    togglePreviewKey?: string
  }
}

/**
 * Modal variant types
 */
export type ModalVariant = 'danger' | 'warning' | 'info' | 'success' | 'default'

/**
 * Modal size types
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/**
 * Main enhanced confirmation modal props interface
 */
export interface EnhancedConfirmationModalProps {
  // Base modal props
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
  /** Additional CSS classes */
  className?: string

  // Basic configuration
  /** Confirmation button text */
  confirmText?: string
  /** Cancel button text */
  cancelText?: string
  /** Whether to require checkbox confirmation */
  requireConfirm?: boolean
  /** Checkbox confirmation text */
  confirmCheckboxText?: string
  /** Modal variant affecting styling and icon */
  variant?: ModalVariant
  /** Modal size */
  size?: ModalSize

  // Enhanced features
  /** Preview data for bulk operations */
  previewData?: PreviewData
  /** Whether preview is expandable/collapsible */
  expandablePreview?: boolean
  /** Default preview expanded state */
  defaultPreviewExpanded?: boolean
  /** Additional action buttons beyond confirm/cancel */
  additionalActions?: ActionButtonConfig[]
  /** Multiple confirmation buttons instead of single confirm */
  multipleActions?: ActionButtonConfig[]

  // Loading and states
  /** Whether confirm action is loading */
  isLoading?: boolean
  /** Loading text override */
  loadingText?: string
  /** Whether modal should close on confirm (default: true) */
  closeOnConfirm?: boolean
  /** Whether modal should close on backdrop click */
  closeOnBackdrop?: boolean
  /** Whether modal should close on escape key */
  closeOnEscape?: boolean

  // Progress tracking
  /** Current progress (0-100) for long operations */
  progress?: number
  /** Progress text */
  progressText?: string
  /** Whether operation can be cancelled during progress */
  cancellable?: boolean
  /** Callback for cancelling operation */
  onCancel?: () => void

  // Enhanced styling
  /** Custom icon override */
  customIcon?: ReactNode
  /** Header content override */
  headerContent?: ReactNode
  /** Footer content override */
  footerContent?: ReactNode
  /** Whether to show modal header */
  showHeader?: boolean
  /** Whether to show modal footer */
  showFooter?: boolean

  // Enhanced accessibility
  /** Accessibility configuration */
  accessibility?: AccessibilityConfig
  /** Screen reader description */
  ariaDescription?: string
  /** Screen reader label */
  ariaLabel?: string

  // Analytics and monitoring
  /** Whether to track modal interactions */
  enableAnalytics?: boolean
  /** Custom analytics event name */
  analyticsEvent?: string
  /** Analytics data */
  analyticsData?: Record<string, any>
  /** Analytics callback */
  onAnalyticsEvent?: (eventName: string, data: any) => void

  // Advanced callbacks
  /** Callback when modal opens */
  onOpen?: () => void
  /** Callback before confirm (can prevent with return false) */
  onBeforeConfirm?: () => boolean | Promise<boolean>
  /** Callback after confirm completes */
  onAfterConfirm?: () => void
  /** Callback when preview is toggled */
  onPreviewToggle?: (expanded: boolean) => void
  /** Callback for custom error handling */
  onError?: (error: Error) => void
}

/**
 * Enhanced confirmation modal hook options
 */
export interface UseEnhancedConfirmationOptions {
  /** Default modal props */
  defaultProps?: Partial<EnhancedConfirmationModalProps>
  /** Auto-close delay after success (ms) */
  autoCloseDelay?: number
  /** Whether to remember user preferences */
  rememberPreferences?: boolean
  /** Storage key for preferences */
  preferencesKey?: string
}

/**
 * Enhanced confirmation modal state
 */
export interface EnhancedConfirmationState {
  /** Whether modal is open */
  isOpen: boolean
  /** Current modal props */
  props: EnhancedConfirmationModalProps | null
  /** Whether operation is in progress */
  isLoading: boolean
  /** Current error if any */
  error: Error | null
  /** Current progress (0-100) */
  progress: number
  /** Whether preview is expanded */
  previewExpanded: boolean
}

/**
 * Enhanced confirmation modal ref interface
 */
export interface EnhancedConfirmationModalRef {
  /** Open modal with props */
  open: (props: EnhancedConfirmationModalProps) => void
  /** Close modal */
  close: () => void
  /** Update modal props while open */
  updateProps: (props: Partial<EnhancedConfirmationModalProps>) => void
  /** Trigger confirm programmatically */
  confirm: () => void
  /** Update progress */
  setProgress: (progress: number, text?: string) => void
  /** Set error state */
  setError: (error: Error | null) => void
}

/**
 * Type for modal action results
 */
export type ModalActionResult = {
  success: boolean
  error?: Error
  data?: any
}

/**
 * Type for preview item renderers
 */
export type PreviewItemRenderer = (item: PreviewData['items'][0], index: number) => ReactNode

/**
 * Export types for external use
 */
export type {
  EnhancedConfirmationModalProps as ConfirmationModalProps
}