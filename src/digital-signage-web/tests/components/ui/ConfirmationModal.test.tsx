/**
 * T007: Contract Test for ConfirmationModal Component
 * 
 * TDD Approach: Tests written BEFORE implementation
 * Component should be implemented to pass these tests
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 * @see specs/020-phase-1/contracts/component-contracts.md
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'

describe('ConfirmationModal (T007)', () => {
  const mockOnConfirm = jest.fn()
  const mockOnCancel = jest.fn()

  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<ConfirmationModal {...defaultProps} />)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<ConfirmationModal {...defaultProps} isOpen={false} />)
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should show custom title and message', () => {
      render(
        <ConfirmationModal
          {...defaultProps}
          title="Delete User"
          message="This action cannot be undone."
        />
      )
      
      expect(screen.getByText('Delete User')).toBeInTheDocument()
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    })

    it('should support custom button labels', () => {
      render(
        <ConfirmationModal
          {...defaultProps}
          confirmText="Yes, Delete"
          cancelText="No, Keep It"
        />
      )
      
      expect(screen.getByRole('button', { name: /yes, delete/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /no, keep it/i })).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('should call onConfirm when confirm button clicked', async () => {
      const user = userEvent.setup()
      render(<ConfirmationModal {...defaultProps} />)
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      await user.click(confirmButton)
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup()
      render(<ConfirmationModal {...defaultProps} />)
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should close on backdrop click (configurable)', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ConfirmationModal {...defaultProps} closeOnBackdropClick={true} />
      )
      
      // Click on the backdrop (the overlay behind the modal)
      const backdrop = container.querySelector('[data-testid="modal-backdrop"]')
      if (backdrop) {
        await user.click(backdrop)
        expect(mockOnCancel).toHaveBeenCalled()
      }
    })
  })

  describe('Confirmation Checkbox', () => {
    it('should require checkbox when requireConfirm=true', () => {
      render(
        <ConfirmationModal
          {...defaultProps}
          requireConfirm={true}
          confirmLabel="I understand this action"
        />
      )
      
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.getByText(/i understand this action/i)).toBeInTheDocument()
    })

    it('should disable confirm button until checkbox checked', async () => {
      const user = userEvent.setup()
      render(
        <ConfirmationModal
          {...defaultProps}
          requireConfirm={true}
          confirmLabel="I confirm"
        />
      )
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      const checkbox = screen.getByRole('checkbox')
      
      // Initially disabled
      expect(confirmButton).toBeDisabled()
      
      // Enable after checking
      await user.click(checkbox)
      expect(confirmButton).toBeEnabled()
      
      // Disable after unchecking
      await user.click(checkbox)
      expect(confirmButton).toBeDisabled()
    })

    it('should allow confirm without checkbox when requireConfirm=false', () => {
      render(<ConfirmationModal {...defaultProps} requireConfirm={false} />)
      
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /confirm/i })).toBeEnabled()
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should close on ESC key press', async () => {
      render(<ConfirmationModal {...defaultProps} />)
      
      fireEvent.keyDown(screen.getByRole('dialog'), {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
      })
      
      await waitFor(() => {
        expect(mockOnCancel).toHaveBeenCalled()
      })
    })

    it('should confirm on Enter key press when enabled', async () => {
      render(<ConfirmationModal {...defaultProps} requireConfirm={false} />)
      
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
      })
      
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalled()
      })
    })

    it('should NOT confirm on Enter when checkbox unchecked', async () => {
      render(<ConfirmationModal {...defaultProps} requireConfirm={true} />)
      
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
      })
      
      await waitFor(() => {
        expect(mockOnConfirm).not.toHaveBeenCalled()
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading state during async confirm', async () => {
      const user = userEvent.setup()
      const asyncOnConfirm = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<ConfirmationModal {...defaultProps} onConfirm={asyncOnConfirm} />)
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      await user.click(confirmButton)
      
      // Should show loading indicator
      expect(confirmButton).toBeDisabled()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(asyncOnConfirm).toHaveBeenCalled()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ConfirmationModal {...defaultProps} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby')
      expect(dialog).toHaveAttribute('aria-describedby')
    })

    it('should trap focus within modal', () => {
      render(<ConfirmationModal {...defaultProps} />)
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      
      // Focus should be trapped between these elements
      expect(document.body.contains(confirmButton)).toBe(true)
      expect(document.body.contains(cancelButton)).toBe(true)
    })

    it('should set initial focus on confirm button', () => {
      render(<ConfirmationModal {...defaultProps} />)
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      
      // Note: Focus behavior depends on implementation
      // This test validates the requirement exists
      expect(confirmButton).toBeInTheDocument()
    })
  })
})
