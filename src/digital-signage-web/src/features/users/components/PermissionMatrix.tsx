/**
 * PermissionMatrix Component
 * Displays and allows editing of role permissions in a matrix format
 */

'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import type { UserRole, Permission } from '../types';
import { PERMISSION_RESOURCES } from '../types';

interface PermissionMatrixProps {
  role: UserRole;
  onPermissionChange?: (permissions: Array<{ resource: string; action: string }>) => void;
  readOnly?: boolean;
  className?: string;
}

/**
 * PermissionMatrix Component
 * Displays role permissions in an interactive matrix grid
 */
export function PermissionMatrix({
  role,
  onPermissionChange,
  readOnly = false,
  className = '',
}: PermissionMatrixProps) {
  const [permissions, setPermissions] = React.useState<
    Map<string, Set<string>>
  >(() => {
    const map = new Map<string, Set<string>>();
    role.permissions.forEach((p) => {
      if (!map.has(p.resource)) {
        map.set(p.resource, new Set());
      }
      map.get(p.resource)?.add(p.action);
    });
    return map;
  });

  /**
   * Check if a specific permission is enabled
   */
  const hasPermission = React.useCallback(
    (resource: string, action: string): boolean => {
      // Check for wildcard permissions
      if (permissions.get('*')?.has('*')) return true;
      if (permissions.get('*')?.has(action)) return true;
      if (permissions.get(resource)?.has('*')) return true;
      
      return permissions.get(resource)?.has(action) || false;
    },
    [permissions]
  );

  /**
   * Toggle a specific permission
   */
  const togglePermission = React.useCallback(
    (resource: string, action: string) => {
      if (readOnly) return;

      setPermissions((prev) => {
        const newMap = new Map(prev);
        const resourcePerms = newMap.get(resource) || new Set<string>();
        
        if (resourcePerms.has(action)) {
          resourcePerms.delete(action);
        } else {
          resourcePerms.add(action);
        }

        if (resourcePerms.size === 0) {
          newMap.delete(resource);
        } else {
          newMap.set(resource, resourcePerms);
        }

        // Notify parent of changes
        if (onPermissionChange) {
          const permArray: Array<{ resource: string; action: string }> = [];
          newMap.forEach((actions, res) => {
            actions.forEach((act) => {
              permArray.push({ resource: res, action: act });
            });
          });
          onPermissionChange(permArray);
        }

        return newMap;
      });
    },
    [readOnly, onPermissionChange]
  );

  /**
   * Grant all permissions for a resource
   */
  const grantAllForResource = React.useCallback(
    (resource: string) => {
      if (readOnly) return;

      setPermissions((prev) => {
        const newMap = new Map(prev);
        const actions = PERMISSION_RESOURCES.find((r) => r.name === resource)?.actions || [];
        newMap.set(resource, new Set(actions));

        if (onPermissionChange) {
          const permArray: Array<{ resource: string; action: string }> = [];
          newMap.forEach((acts, res) => {
            acts.forEach((act) => {
              permArray.push({ resource: res, action: act });
            });
          });
          onPermissionChange(permArray);
        }

        return newMap;
      });
    },
    [readOnly, onPermissionChange]
  );

  /**
   * Revoke all permissions for a resource
   */
  const revokeAllForResource = React.useCallback(
    (resource: string) => {
      if (readOnly) return;

      setPermissions((prev) => {
        const newMap = new Map(prev);
        newMap.delete(resource);

        if (onPermissionChange) {
          const permArray: Array<{ resource: string; action: string }> = [];
          newMap.forEach((acts, res) => {
            acts.forEach((act) => {
              permArray.push({ resource: res, action: act });
            });
          });
          onPermissionChange(permArray);
        }

        return newMap;
      });
    },
    [readOnly, onPermissionChange]
  );

  // Check if all permissions are granted for a resource
  const hasAllPermissions = React.useCallback(
    (resource: string): boolean => {
      const resourceDef = PERMISSION_RESOURCES.find((r) => r.name === resource);
      if (!resourceDef) return false;

      return resourceDef.actions.every((action) =>
        hasPermission(resource, action)
      );
    },
    [hasPermission]
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Resource
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Read
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Write
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Delete
              </th>
              {!readOnly && (
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {PERMISSION_RESOURCES.map((resource) => (
              <tr
                key={resource.name}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {resource.name}
                    </span>
                  </div>
                </td>
                {resource.actions.map((action) => (
                  <td
                    key={action}
                    className="px-6 py-4 whitespace-nowrap text-center"
                  >
                    <button
                      type="button"
                      onClick={() => togglePermission(resource.name, action)}
                      disabled={readOnly}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded transition-colors ${
                        hasPermission(resource.name, action)
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                      } ${
                        !readOnly
                          ? 'hover:bg-green-200 dark:hover:bg-green-800 cursor-pointer'
                          : 'cursor-not-allowed'
                      }`}
                      aria-label={`${
                        hasPermission(resource.name, action) ? 'Revoke' : 'Grant'
                      } ${action} permission for ${resource.name}`}
                    >
                      {hasPermission(resource.name, action) ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                ))}
                {!readOnly && (
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {hasAllPermissions(resource.name) ? (
                      <button
                        type="button"
                        onClick={() => revokeAllForResource(resource.name)}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                      >
                        Revoke All
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => grantAllForResource(resource.name)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        Grant All
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Permission Summary */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Total Permissions: </span>
            {Array.from(permissions.values()).reduce(
              (sum, actions) => sum + actions.size,
              0
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Role Level: </span>
            {role.level === 1 && 'Super Administrator'}
            {role.level === 2 && 'Administrator'}
            {role.level === 3 && 'Manager'}
            {role.level === 4 && 'Operator'}
          </div>
        </div>
      </div>
    </div>
  );
}
