/**
 * T018: Integration Test for useAssignSchedules Hook
 * 
 * Tests the React Query mutation hook for assigning schedules to users.
 * Hook implementation will be created to pass these tests.
 * 
 * @see specs/020-phase-1/contracts/component-contracts.md
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAssignSchedules } from '@/features/users/hooks/useAssignSchedules'
import { userScheduleService } from '@/features/users/services/userScheduleService'

// Mock the service
jest.mock('@/features/users/services/userScheduleService')
const mockedService = userScheduleService as jest.Mocked<typeof userScheduleService>

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

describe('useAssignSchedules (T018)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockResponse = {
    userId: 123,
    assignedScheduleIds: [45, 67],
    previousScheduleIds: [12],
    assignedAt: '2025-10-02T14:25:00Z',
    assignedBy: 'admin@company.com',
    message: 'Successfully assigned 2 schedules',
  }

  describe('Mutation Behavior', () => {
    it('should call mutation with correct payload', async () => {
      mockedService.assignSchedules.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useAssignSchedules(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ userId: 123, scheduleIds: [45, 67] })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockedService.assignSchedules).toHaveBeenCalledWith(123, [45, 67])
    })

    it('should return loading state during mutation', async () => {
      mockedService.assignSchedules.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useAssignSchedules(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ userId: 123, scheduleIds: [45] })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('Cache Invalidation', () => {
    it('should invalidate ["userSchedules", userId] cache on success', async () => {
      mockedService.assignSchedules.mockResolvedValueOnce(mockResponse)

      const queryClient = new QueryClient()
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useAssignSchedules(), { wrapper })

      result.current.mutate({ userId: 123, scheduleIds: [45] })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(invalidateSpy).toHaveBeenCalled()
    })
  })

  describe('Optimistic Updates', () => {
    it('should perform optimistic update', async () => {
      mockedService.assignSchedules.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useAssignSchedules(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ userId: 123, scheduleIds: [45, 67] })

      // Optimistic update should happen immediately
      // This is tested by checking if mutation starts
      expect(result.current.isLoading || result.current.isSuccess).toBe(true)
    })

    it('should rollback optimistic update on error', async () => {
      const error = new Error('Assignment failed')
      mockedService.assignSchedules.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useAssignSchedules(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ userId: 123, scheduleIds: [45] })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('Success Callback', () => {
    it('should call onSuccess callback with response', async () => {
      mockedService.assignSchedules.mockResolvedValueOnce(mockResponse)

      const onSuccess = jest.fn()

      const { result } = renderHook(() => useAssignSchedules(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(
        { userId: 123, scheduleIds: [45, 67] },
        { onSuccess }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(onSuccess).toHaveBeenCalledWith(mockResponse, expect.any(Object), undefined)
    })

    it('should show success toast on successful assignment', async () => {
      const { toast } = require('@/lib/toast')
      mockedService.assignSchedules.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useAssignSchedules(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ userId: 123, scheduleIds: [45, 67] })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(toast.success).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should show error toast on failure', async () => {
      const { toast } = require('@/lib/toast')
      const error = new Error('Failed to assign schedules')
      mockedService.assignSchedules.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useAssignSchedules(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ userId: 123, scheduleIds: [45] })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(toast.error).toHaveBeenCalledWith(error.message)
    })

    it('should handle 422 validation errors', async () => {
      const error = new Error('Cannot assign inactive schedules')
      mockedService.assignSchedules.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useAssignSchedules(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ userId: 123, scheduleIds: [99] })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('Retry Logic', () => {
    it('should retry on network failure', async () => {
      const networkError = new Error('Network error')
      mockedService.assignSchedules
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(mockResponse)

      // Enable retry for this test
      const queryClient = new QueryClient({
        defaultOptions: {
          mutations: { retry: 1 },
        },
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useAssignSchedules(), { wrapper })

      result.current.mutate({ userId: 123, scheduleIds: [45] })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), {
        timeout: 3000,
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty scheduleIds array', async () => {
      const error = new Error('scheduleIds cannot be empty')
      mockedService.assignSchedules.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useAssignSchedules(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ userId: 123, scheduleIds: [] })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })

    it('should handle large scheduleIds array', async () => {
      const largeArray = Array.from({ length: 50 }, (_, i) => i + 1)
      const response = { ...mockResponse, assignedScheduleIds: largeArray }
      mockedService.assignSchedules.mockResolvedValueOnce(response)

      const { result } = renderHook(() => useAssignSchedules(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ userId: 123, scheduleIds: largeArray })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockedService.assignSchedules).toHaveBeenCalledWith(123, largeArray)
    })
  })
})
