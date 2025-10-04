/**
 * useEnhancedSearch Hook
 * 
 * Hook for debounced search functionality with advanced filtering,
 * search result caching, and fuzzy search integration.
 * 
 * @see copilot-instructions-web.md - Performance Rules
 * @see specs/021-user-schedule-assignment/tasks.md - T035 Requirements
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useDebouncedValue } from './useDebouncedValue'

export interface SearchFilter<T = any> {
  /** Filter field name */
  field: keyof T | string
  /** Filter operator */
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notIn' | 'between'
  /** Filter value */
  value: any
  /** Filter label for UI */
  label?: string
  /** Whether filter is active */
  active?: boolean
}

export interface SortConfig<T = any> {
  /** Field to sort by */
  field: keyof T | string
  /** Sort direction */
  direction: 'asc' | 'desc'
  /** Custom sort function */
  sortFn?: (a: T, b: T) => number
}

export interface SearchConfig<T = any> {
  /** Items to search through */
  items: T[]
  /** Fields to search in */
  searchFields: (keyof T | string)[]
  /** Debounce delay in milliseconds */
  debounceDelay?: number
  /** Enable fuzzy search */
  enableFuzzySearch?: boolean
  /** Fuzzy search threshold (0-1) */
  fuzzyThreshold?: number
  /** Enable result caching */
  enableCaching?: boolean
  /** Cache size limit */
  cacheSize?: number
  /** Minimum search length */
  minSearchLength?: number
  /** Enable search highlighting */
  enableHighlighting?: boolean
  /** Highlight class name */
  highlightClassName?: string
  /** Case sensitive search */
  caseSensitive?: boolean
  /** Custom search function */
  customSearchFn?: (item: T, query: string, fields: (keyof T | string)[]) => boolean
  /** Custom filter function */
  customFilterFn?: (item: T, filters: SearchFilter<T>[]) => boolean
}

export interface SearchResult<T = any> {
  /** Filtered and sorted items */
  items: T[]
  /** Total items count before filtering */
  totalCount: number
  /** Filtered items count */
  filteredCount: number
  /** Search query */
  query: string
  /** Active filters */
  filters: SearchFilter<T>[]
  /** Sort configuration */
  sortConfig: SortConfig<T> | null
  /** Search statistics */
  stats: {
    searchTime: number
    cacheHit: boolean
    fuzzyMatches: number
    exactMatches: number
  }
  /** Highlighted items (if highlighting enabled) */
  highlightedItems?: Array<T & { _highlights?: Record<string, string> | undefined }> | undefined
}

export interface EnhancedSearchResult<T = any> {
  /** Current search result */
  result: SearchResult<T>
  /** Search query */
  query: string
  /** Set search query */
  setQuery: (query: string) => void
  /** Active filters */
  filters: SearchFilter<T>[]
  /** Add filter */
  addFilter: (filter: SearchFilter<T>) => void
  /** Remove filter */
  removeFilter: (field: keyof T | string) => void
  /** Update filter */
  updateFilter: (field: keyof T | string, updates: Partial<SearchFilter<T>>) => void
  /** Clear all filters */
  clearFilters: () => void
  /** Toggle filter active state */
  toggleFilter: (field: keyof T | string) => void
  /** Sort configuration */
  sortConfig: SortConfig<T> | null
  /** Set sort configuration */
  setSortConfig: (config: SortConfig<T> | null) => void
  /** Is searching/filtering */
  isLoading: boolean
  /** Clear search and filters */
  reset: () => void
  /** Search suggestions */
  suggestions: string[]
  /** Cache statistics */
  cacheStats: {
    size: number
    hitRate: number
    hits: number
    misses: number
  }
}

/**
 * Simple fuzzy search implementation
 */
