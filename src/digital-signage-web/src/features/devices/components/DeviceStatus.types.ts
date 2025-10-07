/**
 * Device Status Component Types
 * 
 * Type definitions for DeviceStatus component.
 * 
 * @see DeviceStatus.tsx
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

import { LucideIcon } from 'lucide-react'

export type DeviceStatusType = 'Online' | 'Offline' | 'Error' | 'Maintenance'
export type DeviceStatusSize = 'sm' | 'md' | 'lg'

export interface DeviceStatusProps {
  status: DeviceStatusType
  showText?: boolean
  showIcon?: boolean
  size?: DeviceStatusSize
  className?: string
}

export interface StatusConfig {
  label: string
  color: string
  textColor: string
  bgColor: string
  icon: LucideIcon
}

export interface SizeConfig {
  dot: string
  text: string
  icon: string
  padding: string
}
