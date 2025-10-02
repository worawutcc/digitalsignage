/**
 * AssignedSchedulesList Component Types
 * 
 * Displays list of schedules assigned to a user.
 * Shows schedule details and provides remove functionality.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 */

export interface Schedule {
  id: number
  name: string
  description?: string
  startDate: string
  endDate: string
  isActive: boolean
  createdBy: string
  createdAt: string
}

export interface AssignedSchedulesListProps {
  /** Array of assigned schedules */
  schedules: Schedule[]
  
  /** Loading state */
  isLoading?: boolean
  
  /** Callback when remove all is clicked */
  onRemoveAll?: () => void
  
  /** Whether remove button should be disabled */
  disableRemove?: boolean
  
  /** Optional CSS classes */
  className?: string
}
