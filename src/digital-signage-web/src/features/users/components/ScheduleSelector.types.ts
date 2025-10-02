/**
 * ScheduleSelector Component Types
 * 
 * CRITICAL: Modal for selecting schedules with REPLACE warning.
 * When user already has schedules, shows warning before replacing.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 * @see specs/020-phase-1/tasks.md - T011 Requirements
 */

export interface Schedule {
  id: number
  name: string
  description?: string
  startDate: string
  endDate: string
  isActive: boolean
}

export interface ScheduleSelectorProps {
  /** Whether modal is open */
  isOpen: boolean
  
  /** Available schedules to select from */
  availableSchedules: Schedule[]
  
  /** Currently selected schedule IDs */
  selectedScheduleIds: number[]
  
  /** Whether user currently has schedules (shows REPLACE warning) */
  hasExistingSchedules: boolean
  
  /** Loading state for fetching schedules */
  isLoading?: boolean
  
  /** Loading state for submit action */
  isSubmitting?: boolean
  
  /** Callback when selection changes */
  onSelectionChange: (selectedIds: number[]) => void
  
  /** Callback when confirm button clicked */
  onConfirm: () => void
  
  /** Callback when cancel/close */
  onCancel: () => void
  
  /** Optional CSS classes */
  className?: string
}

export interface ScheduleSelectorState {
  /** Search query for filtering schedules */
  searchQuery: string
  
  /** Whether user acknowledged the REPLACE warning */
  hasAcknowledgedWarning: boolean
}
