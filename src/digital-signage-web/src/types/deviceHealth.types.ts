/**
 * Device Health Types
 * 
 * Type definitions for device health monitoring, metrics, heartbeat data,
 * and alert thresholds used in the Device Live Status Dashboard.
 * 
 * @see copilot-instructions-ui.instructions.md - TypeScript patterns
 * @see specs/029-ui-device-groups/ - Device monitoring requirements
 */

/**
 * Device health status indicators
 */
export type DeviceHealthStatus = 'healthy' | 'warning' | 'critical' | 'offline' | 'unknown'

/**
 * Device health metrics categories
 */
export type HealthMetricType = 'cpu' | 'memory' | 'storage' | 'temperature' | 'network'

/**
 * Alert severity levels
 */
export type AlertSeverity = 'info' | 'warning' | 'critical'

/**
 * Core device health metrics
 */
export interface HealthMetrics {
  /** CPU usage percentage (0-100) */
  cpuUsage: number
  /** Memory usage percentage (0-100) */
  memoryUsage: number
  /** Storage usage percentage (0-100) */
  storageUsage: number
  /** Temperature in Celsius */
  temperature: number
  /** Network latency in milliseconds */
  networkLatency: number
  /** Timestamp when metrics were captured */
  timestamp: string
}

/**
 * Heartbeat data from device
 */
export interface HeartbeatData {
  /** Device ID */
  deviceId: number
  /** Timestamp of heartbeat */
  timestamp: string
  /** Device status at heartbeat time */
  status: 'Online' | 'Offline' | 'Error' | 'Maintenance'
  /** Health metrics included in heartbeat */
  metrics?: HealthMetrics
  /** Device uptime in seconds */
  uptime?: number
  /** Client application version */
  appVersion?: string
}

/**
 * Health alert threshold configuration
 */
export interface HealthThreshold {
  /** Metric type this threshold applies to */
  metric: HealthMetricType
  /** Warning threshold value */
  warningLevel: number
  /** Critical threshold value */
  criticalLevel: number
  /** Whether threshold is enabled */
  enabled: boolean
}

/**
 * Device health alert
 */
export interface HealthAlert {
  /** Alert ID */
  id: string
  /** Device ID that triggered alert */
  deviceId: number
  /** Device name */
  deviceName: string
  /** Alert severity */
  severity: AlertSeverity
  /** Metric that triggered alert */
  metric: HealthMetricType
  /** Current metric value */
  value: number
  /** Threshold that was exceeded */
  threshold: number
  /** Alert message */
  message: string
  /** When alert was triggered */
  timestamp: string
  /** Whether alert has been acknowledged */
  acknowledged: boolean
}

/**
 * Complete device health information
 */
export interface DeviceHealth {
  /** Device ID */
  deviceId: number
  /** Device name */
  deviceName: string
  /** Current device status */
  status: 'Online' | 'Offline' | 'Error' | 'Maintenance'
  /** Overall health status */
  healthStatus: DeviceHealthStatus
  /** Current health metrics */
  currentMetrics: HealthMetrics
  /** Last heartbeat data */
  lastHeartbeat: HeartbeatData
  /** Time since last heartbeat (in seconds) */
  timeSinceLastHeartbeat: number
  /** Active health alerts */
  alerts: HealthAlert[]
  /** Historical metrics (last 24 hours) */
  historicalMetrics?: HealthMetrics[]
  /** Device location */
  location?: string
  /** Device group name */
  deviceGroup?: string
}

/**
 * Health statistics summary
 */
export interface HealthStatistics {
  /** Total number of devices */
  totalDevices: number
  /** Number of healthy devices */
  healthyDevices: number
  /** Number of devices with warnings */
  warningDevices: number
  /** Number of critical devices */
  criticalDevices: number
  /** Number of offline devices */
  offlineDevices: number
  /** Average CPU usage across all devices */
  avgCpuUsage: number
  /** Average memory usage across all devices */
  avgMemoryUsage: number
  /** Average temperature across all devices */
  avgTemperature: number
  /** Number of active alerts */
  activeAlerts: number
}

/**
 * Device health filters for queries
 */
export interface DeviceHealthFilters {
  /** Filter by health status */
  healthStatus?: DeviceHealthStatus[]
  /** Filter by device status */
  deviceStatus?: Array<'Online' | 'Offline' | 'Error' | 'Maintenance'>
  /** Filter by location */
  locations?: string[]
  /** Filter by device group */
  deviceGroups?: string[]
  /** Show only devices with alerts */
  hasAlerts?: boolean
  /** Filter by alert severity */
  alertSeverity?: AlertSeverity[]
  /** Search by device name */
  searchQuery?: string
  /** Sort field */
  sortBy?: 'name' | 'status' | 'healthStatus' | 'cpuUsage' | 'memoryUsage' | 'temperature' | 'lastHeartbeat'
  /** Sort order */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Real-time health update event
 */
export interface HealthUpdateEvent {
  /** Event type */
  type: 'heartbeat' | 'metrics' | 'status_change' | 'alert'
  /** Device ID */
  deviceId: number
  /** Event timestamp */
  timestamp: string
  /** Event data */
  data: HeartbeatData | HealthMetrics | HealthAlert
}

/**
 * Default health thresholds
 */
export const DEFAULT_HEALTH_THRESHOLDS: HealthThreshold[] = [
  {
    metric: 'cpu',
    warningLevel: 75,
    criticalLevel: 90,
    enabled: true,
  },
  {
    metric: 'memory',
    warningLevel: 80,
    criticalLevel: 95,
    enabled: true,
  },
  {
    metric: 'storage',
    warningLevel: 85,
    criticalLevel: 95,
    enabled: true,
  },
  {
    metric: 'temperature',
    warningLevel: 70,
    criticalLevel: 85,
    enabled: true,
  },
  {
    metric: 'network',
    warningLevel: 200,
    criticalLevel: 500,
    enabled: true,
  },
]
