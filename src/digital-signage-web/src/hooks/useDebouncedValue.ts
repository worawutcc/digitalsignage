/**
 * useDebouncedValue Hook
 * 
 * Debounces a value to prevent excessive updates or API calls.
 * Commonly used for search inputs to wait for user to finish typing
 * before triggering expensive operations.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 * 
 * @example
 * ```tsx
 * const [searchQuery, setSearchQuery] = useState('')
 * const debouncedQuery = useDebouncedValue(searchQuery, 300)
 * 
 * // Use debouncedQuery for API calls
 * useEffect(() => {
 *   if (debouncedQuery) {
 *     fetchResults(debouncedQuery)
 *   }
 * }, [debouncedQuery])
 * ```
 * 
 * @see specs/020-phase-1/tasks.md - T052 Debounced Search
 * @see copilot-instructions-web.md - Custom Hooks
 */

import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up the timeout to update debounced value after delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: clear timeout if value changes before delay expires
    return () => {
      clearTimeout(timeoutId)
    }
  }, [value, delay])

  return debouncedValue
}
