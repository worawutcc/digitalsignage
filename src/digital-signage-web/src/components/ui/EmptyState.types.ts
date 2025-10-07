/**
 * EmptyState Component Types
 * 
 * Type definitions for EmptyState component.
 * 
 * @see EmptyState.tsx
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

import { LucideIcon } from 'lucide-react'

export interface EmptyStateProps {
  /**
   * Icon component to display
   */
  icon: LucideIcon
  
  /**
   * Title text
   */
  title: string
  
  /**
   * Optional description text
   */
  description?: string
  
  /**
   * Optional action button
   */
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
  
  /**
   * Additional CSS classes
   */
  className?: string
}
