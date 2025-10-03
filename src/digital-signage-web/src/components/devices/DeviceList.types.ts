import { Device } from '@/types/api'

export interface DeviceListProps {
  devices?: Device[]
  loading?: boolean
  error?: string | null
  onDeviceSelect?: (device: Device) => void
  onDeviceEdit?: (device: Device) => void
  onDeviceDelete?: (device: Device) => void
  onDeviceRestart?: (device: Device) => void
  selectedDevices?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  onBulkAction?: (action: string, deviceIds: string[]) => void
  className?: string
  // Pagination props
  currentPage?: number
  totalPages?: number
  pageSize?: number
  totalItems?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  // Filter props
  filters?: {
    search?: string
    status?: string
    deviceGroupId?: number
    isActive?: boolean
  }
  onFiltersChange?: (filters: any) => void
}