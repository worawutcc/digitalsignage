import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Device interface matching the test requirements
export interface Device {
  id: string
  name: string
  deviceKey: string
  status: 'online' | 'offline' | 'maintenance'
  location: string
  lastSeen: string | null
  currentScheduleId: string | null
  deviceGroupId: string
  resolution: string
  orientation: 'landscape' | 'portrait'
  createdAt: string
  updatedAt: string
}

// Pagination interface
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// Filters interface
export interface DeviceFilters {
  search: string
  status: string
  deviceGroupId: string
}

// Sort configuration interface
export interface SortConfig {
  key: keyof Device
  direction: 'asc' | 'desc'
}

// Main state interface
export interface DevicesState {
  devices: Device[]
  selectedDevices: string[]
  pagination: Pagination
  filters: DeviceFilters
  sortConfig: SortConfig | null
  isLoading: boolean
  error: string | null
}

const initialState: DevicesState = {
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
}

/**
 * Devices slice with comprehensive CRUD operations, filtering, and state management
 */
const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    // Fetch devices actions
    fetchDevicesStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchDevicesSuccess: (state, action: PayloadAction<{ devices: Device[]; pagination: Pagination }>) => {
      state.isLoading = false
      state.devices = action.payload.devices
      state.pagination = action.payload.pagination
      state.error = null
    },
    fetchDevicesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Create device actions
    createDeviceStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    createDeviceSuccess: (state, action: PayloadAction<Device>) => {
      state.isLoading = false
      state.devices.push(action.payload)
      state.pagination.total += 1
      state.error = null
    },
    createDeviceFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Update device actions
    updateDeviceStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updateDeviceSuccess: (state, action: PayloadAction<Device>) => {
      state.isLoading = false
      const index = state.devices.findIndex(device => device.id === action.payload.id)
      if (index !== -1) {
        state.devices[index] = action.payload
      }
      state.error = null
    },
    updateDeviceFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Delete device actions
    deleteDeviceStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    deleteDeviceSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.devices = state.devices.filter(device => device.id !== action.payload)
      state.selectedDevices = state.selectedDevices.filter(id => id !== action.payload)
      state.pagination.total -= 1
      state.error = null
    },
    deleteDeviceFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Device selection actions
    selectDevice: (state, action: PayloadAction<string>) => {
      if (!state.selectedDevices.includes(action.payload)) {
        state.selectedDevices.push(action.payload)
      }
    },
    deselectDevice: (state, action: PayloadAction<string>) => {
      state.selectedDevices = state.selectedDevices.filter(id => id !== action.payload)
    },
    selectAllDevices: (state) => {
      state.selectedDevices = state.devices.map(device => device.id)
    },
    clearSelection: (state) => {
      state.selectedDevices = []
    },
    toggleDeviceSelection: (state, action: PayloadAction<string>) => {
      const deviceId = action.payload
      if (state.selectedDevices.includes(deviceId)) {
        state.selectedDevices = state.selectedDevices.filter(id => id !== deviceId)
      } else {
        state.selectedDevices.push(deviceId)
      }
    },

    // Filter actions
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload
      state.pagination.page = 1 // Reset to first page when filtering
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload
      state.pagination.page = 1 // Reset to first page when filtering
    },
    setDeviceGroupFilter: (state, action: PayloadAction<string>) => {
      state.filters.deviceGroupId = action.payload
      state.pagination.page = 1 // Reset to first page when filtering
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: '',
        deviceGroupId: '',
      }
      state.pagination.page = 1
    },

    // Sort configuration
    setSortConfig: (state, action: PayloadAction<SortConfig | null>) => {
      state.sortConfig = action.payload
    },
    clearSort: (state) => {
      state.sortConfig = null
    },
    toggleSortDirection: (state) => {
      if (state.sortConfig) {
        state.sortConfig.direction = state.sortConfig.direction === 'asc' ? 'desc' : 'asc'
      }
    },

    // Pagination actions
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload
      state.pagination.page = 1 // Reset to first page when changing page size
    },

    // Device status and real-time updates
    updateDeviceHeartbeat: (state, action: PayloadAction<{ deviceId: string; status: string; lastSeen: string }>) => {
      const device = state.devices.find(d => d.id === action.payload.deviceId)
      if (device) {
        device.status = action.payload.status as 'online' | 'offline' | 'maintenance'
        device.lastSeen = action.payload.lastSeen
      }
    },
    bulkUpdateDeviceStatus: (state, action: PayloadAction<Array<{ deviceId: string; status: string }>>) => {
      action.payload.forEach(update => {
        const device = state.devices.find(d => d.id === update.deviceId)
        if (device) {
          device.status = update.status as 'online' | 'offline' | 'maintenance'
        }
      })
    },

    // Real-time device management
    addDeviceRealtime: (state, action: PayloadAction<Device>) => {
      // Add device if it doesn't already exist
      if (!state.devices.find(d => d.id === action.payload.id)) {
        state.devices.push(action.payload)
        state.pagination.total += 1
      }
    },
    removeDeviceRealtime: (state, action: PayloadAction<string>) => {
      state.devices = state.devices.filter(device => device.id !== action.payload)
      state.selectedDevices = state.selectedDevices.filter(id => id !== action.payload)
      state.pagination.total -= 1
    },

    // Error handling
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

// Export all actions
export const devicesActions = devicesSlice.actions

// Export individual actions for convenience
export const {
  // Fetch actions
  fetchDevicesStart,
  fetchDevicesSuccess,
  fetchDevicesFailure,
  
  // Create actions
  createDeviceStart,
  createDeviceSuccess,
  createDeviceFailure,
  
  // Update actions
  updateDeviceStart,
  updateDeviceSuccess,
  updateDeviceFailure,
  
  // Delete actions
  deleteDeviceStart,
  deleteDeviceSuccess,
  deleteDeviceFailure,
  
  // Selection actions
  selectDevice,
  deselectDevice,
  selectAllDevices,
  clearSelection,
  toggleDeviceSelection,
  
  // Filter actions
  setSearchFilter,
  setStatusFilter,
  setDeviceGroupFilter,
  clearFilters,
  
  // Sort actions
  setSortConfig,
  clearSort,
  toggleSortDirection,
  
  // Pagination actions
  setPage,
  setPageSize,
  
  // Device status and real-time updates
  updateDeviceHeartbeat,
  bulkUpdateDeviceStatus,
  
  // Real-time device management
  addDeviceRealtime,
  removeDeviceRealtime,
  
  // Error handling
  setError,
  clearError,
} = devicesSlice.actions

// Export the slice itself
export { devicesSlice }

export default devicesSlice.reducer