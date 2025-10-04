/**
 * Enhanced PermissionMatrix Component
 * Displays and allows editing of role permissions in a matrix format with advanced features:
 * - Bulk permission editing and selection
 * - Hierarchical permission inheritance
 * - Enhanced validation and conflict detection
 * - Real-time updates and synchronization
 * - Permission templates and presets
 * - Advanced search and filtering
 * 
 * @see copilot-instructions-ui.instructions.md - Component patterns
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Check, 
  X, 
  CheckSquare, 
  Square, 
  Shield, 
  Lock, 
  Unlock,
  Search,
  Filter,
  Settings,
  AlertTriangle,
  Info,
  RotateCcw,
  Copy,
  Download,
  Upload,
  Loader2
} from 'lucide-react';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { useDebounce } from '@/hooks/useDebounce';
import type { UserRole, Permission } from '../types';
import { PERMISSION_RESOURCES } from '../types';

interface PermissionMatrixProps {
  role: UserRole;
  onPermissionChange?: (permissions: Array<{ resource: string; action: string }>) => void;
  readOnly?: boolean;
  className?: string;
  // Enhanced props
  enableBulkEdit?: boolean;
  enableHierarchy?: boolean;
  enableRealTimeUpdates?: boolean;
  enableValidation?: boolean;
  parentRole?: UserRole; // For hierarchical permissions
  onValidationError?: (errors: string[]) => void;
  permissionPresets?: Array<{
    name: string;
    permissions: Array<{ resource: string; action: string }>;
  }>;
}

/**
 * Enhanced PermissionMatrix Component
 * Displays role permissions in an interactive matrix grid with advanced features
 */
