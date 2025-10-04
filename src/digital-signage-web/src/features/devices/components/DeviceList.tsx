'use client'

import { useState } from 'react'
import { Monitor, MoreVertical, Wifi, MapPin, Clock, Settings } from 'lucide-react'
import { DataTable } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/Button'
import { DeviceStatus } from './DeviceStatus'
import { cn } from '@/lib/utils'
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

/**
 * Device list component with table view, filtering, and actions
 * 
 * @param devices - Array of device data
 * @param loading - Loading state
 * @param onDeviceSelect - Device selection handler
 * @param onDeviceEdit - Device edit handler
 * @param onDeviceDelete - Device delete handler
 * @param onDeviceRestart - Device restart handler
 * @param selectedDevices - Array of selected device IDs
 * @param onSelectionChange - Selection change handler
 * @param className - Additional CSS classes
 */
export function DeviceList({
  devices,
  loading = false,
  onDeviceSelect,
  onDeviceEdit,
  onDeviceDelete,
  onDeviceRestart,
  selectedDevices = [],
  onSelectionChange,
  className
}: DeviceListProps) {
  const [sortBy, setSortBy] = useState<string | null>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  const sortedDevices = [...devices].sort((a, b) => {
    if (!sortBy) return 0
    
    const aVal = a[sortBy as keyof Device] || ''
    const bVal = b[sortBy as keyof Device] || ''
    
    if (sortOrder === 'asc') {
      return aVal.toString().localeCompare(bVal.toString())
    } else {
      return bVal.toString().localeCompare(aVal.toString())
    }
  })

  const totalPages = Math.ceil(sortedDevices.length / pageSize)
  const paginatedDevices = sortedDevices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const columns = [
    {
      key: 'name',
      header: 'Device Name',
      sortable: true,
      render: (value: string, device: Device) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Monitor className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{device.ipAddress}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string, device: Device, index: number) => (
        <DeviceStatus status={device.status} showText />
      ),
    },
    {
      key: 'resolution',
      header: 'Resolution',
      sortable: true,
      render: (value: string, device: Device, index: number) => (
        <span className="text-sm text-gray-600">{value}</span>
      ),
    },
    {
      key: 'lastSeen',
      header: 'Last Seen',
      sortable: true,
      render: (value: string, device: Device, index: number) => (
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {new Date(value).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: 'uptime',
      header: 'Uptime',
      render: (value: number, device: Device, index: number) => (
        <span className="text-sm text-gray-600">
          {value ? `${Math.floor(value / 24)}d ${value % 24}h` : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, device: Device, index: number) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeviceEdit?.(device)}
            className="p-1"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeviceRestart?.(device)}
            className="p-1"
            disabled={device.status === 'Offline'}
          >
            <Wifi className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const getRowClassName = (device: Device) => {
    return cn(
      selectedDevices.includes(device.id.toString()) && 'bg-blue-50 border-blue-200',
      device.status === 'Error' && 'bg-red-50',
      device.status === 'Maintenance' && 'bg-yellow-50'
    )
  }

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <DataTable
          data={[]}
          columns={columns}
          loading={true}
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Devices ({devices.length})
          </h3>
          <p className="text-sm text-gray-600">
            Manage and monitor your digital signage devices
          </p>
        </div>
        
        {selectedDevices.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedDevices.length} selected
            </span>
            <Button size="sm" variant="outline">
              Bulk Actions
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-semibold text-green-600">
                {devices.filter(d => d.status === 'Online').length}
              </p>
            </div>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Offline</p>
              <p className="text-2xl font-semibold text-red-600">
                {devices.filter(d => d.status === 'Offline').length}
              </p>
            </div>
            <div className="h-2 w-2 bg-red-500 rounded-full" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {devices.filter(d => d.status === 'Error').length}
              </p>
            </div>
            <div className="h-2 w-2 bg-yellow-500 rounded-full" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-semibold text-blue-600">
                {devices.filter(d => d.status === 'Maintenance').length}
              </p>
            </div>
            <div className="h-2 w-2 bg-blue-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable<Device>
        data={paginatedDevices}
        columns={columns}
        loading={loading}
        sorting={{ sortBy, sortOrder, onSort: handleSort }}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          onPageChange: setCurrentPage,
        }}
        rowClassName={(device, index) => getRowClassName(device)}
        {...(onDeviceSelect && { onRowClick: (device, index) => onDeviceSelect(device) })}
        emptyMessage="No devices found. Add your first device to get started."
      />
    </div>
  )
}

export default DeviceList