function fuzzyMatch(text: string, pattern: string, threshold: number = 0.6): boolean {
  if (pattern.length === 0) return true
  if (text.length === 0) return false

  const textLower = text.toLowerCase()
  const patternLower = pattern.toLowerCase()

  // Exact match
  if (textLower.includes(patternLower)) return true

  // Fuzzy matching with simple scoring
  let score = 0
  let patternIndex = 0
  
  for (let i = 0; i < textLower.length && patternIndex < patternLower.length; i++) {
    if (textLower[i] === patternLower[patternIndex]) {
      score++
      patternIndex++
    }
  }
  
  const fuzzyScore = score / pattern.length
  return fuzzyScore >= threshold
}

/**
 * Highlight matches in text
 */
function highlightText(text: string, query: string, className: string = 'highlight'): string {
  if (!query || !text) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, `<span class="${className}">$1</span>`)
}

/**
 * Enhanced search hook with advanced filtering and fuzzy search
 * 
 * @example
 * ```tsx
 * const {
 *   result,
 *   query,
 *   setQuery,
 *   addFilter,
 *   removeFilter,
 *   setSortConfig,
 *   isLoading
 * } = useEnhancedSearch({
 *   items: users,
 *   searchFields: ['name', 'email', 'role'],
 *   enableFuzzySearch: true,
 *   enableCaching: true,
 *   enableHighlighting: true
 * })
 * 
 * return (
 *   <div>
 *     <input
 *       value={query}
 *       onChange={(e) => setQuery(e.target.value)}
 *       placeholder="Search users..."
 *     />
 *     
 *     <button onClick={() => addFilter({
 *       field: 'role',
 *       operator: 'equals',
 *       value: 'admin',
 *       label: 'Admin Users'
 *     })}>
 *       Filter Admins
 *     </button>
 *     
 *     {result.items.map(user => (
 *       <UserCard key={user.id} user={user} />
 *     ))}
 *   </div>
 * )
 * ```
 */
