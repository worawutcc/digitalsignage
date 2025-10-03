'use client'

import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

/**
 * Permission check result
 */
export interface PermissionCheck {
  hasPermission: boolean
  isLoading: boolean
  user: RootState['auth']['user']
}

/**
 * Hook to check if user has specific permission
 */
export function usePermission(permission: string): PermissionCheck {
  const { user, isLoading } = useSelector((state: RootState) => state.auth)

  const hasPermission = useMemo(() => {
    if (!user) {
      return false
    }

    // Admin role has all permissions
    if (user.role === 'Admin') {
      return true
    }

    // User role has limited permissions (customize as needed)
    if (user.role === 'User') {
      // Define which permissions regular users have
      const userPermissions = [
        'devices:read',
        'content:read',
        'playlists:read',
        'schedules:read'
      ]
      
      // Check for exact permission match
      if (userPermissions.includes(permission)) {
        return true
      }

      // Check for wildcard permissions (e.g., "devices:*" matches "devices:read")
      const [resource] = permission.split(':')
      const wildcardPermission = `${resource}:*`
      if (userPermissions.includes(wildcardPermission)) {
        return true
      }
    }

    return false
  }, [user, permission])

  return {
    hasPermission,
    isLoading,
    user,
  }
}

/**
 * Hook to check if user has ANY of the specified permissions
 */
export function usePermissions(permissions: string[]): PermissionCheck {
  const { user, isLoading } = useSelector((state: RootState) => state.auth)

  const hasPermission = useMemo(() => {
    if (!user) {
      return false
    }

    // Admin role has all permissions
    if (user.role === 'Admin') {
      return true
    }

    // User role has limited permissions
    if (user.role === 'User') {
      const userPermissions = [
        'devices:read',
        'content:read',
        'playlists:read',
        'schedules:read'
      ]
      
      // Check if user has any of the required permissions
      return permissions.some((permission) => {
        // Check for exact permission match
        if (userPermissions.includes(permission)) {
          return true
        }

        // Check for wildcard permissions
        const [resource] = permission.split(':')
        const wildcardPermission = `${resource}:*`
        return userPermissions.includes(wildcardPermission)
      })
    }

    return false
  }, [user, permissions])

  return {
    hasPermission,
    isLoading,
    user,
  }
}

/**
 * Hook to check if user has ALL of the specified permissions
 */
export function useRequireAllPermissions(permissions: string[]): PermissionCheck {
  const { user, isLoading } = useSelector((state: RootState) => state.auth)

  const hasPermission = useMemo(() => {
    if (!user) {
      return false
    }

    // Admin role has all permissions
    if (user.role === 'Admin') {
      return true
    }

    // User role has limited permissions
    if (user.role === 'User') {
      const userPermissions = [
        'devices:read',
        'content:read',
        'playlists:read',
        'schedules:read'
      ]
      
      // Check if user has all required permissions
      return permissions.every((permission) => {
        // Check for exact permission match
        if (userPermissions.includes(permission)) {
          return true
        }

        // Check for wildcard permissions
        const [resource] = permission.split(':')
        const wildcardPermission = `${resource}:*`
        return userPermissions.includes(wildcardPermission)
      })
    }

    return false
  }, [user, permissions])

  return {
    hasPermission,
    isLoading,
    user,
  }
}

/**
 * Hook to check if user has specific role
 */
export function useRole(role: 'admin' | 'manager' | 'user'): PermissionCheck {
  const { user, isLoading } = useSelector((state: RootState) => state.auth)

  const hasPermission = useMemo(() => {
    if (!user) {
      return false
    }

    // Map new role enum to old role strings
    const roleMapping = {
      'Admin': 'admin',
      'User': 'user'
    }

    return roleMapping[user.role] === role
  }, [user, role])

  return {
    hasPermission,
    isLoading,
    user,
  }
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useRoles(roles: Array<'admin' | 'manager' | 'user'>): PermissionCheck {
  const { user, isLoading } = useSelector((state: RootState) => state.auth)

  const hasPermission = useMemo(() => {
    if (!user) {
      return false
    }

    // Map new role enum to old role strings
    const roleMapping = {
      'Admin': 'admin',
      'User': 'user'
    }

    return roles.includes(roleMapping[user.role] as 'admin' | 'manager' | 'user')
  }, [user, roles])

  return {
    hasPermission,
    isLoading,
    user,
  }
}

/**
 * Hook to check if user is authenticated
 */
export function useAuth(): {
  isAuthenticated: boolean
  isLoading: boolean
  user: RootState['auth']['user']
} {
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)

  return {
    isAuthenticated,
    isLoading,
    user,
  }
}

/**
 * Hook for resource-based permission checking
 * Useful for checking permissions on specific resources (e.g., "can edit this device")
 */
export function useResourcePermission(
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete',
  resourceOwnerId?: number
): PermissionCheck {
  const { user, isLoading } = useSelector((state: RootState) => state.auth)

  const hasPermission = useMemo(() => {
    if (!user) {
      return false
    }

    // Admin role has all permissions
    if (user.role === 'Admin') {
      return true
    }

    // Check if user owns the resource (if resourceOwnerId is provided)
    if (resourceOwnerId && user.id === resourceOwnerId) {
      return true
    }

    // User role has limited permissions
    if (user.role === 'User') {
      const userPermissions = [
        'devices:read',
        'content:read',
        'playlists:read',
        'schedules:read'
      ]
      
      // Check for specific action permission
      const permission = `${resource}:${action}`
      if (userPermissions.includes(permission)) {
        return true
      }

      // Check for wildcard permission
      const wildcardPermission = `${resource}:*`
      if (userPermissions.includes(wildcardPermission)) {
        return true
      }
    }

    return false
  }, [user, resource, action, resourceOwnerId])

  return {
    hasPermission,
    isLoading,
    user,
  }
}

/**
 * Permission gate component - renders children only if user has permission
 */
export interface PermissionGateProps {
  permission: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps): React.ReactElement | null {
  const { hasPermission, isLoading } = usePermission(permission)

  if (isLoading) {
    return null
  }

  if (!hasPermission) {
    return fallback as React.ReactElement | null
  }

  return children as React.ReactElement
}

/**
 * Role gate component - renders children only if user has role
 */
export interface RoleGateProps {
  role: 'admin' | 'manager' | 'user'
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function RoleGate({ role, fallback = null, children }: RoleGateProps): React.ReactElement | null {
  const { hasPermission, isLoading } = useRole(role)

  if (isLoading) {
    return null
  }

  if (!hasPermission) {
    return fallback as React.ReactElement | null
  }

  return children as React.ReactElement
}

/**
 * Auth gate component - renders children only if user is authenticated
 */
export interface AuthGateProps {
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function AuthGate({ fallback = null, children }: AuthGateProps): React.ReactElement | null {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return fallback as React.ReactElement | null
  }

  return children as React.ReactElement
}
