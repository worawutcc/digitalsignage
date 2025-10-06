/**
 * Mock Schedule Service
 * Temporary mock data service until backend endpoints are implemented
 */

import type { Schedule, ScheduleStats, CalendarData, ScheduleFilters, TimeSlot, RecurrenceConfig, TargetDevice, ScheduleContent } from '@/features/schedules/types'

/**
 * Mock schedule data
 */
const mockSchedules: Schedule[] = [
  {
    id: '1',
    name: 'Morning Announcements',
    description: 'Daily morning announcements for lobby display',
    priority: 1,
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    timeSlots: [{
      id: 'slot-1',
      startTime: '08:00',
      endTime: '09:00',
      daysOfWeek: [1, 2, 3, 4, 5],
      timezone: 'Asia/Bangkok'
    }],
    recurrence: {
      type: 'daily',
      interval: 1,
      endType: 'never'
    },
    targetDevices: [
      { id: 'device-1', name: 'Lobby Display 1', type: 'specific' },
      { id: 'device-2', name: 'Lobby Display 2', type: 'specific' }
    ],
    content: [
      { id: 'content-1', mediaId: 'media-1', mediaName: 'Company Logo', order: 1, duration: 5 },
      { id: 'content-2', mediaId: 'media-2', mediaName: 'Daily News', order: 2, duration: 30 }
    ],
    conflicts: [],
    createdBy: { id: 'admin', name: 'Admin User' },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    allowsConflicts: false,
    autoResolveConflicts: true,
    tags: ['announcements', 'daily'],
    lastModified: '2025-01-01T00:00:00Z'
  },
  {
    id: '2', 
    name: 'Product Showcase',
    description: 'Showcase latest products in retail areas',
    priority: 2,
    status: 'active',
    startDate: '2025-01-15',
    endDate: '2025-03-15',
    timeSlots: [{
      id: 'slot-2',
      startTime: '10:00',
      endTime: '18:00',
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      timezone: 'Asia/Bangkok'
    }],
    recurrence: {
      type: 'daily',
      interval: 1,
      endType: 'date',
      endDate: '2025-03-15'
    },
    targetDevices: [
      { id: 'device-3', name: 'Retail Display 1', type: 'specific' },
      { id: 'device-4', name: 'Retail Display 2', type: 'specific' }
    ],
    content: [
      { id: 'content-3', mediaId: 'media-3', mediaName: 'Product Video', order: 1, duration: 60 },
      { id: 'content-4', mediaId: 'media-4', mediaName: 'Pricing Info', order: 2, duration: 10 }
    ],
    conflicts: [],
    createdBy: { id: 'content_manager', name: 'Content Manager' },
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
    allowsConflicts: false,
    autoResolveConflicts: true,
    tags: ['products', 'retail'],
    lastModified: '2025-01-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'Emergency Alert Template',
    description: 'Template for emergency announcements',
    priority: 5,
    status: 'draft',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    timeSlots: [{
      id: 'slot-3',
      startTime: '00:00',
      endTime: '23:59',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      timezone: 'Asia/Bangkok'
    }],
    recurrence: {
      type: 'never',
      interval: 1,
      endType: 'never'
    },
    targetDevices: [
      { groupId: 'all-devices', name: 'All Devices', type: 'group' }
    ],
    content: [
      { id: 'content-5', mediaId: 'media-5', mediaName: 'Emergency Alert', order: 1, duration: 15 }
    ],
    conflicts: [],
    createdBy: { id: 'admin', name: 'Admin User' },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    allowsConflicts: true,
    autoResolveConflicts: false,
    tags: ['emergency', 'template'],
    lastModified: '2025-01-01T00:00:00Z'
  }
]

/**
 * Mock schedule statistics
 */
const mockStats: ScheduleStats = {
  totalSchedules: 3,
  activeSchedules: 2,
  draftSchedules: 1,
  expiredSchedules: 0,
  conflictCount: 0,
  devicesCovered: 4
}

/**
 * Mock calendar data
 */
const mockCalendarData: CalendarData = {
  events: [
    {
      id: '1',
      title: 'Morning Announcements',
      start: '2025-01-01T08:00:00Z',
      end: '2025-01-01T09:00:00Z',
      priority: 1,
      devices: ['device-1', 'device-2'],
      conflicts: [],
      color: '#3b82f6'
    },
    {
      id: '2',
      title: 'Product Showcase', 
      start: '2025-01-15T10:00:00Z',
      end: '2025-01-15T18:00:00Z',
      priority: 2,
      devices: ['device-3', 'device-4'],
      conflicts: [],
      color: '#10b981'
    }
  ],
  conflicts: []
}

/**
 * Mock Schedule Service
 * Provides mock data until backend endpoints are implemented
 */
export class MockScheduleService {
  /**
   * Get all schedules with optional filtering
   */
  static async getAll(filters?: ScheduleFilters): Promise<Schedule[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let filteredSchedules = [...mockSchedules]
    
    if (filters?.status?.length) {
      filteredSchedules = filteredSchedules.filter(s => 
        filters.status!.includes(s.status)
      )
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filteredSchedules = filteredSchedules.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search)
      )
    }
    
    return filteredSchedules
  }

  /**
   * Get schedule by ID
   */
  static async getById(id: string): Promise<Schedule> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const schedule = mockSchedules.find(s => s.id === id)
    if (!schedule) {
      throw new Error(`Schedule with ID ${id} not found`)
    }
    
    return schedule
  }

  /**
   * Get schedule statistics
   */
  static async getStats(): Promise<ScheduleStats> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockStats
  }

  /**
   * Get calendar data
   */
  static async getCalendarData(
    start: string,
    end: string,
    devices?: string[],
    view?: 'month' | 'week' | 'day'
  ): Promise<CalendarData> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let filteredData = { ...mockCalendarData }
    
    if (devices?.length) {
      filteredData.events = filteredData.events.filter(event =>
        event.devices.some((deviceId: string) => devices.includes(deviceId))
      )
    }
    
    return filteredData
  }

  /**
   * Get schedules for device
   */
  static async getForDevice(deviceId: string): Promise<Schedule[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return mockSchedules.filter(schedule =>
      schedule.targetDevices.some(device => device.id === deviceId)
    )
  }

  /**
   * Create schedule (mock)
   */
  static async create(scheduleData: any): Promise<Schedule> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newSchedule: Schedule = {
      id: String(Date.now()),
      ...scheduleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current_user'
    }
    
    mockSchedules.push(newSchedule)
    return newSchedule
  }

  /**
   * Update schedule (mock)
   */
  static async update(id: string, updates: Partial<Schedule>): Promise<Schedule> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = mockSchedules.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error(`Schedule with ID ${id} not found`)
    }
    
    const updatedSchedule = {
      ...mockSchedules[index],
      ...updates,
      updatedAt: new Date().toISOString()
    } as Schedule
    
    mockSchedules[index] = updatedSchedule
    return updatedSchedule
  }

  /**
   * Delete schedule (mock)
   */
  static async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = mockSchedules.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error(`Schedule with ID ${id} not found`)
    }
    
    mockSchedules.splice(index, 1)
  }
}

/**
 * Development flag to use mock service
 */
export const USE_MOCK_SCHEDULE_SERVICE = true