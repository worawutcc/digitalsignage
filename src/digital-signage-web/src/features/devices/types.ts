/**
 * Types for device-related components
 */
export interface Device {
  id: number
  name: string
  location: string
  status: 'online' | 'offline' | 'maintenance'
  lastSeen: string
  resolution: string
  deviceGroupId?: number
}

export interface DeviceCardProps {
  device: Device
  onEdit?: (device: Device) => void
  onDelete?: (deviceId: number) => void
  onClick?: (device: Device) => void
}

export interface DeviceListProps {
  devices: Device[]
  loading?: boolean
  onDeviceEdit?: (device: Device) => void
  onDeviceDelete?: (deviceId: number) => void
  onDeviceClick?: (device: Device) => void
}