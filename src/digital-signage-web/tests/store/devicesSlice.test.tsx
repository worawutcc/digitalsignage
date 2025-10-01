import { configureStore } from '@reduxjs/toolkit'
import { devicesSlice, devicesActions } from '@/store/slices/devicesSlice'
import type { DevicesState, Device } from '@/store/slices/devicesSlice'

// Mock device data
const mockDevices: Device[] = [
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
  {
    id: '3',
    name: 'Conference Room A',
    deviceKey: 'device_789',
    status: 'maintenance',
    location: 'Conference Room A',
    lastSeen: '2024-01-15T09:00:00Z',
    currentScheduleId: '2',
    deviceGroupId: '2',
    resolution: '1920x1080',
    orientation: 'portrait',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
]

const mockPagination = {
  page: 1,
  pageSize: 10,
  total: 3,
  totalPages: 1,
}

// Helper function to create test store
const createTestStore = (initialState?: Partial<DevicesState>) => {
  return configureStore({
    reducer: {
      devices: devicesSlice.reducer,
    },
    preloadedState: {
      devices: {
        devices: [],
        selectedDevices: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        },
        filters: {
          search: '',
          status: '',
          deviceGroupId: '',
        },
        sortConfig: null,
        isLoading: false,
        error: null,
        ...initialState,
      },
    },
  })
}

