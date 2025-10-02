/**
 * ScheduleSelector Component Tests (T011)
 * 
 * CRITICAL: Tests REPLACE warning logic - core business requirement.
 * 
 * Contract tests following TDD principles.
 * Tests define the expected behavior - implementation comes after.
 * 
 * These tests SHOULD FAIL initially (on assertions, not compilation).
 * 
 * @see copilot-instructions-web.md - Testing Standards
 * @see specs/020-phase-1/tasks.md - T011 Requirements
 */

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScheduleSelector } from '@/features/users/components/ScheduleSelector'
import { Schedule } from '@/features/users/components/ScheduleSelector.types'

describe('ScheduleSelector', () => {
  // Mock data
  const mockSchedules: Schedule[] = [
    {
      id: 1,
      name: 'Morning Shift',
      description: 'Early morning content',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true,
    },
    {
      id: 2,
      name: 'Evening Shift',
      startDate: '2024-06-01',
      endDate: '2024-06-30',
      isActive: false,
    },
    {
      id: 3,
      name: 'Weekend Schedule',
      description: 'Weekend special content',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true,
    },
  ]

  const defaultProps = {
    isOpen: true,
    availableSchedules: mockSchedules,
    selectedScheduleIds: [],
    hasExistingSchedules: false,
    onSelectionChange: jest.fn(),
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Modal visibility', () => {
    test('renders modal when isOpen is true', () => {
      render(<ScheduleSelector {...defaultProps} />)
      
      expect(screen.getByTestId('schedule-selector-modal')).toBeInTheDocument()
    })

    test('does not render when isOpen is false', () => {
      render(<ScheduleSelector {...defaultProps} isOpen={false} />)
      
      expect(screen.queryByTestId('schedule-selector-modal')).not.toBeInTheDocument()
    })

    test('shows modal title', () => {
      render(<ScheduleSelector {...defaultProps} />)
      
      expect(screen.getByText('Select Schedules')).toBeInTheDocument()
    })
  })

  describe('REPLACE warning (CRITICAL)', () => {
    test('shows warning when hasExistingSchedules is true', () => {
      render(<ScheduleSelector {...defaultProps} hasExistingSchedules={true} />)
      
      const warning = screen.getByTestId('replace-warning')
      expect(warning).toBeInTheDocument()
      expect(warning).toHaveTextContent(/replace existing schedules/i)
    })

    test('hides warning when hasExistingSchedules is false', () => {
      render(<ScheduleSelector {...defaultProps} hasExistingSchedules={false} />)
      
      expect(screen.queryByTestId('replace-warning')).not.toBeInTheDocument()
    })

    test('shows acknowledgment checkbox in warning', () => {
      render(<ScheduleSelector {...defaultProps} hasExistingSchedules={true} />)
      
      expect(screen.getByTestId('acknowledge-checkbox')).toBeInTheDocument()
    })

    test('disables confirm button if warning not acknowledged', () => {
      render(<ScheduleSelector {...defaultProps} hasExistingSchedules={true} selectedScheduleIds={[1]} />)
      
      const confirmButton = screen.getByTestId('confirm-button')
      expect(confirmButton).toBeDisabled()
    })

    test('enables confirm button after acknowledging warning', async () => {
      const user = userEvent.setup()
      render(<ScheduleSelector {...defaultProps} hasExistingSchedules={true} selectedScheduleIds={[1]} />)
      
      const checkbox = screen.getByTestId('acknowledge-checkbox')
      await user.click(checkbox)
      
      const confirmButton = screen.getByTestId('confirm-button')
      expect(confirmButton).not.toBeDisabled()
    })

    test('warning emphasizes REPLACE action', () => {
      render(<ScheduleSelector {...defaultProps} hasExistingSchedules={true} />)
      
      const warning = screen.getByTestId('replace-warning')
      expect(warning).toHaveTextContent(/REPLACE/i)
    })
  })

  describe('Schedule list rendering', () => {
    test('displays all available schedules', () => {
      render(<ScheduleSelector {...defaultProps} />)
      
      expect(screen.getByTestId('schedule-list')).toBeInTheDocument()
      expect(screen.getByTestId('schedule-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('schedule-item-2')).toBeInTheDocument()
      expect(screen.getByTestId('schedule-item-3')).toBeInTheDocument()
    })

    test('shows schedule details', () => {
      render(<ScheduleSelector {...defaultProps} />)
      
      expect(screen.getByText('Morning Shift')).toBeInTheDocument()
      expect(screen.getByText('Early morning content')).toBeInTheDocument()
      expect(screen.getByText(/2024-01-01.*2024-12-31/)).toBeInTheDocument()
    })

    test('displays schedule status badges', () => {
      render(<ScheduleSelector {...defaultProps} />)
      
      expect(screen.getByTestId('schedule-status-1')).toHaveTextContent('Active')
      expect(screen.getByTestId('schedule-status-2')).toHaveTextContent('Inactive')
    })

    test('renders checkboxes for each schedule', () => {
      render(<ScheduleSelector {...defaultProps} />)
      
      expect(screen.getByTestId('schedule-checkbox-1')).toBeInTheDocument()
      expect(screen.getByTestId('schedule-checkbox-2')).toBeInTheDocument()
      expect(screen.getByTestId('schedule-checkbox-3')).toBeInTheDocument()
    })
  })

  describe('Schedule selection', () => {
    test('checks checkbox for selected schedules', () => {
      render(<ScheduleSelector {...defaultProps} selectedScheduleIds={[1, 3]} />)
      
      expect(screen.getByTestId('schedule-checkbox-1')).toBeChecked()
      expect(screen.getByTestId('schedule-checkbox-2')).not.toBeChecked()
      expect(screen.getByTestId('schedule-checkbox-3')).toBeChecked()
    })

    test('calls onSelectionChange when checkbox clicked', async () => {
      const user = userEvent.setup()
      const onSelectionChange = jest.fn()
      
      render(<ScheduleSelector {...defaultProps} onSelectionChange={onSelectionChange} />)
      
      await user.click(screen.getByTestId('schedule-checkbox-1'))
      
      expect(onSelectionChange).toHaveBeenCalledWith([1])
    })

    test('adds to selection when unchecked schedule clicked', async () => {
      const user = userEvent.setup()
      const onSelectionChange = jest.fn()
      
      render(<ScheduleSelector {...defaultProps} selectedScheduleIds={[1]} onSelectionChange={onSelectionChange} />)
      
      await user.click(screen.getByTestId('schedule-checkbox-2'))
      
      expect(onSelectionChange).toHaveBeenCalledWith([1, 2])
    })

    test('removes from selection when checked schedule clicked', async () => {
      const user = userEvent.setup()
      const onSelectionChange = jest.fn()
      
      render(<ScheduleSelector {...defaultProps} selectedScheduleIds={[1, 2]} onSelectionChange={onSelectionChange} />)
      
      await user.click(screen.getByTestId('schedule-checkbox-1'))
      
      expect(onSelectionChange).toHaveBeenCalledWith([2])
    })
  })

  describe('Search functionality', () => {
    test('shows search input', () => {
      render(<ScheduleSelector {...defaultProps} />)
      
      const searchInput = screen.getByTestId('search-input')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('placeholder', /search/i)
    })

    test('filters schedules based on search query', async () => {
      const user = userEvent.setup()
      render(<ScheduleSelector {...defaultProps} />)
      
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'Morning')
      
      expect(screen.getByTestId('schedule-item-1')).toBeInTheDocument()
      expect(screen.queryByTestId('schedule-item-2')).not.toBeInTheDocument()
      expect(screen.queryByTestId('schedule-item-3')).not.toBeInTheDocument()
    })

    test('search is case-insensitive', async () => {
      const user = userEvent.setup()
      render(<ScheduleSelector {...defaultProps} />)
      
      await user.type(screen.getByTestId('search-input'), 'evening')
      
      expect(screen.getByTestId('schedule-item-2')).toBeInTheDocument()
    })
  })

  describe('Loading states', () => {
    test('shows loading spinner when isLoading is true', () => {
      render(<ScheduleSelector {...defaultProps} isLoading={true} />)
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    test('hides schedule list while loading', () => {
      render(<ScheduleSelector {...defaultProps} isLoading={true} />)
      
      expect(screen.queryByTestId('schedule-list')).not.toBeInTheDocument()
    })

    test('shows loading text on confirm button when isSubmitting', () => {
      render(<ScheduleSelector {...defaultProps} isSubmitting={true} selectedScheduleIds={[1]} />)
      
      expect(screen.getByTestId('confirm-button')).toHaveTextContent('Assigning...')
    })

    test('disables buttons when isSubmitting', () => {
      render(<ScheduleSelector {...defaultProps} isSubmitting={true} selectedScheduleIds={[1]} />)
      
      expect(screen.getByTestId('confirm-button')).toBeDisabled()
      expect(screen.getByTestId('cancel-button')).toBeDisabled()
    })
  })

  describe('Empty state', () => {
    test('shows empty state when no schedules available', () => {
      render(<ScheduleSelector {...defaultProps} availableSchedules={[]} />)
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByText(/no schedules available/i)).toBeInTheDocument()
    })

    test('hides schedule list when empty', () => {
      render(<ScheduleSelector {...defaultProps} availableSchedules={[]} />)
      
      expect(screen.queryByTestId('schedule-list')).not.toBeInTheDocument()
    })
  })

  describe('Action buttons', () => {
    test('renders cancel and confirm buttons', () => {
      render(<ScheduleSelector {...defaultProps} />)
      
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument()
    })

    test('calls onCancel when cancel button clicked', async () => {
      const user = userEvent.setup()
      const onCancel = jest.fn()
      
      render(<ScheduleSelector {...defaultProps} onCancel={onCancel} />)
      
      await user.click(screen.getByTestId('cancel-button'))
      
      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    test('calls onConfirm when confirm button clicked', async () => {
      const user = userEvent.setup()
      const onConfirm = jest.fn()
      
      render(<ScheduleSelector {...defaultProps} selectedScheduleIds={[1]} onConfirm={onConfirm} />)
      
      await user.click(screen.getByTestId('confirm-button'))
      
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    test('disables confirm button when no selection', () => {
      render(<ScheduleSelector {...defaultProps} selectedScheduleIds={[]} />)
      
      expect(screen.getByTestId('confirm-button')).toBeDisabled()
    })

    test('enables confirm button when schedules selected', () => {
      render(<ScheduleSelector {...defaultProps} selectedScheduleIds={[1]} />)
      
      expect(screen.getByTestId('confirm-button')).not.toBeDisabled()
    })
  })

  describe('Custom styling', () => {
    test('applies custom className', () => {
      const { container } = render(<ScheduleSelector {...defaultProps} className="custom-modal" />)
      
      expect(container.querySelector('.custom-modal')).toBeInTheDocument()
    })
  })
})
