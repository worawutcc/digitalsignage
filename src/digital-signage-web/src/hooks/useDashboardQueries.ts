import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardService } from '@/services'

/**
 * Query keys for dashboard-related queries
 */
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardQueryKeys.all, 'stats'] as const,
  health: () => [...dashboardQueryKeys.all, 'health'] as const,
  activities: () => [...dashboardQueryKeys.all, 'activities'] as const,
  search: (query: string) => [...dashboardQueryKeys.all, 'search', query] as const,
}

/**
 * Hook for dashboard metrics with optimized caching
 * Metrics are cached for 2 minutes since they change frequently
 */
export function useDashboardMetrics() {
  return useQuery({
    queryKey: dashboardQueryKeys.stats(),
    queryFn: () => DashboardService.getMetrics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    refetchIntervalInBackground: false, // Don't refetch when tab is not active
  })
}

/**
 * Hook for system health with aggressive caching
 * Health checks are cached for 30 seconds for real-time monitoring
 */
export function useSystemHealth() {
  return useQuery({
    queryKey: dashboardQueryKeys.health(),
    queryFn: () => DashboardService.getSystemHealth(),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Auto-refetch every minute
    refetchIntervalInBackground: true, // Keep monitoring even when tab is not active
  })
}

/**
 * Hook for recent items with moderate caching
 * Recent items are cached for 1 minute
 */
export function useRecentItems(limit = 10) {
  return useQuery({
    queryKey: [...dashboardQueryKeys.activities(), limit],
    queryFn: () => DashboardService.getRecentItems(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook for search with debounced caching
 * Search results are cached for the session but with shorter stale time
 */
export function useDashboardSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.search(query),
    queryFn: () => DashboardService.search(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour - keep search results longer
    refetchOnWindowFocus: false, // Don't refetch search results on focus
  })
}

/**
 * Hook to prefetch dashboard data for better UX
 */
export function usePrefetchDashboard() {
  const queryClient = useQueryClient()

  const prefetchMetrics = () => {
    queryClient.prefetchQuery({
      queryKey: dashboardQueryKeys.stats(),
      queryFn: () => DashboardService.getMetrics(),
      staleTime: 2 * 60 * 1000,
    })
  }

  const prefetchHealth = () => {
    queryClient.prefetchQuery({
      queryKey: dashboardQueryKeys.health(),
      queryFn: () => DashboardService.getSystemHealth(),
      staleTime: 30 * 1000,
    })
  }

  const prefetchRecentItems = () => {
    queryClient.prefetchQuery({
      queryKey: dashboardQueryKeys.activities(),
      queryFn: () => DashboardService.getRecentItems(),
      staleTime: 1 * 60 * 1000,
    })
  }

  return {
    prefetchMetrics,
    prefetchHealth,
    prefetchRecentItems,
    prefetchAll: () => {
      prefetchMetrics()
      prefetchHealth()
      prefetchRecentItems()
    }
  }
}