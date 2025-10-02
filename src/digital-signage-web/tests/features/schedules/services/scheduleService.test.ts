/**
 * T016: Unit Tests for scheduleService New Methods
 * 
 * Tests the new methods added to scheduleService for user schedule assignment feature.
 * 
 * @see features/schedules/services/scheduleService.ts
 * @see specs/020-phase-1/contracts/user-schedules-api.md
 */

import { scheduleService } from '@/features/schedules/services/scheduleService'
import { apiClient } from '@/lib/api'
import type {
  ScheduleUsersResponse,
  SetDefaultScheduleResponse,
} from '@/features/schedules/types/schedule'

// Mock axios
jest.mock('@/lib/api')
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('scheduleService - New Methods (T016)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getScheduleUsers', () => {
    const mockResponse: ScheduleUsersResponse = {
      scheduleId: 45,
      scheduleName: 'Morning News',
      users: [
        {
          userId: 1,
          userName: 'John Doe',
          userEmail: 'john@example.com',
          assignedAt: '2025-10-01T10:00:00Z',
        },
        {
          userId: 2,
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          assignedAt: '2025-10-01T11:00:00Z',
        },
      ],
      totalCount: 2,
    }

    it('should fetch users assigned to schedule', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await scheduleService.getScheduleUsers(45)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/admin/schedules/45/users')
      expect(result).toEqual(mockResponse)
    })

    it('should return ScheduleUsersResponse type', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await scheduleService.getScheduleUsers(45)

      expect(result).toHaveProperty('scheduleId')
      expect(result).toHaveProperty('scheduleName')
      expect(result).toHaveProperty('users')
      expect(result).toHaveProperty('totalCount')
      expect(Array.isArray(result.users)).toBe(true)
    })

    it('should handle error 404 schedule not found', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 404, data: { message: 'Schedule not found' } },
      })

      await expect(scheduleService.getScheduleUsers(999)).rejects.toThrow(
        /not found/i
      )
    })

    it('should handle error 500 server error', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 500, data: {} },
      })

      await expect(scheduleService.getScheduleUsers(45)).rejects.toThrow(
        /server error/i
      )
    })

    it('should handle empty users list', async () => {
      const emptyResponse = {
        scheduleId: 45,
        scheduleName: 'Morning News',
        users: [],
        totalCount: 0,
      }

      mockedApiClient.get.mockResolvedValueOnce({ data: emptyResponse })

      const result = await scheduleService.getScheduleUsers(45)

      expect(result.users).toHaveLength(0)
      expect(result.totalCount).toBe(0)
    })

    it('should support pagination parameters', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      await scheduleService.getScheduleUsers(45, { page: 2, limit: 10 })

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/admin/schedules/45/users',
        { params: { page: 2, limit: 10 } }
      )
    })
  })

  describe('setDefaultSchedule', () => {
    const mockResponse: SetDefaultScheduleResponse = {
      scheduleId: 45,
      isDefault: true,
      previousDefaultScheduleId: 12,
      message: 'Default schedule updated successfully',
    }

    it('should set schedule as default', async () => {
      mockedApiClient.patch.mockResolvedValueOnce({ data: mockResponse })

      const result = await scheduleService.setDefaultSchedule(45, true)

      expect(mockedApiClient.patch).toHaveBeenCalledWith(
        '/api/admin/schedules/45/default',
        { isDefault: true }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should unset previous default when setting new default', async () => {
      mockedApiClient.patch.mockResolvedValueOnce({ data: mockResponse })

      const result = await scheduleService.setDefaultSchedule(45, true)

      expect(result.isDefault).toBe(true)
      expect(result.previousDefaultScheduleId).toBe(12)
    })

    it('should unset schedule as default', async () => {
      const unsetResponse = {
        scheduleId: 45,
        isDefault: false,
        previousDefaultScheduleId: null,
        message: 'Schedule is no longer default',
      }

      mockedApiClient.patch.mockResolvedValueOnce({ data: unsetResponse })

      const result = await scheduleService.setDefaultSchedule(45, false)

      expect(result.isDefault).toBe(false)
    })

    it('should throw error if business rule violated', async () => {
      mockedApiClient.patch.mockRejectedValueOnce({
        response: {
          status: 422,
          data: { message: 'Only one schedule can be default' },
        },
      })

      await expect(scheduleService.setDefaultSchedule(45, true)).rejects.toThrow(
        /only one schedule can be default/i
      )
    })

    it('should handle 404 schedule not found', async () => {
      mockedApiClient.patch.mockRejectedValueOnce({
        response: { status: 404, data: {} },
      })

      await expect(scheduleService.setDefaultSchedule(999, true)).rejects.toThrow(
        /not found/i
      )
    })

    it('should handle inactive schedule error', async () => {
      mockedApiClient.patch.mockRejectedValueOnce({
        response: {
          status: 422,
          data: { message: 'Cannot set inactive schedule as default' },
        },
      })

      await expect(scheduleService.setDefaultSchedule(45, true)).rejects.toThrow(
        /inactive schedule/i
      )
    })
  })

  describe('getSchedulesForSelector', () => {
    const mockSchedules = [
      {
        id: 1,
        name: 'Morning News',
        isActive: true,
        isDefault: false,
        assignedUsersCount: 5,
        startDate: '2025-10-01',
        endDate: null,
      },
      {
        id: 2,
        name: 'Afternoon Ads',
        isActive: true,
        isDefault: true,
        assignedUsersCount: 10,
        startDate: '2025-10-01',
        endDate: '2025-12-31',
      },
    ]

    it('should fetch schedules with pagination', async () => {
      const mockResponse = {
        schedules: mockSchedules,
        totalCount: 2,
        page: 1,
        pageSize: 20,
      }

      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await scheduleService.getSchedulesForSelector()

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/admin/schedules/selector')
      expect(result.schedules).toHaveLength(2)
    })

    it('should support search query parameter', async () => {
      const mockResponse = {
        schedules: [mockSchedules[0]],
        totalCount: 1,
        page: 1,
        pageSize: 20,
      }

      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      await scheduleService.getSchedulesForSelector({ query: 'Morning' })

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/admin/schedules/selector',
        { params: { query: 'Morning' } }
      )
    })

    it('should return active schedules only', async () => {
      const mockResponse = {
        schedules: mockSchedules.filter(s => s.isActive),
        totalCount: 2,
        page: 1,
        pageSize: 20,
      }

      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await scheduleService.getSchedulesForSelector()

      expect(result.schedules.every(s => s.isActive)).toBe(true)
    })

    it('should support pagination parameters', async () => {
      const mockResponse = {
        schedules: mockSchedules,
        totalCount: 50,
        page: 2,
        pageSize: 10,
      }

      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      await scheduleService.getSchedulesForSelector({ page: 2, pageSize: 10 })

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/admin/schedules/selector',
        { params: { page: 2, pageSize: 10 } }
      )
    })

    it('should handle empty results', async () => {
      const mockResponse = {
        schedules: [],
        totalCount: 0,
        page: 1,
        pageSize: 20,
      }

      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await scheduleService.getSchedulesForSelector({ query: 'xyz' })

      expect(result.schedules).toHaveLength(0)
      expect(result.totalCount).toBe(0)
    })

    it('should include assignedUsersCount in response', async () => {
      const mockResponse = {
        schedules: mockSchedules,
        totalCount: 2,
        page: 1,
        pageSize: 20,
      }

      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await scheduleService.getSchedulesForSelector()

      expect(result.schedules[0]).toHaveProperty('assignedUsersCount')
      expect(result.schedules[0].assignedUsersCount).toBe(5)
    })

    it('should handle server errors', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 500, data: {} },
      })

      await expect(
        scheduleService.getSchedulesForSelector()
      ).rejects.toThrow(/server error/i)
    })
  })

  describe('Error Handling', () => {
    it('should extract error message from response', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Database connection timeout' },
        },
      })

      await expect(scheduleService.getScheduleUsers(45)).rejects.toThrow(
        /database connection timeout/i
      )
    })

    it('should handle network errors', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Network Error'))

      await expect(scheduleService.getScheduleUsers(45)).rejects.toThrow(
        /network/i
      )
    })

    it('should handle 401 unauthorized', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 401, data: {} },
      })

      await expect(scheduleService.getScheduleUsers(45)).rejects.toThrow(
        /authentication/i
      )
    })

    it('should handle 403 forbidden', async () => {
      mockedApiClient.patch.mockRejectedValueOnce({
        response: { status: 403, data: {} },
      })

      await expect(scheduleService.setDefaultSchedule(45, true)).rejects.toThrow(
        /permission/i
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle large user lists (100+ users)', async () => {
      const largeUserList = Array.from({ length: 150 }, (_, i) => ({
        userId: i + 1,
        userName: `User ${i + 1}`,
        userEmail: `user${i + 1}@example.com`,
        assignedAt: '2025-10-01T10:00:00Z',
      }))

      const mockResponse = {
        scheduleId: 45,
        scheduleName: 'Popular Schedule',
        users: largeUserList,
        totalCount: 150,
      }

      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await scheduleService.getScheduleUsers(45)

      expect(result.users).toHaveLength(150)
    })

    it('should handle special characters in schedule names', async () => {
      const mockResponse = {
        schedules: [
          {
            id: 1,
            name: "John's Schedule: <Test> & \"Special\"",
            isActive: true,
            isDefault: false,
            assignedUsersCount: 1,
            startDate: '2025-10-01',
            endDate: null,
          },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 20,
      }

      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await scheduleService.getSchedulesForSelector()

      expect(result.schedules[0].name).toContain('John')
    })
  })
})
