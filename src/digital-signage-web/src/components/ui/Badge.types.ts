/**
 * Badge Component Types
 * 
 * Type definitions for Badge component.
 * 
 * @see Badge.tsx
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'data-testid'?: string
}
