/**
 * UserScheduleService Tests (T015)
 * 
 * Contract tests for user schedule assignment API service.
 * 
 * Tests Axios mocking, error handling (401/403/404/422/500),
 * JWT header authentication, and response transformations.
 * 
 * These tests SHOULD FAIL initially (on assertions, not compilation).
 * 
 * @see copilot-instructions-web.md - Testing Standards
 * @see specs/020-phase-1/tasks.md - T015 Requirements
 */

import axios from 'axios'
import { userScheduleService } from '@/services/userScheduleService'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('userScheduleService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserSchedules', () => {
    test('makes GET request to correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] })
      
      await userScheduleService.getUserSchedules(5)
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/users/5/schedules')
    })

    test('includes JWT token in Authorization header', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] })
      
      await userScheduleService.getUserSchedules(5)
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Bearer .+/)
          })
        })
      )
    })

    test('returns array of schedules', async () => {
      const mockData = [
        { id: 1, name: 'Schedule 1' },
        { id: 2, name: 'Schedule 2' }
      ]
      mockedAxios.get.mockResolvedValue({ data: mockData })
      
      const result = await userScheduleService.getUserSchedules(5)
      
      expect(result).toEqual(mockData)
    })

    test('throws error on 401 Unauthorized', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 401, data: { message: 'Unauthorized' } }
      })
      
      await expect(userScheduleService.getUserSchedules(5))
        .rejects.toThrow(/unauthorized/i)
    })

    test('throws error on 403 Forbidden', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 403, data: { message: 'Forbidden' } }
      })
      
      await expect(userScheduleService.getUserSchedules(5))
        .rejects.toThrow(/forbidden/i)
    })

    test('throws error on 404 Not Found', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 404, data: { message: 'User not found' } }
      })
      
      await expect(userScheduleService.getUserSchedules(5))
        .rejects.toThrow(/not found/i)
    })

    test('throws error on 500 Server Error', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 500, data: { message: 'Internal server error' } }
      })
      
      await expect(userScheduleService.getUserSchedules(5))
        .rejects.toThrow(/server error/i)
    })
  })

  describe('assignSchedulesToUser', () => {
    test('makes POST request to correct endpoint', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } })
      
      await userScheduleService.assignSchedulesToUser(5, [1, 2, 3])
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/users/5/schedules',
        { scheduleIds: [1, 2, 3] }
      )
    })

    test('includes JWT token in request', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } })
      
      await userScheduleService.assignSchedulesToUser(5, [1])
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Bearer .+/)
          })
        })
      )
    })

    test('sends empty array for scheduleIds', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } })
      
      await userScheduleService.assignSchedulesToUser(5, [])
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        { scheduleIds: [] }
      )
    })

    test('returns success response', async () => {
      const mockResponse = { success: true, message: 'Schedules assigned' }
      mockedAxios.post.mockResolvedValue({ data: mockResponse })
      
      const result = await userScheduleService.assignSchedulesToUser(5, [1, 2])
      
      expect(result).toEqual(mockResponse)
    })

    test('throws error on 401 Unauthorized', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { status: 401 }
      })
      
      await expect(userScheduleService.assignSchedulesToUser(5, [1]))
        .rejects.toThrow(/unauthorized/i)
    })

    test('throws error on 403 Forbidden', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { status: 403 }
      })
      
      await expect(userScheduleService.assignSchedulesToUser(5, [1]))
        .rejects.toThrow(/forbidden/i)
    })

    test('throws error on 404 User Not Found', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { status: 404 }
      })
      
      await expect(userScheduleService.assignSchedulesToUser(5, [1]))
        .rejects.toThrow(/not found/i)
    })

    test('throws error on 422 Invalid Schedule IDs', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { status: 422, data: { message: 'Invalid schedule IDs' } }
      })
      
      await expect(userScheduleService.assignSchedulesToUser(5, [999]))
        .rejects.toThrow(/invalid/i)
    })

    test('throws error on 500 Server Error', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { status: 500 }
      })
      
      await expect(userScheduleService.assignSchedulesToUser(5, [1]))
        .rejects.toThrow(/server error/i)
    })
  })

  describe('removeAllSchedulesFromUser', () => {
    test('makes DELETE request to correct endpoint', async () => {
      mockedAxios.delete.mockResolvedValue({ data: { success: true } })
      
      await userScheduleService.removeAllSchedulesFromUser(5)
      
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/users/5/schedules')
    })

    test('includes JWT token in request', async () => {
      mockedAxios.delete.mockResolvedValue({ data: { success: true } })
      
      await userScheduleService.removeAllSchedulesFromUser(5)
      
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
      const mockResponse = { success: true, message: 'All schedules removed' }
      mockedAxios.delete.mockResolvedValue({ data: mockResponse })
      
      const result = await userScheduleService.removeAllSchedulesFromUser(5)
      
      expect(result).toEqual(mockResponse)
    })

    test('throws error on 401 Unauthorized', async () => {
      mockedAxios.delete.mockRejectedValue({
        response: { status: 401 }
      })
      
      await expect(userScheduleService.removeAllSchedulesFromUser(5))
        .rejects.toThrow(/unauthorized/i)
    })

    test('throws error on 403 Forbidden', async () => {
      mockedAxios.delete.mockRejectedValue({
        response: { status: 403 }
      })
      
      await expect(userScheduleService.removeAllSchedulesFromUser(5))
        .rejects.toThrow(/forbidden/i)
    })

    test('throws error on 404 User Not Found', async () => {
      mockedAxios.delete.mockRejectedValue({
        response: { status: 404 }
      })
      
      await expect(userScheduleService.removeAllSchedulesFromUser(5))
        .rejects.toThrow(/not found/i)
    })

    test('throws error on 500 Server Error', async () => {
      mockedAxios.delete.mockRejectedValue({
        response: { status: 500 }
      })
      
      await expect(userScheduleService.removeAllSchedulesFromUser(5))
        .rejects.toThrow(/server error/i)
    })
  })

  describe('setDefaultSchedule', () => {
    test('makes PUT request to correct endpoint', async () => {
      mockedAxios.put.mockResolvedValue({ data: { success: true } })
      
      await userScheduleService.setDefaultSchedule(5, 10)
      
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/users/5/schedules/10/default'
      )
    })

    test('includes JWT token in request', async () => {
      mockedAxios.put.mockResolvedValue({ data: { success: true } })
      
      await userScheduleService.setDefaultSchedule(5, 10)
      
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.any(String),
        undefined,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Bearer .+/)
          })
        })
      )
    })

    test('returns success response', async () => {
      const mockResponse = { success: true, message: 'Default schedule set' }
      mockedAxios.put.mockResolvedValue({ data: mockResponse })
      
      const result = await userScheduleService.setDefaultSchedule(5, 10)
      
      expect(result).toEqual(mockResponse)
    })

    test('throws error on 422 Schedule Not Assigned', async () => {
      mockedAxios.put.mockRejectedValue({
        response: { status: 422, data: { message: 'Schedule not assigned to user' } }
      })
      
      await expect(userScheduleService.setDefaultSchedule(5, 10))
        .rejects.toThrow(/not assigned/i)
    })
  })
})
