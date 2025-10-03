import { Device } from '@/types/api'

export interface DeviceCardProps {
  device: Device
  onEdit?: (device: Device) => void
  onDelete?: (device: Device) => void
  onClick?: (device: Device) => void
  onStatusChange?: (device: Device, status: string) => void
  selected?: boolean
  onSelect?: (device: Device, selected: boolean) => void
  showActions?: boolean
  compact?: boolean
  className?: string
}