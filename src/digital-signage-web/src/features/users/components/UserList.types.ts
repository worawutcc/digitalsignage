/**
 * User List Component Types
 * 
 * Type definitions for UserList component.
 * 
 * @see UserList.tsx
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

import { User } from '@/types/api'

export type UserStatus = 'active' | 'inactive' | 'suspended'
export type UserListViewMode = 'table' | 'grid'

export interface UserListProps {
  users?: User[]
  loading?: boolean
  onUserSelect?: (user: User) => void
  onUserEdit?: (user: User) => void
  onUserDelete?: (user: User) => void
  onBulkAction?: (action: string, userIds: string[]) => void
  className?: string
}

export interface UserListFilters {
  search: string
  role?: string[]
  status?: UserStatus[]
  department?: string[]
}