export function PermissionMatrix({
  role,
  onPermissionChange,
  readOnly = false,
  className = '',
  enableBulkEdit = false,
  enableHierarchy = false,
  enableRealTimeUpdates = true,
  enableValidation = true,
  parentRole,
  onValidationError,
  permissionPresets = [],
}: PermissionMatrixProps) {
  // Enhanced state management
  const [permissions, setPermissions] = useState<Map<string, Set<string>>>(() => {
    const map = new Map<string, Set<string>>();
    role.permissions.forEach((p) => {
      if (!map.has(p.resource)) {
        map.set(p.resource, new Set());
      }
      map.get(p.resource)?.add(p.action);
    });
    return map;
  });

  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterByAccess, setFilterByAccess] = useState<'all' | 'granted' | 'denied'>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [changedPermissions, setChangedPermissions] = useState<Set<string>>(new Set());

  // Real-time updates
  const realTimeUpdates = useRealTimeUpdates();
  
  useEffect(() => {
    if (enableRealTimeUpdates) {
      const unsubscribe = realTimeUpdates.subscribe(['user_updated'], (event: any) => {
        if (event.data?.roleId === role.id) {
          console.log('Permission matrix real-time update:', event);
          // In a real implementation, would refresh permissions
        }
      });
      
      return unsubscribe;
    }
    return undefined;
  }, [enableRealTimeUpdates, realTimeUpdates, role.id]);

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filtered resources based on search
  const filteredResources = useMemo(() => {
    return PERMISSION_RESOURCES.filter(resource => {
      const matchesSearch = !debouncedSearchQuery || 
        resource.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      if (filterByAccess === 'all') return matchesSearch;
      
      const hasAnyPermission = resource.actions.some(action => 
        hasPermission(resource.name, action)
      );
      
      return matchesSearch && (
        (filterByAccess === 'granted' && hasAnyPermission) ||
        (filterByAccess === 'denied' && !hasAnyPermission)
      );
    });
  }, [debouncedSearchQuery, filterByAccess, permissions]);

  /**
   * Check if a specific permission is enabled (with hierarchy support)
   */
  const hasPermission = useCallback(
    (resource: string, action: string): boolean => {
      // Check for wildcard permissions
      if (permissions.get('*')?.has('*')) return true;
      if (permissions.get('*')?.has(action)) return true;
      if (permissions.get(resource)?.has('*')) return true;
      
      // Check direct permission
      const hasDirectPermission = permissions.get(resource)?.has(action) || false;
      
      // Check hierarchical inheritance from parent role
      if (enableHierarchy && parentRole && !hasDirectPermission) {
        return parentRole.permissions.some(p => 
          p.resource === resource && p.action === action
        );
      }
      
      return hasDirectPermission;
    },
    [permissions, enableHierarchy, parentRole]
  );

  /**
   * Enhanced validation with role-level constraints
   */
  const validatePermissions = useCallback(async () => {
    if (!enableValidation) return [];
    
    setIsValidating(true);
    const errors: string[] = [];
    
    try {
      // Role level constraints
      const roleConstraints: Record<number, string[]> = {
        1: [], // Super Admin - no restrictions
        2: ['system'], // Admin - cannot modify system settings
        3: ['system', 'users'], // Manager - cannot modify system or users
        4: ['system', 'users', 'roles'], // Operator - limited permissions
      };
      
      const restrictedResources = roleConstraints[role.level] || [];
      
      permissions.forEach((actions, resource) => {
        if (restrictedResources.includes(resource)) {
          actions.forEach(action => {
            if (action === 'write' || action === 'delete') {
              errors.push(`Level ${role.level} roles cannot have ${action} access to ${resource}`);
            }
          });
        }
      });
      
      // Check for conflicting permissions
      if (permissions.get('media')?.has('delete') && !permissions.get('media')?.has('write')) {
        errors.push('Delete permission requires write permission for media resources');
      }
      
      // Minimum required permissions by role level
      if (role.level >= 3 && !permissions.get('schedules')?.has('read')) {
        errors.push('Managers and Operators must have read access to schedules');
      }
      
    } finally {
      setIsValidating(false);
    }
    
    setValidationErrors(errors);
    onValidationError?.(errors);
    return errors;
  }, [permissions, role.level, enableValidation, onValidationError]);

  // Run validation when permissions change
  useEffect(() => {
    if (enableValidation) {
      validatePermissions();
    }
  }, [permissions, validatePermissions, enableValidation]);

  /**
   * Bulk operations for selected cells
   */
  const handleBulkToggle = useCallback((grant: boolean) => {
    if (readOnly || selectedCells.size === 0) return;
    
    setPermissions(prev => {
      const newMap = new Map(prev);
      const changed = new Set(changedPermissions);
      
      selectedCells.forEach(cellKey => {
        const parts = cellKey.split(':');
        if (parts.length !== 2) return;
        
        const resource = parts[0];
        const action = parts[1];
        
        if (!resource || !action) return;
        
        const resourcePerms = newMap.get(resource) || new Set<string>();
        
        if (grant) {
          resourcePerms.add(action);
          changed.add(cellKey);
        } else {
          resourcePerms.delete(action);
          changed.add(cellKey);
        }
        
        if (resourcePerms.size === 0) {
          newMap.delete(resource);
        } else {
          newMap.set(resource, resourcePerms);
        }
      });
      
      setChangedPermissions(changed);
      setSelectedCells(new Set());
      
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
  }, [readOnly, selectedCells, changedPermissions, onPermissionChange]);

  /**
   * Apply permission preset
   */
  const applyPreset = useCallback((preset: { name: string; permissions: Array<{ resource: string; action: string }> }) => {
    if (readOnly) return;
    
    const newMap = new Map<string, Set<string>>();
    preset.permissions.forEach(p => {
      if (!newMap.has(p.resource)) {
        newMap.set(p.resource, new Set());
      }
      newMap.get(p.resource)?.add(p.action);
    });
    
    setPermissions(newMap);
    setChangedPermissions(new Set(preset.permissions.map(p => `${p.resource}:${p.action}`)));
    
    if (onPermissionChange) {
      onPermissionChange(preset.permissions);
    }
  }, [readOnly, onPermissionChange]);

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
      {/* Enhanced Header with Controls */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Permission Matrix
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {enableHierarchy && parentRole ? 
                  `Inherits from ${parentRole.name} (Level ${parentRole.level})` :
                  'Configure role permissions'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isValidating && (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              )}
              {validationErrors.length > 0 && (
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span className="text-sm">{validationErrors.length} issues</span>
                </div>
              )}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          {showAdvanced && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <select
                value={filterByAccess}
                onChange={(e) => setFilterByAccess(e.target.value as typeof filterByAccess)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Resources</option>
                <option value="granted">With Permissions</option>
                <option value="denied">Without Permissions</option>
              </select>
            </div>
          )}

          {/* Permission Presets */}
          {permissionPresets.length > 0 && showAdvanced && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Presets:</label>
              {permissionPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  disabled={readOnly}
                  className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          )}

          {/* Bulk Operations */}
          {enableBulkEdit && selectedCells.size > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedCells.size} permission{selectedCells.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkToggle(true)}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Grant All
                  </button>
                  <button
                    onClick={() => handleBulkToggle(false)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Deny All
                  </button>
                  <button
                    onClick={() => setSelectedCells(new Set())}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                    Permission Validation Issues
                  </h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
            {filteredResources.map((resource) => (
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
                {resource.actions.map((action) => {
                  const cellKey = `${resource.name}:${action}`;
                  const isSelected = selectedCells.has(cellKey);
                  const isChanged = changedPermissions.has(cellKey);
                  const hasInheritedPermission = enableHierarchy && parentRole?.permissions.some(
                    p => p.resource === resource.name && p.action === action
                  );
                  
                  return (
                    <td
                      key={action}
                      className="px-6 py-4 whitespace-nowrap text-center relative"
                    >
                      <div className="relative">
                        {/* Bulk selection overlay */}
                        {enableBulkEdit && (
                          <button
                            onClick={() => {
                              const newSelection = new Set(selectedCells);
                              if (isSelected) {
                                newSelection.delete(cellKey);
                              } else {
                                newSelection.add(cellKey);
                              }
                              setSelectedCells(newSelection);
                            }}
                            className={`absolute -inset-1 rounded ${
                              isSelected ? 'bg-blue-200 dark:bg-blue-800' : 'hover:bg-blue-100 dark:hover:bg-blue-900'
                            } opacity-0 hover:opacity-50 transition-opacity`}
                          />
                        )}
                        
                        <button
                          type="button"
                          onClick={() => togglePermission(resource.name, action)}
                          disabled={readOnly}
                          className={`relative inline-flex items-center justify-center w-8 h-8 rounded transition-all ${
                            hasPermission(resource.name, action)
                              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                          } ${
                            !readOnly
                              ? 'hover:bg-green-200 dark:hover:bg-green-800 cursor-pointer'
                              : 'cursor-not-allowed'
                          } ${
                            isSelected ? 'ring-2 ring-blue-500' : ''
                          } ${
                            isChanged ? 'ring-2 ring-orange-400' : ''
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
                          
                          {/* Hierarchy indicator */}
                          {hasInheritedPermission && !permissions.get(resource.name)?.has(action) && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                              <Lock className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </button>
                      </div>
                    </td>
                  );
                })}
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
