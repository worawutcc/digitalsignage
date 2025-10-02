/**
 * useAssignSchedules Hook Tests (T018)
 * 
 * Contract tests for React Query mutation hook.
 * Tests mutation states, optimistic updates, cache invalidation.
 * 
 * These tests SHOULD FAIL initially (on assertions, not compilation).
 * 
 * @see copilot-instructions-web.md - Testing Standards
 * @see specs/020-phase-1/tasks.md - T018 Requirements
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAssignSchedules } from '@/hooks/useAssignSchedules'
import { userScheduleService } from '@/services/userScheduleService'
import { ReactNode } from 'react'

// Mock service
jest.mock('@/services/userScheduleService')
const mockedService = userScheduleService as jest.Mocked<typeof userScheduleService>

describe('useAssignSchedules', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    })
    jest.clearAllMocks()
  })

  describe('Mutation execution', () => {
    test('calls service with correct params', async () => {
      mockedService.assignSchedulesToUser.mockResolvedValue({ success: true })

      const { result } = renderHook(() => useAssignSchedules(), { wrapper })

      result.current.mutate({ userId: 5, scheduleIds: [1, 2, 3] })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockedService.assignSchedulesToUser).toHaveBeenCalledWith(5, [1, 2, 3])
    })

    test('returns idle state initially', () => {
      const { result } = renderHook(() => useAssignSchedules(), { wrapper })

      expect(result.current.isIdle).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    test('shows loading state during mutation', async () => {
      mockedService.assignSchedulesToUser.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useAssignSchedules(), { wrapper })

      result.current.mutate({ userId: 5, scheduleIds: [1] })

      expect(result.current.isLoading).toBe(true)
    })

    test('handles successful mutation', async () => {
      const mockResponse = { success: true, message: 'Assigned' }
      mockedService.assignSchedulesToUser.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAssignSchedules(), { wrapper })

      result.current.mutate({ userId: 5, scheduleIds: [1] })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockResponse)
      expect(result.current.error).toBeNull()
    })

    test('handles mutation error', async () => {
      const mockError = new Error('Assignment failed')
      mockedService.assignSchedulesToUser.mockRejectedValue(mockError)

      const { result } = renderHook(() => useAssignSchedules(), { wrapper })

      result.current.mutate({ userId: 5, scheduleIds: [1] })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeTruthy()
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('Cache invalidation', () => {
    test('invalidates user schedules query after success', async () => {
      mockedService.assignSchedulesToUser.mockResolvedValue({ success: true })

      // Set up existing query data
      queryClient.setQueryData(['userSchedules', 5], [{ id: 1 }])

      const { result } = renderHook(() => useAssignSchedules(), { wrapper })

      result.current.mutate({ userId: 5, scheduleIds: [2, 3] })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Query should be invalidated (refetching or stale)
      const queryState = queryClient.getQueryState(['userSchedules', 5])
      expect(queryState?.isInvalidated).toBe(true)
    })

    test('does not invalidate cache on error', async () => {
      mockedService.assignSchedulesToUser.mockRejectedValue(new Error('Failed'))

      queryClient.setQueryData(['userSchedules', 5], [{ id: 1 }])

      const { result } = renderHook(() => useAssignSchedules(), { wrapper })

      result.current.mutate({ userId: 5, scheduleIds: [2] })

      await waitFor(() => expect(result.current.isError).toBe(true))

      const queryState = queryClient.getQueryState(['userSchedules', 5])
      expect(queryState?.isInvalidated).toBe(false)
    })
  })

  describe('Callbacks', () => {
    test('calls onSuccess callback', async () => {
      mockedService.assignSchedulesToUser.mockResolvedValue({ success: true })

      const onSuccess = jest.fn()
      const { result } = renderHook(() => useAssignSchedules(), { wrapper })

      result.current.mutate({ userId: 5, scheduleIds: [1] }, { onSuccess })

      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })

    test('calls onError callback', async () => {
      mockedService.assignSchedulesToUser.mockRejectedValue(new Error('Failed'))

      const onError = jest.fn()
      const { result } = renderHook(() => useAssignSchedules(), { wrapper })

      result.current.mutate({ userId: 5, scheduleIds: [1] }, { onError })

      await waitFor(() => expect(onError).toHaveBeenCalled())
    })
  })

  describe('Mutation reset', () => {
    test('exposes reset function', () => {
      const { result } = renderHook(() => useAssignSchedules(), { wrapper })

      expect(result.current.reset).toBeInstanceOf(Function)
    })

    test('reset clears mutation state', async () => {
      mockedService.assignSchedulesToUser.mockResolvedValue({ success: true })

      const { result } = renderHook(() => useAssignSchedules(), { wrapper })

      result.current.mutate({ userId: 5, scheduleIds: [1] })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      result.current.reset()

      expect(result.current.isIdle).toBe(true)
      expect(result.current.data).toBeUndefined()
    })
  })
})
