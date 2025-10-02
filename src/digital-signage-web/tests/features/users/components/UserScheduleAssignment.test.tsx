/**
 * T009: Contract Test for UserScheduleAssignment Component
 * 
 * TDD Approach: Tests written BEFORE full implementation
 * These tests should FAIL on assertions initially
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 * @see specs/020-phase-1/contracts/component-contracts.md
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { UserScheduleAssignment } from '@/features/users/components/UserScheduleAssignment'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock React Query
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Admin',
}

describe('UserScheduleAssignment (T009)', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    jest.clearAllMocks()
  })

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <UserScheduleAssignment
          userId={1}
          user={mockUser}
          {...props}
        />
      </QueryClientProvider>
    )
  }

  describe('Rendering', () => {
    it('should render component with user info', () => {
      renderComponent()

      expect(screen.getByTestId('user-schedule-assignment')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      renderComponent({ className: 'custom-class' })

      const component = screen.getByTestId('user-schedule-assignment')
      expect(component).toHaveClass('custom-class')
    })

    it('should show assigned schedules section', () => {
      renderComponent()

      expect(screen.getByTestId('assigned-schedules-section')).toBeInTheDocument()
      expect(screen.getByText('Assigned Schedules')).toBeInTheDocument()
    })

    it('should show assign schedules button', () => {
      renderComponent()

      expect(screen.getByTestId('assign-schedules-button')).toBeInTheDocument()
    })

    it('should show remove all button', () => {
      renderComponent()

      expect(screen.getByTestId('remove-all-button')).toBeInTheDocument()
    })
  })

  describe('Data Fetching', () => {
    it('should fetch user schedules on mount', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })
    })

    it('should show loading skeleton while fetching', () => {
      renderComponent()

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })

    it('should display schedules after successful fetch', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('schedules-list')).toBeInTheDocument()
      })
    })

    it('should show error state on fetch failure', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).toBeInTheDocument()
      })
    })

    it('should show empty state when no schedules', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      })
    })
  })

  describe('Assign Schedules Modal', () => {
    it('should open selector modal on assign button click', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByTestId('assign-schedules-button'))

      expect(screen.getByTestId('schedule-selector-modal')).toBeInTheDocument()
    })

    it('should close modal after successful assignment', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByTestId('assign-schedules-button'))
      
      const modal = screen.getByTestId('schedule-selector-modal')
      expect(modal).toBeInTheDocument()

      // Simulate successful assignment
      await waitFor(() => {
        expect(screen.queryByTestId('schedule-selector-modal')).not.toBeInTheDocument()
      })
    })

    it('should keep modal open on assignment error', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByTestId('assign-schedules-button'))

      const modal = screen.getByTestId('schedule-selector-modal')
      expect(modal).toBeInTheDocument()
    })

    it('should call onSchedulesUpdated after successful assignment', async () => {
      const mockOnSchedulesUpdated = jest.fn()
      const user = userEvent.setup()
      
      renderComponent({ onSchedulesUpdated: mockOnSchedulesUpdated })

      await user.click(screen.getByTestId('assign-schedules-button'))

      await waitFor(() => {
        expect(mockOnSchedulesUpdated).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Remove All Schedules', () => {
    it('should show confirmation modal on remove all click', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByTestId('remove-all-button'))

      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
      expect(screen.getByText(/remove all schedules/i)).toBeInTheDocument()
    })

    it('should disable remove button when no schedules', () => {
      renderComponent()

      const removeButton = screen.getByTestId('remove-all-button')
      expect(removeButton).toBeDisabled()
    })

    it('should enable remove button when schedules exist', async () => {
      renderComponent()

      await waitFor(() => {
        const removeButton = screen.getByTestId('remove-all-button')
        expect(removeButton).toBeEnabled()
      })
    })

    it('should remove schedules after confirmation', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByTestId('remove-all-button'))
      await user.click(screen.getByRole('button', { name: /confirm/i }))

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      })
    })
  })

  describe('Cache Invalidation', () => {
    it('should invalidate cache after successful assignment', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByTestId('assign-schedules-button'))

      await waitFor(() => {
        // Cache should be invalidated and data refetched
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })
    })

    it('should invalidate cache after removing schedules', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByTestId('remove-all-button'))
      await user.click(screen.getByRole('button', { name: /confirm/i }))

      await waitFor(() => {
        // Cache should be invalidated
        expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error toast on assignment failure', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByTestId('assign-schedules-button'))

      await waitFor(() => {
        expect(screen.getByTestId('error-toast')).toBeInTheDocument()
      })
    })

    it('should show error toast on remove failure', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByTestId('remove-all-button'))
      await user.click(screen.getByRole('button', { name: /confirm/i }))

      await waitFor(() => {
        expect(screen.getByTestId('error-toast')).toBeInTheDocument()
      })
    })

    it('should handle 403 forbidden error', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText(/permission denied/i)).toBeInTheDocument()
      })
    })

    it('should handle 404 user not found', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText(/user not found/i)).toBeInTheDocument()
      })
    })
  })
})
