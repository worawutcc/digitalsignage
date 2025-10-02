/**
 * AssignedUsersList Component Tests (T013)
 * 
 * Contract tests following TDD principles.
 * Tests define the expected behavior - implementation comes after.
 * 
 * These tests SHOULD FAIL initially (on assertions, not compilation).
 * 
 * @see copilot-instructions-web.md - Testing Standards
 * @see specs/020-phase-1/tasks.md - T013 Requirements
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssignedUsersList } from '@/features/schedules/components/AssignedUsersList'
import { AssignedUser } from '@/features/schedules/components/AssignedUsersList.types'

describe('AssignedUsersList', () => {
  // Mock data
  const mockUsers: AssignedUser[] = [
    {
      id: 1,
      email: 'john@test.com',
      name: 'John Doe',
      role: 'Content Manager',
      isDefaultSchedule: true,
    },
    {
      id: 2,
      email: 'jane@test.com',
      name: 'Jane Smith',
      role: 'Admin',
      isDefaultSchedule: false,
    },
    {
      id: 3,
      email: 'bob@test.com',
      name: 'Bob Wilson',
      role: 'Viewer',
      isDefaultSchedule: false,
    },
  ]

  const defaultProps = {
    scheduleId: 100,
    users: mockUsers,
    totalCount: 3,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering with users', () => {
    test('renders list container', () => {
      render(<AssignedUsersList {...defaultProps} />)
      
      expect(screen.getByTestId('assigned-users-list')).toBeInTheDocument()
    })

    test('displays users summary', () => {
      render(<AssignedUsersList {...defaultProps} />)
      
      expect(screen.getByTestId('users-summary')).toBeInTheDocument()
      expect(screen.getByText(/showing 3 of 3 users/i)).toBeInTheDocument()
    })

    test('renders all user cards', () => {
      render(<AssignedUsersList {...defaultProps} />)
      
      expect(screen.getByTestId('user-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('user-card-2')).toBeInTheDocument()
      expect(screen.getByTestId('user-card-3')).toBeInTheDocument()
    })

    test('displays user information', () => {
      render(<AssignedUsersList {...defaultProps} />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@test.com')).toBeInTheDocument()
      expect(screen.getByTestId('user-role-1')).toHaveTextContent('Content Manager')
    })

    test('shows default schedule badge for default users', () => {
      render(<AssignedUsersList {...defaultProps} />)
      
      expect(screen.getByTestId('default-badge-1')).toBeInTheDocument()
      expect(screen.getByTestId('default-badge-1')).toHaveTextContent(/default/i)
    })

    test('hides default badge for non-default users', () => {
      render(<AssignedUsersList {...defaultProps} />)
      
      expect(screen.queryByTestId('default-badge-2')).not.toBeInTheDocument()
      expect(screen.queryByTestId('default-badge-3')).not.toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    test('shows empty state when no users', () => {
      render(<AssignedUsersList {...defaultProps} users={[]} totalCount={0} />)
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByText(/no users assigned/i)).toBeInTheDocument()
    })

    test('does not show user list when empty', () => {
      render(<AssignedUsersList {...defaultProps} users={[]} totalCount={0} />)
      
      expect(screen.queryByTestId('assigned-users-list')).not.toBeInTheDocument()
    })
  })

  describe('Loading state', () => {
    test('shows loading skeleton', () => {
      render(<AssignedUsersList {...defaultProps} isLoading={true} />)
      
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
      expect(screen.getByText(/loading users/i)).toBeInTheDocument()
    })

    test('hides users while loading', () => {
      render(<AssignedUsersList {...defaultProps} isLoading={true} />)
      
      expect(screen.queryByTestId('assigned-users-list')).not.toBeInTheDocument()
    })
  })

  describe('Remove user functionality', () => {
    test('shows remove button for each user', () => {
      render(<AssignedUsersList {...defaultProps} />)
      
      expect(screen.getByTestId('remove-user-1')).toBeInTheDocument()
      expect(screen.getByTestId('remove-user-2')).toBeInTheDocument()
      expect(screen.getByTestId('remove-user-3')).toBeInTheDocument()
    })

    test('calls onRemoveUser when button clicked', async () => {
      const user = userEvent.setup()
      const onRemoveUser = jest.fn()
      
      render(<AssignedUsersList {...defaultProps} onRemoveUser={onRemoveUser} />)
      
      await user.click(screen.getByTestId('remove-user-2'))
      
      expect(onRemoveUser).toHaveBeenCalledTimes(1)
      expect(onRemoveUser).toHaveBeenCalledWith(2)
    })

    test('handles multiple remove clicks', async () => {
      const user = userEvent.setup()
      const onRemoveUser = jest.fn()
      
      render(<AssignedUsersList {...defaultProps} onRemoveUser={onRemoveUser} />)
      
      await user.click(screen.getByTestId('remove-user-1'))
      await user.click(screen.getByTestId('remove-user-3'))
      
      expect(onRemoveUser).toHaveBeenCalledTimes(2)
      expect(onRemoveUser).toHaveBeenNthCalledWith(1, 1)
      expect(onRemoveUser).toHaveBeenNthCalledWith(2, 3)
    })
  })

  describe('Pagination', () => {
    test('shows pagination when multiple pages', () => {
      render(<AssignedUsersList {...defaultProps} currentPage={2} totalPages={5} />)
      
      expect(screen.getByTestId('pagination')).toBeInTheDocument()
    })

    test('hides pagination when only one page', () => {
      render(<AssignedUsersList {...defaultProps} totalPages={1} />)
      
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
    })

    test('displays current page and total pages', () => {
      render(<AssignedUsersList {...defaultProps} currentPage={3} totalPages={10} />)
      
      expect(screen.getByTestId('page-indicator')).toHaveTextContent('Page 3 of 10')
    })

    test('calls onPageChange when next clicked', async () => {
      const user = userEvent.setup()
      const onPageChange = jest.fn()
      
      render(<AssignedUsersList {...defaultProps} currentPage={2} totalPages={5} onPageChange={onPageChange} />)
      
      await user.click(screen.getByTestId('next-page'))
      
      expect(onPageChange).toHaveBeenCalledWith(3)
    })

    test('calls onPageChange when previous clicked', async () => {
      const user = userEvent.setup()
      const onPageChange = jest.fn()
      
      render(<AssignedUsersList {...defaultProps} currentPage={3} totalPages={5} onPageChange={onPageChange} />)
      
      await user.click(screen.getByTestId('prev-page'))
      
      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    test('disables previous button on first page', () => {
      render(<AssignedUsersList {...defaultProps} currentPage={1} totalPages={5} />)
      
      expect(screen.getByTestId('prev-page')).toBeDisabled()
    })

    test('disables next button on last page', () => {
      render(<AssignedUsersList {...defaultProps} currentPage={5} totalPages={5} />)
      
      expect(screen.getByTestId('next-page')).toBeDisabled()
    })

    test('enables both buttons on middle page', () => {
      render(<AssignedUsersList {...defaultProps} currentPage={3} totalPages={5} />)
      
      expect(screen.getByTestId('prev-page')).not.toBeDisabled()
      expect(screen.getByTestId('next-page')).not.toBeDisabled()
    })
  })

  describe('Custom styling', () => {
    test('applies custom className', () => {
      const { container } = render(<AssignedUsersList {...defaultProps} className="custom-list" />)
      
      expect(container.querySelector('.custom-list')).toBeInTheDocument()
    })
  })
})
