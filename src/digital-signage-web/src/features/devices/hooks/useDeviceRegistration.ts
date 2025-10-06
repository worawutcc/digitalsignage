/**
 * Device Registration React Query Hooks
 * 
 * Custom hooks for device registration management using React Query.
 * Provides data fetching, caching, and mutation handling for device registration workflow.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceRegistrationService } from '../services/deviceRegistrationService'
import type {
  PendingRegistration,
  ApprovalRequest,
  ApprovalResponse,
  GetPendingRegistrationsResponse,
  BulkApprovalRequest,
  BulkApprovalResponse,
  RegistrationStatistics,
} from '../types/deviceRegistration'

/**
 * Query keys for device registration operations
 */
export const deviceRegistrationQueryKeys = {
  all: ['deviceRegistrations'] as const,
  pendingRegistrations: () => [...deviceRegistrationQueryKeys.all, 'pending'] as const,
  statistics: () => [...deviceRegistrationQueryKeys.all, 'statistics'] as const,
  auditLogs: (registrationId?: string) => 
    [...deviceRegistrationQueryKeys.all, 'auditLogs', registrationId] as const,
}

/**
 * Hook to fetch pending device registrations
 * 
 * @param options - React Query options
 * @returns Query result with pending registrations data
 */
export function usePendingRegistrations(options?: {
  refetchInterval?: number
  enabled?: boolean
}) {
  return useQuery({
    queryKey: deviceRegistrationQueryKeys.pendingRegistrations(),
    queryFn: deviceRegistrationService.getPendingRegistrations,
    refetchInterval: options?.refetchInterval ?? 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
    enabled: options?.enabled ?? true,
    staleTime: 10000, // Consider data stale after 10 seconds
    meta: {
      errorMessage: 'Failed to load pending device registrations',
    },
  })
}

/**
 * Hook to approve a device registration
 * 
 * @returns Mutation for approving device registration
 */
export function useApproveRegistration() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ registrationId, data }: { 
      registrationId: string
      data: ApprovalRequest 
    }) => deviceRegistrationService.approveRegistration(registrationId, data),
    
    onMutate: async ({ registrationId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: deviceRegistrationQueryKeys.pendingRegistrations() 
      })
      
      // Snapshot previous value
      const previousRegistrations = queryClient.getQueryData<GetPendingRegistrationsResponse>(
        deviceRegistrationQueryKeys.pendingRegistrations()
      )
      
      // Optimistically remove the registration from pending list
      if (previousRegistrations) {
        queryClient.setQueryData<GetPendingRegistrationsResponse>(
          deviceRegistrationQueryKeys.pendingRegistrations(),
          {
            ...previousRegistrations,
            registrations: previousRegistrations.registrations.filter(
              reg => reg.registrationId !== registrationId
            ),
            totalCount: previousRegistrations.totalCount - 1,
          }
        )
      }
      
      return { previousRegistrations }
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousRegistrations) {
        queryClient.setQueryData(
          deviceRegistrationQueryKeys.pendingRegistrations(),
          context.previousRegistrations
        )
      }
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to approve device registration'
      console.error('Device registration approval error:', errorMessage)
    },
    
    onSuccess: (data, { registrationId }) => {
      console.log(`Device registration approved successfully`)
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: deviceRegistrationQueryKeys.pendingRegistrations() 
      })
      queryClient.invalidateQueries({ 
        queryKey: deviceRegistrationQueryKeys.statistics() 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['devices', 'list'] // Invalidate device list as well
      })
    },
    
    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ 
        queryKey: deviceRegistrationQueryKeys.pendingRegistrations() 
      })
    },
  })
}

/**
 * Hook to reject a device registration
 * 
 * @returns Mutation for rejecting device registration
 */
export function useRejectRegistration() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ registrationId, reason }: { 
      registrationId: string
      reason: string 
    }) => deviceRegistrationService.rejectRegistration(registrationId, reason),
    
    onMutate: async ({ registrationId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: deviceRegistrationQueryKeys.pendingRegistrations() 
      })
      
      // Snapshot previous value
      const previousRegistrations = queryClient.getQueryData<GetPendingRegistrationsResponse>(
        deviceRegistrationQueryKeys.pendingRegistrations()
      )
      
      // Optimistically remove the registration from pending list
      if (previousRegistrations) {
        queryClient.setQueryData<GetPendingRegistrationsResponse>(
          deviceRegistrationQueryKeys.pendingRegistrations(),
          {
            ...previousRegistrations,
            registrations: previousRegistrations.registrations.filter(
              reg => reg.registrationId !== registrationId
            ),
            totalCount: previousRegistrations.totalCount - 1,
          }
        )
      }
      
      return { previousRegistrations }
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousRegistrations) {
        queryClient.setQueryData(
          deviceRegistrationQueryKeys.pendingRegistrations(),
          context.previousRegistrations
        )
      }
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to reject device registration'
      console.error('Device registration rejection error:', errorMessage)
    },
    
    onSuccess: (data, { registrationId }) => {
      console.log(`Device registration rejected`)
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: deviceRegistrationQueryKeys.pendingRegistrations() 
      })
      queryClient.invalidateQueries({ 
        queryKey: deviceRegistrationQueryKeys.statistics() 
      })
    },
    
    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ 
        queryKey: deviceRegistrationQueryKeys.pendingRegistrations() 
      })
    },
  })
}

/**
 * Hook to bulk approve device registrations
 * 
 * @returns Mutation for bulk approving device registrations
 */
export function useBulkApproveRegistrations() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ registrationIds, data }: {
      registrationIds: string[]
      data: Omit<ApprovalRequest, 'registrationId'>
    }) => deviceRegistrationService.bulkApproveRegistrations(registrationIds, data),
    
    onSuccess: (result, { registrationIds }) => {
      const { succeeded, failed } = result
      
      if (succeeded > 0) {
        console.log(`${succeeded} device registration(s) approved successfully`)
      }
      
      if (failed > 0) {
        console.error(`${failed} device registration(s) failed to approve`)
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: deviceRegistrationQueryKeys.pendingRegistrations() 
      })
      queryClient.invalidateQueries({ 
        queryKey: deviceRegistrationQueryKeys.statistics() 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['devices', 'list']
      })
    },
    
    onError: (error) => {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to perform bulk approval'
      console.error('Bulk approval error:', errorMessage)
    },
  })
}

/**
 * Hook to get registration statistics for dashboard
 * 
 * @returns Query result with registration statistics
 */
export function useRegistrationStatistics() {
  return useQuery({
    queryKey: deviceRegistrationQueryKeys.statistics(),
    queryFn: async (): Promise<RegistrationStatistics> => {
      // This would call a real API endpoint for statistics
      // For now, return mock data based on pending registrations
      const pendingData = await deviceRegistrationService.getPendingRegistrations()
      
      return {
        totalPending: pendingData.totalCount,
        totalApprovedToday: 0, // Would come from API
        totalRejectedToday: 0, // Would come from API
        averageApprovalTime: 0, // Would come from API
        expiringSoon: pendingData.registrations.filter((reg: PendingRegistration) => {
          const expiresAt = new Date(reg.expiresAt)
          const now = new Date()
          const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)
          return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0
        }).length,
      }
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider stale after 30 seconds
  })
}

/**
 * Hook to prefetch pending registrations
 * Useful for preloading data before navigating to registration page
 */
export function usePrefetchPendingRegistrations() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: deviceRegistrationQueryKeys.pendingRegistrations(),
      queryFn: deviceRegistrationService.getPendingRegistrations,
      staleTime: 10000,
    })
  }
}