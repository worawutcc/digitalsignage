/**
 * Mock Device Service
 * Temporary mock data service until backend endpoints are implemented
 */

export interface DeviceItem {
  id: string
  name: string
  type: 'android-tv' | 'tablet' | 'display' | 'kiosk'
  status: 'online' | 'offline' | 'maintenance' | 'error'
  location?: string
  ipAddress?: string
  macAddress?: string
  lastSeen: string
  createdAt: string
  updatedAt: string
  currentPlaylist?: string
  systemInfo?: {
    os: string
    version: string
    storage: {
      total: number
      used: number
      free: number
    }
    resolution: string
  }
  tags?: string[]
}

/**
 * Mock device data
 */
const mockDevices: DeviceItem[] = [
  {
    id: '1',
    name: 'Lobby Main Display',
    type: 'android-tv',
    status: 'online',
    location: 'Main Lobby',
    ipAddress: '192.168.1.101',
    macAddress: '00:1B:44:11:3A:B7',
    lastSeen: new Date().toISOString(),
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-07T00:00:00Z',
    currentPlaylist: '1',
    systemInfo: {
      os: 'Android TV',
      version: '11.0',
      storage: {
        total: 32000000000, // 32GB
        used: 8000000000,   // 8GB
        free: 24000000000   // 24GB
      },
      resolution: '3840x2160'
    },
    tags: ['main', 'lobby']
  },
  {
    id: '2',
    name: 'Conference Room A',
    type: 'display',
    status: 'online',
    location: 'Conference Room A',
    ipAddress: '192.168.1.102',
    macAddress: '00:1B:44:11:3A:B8',
    lastSeen: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-06T00:00:00Z',
    currentPlaylist: '2',
    systemInfo: {
      os: 'Linux',
      version: '20.04',
      storage: {
        total: 16000000000,
        used: 4000000000,
        free: 12000000000
      },
      resolution: '1920x1080'
    },
    tags: ['conference', 'meeting']
  },
  {
    id: '3',
    name: 'Reception Tablet',
    type: 'tablet',
    status: 'offline',
    location: 'Reception Desk',
    ipAddress: '192.168.1.103',
    macAddress: '00:1B:44:11:3A:B9',
    lastSeen: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
    createdAt: '2025-01-03T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
    tags: ['reception', 'tablet']
  },
  {
    id: '4',
    name: 'Cafeteria Screen',
    type: 'display',
    status: 'maintenance',
    location: 'Employee Cafeteria',
    ipAddress: '192.168.1.104',
    macAddress: '00:1B:44:11:3A:BA',
    lastSeen: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
    createdAt: '2025-01-04T00:00:00Z',
    updatedAt: '2025-01-07T00:00:00Z',
    currentPlaylist: '4',
    systemInfo: {
      os: 'Windows',
      version: '11',
      storage: {
        total: 64000000000,
        used: 20000000000,
        free: 44000000000
      },
      resolution: '1920x1080'
    },
    tags: ['cafeteria', 'employee']
  },
  {
    id: '5',
    name: 'Emergency Kiosk',
    type: 'kiosk',
    status: 'error',
    location: 'Emergency Exit',
    ipAddress: '192.168.1.105',
    macAddress: '00:1B:44:11:3A:BB',
    lastSeen: new Date(Date.now() - 6 * 60 * 60000).toISOString(), // 6 hours ago
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-06T00:00:00Z',
    tags: ['emergency', 'kiosk']
  }
]

/**
 * Mock Device Service
 * Provides mock data until backend endpoints are implemented
 */
