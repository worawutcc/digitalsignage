/**
 * Enhanced Error Boundary Components
 * 
 * Enhanced error boundary components specifically designed for user schedule assignment
 * and bulk operations. Provides specialized error recovery mechanisms and user guidance.
 * 
 * @see specs/021-user-schedule-assignment/tasks.md - T028
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

'use client'

import React, { ReactNode } from 'react'
import { AlertTriangle, RefreshCw, UserX, Calendar, Database, Wifi, Shield, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { ErrorBoundary, FeatureErrorBoundary } from './ErrorBoundary'
import { Button } from './Button'
import type { ErrorInfo } from 'react'

export interface EnhancedErrorBoundaryProps {
  children: ReactNode
  featureName: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  
  // Enhanced props
  /** Enable enhanced error recovery suggestions */
  showRecoverySuggestions?: boolean
  /** Show error reporting option */
  enableErrorReporting?: boolean
  /** Custom recovery actions */
  recoveryActions?: Array<{
    label: string
    action: () => void
    icon?: React.ComponentType<{ className?: string }>
  }>
  /** Context about what the user was doing */
  userContext?: {
    action?: string
    userId?: string
    scheduleId?: string
    bulkOperationId?: string
  }
}

/**
 * Enhanced Error Boundary for User Schedule Assignment
 * 
 * Provides specialized error handling with context-aware recovery suggestions
 * and enhanced user guidance for bulk operations and schedule assignments.
 */
