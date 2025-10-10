/**
 * Modal Component Types
 * 
 * Type definitions for Modal component.
 * 
 * @see Modal.tsx
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

import React from 'react'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string | React.ReactNode
  children: React.ReactNode
  size?: ModalSize
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}
