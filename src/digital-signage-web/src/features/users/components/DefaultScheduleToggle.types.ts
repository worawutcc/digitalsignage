/**
 * DefaultScheduleToggle Component Types
 * 
 * Inline toggle for setting/unsetting a schedule as default.
 * Shows "Default" badge when active.
 * 
 * Business Rule: Only ONE schedule can be default at a time.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 * @see specs/020-phase-1/tasks.md - T012 Requirements
 */

export interface DefaultScheduleToggleProps {
  /** Schedule ID */
  scheduleId: number
  
  /** Whether this schedule is currently the default */
  isDefault: boolean
  
  /** Loading state for mutation */
  isLoading?: boolean
  
  /** Callback when toggle clicked */
  onToggle: (scheduleId: number, setAsDefault: boolean) => void
  
  /** Optional CSS classes */
  className?: string
}