export function EnhancedErrorBoundary({
  children,
  featureName,
  onError,
  showRecoverySuggestions = true,
  enableErrorReporting = true,
  recoveryActions = [],
  userContext,
}: EnhancedErrorBoundaryProps) {
  const handleEnhancedError = (error: Error, errorInfo: ErrorInfo) => {
    // Enhanced error logging with user context
    console.error(`Enhanced Error in ${featureName}:`, {
      error: error.message,
      stack: error.stack,
      userContext,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    })

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo)
    }

    // In production, send enhanced error report:
    // sendErrorReport({
    //   error,
    //   errorInfo,
    //   featureName,
    //   userContext,
    //   timestamp: new Date().toISOString(),
    // })
  }

  return (
    <ErrorBoundary
      boundaryName={`Enhanced-${featureName}`}
      onError={handleEnhancedError}
      fallback={(error, reset) => (
        <EnhancedErrorFallback
          error={error}
          onReset={reset}
          featureName={featureName}
          showRecoverySuggestions={showRecoverySuggestions}
          enableErrorReporting={enableErrorReporting}
          recoveryActions={recoveryActions}
          userContext={userContext || { action: '', userId: '', scheduleId: '', bulkOperationId: '' }}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Bulk Operations Error Boundary
 * Specialized for handling bulk operation failures with detailed recovery options
 */
export function BulkOperationsErrorBoundary({
  children,
  operationType,
  selectedItems,
  onRetryBulkOperation,
}: {
  children: ReactNode
  operationType: string
  selectedItems?: string[]
  onRetryBulkOperation?: () => void
}) {
  return (
    <EnhancedErrorBoundary
      featureName="Bulk Operations"
      showRecoverySuggestions={true}
      enableErrorReporting={true}
      userContext={{
        action: operationType,
        bulkOperationId: `${operationType}-${Date.now()}`,
      }}
      recoveryActions={[
        ...(onRetryBulkOperation ? [{
          label: 'Retry Bulk Operation',
          action: onRetryBulkOperation,
          icon: RefreshCw,
        }] : []),
        {
          label: 'Process Individually',
          action: () => {
            console.log('Switch to individual processing mode')
            // Implementation would switch to individual item processing
          },
          icon: UserX,
        },
      ]}
    >
      {children}
    </EnhancedErrorBoundary>
  )
}

/**
 * Schedule Assignment Error Boundary
 * Specialized for schedule assignment operations
 */
export function ScheduleAssignmentErrorBoundary({
  children,
  userId,
  scheduleId,
}: {
  children: ReactNode
  userId?: string
  scheduleId?: string
}) {
  return (
    <EnhancedErrorBoundary
      featureName="Schedule Assignment"
      showRecoverySuggestions={true}
      enableErrorReporting={true}
      userContext={{
        action: 'schedule-assignment',
        ...(userId && { userId }),
        ...(scheduleId && { scheduleId }),
      }}
      recoveryActions={[
        {
          label: 'Refresh Data',
          action: () => {
            window.location.reload()
          },
          icon: RefreshCw,
        },
        {
          label: 'Go to Users',
          action: () => {
            window.location.href = '/users'
          },
          icon: UserX,
        },
        {
          label: 'Go to Schedules',
          action: () => {
            window.location.href = '/schedules'
          },
          icon: Calendar,
        },
      ]}
    >
      {children}
    </EnhancedErrorBoundary>
  )
}

/**
 * Enhanced Error Fallback UI
 */
interface EnhancedErrorFallbackProps {
  error: Error
  onReset: () => void
  featureName: string
  showRecoverySuggestions: boolean
  enableErrorReporting: boolean
  recoveryActions: Array<{
    label: string
    action: () => void
    icon?: React.ComponentType<{ className?: string }>
  }>
  userContext?: {
    action?: string
    userId?: string
    scheduleId?: string
    bulkOperationId?: string
  }
}

function EnhancedErrorFallback({
  error,
  onReset,
  featureName,
  showRecoverySuggestions,
  enableErrorReporting,
  recoveryActions,
  userContext,
}: EnhancedErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)
  const [reportSent, setReportSent] = React.useState(false)

  const errorType = getErrorType(error)
  const suggestions = showRecoverySuggestions ? getRecoverySuggestions(errorType, userContext) : []

  const handleSendReport = async () => {
    try {
      // Simulate sending error report
      await new Promise(resolve => setTimeout(resolve, 1000))
      setReportSent(true)
      console.log('Error report sent:', {
        error: error.message,
        userContext,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Failed to send error report:', err)
    }
  }

  return (
    <div 
      role="alert"
      className="flex min-h-[400px] w-full flex-col items-center justify-center gap-6 rounded-lg border-2 border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-950/20"
      data-testid="enhanced-error-boundary-fallback"
    >
      {/* Error Icon */}
      <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
        {getErrorIcon(errorType)}
      </div>

      {/* Error Message */}
      <div className="space-y-2 text-center max-w-2xl">
        <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">
          {featureName} Error
        </h2>
        <p className="text-red-700 dark:text-red-300">
          {getErrorMessage(errorType, userContext)}
        </p>
        
        {/* Context Information */}
        {userContext && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-sm text-red-800 dark:text-red-200">
            {userContext.action && (
              <div>Action: <span className="font-medium">{userContext.action}</span></div>
            )}
            {userContext.userId && (
              <div>User ID: <span className="font-medium">{userContext.userId}</span></div>
            )}
            {userContext.scheduleId && (
              <div>Schedule ID: <span className="font-medium">{userContext.scheduleId}</span></div>
            )}
          </div>
        )}

        {/* Recovery Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              Suggested Solutions:
            </h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={onReset}
          variant="default"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>

        {recoveryActions.map((action, index) => {
          const Icon = action.icon || RefreshCw
          return (
            <Button
              key={index}
              onClick={action.action}
              variant="outline"
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </Button>
          )
        })}

        {enableErrorReporting && (
          <Button
            onClick={handleSendReport}
            variant="outline"
            disabled={reportSent}
            className="gap-2"
          >
            {reportSent ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Report Sent
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                Report Issue
              </>
            )}
          </Button>
        )}
      </div>

      {/* Technical Details Toggle */}
      <div className="mt-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 flex items-center gap-1"
        >
          {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {showDetails ? 'Hide' : 'Show'} Technical Details
        </button>
        
        {showDetails && (
          <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-left text-xs font-mono max-w-2xl overflow-auto">
            <div className="text-gray-900 dark:text-gray-100">
              <strong>Error:</strong> {error.message}
            </div>
            {userContext && (
              <div className="mt-2 text-gray-700 dark:text-gray-300">
                <strong>Context:</strong> {JSON.stringify(userContext, null, 2)}
              </div>
            )}
            <div className="mt-2 text-gray-600 dark:text-gray-400">
              <strong>Timestamp:</strong> {new Date().toISOString()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions
function getErrorType(error: Error): 'network' | 'permission' | 'validation' | 'bulk' | 'unknown' {
  const message = error.message.toLowerCase()
  
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return 'network'
  }
  if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
    return 'permission'
  }
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return 'validation'
  }
  if (message.includes('bulk') || message.includes('batch')) {
    return 'bulk'
  }
  
  return 'unknown'
}

function getErrorIcon(errorType: string) {
  const iconClass = "h-12 w-12 text-red-600 dark:text-red-400"
  
  switch (errorType) {
    case 'network':
      return <Wifi className={iconClass} />
    case 'permission':
      return <Shield className={iconClass} />
    case 'validation':
      return <AlertCircle className={iconClass} />
    case 'bulk':
      return <Database className={iconClass} />
    default:
      return <AlertTriangle className={iconClass} />
  }
}

function getErrorMessage(errorType: string, userContext?: { action?: string }): string {
  const action = userContext?.action || 'operation'
  
  switch (errorType) {
    case 'network':
      return `Unable to complete ${action} due to network connectivity issues. Please check your connection and try again.`
    case 'permission':
      return `You don't have permission to perform this ${action}. Please contact your administrator.`
    case 'validation':
      return `The ${action} failed due to invalid data. Please check your input and try again.`
    case 'bulk':
      return `The bulk ${action} encountered an error. Some items may have been processed successfully.`
    default:
      return `An unexpected error occurred while performing ${action}. Our team has been notified.`
  }
}

function getRecoverySuggestions(errorType: string, userContext?: { action?: string }): string[] {
  switch (errorType) {
    case 'network':
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Wait a moment and try again',
        'If the problem persists, contact support'
      ]
    case 'permission':
      return [
        'Contact your system administrator',
        'Check if your session has expired',
        'Try logging out and back in',
        'Verify you have the correct role permissions'
      ]
    case 'validation':
      return [
        'Check that all required fields are filled',
        'Verify the data format is correct',
        'Ensure dates are valid and in the future',
        'Check for any conflicting assignments'
      ]
    case 'bulk':
      return [
        'Try processing items individually',
        'Reduce the number of items in the batch',
        'Check if some items were already processed',
        'Refresh the page to see current state'
      ]
    default:
      return [
        'Try refreshing the page',
        'Clear your browser cache',
        'Try a different browser',
        'Contact support if the issue continues'
      ]
  }
}

