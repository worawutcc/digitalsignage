/**
 * Types for device-related components - re-export from API types
 */
import { Device } from '@/types/api'
export type { Device }

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