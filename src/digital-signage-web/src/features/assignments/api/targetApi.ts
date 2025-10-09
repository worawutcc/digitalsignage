/**
 * @fileoverview Target API Service for Assignment Wizard
 * @description API client for fetching devices and device groups for target selection
 */

import { apiClient } from '@/lib/api';

export interface TargetDevice {
  id: number;
  name: string;
  location?: string;
  status: 'online' | 'offline' | 'unknown';
  type: 'device';
  lastHeartbeat?: string;
}

export interface TargetDeviceGroup {
  id: number;
  name: string;
  description?: string;
  deviceCount: number;
  type: 'group';
}

/**
 * Get all approved devices for assignment wizard
 */
export async function getDevices(): Promise<TargetDevice[]> {
  try {
    const response = await apiClient.get('/api/device/approved');
    return response.data.map((device: any) => ({
      id: device.id,
      name: device.name,
      location: device.location,
      status: device.isActive ? 'online' : 'offline',
      type: 'device' as const,
      lastHeartbeat: device.lastHeartbeat,
    }));
  } catch (error) {
    console.error('Failed to fetch devices:', error);
    return [];
  }
}

/**
 * Get all device groups for assignment wizard
 */
export async function getDeviceGroups(): Promise<TargetDeviceGroup[]> {
  try {
    const response = await apiClient.get('/api/admin/device-groups');
    return response.data.map((group: any) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      deviceCount: group.deviceCount || 0,
      type: 'group' as const,
    }));
  } catch (error) {
    console.error('Failed to fetch device groups:', error);
    return [];
  }
}

/**
 * Get targets by type
 */
export async function getTargetsByType(
  type: 'device' | 'group'
): Promise<Array<TargetDevice | TargetDeviceGroup>> {
  return type === 'device' ? getDevices() : getDeviceGroups();
}
