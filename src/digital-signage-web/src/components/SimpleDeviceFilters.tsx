'use client'

import React from 'react'

export interface SimpleDeviceFilters {
  search: string
  status: string[]
  location: string[]
  deviceGroup: string[]
  resolution: string[]
}

export interface SimpleDeviceFiltersProps {
  filters: SimpleDeviceFilters
  onFiltersChange: (filters: SimpleDeviceFilters) => void
}

export function SimpleDeviceFilters({ filters, onFiltersChange }: SimpleDeviceFiltersProps): React.ReactElement {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-2">Filters</h3>
      <p className="text-xs text-gray-500">Current filters: {JSON.stringify(filters)}</p>
    </div>
  )
}

export default SimpleDeviceFilters