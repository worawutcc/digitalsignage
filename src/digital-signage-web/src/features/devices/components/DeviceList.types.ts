/**
 * Device List Component Types
 * 
 * Type definitions for DeviceList component.
 * 
 * @see DeviceList.tsx
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

import { Device } from '@/types/api'

export interface DeviceListProps {
  devices: Device[]
  loading?: boolean
  onDeviceSelect?: (device: Device) => void
  onDeviceEdit?: (device: Device) => void
  onDeviceDelete?: (device: Device) => void
  onDeviceRestart?: (device: Device) => void
  selectedDevices?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  className?: string
}
