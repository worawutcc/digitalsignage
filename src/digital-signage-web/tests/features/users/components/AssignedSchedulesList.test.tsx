/**
 * AssignedSchedulesList Component Tests (T010)
 * 
 * Contract tests following TDD principles.
 * Tests define the expected behavior - implementation comes after.
 * 
 * These tests SHOULD FAIL initially (on assertions, not compilation).
 * 
 * @see copilot-instructions-web.md - Testing Standards
 * @see specs/020-phase-1/tasks.md - T010 Requirements
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssignedSchedulesList } from '@/features/users/components/AssignedSchedulesList'
import { Schedule } from '@/features/users/components/AssignedSchedulesList.types'

describe('AssignedSchedulesList', () => {
  // Mock data
  const mockSchedules: Schedule[] = [
    {
      id: 1,
      name: 'Morning Shift',
      description: 'Early morning content',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true,
      createdBy: 'admin@test.com',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Evening Shift',
      startDate: '2024-06-01',
      endDate: '2024-06-30',
      isActive: false,
      createdBy: 'manager@test.com',
      createdAt: '2024-01-02T00:00:00Z',
    },
  ]

  describe('Rendering with schedules', () => {
    test('renders list of assigned schedules', () => {
      render(<AssignedSchedulesList schedules={mockSchedules} />)
      
      expect(screen.getByTestId('schedules-list')).toBeInTheDocument()
      expect(screen.getByTestId('schedules-grid')).toBeInTheDocument()
    })

    test('displays all schedule cards', () => {
      render(<AssignedSchedulesList schedules={mockSchedules} />)
      
      expect(screen.getByTestId('schedule-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('schedule-card-2')).toBeInTheDocument()
    })

    test('shows schedule name and description', () => {
      render(<AssignedSchedulesList schedules={mockSchedules} />)
      
      expect(screen.getByText('Morning Shift')).toBeInTheDocument()
      expect(screen.getByText('Early morning content')).toBeInTheDocument()
      expect(screen.getByText('Evening Shift')).toBeInTheDocument()
    })

    test('displays schedule dates', () => {
      render(<AssignedSchedulesList schedules={mockSchedules} />)
      
      expect(screen.getByText('2024-01-01')).toBeInTheDocument()
      expect(screen.getByText('2024-12-31')).toBeInTheDocument()
      expect(screen.getByText('2024-06-01')).toBeInTheDocument()
      expect(screen.getByText('2024-06-30')).toBeInTheDocument()
    })

    test('shows schedule status badge', () => {
      render(<AssignedSchedulesList schedules={mockSchedules} />)
      
      const activeStatus = screen.getByTestId('schedule-status-1')
      const inactiveStatus = screen.getByTestId('schedule-status-2')
      
      expect(activeStatus).toHaveTextContent('Active')
      expect(inactiveStatus).toHaveTextContent('Inactive')
    })

    test('displays creator information', () => {
      render(<AssignedSchedulesList schedules={mockSchedules} />)
      
      expect(screen.getByText(/admin@test.com/)).toBeInTheDocument()
      expect(screen.getByText(/manager@test.com/)).toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    test('shows empty state when no schedules', () => {
      render(<AssignedSchedulesList schedules={[]} />)
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.queryByTestId('schedules-list')).not.toBeInTheDocument()
    })

    test('displays "no schedules" message', () => {
      render(<AssignedSchedulesList schedules={[]} />)
      
      expect(screen.getByText(/no schedules/i)).toBeInTheDocument()
    })

    test('does not show remove button when empty', () => {
      render(<AssignedSchedulesList schedules={[]} />)
      
      expect(screen.queryByTestId('remove-all-button')).not.toBeInTheDocument()
    })
  })

  describe('Loading state', () => {
    test('shows loading skeleton', () => {
      render(<AssignedSchedulesList schedules={[]} isLoading={true} />)
      
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })

    test('does not show schedules while loading', () => {
      render(<AssignedSchedulesList schedules={mockSchedules} isLoading={true} />)
      
      expect(screen.queryByTestId('schedules-list')).not.toBeInTheDocument()
    })

    test('does not show empty state while loading', () => {
      render(<AssignedSchedulesList schedules={[]} isLoading={true} />)
      
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
    })
  })

  describe('Remove all functionality', () => {
    test('shows remove all button when schedules exist', () => {
      render(<AssignedSchedulesList schedules={mockSchedules} />)
      
      const removeButton = screen.getByTestId('remove-all-button')
      expect(removeButton).toBeInTheDocument()
      expect(removeButton).toHaveTextContent(/remove all/i)
    })

    test('calls onRemoveAll when button clicked', async () => {
      const user = userEvent.setup()
      const onRemoveAll = jest.fn()
      
      render(
        <AssignedSchedulesList 
          schedules={mockSchedules} 
          onRemoveAll={onRemoveAll} 
        />
      )
      
      await user.click(screen.getByTestId('remove-all-button'))
      
      expect(onRemoveAll).toHaveBeenCalledTimes(1)
    })

    test('disables remove button when disableRemove is true', () => {
      render(
        <AssignedSchedulesList 
          schedules={mockSchedules} 
          disableRemove={true} 
        />
      )
      
      expect(screen.getByTestId('remove-all-button')).toBeDisabled()
    })

    test('enables remove button by default', () => {
      render(<AssignedSchedulesList schedules={mockSchedules} />)
      
      expect(screen.getByTestId('remove-all-button')).not.toBeDisabled()
    })
  })

  describe('Custom styling', () => {
    test('applies custom className', () => {
      const { container } = render(
        <AssignedSchedulesList 
          schedules={mockSchedules} 
          className="custom-class" 
        />
      )
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    test('applies className to loading state', () => {
      const { container } = render(
        <AssignedSchedulesList 
          schedules={[]} 
          isLoading={true}
          className="loading-custom" 
        />
      )
      
      expect(container.querySelector('.loading-custom')).toBeInTheDocument()
    })

    test('applies className to empty state', () => {
      const { container } = render(
        <AssignedSchedulesList 
          schedules={[]} 
          className="empty-custom" 
        />
      )
      
      expect(container.querySelector('.empty-custom')).toBeInTheDocument()
    })
  })
})
