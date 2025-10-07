import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModalProps, ModalSize } from './Modal.types'

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

/**
 * Modal component with overlay, animations, and accessibility features
 * 
 * @param isOpen - Whether the modal is visible
 * @param onClose - Function to call when modal should be closed
 * @param title - Optional title displayed in modal header
 * @param children - Modal content
 * @param size - Modal size variant
 * @param showCloseButton - Whether to show the X close button
 * @param closeOnOverlayClick - Whether clicking overlay closes the modal
 * @param className - Additional CSS classes
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose()
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          'relative w-full animate-in fade-in-0 zoom-in-95 duration-300',
          sizeClasses[size],
          'mx-4 my-8 max-h-[calc(100vh-4rem)] overflow-hidden',
          'rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 shadow-2xl',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-t-xl">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-auto max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-900">
          {children}
        </div>
      </div>
    </div>
  )

  // Render modal in portal to avoid z-index issues
  return createPortal(modalContent, document.body)
}

export default Modal