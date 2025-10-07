/**
 * Pending Registrations Page Component Types
 * 
 * Type definitions for PendingRegistrationsPage component.
 * 
 * @see PendingRegistrationsPage.tsx
 * @see CODE-REVIEW-UI-REQUIREMENTS.md - Device Registration Admin UI Requirements
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

import { PendingRegistration, ApprovalRequest } from '../types/deviceRegistration'

export type UserMatchFilter = 'all' | 'matched' | 'unmatched'

export interface PendingRegistrationsPageState {
  selectedForApproval: PendingRegistration | null
  selectedForRejection: PendingRegistration | null
  selectedRegistrations: string[]
  showBulkApproval: boolean
  searchTerm: string
  filterByUserMatch: UserMatchFilter
}