describe('Devices Store Tests', () => {
  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = createTestStore()
      const state = store.getState().devices

      expect(state).toEqual({
        devices: [],
        selectedDevices: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        },
        filters: {
          search: '',
          status: '',
          deviceGroupId: '',
        },
        sortConfig: null,
        isLoading: false,
        error: null,
      })
    })
  })

  describe('Fetch Devices Actions', () => {
    it('should handle fetch devices start', () => {
      const store = createTestStore()
      
      store.dispatch(devicesActions.fetchDevicesStart())
      const state = store.getState().devices

      expect(state.isLoading).toBe(true)
      expect(state.error).toBe(null)
    })

    it('should handle fetch devices success', () => {
      const store = createTestStore()
      const payload = {
        devices: mockDevices,
        pagination: mockPagination,
      }

      store.dispatch(devicesActions.fetchDevicesSuccess(payload))
      const state = store.getState().devices

      expect(state.devices).toEqual(mockDevices)
      expect(state.pagination).toEqual(mockPagination)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle fetch devices failure', () => {
      const store = createTestStore()
      const errorMessage = 'Failed to fetch devices'

      store.dispatch(devicesActions.fetchDevicesFailure(errorMessage))
      const state = store.getState().devices

      expect(state.devices).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('Create Device Actions', () => {
    it('should handle create device start', () => {
      const store = createTestStore({
        devices: mockDevices,
      })

      store.dispatch(devicesActions.createDeviceStart())
      const state = store.getState().devices

      expect(state.isLoading).toBe(true)
      expect(state.error).toBe(null)
    })

    it('should handle create device success', () => {
      const store = createTestStore({
        devices: mockDevices,
        pagination: mockPagination,
      })

      const newDevice: Device = {
        id: '4',
        name: 'New Device',
        deviceKey: 'device_new',
        status: 'offline',
        location: 'New Location',
        lastSeen: null,
        currentScheduleId: null,
        deviceGroupId: '1',
        resolution: '1920x1080',
        orientation: 'landscape',
        createdAt: '2024-01-15T12:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
      }

      store.dispatch(devicesActions.createDeviceSuccess(newDevice))
      const state = store.getState().devices

      expect(state.devices).toContain(newDevice)
      expect(state.devices).toHaveLength(4)
      expect(state.pagination.total).toBe(4)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle create device failure', () => {
      const store = createTestStore({
        devices: mockDevices,
        isLoading: true,
      })

      const errorMessage = 'Failed to create device'

      store.dispatch(devicesActions.createDeviceFailure(errorMessage))
      const state = store.getState().devices

      expect(state.devices).toEqual(mockDevices) // Should not change
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('Update Device Actions', () => {
    it('should handle update device start', () => {
      const store = createTestStore({
        devices: mockDevices,
      })

      store.dispatch(devicesActions.updateDeviceStart())
      const state = store.getState().devices

      expect(state.isLoading).toBe(true)
      expect(state.error).toBe(null)
    })

    it('should handle update device success', () => {
      const store = createTestStore({
        devices: mockDevices,
      })

      const updatedDevice: Device = {
        ...mockDevices[0],
        name: 'Updated Device Name',
        location: 'Updated Location',
        updatedAt: '2024-01-15T12:00:00Z',
      }

      store.dispatch(devicesActions.updateDeviceSuccess(updatedDevice))
      const state = store.getState().devices

      const deviceInState = state.devices.find(d => d.id === updatedDevice.id)
      expect(deviceInState).toEqual(updatedDevice)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle update device failure', () => {
      const store = createTestStore({
        devices: mockDevices,
        isLoading: true,
      })

      const errorMessage = 'Failed to update device'

      store.dispatch(devicesActions.updateDeviceFailure(errorMessage))
      const state = store.getState().devices

      expect(state.devices).toEqual(mockDevices) // Should not change
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('Delete Device Actions', () => {
    it('should handle delete device start', () => {
      const store = createTestStore({
        devices: mockDevices,
      })

      store.dispatch(devicesActions.deleteDeviceStart())
      const state = store.getState().devices

      expect(state.isLoading).toBe(true)
      expect(state.error).toBe(null)
    })

    it('should handle delete device success', () => {
      const store = createTestStore({
        devices: mockDevices,
        pagination: mockPagination,
      })

      const deviceIdToDelete = '1'

      store.dispatch(devicesActions.deleteDeviceSuccess(deviceIdToDelete))
      const state = store.getState().devices

      expect(state.devices.find(d => d.id === deviceIdToDelete)).toBeUndefined()
      expect(state.devices).toHaveLength(2)
      expect(state.pagination.total).toBe(2)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle delete device failure', () => {
      const store = createTestStore({
        devices: mockDevices,
        isLoading: true,
      })

      const errorMessage = 'Failed to delete device'

      store.dispatch(devicesActions.deleteDeviceFailure(errorMessage))
      const state = store.getState().devices

      expect(state.devices).toEqual(mockDevices) // Should not change
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('Device Selection', () => {
    it('should handle selecting a device', () => {
      const store = createTestStore({
        devices: mockDevices,
      })

      const deviceId = '1'

      store.dispatch(devicesActions.selectDevice(deviceId))
      const state = store.getState().devices

      expect(state.selectedDevices).toContain(deviceId)
    })

    it('should handle deselecting a device', () => {
      const store = createTestStore({
        devices: mockDevices,
        selectedDevices: ['1', '2'],
      })

      const deviceId = '1'

      store.dispatch(devicesActions.deselectDevice(deviceId))
      const state = store.getState().devices

      expect(state.selectedDevices).not.toContain(deviceId)
      expect(state.selectedDevices).toContain('2')
    })

    it('should handle selecting all devices', () => {
      const store = createTestStore({
        devices: mockDevices,
      })

      store.dispatch(devicesActions.selectAllDevices())
      const state = store.getState().devices

      expect(state.selectedDevices).toEqual(['1', '2', '3'])
    })

    it('should handle clearing all selections', () => {
      const store = createTestStore({
        devices: mockDevices,
        selectedDevices: ['1', '2', '3'],
      })

      store.dispatch(devicesActions.clearSelection())
      const state = store.getState().devices

      expect(state.selectedDevices).toEqual([])
    })

    it('should handle toggling device selection', () => {
      const store = createTestStore({
        devices: mockDevices,
        selectedDevices: ['1'],
      })

      // Toggle unselected device (should select)
      store.dispatch(devicesActions.toggleDeviceSelection('2'))
      let state = store.getState().devices
      expect(state.selectedDevices).toContain('2')

      // Toggle selected device (should deselect)
      store.dispatch(devicesActions.toggleDeviceSelection('1'))
      state = store.getState().devices
      expect(state.selectedDevices).not.toContain('1')
    })
  })

  describe('Filters and Search', () => {
    it('should handle setting search filter', () => {
      const store = createTestStore()
      const searchTerm = 'Main Hall'

      store.dispatch(devicesActions.setSearchFilter(searchTerm))
      const state = store.getState().devices

      expect(state.filters.search).toBe(searchTerm)
    })

    it('should handle setting status filter', () => {
      const store = createTestStore()
      const status = 'online'

      store.dispatch(devicesActions.setStatusFilter(status))
      const state = store.getState().devices

      expect(state.filters.status).toBe(status)
    })

    it('should handle setting device group filter', () => {
      const store = createTestStore()
      const deviceGroupId = '1'

      store.dispatch(devicesActions.setDeviceGroupFilter(deviceGroupId))
      const state = store.getState().devices

      expect(state.filters.deviceGroupId).toBe(deviceGroupId)
    })

    it('should handle clearing all filters', () => {
      const store = createTestStore({
        filters: {
          search: 'test',
          status: 'online',
          deviceGroupId: '1',
        },
      })

      store.dispatch(devicesActions.clearFilters())
      const state = store.getState().devices

      expect(state.filters).toEqual({
        search: '',
        status: '',
        deviceGroupId: '',
      })
    })
  })

  describe('Sorting', () => {
    it('should handle setting sort configuration', () => {
      const store = createTestStore()
      const sortConfig = {
        column: 'name' as const,
        direction: 'asc' as const,
      }

      store.dispatch(devicesActions.setSortConfig(sortConfig))
      const state = store.getState().devices

      expect(state.sortConfig).toEqual(sortConfig)
    })

    it('should handle clearing sort configuration', () => {
      const store = createTestStore({
        sortConfig: {
          column: 'name',
          direction: 'asc',
        },
      })

      store.dispatch(devicesActions.clearSort())
      const state = store.getState().devices

      expect(state.sortConfig).toBe(null)
    })

    it('should handle toggling sort direction', () => {
      const store = createTestStore({
        sortConfig: {
          column: 'name',
          direction: 'asc',
        },
      })

      store.dispatch(devicesActions.toggleSortDirection())
      const state = store.getState().devices

      expect(state.sortConfig?.direction).toBe('desc')
    })
  })

  describe('Pagination', () => {
    it('should handle setting page', () => {
      const store = createTestStore()
      const page = 2

      store.dispatch(devicesActions.setPage(page))
      const state = store.getState().devices

      expect(state.pagination.page).toBe(page)
    })

    it('should handle setting page size', () => {
      const store = createTestStore()
      const pageSize = 20

      store.dispatch(devicesActions.setPageSize(pageSize))
      const state = store.getState().devices

      expect(state.pagination.pageSize).toBe(pageSize)
      expect(state.pagination.page).toBe(1) // Should reset to first page
    })
  })

  describe('Device Status Updates', () => {
    it('should handle device heartbeat update', () => {
      const store = createTestStore({
        devices: mockDevices,
      })

      const heartbeatUpdate = {
        deviceId: '2',
        status: 'online' as const,
        lastSeen: '2024-01-15T12:00:00Z',
      }

      store.dispatch(devicesActions.updateDeviceHeartbeat(heartbeatUpdate))
      const state = store.getState().devices

      const updatedDevice = state.devices.find(d => d.id === '2')
      expect(updatedDevice?.status).toBe('online')
      expect(updatedDevice?.lastSeen).toBe('2024-01-15T12:00:00Z')
    })

    it('should handle bulk status update', () => {
      const store = createTestStore({
        devices: mockDevices,
      })

      const statusUpdates = [
        { deviceId: '1', status: 'maintenance' as const },
        { deviceId: '2', status: 'online' as const },
      ]

      store.dispatch(devicesActions.bulkUpdateDeviceStatus(statusUpdates))
      const state = store.getState().devices

      const device1 = state.devices.find(d => d.id === '1')
      const device2 = state.devices.find(d => d.id === '2')
      
      expect(device1?.status).toBe('maintenance')
      expect(device2?.status).toBe('online')
    })
  })

  describe('Error Handling', () => {
    it('should handle clearing errors', () => {
      const store = createTestStore({
        error: 'Some error message',
      })

      store.dispatch(devicesActions.clearError())
      const state = store.getState().devices

      expect(state.error).toBe(null)
    })

    it('should handle setting custom error', () => {
      const store = createTestStore()
      const errorMessage = 'Custom error message'

      store.dispatch(devicesActions.setError(errorMessage))
      const state = store.getState().devices

      expect(state.error).toBe(errorMessage)
    })
  })

  describe('Complex Workflows', () => {
    it('should handle complete CRUD flow', () => {
      const store = createTestStore()

      // 1. Fetch devices
      store.dispatch(devicesActions.fetchDevicesStart())
      store.dispatch(devicesActions.fetchDevicesSuccess({
        devices: mockDevices,
        pagination: mockPagination,
      }))

      let state = store.getState().devices
      expect(state.devices).toHaveLength(3)
      expect(state.isLoading).toBe(false)

      // 2. Create new device
      const newDevice: Device = {
        id: '4',
        name: 'New Device',
        deviceKey: 'device_new',
        status: 'offline',
        location: 'New Location',
        lastSeen: null,
        currentScheduleId: null,
        deviceGroupId: '1',
        resolution: '1920x1080',
        orientation: 'landscape',
        createdAt: '2024-01-15T12:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
      }

      store.dispatch(devicesActions.createDeviceStart())
      store.dispatch(devicesActions.createDeviceSuccess(newDevice))

      state = store.getState().devices
      expect(state.devices).toHaveLength(4)

      // 3. Update device
      const updatedDevice = { ...newDevice, name: 'Updated Device' }
      store.dispatch(devicesActions.updateDeviceStart())
      store.dispatch(devicesActions.updateDeviceSuccess(updatedDevice))

      state = store.getState().devices
      const deviceInState = state.devices.find(d => d.id === '4')
      expect(deviceInState?.name).toBe('Updated Device')

      // 4. Delete device
      store.dispatch(devicesActions.deleteDeviceStart())
      store.dispatch(devicesActions.deleteDeviceSuccess('4'))

      state = store.getState().devices
      expect(state.devices).toHaveLength(3)
      expect(state.devices.find(d => d.id === '4')).toBeUndefined()
    })

    it('should handle filtering and sorting together', () => {
      const store = createTestStore({
        devices: mockDevices,
      })

      // Apply filters
      store.dispatch(devicesActions.setSearchFilter('Hall'))
      store.dispatch(devicesActions.setStatusFilter('online'))

      // Apply sorting
      store.dispatch(devicesActions.setSortConfig({
        column: 'name',
        direction: 'desc',
      }))

      const state = store.getState().devices
      expect(state.filters.search).toBe('Hall')
      expect(state.filters.status).toBe('online')
      expect(state.sortConfig?.column).toBe('name')
      expect(state.sortConfig?.direction).toBe('desc')
    })

    it('should handle pagination with filters', () => {
      const store = createTestStore({
        devices: mockDevices,
      })

      // Set filters
      store.dispatch(devicesActions.setSearchFilter('Device'))
      
      // Change page size (should reset page to 1)
      store.dispatch(devicesActions.setPageSize(5))
      
      // Set specific page
      store.dispatch(devicesActions.setPage(2))

      const state = store.getState().devices
      expect(state.filters.search).toBe('Device')
      expect(state.pagination.pageSize).toBe(5)
      expect(state.pagination.page).toBe(2)
    })
  })

  describe('Real-time Updates', () => {
    it('should handle real-time device addition', () => {
      const store = createTestStore({
        devices: mockDevices.slice(0, 2), // Only first 2 devices
        pagination: { ...mockPagination, total: 2 },
      })

      const newDevice = mockDevices[2] // Third device

      store.dispatch(devicesActions.addDeviceRealtime(newDevice))
      const state = store.getState().devices

      expect(state.devices).toContain(newDevice)
      expect(state.devices).toHaveLength(3)
      expect(state.pagination.total).toBe(3)
    })

    it('should handle real-time device removal', () => {
      const store = createTestStore({
        devices: mockDevices,
        pagination: mockPagination,
      })

      store.dispatch(devicesActions.removeDeviceRealtime('2'))
      const state = store.getState().devices

      expect(state.devices.find(d => d.id === '2')).toBeUndefined()
      expect(state.devices).toHaveLength(2)
      expect(state.pagination.total).toBe(2)
    })

    it('should handle real-time device status changes', () => {
      const store = createTestStore({
        devices: mockDevices,
      })

      store.dispatch(devicesActions.updateDeviceHeartbeat({
        deviceId: '2',
        status: 'online',
        lastSeen: '2024-01-15T13:00:00Z',
      }))

      const state = store.getState().devices
      const updatedDevice = state.devices.find(d => d.id === '2')
      
      expect(updatedDevice?.status).toBe('online')
      expect(updatedDevice?.lastSeen).toBe('2024-01-15T13:00:00Z')
    })
  })
})