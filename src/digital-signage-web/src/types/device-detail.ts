// Device Detail Types - matching backend DTOs

export interface DeviceDetail {
  // From DeviceResponseDto
  id: number
  name: string
  deviceKey: string
  macAddress: string
  ipAddress: string | null
  location: string | null
  status: 'Online' | 'Offline' | 'Maintenance' | 'Error'
  manufacturer: string | null
  model: string | null
  displayResolution: string | null
  lastHeartbeat: string | null
  createdAt: string
  isActive: boolean
  
  // From DeviceDetailDto
  androidVersion: string | null
  apiLevel: number | null
  serialNumber: string | null
  deactivatedAt: string | null
  deactivatedBy: number | null
  managedByUserId: number | null
  deviceGroupId: number | null
  assignedUserId: number | null
  configuration: DeviceConfiguration | null
  recentStatusLogs: DeviceStatusLog[]
  registrationHistory: RegistrationRecord[]
}

export interface DeviceConfiguration {
  id: number
  deviceId: number
  displayOrientation: 'landscape' | 'portrait'
  resolution?: string
  refreshRate: number
  screenTimeout: number
  powerManagement: string
  networkConfig?: string
  appPermissions?: string
  remoteManagementEnabled: boolean
  proxySettings?: string
  updatedAt: string
  updatedBy: number
  updatedByUserName: string
}

export interface DeviceStatusLog {
  id: number
  deviceId: number
  status: string
  timestamp: string
  details: string | null
}

export interface RegistrationRecord {
  id: number
  deviceId: number
  registeredAt: string
  registeredBy: number
  registeredByUserName: string
  notes: string | null
}

export interface DeviceConfigurationUpdate {
  displayOrientation?: 'Landscape' | 'Portrait' | 'ReversePortrait' | 'ReverseLandscape'
  resolution?: string
  refreshRate?: number
  screenTimeout?: number
  powerManagement?: 'AlwaysOn' | 'Scheduled' | 'Auto'
  networkConfig?: string
  appPermissions?: string
  remoteManagementEnabled?: boolean
  proxySettings?: string
}
