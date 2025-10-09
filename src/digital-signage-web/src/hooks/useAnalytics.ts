import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analyticsService'

/**
 * Hook to fetch analytics overview
 */
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsService.getOverview(),
    refetchInterval: 60000, // Refetch every minute
  })
}

/**
 * Hook to fetch top content performance
 */
export function useTopContent(limit: number = 10) {
  return useQuery({
    queryKey: ['analytics', 'top-content', limit],
    queryFn: () => analyticsService.getTopContent(limit),
    refetchInterval: 60000,
  })
}

/**
 * Hook to fetch device performance
 */
export function useDevicePerformance() {
  return useQuery({
    queryKey: ['analytics', 'device-performance'],
    queryFn: () => analyticsService.getDevicePerformance(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

/**
 * Hook to fetch views by hour
 */
export function useViewsByHour(date?: Date) {
  return useQuery({
    queryKey: ['analytics', 'views-by-hour', date?.toISOString()],
    queryFn: () => analyticsService.getViewsByHour(date),
    refetchInterval: 60000,
  })
}

/**
 * Hook to fetch content type statistics
 */
export function useContentTypeStats() {
  return useQuery({
    queryKey: ['analytics', 'content-types'],
    queryFn: () => analyticsService.getContentTypeStats(),
    refetchInterval: 300000, // Refetch every 5 minutes
  })
}
