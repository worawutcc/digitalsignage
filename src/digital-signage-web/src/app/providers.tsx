'use client'

import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider, DefaultOptions, useQueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Re-export useQueryClient for convenience
export { useQueryClient }
import { Provider as ReduxProvider } from 'react-redux'
import { store } from '@/store'
import { ApiError } from '@/lib/api'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import { RealTimeEventsClient } from '@/components/providers/RealTimeEventsClient'

/**
 * Default React Query configuration options
 */
const queryClientOptions: DefaultOptions = {
  queries: {
    // Cache data for 5 minutes by default
    staleTime: 5 * 60 * 1000,
    // Keep unused data in cache for 10 minutes
    cacheTime: 10 * 60 * 1000,
    // Retry failed requests up to 3 times
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof ApiError && error.status === 401) {
        return false
      }
      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false
      }
      // Retry up to 3 times for other errors
      return failureCount < 3
    },
    // Retry delay with exponential backoff
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus for important data
    refetchOnWindowFocus: true,
    // Refetch on reconnect
    refetchOnReconnect: true,
    // Don't refetch on mount if data is fresh
    refetchOnMount: true,
  },
  mutations: {
    // Retry mutations once on network errors
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
        return failureCount < 1
      }
      return false
    },
  },
}

/**
 * Create React Query client with error handling
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: queryClientOptions,
  })
}

/**
 * Props for the Providers component
 */
interface ProvidersProps {
  children: React.ReactNode
}

/**
 * Combined providers component for Redux and React Query
 */
export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  // Create Query Client instance (stable across re-renders)
  const [queryClient] = useState(() => createQueryClient())
  const [isClient, setIsClient] = useState(false)

  // Only render QueryClientProvider on client-side to avoid SSR issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <ReduxProvider store={store}>
      {isClient ? (
        <QueryClientProvider client={queryClient}>
          {children}
          {/* Temporarily disable problematic components */}
          {/* <RealTimeEventsClient /> */}
          <NotificationCenter />
          {/* Show React Query DevTools in development */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools 
              initialIsOpen={false}
              position="bottom-right"
            />
          )}
        </QueryClientProvider>
      ) : (
        // Server-side fallback without React Query
        <>{children}</>
      )}
    </ReduxProvider>
  )
}



/**
 * Query key factory for consistent query key management
 */
export const queryKeys = {
  // Authentication
  auth: ['auth'] as const,
  profile: () => [...queryKeys.auth, 'profile'] as const,

  // Devices
  devices: ['devices'] as const,
  devicesList: (filters?: Record<string, any>) => 
    [...queryKeys.devices, 'list', filters] as const,
  device: (id: string) => [...queryKeys.devices, 'detail', id] as const,
  deviceHeartbeat: (id: string) => [...queryKeys.devices, 'heartbeat', id] as const,

  // Device Groups
  deviceGroups: ['deviceGroups'] as const,
  deviceGroupsList: () => [...queryKeys.deviceGroups, 'list'] as const,
  deviceGroup: (id: string) => [...queryKeys.deviceGroups, 'detail', id] as const,

  // Media
  media: ['media'] as const,
  mediaList: (filters?: Record<string, any>) => 
    [...queryKeys.media, 'list', filters] as const,
  mediaItem: (id: string) => [...queryKeys.media, 'detail', id] as const,

  // Schedules
  schedules: ['schedules'] as const,
  schedulesList: (filters?: Record<string, any>) => 
    [...queryKeys.schedules, 'list', filters] as const,
  schedule: (id: string) => [...queryKeys.schedules, 'detail', id] as const,
  deviceSchedules: (deviceId: string) => 
    [...queryKeys.schedules, 'device', deviceId] as const,

  // Dashboard & Analytics
  dashboard: ['dashboard'] as const,
  dashboardStats: () => [...queryKeys.dashboard, 'stats'] as const,
  deviceAnalytics: (deviceId?: string, period?: string) => 
    [...queryKeys.dashboard, 'analytics', deviceId, period] as const,
}

/**
 * Query client configuration for server-side rendering
 */
export const getQueryClient = () => createQueryClient()