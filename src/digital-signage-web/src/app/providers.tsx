'use client'

import React, { useState } from 'react'
import { QueryClient, QueryClientProvider, DefaultOptions, useQueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Re-export useQueryClient for convenience
export { useQueryClient }
import { Provider as ReduxProvider } from 'react-redux'
import { store } from '@/store'
import { ApiError } from '@/lib/api'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import { RealTimeEventsClient } from '@/components/providers/RealTimeEventsClient'
import { ErrorProvider } from '@/contexts/ErrorContext'
import { ToastPortal } from '@/components/errors/ToastContainer'

/**
 * Default React Query configuration options optimized for performance
 */
const queryClientOptions: DefaultOptions = {
  queries: {
    // Cache data for different durations based on data type
    staleTime: 5 * 60 * 1000, // 5 minutes default
    // Keep unused data in cache longer for better UX  
    cacheTime: 30 * 60 * 1000, // 30 minutes
    // Enable background refetching for fresh data
    refetchOnWindowFocus: false, // Disable to prevent too many requests
    refetchOnReconnect: true,
    refetchOnMount: true,
    // Retry configuration with exponential backoff
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 401) {
        return false
      }
      // Don't retry on client errors (4xx) except timeouts
      if (error?.status >= 400 && error?.status < 500 && error?.status !== 408) {
        return false
      }
      // Retry up to 2 times for other errors (reduce from 3)
      return failureCount < 2
    },
    // Optimized retry delay with jitter
    retryDelay: attemptIndex => {
      const baseDelay = Math.min(1000 * 2 ** attemptIndex, 10000) // Reduce max delay
      // Add jitter to prevent thundering herd
      return baseDelay + Math.random() * 500
    },
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
 * Connected ToastPortal component that gets data from Redux store
 */
function ConnectedToastPortal() {
  const { useSelector, useDispatch } = require('react-redux')
  const { dismissToast, dismissAllToasts } = require('@/store/slices/errorSlice')
  const { RootState } = require('@/store')
  
  const dispatch = useDispatch()
  const toasts = useSelector((state: any) => state.error.toasts)

  const handleDismiss = (id: string) => {
    dispatch(dismissToast(id))
  }

  const handleDismissAll = () => {
    dispatch(dismissAllToasts())
  }

  return (
    <ToastPortal
      notifications={toasts}
      onDismiss={handleDismiss}
      onDismissAll={handleDismissAll}
    />
  )
}

/**
 * Combined providers component for Redux and React Query
 */
export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  // Create Query Client instance (stable across re-renders)
  const [queryClient] = useState(() => createQueryClient())

  return (
    <ReduxProvider store={store}>
      <ErrorProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          {/* Temporarily disable problematic components */}
          {/* <RealTimeEventsClient /> */}
          <NotificationCenter />
          <ConnectedToastPortal />
          {/* Show React Query DevTools in development */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools 
              initialIsOpen={false}
              position="bottom-right"
            />
          )}
        </QueryClientProvider>
      </ErrorProvider>
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