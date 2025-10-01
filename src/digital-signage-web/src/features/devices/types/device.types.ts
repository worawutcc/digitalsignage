/**
 * Device-related type definitions for digital signage system
 */

export interface Device {
  id: number
  name: string
  location: string
  status: 'online' | 'offline' | 'error' | 'maintenance'
  resolution: string
  lastSeen: string
  version: string
  ipAddress: string
  macAddress?: string
  deviceGroupId: number
  deviceGroup?: string
  uptime?: number
  description?: string
  isSelected?: boolean
}

export interface DeviceFilters {
  status: string[]
  location: string[]
  deviceGroup: string[]
}

export interface DeviceStats {
  total: number
  online: number
  offline: number
  error: number
  maintenance: number
}

export interface DeviceHealth {
  deviceId: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  temperature: number
  lastHeartbeat: string
  networkStatus: 'connected' | 'disconnected' | 'unstable'
}

export interface DeviceGroup {
  id: number
  name: string
  description?: string
  deviceCount: number
}

export type DeviceStatus = Device['status']

export interface CreateDeviceRequest {
  name: string
  location: string
  ipAddress: string
  macAddress?: string
  resolution: string
  deviceGroupId: number
  description?: string
}

export interface UpdateDeviceRequest {
  id: number
  data: Partial<Device>
}