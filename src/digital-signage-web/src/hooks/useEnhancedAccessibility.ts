/**
 * useEnhancedAccessibility Hook
 * 
 * Hook for enhanced accessibility features with dynamic ARIA announcements,
 * keyboard navigation management, and focus management for enhanced components.
 * 
 * @see copilot-instructions-web.md - Accessibility Rules
 * @see specs/021-user-schedule-assignment/tasks.md - T038 Requirements
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

export interface AriaAnnouncement {
  id: string
  message: string
  priority: 'polite' | 'assertive' | 'off'
  timestamp: number
}

export interface KeyboardNavigationConfig {
  /** Enable arrow key navigation */
  enableArrowKeys?: boolean
  /** Enable tab navigation */
  enableTabNavigation?: boolean
  /** Enable enter/space activation */
  enableActivation?: boolean
  /** Enable escape key handling */
  enableEscapeKey?: boolean
  /** Custom key handlers */
  customKeyHandlers?: Record<string, (event: KeyboardEvent) => void>
  /** Navigation boundaries */
  boundaries?: {
    horizontal?: boolean
    vertical?: boolean
    wrap?: boolean
  }
}

export interface FocusManagementConfig {
  /** Auto-focus first element */
  autoFocusFirst?: boolean
  /** Trap focus within container */
  trapFocus?: boolean
  /** Return focus on cleanup */
  returnFocus?: boolean
  /** Focus selector query */
  focusableSelector?: string
  /** Skip focus for elements */
  skipFocusSelector?: string
}

export interface AccessibilityConfig {
  /** Component identifier for announcements */
  componentId?: string
  /** Aria announcements configuration */
  announcements?: {
    enabled?: boolean
    container?: HTMLElement | null
    defaultPriority?: 'polite' | 'assertive'
  }
  /** Keyboard navigation configuration */
  keyboardNavigation?: KeyboardNavigationConfig
  /** Focus management configuration */
  focusManagement?: FocusManagementConfig
  /** Enable high contrast detection */
  enableHighContrastDetection?: boolean
  /** Enable reduced motion detection */
  enableReducedMotionDetection?: boolean
  /** Enable color blindness considerations */
  enableColorBlindnessSupport?: boolean
  /** Custom accessibility checks */
  customChecks?: Array<() => boolean>
}

export interface AccessibilityState {
  /** Current focus element */
  focusedElement: HTMLElement | null
  /** Is high contrast mode active */
  isHighContrast: boolean
  /** Is reduced motion preferred */
  prefersReducedMotion: boolean
  /** Is keyboard navigation active */
  isKeyboardNavigating: boolean
  /** Current announcements */
  announcements: AriaAnnouncement[]
  /** Accessibility issues found */
  issues: string[]
}

export interface EnhancedAccessibilityResult {
  /** Current accessibility state */
  state: AccessibilityState
  /** Make an ARIA announcement */
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  /** Clear all announcements */
  clearAnnouncements: () => void
  /** Set focus to element */
  setFocus: (element: HTMLElement | null) => void
  /** Move focus to next element */
  focusNext: () => void
  /** Move focus to previous element */
  focusPrevious: () => void
  /** Move focus to first element */
  focusFirst: () => void
  /** Move focus to last element */
  focusLast: () => void
  /** Check if element is focusable */
  isFocusable: (element: HTMLElement) => boolean
  /** Get all focusable elements */
  getFocusableElements: () => HTMLElement[]
  /** Enable keyboard navigation */
  enableKeyboardNav: () => void
  /** Disable keyboard navigation */
  disableKeyboardNav: () => void
  /** Run accessibility audit */
  runAccessibilityAudit: () => string[]
  /** Get accessibility status */
  getAccessibilityStatus: () => {
    score: number
    issues: string[]
    recommendations: string[]
  }
}

