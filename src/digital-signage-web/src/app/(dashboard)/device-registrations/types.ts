/**
 * Device Registration Types
 * Type definitions for device registration management pages
 */

/**
 * Approved Device
 * Represents an Android TV device that has been approved and is actively monitored
 */
export interface ApprovedDevice {
  id: number
  deviceId: string
  deviceName: string
  location: string
  status: 'Online' | 'Offline'
  lastHeartbeat: string
  approvedAt: string
  approvedBy: string
  resolution: string
  deviceModel: string
}

/**
 * Rejected Device
 * Represents a device registration request that was rejected
 */
export interface RejectedDevice {
  id: number
  deviceId: string
  deviceName: string
  location: string
  rejectedAt: string
  rejectedBy: string
  rejectionReason: string
  requestedAt: string
  deviceModel: string
  resolution: string
}

/**
 * Device
 * Represents a registered device in the system (all devices view)
 */
export interface Device {
  id: number
  deviceId: string
  deviceName: string
  location: string
  status: 'Online' | 'Offline'
  lastHeartbeat: string
  deviceModel: string
  resolution: string
  assignedGroup?: string
}

/**
 * Device Status Filter
 * Filter options for device listing
 */
export type DeviceStatusFilter = 'all' | 'online' | 'offline'

/**
 * View Mode
 * Display mode for device grid
 */
export type ViewMode = 'grid' | 'list'
