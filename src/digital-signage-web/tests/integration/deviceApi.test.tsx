import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { deviceApi } from '@/services/api/deviceApi'

// Mock data
const mockDevices = [
  {
    id: '1',
    name: 'Main Hall Display',
    deviceKey: 'device_123',
    status: 'online',
    location: 'Main Hall',
    lastSeen: '2024-01-15T10:30:00Z',
    currentScheduleId: '1',
    deviceGroupId: '1',
    resolution: '1920x1080',
    orientation: 'landscape',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Lobby TV',
    deviceKey: 'device_456',
    status: 'offline',
    location: 'Lobby',
    lastSeen: '2024-01-14T15:20:00Z',
    currentScheduleId: null,
    deviceGroupId: '1',
    resolution: '1366x768',
    orientation: 'landscape',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-14T15:20:00Z',
  },
]

const mockDevice = mockDevices[0]

const mockDeviceCreateRequest = {
  name: 'New Device',
  location: 'Conference Room A',
  deviceGroupId: '1',
  resolution: '1920x1080',
  orientation: 'landscape' as const,
}

const mockDeviceUpdateRequest = {
  name: 'Updated Device Name',
  location: 'Updated Location',
  deviceGroupId: '2',
}

// Mock server handlers
const handlers = [
  // Get all devices
  rest.get('/api/devices', (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page') || '1')
    const pageSize = parseInt(req.url.searchParams.get('pageSize') || '10')
    const search = req.url.searchParams.get('search')
    const status = req.url.searchParams.get('status')

    let filteredDevices = [...mockDevices]

    if (search) {
      filteredDevices = filteredDevices.filter(device =>
        device.name.toLowerCase().includes(search.toLowerCase()) ||
        device.location.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status) {
      filteredDevices = filteredDevices.filter(device => device.status === status)
    }

    const total = filteredDevices.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedDevices = filteredDevices.slice(startIndex, endIndex)

    return res(
      ctx.json({
        devices: paginatedDevices,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      })
    )
  }),

  // Get device by ID
  rest.get('/api/devices/:id', (req, res, ctx) => {
    const { id } = req.params
    const device = mockDevices.find(d => d.id === id)

    if (!device) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Device not found' })
      )
    }

    return res(ctx.json(device))
  }),

  // Create new device
  rest.post('/api/devices', (req, res, ctx) => {
    const newDevice = {
      id: '3',
      deviceKey: 'device_789',
      status: 'offline' as const,
      lastSeen: null,
      currentScheduleId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...req.body,
    }

    return res(
      ctx.status(201),
      ctx.json(newDevice)
    )
  }),

  // Update device
  rest.put('/api/devices/:id', (req, res, ctx) => {
    const { id } = req.params
    const device = mockDevices.find(d => d.id === id)

    if (!device) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Device not found' })
      )
    }

    const updatedDevice = {
      ...device,
      ...req.body,
      updatedAt: new Date().toISOString(),
    }

    return res(ctx.json(updatedDevice))
  }),

  // Delete device
  rest.delete('/api/devices/:id', (req, res, ctx) => {
    const { id } = req.params
    const device = mockDevices.find(d => d.id === id)

    if (!device) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Device not found' })
      )
    }

    return res(ctx.status(204))
  }),

  // Device heartbeat
  rest.post('/api/devices/:id/heartbeat', (req, res, ctx) => {
    const { id } = req.params
    const device = mockDevices.find(d => d.id === id)

    if (!device) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Device not found' })
      )
    }

    return res(
      ctx.json({
        message: 'Heartbeat received',
        timestamp: new Date().toISOString(),
      })
    )
  }),

  // Get device schedule
  rest.get('/api/devices/:id/schedule', (req, res, ctx) => {
    const { id } = req.params
    const device = mockDevices.find(d => d.id === id)

    if (!device) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Device not found' })
      )
    }

    const mockSchedule = {
      id: '1',
      name: 'Main Schedule',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true,
      mediaItems: [
        {
          id: '1',
          mediaId: '1',
          duration: 30,
          order: 1,
        },
      ],
    }

    return res(ctx.json(mockSchedule))
  }),

  // Server error simulation
  rest.get('/api/devices/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ message: 'Internal server error' })
    )
  }),

  // Network error simulation (no response)
  rest.get('/api/devices/network-error', (req, res, ctx) => {
    return res.networkError('Network error')
  }),
]

// Setup server
const server = setupServer(...handlers)

