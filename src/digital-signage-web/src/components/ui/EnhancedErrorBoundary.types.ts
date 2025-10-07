/**
 * Enhanced Error Boundary Component Types
 * 
 * Type definitions for EnhancedErrorBoundary component.
 * 
 * @see EnhancedErrorBoundary.tsx
 * @see specs/021-user-schedule-assignment/tasks.md - T028
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

import { ReactNode } from 'react'
import type { ErrorInfo } from 'react'

export interface RecoveryAction {
  label: string
  action: () => void
  icon?: React.ComponentType<{ className?: string }>
}

export interface UserContext {
  action?: string
  userId?: string
  scheduleId?: string
  bulkOperationId?: string
}

export interface EnhancedErrorBoundaryProps {
  children: ReactNode
  featureName: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  
  /** Enable enhanced error recovery suggestions */
  showRecoverySuggestions?: boolean
  
  /** Show error reporting option */
  enableErrorReporting?: boolean
  
  /** Custom recovery actions */
  recoveryActions?: RecoveryAction[]
  
  /** Context about what the user was doing */
  userContext?: UserContext
}

export interface ErrorCategory {
  type: 'network' | 'validation' | 'permission' | 'not-found' | 'server' | 'unknown'
  title: string
  description: string
  suggestions: string[]
  icon: React.ComponentType<{ className?: string }>
}
