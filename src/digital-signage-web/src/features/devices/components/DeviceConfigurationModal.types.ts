/**
 * Device Configuration Modal Types
 * 
 * Type definitions for DeviceConfigurationModal component.
 * 
 * @see DeviceConfigurationModal.tsx
 * @see copilot-instructions-ui.instructions.md - Form Handling Rules
 */

import { z } from 'zod'

/**
 * Device configuration form schema
 * Matches backend DeviceConfigurationUpdateDto
 */
export const deviceConfigurationSchema = z.object({
  displayOrientation: z.enum(['landscape', 'portrait']),
  resolution: z.string().optional(),
  refreshRate: z.number().min(30, 'Refresh rate must be at least 30 Hz').max(120, 'Refresh rate cannot exceed 120 Hz'),
  screenTimeout: z.number().min(0, 'Screen timeout cannot be negative').max(3600, 'Screen timeout cannot exceed 1 hour'),
  powerManagement: z.string(),
  networkConfig: z.string().optional(),
  appPermissions: z.string().optional(),
  remoteManagementEnabled: z.boolean(),
  proxySettings: z.string().optional(),
})

export type DeviceConfigurationFormData = z.infer<typeof deviceConfigurationSchema>

export interface DeviceConfigurationModalProps {
  isOpen: boolean
  onClose: () => void
  deviceId: number
  deviceName?: string
  configuration?: import('@/types/device-detail').DeviceConfiguration
  onSuccess?: () => void
}

export interface NetworkConfig {
  ssid: string
  securityType: 'WPA2' | 'WPA3' | 'Open'
  password?: string
  dhcp: boolean
  staticIp?: string
  gateway?: string
  dns?: string
}

export interface AppPermissions {
  allowedApps: string[]
  deniedApps: string[]
  installRestricted: boolean
}
