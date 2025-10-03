'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  BulkOperationsModalProps, 
  BulkOperation, 
  BulkOperationConfig, 
  BulkOperationContext 
} from './BulkOperationsModal.types'
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Settings,
  Trash2,
  Power,
  PowerOff,
  UserPlus,
  UserMinus,
  MapPin,
  RotateCcw,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Bulk operation configurations
 */
const BULK_OPERATIONS: Record<BulkOperation, BulkOperationConfig> = {
  approve: {
    id: 'approve',
    label: 'Approve Devices',
    description: 'Approve selected devices for use in the system',
    icon: 'CheckCircle',
    variant: 'success',
    requiresConfirmation: true
  },
  reject: {
    id: 'reject',
    label: 'Reject Devices',
    description: 'Reject selected devices and remove from approval queue',
    icon: 'XCircle',
    variant: 'destructive',
    requiresConfirmation: true,
    requiresInput: true,
    inputConfig: {
      type: 'textarea',
      label: 'Rejection Reason',
      placeholder: 'Enter reason for rejection...',
      required: true
    }
  },
  delete: {
    id: 'delete',
    label: 'Delete Devices',
    description: 'Permanently delete selected devices from the system',
    icon: 'Trash2',
    variant: 'destructive',
    requiresConfirmation: true
  },
  restart: {
    id: 'restart',
    label: 'Restart Devices',
    description: 'Send restart command to selected devices',
    icon: 'RotateCcw',
    variant: 'warning',
    requiresConfirmation: true
  },
  shutdown: {
    id: 'shutdown',
    label: 'Shutdown Devices',
    description: 'Send shutdown command to selected devices',
    icon: 'PowerOff',
    variant: 'destructive',
    requiresConfirmation: true
  },
  updateConfig: {
    id: 'updateConfig',
    label: 'Update Configuration',
    description: 'Apply configuration updates to selected devices',
    icon: 'Settings',
    variant: 'default',
    requiresConfirmation: true
  },
  assignUser: {
    id: 'assignUser',
    label: 'Assign User',
    description: 'Assign a user to selected devices',
    icon: 'UserPlus',
    variant: 'default',
    requiresConfirmation: true,
    requiresInput: true,
    inputConfig: {
      type: 'select',
      label: 'Select User',
      placeholder: 'Choose user to assign...',
      required: true,
      options: [] // Will be populated dynamically
    }
  },
  removeUser: {
    id: 'removeUser',
    label: 'Remove User Assignment',
    description: 'Remove user assignments from selected devices',
    icon: 'UserMinus',
    variant: 'warning',
    requiresConfirmation: true
  },
  moveLocation: {
    id: 'moveLocation',
    label: 'Move Location',
    description: 'Change location for selected devices',
    icon: 'MapPin',
    variant: 'default',
    requiresConfirmation: true,
    requiresInput: true,
    inputConfig: {
      type: 'select',
      label: 'New Location',
      placeholder: 'Choose new location...',
      required: true,
      options: [] // Will be populated dynamically
    }
  },
  changeStatus: {
    id: 'changeStatus',
    label: 'Change Status',
    description: 'Update status for selected devices',
    icon: 'Settings',
    variant: 'default',
    requiresConfirmation: true,
    requiresInput: true,
    inputConfig: {
      type: 'select',
      label: 'New Status',
      placeholder: 'Choose new status...',
      required: true,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Maintenance', label: 'Maintenance' },
        { value: 'Offline', label: 'Offline' }
      ]
    }
  }
}

/**
 * Get icon component by name
 */
const getIcon = (iconName: string) => {
  const icons = {
    CheckCircle,
    XCircle,
    Trash2,
    RotateCcw,
    PowerOff,
    Settings,
    UserPlus,
    UserMinus,
    MapPin,
    Power
  }
  return icons[iconName as keyof typeof icons] || Settings
}

/**
 * Bulk Operations Modal component
 * Handles batch operations on multiple devices
 */
