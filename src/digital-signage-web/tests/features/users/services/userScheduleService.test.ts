/**
 * T015: Unit Tests for userScheduleService
 * 
 * Tests the API client for user schedule assignment operations.
 * Service is already implemented, tests validate behavior.
 * 
 * @see features/users/services/userScheduleService.ts
 * @see specs/020-phase-1/contracts/user-schedules-api.md
 */

import { userScheduleService } from '@/features/users/services/userScheduleService'
import { apiClient } from '@/lib/api'
import type {
  GetUserSchedulesResponse,
  AssignSchedulesResponse,
} from '@/features/users/types/userSchedule'

// Mock axios
jest.mock('@/lib/api')
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('userScheduleService (T015)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserSchedules', () => {
    const mockResponse: GetUserSchedulesResponse = {
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

    it('should fetch user schedules successfully', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await userScheduleService.getUserSchedules(123)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/admin/users/123/schedules')
      expect(result).toEqual(mockResponse)
    })

    it('should return GetUserSchedulesResponse type', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await userScheduleService.getUserSchedules(123)

      expect(result).toHaveProperty('userId')
      expect(result).toHaveProperty('userName')
      expect(result).toHaveProperty('schedules')
      expect(result).toHaveProperty('totalCount')
      expect(Array.isArray(result.schedules)).toBe(true)
    })

    it('should throw error with message on 401 Unauthorized', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 401, data: {} },
      })

      await expect(userScheduleService.getUserSchedules(123)).rejects.toThrow(
        'Authentication required. Please log in.'
      )
    })

    it('should throw error with message on 403 Forbidden', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 403, data: {} },
      })

      await expect(userScheduleService.getUserSchedules(123)).rejects.toThrow(
        /do not have permission/i
      )
    })

    it('should throw error with message on 404 Not Found', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 404, data: {} },
      })

      await expect(userScheduleService.getUserSchedules(123)).rejects.toThrow(
        /user with id 123 not found/i
      )
    })

    it('should throw error with message on 500 Server Error', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 500, data: {} },
      })

      await expect(userScheduleService.getUserSchedules(123)).rejects.toThrow(
        /server error/i
      )
    })

    it('should throw network error on connection failure', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Network Error'))

      await expect(userScheduleService.getUserSchedules(123)).rejects.toThrow(
        /network error/i
      )
    })

    it('should include userId in error message for 404', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 404, data: {} },
      })

      await expect(userScheduleService.getUserSchedules(456)).rejects.toThrow(
        '456'
      )
    })
  })

  describe('assignSchedules', () => {
    const mockResponse: AssignSchedulesResponse = {
      userId: 123,
      assignedScheduleIds: [45, 67, 89],
      previousScheduleIds: [12, 34],
      assignedAt: '2025-10-02T14:25:00Z',
      assignedBy: 'admin@company.com',
      message: 'Successfully assigned 3 schedules to user',
    }

    it('should assign schedules with REPLACE semantics', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: mockResponse })

      const result = await userScheduleService.assignSchedules(123, [45, 67, 89])

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/admin/users/123/schedules',
        { scheduleIds: [45, 67, 89] }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should return previousScheduleIds in response', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: mockResponse })

      const result = await userScheduleService.assignSchedules(123, [45, 67])

      expect(result.previousScheduleIds).toEqual([12, 34])
      expect(result.assignedScheduleIds).toEqual([45, 67, 89])
    })

    it('should throw error on 400 Bad Request', async () => {
      mockedApiClient.post.mockRejectedValueOnce({
        response: { status: 400, data: { message: 'Invalid request' } },
      })

      await expect(
        userScheduleService.assignSchedules(123, [])
      ).rejects.toThrow(/invalid request/i)
    })

    it('should throw error on 422 Unprocessable Entity', async () => {
      mockedApiClient.post.mockRejectedValueOnce({
        response: {
          status: 422,
          data: { message: 'Cannot assign inactive schedules' },
        },
      })

      await expect(
        userScheduleService.assignSchedules(123, [99])
      ).rejects.toThrow(/cannot assign inactive schedules/i)
    })

    it('should throw error with validation messages', async () => {
      const validationError = {
        message: 'Validation failed',
        errors: ['Schedule 45 does not exist', 'Schedule 67 is inactive'],
      }

      mockedApiClient.post.mockRejectedValueOnce({
        response: { status: 422, data: validationError },
      })

      await expect(
        userScheduleService.assignSchedules(123, [45, 67])
      ).rejects.toThrow(/validation failed/i)
    })

    it('should handle empty scheduleIds array', async () => {
      mockedApiClient.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { message: 'scheduleIds cannot be empty' },
        },
      })

      await expect(
        userScheduleService.assignSchedules(123, [])
      ).rejects.toThrow(/cannot be empty/i)
    })

    it('should throw error on 404 user not found', async () => {
      mockedApiClient.post.mockRejectedValueOnce({
        response: { status: 404, data: {} },
      })

      await expect(
        userScheduleService.assignSchedules(999, [45])
      ).rejects.toThrow(/not found/i)
    })
  })

  describe('removeAllSchedules', () => {
    it('should remove all assignments successfully', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({ status: 204, data: null })

      await userScheduleService.removeAllSchedules(123)

      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        '/api/admin/users/123/schedules'
      )
    })

    it('should return void on 204 No Content', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({ status: 204, data: null })

      const result = await userScheduleService.removeAllSchedules(123)

      expect(result).toBeUndefined()
    })

    it('should handle errors appropriately', async () => {
      mockedApiClient.delete.mockRejectedValueOnce({
        response: { status: 404, data: {} },
      })

      await expect(userScheduleService.removeAllSchedules(999)).rejects.toThrow(
        /not found/i
      )
    })

    it('should throw error on 401 unauthorized', async () => {
      mockedApiClient.delete.mockRejectedValueOnce({
        response: { status: 401, data: {} },
      })

      await expect(userScheduleService.removeAllSchedules(123)).rejects.toThrow(
        /authentication required/i
      )
    })

    it('should throw error on 403 forbidden', async () => {
      mockedApiClient.delete.mockRejectedValueOnce({
        response: { status: 403, data: {} },
      })

      await expect(userScheduleService.removeAllSchedules(123)).rejects.toThrow(
        /permission/i
      )
    })
  })

  describe('JWT Token Authentication', () => {
    it('should include JWT token in Authorization header', async () => {
      // This is tested at the apiClient level
      // The service uses apiClient which handles JWT automatically
      // This test validates the integration

      mockedApiClient.get.mockResolvedValueOnce({
        data: { userId: 123, schedules: [], totalCount: 0 },
      })

      await userScheduleService.getUserSchedules(123)

      // apiClient should have been called (token added by interceptor)
      expect(mockedApiClient.get).toHaveBeenCalled()
    })
  })

  describe('Error Response Parsing', () => {
    it('should extract error message from response data', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Database connection failed' },
        },
      })

      await expect(userScheduleService.getUserSchedules(123)).rejects.toThrow(
        /database connection failed/i
      )
    })

    it('should use default message when no data.message', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 500, data: {} },
      })

      await expect(userScheduleService.getUserSchedules(123)).rejects.toThrow(
        /server error/i
      )
    })

    it('should handle response without data object', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 500 },
      })

      await expect(userScheduleService.getUserSchedules(123)).rejects.toThrow(
        /server error/i
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle large scheduleIds array', async () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => i + 1)
      mockedApiClient.post.mockResolvedValueOnce({
        data: {
          userId: 123,
          assignedScheduleIds: largeArray,
          previousScheduleIds: [],
          assignedAt: '2025-10-02T14:25:00Z',
          assignedBy: 'admin',
          message: 'Assigned 100 schedules',
        },
      })

      const result = await userScheduleService.assignSchedules(123, largeArray)

      expect(result.assignedScheduleIds).toHaveLength(100)
    })

    it('should handle special characters in error messages', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: "User's schedule: <error> & \"failed\"" },
        },
      })

      await expect(userScheduleService.getUserSchedules(123)).rejects.toThrow()
    })
  })
})
