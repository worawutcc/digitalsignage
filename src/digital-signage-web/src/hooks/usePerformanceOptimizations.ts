import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'

/**
 * Configuration for infinite scrolling
 */
export interface InfiniteScrollConfig {
  threshold?: number // Distance from bottom to trigger load (in pixels)
  enabled?: boolean
  hasNextPage?: boolean
  fetchNextPage?: () => void
  isFetchingNextPage?: boolean
}

/**
 * Hook for infinite scrolling with intersection observer
 */
export function useInfiniteScroll({
  threshold = 200,
  enabled = true,
  hasNextPage = false,
  fetchNextPage,
  isFetchingNextPage = false,
}: InfiniteScrollConfig) {
  const [isFetching, setIsFetching] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !sentinelRef.current || !fetchNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage && !isFetching) {
          setIsFetching(true)
          fetchNextPage()
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1,
      }
    )

    observer.observe(sentinelRef.current)

    return () => observer.disconnect()
  }, [enabled, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching, threshold])

  useEffect(() => {
    if (!isFetchingNextPage) {
      setIsFetching(false)
    }
  }, [isFetchingNextPage])

  return { sentinelRef, isFetching }
}

/**
 * Hook for optimized data fetching with infinite scroll
 */
export function useInfiniteData<T>({
  queryKey,
  queryFn,
  pageSize = 20,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
}: {
  queryKey: unknown[]
  queryFn: (page: number, pageSize: number) => Promise<{
    data: T[]
    hasNextPage: boolean
    nextPage?: number
  }>
  pageSize?: number
  enabled?: boolean
  staleTime?: number
}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => queryFn(pageParam, pageSize),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNextPage ? allPages.length + 1 : undefined
    },
    enabled,
    staleTime,
    cacheTime: 30 * 60 * 1000, // 30 minutes
  })

  // Flatten all pages into a single array
  const items = data?.pages?.flatMap(page => page.data) ?? []

  const { sentinelRef, isFetching } = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    isFetchingNextPage,
    enabled,
  })

  return {
    items,
    isLoading,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage: isFetchingNextPage || isFetching,
    sentinelRef,
  }
}

/**
 * Hook for virtual scrolling with fixed item heights
 */
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    item,
    index: startIndex + index,
  }))

  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollElementRef,
    handleScroll,
  }
}

/**
 * Hook for intersection-based lazy loading of components
 */
export function useLazyComponent(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setIsVisible(true)
          setHasBeenVisible(true)
        } else {
          setIsVisible(false)
        }
      },
      { threshold }
    )

    observer.observe(elementRef.current)

    return () => observer.disconnect()
  }, [threshold])

  return {
    elementRef,
    isVisible,
    hasBeenVisible,
    shouldRender: hasBeenVisible, // Keep component mounted once visible
  }
}

/**
 * Hook for debounced search with caching
 */
export function useOptimizedSearch<T>({
  searchFn,
  debounceMs = 300,
  minLength = 2,
  cacheTime = 10 * 60 * 1000, // 10 minutes
}: {
  searchFn: (query: string) => Promise<T[]>
  debounceMs?: number
  minLength?: number
  cacheTime?: number
}) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  
  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  // Query with caching
  const { data, isLoading, error } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchFn(debouncedQuery),
    enabled: debouncedQuery.length >= minLength,
    staleTime: cacheTime,
    cacheTime: cacheTime * 2,
  })

  return {
    query,
    setQuery,
    results: data ?? [],
    isLoading,
    error,
    isSearching: query !== debouncedQuery,
  }
}