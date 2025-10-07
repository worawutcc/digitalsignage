/**
 * Status types for various entities in the system
 */
export type DeviceStatus = 'online' | 'offline' | 'warning' | 'error' | 'maintenance'
export type ScheduleStatus = 'active' | 'inactive' | 'scheduled' | 'expired' | 'draft'
export type MediaStatus = 'ready' | 'processing' | 'failed' | 'pending'
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'expired'

/**
 * Props for the StatusBadge component
 */
export interface StatusBadgeProps {
  /**
   * Status value to display
   */
  status: DeviceStatus | ScheduleStatus | MediaStatus | RegistrationStatus | string
  
  /**
   * Size variant of the badge
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  
  /**
   * Whether to show a pulse animation for active/online states
   * @default false
   */
  animated?: boolean
  
  /**
   * Optional custom label (overrides default status text)
   */
  label?: string
  
  /**
   * Additional CSS classes
   */
  className?: string
  
  /**
   * Optional icon to display
   */
  icon?: React.ReactNode
}
