'use client'

/**
 * Badge Component
 * 
 * Simple badge component for status indicators and labels.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'data-testid'?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  'data-testid': testId,
}: BadgeProps) {
  return (
    <span
      data-testid={testId}
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        // Size variants
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-0.5 text-xs',
        size === 'lg' && 'px-3 py-1 text-sm',
        // Color variants
        variant === 'default' && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        variant === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        variant === 'warning' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        variant === 'error' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        variant === 'info' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        className
      )}
    >
      {children}
    </span>
  )
}