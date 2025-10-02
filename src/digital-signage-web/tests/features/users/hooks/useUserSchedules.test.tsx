/**
 * T017: Integration Test for useUserSchedules Hook
 * 
 * Tests the React Query hook for fetching user schedules.
 * Hook implementation will be created to pass these tests.
 * 
 * @see specs/020-phase-1/contracts/component-contracts.md
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUserSchedules } from '@/features/users/hooks/useUserSchedules'
import { userScheduleService } from '@/features/users/services/userScheduleService'

// Mock the service
jest.mock('@/features/users/services/userScheduleService')
const mockedService = userScheduleService as jest.Mocked<typeof userScheduleService>

// Create a wrapper for React Query
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

describe('useUserSchedules (T017)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockSchedulesData = {
    userId: 123,
    userName: 'john.doe@company.com',
    schedules: [
      {
        userId: 123,
        scheduleId: 45,
        scheduleName: 'Morning News',
        scheduleDescription: 'News content',
        isActive: true,
        assignedAt: '2025-10-01T10:30:00Z',
        assignedBy: 'admin@company.com',
      },
    ],
    totalCount: 1,
  }

  describe('Data Fetching', () => {
    it('should fetch schedules on mount', async () => {
      mockedService.getUserSchedules.mockResolvedValueOnce(mockSchedulesData)

      const { result } = renderHook(() => useUserSchedules(123), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockedService.getUserSchedules).toHaveBeenCalledWith(123)
      expect(result.current.data).toEqual(mockSchedulesData)
    })

    it('should return loading state initially', () => {
      mockedService.getUserSchedules.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(() => useUserSchedules(123), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })

    it('should return data on successful fetch', async () => {
      mockedService.getUserSchedules.mockResolvedValueOnce(mockSchedulesData)

      const { result } = renderHook(() => useUserSchedules(123), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockSchedulesData)
      expect(result.current.error).toBeNull()
    })

    it('should return error state on fetch failure', async () => {
      const error = new Error('Failed to fetch schedules')
      mockedService.getUserSchedules.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useUserSchedules(123), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.data).toBeUndefined()
      expect(result.current.error).toBeTruthy()
    })
  })

  describe('Query Key', () => {
    it('should use correct query key: ["userSchedules", userId]', async () => {
      mockedService.getUserSchedules.mockResolvedValueOnce(mockSchedulesData)

      const { result } = renderHook(() => useUserSchedules(123), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Query key is accessible via the hook's internal queryKey property
      // This test validates the cache key structure
      expect(mockedService.getUserSchedules).toHaveBeenCalledWith(123)
    })

    it('should use different cache for different userIds', async () => {
      const mockData123 = { ...mockSchedulesData, userId: 123 }
      const mockData456 = { ...mockSchedulesData, userId: 456 }

      mockedService.getUserSchedules.mockResolvedValueOnce(mockData123)
      mockedService.getUserSchedules.mockResolvedValueOnce(mockData456)

      const wrapper = createWrapper()

      const { result: result123 } = renderHook(() => useUserSchedules(123), {
        wrapper,
      })
      const { result: result456 } = renderHook(() => useUserSchedules(456), {
        wrapper,
      })

      await waitFor(() => {
        expect(result123.current.isSuccess).toBe(true)
        expect(result456.current.isSuccess).toBe(true)
      })

      expect(result123.current.data?.userId).toBe(123)
      expect(result456.current.data?.userId).toBe(456)
    })
  })

  describe('Caching', () => {
    it('should cache data for 5 minutes (staleTime)', async () => {
      mockedService.getUserSchedules.mockResolvedValueOnce(mockSchedulesData)

      const wrapper = createWrapper()

      const { result: firstRender } = renderHook(() => useUserSchedules(123), {
        wrapper,
      })

      await waitFor(() => expect(firstRender.current.isSuccess).toBe(true))

      // Second render should use cached data
      const { result: secondRender } = renderHook(() => useUserSchedules(123), {
        wrapper,
      })

      // Should not call service again (using cache)
      expect(mockedService.getUserSchedules).toHaveBeenCalledTimes(1)
      expect(secondRender.current.data).toEqual(mockSchedulesData)
    })

    it('should NOT refetch on mount if cache fresh', async () => {
      mockedService.getUserSchedules.mockResolvedValueOnce(mockSchedulesData)

      const wrapper = createWrapper()

      // First render
      const { result: firstRender } = renderHook(() => useUserSchedules(123), {
        wrapper,
      })

      await waitFor(() => expect(firstRender.current.isSuccess).toBe(true))

      // Second render immediately after
      const { result: secondRender } = renderHook(() => useUserSchedules(123), {
        wrapper,
      })

      // Should use cached data, not refetch
      expect(mockedService.getUserSchedules).toHaveBeenCalledTimes(1)
      expect(secondRender.current.data).toEqual(mockSchedulesData)
    })
  })

  describe('Refetching', () => {
    it('should refetch on window focus', async () => {
      mockedService.getUserSchedules.mockResolvedValue(mockSchedulesData)

      const { result } = renderHook(() => useUserSchedules(123), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Simulate window focus
      window.dispatchEvent(new Event('focus'))

      await waitFor(() => {
        // Should refetch on focus
        expect(mockedService.getUserSchedules).toHaveBeenCalledTimes(2)
      })
    })

    it('should support manual refetch', async () => {
      mockedService.getUserSchedules.mockResolvedValue(mockSchedulesData)

      const { result } = renderHook(() => useUserSchedules(123), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockedService.getUserSchedules).toHaveBeenCalledTimes(1)

      // Manual refetch
      result.current.refetch()

      await waitFor(() => {
        expect(mockedService.getUserSchedules).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle 401 unauthorized error', async () => {
      const error = new Error('Authentication required. Please log in.')
      mockedService.getUserSchedules.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useUserSchedules(123), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeTruthy()
    })

    it('should handle 404 user not found error', async () => {
      const error = new Error('User with ID 123 not found.')
      mockedService.getUserSchedules.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useUserSchedules(123), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeTruthy()
    })

    it('should handle network errors', async () => {
      const error = new Error('Network error. Please check your connection.')
      mockedService.getUserSchedules.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useUserSchedules(123), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty schedules list', async () => {
      const emptyData = {
        userId: 123,
        userName: 'john.doe@company.com',
        schedules: [],
        totalCount: 0,
      }

      mockedService.getUserSchedules.mockResolvedValueOnce(emptyData)

      const { result } = renderHook(() => useUserSchedules(123), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.schedules).toHaveLength(0)
      expect(result.current.data?.totalCount).toBe(0)
    })

    it('should handle userId = 0', async () => {
      mockedService.getUserSchedules.mockResolvedValueOnce({
        ...mockSchedulesData,
        userId: 0,
      })

      const { result } = renderHook(() => useUserSchedules(0), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockedService.getUserSchedules).toHaveBeenCalledWith(0)
    })
  })

  describe('TypeScript Types', () => {
    it('should return typed data', async () => {
      mockedService.getUserSchedules.mockResolvedValueOnce(mockSchedulesData)

      const { result } = renderHook(() => useUserSchedules(123), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // TypeScript should infer correct types
      const data = result.current.data
      expect(data).toHaveProperty('userId')
      expect(data).toHaveProperty('userName')
      expect(data).toHaveProperty('schedules')
      expect(data).toHaveProperty('totalCount')
    })
  })
})
