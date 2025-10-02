/**
 * useToast Hook
 * 
 * Toast notification hook using react-hot-toast.
 * Provides consistent toast notifications across the application.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 * @see https://react-hot-toast.com/docs
 */

'use client'

import { useCallback } from 'react'
import toast from 'react-hot-toast'

export interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'success' | 'destructive' | 'warning'
  duration?: number
}

/**
 * Hook for showing toast notifications
 * 
 * @example
 * ```tsx
 * const { toast: showToast } = useToast()
 * 
 * showToast({
 *   title: 'Success',
 *   description: 'Operation completed successfully',
 *   variant: 'success'
 * })
 * ```
 */
export function useToast() {
  const showToast = useCallback((options: ToastOptions) => {
    const { title, description, variant = 'default', duration = 4000 } = options
    
    const message = description ? `${title}\n${description}` : title
    
    switch (variant) {
      case 'success':
        toast.success(message, {
          duration,
          icon: '✅',
          style: {
            background: '#10b981',
            color: '#fff',
          },
        })
        break
      
      case 'destructive':
        toast.error(message, {
          duration,
          icon: '❌',
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        })
        break
      
      case 'warning':
        toast(message, {
          duration,
          icon: '⚠️',
          style: {
            background: '#f59e0b',
            color: '#fff',
          },
        })
        break
      
      default:
        toast(message, {
          duration,
          icon: 'ℹ️',
        })
    }
  }, [])
  
  return {
    toast: showToast,
  }
}

export default useToast