export class MockDeviceService {
  /**
   * Get all devices
   */
  static async getAll(): Promise<DeviceItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...mockDevices]
  }

  /**
   * Get device by ID
   */
  static async getById(id: string): Promise<DeviceItem> {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const device = mockDevices.find(d => d.id === id)
    if (!device) {
      throw new Error(`Device with ID ${id} not found`)
    }
    
    return device
  }

  /**
   * Get devices by status
   */
  static async getByStatus(status: DeviceItem['status']): Promise<DeviceItem[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockDevices.filter(device => device.status === status)
  }

  /**
   * Get devices by type
   */
  static async getByType(type: DeviceItem['type']): Promise<DeviceItem[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockDevices.filter(device => device.type === type)
  }

  /**
   * Register new device
   */
  static async register(data: Omit<DeviceItem, 'id' | 'createdAt' | 'updatedAt' | 'lastSeen'>): Promise<DeviceItem> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newDevice: DeviceItem = {
      ...data,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    }
    
    mockDevices.unshift(newDevice)
    return newDevice
  }

  /**
   * Update device
   */
  static async update(id: string, updates: Partial<DeviceItem>): Promise<DeviceItem> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = mockDevices.findIndex(d => d.id === id)
    if (index === -1) {
      throw new Error(`Device with ID ${id} not found`)
    }
    
    const updatedDevice: DeviceItem = {
      ...mockDevices[index],
      ...updates,
      updatedAt: new Date().toISOString()
    } as DeviceItem
    
    mockDevices[index] = updatedDevice
    return updatedDevice
  }

  /**
   * Delete device
   */
  static async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 250))
    
    const index = mockDevices.findIndex(d => d.id === id)
    if (index === -1) {
      throw new Error(`Device with ID ${id} not found`)
    }
    
    mockDevices.splice(index, 1)
  }

  /**
   * Search devices
   */
  static async search(query: string): Promise<DeviceItem[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const searchTerm = query.toLowerCase()
    return mockDevices.filter(device =>
      device.name.toLowerCase().includes(searchTerm) ||
      device.location?.toLowerCase().includes(searchTerm) ||
      device.ipAddress?.includes(searchTerm) ||
      device.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  /**
   * Send command to device
   */
  static async sendCommand(id: string, command: string, params?: any): Promise<{
    success: boolean
    message: string
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const device = mockDevices.find(d => d.id === id)
    if (!device) {
      throw new Error(`Device with ID ${id} not found`)
    }
    
    // Mock command responses
    const responses = {
      'restart': { success: true, message: 'Device restart initiated' },
      'update_playlist': { success: true, message: 'Playlist updated successfully' },
      'get_status': { success: true, message: 'Status retrieved' },
      'screenshot': { success: true, message: 'Screenshot captured' }
    }
    
    return responses[command as keyof typeof responses] || 
           { success: false, message: 'Unknown command' }
  }

  /**
   * Get device statistics
   */
  static async getStats(): Promise<{
    totalDevices: number
    onlineDevices: number
    offlineDevices: number
    devicesByType: Record<string, number>
    devicesByStatus: Record<string, number>
  }> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const devicesByType = mockDevices.reduce((acc, device) => {
      acc[device.type] = (acc[device.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const devicesByStatus = mockDevices.reduce((acc, device) => {
      acc[device.status] = (acc[device.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalDevices: mockDevices.length,
      onlineDevices: mockDevices.filter(d => d.status === 'online').length,
      offlineDevices: mockDevices.filter(d => d.status === 'offline').length,
      devicesByType,
      devicesByStatus
    }
  }

  /**
   * Get device health status
   */
  static async getHealthStatus(id: string): Promise<{
    status: 'healthy' | 'warning' | 'critical'
    checks: Array<{
      name: string
      status: 'pass' | 'warning' | 'fail'
      message: string
    }>
    lastCheck: string
  }> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock health checks
    return {
      status: 'healthy',
      checks: [
        { name: 'Network Connectivity', status: 'pass', message: 'Connection stable' },
        { name: 'Storage Space', status: 'pass', message: '75% free space available' },
        { name: 'Memory Usage', status: 'warning', message: 'Memory usage at 85%' },
        { name: 'Display Output', status: 'pass', message: 'Display functioning normally' }
      ],
      lastCheck: new Date().toISOString()
    }
  }
}

/**
 * Development flag to use mock service
 */
export const USE_MOCK_DEVICE_SERVICE = true