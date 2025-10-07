import { useState, useEffect } from 'react'

/**
 * Hook for persistent state management with localStorage
 * 
 * Provides React state synchronized with browser localStorage with full SSR safety.
 * Automatically handles JSON serialization/deserialization and error cases.
 * Safe to use in Next.js server-side rendering context.
 * 
 * @template T - Type of the stored value
 * @param key - localStorage key name
 * @param initialValue - Default value if key doesn't exist or SSR context
 * @returns Tuple of [storedValue, setValue] matching useState API
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const [theme, setTheme] = useLocalStorage('theme', 'light')
 * 
 * // Complex objects
 * interface UserPrefs {
 *   sidebar: boolean
 *   notifications: boolean
 * }
 * const [prefs, setPrefs] = useLocalStorage<UserPrefs>('prefs', {
 *   sidebar: true,
 *   notifications: true
 * })
 * 
 * // Update with function
 * setPrefs(prev => ({ ...prev, sidebar: false }))
 * ```
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}