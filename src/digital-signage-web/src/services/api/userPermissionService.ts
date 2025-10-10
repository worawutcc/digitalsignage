/**
 * User Permission API service
 * Connects to backend /api/user/permissions endpoints (UserPermissionController)
 * Handles user-facing permission checking and accessible resource operations
 */

import { apiClient } from '@/lib/api';

// ================== Types & Interfaces ==================

/**
 * User permission level enum
 */
export enum UserPermissionLevel {
  ViewOnly = 'ViewOnly',
  Contributor = 'Contributor',
  Manager = 'Manager',
  Admin = 'Admin'
}

/**
 * Device group access DTO
 */
export interface DeviceGroupAccessDto {
  deviceGroupId: number;
  deviceGroupName: string;
  permissionLevel: UserPermissionLevel;
  inheritedFromParent: boolean;
  canViewDevices: boolean;
  canManageContent: boolean;
  canManageDevices: boolean;
  canManageUsers: boolean;
}

/**
 * User permission DTO
 */
export interface UserPermissionDto {
  userId: number;
  deviceGroupId: number;
  deviceGroupName: string;
  permissionLevel: UserPermissionLevel;
  grantedBy: number;
  grantedByName: string;
  grantedAt: string;
  isInherited: boolean;
  inheritedFromDeviceGroupId?: number;
  inheritedFromDeviceGroupName?: string;
}

// ================== Service Implementation ==================

/**
 * User Permission Service
 * Handles user permission checking and accessible resources
 */
class UserPermissionService {
  private readonly basePath = '/api/user/permissions';

  /**
   * Get current user's accessible device groups with minimum permission level
   * GET /api/user/permissions/accessible-groups
   */
  async getAccessibleDeviceGroups(
    minimumLevel: UserPermissionLevel = UserPermissionLevel.ViewOnly
  ): Promise<DeviceGroupAccessDto[]> {
    try {
      const response = await apiClient.get<DeviceGroupAccessDto[]>(
        `${this.basePath}/accessible-groups`,
        {
          params: { minimumLevel }
        }
      );
      
      const groupsArray = Array.isArray(response.data) ? response.data : [];
      console.log('[UserPermissionService] Accessible device groups retrieved:', groupsArray.length, 'minimumLevel:', minimumLevel);
      return groupsArray;
    } catch (error) {
      console.error('[UserPermissionService] Failed to get accessible device groups:', error);
      return [];
    }
  }

  /**
   * Get current user's permissions for all device groups
   * GET /api/user/permissions/my-permissions
   */
  async getMyPermissions(): Promise<UserPermissionDto[]> {
    try {
      const response = await apiClient.get<UserPermissionDto[]>(`${this.basePath}/my-permissions`);
      
      const permissionsArray = Array.isArray(response.data) ? response.data : [];
      console.log('[UserPermissionService] User permissions retrieved:', permissionsArray.length);
      return permissionsArray;
    } catch (error) {
      console.error('[UserPermissionService] Failed to get user permissions:', error);
      return [];
    }
  }

  /**
   * Get current user's permission for a specific device group
   * GET /api/user/permissions/device-group/{deviceGroupId}
   */
  async getMyPermissionForDeviceGroup(deviceGroupId: number): Promise<UserPermissionDto> {
    try {
      const response = await apiClient.get<UserPermissionDto>(
        `${this.basePath}/device-group/${deviceGroupId}`
      );
      
      if (!response.data || !response.data.userId) {
        throw new Error('Invalid permission response structure');
      }
      
      console.log('[UserPermissionService] Permission for device group retrieved:', deviceGroupId, response.data.permissionLevel);
      return response.data;
    } catch (error) {
      console.error('[UserPermissionService] Failed to get permission for device group:', deviceGroupId, error);
      throw error;
    }
  }

  /**
   * Check if current user can access device group with specific permission level
   * GET /api/user/permissions/can-access-group/{deviceGroupId}
   */
  async canAccessDeviceGroup(
    deviceGroupId: number,
    requiredLevel: UserPermissionLevel = UserPermissionLevel.ViewOnly
  ): Promise<boolean> {
    try {
      const response = await apiClient.get<{ canAccess: boolean }>(
        `${this.basePath}/can-access-group/${deviceGroupId}`,
        {
          params: { requiredLevel }
        }
      );
      
      if (!response.data || typeof response.data.canAccess !== 'boolean') {
        console.warn('[UserPermissionService] Invalid access check response, denying access');
        return false;
      }
      
      console.log('[UserPermissionService] Access check for device group:', deviceGroupId, 'requiredLevel:', requiredLevel, 'canAccess:', response.data.canAccess);
      return response.data.canAccess;
    } catch (error) {
      console.error('[UserPermissionService] Failed to check device group access (denying access):', deviceGroupId, error);
      return false; // Deny access by default on error (security fail-safe)
    }
  }

