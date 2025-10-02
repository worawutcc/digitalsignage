/**
 * T014: Contract Test for ContentSourceBadge Component
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
import { ContentSourceBadge } from '@/features/schedules/components/ContentSourceBadge'

describe('ContentSourceBadge (T014)', () => {
  describe('Rendering - User Source', () => {
    it('should render "User" badge with blue color', () => {
      const { container } = render(<ContentSourceBadge source="User" />)
      
      expect(screen.getByText('User')).toBeInTheDocument()
      
      // Should have blue color classes
      const badge = container.querySelector('[data-testid="content-source-badge"]')
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
    })

    it('should show User badge tooltip', async () => {
      const user = userEvent.setup()
      render(<ContentSourceBadge source="User" />)
      
      const badge = screen.getByText('User')
      await user.hover(badge)
      
      // Tooltip should appear
      expect(await screen.findByText(/content assigned directly to user/i)).toBeInTheDocument()
    })
  })

  describe('Rendering - Group Source', () => {
    it('should render "Group" badge with green color', () => {
      const { container } = render(<ContentSourceBadge source="Group" />)
      
      expect(screen.getByText('Group')).toBeInTheDocument()
      
      // Should have green color classes
      const badge = container.querySelector('[data-testid="content-source-badge"]')
      expect(badge).toHaveClass('bg-green-100', 'text-green-800')
    })

    it('should show Group badge tooltip', async () => {
      const user = userEvent.setup()
      render(<ContentSourceBadge source="Group" />)
      
      const badge = screen.getByText('Group')
      await user.hover(badge)
      
      // Tooltip should appear
      expect(await screen.findByText(/content from user.*group/i)).toBeInTheDocument()
    })
  })

  describe('Rendering - Default Source', () => {
    it('should render "Default" badge with gray color', () => {
      const { container } = render(<ContentSourceBadge source="Default" />)
      
      expect(screen.getByText('Default')).toBeInTheDocument()
      
      // Should have gray color classes
      const badge = container.querySelector('[data-testid="content-source-badge"]')
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800')
    })

    it('should show Default badge tooltip', async () => {
      const user = userEvent.setup()
      render(<ContentSourceBadge source="Default" />)
      
      const badge = screen.getByText('Default')
      await user.hover(badge)
      
      // Tooltip should appear
      expect(await screen.findByText(/fallback content.*no specific assignment/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should be accessible with ARIA labels', () => {
      render(<ContentSourceBadge source="User" />)
      
      const badge = screen.getByText('User')
      expect(badge).toHaveAttribute('aria-label', 'Content source: User')
    })

    it('should have role="status" for screen readers', () => {
      render(<ContentSourceBadge source="Group" />)
      
      const badge = screen.getByRole('status')
      expect(badge).toBeInTheDocument()
    })

    it('should support keyboard navigation to tooltip', async () => {
      render(<ContentSourceBadge source="Default" />)
      
      const badge = screen.getByText('Default')
      
      // Tab to focus
      badge.focus()
      expect(badge).toHaveFocus()
    })
  })

  describe('Tooltip Behavior', () => {
    it('should show tooltip on hover', async () => {
      const user = userEvent.setup()
      render(<ContentSourceBadge source="User" />)
      
      const badge = screen.getByText('User')
      
      // Initially tooltip not visible
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
      
      // Hover to show tooltip
      await user.hover(badge)
      
      expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    })

    it('should hide tooltip on mouse leave', async () => {
      const user = userEvent.setup()
      render(<ContentSourceBadge source="User" />)
      
      const badge = screen.getByText('User')
      
      // Hover to show
      await user.hover(badge)
      expect(await screen.findByRole('tooltip')).toBeInTheDocument()
      
      // Unhover to hide
      await user.unhover(badge)
      
      // Tooltip should disappear
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('should have descriptive tooltip content', async () => {
      const user = userEvent.setup()
      render(<ContentSourceBadge source="Group" />)
      
      const badge = screen.getByText('Group')
      await user.hover(badge)
      
      const tooltip = await screen.findByRole('tooltip')
      
      // Tooltip should explain content source priority
      expect(tooltip).toHaveTextContent(/group/i)
      expect(tooltip.textContent!.length).toBeGreaterThan(20) // Should be descriptive
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ContentSourceBadge source="User" className="ml-2" />
      )
      
      const badge = container.querySelector('[data-testid="content-source-badge"]')
      expect(badge).toHaveClass('ml-2')
    })

    it('should maintain default styles with custom className', () => {
      const { container } = render(
        <ContentSourceBadge source="User" className="shadow-lg" />
      )
      
      const badge = container.querySelector('[data-testid="content-source-badge"]')
      
      // Should have both default (blue) and custom classes
      expect(badge).toHaveClass('bg-blue-100', 'shadow-lg')
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid source gracefully', () => {
      // TypeScript should prevent this, but test runtime behavior
      const { container } = render(
        <ContentSourceBadge source={'Invalid' as any} />
      )
      
      // Should render something (fallback to Default or show error)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should support small size variant', () => {
      const { container } = render(
        <ContentSourceBadge source="User" size="sm" />
      )
      
      const badge = container.querySelector('[data-testid="content-source-badge"]')
      expect(badge).toHaveClass('text-xs')
    })

    it('should support medium size variant (default)', () => {
      const { container } = render(<ContentSourceBadge source="User" />)
      
      const badge = container.querySelector('[data-testid="content-source-badge"]')
      expect(badge).toHaveClass('text-sm')
    })
  })

  describe('Priority Explanation', () => {
    it('should explain content priority in User tooltip', async () => {
      const user = userEvent.setup()
      render(<ContentSourceBadge source="User" />)
      
      await user.hover(screen.getByText('User'))
      
      const tooltip = await screen.findByRole('tooltip')
      
      // Should explain this is highest priority
      expect(tooltip).toHaveTextContent(/highest priority/i)
    })

    it('should explain content priority in Group tooltip', async () => {
      const user = userEvent.setup()
      render(<ContentSourceBadge source="Group" />)
      
      await user.hover(screen.getByText('Group'))
      
      const tooltip = await screen.findByRole('tooltip')
      
      // Should explain group priority
      expect(tooltip).toHaveTextContent(/group assignment/i)
    })

    it('should explain fallback nature in Default tooltip', async () => {
      const user = userEvent.setup()
      render(<ContentSourceBadge source="Default" />)
      
      await user.hover(screen.getByText('Default'))
      
      const tooltip = await screen.findByRole('tooltip')
      
      // Should explain this is fallback/lowest priority
      expect(tooltip).toHaveTextContent(/fallback|no specific/i)
    })
  })

  describe('Multiple Badges', () => {
    it('should render multiple badges independently', () => {
      render(
        <>
          <ContentSourceBadge source="User" />
          <ContentSourceBadge source="Group" />
          <ContentSourceBadge source="Default" />
        </>
      )
      
      expect(screen.getByText('User')).toBeInTheDocument()
      expect(screen.getByText('Group')).toBeInTheDocument()
      expect(screen.getByText('Default')).toBeInTheDocument()
    })

    it('should have different colors for each source', () => {
      const { container } = render(
        <>
          <ContentSourceBadge source="User" />
          <ContentSourceBadge source="Group" />
          <ContentSourceBadge source="Default" />
        </>
      )
      
      const badges = container.querySelectorAll('[data-testid="content-source-badge"]')
      
      expect(badges[0]).toHaveClass('bg-blue-100')
      expect(badges[1]).toHaveClass('bg-green-100')
      expect(badges[2]).toHaveClass('bg-gray-100')
    })
  })
})
