'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { DeviceListProps } from './DeviceList.types'
import { Device } from '@/types/api'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Device list component with pagination, filtering, and bulk operations
 * Displays devices in a responsive table format with selection capabilities
 */
export function DeviceList({
  devices = [],
  loading = false,
  error = null,
  onDeviceSelect,
  onDeviceEdit,
  onDeviceDelete,
  onDeviceRestart,
  selectedDevices = [],
  onSelectionChange,
  onBulkAction,
  className,
  // Pagination
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  // Filters
  filters = {},
  onFiltersChange
}: DeviceListProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const [statusFilter, setStatusFilter] = useState(filters.status || '')
  const [showFilters, setShowFilters] = useState(false)

  // Handle device selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allDeviceIds = devices.map(device => device.id.toString())
      onSelectionChange?.(allDeviceIds)
    } else {
      onSelectionChange?.([])
    }
  }

  const handleSelectDevice = (deviceId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedDevices, deviceId])
    } else {
      onSelectionChange?.(selectedDevices.filter(id => id !== deviceId))
    }
  }

  // Handle search and filters
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onFiltersChange?.({ ...filters, search: value })
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    onFiltersChange?.({ ...filters, status: value })
  }

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    
    switch (status.toLowerCase()) {
      case 'online':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'offline':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'registered':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'maintenance':
        return `${baseClasses} bg-gray-100 text-gray-800`
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-600`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const isAllSelected = devices.length > 0 && selectedDevices.length === devices.length
  const isIndeterminate = selectedDevices.length > 0 && selectedDevices.length < devices.length

  if (error) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <p className="text-red-600">Error loading devices: {error}</p>
      </div>
    )
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full sm:max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          
          {selectedDevices.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction?.('restart', selectedDevices)}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Bulk Actions ({selectedDevices.length})
            </Button>
          )}
        </div>
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="pending">Pending</option>
                <option value="registered">Registered</option>
                <option value="error">Error</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Device Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading devices...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No devices found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={isIndeterminate}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Heartbeat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resolution
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {devices.map((device) => (
                    <tr
                      key={device.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onDeviceSelect?.(device)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedDevices.includes(device.id.toString())}
                          onChange={(checked) => handleSelectDevice(device.id.toString(), checked)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {device.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {device.deviceKey}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(device.status)}>
                          {device.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {device.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {device.lastHeartbeat ? 
                          new Date(device.lastHeartbeat).toLocaleString() : 
                          'Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {device.resolution}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeviceEdit?.(device)
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeviceRestart?.(device)
                            }}
                            className="text-green-600 hover:text-green-800"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeviceDelete?.(device)
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {((currentPage - 1) * pageSize) + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, totalItems)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{totalItems}</span>{' '}
                      results
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={pageSize}
                      onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange?.(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange?.(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}