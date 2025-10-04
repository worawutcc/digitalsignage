/**
 * Mobile UI Components
 * 
 * Mobile-optimized React components for responsive user interfaces
 * and touch-friendly interactions.
 * 
 * @see T031 - Mobile user management enhancement
 */

'use client'

import React, { useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { useMobileDrawer, useTouchGestures, MOBILE_CLASSES } from '@/lib/mobile-utils'

// ============================================================================
// MOBILE TABLE COMPONENT
// ============================================================================

export interface MobileTableProps<T> {
  data: T[]
  renderCard: (item: T, index: number) => React.ReactNode
  onItemSelect?: (item: T) => void
  selectedItems?: Set<any>
  loading?: boolean
  emptyMessage?: string
  className?: string
}

/**
 * Mobile-optimized table as card list
 */
export function MobileTable<T extends { [key: string]: any }>({ 
  data, 
  renderCard, 
  onItemSelect, 
  selectedItems, 
  loading, 
  emptyMessage = 'No items found',
  className = '' 
}: MobileTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${MOBILE_CLASSES.mobileCard} animate-pulse`}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {data.map((item, index) => (
        <div
          key={item.id || index}
          className={`
            ${MOBILE_CLASSES.mobileCard}
            ${selectedItems?.has(item.id) 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-200 dark:border-gray-700'
            }
            ${onItemSelect ? 'cursor-pointer hover:shadow-md' : ''}
            transition-all duration-200
          `}
          onClick={() => onItemSelect?.(item)}
        >
          {renderCard(item, index)}
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// MOBILE SEARCH COMPONENT
// ============================================================================

export interface MobileSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onClear?: () => void
  className?: string
}

/**
 * Mobile-optimized search input
 */
export function MobileSearch({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  onClear,
  className = '' 
}: MobileSearchProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          ${MOBILE_CLASSES.mobileInput}
          pl-10 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent
          dark:bg-gray-700 dark:text-white
          placeholder-gray-500 dark:placeholder-gray-400
        `}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      )}
    </div>
  )
}

// ============================================================================
// MOBILE PAGINATION COMPONENT
// ============================================================================

export interface MobilePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  pageSize?: number
  loading?: boolean
  className?: string
}

/**
 * Mobile-optimized pagination component
 */
export function MobilePagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems,
  pageSize,
  loading, 
  className = '' 
}: MobilePaginationProps) {
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <div className={`flex items-center justify-between py-4 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious || loading}
        className={`
          ${MOBILE_CLASSES.mobileButton}
          text-gray-700 dark:text-gray-300
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          hover:bg-gray-50 dark:hover:bg-gray-700
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        ← Previous
      </button>

      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        {totalItems && pageSize && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
          </span>
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext || loading}
        className={`
          ${MOBILE_CLASSES.mobileButton}
          text-gray-700 dark:text-gray-300
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          hover:bg-gray-50 dark:hover:bg-gray-700
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        Next →
      </button>
    </div>
  )
}

// ============================================================================
// MOBILE FORM FIELD COMPONENT
// ============================================================================

export interface MobileFormFieldProps {
  label: string
  children: React.ReactNode
  error?: string
  required?: boolean
  className?: string
}

/**
 * Mobile-optimized form field wrapper
 */
export function MobileFormField({ 
  label, 
  children, 
  error, 
  required, 
  className = '' 
}: MobileFormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-1">
        {children}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// MOBILE DRAWER COMPONENT
// ============================================================================

export interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  position?: 'bottom' | 'right'
  children: React.ReactNode
  className?: string
}

/**
 * Mobile drawer/bottom sheet component
 */
export function MobileDrawer({
  isOpen,
  onClose,
  title,
  position = 'bottom',
  children,
  className = '',
}: MobileDrawerProps) {
  const { drawerClasses, backdropClasses } = useMobileDrawer({
    isOpen,
    onClose,
    position,
  })

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className={backdropClasses} onClick={onClose} />
      
      {/* Drawer */}
      <div className={`${drawerClasses} ${className}`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  )
}

// ============================================================================
// TOUCH BUTTON COMPONENT
// ============================================================================

export interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

/**
 * Touch-optimized button component with haptic feedback
 */
export function TouchButton({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children,
  ...props 
}: TouchButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 active:scale-95 touch-manipulation select-none'
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md active:shadow-sm',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
    ghost: 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300'
  }
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ============================================================================
// MOBILE LIST COMPONENT
// ============================================================================

export interface MobileListProps {
  items: any[]
  renderItem: (item: any, index: number) => React.ReactNode
  onItemTap?: (item: any, index: number) => void
  onItemSwipe?: (item: any, index: number, direction: 'left' | 'right') => void
  className?: string
}

/**
 * Mobile-optimized list component with touch interactions
 */
export function MobileList({ 
  items, 
  renderItem, 
  onItemTap, 
  onItemSwipe, 
  className = '' 
}: MobileListProps) {
  const handleItemInteraction = useCallback((item: any, index: number) => {
    return useTouchGestures({
      onSwipeLeft: () => onItemSwipe?.(item, index, 'left'),
      onSwipeRight: () => onItemSwipe?.(item, index, 'right'),
      onTouchEnd: () => onItemTap?.(item, index),
    })
  }, [onItemTap, onItemSwipe])

  return (
    <div className={`${MOBILE_CLASSES.mobileList} ${className}`}>
      {items.map((item, index) => (
        <div
          key={item.id || index}
          className={MOBILE_CLASSES.mobileListItem}
          {...handleItemInteraction(item, index)}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}