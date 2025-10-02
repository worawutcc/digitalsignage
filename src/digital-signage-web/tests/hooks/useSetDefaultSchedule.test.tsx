/**
 * useSetDefaultSchedule Hook Tests (T019)
 * 
 * Contract tests for default schedule mutation hook.
 * Tests toggle functionality and "only one default" business rule.
 * 
 * These tests SHOULD FAIL initially (on assertions, not compilation).
 * 
 * @see copilot-instructions-web.md - Testing Standards
 * @see specs/020-phase-1/tasks.md - T019 Requirements
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSetDefaultSchedule } from '@/hooks/useSetDefaultSchedule'
import { userScheduleService } from '@/services/userScheduleService'
import { ReactNode } from 'react'

// Mock service
jest.mock('@/services/userScheduleService')
const mockedService = userScheduleService as jest.Mocked<typeof userScheduleService>

describe('useSetDefaultSchedule', () => {
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

  describe('Setting default schedule', () => {
    test('calls service with correct params', async () => {
      mockedService.setDefaultSchedule.mockResolvedValue({ success: true })

      const { result } = renderHook(() => useSetDefaultSchedule(5), { wrapper })

      result.current.mutate({ scheduleId: 10, setAsDefault: true })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockedService.setDefaultSchedule).toHaveBeenCalledWith(5, 10)
    })

    test('handles successful mutation', async () => {
      const mockResponse = { success: true, message: 'Default set' }
      mockedService.setDefaultSchedule.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useSetDefaultSchedule(5), { wrapper })

      result.current.mutate({ scheduleId: 10, setAsDefault: true })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockResponse)
    })

    test('handles mutation error', async () => {
      const mockError = new Error('Failed to set default')
      mockedService.setDefaultSchedule.mockRejectedValue(mockError)

      const { result } = renderHook(() => useSetDefaultSchedule(5), { wrapper })

      result.current.mutate({ scheduleId: 10, setAsDefault: true })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('Unsetting default schedule', () => {
    test('calls unset service method when setAsDefault is false', async () => {
      mockedService.unsetDefaultSchedule = jest.fn().mockResolvedValue({ success: true })

      const { result } = renderHook(() => useSetDefaultSchedule(5), { wrapper })

      result.current.mutate({ scheduleId: 10, setAsDefault: false })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockedService.unsetDefaultSchedule).toHaveBeenCalledWith(5, 10)
    })

    test('handles unset success', async () => {
      mockedService.unsetDefaultSchedule = jest.fn().mockResolvedValue({ success: true })

      const { result } = renderHook(() => useSetDefaultSchedule(5), { wrapper })

      result.current.mutate({ scheduleId: 10, setAsDefault: false })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('Cache invalidation', () => {
    test('invalidates user schedules query after success', async () => {
      mockedService.setDefaultSchedule.mockResolvedValue({ success: true })

      queryClient.setQueryData(['userSchedules', 5], [])

      const { result } = renderHook(() => useSetDefaultSchedule(5), { wrapper })

      result.current.mutate({ scheduleId: 10, setAsDefault: true })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      const queryState = queryClient.getQueryState(['userSchedules', 5])
      expect(queryState?.isInvalidated).toBe(true)
    })

    test('does not invalidate on error', async () => {
      mockedService.setDefaultSchedule.mockRejectedValue(new Error('Failed'))

      queryClient.setQueryData(['userSchedules', 5], [])

      const { result } = renderHook(() => useSetDefaultSchedule(5), { wrapper })

      result.current.mutate({ scheduleId: 10, setAsDefault: true })

      await waitFor(() => expect(result.current.isError).toBe(true))

      const queryState = queryClient.getQueryState(['userSchedules', 5])
      expect(queryState?.isInvalidated).toBe(false)
    })
  })

  describe('Optimistic updates', () => {
    test('optimistically updates cache before server response', async () => {
      const initialData = [
        { id: 10, name: 'Schedule 1', isDefault: false },
        { id: 11, name: 'Schedule 2', isDefault: true }
      ]

      mockedService.setDefaultSchedule.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      )

      queryClient.setQueryData(['userSchedules', 5], initialData)

      const { result } = renderHook(() => useSetDefaultSchedule(5), { wrapper })

      result.current.mutate({ scheduleId: 10, setAsDefault: true })

      // Cache should update optimistically
      const cacheData = queryClient.getQueryData(['userSchedules', 5]) as any[]
      const schedule10 = cacheData.find(s => s.id === 10)
      const schedule11 = cacheData.find(s => s.id === 11)

      expect(schedule10?.isDefault).toBe(true)
      expect(schedule11?.isDefault).toBe(false) // Only one default allowed
    })

    test('rolls back optimistic update on error', async () => {
      const initialData = [
        { id: 10, name: 'Schedule 1', isDefault: false }
      ]

      mockedService.setDefaultSchedule.mockRejectedValue(new Error('Failed'))

      queryClient.setQueryData(['userSchedules', 5], initialData)

      const { result } = renderHook(() => useSetDefaultSchedule(5), { wrapper })

      result.current.mutate({ scheduleId: 10, setAsDefault: true })

      await waitFor(() => expect(result.current.isError).toBe(true))

      // Cache should roll back to initial state
      const cacheData = queryClient.getQueryData(['userSchedules', 5]) as any[]
      expect(cacheData).toEqual(initialData)
    })
  })

  describe('Business rule: Only one default', () => {
    test('unsets previous default when setting new default', async () => {
      const initialData = [
        { id: 10, name: 'Schedule 1', isDefault: false },
        { id: 11, name: 'Schedule 2', isDefault: true }
      ]

      mockedService.setDefaultSchedule.mockResolvedValue({ success: true })

      queryClient.setQueryData(['userSchedules', 5], initialData)

      const { result } = renderHook(() => useSetDefaultSchedule(5), { wrapper })

      result.current.mutate({ scheduleId: 10, setAsDefault: true })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // After success, only schedule 10 should be default
      const updatedData = queryClient.getQueryData(['userSchedules', 5]) as any[]
      const defaultSchedules = updatedData.filter(s => s.isDefault)

      expect(defaultSchedules).toHaveLength(1)
      expect(defaultSchedules[0].id).toBe(10)
    })
  })
})
