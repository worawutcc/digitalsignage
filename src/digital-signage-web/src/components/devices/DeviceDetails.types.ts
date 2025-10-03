import { Device, DeviceConfiguration, DeviceStatusLog } from '@/types/api'

export interface DeviceDetailsProps {
  device: Device
  configuration?: DeviceConfiguration
  statusLogs?: DeviceStatusLog[]
  loading?: boolean
  error?: string | null
  onEdit?: (device: Device) => void
  onDelete?: (device: Device) => void
  onRestart?: (device: Device) => void
  onConfigurationUpdate?: (config: Partial<DeviceConfiguration>) => void
  onStatusChange?: (device: Device, status: string) => void
  className?: string
}

export type DeviceDetailsTab = 'overview' | 'configuration' | 'status' | 'logs' | 'network'