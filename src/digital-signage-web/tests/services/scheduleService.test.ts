/**
 * ScheduleService Tests (T016)
 * 
 * Contract tests for schedule API service with new methods.
 * Tests search, pagination, and user assignment features.
 * 
 * These tests SHOULD FAIL initially (on assertions, not compilation).
 * 
 * @see copilot-instructions-web.md - Testing Standards
 * @see specs/020-phase-1/tasks.md - T016 Requirements
 */

import axios from 'axios'
import { scheduleService } from '@/services/scheduleService'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('scheduleService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getSchedules (with pagination)', () => {
    test('makes GET request to correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { items: [], total: 0 } })
      
      await scheduleService.getSchedules()
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/schedules', expect.any(Object))
    })

    test('includes JWT token in Authorization header', async () => {
      mockedAxios.get.mockResolvedValue({ data: { items: [], total: 0 } })
      
      await scheduleService.getSchedules()
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Bearer .+/)
          })
        })
      )
    })

    test('sends default pagination params', async () => {
      mockedAxios.get.mockResolvedValue({ data: { items: [], total: 0 } })
      
      await scheduleService.getSchedules()
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            page: 1,
            pageSize: 10
          })
        })
      )
    })

    test('sends custom pagination params', async () => {
      mockedAxios.get.mockResolvedValue({ data: { items: [], total: 0 } })
      
      await scheduleService.getSchedules({ page: 3, pageSize: 25 })
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            page: 3,
            pageSize: 25
          })
        })
      )
    })

    test('sends search query param', async () => {
      mockedAxios.get.mockResolvedValue({ data: { items: [], total: 0 } })
      
      await scheduleService.getSchedules({ search: 'morning' })
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            search: 'morning'
          })
        })
      )
    })

    test('returns paginated response', async () => {
      const mockData = {
        items: [
          { id: 1, name: 'Schedule 1' },
          { id: 2, name: 'Schedule 2' }
        ],
        total: 50,
        page: 1,
        pageSize: 10,
        totalPages: 5
      }
      mockedAxios.get.mockResolvedValue({ data: mockData })
      
      const result = await scheduleService.getSchedules()
      
      expect(result).toEqual(mockData)
    })

    test('throws error on 401 Unauthorized', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 401 }
      })
      
      await expect(scheduleService.getSchedules())
        .rejects.toThrow(/unauthorized/i)
    })

    test('throws error on 500 Server Error', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 500 }
      })
      
      await expect(scheduleService.getSchedules())
        .rejects.toThrow(/server error/i)
    })
  })

  describe('searchSchedules', () => {
    test('makes GET request with search term', async () => {
      mockedAxios.get.mockResolvedValue({ data: { items: [], total: 0 } })
      
      await scheduleService.searchSchedules('evening')
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/schedules',
        expect.objectContaining({
          params: expect.objectContaining({
            search: 'evening'
          })
        })
      )
    })

    test('includes JWT token in request', async () => {
      mockedAxios.get.mockResolvedValue({ data: { items: [], total: 0 } })
      
      await scheduleService.searchSchedules('test')
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Bearer .+/)
          })
        })
      )
    })

    test('returns filtered schedules', async () => {
      const mockData = {
        items: [{ id: 5, name: 'Evening Schedule' }],
        total: 1
      }
      mockedAxios.get.mockResolvedValue({ data: mockData })
      
      const result = await scheduleService.searchSchedules('evening')
      
      expect(result).toEqual(mockData)
    })

    test('handles empty search results', async () => {
      mockedAxios.get.mockResolvedValue({ data: { items: [], total: 0 } })
      
      const result = await scheduleService.searchSchedules('nonexistent')
      
      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('getScheduleById', () => {
    test('makes GET request to correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { id: 10, name: 'Test' } })
      
      await scheduleService.getScheduleById(10)
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/schedules/10')
    })

    test('includes JWT token in request', async () => {
      mockedAxios.get.mockResolvedValue({ data: { id: 10 } })
      
      await scheduleService.getScheduleById(10)
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Bearer .+/)
          })
        })
      )
    })

    test('returns schedule details', async () => {
      const mockSchedule = {
        id: 10,
        name: 'Test Schedule',
        description: 'Test description',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true
      }
      mockedAxios.get.mockResolvedValue({ data: mockSchedule })
      
      const result = await scheduleService.getScheduleById(10)
      
      expect(result).toEqual(mockSchedule)
    })

    test('throws error on 404 Not Found', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 404 }
      })
      
      await expect(scheduleService.getScheduleById(999))
        .rejects.toThrow(/not found/i)
    })
  })

  describe('getAssignedUsers', () => {
    test('makes GET request to correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { users: [], total: 0 } })
      
      await scheduleService.getAssignedUsers(10)
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/schedules/10/users', expect.any(Object))
    })

    test('includes JWT token in request', async () => {
      mockedAxios.get.mockResolvedValue({ data: { users: [], total: 0 } })
      
      await scheduleService.getAssignedUsers(10)
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Bearer .+/)
          })
        })
      )
    })

    test('sends pagination params', async () => {
      mockedAxios.get.mockResolvedValue({ data: { users: [], total: 0 } })
      
      await scheduleService.getAssignedUsers(10, { page: 2, pageSize: 20 })
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            page: 2,
            pageSize: 20
          })
        })
      )
    })

    test('returns paginated user list', async () => {
      const mockData = {
        users: [
          { id: 1, email: 'user1@test.com', name: 'User 1' },
          { id: 2, email: 'user2@test.com', name: 'User 2' }
        ],
        total: 50,
        page: 1,
        pageSize: 10,
        totalPages: 5
      }
      mockedAxios.get.mockResolvedValue({ data: mockData })
      
      const result = await scheduleService.getAssignedUsers(10)
      
      expect(result).toEqual(mockData)
    })

    test('throws error on 404 Schedule Not Found', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 404 }
      })
      
      await expect(scheduleService.getAssignedUsers(999))
        .rejects.toThrow(/not found/i)
    })
  })

  describe('removeUserFromSchedule', () => {
    test('makes DELETE request to correct endpoint', async () => {
      mockedAxios.delete.mockResolvedValue({ data: { success: true } })
      
      await scheduleService.removeUserFromSchedule(10, 5)
      
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/schedules/10/users/5')
    })

    test('includes JWT token in request', async () => {
      mockedAxios.delete.mockResolvedValue({ data: { success: true } })
      
      await scheduleService.removeUserFromSchedule(10, 5)
      
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Bearer .+/)
          })
        })
      )
    })

    test('returns success response', async () => {
      const mockResponse = { success: true, message: 'User removed' }
      mockedAxios.delete.mockResolvedValue({ data: mockResponse })
      
      const result = await scheduleService.removeUserFromSchedule(10, 5)
      
      expect(result).toEqual(mockResponse)
    })

    test('throws error on 403 Forbidden', async () => {
      mockedAxios.delete.mockRejectedValue({
        response: { status: 403 }
      })
      
      await expect(scheduleService.removeUserFromSchedule(10, 5))
        .rejects.toThrow(/forbidden/i)
    })

    test('throws error on 404 Not Found', async () => {
      mockedAxios.delete.mockRejectedValue({
        response: { status: 404 }
      })
      
      await expect(scheduleService.removeUserFromSchedule(10, 5))
        .rejects.toThrow(/not found/i)
    })
  })

  describe('Error handling', () => {
    test('handles network errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'))
      
      await expect(scheduleService.getSchedules())
        .rejects.toThrow(/network/i)
    })

    test('handles timeout errors', async () => {
      mockedAxios.get.mockRejectedValue({ code: 'ECONNABORTED' })
      
      await expect(scheduleService.getSchedules())
        .rejects.toThrow()
    })
  })
})
