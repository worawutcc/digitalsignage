/**
 * useUserSchedules Hook Tests (T017)
 * 
 * Contract tests for React Query hook managing user schedules.
 * Tests query states, caching, refetching, and error handling.
 * 
 * These tests SHOULD FAIL initially (on assertions, not compilation).
 * 
 * @see copilot-instructions-web.md - Testing Standards
 * @see specs/020-phase-1/tasks.md - T017 Requirements
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUserSchedules } from '@/hooks/useUserSchedules'
import { userScheduleService } from '@/services/userScheduleService'
import { ReactNode } from 'react'

// Mock service
jest.mock('@/services/userScheduleService')
const mockedService = userScheduleService as jest.Mocked<typeof userScheduleService>

describe('useUserSchedules', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    jest.clearAllMocks()
  })

  describe('Data fetching', () => {
    test('fetches user schedules on mount', async () => {
      const mockData = [
        { id: 1, name: 'Schedule 1' },
        { id: 2, name: 'Schedule 2' }
      ]
      mockedService.getUserSchedules.mockResolvedValue(mockData)

      const { result } = renderHook(() => useUserSchedules(5), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockedService.getUserSchedules).toHaveBeenCalledWith(5)
      expect(result.current.data).toEqual(mockData)
    })

    test('returns loading state initially', () => {
      mockedService.getUserSchedules.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(() => useUserSchedules(5), { wrapper })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })

    test('handles successful data fetch', async () => {
      const mockData = [{ id: 1, name: 'Test' }]
      mockedService.getUserSchedules.mockResolvedValue(mockData)

      const { result } = renderHook(() => useUserSchedules(5), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.error).toBeNull()
      expect(result.current.data).toEqual(mockData)
    })

    test('handles error state', async () => {
      const mockError = new Error('Failed to fetch')
      mockedService.getUserSchedules.mockRejectedValue(mockError)

      const { result } = renderHook(() => useUserSchedules(5), { wrapper })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeTruthy()
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('Query caching', () => {
    test('uses cached data on subsequent renders', async () => {
      const mockData = [{ id: 1, name: 'Cached' }]
      mockedService.getUserSchedules.mockResolvedValue(mockData)

      const { result, rerender } = renderHook(() => useUserSchedules(5), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      rerender()

      // Should not fetch again immediately
      expect(mockedService.getUserSchedules).toHaveBeenCalledTimes(1)
      expect(result.current.data).toEqual(mockData)
    })

    test('different userIds have separate cache entries', async () => {
      mockedService.getUserSchedules.mockResolvedValue([])

      const { result: result1 } = renderHook(() => useUserSchedules(5), { wrapper })
      const { result: result2 } = renderHook(() => useUserSchedules(10), { wrapper })

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true)
        expect(result2.current.isSuccess).toBe(true)
      })

      expect(mockedService.getUserSchedules).toHaveBeenCalledWith(5)
      expect(mockedService.getUserSchedules).toHaveBeenCalledWith(10)
      expect(mockedService.getUserSchedules).toHaveBeenCalledTimes(2)
    })

    test('refetch updates cached data', async () => {
      const initialData = [{ id: 1, name: 'Old' }]
      const updatedData = [{ id: 1, name: 'New' }]

      mockedService.getUserSchedules
        .mockResolvedValueOnce(initialData)
        .mockResolvedValueOnce(updatedData)

      const { result } = renderHook(() => useUserSchedules(5), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(initialData)

      result.current.refetch()

      await waitFor(() => expect(result.current.data).toEqual(updatedData))
    })
  })

  describe('Refetching', () => {
    test('exposes refetch function', async () => {
      mockedService.getUserSchedules.mockResolvedValue([])

      const { result } = renderHook(() => useUserSchedules(5), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.refetch).toBeInstanceOf(Function)
    })

    test('refetch calls service again', async () => {
      mockedService.getUserSchedules.mockResolvedValue([])

      const { result } = renderHook(() => useUserSchedules(5), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      await result.current.refetch()

      expect(mockedService.getUserSchedules).toHaveBeenCalledTimes(2)
    })

    test('shows loading state during refetch', async () => {
      mockedService.getUserSchedules.mockResolvedValue([])

      const { result } = renderHook(() => useUserSchedules(5), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      const refetchPromise = result.current.refetch()
      
      expect(result.current.isRefetching).toBe(true)

      await refetchPromise
    })
  })

  describe('Query options', () => {
    test('can be configured with custom options', async () => {
      mockedService.getUserSchedules.mockResolvedValue([])

      const { result } = renderHook(
        () => useUserSchedules(5, { enabled: false }),
        { wrapper }
      )

      // Should not fetch when disabled
      expect(mockedService.getUserSchedules).not.toHaveBeenCalled()
      expect(result.current.isLoading).toBe(false)
    })

    test('respects staleTime option', async () => {
      mockedService.getUserSchedules.mockResolvedValue([])

      const { result } = renderHook(
        () => useUserSchedules(5, { staleTime: 60000 }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Data should still be fresh after immediate rerender
      expect(result.current.isStale).toBe(false)
    })
  })

  describe('Query key', () => {
    test('generates correct query key', async () => {
      mockedService.getUserSchedules.mockResolvedValue([])

      const { result } = renderHook(() => useUserSchedules(5), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Query key should include userId
      const queryData = queryClient.getQueryData(['userSchedules', 5])
      expect(queryData).toBeDefined()
    })
  })
})
