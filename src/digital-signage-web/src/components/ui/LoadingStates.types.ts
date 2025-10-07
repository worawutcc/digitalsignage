/**
 * Loading States Component Types
 * 
 * Type definitions for LoadingStates components (Spinner, LoadingOverlay, etc.).
 * 
 * @see LoadingStates.tsx
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

export interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

export interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  fullScreen?: boolean
  className?: string
}

export interface LoadingCardProps {
  className?: string
}

export interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  onClick?: () => void
  className?: string
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}
