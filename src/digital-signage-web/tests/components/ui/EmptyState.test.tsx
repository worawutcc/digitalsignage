/**
 * T008: Contract Test for EmptyState Component
 * 
 * TDD Approach: Tests written BEFORE implementation
 * Component should be implemented to pass these tests
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 * @see specs/020-phase-1/contracts/component-contracts.md
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { EmptyState } from '@/components/ui/EmptyState'
import { Calendar } from 'lucide-react'

describe('EmptyState (T008)', () => {
  const defaultProps = {
    icon: Calendar,
    title: 'No schedules found',
    description: 'Get started by creating your first schedule.',
  }

  describe('Rendering', () => {
    it('should render icon, title, and description', () => {
      render(<EmptyState {...defaultProps} />)
      
      expect(screen.getByText('No schedules found')).toBeInTheDocument()
      expect(screen.getByText('Get started by creating your first schedule.')).toBeInTheDocument()
      
      // Icon should be rendered (Lucide icons render as SVG)
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should render with title only', () => {
      render(
        <EmptyState
          icon={Calendar}
          title="No data"
        />
      )
      
      expect(screen.getByText('No data')).toBeInTheDocument()
    })

    it('should render without icon', () => {
      render(
        <EmptyState
          title="No schedules found"
          description="Try adjusting your filters."
        />
      )
      
      expect(screen.getByText('No schedules found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your filters.')).toBeInTheDocument()
    })
  })

  describe('Action Button', () => {
    it('should render action button when provided', () => {
      const mockOnAction = jest.fn()
      
      render(
        <EmptyState
          {...defaultProps}
          actionButton={{
            label: 'Create Schedule',
            onClick: mockOnAction,
          }}
        />
      )
      
      const button = screen.getByRole('button', { name: /create schedule/i })
      expect(button).toBeInTheDocument()
    })

    it('should not render action button when not provided', () => {
      render(<EmptyState {...defaultProps} />)
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should call onAction when button clicked', async () => {
      const user = userEvent.setup()
      const mockOnAction = jest.fn()
      
      render(
        <EmptyState
          {...defaultProps}
          actionButton={{
            label: 'Add Item',
            onClick: mockOnAction,
          }}
        />
      )
      
      const button = screen.getByRole('button', { name: /add item/i })
      await user.click(button)
      
      expect(mockOnAction).toHaveBeenCalledTimes(1)
    })

    it('should support action button with icon', () => {
      render(
        <EmptyState
          {...defaultProps}
          actionButton={{
            label: 'Create',
            onClick: jest.fn(),
            icon: Calendar,
          }}
        />
      )
      
      const button = screen.getByRole('button', { name: /create/i })
      expect(button).toBeInTheDocument()
      
      // Icon should be rendered inside button
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <EmptyState
          {...defaultProps}
          className="my-custom-class"
        />
      )
      
      const emptyState = container.firstChild
      expect(emptyState).toHaveClass('my-custom-class')
    })

    it('should maintain default styles with custom className', () => {
      const { container } = render(
        <EmptyState
          {...defaultProps}
          className="text-red-500"
        />
      )
      
      const emptyState = container.firstChild
      // Should have both default and custom classes
      expect(emptyState).toHaveClass('text-red-500')
    })
  })

  describe('Accessibility', () => {
    it('should be accessible with proper semantic HTML', () => {
      render(<EmptyState {...defaultProps} />)
      
      // Title should be a heading
      const heading = screen.getByRole('heading', { name: /no schedules found/i })
      expect(heading).toBeInTheDocument()
    })

    it('should have appropriate ARIA labels', () => {
      render(
        <EmptyState
          {...defaultProps}
          ariaLabel="Empty state message"
        />
      )
      
      const container = screen.getByLabelText('Empty state message')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Layout Variations', () => {
    it('should support compact layout', () => {
      const { container } = render(
        <EmptyState
          {...defaultProps}
          variant="compact"
        />
      )
      
      expect(container.firstChild).toHaveClass('compact')
    })

    it('should support full-page layout (default)', () => {
      const { container } = render(
        <EmptyState {...defaultProps} />
      )
      
      // Default should be full-page centered layout
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should support custom icon size', () => {
      render(
        <EmptyState
          {...defaultProps}
          iconSize="lg"
        />
      )
      
      const svg = document.querySelector('svg')
      expect(svg).toHaveClass('w-16') // Large size
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long descriptions', () => {
      const longDescription = 'Lorem ipsum '.repeat(50)
      
      render(
        <EmptyState
          {...defaultProps}
          description={longDescription}
        />
      )
      
      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })

    it('should handle special characters in text', () => {
      render(
        <EmptyState
          icon={Calendar}
          title="No items found: special chars"
          description="Try searching for something else."
        />
      )
      
      expect(screen.getByText(/no items found/i)).toBeInTheDocument()
    })
  })

  describe('Multiple Instances', () => {
    it('should render multiple EmptyState components independently', () => {
      const { container } = render(
        <>
          <EmptyState
            icon={Calendar}
            title="No schedules"
            description="First empty state"
          />
          <EmptyState
            icon={Calendar}
            title="No devices"
            description="Second empty state"
          />
        </>
      )
      
      expect(screen.getByText('No schedules')).toBeInTheDocument()
      expect(screen.getByText('No devices')).toBeInTheDocument()
      expect(screen.getByText('First empty state')).toBeInTheDocument()
      expect(screen.getByText('Second empty state')).toBeInTheDocument()
    })
  })
})
