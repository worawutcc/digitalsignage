/**
 * Enhanced Progress Bar Component Types
 * 
 * Type definitions for EnhancedProgressBar component.
 * 
 * @see EnhancedProgressBar.tsx
 * @see specs/021-user-schedule-assignment/tasks.md - T030
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

export type ProgressBarMode = 'determinate' | 'indeterminate' | 'buffer'
export type ProgressBarVariant = 'default' | 'success' | 'warning' | 'error' | 'info'
export type ProgressBarSize = 'sm' | 'md' | 'lg'
export type AnimationSpeed = 'slow' | 'normal' | 'fast'

export interface ProgressBarAction {
  label: string
  action: () => void
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'primary' | 'secondary' | 'danger'
}

export interface EnhancedProgressBarProps {
  /** Current progress value */
  value?: number
  
  /** Maximum progress value */
  max?: number
  
  /** Progress bar mode */
  mode?: ProgressBarMode
  
  /** Progress bar variant */
  variant?: ProgressBarVariant
  
  /** Size variant */
  size?: ProgressBarSize
  
  /** Show percentage text */
  showPercentage?: boolean
  
  /** Show progress value text (e.g., "5 of 10") */
  showValue?: boolean
  
  /** Label text */
  label?: string
  
  /** Description text */
  description?: string
  
  /** Enable cancellation */
  allowCancel?: boolean
  
  /** Cancel button callback */
  onCancel?: () => void
  
  /** Enable pause/resume */
  allowPause?: boolean
  
  /** Pause button callback */
  onPause?: () => void
  
  /** Resume button callback */
  onResume?: () => void
  
  /** Current pause state */
  isPaused?: boolean
  
  /** Show estimated time remaining */
  showEstimatedTime?: boolean
  
  /** Start time for ETA calculation */
  startTime?: Date
  
  /** Custom estimated time (if not auto-calculated) */
  estimatedTimeRemaining?: number
  
  /** Show current operation status */
  currentOperation?: string
  
  /** Progress animation speed */
  animationSpeed?: AnimationSpeed
  
  /** Custom CSS class */
  className?: string
  
  /** Accessibility label */
  'aria-label'?: string
  
  /** Custom actions */
  actions?: ProgressBarAction[]
  
  /** Buffer progress (for buffer mode) */
  bufferValue?: number
  
  /** Test ID for testing */
  'data-testid'?: string
}
