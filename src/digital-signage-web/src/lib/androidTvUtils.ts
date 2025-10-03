/**
 * Android TV Device Management Utilities
 * Helper functions and constants for device management UI components
 */

// Device Status Types
export type DeviceStatus = 'Pending' | 'Registered' | 'Online' | 'Offline' | 'Error' | 'Maintenance' | 'Inactive'

// Device Status Configuration
export const DEVICE_STATUS_CONFIG = {
  Pending: {
    label: 'Pending',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    icon: 'Clock',
    description: 'Awaiting approval',
  },
  Registered: {
    label: 'Registered',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    icon: 'CheckCircle',
    description: 'Approved and ready',
  },
  Online: {
    label: 'Online',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    icon: 'Wifi',
    description: 'Connected and active',
  },
  Offline: {
    label: 'Offline',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    icon: 'WifiOff',
    description: 'Disconnected',
  },
  Error: {
    label: 'Error',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    icon: 'AlertTriangle',
    description: 'System error',
  },
  Maintenance: {
    label: 'Maintenance',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200',
    icon: 'Settings',
    description: 'Under maintenance',
  },
  Inactive: {
    label: 'Inactive',
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    icon: 'Power',
    description: 'Deactivated',
  },
} as const

// Android TV Manufacturers
export const ANDROID_TV_MANUFACTURERS = [
  'Sony',
  'TCL',
  'Hisense',
  'Philips',
  'Sharp',
  'Xiaomi',
  'Nvidia',
  'Amazon',
  'Google',
  'Other',
] as const

// Display Orientations
export const DISPLAY_ORIENTATIONS = [
  { value: 'Portrait', label: 'Portrait (9:16)' },
  { value: 'Landscape', label: 'Landscape (16:9)' },
  { value: 'Auto', label: 'Auto Rotate' },
] as const

// Power Management Options
export const POWER_MANAGEMENT_OPTIONS = [
  { value: 'Standard', label: 'Standard', description: 'Normal power management' },
  { value: 'Optimized', label: 'Optimized', description: 'Balanced performance and battery' },
  { value: 'Maximum', label: 'Maximum Performance', description: 'Maximum performance, higher power usage' },
] as const

// Common Display Resolutions
export const DISPLAY_RESOLUTIONS = [
  '1920x1080',
  '1366x768',
  '1280x720',
  '3840x2160',
  '2560x1440',
  '1024x768',
  'Custom',
] as const

/**
 * Get device status configuration
 */
export function getDeviceStatusConfig(status: DeviceStatus) {
  return DEVICE_STATUS_CONFIG[status] || DEVICE_STATUS_CONFIG.Offline
}

/**
 * Get device status CSS classes
 */
export function getDeviceStatusClasses(status: DeviceStatus) {
  const config = getDeviceStatusConfig(status)
  return {
    badge: `${config.bgColor} ${config.textColor} ${config.borderColor}`,
    indicator: `bg-${config.color}-500`,
    text: config.textColor,
  }
}

/**
 * Format device last seen time
 */
export function formatLastSeen(lastHeartbeat?: string): string {
  if (!lastHeartbeat) return 'Never'
  
  const now = new Date()
  const lastSeen = new Date(lastHeartbeat)
  const diffMs = now.getTime() - lastSeen.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return lastSeen.toLocaleDateString()
}

/**
 * Generate device registration PIN
 */
export function generateRegistrationPin(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

/**
 * Validate MAC address format
 */
export function isValidMacAddress(mac: string): boolean {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
  return macRegex.test(mac)
}

/**
 * Format MAC address with consistent separators
 */
export function formatMacAddress(mac: string): string {
  return mac.replace(/[:-]/g, '').replace(/(.{2})/g, '$1:').slice(0, -1).toUpperCase()
}

/**
 * Validate Android API level
 */
export function isValidApiLevel(apiLevel: string): boolean {
  const level = parseInt(apiLevel)
  return level >= 21 && level <= 35 // Android 5.0 to current
}

/**
 * Get Android version name from API level
 */
export function getAndroidVersionName(apiLevel: string): string {
  const level = parseInt(apiLevel)
  const versionMap: Record<number, string> = {
    21: 'Android 5.0 (Lollipop)',
    22: 'Android 5.1 (Lollipop)',
    23: 'Android 6.0 (Marshmallow)',
    24: 'Android 7.0 (Nougat)',
    25: 'Android 7.1 (Nougat)',
    26: 'Android 8.0 (Oreo)',
    27: 'Android 8.1 (Oreo)',
    28: 'Android 9 (Pie)',
    29: 'Android 10',
    30: 'Android 11',
    31: 'Android 12',
    32: 'Android 12L',
    33: 'Android 13',
    34: 'Android 14',
    35: 'Android 15',
  }
  
  return versionMap[level] || `API Level ${level}`
}

/**
 * Calculate device uptime from last heartbeat
 */
export function calculateUptime(lastHeartbeat?: string, status?: DeviceStatus): string {
  if (!lastHeartbeat || status !== 'Online') return 'N/A'
  
  const now = new Date()
  const last = new Date(lastHeartbeat)
  const diffMs = now.getTime() - last.getTime()
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/**
 * Sort devices by status priority
 */
export function sortDevicesByStatus(devices: any[]): any[] {
  const statusPriority: Record<DeviceStatus, number> = {
    Error: 1,
    Pending: 2,
    Offline: 3,
    Maintenance: 4,
    Online: 5,
    Registered: 6,
    Inactive: 7,
  }
  
  return [...devices].sort((a, b) => {
    const priorityA = statusPriority[a.status as DeviceStatus] || 10
    const priorityB = statusPriority[b.status as DeviceStatus] || 10
    return priorityA - priorityB
  })
}

/**
 * Filter devices by search term
 */
export function filterDevices(devices: any[], searchTerm: string): any[] {
  if (!searchTerm) return devices
  
  const term = searchTerm.toLowerCase()
  return devices.filter(device => 
    device.name?.toLowerCase().includes(term) ||
    device.manufacturer?.toLowerCase().includes(term) ||
    device.model?.toLowerCase().includes(term) ||
    device.location?.toLowerCase().includes(term) ||
    device.ipAddress?.includes(term) ||
    device.macAddress?.toLowerCase().includes(term)
  )
}

/**
 * Group devices by manufacturer
 */
export function groupDevicesByManufacturer(devices: any[]): Record<string, any[]> {
  return devices.reduce((groups, device) => {
    const manufacturer = device.manufacturer || 'Unknown'
    if (!groups[manufacturer]) {
      groups[manufacturer] = []
    }
    groups[manufacturer].push(device)
    return groups
  }, {})
}

/**
 * Get device type icon based on manufacturer
 */
export function getDeviceTypeIcon(manufacturer?: string): string {
  const manufacturerIcons: Record<string, string> = {
    Sony: 'Tv',
    TCL: 'Monitor',
    Hisense: 'Monitor',
    Philips: 'Monitor',
    Sharp: 'Monitor',
    Xiaomi: 'Smartphone',
    Nvidia: 'Gamepad2',
    Amazon: 'Monitor',
    Google: 'Chrome',
  }
  
  return manufacturerIcons[manufacturer || ''] || 'Monitor'
}