const DEFAULT_FOCUSABLE_SELECTOR = [
  'button',
  'input',
  'select',
  'textarea',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(', ')

/**
 * Hook for comprehensive accessibility support
 * 
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null)
 * 
 * const {
 *   state,
 *   announce,
 *   setFocus,
 *   focusNext,
 *   runAccessibilityAudit,
 *   getAccessibilityStatus
 * } = useEnhancedAccessibility({
 *   componentId: 'user-schedule-assignment',
 *   announcements: {
 *     enabled: true,
 *     defaultPriority: 'polite'
 *   },
 *   keyboardNavigation: {
 *     enableArrowKeys: true,
 *     enableTabNavigation: true,
 *     enableActivation: true,
 *     boundaries: { wrap: true }
 *   },
 *   focusManagement: {
 *     trapFocus: true,
 *     returnFocus: true
 *   }
 * })
 * 
 * useEffect(() => {
 *   if (bulkOperationProgress) {
 *     announce(`Bulk operation ${bulkOperationProgress.percentage}% complete`)
 *   }
 * }, [bulkOperationProgress, announce])
 * 
 * const handleKeyDown = (event: KeyboardEvent) => {
 *   if (event.key === 'ArrowDown') {
 *     focusNext()
 *     event.preventDefault()
 *   }
 * }
 * ```
 */
export function useEnhancedAccessibility(
  config: AccessibilityConfig = {}
): EnhancedAccessibilityResult {
  const {
    componentId = 'enhanced-component',
    announcements = {},
    keyboardNavigation = {},
    focusManagement = {},
    enableHighContrastDetection = true,
    enableReducedMotionDetection = true,
    enableColorBlindnessSupport = false,
    customChecks = []
  } = config

  const {
    enabled: announcementsEnabled = true,
    container: announcementContainer,
    defaultPriority = 'polite'
  } = announcements

  const {
    enableArrowKeys = true,
    enableTabNavigation = true,
    enableActivation = true,
    enableEscapeKey = true,
    customKeyHandlers = {},
    boundaries = { wrap: true }
  } = keyboardNavigation

  const {
    autoFocusFirst = false,
    trapFocus = false,
    returnFocus = true,
    focusableSelector = DEFAULT_FOCUSABLE_SELECTOR,
    skipFocusSelector = '[data-skip-focus="true"]'
  } = focusManagement

  // State
  const [announcements_, setAnnouncements] = useState<AriaAnnouncement[]>([])
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false)
  const [issues, setIssues] = useState<string[]>([])

  // Refs
  const containerRef = useRef<HTMLElement | null>(null)
  const announcementAreaRef = useRef<HTMLDivElement | null>(null)
  const originalFocus = useRef<HTMLElement | null>(null)
  const keyboardNavActive = useRef<boolean>(false)

  // Detect system preferences
  const prefersReducedMotion = useMemo(() => {
    if (!enableReducedMotionDetection) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [enableReducedMotionDetection])

  const isHighContrast = useMemo(() => {
    if (!enableHighContrastDetection) return false
    
    // Check for high contrast mode (mainly Windows)
    const testElement = document.createElement('div')
    testElement.style.backgroundColor = 'rgb(31, 41, 59)'
    testElement.style.color = 'rgb(255, 255, 255)'
    document.body.appendChild(testElement)
    
    const computedStyle = window.getComputedStyle(testElement)
    const isHighContrast = computedStyle.backgroundColor === computedStyle.color
    
    document.body.removeChild(testElement)
    return isHighContrast
  }, [enableHighContrastDetection])

  // Generate unique announcement ID
  const generateAnnouncementId = useCallback(() => {
    return `${componentId}-announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [componentId])

  // Create announcement area
  useEffect(() => {
    if (!announcementsEnabled) return

    const existingArea = document.getElementById(`${componentId}-announcements`)
    if (existingArea) {
      announcementAreaRef.current = existingArea as HTMLDivElement
      return
    }

    const announcementArea = document.createElement('div')
    announcementArea.id = `${componentId}-announcements`
    announcementArea.setAttribute('aria-live', defaultPriority)
    announcementArea.setAttribute('aria-atomic', 'true')
    announcementArea.style.position = 'absolute'
    announcementArea.style.left = '-10000px'
    announcementArea.style.width = '1px'
    announcementArea.style.height = '1px'
    announcementArea.style.overflow = 'hidden'

    const targetContainer = announcementContainer || document.body
    targetContainer.appendChild(announcementArea)
    announcementAreaRef.current = announcementArea

    return () => {
      if (announcementArea.parentNode) {
        announcementArea.parentNode.removeChild(announcementArea)
      }
    }
  }, [announcementsEnabled, componentId, defaultPriority, announcementContainer])

  // Make ARIA announcement
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = defaultPriority) => {
    if (!announcementsEnabled || !message.trim()) return

    const announcement: AriaAnnouncement = {
      id: generateAnnouncementId(),
      message: message.trim(),
      priority,
      timestamp: Date.now()
    }

    setAnnouncements(prev => [...prev.slice(-9), announcement]) // Keep last 10

    // Update announcement area
    if (announcementAreaRef.current) {
      announcementAreaRef.current.setAttribute('aria-live', priority)
      announcementAreaRef.current.textContent = message
      
      // Clear after a delay to allow screen readers to announce
      setTimeout(() => {
        if (announcementAreaRef.current) {
          announcementAreaRef.current.textContent = ''
        }
      }, 100)
    }
  }, [announcementsEnabled, defaultPriority, generateAnnouncementId])

  // Clear announcements
  const clearAnnouncements = useCallback(() => {
    setAnnouncements([])
    if (announcementAreaRef.current) {
      announcementAreaRef.current.textContent = ''
    }
  }, [])

  // Check if element is focusable
  const isFocusable = useCallback((element: HTMLElement): boolean => {
    if (!element || element.hasAttribute('disabled')) return false
    if (element.matches(skipFocusSelector)) return false
    
    return element.matches(focusableSelector) && 
           element.offsetWidth > 0 && 
           element.offsetHeight > 0 &&
           window.getComputedStyle(element).visibility !== 'hidden'
  }, [focusableSelector, skipFocusSelector])

  // Get all focusable elements
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return []
    
    const elements = Array.from(containerRef.current.querySelectorAll(focusableSelector))
    return elements.filter(el => isFocusable(el as HTMLElement)) as HTMLElement[]
  }, [focusableSelector, isFocusable])

  // Set focus to element
  const setFocus = useCallback((element: HTMLElement | null) => {
    if (!element) return
    
    try {
      element.focus()
      setFocusedElement(element)
      setIsKeyboardNavigating(true)
    } catch (error) {
      console.warn('Failed to set focus:', error)
    }
  }, [])

  // Focus navigation functions
  const focusNext = useCallback(() => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const currentIndex = focusedElement 
      ? focusableElements.indexOf(focusedElement)
      : -1

    let nextIndex = currentIndex + 1
    if (nextIndex >= focusableElements.length) {
      nextIndex = boundaries.wrap ? 0 : focusableElements.length - 1
    }

    const nextElement = focusableElements[nextIndex]
    if (nextElement) setFocus(nextElement)
  }, [getFocusableElements, focusedElement, boundaries.wrap, setFocus])

  const focusPrevious = useCallback(() => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const currentIndex = focusedElement 
      ? focusableElements.indexOf(focusedElement)
      : -1

    let prevIndex = currentIndex - 1
    if (prevIndex < 0) {
      prevIndex = boundaries.wrap ? focusableElements.length - 1 : 0
    }

    const prevElement = focusableElements[prevIndex]
    if (prevElement) setFocus(prevElement)
  }, [getFocusableElements, focusedElement, boundaries.wrap, setFocus])

  const focusFirst = useCallback(() => {
    const focusableElements = getFocusableElements()
    const firstElement = focusableElements[0]
    if (firstElement) {
      setFocus(firstElement)
    }
  }, [getFocusableElements, setFocus])

  const focusLast = useCallback(() => {
    const focusableElements = getFocusableElements()
    const lastElement = focusableElements[focusableElements.length - 1]
    if (lastElement) {
      setFocus(lastElement)
    }
  }, [getFocusableElements, setFocus])

  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!keyboardNavActive.current) return

    const { key, ctrlKey, altKey, shiftKey } = event
    
    // Handle custom key handlers first
    const customHandler = customKeyHandlers[key] || customKeyHandlers[`${key}${ctrlKey ? '+Ctrl' : ''}${altKey ? '+Alt' : ''}${shiftKey ? '+Shift' : ''}`]
    if (customHandler) {
      customHandler(event)
      return
    }

    // Handle standard navigation keys
    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        if (enableArrowKeys) {
          focusNext()
          event.preventDefault()
        }
        break
      
      case 'ArrowUp':
      case 'ArrowLeft':
        if (enableArrowKeys) {
          focusPrevious()
          event.preventDefault()
        }
        break
      
      case 'Home':
        if (enableArrowKeys) {
          focusFirst()
          event.preventDefault()
        }
        break
      
      case 'End':
        if (enableArrowKeys) {
          focusLast()
          event.preventDefault()
        }
        break
      
      case 'Enter':
      case ' ':
        if (enableActivation && focusedElement) {
          const clickEvent = new MouseEvent('click', { bubbles: true })
          focusedElement.dispatchEvent(clickEvent)
          event.preventDefault()
        }
        break
      
      case 'Escape':
        if (enableEscapeKey) {
          // Return focus to original element or blur current
          if (originalFocus.current) {
            setFocus(originalFocus.current)
          } else if (focusedElement) {
            focusedElement.blur()
            setFocusedElement(null)
          }
          event.preventDefault()
        }
        break
      
      case 'Tab':
        if (!enableTabNavigation) {
          event.preventDefault()
        }
        setIsKeyboardNavigating(true)
        break
    }
  }, [
    customKeyHandlers,
    enableArrowKeys,
    enableActivation,
    enableEscapeKey,
    enableTabNavigation,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusedElement,
    setFocus
  ])

  // Enable keyboard navigation
  const enableKeyboardNav = useCallback(() => {
    if (keyboardNavActive.current) return
    
    keyboardNavActive.current = true
    document.addEventListener('keydown', handleKeyDown)
    
    // Store original focus
    originalFocus.current = document.activeElement as HTMLElement
    
    // Auto-focus first element if configured
    if (autoFocusFirst) {
      focusFirst()
    }
  }, [handleKeyDown, autoFocusFirst, focusFirst])

  // Disable keyboard navigation
  const disableKeyboardNav = useCallback(() => {
    if (!keyboardNavActive.current) return
    
    keyboardNavActive.current = false
    document.removeEventListener('keydown', handleKeyDown)
    
    // Return focus if configured
    if (returnFocus && originalFocus.current) {
      originalFocus.current.focus()
    }
    
    setIsKeyboardNavigating(false)
  }, [handleKeyDown, returnFocus])

  // Run accessibility audit
  const runAccessibilityAudit = useCallback((): string[] => {
    const auditIssues: string[] = []
    
    if (!containerRef.current) {
      auditIssues.push('No container element found for accessibility audit')
      return auditIssues
    }

    const container = containerRef.current

    // Check for missing alt text on images
    const images = container.querySelectorAll('img:not([alt])')
    if (images.length > 0) {
      auditIssues.push(`${images.length} images missing alt text`)
    }

    // Check for buttons without accessible names
    const buttons = container.querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
    const buttonsWithoutText = Array.from(buttons).filter(btn => !btn.textContent?.trim())
    if (buttonsWithoutText.length > 0) {
      auditIssues.push(`${buttonsWithoutText.length} buttons without accessible names`)
    }

    // Check for form inputs without labels
    const inputs = container.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
    const inputsWithoutLabels = Array.from(inputs).filter(input => {
      const id = input.getAttribute('id')
      return !id || !container.querySelector(`label[for="${id}"]`)
    })
    if (inputsWithoutLabels.length > 0) {
      auditIssues.push(`${inputsWithoutLabels.length} form inputs without labels`)
    }

    // Check for low contrast (basic check)
    if (enableColorBlindnessSupport) {
      const elementsWithLowContrast = container.querySelectorAll('[style*="color:"]')
      if (elementsWithLowContrast.length > 0) {
        auditIssues.push('Elements with inline color styles detected - check contrast ratios')
      }
    }

    // Run custom checks
    customChecks.forEach((check, index) => {
      try {
        if (!check()) {
          auditIssues.push(`Custom accessibility check ${index + 1} failed`)
        }
      } catch (error) {
        auditIssues.push(`Custom accessibility check ${index + 1} threw error: ${error}`)
      }
    })

    setIssues(auditIssues)
    return auditIssues
  }, [enableColorBlindnessSupport, customChecks])

  // Get accessibility status
  const getAccessibilityStatus = useCallback(() => {
    const auditResults = runAccessibilityAudit()
    const totalChecks = 4 + customChecks.length // Basic checks + custom checks
    const passedChecks = totalChecks - auditResults.length
    const score = Math.round((passedChecks / totalChecks) * 100)

    const recommendations: string[] = []
    if (auditResults.length > 0) {
      recommendations.push('Address accessibility issues found in audit')
    }
    if (!announcementsEnabled) {
      recommendations.push('Enable ARIA announcements for better screen reader support')
    }
    if (!enableArrowKeys) {
      recommendations.push('Enable arrow key navigation for better keyboard accessibility')
    }

    return {
      score,
      issues: auditResults,
      recommendations
    }
  }, [runAccessibilityAudit, customChecks.length, announcementsEnabled, enableArrowKeys])

  // Initialize and cleanup
  useEffect(() => {
    // Auto-enable keyboard navigation
    enableKeyboardNav()

    return () => {
      disableKeyboardNav()
    }
  }, [enableKeyboardNav, disableKeyboardNav])

  // Track focus changes
  useEffect(() => {
    const handleFocusChange = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      if (target && isFocusable(target)) {
        setFocusedElement(target)
      }
    }

    document.addEventListener('focusin', handleFocusChange)
    return () => document.removeEventListener('focusin', handleFocusChange)
  }, [isFocusable])

  // Focus trap
  useEffect(() => {
    if (!trapFocus || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = getFocusableElements()
    
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleFocusTrap = (event: FocusEvent) => {
      if (!container.contains(event.target as Node)) {
        if (firstElement) {
          firstElement.focus()
          event.preventDefault()
        }
      }
    }

    document.addEventListener('focusin', handleFocusTrap)
    return () => document.removeEventListener('focusin', handleFocusTrap)
  }, [trapFocus, getFocusableElements])

  const state: AccessibilityState = {
    focusedElement,
    isHighContrast,
    prefersReducedMotion,
    isKeyboardNavigating,
    announcements: announcements_,
    issues
  }

  return {
    state,
    announce,
    clearAnnouncements,
    setFocus,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    isFocusable,
    getFocusableElements,
    enableKeyboardNav,
    disableKeyboardNav,
    runAccessibilityAudit,
    getAccessibilityStatus
  }
}

export default useEnhancedAccessibility