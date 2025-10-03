import { Device } from '@/types/api'

/**
 * Available bulk operations for devices
 */
export type BulkOperation = 
  | 'approve' 
  | 'reject' 
  | 'delete' 
  | 'restart' 
  | 'shutdown' 
  | 'updateConfig' 
  | 'assignUser'
  | 'removeUser'
  | 'moveLocation'
  | 'changeStatus'

/**
 * Bulk operation configuration with metadata
 */
export interface BulkOperationConfig {
  /** Unique identifier for the operation */
  id: BulkOperation
  /** Display label for the operation */
  label: string
  /** Description of what the operation does */
  description: string
  /** Icon name from Lucide React */
  icon: string
  /** Visual style variant */
  variant: 'default' | 'success' | 'warning' | 'destructive'
  /** Whether operation requires additional confirmation */
  requiresConfirmation: boolean
  /** Whether operation requires additional input */
  requiresInput?: boolean
  /** Input field configuration if required */
  inputConfig?: {
    type: 'text' | 'select' | 'textarea'
    label: string
    placeholder?: string
    options?: Array<{ value: string; label: string }>
    required?: boolean
  }
}

/**
 * Bulk operation execution context
 */
export interface BulkOperationContext {
  /** The operation being performed */
  operation: BulkOperation
  /** Devices selected for the operation */
  selectedDevices: Device[]
  /** Additional input data if required */
  inputData?: Record<string, any>
  /** Operation metadata */
  metadata?: {
    reason?: string
    scheduledAt?: Date
    priority?: 'low' | 'normal' | 'high'
  }
}

/**
 * Bulk operation progress tracking
 */
export interface BulkOperationProgress {
  /** Current operation being performed */
  operation: BulkOperation
  /** Total number of devices */
  total: number
  /** Number of completed operations */
  completed: number
  /** Number of failed operations */
  failed: number
  /** Number of operations in progress */
  inProgress: number
  /** Detailed status for each device */
  deviceStatus: Array<{
    deviceId: string
    deviceName: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    error?: string
    completedAt?: Date
  }>
  /** Overall operation status */
  status: 'preparing' | 'running' | 'completed' | 'failed' | 'cancelled'
  /** Start time */
  startedAt?: Date
  /** Completion time */
  completedAt?: Date
  /** Estimated completion time */
  estimatedCompletion?: Date
}

/**
 * Props for BulkOperationsModal component
 */
export interface BulkOperationsModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Function to close the modal */
  onClose: () => void
  /** Devices selected for bulk operations */
  selectedDevices: Device[]
  /** Available operations for the selected devices */
  availableOperations?: BulkOperation[]
  /** Callback when operation is initiated */
  onOperationStart: (context: BulkOperationContext) => Promise<void>
  /** Current operation progress (if any) */
  progress?: BulkOperationProgress
  /** Whether operations are currently running */
  isExecuting?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  /** The operation that was performed */
  operation: BulkOperation
  /** Total number of devices processed */
  totalDevices: number
  /** Number of successful operations */
  successCount: number
  /** Number of failed operations */
  failureCount: number
  /** Detailed results for each device */
  results: Array<{
    deviceId: string
    deviceName: string
    success: boolean
    error?: string
    data?: any
  }>
  /** Operation duration in milliseconds */
  duration: number
  /** Operation completion time */
  completedAt: Date
}