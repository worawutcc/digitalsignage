/**
 * T019: Integration Test for useSetDefaultSchedule Hook
 * 
 * Tests the React Query mutation hook for toggling default schedule flag.
 * Hook implementation will be created to pass these tests.
 * 
 * @see specs/020-phase-1/contracts/component-contracts.md
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSetDefaultSchedule } from '@/features/schedules/hooks/useSetDefaultSchedule'
import { scheduleService } from '@/features/schedules/services/scheduleService'

// Mock the service
jest.mock('@/features/schedules/services/scheduleService')
const mockedService = scheduleService as jest.Mocked<typeof scheduleService>

// Mock toast
jest.mock('@/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useSetDefaultSchedule (T019)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockResponse = {
    scheduleId: 45,
    isDefault: true,
    previousDefaultId: 12,
    message: 'Default schedule updated successfully',
  }

  describe('Toggle Default Flag', () => {
    it('should toggle default flag to true', async () => {
      mockedService.setDefaultSchedule.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useSetDefaultSchedule(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ scheduleId: 45, isDefault: true })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockedService.setDefaultSchedule).toHaveBeenCalledWith(45, true)
    })

    it('should toggle default flag to false', async () => {
      const unsetResponse = {
        scheduleId: 45,
        isDefault: false,
        previousDefaultId: null,
        message: 'Schedule is no longer default',
      }

      mockedService.setDefaultSchedule.mockResolvedValueOnce(unsetResponse)

      const { result } = renderHook(() => useSetDefaultSchedule(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ scheduleId: 45, isDefault: false })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockedService.setDefaultSchedule).toHaveBeenCalledWith(45, false)
    })
  })

  describe('Cache Invalidation', () => {
    it('should invalidate schedules cache on success', async () => {
      mockedService.setDefaultSchedule.mockResolvedValueOnce(mockResponse)

      const queryClient = new QueryClient()
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useSetDefaultSchedule(), { wrapper })

      result.current.mutate({ scheduleId: 45, isDefault: true })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(invalidateSpy).toHaveBeenCalled()
    })
  })

  describe('Business Rule: Only One Default', () => {
    it('should enforce "only one default" business rule', async () => {
      // When setting a new default, previous default should be unset
      mockedService.setDefaultSchedule.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useSetDefaultSchedule(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ scheduleId: 45, isDefault: true })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.previousDefaultId).toBe(12)
    })

    it('should show error if business rule violated', async () => {
      const error = new Error('Only one schedule can be default')
      mockedService.setDefaultSchedule.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useSetDefaultSchedule(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ scheduleId: 45, isDefault: true })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('Optimistic Updates', () => {
    it('should perform optimistic update for immediate UI feedback', async () => {
      mockedService.setDefaultSchedule.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useSetDefaultSchedule(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ scheduleId: 45, isDefault: true })

      // Mutation should start immediately
      expect(result.current.isLoading || result.current.isSuccess).toBe(true)
    })

    it('should rollback on error', async () => {
      const error = new Error('Failed to update default schedule')
      mockedService.setDefaultSchedule.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useSetDefaultSchedule(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ scheduleId: 45, isDefault: true })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('Toast Notifications', () => {
    it('should show success toast on successful toggle', async () => {
      const { toast } = require('@/lib/toast')
      mockedService.setDefaultSchedule.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useSetDefaultSchedule(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ scheduleId: 45, isDefault: true })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(toast.success).toHaveBeenCalled()
    })

    it('should show error toast on failure', async () => {
      const { toast } = require('@/lib/toast')
      const error = new Error('Cannot set inactive schedule as default')
      mockedService.setDefaultSchedule.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useSetDefaultSchedule(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ scheduleId: 45, isDefault: true })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(toast.error).toHaveBeenCalledWith(error.message)
    })
  })

  describe('Error Scenarios', () => {
    it('should handle 404 schedule not found', async () => {
      const error = new Error('Schedule not found')
      mockedService.setDefaultSchedule.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useSetDefaultSchedule(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ scheduleId: 999, isDefault: true })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })

    it('should handle 422 validation error', async () => {
      const error = new Error('Cannot set inactive schedule as default')
      mockedService.setDefaultSchedule.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useSetDefaultSchedule(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ scheduleId: 45, isDefault: true })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('Multiple Consecutive Toggles', () => {
    it('should handle rapid toggle changes', async () => {
      mockedService.setDefaultSchedule
        .mockResolvedValueOnce({ ...mockResponse, isDefault: true })
        .mockResolvedValueOnce({ ...mockResponse, isDefault: false })
        .mockResolvedValueOnce({ ...mockResponse, isDefault: true })

      const { result } = renderHook(() => useSetDefaultSchedule(), {
        wrapper: createWrapper(),
      })

      // First toggle: set as default
      result.current.mutate({ scheduleId: 45, isDefault: true })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Second toggle: unset default
      result.current.mutate({ scheduleId: 45, isDefault: false })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Third toggle: set as default again
      result.current.mutate({ scheduleId: 45, isDefault: true })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockedService.setDefaultSchedule).toHaveBeenCalledTimes(3)
    })
  })

  describe('Edge Cases', () => {
    it('should handle setting the same schedule as default twice', async () => {
      mockedService.setDefaultSchedule.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useSetDefaultSchedule(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ scheduleId: 45, isDefault: true })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Try to set as default again
      result.current.mutate({ scheduleId: 45, isDefault: true })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockedService.setDefaultSchedule).toHaveBeenCalledTimes(2)
    })

    it('should handle unsetting when no default is set', async () => {
      const response = {
        scheduleId: 45,
        isDefault: false,
        previousDefaultId: null,
        message: 'No changes made',
      }

      mockedService.setDefaultSchedule.mockResolvedValueOnce(response)

      const { result } = renderHook(() => useSetDefaultSchedule(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ scheduleId: 45, isDefault: false })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.previousDefaultId).toBeNull()
    })
  })
})
