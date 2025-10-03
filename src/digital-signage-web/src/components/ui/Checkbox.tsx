'use client'

/**
 * Checkbox Component
 * 
 * Simple checkbox component with proper accessibility.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 */

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  indeterminate = false,
  className,
  id,
  'aria-label': ariaLabel,
  'data-testid': testId,
}: CheckboxProps) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      id={id}
      data-testid={testId}
      className={cn(
        'inline-flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        checked && 'border-blue-600 bg-blue-600',
        indeterminate && 'border-blue-600 bg-blue-600',
        disabled && 'cursor-not-allowed opacity-50 bg-gray-100',
        className
      )}
    >
      {checked && !indeterminate && (
        <Check className="h-3 w-3" />
      )}
      {indeterminate && (
        <div className="h-0.5 w-2 bg-white rounded" />
      )}
    </button>
  )
}