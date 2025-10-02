/**
 * AssignedUsersList Component Types
 * 
 * Shows list of users assigned to a schedule.
 * Displays user cards with pagination support.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 * @see specs/020-phase-1/tasks.md - T013 Requirements
 */

export interface AssignedUser {
  id: number
  email: string
  name: string
  role: string
  isDefaultSchedule: boolean
}

export interface AssignedUsersListProps {
  /** Schedule ID to show users for */
  scheduleId: number
  
  /** Array of assigned users */
  users: AssignedUser[]
  
  /** Loading state */
  isLoading?: boolean
  
  /** Current page number (1-indexed) */
  currentPage?: number
  
  /** Total number of pages */
  totalPages?: number
  
  /** Items per page */
  pageSize?: number
  
  /** Total count of users */
  totalCount?: number
  
  /** Callback when page changes */
  onPageChange?: (page: number) => void
  
  /** Callback when remove user clicked */
  onRemoveUser?: (userId: number) => void
  
  /** Optional CSS classes */
  className?: string
}
