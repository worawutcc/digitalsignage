/**
 * Checkbox Component Types
 * 
 * Type definitions for Checkbox component.
 * 
 * @see Checkbox.tsx
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

export interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  indeterminate?: boolean
  className?: string
  id?: string
  'aria-label'?: string
  'data-testid'?: string
}
