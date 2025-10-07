'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { cn } from '@/lib/utils'
import { ConfirmationModalProps } from './ConfirmationModal.types'

const variantConfig = {
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    buttonVariant: 'default' as const,
  },
  danger: {
    icon: XCircle,
    iconColor: 'text-red-600',
    buttonVariant: 'destructive' as const,
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    buttonVariant: 'default' as const,
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    buttonVariant: 'default' as const,
  },
}

/**
 * ConfirmationModal Component
 * 
 * A reusable modal for confirming user actions with optional checkbox confirmation.
 * Supports keyboard shortcuts (ESC to cancel, Enter to confirm when enabled).
 * 
 * @example
 * ```tsx
 * <ConfirmationModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Schedule"
 *   message="Are you sure you want to delete this schedule? This action cannot be undone."
 *   variant="danger"
 *   requireConfirm
 *   confirmText="Delete"
 * />
 * ```
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  requireConfirm = false,
  confirmCheckboxLabel = 'I understand the consequences',
  variant = 'warning',
  isLoading = false,
  className,
}: ConfirmationModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false)
  
  const config = variantConfig[variant]
  const Icon = config.icon
  
  // Reset checkbox when modal opens/closes
  const handleClose = () => {
    setIsConfirmed(false)
    onClose()
  }
  
  // Handle confirm button click
  const handleConfirm = () => {
    if (requireConfirm && !isConfirmed) {
      return
    }
    onConfirm()
    setIsConfirmed(false)
  }
  
  // Handle Enter key for confirmation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (!requireConfirm || isConfirmed) && !isLoading) {
      handleConfirm()
    }
  }
  
  // Determine if confirm button should be disabled
  const isConfirmDisabled = isLoading || (requireConfirm && !isConfirmed)
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!isLoading}
      {...(className && { className })}
    >
      <div
        className="space-y-4"
        onKeyDown={handleKeyDown}
        role="presentation"
      >
        {/* Icon and Message */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <Icon className={cn('h-6 w-6', config.iconColor)} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {message}
            </p>
          </div>
        </div>
        
        {/* Checkbox Confirmation (if required) */}
        {requireConfirm && (
          <div className="flex items-start gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <input
              type="checkbox"
              id="confirm-checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              disabled={isLoading}
              data-testid="acknowledge-checkbox"
            />
            <label
              htmlFor="confirm-checkbox"
              className="cursor-pointer text-sm text-gray-700 dark:text-gray-300"
            >
              {confirmCheckboxLabel}
            </label>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            data-testid="cancel-button"
          >
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            loading={isLoading}
            data-testid="confirm-button"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmationModal
