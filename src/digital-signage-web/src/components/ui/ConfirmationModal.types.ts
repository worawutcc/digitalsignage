/**
 * ConfirmationModal Component Types
 * 
 * Type definitions for ConfirmationModal component.
 * 
 * @see ConfirmationModal.tsx
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

export type ConfirmationModalVariant = 'warning' | 'danger' | 'info' | 'success'

export interface ConfirmationModalProps {
  /**
   * Whether the modal is visible
   */
  isOpen: boolean
  
  /**
   * Function to call when modal should be closed
   */
  onClose: () => void
  
  /**
   * Function to call when user confirms action
   */
  onConfirm: () => void
  
  /**
   * Modal title
   */
  title: string
  
  /**
   * Modal message/description
   */
  message: string
  
  /**
   * Confirmation button text
   * @default "Confirm"
   */
  confirmText?: string
  
  /**
   * Cancel button text
   * @default "Cancel"
   */
  cancelText?: string
  
  /**
   * Whether to require checkbox confirmation before enabling confirm button
   * @default false
   */
  requireConfirm?: boolean
  
  /**
   * Checkbox label text when requireConfirm is true
   * @default "I understand the consequences"
   */
  confirmCheckboxLabel?: string
  
  /**
   * Modal variant/severity
   * @default "warning"
   */
  variant?: ConfirmationModalVariant
  
  /**
   * Whether confirm action is loading
   * @default false
   */
  isLoading?: boolean
  
  /**
   * Custom CSS class for modal content
   */
  className?: string
}