export function useEnhancedSearch<T = any>(config: SearchConfig<T>): EnhancedSearchResult<T> {
  const {
    items,
    searchFields,
    debounceDelay = 300,
    enableFuzzySearch = false,
    fuzzyThreshold = 0.6,
    enableCaching = true,
    cacheSize = 100,
    minSearchLength = 0,
    enableHighlighting = false,
    highlightClassName = 'highlight',
    caseSensitive = false,
    customSearchFn,
    customFilterFn
  } = config

  // State
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilter<T>[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Cache
  const cache = useRef<Map<string, SearchResult<T>>>(new Map())
  const cacheStats = useRef({ hits: 0, misses: 0 })

  // Debounced query
  const debouncedQuery = useDebouncedValue(query, debounceDelay)

  // Generate cache key
  const generateCacheKey = useCallback((
    searchQuery: string,
    activeFilters: SearchFilter<T>[],
    sort: SortConfig<T> | null
  ): string => {
    const filtersKey = activeFilters
      .filter(f => f.active !== false)
      .map(f => `${String(f.field)}:${f.operator}:${JSON.stringify(f.value)}`)
      .sort()
      .join('|')
    
    const sortKey = sort ? `${String(sort.field)}:${sort.direction}` : ''
    
    return `${searchQuery}::${filtersKey}::${sortKey}`
  }, [])

  // Apply search function
  const applySearch = useCallback((
    itemsToSearch: T[],
    searchQuery: string,
    fieldsToSearch: (keyof T | string)[]
  ): T[] => {
    if (!searchQuery || searchQuery.length < minSearchLength) {
      return itemsToSearch
    }

    return itemsToSearch.filter(item => {
      if (customSearchFn) {
        return customSearchFn(item, searchQuery, fieldsToSearch)
      }

      return fieldsToSearch.some(field => {
        const fieldValue = item[field as keyof T]
        if (fieldValue == null) return false

        const text = String(fieldValue)
        const queryToUse = caseSensitive ? searchQuery : searchQuery.toLowerCase()
        const textToSearch = caseSensitive ? text : text.toLowerCase()

        if (enableFuzzySearch) {
          return fuzzyMatch(textToSearch, queryToUse, fuzzyThreshold)
        } else {
          return textToSearch.includes(queryToUse)
        }
      })
    })
  }, [minSearchLength, customSearchFn, caseSensitive, enableFuzzySearch, fuzzyThreshold])

  // Apply filters function
  const applyFilters = useCallback((
    itemsToFilter: T[],
    filtersToApply: SearchFilter<T>[]
  ): T[] => {
    const activeFilters = filtersToApply.filter(f => f.active !== false)
    
    if (activeFilters.length === 0) {
      return itemsToFilter
    }

    return itemsToFilter.filter(item => {
      if (customFilterFn) {
        return customFilterFn(item, activeFilters)
      }

      return activeFilters.every(filter => {
        const fieldValue = item[filter.field as keyof T]
        const filterValue = filter.value

        switch (filter.operator) {
          case 'equals':
            return fieldValue === filterValue
          case 'contains':
            return String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase())
          case 'startsWith':
            return String(fieldValue).toLowerCase().startsWith(String(filterValue).toLowerCase())
          case 'endsWith':
            return String(fieldValue).toLowerCase().endsWith(String(filterValue).toLowerCase())
          case 'gt':
            return Number(fieldValue) > Number(filterValue)
          case 'lt':
            return Number(fieldValue) < Number(filterValue)
          case 'gte':
            return Number(fieldValue) >= Number(filterValue)
          case 'lte':
            return Number(fieldValue) <= Number(filterValue)
          case 'in':
            return Array.isArray(filterValue) && filterValue.includes(fieldValue)
          case 'notIn':
            return Array.isArray(filterValue) && !filterValue.includes(fieldValue)
          case 'between':
            return Array.isArray(filterValue) && 
                   Number(fieldValue) >= Number(filterValue[0]) && 
                   Number(fieldValue) <= Number(filterValue[1])
          default:
            return true
        }
      })
    })
  }, [customFilterFn])

  // Apply sorting function
  const applySorting = useCallback((
    itemsToSort: T[],
    sort: SortConfig<T> | null
  ): T[] => {
    if (!sort) return itemsToSort

    return [...itemsToSort].sort((a, b) => {
      if (sort.sortFn) {
        return sort.direction === 'desc' ? sort.sortFn(b, a) : sort.sortFn(a, b)
      }

      const aValue = a[sort.field as keyof T]
      const bValue = b[sort.field as keyof T]

      let comparison = 0
      if (aValue < bValue) comparison = -1
      if (aValue > bValue) comparison = 1

      return sort.direction === 'desc' ? -comparison : comparison
    })
  }, [])

  // Apply highlighting
  const applyHighlighting = useCallback((
    itemsToHighlight: T[],
    searchQuery: string
  ): Array<T & { _highlights?: Record<string, string> | undefined }> => {
    if (!enableHighlighting || !searchQuery || searchQuery.length < minSearchLength) {
      return itemsToHighlight.map(item => ({ ...item, _highlights: undefined }))
    }

    return itemsToHighlight.map(item => {
      const highlights: Record<string, string> = {}

      searchFields.forEach(field => {
        const fieldValue = item[field as keyof T]
        if (fieldValue != null) {
          const text = String(fieldValue)
          const highlighted = highlightText(text, searchQuery, highlightClassName)
          if (highlighted !== text) {
            highlights[String(field)] = highlighted
          }
        }
      })

      return {
        ...item,
        _highlights: Object.keys(highlights).length > 0 ? highlights : undefined
      }
    })
  }, [enableHighlighting, minSearchLength, searchFields, highlightClassName])

  // Main search and filter logic
  const result = useMemo((): SearchResult<T> => {
    const startTime = Date.now()
    setIsLoading(true)

    // Generate cache key
    const cacheKey = generateCacheKey(debouncedQuery, filters, sortConfig)

    // Check cache
    if (enableCaching && cache.current.has(cacheKey)) {
      const cachedResult = cache.current.get(cacheKey)!
      cacheStats.current.hits++
      setIsLoading(false)
      return { ...cachedResult, stats: { ...cachedResult.stats, cacheHit: true } }
    }

    cacheStats.current.misses++

    // Apply search
    const searchedItems = applySearch(items, debouncedQuery, searchFields)
    
    // Apply filters
    const filteredItems = applyFilters(searchedItems, filters)
    
    // Apply sorting
    const sortedItems = applySorting(filteredItems, sortConfig)

    // Calculate stats
    const exactMatches = debouncedQuery 
      ? searchedItems.filter(item => 
          searchFields.some(field => {
            const fieldValue = String(item[field as keyof T] || '')
            return fieldValue.toLowerCase().includes(debouncedQuery.toLowerCase())
          })
        ).length
      : searchedItems.length

    const fuzzyMatches = searchedItems.length - exactMatches

    // Create result
    const searchResult: SearchResult<T> = {
      items: sortedItems,
      totalCount: items.length,
      filteredCount: sortedItems.length,
      query: debouncedQuery,
      filters: filters.filter(f => f.active !== false),
      sortConfig,
      stats: {
        searchTime: Date.now() - startTime,
        cacheHit: false,
        fuzzyMatches,
        exactMatches
      }
    }

    // Add highlighted items if highlighting is enabled
    if (enableHighlighting) {
      searchResult.highlightedItems = applyHighlighting(sortedItems, debouncedQuery)
    }

    // Cache result
    if (enableCaching) {
      if (cache.current.size >= cacheSize) {
        // Remove oldest entry
        const firstKey = cache.current.keys().next().value
        if (firstKey) cache.current.delete(firstKey)
      }
      cache.current.set(cacheKey, searchResult)
    }

    setIsLoading(false)
    return searchResult
  }, [
    items,
    debouncedQuery,
    filters,
    sortConfig,
    searchFields,
    generateCacheKey,
    enableCaching,
    cacheSize,
    applySearch,
    applyFilters,
    applySorting,
    applyHighlighting,
    enableHighlighting
  ])

  // Generate suggestions
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      const newSuggestions = items
        .flatMap(item => 
          searchFields.map(field => String(item[field as keyof T] || ''))
        )
        .filter(text => 
          text.toLowerCase().includes(debouncedQuery.toLowerCase()) &&
          text.toLowerCase() !== debouncedQuery.toLowerCase()
        )
        .slice(0, 10)
        .filter((value, index, self) => self.indexOf(value) === index) // unique values

      setSuggestions(newSuggestions)
    } else {
      setSuggestions([])
    }
  }, [debouncedQuery, items, searchFields])

  // Filter management functions
  const addFilter = useCallback((filter: SearchFilter<T>) => {
    setFilters(prev => {
      const existingIndex = prev.findIndex(f => f.field === filter.field)
      if (existingIndex >= 0) {
        return prev.map((f, index) => index === existingIndex ? { ...filter, active: true } : f)
      }
      return [...prev, { ...filter, active: true }]
    })
  }, [])

  const removeFilter = useCallback((field: keyof T | string) => {
    setFilters(prev => prev.filter(f => f.field !== field))
  }, [])

  const updateFilter = useCallback((field: keyof T | string, updates: Partial<SearchFilter<T>>) => {
    setFilters(prev => prev.map(f => f.field === field ? { ...f, ...updates } : f))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters([])
  }, [])

  const toggleFilter = useCallback((field: keyof T | string) => {
    setFilters(prev => prev.map(f => 
      f.field === field ? { ...f, active: !f.active } : f
    ))
  }, [])

  const reset = useCallback(() => {
    setQuery('')
    setFilters([])
    setSortConfig(null)
    cache.current.clear()
    cacheStats.current = { hits: 0, misses: 0 }
  }, [])

  // Calculate cache statistics
  const cacheStatsResult = useMemo(() => {
    const totalRequests = cacheStats.current.hits + cacheStats.current.misses
    return {
      size: cache.current.size,
      hitRate: totalRequests > 0 ? (cacheStats.current.hits / totalRequests) * 100 : 0,
      hits: cacheStats.current.hits,
      misses: cacheStats.current.misses
    }
  }, [result]) // Recalculate on each result change

  return {
    result,
    query,
    setQuery,
    filters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    toggleFilter,
    sortConfig,
    setSortConfig,
    isLoading,
    reset,
    suggestions,
    cacheStats: cacheStatsResult
  }
}

export default useEnhancedSearch