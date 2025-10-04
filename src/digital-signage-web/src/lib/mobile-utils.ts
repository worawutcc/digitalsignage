/**
 * Mobile Utilities
 * 
 * Utilities for mobile-responsive user interfaces, touch interactions,
 * and mobile-optimized user experience patterns.
 * 
 * @see T031 - Mobile user management enhancement
 */

import React, { useEffect, useState, useCallback } from 'react'

// ============================================================================
// MOBILE DETECTION & VIEWPORT UTILITIES
// ============================================================================

export interface ViewportInfo {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
}

/**
 * Hook for responsive viewport information
 */
export function useViewport(): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        orientation: 'landscape',
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight
    
    return {
      width,
      height,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      orientation: width > height ? 'landscape' : 'portrait',
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        orientation: width > height ? 'landscape' : 'portrait',
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewport
}

// ============================================================================
// TOUCH INTERACTION UTILITIES
// ============================================================================

export interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: (e: React.TouchEvent) => void
  threshold?: number
}

/**
 * Hook for touch gesture handling
 */
export function useTouchGestures(options: TouchGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTouchStart,
    onTouchEnd,
    threshold = 50,
  } = options

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
    })
    onTouchStart?.(e)
  }, [onTouchStart])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return

    const touch = e.changedTouches[0]
    if (!touch) return
    
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y

    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Determine swipe direction
    if (Math.max(absDeltaX, absDeltaY) > threshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }
    }

    setTouchStart(null)
    onTouchEnd?.(e)
  }, [touchStart, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTouchEnd])

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  }
}

// ============================================================================
// MOBILE UI PATTERN UTILITIES
// ============================================================================

/**
 * Mobile responsive breakpoints
 */
export const MOBILE_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1024,
} as const

/**
 * Mobile-optimized CSS classes
 */
export const MOBILE_CLASSES = {
  touchTarget: 'min-h-[44px] min-w-[44px] touch-manipulation',
  mobileCard: 'bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700',
  mobileList: 'divide-y divide-gray-200 dark:divide-gray-700',
  mobileListItem: 'py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 touch-manipulation',
  mobileButton: 'px-4 py-3 text-base font-medium rounded-lg transition-colors touch-manipulation',
  mobileInput: 'block w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg',
} as const

// ============================================================================
// MOBILE MODAL & OVERLAY UTILITIES
// ============================================================================

export interface MobileDrawerOptions {
  isOpen: boolean
  onClose: () => void
  position?: 'bottom' | 'right'
  backdrop?: boolean
}

/**
 * Hook for mobile drawer/bottom sheet functionality
 */
export function useMobileDrawer({
  isOpen,
  onClose,
  position = 'bottom',
  backdrop = true,
}: MobileDrawerOptions) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const drawerClasses = `
    fixed z-50 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out
    ${position === 'bottom' 
      ? `bottom-0 left-0 right-0 rounded-t-lg transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}` 
      : `top-0 right-0 bottom-0 w-80 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
    }
  `

  const backdropClasses = `
    fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300
    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `

  return {
    drawerClasses,
    backdropClasses,
    closeDrawer: onClose,
  }
}

/**
 * Mobile responsive class utilities
 */
export const getMobileResponsiveClasses = (baseClasses: string, mobileClasses: string, tabletClasses?: string) => {
  return `${baseClasses} ${mobileClasses} ${tabletClasses ? `md:${tabletClasses}` : ''}`
}

/**
 * Touch-friendly size utilities
 */
export const getTouchFriendlySize = (size: 'sm' | 'md' | 'lg') => {
  const sizes = {
    sm: 'min-h-[40px] min-w-[40px]',
    md: 'min-h-[44px] min-w-[44px]',
    lg: 'min-h-[48px] min-w-[48px]',
  }
  return sizes[size]
}