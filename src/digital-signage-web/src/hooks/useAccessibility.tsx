/**
 * Accessibility Utilities and Hooks
 * WCAG 2.1 AA compliance helpers
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Focus trap hook for modal dialogs
 * Traps keyboard focus within a container
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    // Focus first element on mount
    firstElement?.focus()

    container.addEventListener('keydown', handleTab)
    return () => container.removeEventListener('keydown', handleTab)
  }, [isActive])

  return containerRef
}

/**
 * Keyboard navigation hook
 * Handles arrow key navigation for lists and grids
 */
export function useKeyboardNavigation(
  itemCount: number,
  options?: {
    orientation?: 'horizontal' | 'vertical' | 'grid'
    gridColumns?: number
    loop?: boolean
  }
) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const { orientation = 'vertical', gridColumns = 3, loop = true } = options || {}

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newIndex = focusedIndex

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          if (orientation === 'grid') {
            newIndex = Math.min(focusedIndex + gridColumns, itemCount - 1)
          } else if (orientation === 'vertical') {
            newIndex = focusedIndex + 1
          }
          break

        case 'ArrowUp':
          e.preventDefault()
          if (orientation === 'grid') {
            newIndex = Math.max(focusedIndex - gridColumns, 0)
          } else if (orientation === 'vertical') {
            newIndex = focusedIndex - 1
          }
          break

        case 'ArrowRight':
          e.preventDefault()
          if (orientation === 'horizontal' || orientation === 'grid') {
            newIndex = focusedIndex + 1
          }
          break

        case 'ArrowLeft':
          e.preventDefault()
          if (orientation === 'horizontal' || orientation === 'grid') {
            newIndex = focusedIndex - 1
          }
          break

        case 'Home':
          e.preventDefault()
          newIndex = 0
          break

        case 'End':
          e.preventDefault()
          newIndex = itemCount - 1
          break

        default:
          return
      }

      // Handle looping
      if (loop) {
        if (newIndex >= itemCount) newIndex = 0
        if (newIndex < 0) newIndex = itemCount - 1
      } else {
        newIndex = Math.max(0, Math.min(itemCount - 1, newIndex))
      }

      setFocusedIndex(newIndex)
    },
    [focusedIndex, itemCount, orientation, gridColumns, loop]
  )

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  }
}

/**
 * Announce to screen readers
 * Uses ARIA live regions to announce changes
 */
export function useAnnounce() {
  const [announcement, setAnnouncement] = useState('')

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Clear previous announcement
    setAnnouncement('')

    // Set new announcement after a brief delay
    setTimeout(() => {
      setAnnouncement(message)
    }, 100)
  }, [])

  const AnnouncementRegion = () => (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  )

  return { announce, AnnouncementRegion }
}

/**
 * Skip link component for keyboard navigation
 * Allows users to skip to main content
 */
export function SkipLink({ href = '#main-content', children = 'Skip to main content' }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
    >
      {children}
    </a>
  )
}

/**
 * Visually hidden but accessible to screen readers
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

/**
 * Focus visible utility
 * Shows focus indicator only for keyboard navigation
 */
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  useEffect(() => {
    const handleMouseDown = () => setIsFocusVisible(false)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') setIsFocusVisible(true)
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return isFocusVisible
}

/**
 * Generate unique IDs for ARIA attributes
 */
let idCounter = 0
export function useId(prefix: string = 'id'): string {
  const [id] = useState(() => `${prefix}-${++idCounter}`)
  return id
}

/**
 * ARIA attributes builder
 */
export interface AriaAttributes {
  role?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-selected'?: boolean
  'aria-checked'?: boolean | 'mixed'
  'aria-disabled'?: boolean
  'aria-hidden'?: boolean
  'aria-live'?: 'polite' | 'assertive' | 'off'
  'aria-atomic'?: boolean
  'aria-busy'?: boolean
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean
  'aria-controls'?: string
  'aria-owns'?: string
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
}

export function buildAriaAttributes(attrs: AriaAttributes): Record<string, any> {
  return Object.fromEntries(
    Object.entries(attrs).filter(([_, value]) => value !== undefined)
  )
}

/**
 * Accessible button props
 */
export function useAccessibleButton(
  onClick?: () => void,
  options?: {
    disabled?: boolean
    pressed?: boolean
    expanded?: boolean
  }
) {
  return {
    type: 'button' as const,
    onClick,
    disabled: options?.disabled,
    'aria-pressed': options?.pressed,
    'aria-expanded': options?.expanded,
    'aria-disabled': options?.disabled,
  }
}

/**
 * Color contrast checker
 * Ensures WCAG AA compliance for text colors
 */
export function getContrastRatio(foreground: string, background: string): number {
  // Simplified version - in production use a proper color library
  const getLuminance = (color: string): number => {
    // This is a simplified calculation
    // Use a library like 'color' or 'chroma-js' for accurate results
    return 0.5 // Placeholder
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background)
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7
  }
  
  return size === 'large' ? ratio >= 3 : ratio >= 4.5
}

/**
 * Roving tabindex hook for managing focus in lists
 */
export function useRovingTabindex(itemCount: number) {
  const [focusedIndex, setFocusedIndex] = useState(0)

  const getTabIndex = (index: number) => (index === focusedIndex ? 0 : -1)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let newIndex = index

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault()
          newIndex = (index + 1) % itemCount
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault()
          newIndex = (index - 1 + itemCount) % itemCount
          break
        case 'Home':
          e.preventDefault()
          newIndex = 0
          break
        case 'End':
          e.preventDefault()
          newIndex = itemCount - 1
          break
        default:
          return
      }

      setFocusedIndex(newIndex)
    },
    [itemCount]
  )

  return {
    getTabIndex,
    handleKeyDown,
    focusedIndex,
  }
}
