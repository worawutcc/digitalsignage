/**
 * UserScheduleAssignment Component Types
 * 
 * Main component for managing user schedule assignments.
 * Allows admins to view, assign, and remove schedules for a specific user.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 */

import { UserSchedule } from '@/features/users/types/userSchedule'

export interface UserScheduleAssignmentProps {
  /** User ID for which to manage schedules */
  userId: number
  
  /** User display information */
  user: {
    id: number
    name: string
    email: string
    role: string
  }
  
  /** Optional callback when schedules are updated */
  onSchedulesUpdated?: () => void
  
  /** Optional CSS classes */
  className?: string
}

export interface UserScheduleAssignmentState {
  /** Whether the assign modal is open */
  isAssignModalOpen: boolean
  
  /** Whether the remove confirmation modal is open */
  isRemoveModalOpen: boolean
  
  /** Selected schedule IDs for assignment */
  selectedScheduleIds: number[]
}
