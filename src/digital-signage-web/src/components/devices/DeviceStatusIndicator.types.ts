export interface DeviceStatusIndicatorProps {
  status: 'Pending' | 'Registered' | 'Online' | 'Offline' | 'Error' | 'Maintenance' | 'Inactive'
  lastHeartbeat?: string
  withLabel?: boolean
  withTimestamp?: boolean
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}