  /**
   * Get accessible device groups for content operations
   */
  async getAccessibleGroupsForContent(): Promise<DeviceGroupAccessDto[]> {
    return this.getAccessibleDeviceGroups(UserPermissionLevel.Contributor);
  }

  /**
   * Get accessible device groups for device management
   */
  async getAccessibleGroupsForDevices(): Promise<DeviceGroupAccessDto[]> {
    return this.getAccessibleDeviceGroups(UserPermissionLevel.Manager);
  }

  /**
   * Get accessible device groups for user management
   */
  async getAccessibleGroupsForUsers(): Promise<DeviceGroupAccessDto[]> {
    return this.getAccessibleDeviceGroups(UserPermissionLevel.Admin);
  }

  // ================== Helper Methods ==================

  /**
   * Check if permission level is sufficient
   */
  hasPermissionLevel(
    userLevel: UserPermissionLevel,
    requiredLevel: UserPermissionLevel
  ): boolean {
    const levels = [
      UserPermissionLevel.ViewOnly,
      UserPermissionLevel.Contributor,
      UserPermissionLevel.Manager,
      UserPermissionLevel.Admin
    ];
    
    const userLevelIndex = levels.indexOf(userLevel);
    const requiredLevelIndex = levels.indexOf(requiredLevel);
    
    return userLevelIndex >= requiredLevelIndex;
  }

  /**
   * Get permission level display name
   */
  getPermissionLevelDisplayName(level: UserPermissionLevel): string {
    switch (level) {
      case UserPermissionLevel.ViewOnly:
        return 'View Only';
      case UserPermissionLevel.Contributor:
        return 'Contributor';
      case UserPermissionLevel.Manager:
        return 'Manager';
      case UserPermissionLevel.Admin:
        return 'Administrator';
      default:
        return level;
    }
  }

  /**
   * Get permission level color
   */
  getPermissionLevelColor(level: UserPermissionLevel): string {
    switch (level) {
      case UserPermissionLevel.ViewOnly:
        return 'gray';
      case UserPermissionLevel.Contributor:
        return 'blue';
      case UserPermissionLevel.Manager:
        return 'green';
      case UserPermissionLevel.Admin:
        return 'red';
      default:
        return 'gray';
    }
  }

  /**
   * Get permission capabilities description
   */
  getPermissionCapabilities(access: DeviceGroupAccessDto): string[] {
    const capabilities: string[] = [];
    
    if (access.canViewDevices) capabilities.push('View devices');
    if (access.canManageContent) capabilities.push('Manage content');
    if (access.canManageDevices) capabilities.push('Manage devices');
    if (access.canManageUsers) capabilities.push('Manage users');
    
    return capabilities;
  }

  /**
   * Check if access is inherited
   */
  isInheritedAccess(permission: UserPermissionDto): boolean {
    return permission.isInherited;
  }

  /**
   * Get inheritance path description
   */
  getInheritanceDescription(permission: UserPermissionDto): string | null {
    if (!permission.isInherited || !permission.inheritedFromDeviceGroupName) {
      return null;
    }
    
    return `Inherited from "${permission.inheritedFromDeviceGroupName}"`;
  }

  /**
   * Group permissions by device group
   */
  groupPermissionsByDeviceGroup(
    permissions: UserPermissionDto[]
  ): Record<number, UserPermissionDto[]> {
    return permissions.reduce((groups, permission) => {
      const groupId = permission.deviceGroupId;
      if (!groups[groupId]) {
        groups[groupId] = [];
      }
      groups[groupId].push(permission);
      return groups;
    }, {} as Record<number, UserPermissionDto[]>);
  }

  /**
   * Get highest permission level for device group
   */
  getHighestPermissionLevel(permissions: UserPermissionDto[]): UserPermissionLevel {
    const levels = [
      UserPermissionLevel.ViewOnly,
      UserPermissionLevel.Contributor,
      UserPermissionLevel.Manager,
      UserPermissionLevel.Admin
    ];
    
    let highestLevel = UserPermissionLevel.ViewOnly;
    
    for (const permission of permissions) {
      const currentIndex = levels.indexOf(permission.permissionLevel);
      const highestIndex = levels.indexOf(highestLevel);
      
      if (currentIndex > highestIndex) {
        highestLevel = permission.permissionLevel;
      }
    }
    
    return highestLevel;
  }
}

// Export singleton instance
export const userPermissionService = new UserPermissionService();
export default userPermissionService;