export function BulkOperationsModal({
  isOpen,
  onClose,
  selectedDevices,
  availableOperations,
  onOperationStart,
  progress,
  isExecuting = false,
  className
}: BulkOperationsModalProps) {
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm()

  // Filter available operations
  const operations = availableOperations 
    ? availableOperations.map(op => BULK_OPERATIONS[op]).filter(Boolean)
    : Object.values(BULK_OPERATIONS)

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedOperation(null)
      setShowConfirmation(false)
      setLoading(false)
      reset()
    }
  }, [isOpen, reset])

  const handleOperationSelect = (operation: BulkOperation) => {
    setSelectedOperation(operation)
    if (BULK_OPERATIONS[operation].requiresConfirmation) {
      setShowConfirmation(true)
    }
  }

  const handleConfirm = handleSubmit(async (data) => {
    if (!selectedOperation) return

    setLoading(true)
    
    try {
      const context: BulkOperationContext = {
        operation: selectedOperation,
        selectedDevices,
        inputData: data,
        metadata: {
          reason: data.reason,
          priority: 'normal'
        }
      }

      await onOperationStart(context)
      
      // Don't close modal if we're showing progress
      if (!progress) {
        onClose()
      }
    } catch (error) {
      console.error('Bulk operation failed:', error)
    } finally {
      setLoading(false)
    }
  })

  const handleCancel = () => {
    if (showConfirmation) {
      setShowConfirmation(false)
      setSelectedOperation(null)
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  const operationConfig = selectedOperation ? BULK_OPERATIONS[selectedOperation] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={!isExecuting ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className={cn(
        'relative w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {progress ? 'Operation Progress' : 'Bulk Operations'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {progress 
                ? `${progress.operation} operation in progress`
                : `${selectedDevices.length} device${selectedDevices.length === 1 ? '' : 's'} selected`
              }
            </p>
          </div>
          {!isExecuting && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {progress ? (
            // Progress View
            <div className="space-y-6">
              {/* Overall Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Overall Progress
                  </span>
                  <span className="text-sm text-gray-600">
                    {progress.completed + progress.failed} of {progress.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((progress.completed + progress.failed) / progress.total) * 100}%` 
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{progress.completed} completed</span>
                  <span>{progress.failed} failed</span>
                  <span>{progress.inProgress} in progress</span>
                </div>
              </div>

              {/* Device Status List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Device Status</h4>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {progress.deviceStatus.map((device) => (
                    <div key={device.deviceId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-900">{device.deviceName}</span>
                      <div className="flex items-center gap-2">
                        {device.status === 'pending' && (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                        {device.status === 'processing' && (
                          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                        )}
                        {device.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {device.status === 'failed' && (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-xs text-gray-500 capitalize">
                          {device.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : showConfirmation && operationConfig ? (
            // Confirmation View
            <form onSubmit={handleConfirm} className="space-y-6">
              {/* Operation Details */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                {(() => {
                  const IconComponent = getIcon(operationConfig.icon)
                  return (
                    <div className={cn(
                      'p-2 rounded-lg',
                      operationConfig.variant === 'success' && 'bg-green-100 text-green-600',
                      operationConfig.variant === 'warning' && 'bg-yellow-100 text-yellow-600',
                      operationConfig.variant === 'destructive' && 'bg-red-100 text-red-600',
                      operationConfig.variant === 'default' && 'bg-blue-100 text-blue-600'
                    )}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                  )
                })()}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{operationConfig.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{operationConfig.description}</p>
                </div>
              </div>

              {/* Selected Devices */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Selected Devices ({selectedDevices.length})
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedDevices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <span>{device.name}</span>
                      <span className="text-gray-500">{device.model}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Input */}
              {operationConfig.requiresInput && operationConfig.inputConfig && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {operationConfig.inputConfig.label}
                    {operationConfig.inputConfig.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  
                  {operationConfig.inputConfig.type === 'textarea' ? (
                    <textarea
                      {...register('reason', { 
                        required: operationConfig.inputConfig.required ? 'This field is required' : false
                      })}
                      placeholder={operationConfig.inputConfig.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  ) : operationConfig.inputConfig.type === 'select' ? (
                    <select
                      {...register('inputValue', { 
                        required: operationConfig.inputConfig.required ? 'This field is required' : false
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">{operationConfig.inputConfig.placeholder}</option>
                      {operationConfig.inputConfig.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      {...register('inputValue', { 
                        required: operationConfig.inputConfig.required ? 'This field is required' : false
                      })}
                      placeholder={operationConfig.inputConfig.placeholder}
                    />
                  )}
                  
                  {errors.reason && (
                    <p className="text-sm text-red-600">This field is required</p>
                  )}
                  {errors.inputValue && (
                    <p className="text-sm text-red-600">This field is required</p>
                  )}
                </div>
              )}

              {/* Warning for destructive operations */}
              {operationConfig.variant === 'destructive' && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Warning</p>
                    <p className="text-sm text-red-700 mt-1">
                      This action cannot be undone. Please confirm you want to proceed.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={operationConfig.variant === 'destructive' ? 'destructive' : 'default'}
                  disabled={loading}
                  loading={loading}
                >
                  {loading ? 'Processing...' : `Confirm ${operationConfig.label}`}
                </Button>
              </div>
            </form>
          ) : (
            // Operation Selection View
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Choose an operation to perform on the selected devices:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {operations.map((operation) => {
                  const IconComponent = getIcon(operation.icon)
                  return (
                    <button
                      key={operation.id}
                      onClick={() => handleOperationSelect(operation.id)}
                      className={cn(
                        'flex items-start gap-3 p-4 text-left border rounded-lg transition-all hover:shadow-md',
                        operation.variant === 'destructive' 
                          ? 'border-red-200 hover:border-red-300 hover:bg-red-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <div className={cn(
                        'p-2 rounded-lg',
                        operation.variant === 'success' && 'bg-green-100 text-green-600',
                        operation.variant === 'warning' && 'bg-yellow-100 text-yellow-600',
                        operation.variant === 'destructive' && 'bg-red-100 text-red-600',
                        operation.variant === 'default' && 'bg-blue-100 text-blue-600'
                      )}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{operation.label}</h3>
                        <p className="text-xs text-gray-600 mt-1">{operation.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}