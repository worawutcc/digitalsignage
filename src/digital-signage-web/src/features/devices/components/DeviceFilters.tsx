'use client'

import { useState } from 'react'
import { Search, Filter, X, MapPin, Monitor, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import type { DeviceFilters, DeviceFiltersProps, StatusOption } from './DeviceFilters.types'

const statusOptions = [
  { value: 'online', label: 'Online', color: 'bg-green-500' },
  { value: 'offline', label: 'Offline', color: 'bg-red-500' },
  { value: 'error', label: 'Error', color: 'bg-yellow-500' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-blue-500' },
]

/**
 * Device filters component with search, status, location, and group filtering
 * 
 * @param filters - Current filter values
 * @param onFiltersChange - Filter change handler
 * @param availableLocations - Available location options
 * @param availableDeviceGroups - Available device group options
 * @param availableResolutions - Available resolution options
 * @param className - Additional CSS classes
 */
export function DeviceFilters({
  filters,
  onFiltersChange,
  availableLocations = [],
  availableDeviceGroups = [],
  availableResolutions = [],
  className
}: DeviceFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search })
  }

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    onFiltersChange({ ...filters, status: newStatus })
  }

  const handleLocationToggle = (location: string) => {
    const newLocations = filters.location.includes(location)
      ? filters.location.filter(l => l !== location)
      : [...filters.location, location]
    onFiltersChange({ ...filters, location: newLocations })
  }

  const handleDeviceGroupToggle = (group: string) => {
    const newGroups = filters.deviceGroup.includes(group)
      ? filters.deviceGroup.filter(g => g !== group)
      : [...filters.deviceGroup, group]
    onFiltersChange({ ...filters, deviceGroup: newGroups })
  }

  const handleResolutionToggle = (resolution: string) => {
    const newResolutions = filters.resolution.includes(resolution)
      ? filters.resolution.filter(r => r !== resolution)
      : [...filters.resolution, resolution]
    onFiltersChange({ ...filters, resolution: newResolutions })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: [],
      location: [],
      deviceGroup: [],
      resolution: [],
    })
  }

  const hasActiveFilters = 
    filters.search ||
    filters.status.length > 0 ||
    filters.location.length > 0 ||
    filters.deviceGroup.length > 0 ||
    filters.resolution.length > 0

  const activeFilterCount = 
    filters.status.length +
    filters.location.length +
    filters.deviceGroup.length +
    filters.resolution.length

  return (
    <div className={cn('space-y-4 bg-white p-4 rounded-lg border', className)}>
      {/* Search and Quick Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search devices by name, location, or IP..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </div>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Quick Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusToggle(option.value)}
            className={cn(
              'inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors',
              filters.status.includes(option.value)
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            )}
          >
            <div className={cn('h-2 w-2 rounded-full', option.color)} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Location Filter */}
            {availableLocations.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Location
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {availableLocations.map((location) => (
                    <label key={location} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.location.includes(location)}
                        onChange={() => handleLocationToggle(location)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{location}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Device Group Filter */}
            {availableDeviceGroups.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Monitor className="inline h-4 w-4 mr-1" />
                  Device Group
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {availableDeviceGroups.map((group) => (
                    <label key={group} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.deviceGroup.includes(group)}
                        onChange={() => handleDeviceGroupToggle(group)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{group}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Filter */}
            {availableResolutions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Wifi className="inline h-4 w-4 mr-1" />
                  Resolution
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {availableResolutions.map((resolution) => (
                    <label key={resolution} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.resolution.includes(resolution)}
                        onChange={() => handleResolutionToggle(resolution)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{resolution}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="border-t pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {filters.status.map((status) => (
              <span
                key={`status-${status}`}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                <span>Status: {status}</span>
                <button
                  onClick={() => handleStatusToggle(status)}
                  className="hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {filters.location.map((location) => (
              <span
                key={`location-${location}`}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
              >
                <span>Location: {location}</span>
                <button
                  onClick={() => handleLocationToggle(location)}
                  className="hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {filters.deviceGroup.map((group) => (
              <span
                key={`group-${group}`}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
              >
                <span>Group: {group}</span>
                <button
                  onClick={() => handleDeviceGroupToggle(group)}
                  className="hover:text-purple-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {filters.resolution.map((resolution) => (
              <span
                key={`resolution-${resolution}`}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded"
              >
                <span>Resolution: {resolution}</span>
                <button
                  onClick={() => handleResolutionToggle(resolution)}
                  className="hover:text-orange-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DeviceFilters