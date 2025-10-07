/**
 * Device Filters Component Types
 * 
 * Type definitions for DeviceFilters component.
 * 
 * @see DeviceFilters.tsx
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

export interface DeviceFilters {
  search: string
  status: string[]
  location: string[]
  deviceGroup: string[]
  resolution: string[]
}

export interface DeviceFiltersProps {
  filters: DeviceFilters
  onFiltersChange: (filters: DeviceFilters) => void
  availableLocations?: string[]
  availableDeviceGroups?: string[]
  availableResolutions?: string[]
  className?: string
}

export interface StatusOption {
  value: string
  label: string
  color: string
}