describe('Device API Integration Tests', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  describe('GET /api/devices', () => {
    it('should fetch devices successfully', async () => {
      const result = await deviceApi.getDevices()

      expect(result.devices).toHaveLength(2)
      expect(result.devices[0]).toMatchObject({
        id: '1',
        name: 'Main Hall Display',
        status: 'online',
      })
      expect(result.pagination).toMatchObject({
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      })
    })

    it('should fetch devices with pagination', async () => {
      const result = await deviceApi.getDevices({ page: 1, pageSize: 1 })

      expect(result.devices).toHaveLength(1)
      expect(result.pagination).toMatchObject({
        page: 1,
        pageSize: 1,
        total: 2,
        totalPages: 2,
      })
    })

    it('should filter devices by search term', async () => {
      const result = await deviceApi.getDevices({ search: 'Main' })

      expect(result.devices).toHaveLength(1)
      expect(result.devices[0].name).toBe('Main Hall Display')
    })

    it('should filter devices by status', async () => {
      const result = await deviceApi.getDevices({ status: 'online' })

      expect(result.devices).toHaveLength(1)
      expect(result.devices[0].status).toBe('online')
    })
  })

  describe('GET /api/devices/:id', () => {
    it('should fetch device by ID successfully', async () => {
      const device = await deviceApi.getDevice('1')

      expect(device).toMatchObject({
        id: '1',
        name: 'Main Hall Display',
        status: 'online',
      })
    })

    it('should throw error for non-existent device', async () => {
      await expect(deviceApi.getDevice('999')).rejects.toThrow('Device not found')
    })
  })

  describe('POST /api/devices', () => {
    it('should create device successfully', async () => {
      const newDevice = await deviceApi.createDevice(mockDeviceCreateRequest)

      expect(newDevice).toMatchObject({
        id: '3',
        name: 'New Device',
        location: 'Conference Room A',
        status: 'offline',
      })
      expect(newDevice.deviceKey).toBeDefined()
      expect(newDevice.createdAt).toBeDefined()
    })

    it('should handle validation errors', async () => {
      server.use(
        rest.post('/api/devices', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              message: 'Validation failed',
              errors: {
                name: ['Name is required'],
                location: ['Location is required'],
              },
            })
          )
        })
      )

      await expect(deviceApi.createDevice({} as any)).rejects.toThrow('Validation failed')
    })
  })

  describe('PUT /api/devices/:id', () => {
    it('should update device successfully', async () => {
      const updatedDevice = await deviceApi.updateDevice('1', mockDeviceUpdateRequest)

      expect(updatedDevice).toMatchObject({
        id: '1',
        name: 'Updated Device Name',
        location: 'Updated Location',
        deviceGroupId: '2',
      })
      expect(updatedDevice.updatedAt).toBeDefined()
    })

    it('should throw error for non-existent device', async () => {
      await expect(
        deviceApi.updateDevice('999', mockDeviceUpdateRequest)
      ).rejects.toThrow('Device not found')
    })
  })

  describe('DELETE /api/devices/:id', () => {
    it('should delete device successfully', async () => {
      await expect(deviceApi.deleteDevice('1')).resolves.not.toThrow()
    })

    it('should throw error for non-existent device', async () => {
      await expect(deviceApi.deleteDevice('999')).rejects.toThrow('Device not found')
    })
  })

  describe('POST /api/devices/:id/heartbeat', () => {
    it('should send heartbeat successfully', async () => {
      const response = await deviceApi.sendHeartbeat('1')

      expect(response).toMatchObject({
        message: 'Heartbeat received',
        timestamp: expect.any(String),
      })
    })

    it('should throw error for non-existent device', async () => {
      await expect(deviceApi.sendHeartbeat('999')).rejects.toThrow('Device not found')
    })
  })

  describe('GET /api/devices/:id/schedule', () => {
    it('should fetch device schedule successfully', async () => {
      const schedule = await deviceApi.getDeviceSchedule('1')

      expect(schedule).toMatchObject({
        id: '1',
        name: 'Main Schedule',
        isActive: true,
      })
      expect(schedule.mediaItems).toHaveLength(1)
    })

    it('should throw error for non-existent device', async () => {
      await expect(deviceApi.getDeviceSchedule('999')).rejects.toThrow('Device not found')
    })
  })

  describe('Error Handling', () => {
    it('should handle server errors', async () => {
      await expect(deviceApi.getDevice('error')).rejects.toThrow('Internal server error')
    })

    it('should handle network errors', async () => {
      await expect(deviceApi.getDevice('network-error')).rejects.toThrow('Network error')
    })

    it('should handle timeout errors', async () => {
      server.use(
        rest.get('/api/devices/:id', (req, res, ctx) => {
          return res(ctx.delay(10000)) // Simulate timeout
        })
      )

      // Assuming your API client has a timeout configuration
      await expect(deviceApi.getDevice('1')).rejects.toThrow(/timeout/i)
    }, 6000)
  })

  describe('Request Headers', () => {
    it('should include authorization header when authenticated', async () => {
      // Mock authenticated state
      const mockAuthToken = 'mock-jwt-token'
      
      server.use(
        rest.get('/api/devices', (req, res, ctx) => {
          const authHeader = req.headers.get('Authorization')
          if (!authHeader || !authHeader.includes(mockAuthToken)) {
            return res(
              ctx.status(401),
              ctx.json({ message: 'Unauthorized' })
            )
          }
          return res(ctx.json({ devices: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }))
        })
      )

      // This test assumes your API client handles authentication
      await expect(deviceApi.getDevices()).resolves.not.toThrow()
    })

    it('should include content-type header for POST requests', async () => {
      server.use(
        rest.post('/api/devices', (req, res, ctx) => {
          const contentType = req.headers.get('Content-Type')
          if (!contentType?.includes('application/json')) {
            return res(
              ctx.status(400),
              ctx.json({ message: 'Invalid content type' })
            )
          }
          return res(ctx.status(201), ctx.json({ id: '3', ...req.body }))
        })
      )

      await expect(deviceApi.createDevice(mockDeviceCreateRequest)).resolves.not.toThrow()
    })
  })
})