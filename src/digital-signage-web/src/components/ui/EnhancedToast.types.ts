/**
 * Enhanced Toast Notification System Types
 * 
 * Type definitions for EnhancedToast component.
 * 
 * @see EnhancedToast.tsx
 * @see specs/021-user-schedule-assignment/tasks.md - T029
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

import { ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'progress'
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
export type ToastActionVariant = 'primary' | 'secondary' | 'danger'

export interface ToastAction {
  label: string
  action: () => void
  variant?: ToastActionVariant
}

export interface ToastProgress {
  value: number
  max: number
  showPercentage?: boolean
}

export interface ToastContext {
  feature?: string
  userId?: string
  scheduleId?: string
  bulkOperationId?: string
}

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number | 'persistent'
  actions?: ToastAction[]
  progress?: ToastProgress
  context?: ToastContext
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
  clearToastsByContext: (context: Partial<ToastContext>) => void
}

export interface ToastProviderProps {
  children: ReactNode
  position?: ToastPosition
  maxToasts?: number
  defaultDuration?: number
}

export interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
  position: ToastPosition
}
