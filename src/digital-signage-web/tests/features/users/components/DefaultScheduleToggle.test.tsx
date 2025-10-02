/**
 * DefaultScheduleToggle Component Tests (T012)
 * 
 * Contract tests following TDD principles.
 * Tests define the expected behavior - implementation comes after.
 * 
 * Business Rule: Only ONE schedule can be default at a time.
 * 
 * These tests SHOULD FAIL initially (on assertions, not compilation).
 * 
 * @see copilot-instructions-web.md - Testing Standards
 * @see specs/020-phase-1/tasks.md - T012 Requirements
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DefaultScheduleToggle } from '@/features/users/components/DefaultScheduleToggle'

describe('DefaultScheduleToggle', () => {
  const defaultProps = {
    scheduleId: 1,
    isDefault: false,
    onToggle: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    test('renders toggle component', () => {
      render(<DefaultScheduleToggle {...defaultProps} />)
      
      expect(screen.getByTestId('default-schedule-toggle')).toBeInTheDocument()
    })

    test('shows "Set as Default" button when not default', () => {
      render(<DefaultScheduleToggle {...defaultProps} isDefault={false} />)
      
      expect(screen.getByTestId('set-default-button')).toBeInTheDocument()
      expect(screen.getByTestId('set-default-button')).toHaveTextContent('Set as Default')
    })

    test('shows "Default" badge when is default', () => {
      render(<DefaultScheduleToggle {...defaultProps} isDefault={true} />)
      
      expect(screen.getByTestId('default-badge')).toBeInTheDocument()
      expect(screen.getByTestId('default-badge')).toHaveTextContent('Default')
    })

    test('does not show button when is default', () => {
      render(<DefaultScheduleToggle {...defaultProps} isDefault={true} />)
      
      expect(screen.queryByTestId('set-default-button')).not.toBeInTheDocument()
    })
  })

  describe('Toggle functionality', () => {
    test('calls onToggle with correct params when button clicked', async () => {
      const user = userEvent.setup()
      const onToggle = jest.fn()
      
      render(<DefaultScheduleToggle {...defaultProps} scheduleId={5} onToggle={onToggle} />)
      
      await user.click(screen.getByTestId('set-default-button'))
      
      expect(onToggle).toHaveBeenCalledTimes(1)
      expect(onToggle).toHaveBeenCalledWith(5, true)
    })

    test('sets setAsDefault to true when currently not default', async () => {
      const user = userEvent.setup()
      const onToggle = jest.fn()
      
      render(<DefaultScheduleToggle {...defaultProps} isDefault={false} onToggle={onToggle} />)
      
      await user.click(screen.getByTestId('set-default-button'))
      
      expect(onToggle).toHaveBeenCalledWith(1, true)
    })

    test('allows clicking badge to unset default', async () => {
      const user = userEvent.setup()
      const onToggle = jest.fn()
      
      render(<DefaultScheduleToggle {...defaultProps} isDefault={true} onToggle={onToggle} />)
      
      const badge = screen.getByTestId('default-badge')
      await user.click(badge)
      
      expect(onToggle).toHaveBeenCalledWith(1, false)
    })
  })

  describe('Loading state', () => {
    test('shows loading text on button when isLoading', () => {
      render(<DefaultScheduleToggle {...defaultProps} isLoading={true} />)
      
      expect(screen.getByTestId('set-default-button')).toHaveTextContent('Setting...')
    })

    test('disables button when isLoading', () => {
      render(<DefaultScheduleToggle {...defaultProps} isLoading={true} />)
      
      expect(screen.getByTestId('set-default-button')).toBeDisabled()
    })

    test('does not call onToggle when clicked during loading', async () => {
      const user = userEvent.setup()
      const onToggle = jest.fn()
      
      render(<DefaultScheduleToggle {...defaultProps} isLoading={true} onToggle={onToggle} />)
      
      await user.click(screen.getByTestId('set-default-button'))
      
      expect(onToggle).not.toHaveBeenCalled()
    })

    test('shows loading spinner on badge when unsetting default', () => {
      render(<DefaultScheduleToggle {...defaultProps} isDefault={true} isLoading={true} />)
      
      const badge = screen.getByTestId('default-badge')
      expect(badge).toHaveTextContent(/updating/i)
    })
  })

  describe('Visual states', () => {
    test('default badge has distinct styling', () => {
      render(<DefaultScheduleToggle {...defaultProps} isDefault={true} />)
      
      const badge = screen.getByTestId('default-badge')
      expect(badge).toHaveClass(/badge|default/i)
    })

    test('button has primary/action styling', () => {
      render(<DefaultScheduleToggle {...defaultProps} />)
      
      const button = screen.getByTestId('set-default-button')
      expect(button).toBeInTheDocument()
    })

    test('applies custom className', () => {
      const { container } = render(<DefaultScheduleToggle {...defaultProps} className="custom-toggle" />)
      
      expect(container.querySelector('.custom-toggle')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('button has accessible name', () => {
      render(<DefaultScheduleToggle {...defaultProps} />)
      
      const button = screen.getByTestId('set-default-button')
      expect(button).toHaveAccessibleName()
    })

    test('badge has role attribute', () => {
      render(<DefaultScheduleToggle {...defaultProps} isDefault={true} />)
      
      const badge = screen.getByTestId('default-badge')
      expect(badge).toHaveAttribute('role', 'status')
    })

    test('button has aria-label indicating action', () => {
      render(<DefaultScheduleToggle {...defaultProps} scheduleId={3} />)
      
      const button = screen.getByTestId('set-default-button')
      expect(button).toHaveAttribute('aria-label', /set.*default/i)
    })

    test('loading state has aria-busy', () => {
      render(<DefaultScheduleToggle {...defaultProps} isLoading={true} />)
      
      const button = screen.getByTestId('set-default-button')
      expect(button).toHaveAttribute('aria-busy', 'true')
    })
  })

  describe('Edge cases', () => {
    test('handles rapid clicks gracefully', async () => {
      const user = userEvent.setup()
      const onToggle = jest.fn()
      
      render(<DefaultScheduleToggle {...defaultProps} onToggle={onToggle} />)
      
      const button = screen.getByTestId('set-default-button')
      await user.click(button)
      await user.click(button)
      await user.click(button)
      
      // Should only trigger once due to loading state
      expect(onToggle).toHaveBeenCalledTimes(1)
    })

    test('handles keyboard interaction', async () => {
      const user = userEvent.setup()
      const onToggle = jest.fn()
      
      render(<DefaultScheduleToggle {...defaultProps} onToggle={onToggle} />)
      
      const button = screen.getByTestId('set-default-button')
      button.focus()
      await user.keyboard('{Enter}')
      
      expect(onToggle).toHaveBeenCalledTimes(1)
    })
  })
})
