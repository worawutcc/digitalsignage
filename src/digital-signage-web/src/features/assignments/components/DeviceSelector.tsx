/**
 * @fileoverview Device Selector Component
 * @description Device/group selector with search and multi-select support
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AssignmentTargetType } from '../types/assignment.types';
import { Monitor, Users, Search, X, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface DeviceSelectorProps {
  /**
   * Target type (Device or DeviceGroup)
   */
  targetType: AssignmentTargetType;
  
  /**
   * Selected device/group ID(s)
   */
  value?: number | number[];
  
  /**
   * Callback when selection changes
   */
  onChange: (value: number | number[]) => void;
  
  /**
   * Enable multi-select mode
   * @default false
   */
  multiSelect?: boolean;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Show device count for groups
   * @default true
   */
  showDeviceCount?: boolean;
  
  /**
   * Show online status indicator for devices
   * @default true
   */
  showOnlineStatus?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

/**
 * Device interface (simplified for selector)
 */
interface Device {
  id: number;
  name: string;
  location?: string;
  isOnline: boolean;
}

/**
 * Device Group interface (simplified for selector)
 */
interface DeviceGroup {
  id: number;
  name: string;
  description?: string;
  deviceCount: number;
}

/**
 * Mock data - TODO: Replace with actual API calls
 */
const MOCK_DEVICES: Device[] = [
  { id: 1, name: 'Lobby Display', location: 'Main Lobby', isOnline: true },
  { id: 2, name: 'Cafeteria TV', location: 'Cafeteria', isOnline: true },
  { id: 3, name: 'Meeting Room 1', location: 'Floor 2', isOnline: false },
  { id: 4, name: 'Meeting Room 2', location: 'Floor 2', isOnline: true },
  { id: 5, name: 'Reception Display', location: 'Reception', isOnline: true },
];

const MOCK_DEVICE_GROUPS: DeviceGroup[] = [
  { id: 1, name: 'All Meeting Rooms', description: 'All meeting room displays', deviceCount: 10 },
  { id: 2, name: 'Lobby Displays', description: 'Main and side lobbies', deviceCount: 3 },
  { id: 3, name: 'Floor 2 Displays', description: 'All displays on floor 2', deviceCount: 5 },
  { id: 4, name: 'Public Areas', description: 'Cafeteria, reception, lobbies', deviceCount: 8 },
];

/**
 * DeviceSelector component
 * 
 * Searchable dropdown selector for devices or device groups.
 * Supports single and multi-select modes.
 * 
 * @example
 * ```tsx
 * // Single device selection
 * <DeviceSelector
 *   targetType={AssignmentTargetType.Device}
 *   value={deviceId}
 *   onChange={(id) => setDeviceId(id as number)}
 * />
 * 
 * // Multi-select device groups
 * <DeviceSelector
 *   targetType={AssignmentTargetType.DeviceGroup}
 *   value={groupIds}
 *   onChange={(ids) => setGroupIds(ids as number[])}
 *   multiSelect
 * />
 * ```
 */
export function DeviceSelector({
  targetType,
  value,
  onChange,
  multiSelect = false,
  placeholder,
  disabled = false,
  showDeviceCount = true,
  showOnlineStatus = true,
  className,
  'data-testid': testId,
}: DeviceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const isDeviceMode = targetType === AssignmentTargetType.Device;
  const isGroupMode = targetType === AssignmentTargetType.DeviceGroup;
  
  // Normalize value to array for easier handling
  const selectedIds = useMemo(() => {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  // Get items based on target type
  const items = useMemo(() => {
    if (isDeviceMode) {
      return MOCK_DEVICES.map(d => ({
        id: d.id,
        name: d.name,
        subtitle: d.location,
        badge: d.isOnline ? 'Online' : 'Offline',
        badgeVariant: d.isOnline ? 'success' : 'error' as const,
      }));
    } else {
      return MOCK_DEVICE_GROUPS.map(g => ({
        id: g.id,
        name: g.name,
        subtitle: g.description,
        badge: showDeviceCount ? `${g.deviceCount} devices` : undefined,
        badgeVariant: 'default' as const,
      }));
    }
  }, [isDeviceMode, showDeviceCount]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.subtitle?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Get selected item names for display
  const selectedNames = useMemo(() => {
    const selected = items.filter(item => selectedIds.includes(item.id));
    return selected.map(item => item.name);
  }, [items, selectedIds]);

  // Handle item selection
  const handleSelect = useCallback((itemId: number) => {
    if (multiSelect) {
      const newSelection = selectedIds.includes(itemId)
        ? selectedIds.filter(id => id !== itemId)
        : [...selectedIds, itemId];
      onChange(newSelection);
    } else {
      onChange(itemId);
      setIsOpen(false);
    }
  }, [multiSelect, selectedIds, onChange]);

  // Handle remove chip (multi-select)
  const handleRemove = useCallback((itemId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelection = selectedIds.filter(id => id !== itemId);
    if (multiSelect) {
      onChange(newSelection);
    } else {
      const firstId = newSelection[0];
      if (firstId !== undefined) {
        onChange(firstId);
      }
    }
  }, [selectedIds, multiSelect, onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-device-selector]')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const Icon = isDeviceMode ? Monitor : Users;
  const label = isDeviceMode ? 'Device' : 'Device Group';
  const defaultPlaceholder = `Select ${label.toLowerCase()}${multiSelect ? '(s)' : ''}...`;

  return (
    <div
      data-device-selector
      data-testid={testId || 'device-selector'}
      className={cn('relative w-full', className)}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2',
          'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg',
          'text-left text-sm transition-colors',
          'hover:border-gray-400 dark:hover:border-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
          isOpen && 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 ring-offset-2'
        )}
        aria-label={`Select ${label}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className="w-4 h-4 flex-shrink-0 text-gray-500 dark:text-gray-400" aria-hidden="true" />
          
          {selectedNames.length > 0 ? (
            multiSelect ? (
              /* Multi-select chips */
              <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                {selectedNames.map((name, index) => {
                  const itemId = selectedIds[index];
                  if (itemId === undefined) return null;
                  
                  return (
                    <span
                      key={itemId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                    >
                      <span className="truncate max-w-[120px]">{name}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemove(itemId, e)}
                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                        aria-label={`Remove ${name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : (
              /* Single selection */
              <span className="truncate text-gray-900 dark:text-gray-100">
                {selectedNames[0]}
              </span>
            )
          ) : (
            <span className="truncate text-gray-500 dark:text-gray-400">
              {placeholder || defaultPlaceholder}
            </span>
          )}
        </div>
        
        <ChevronDown
          className={cn(
            'w-4 h-4 flex-shrink-0 text-gray-500 dark:text-gray-400 transition-transform',
            isOpen && 'transform rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg',
            'max-h-[300px] overflow-hidden flex flex-col'
          )}
          role="listbox"
          aria-label={`${label} options`}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}s...`}
                className={cn(
                  'w-full pl-8 pr-3 py-1.5 text-sm',
                  'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                )}
                aria-label={`Search ${label.toLowerCase()}s`}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="overflow-y-auto flex-1">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors',
                      'hover:bg-gray-100 dark:hover:bg-gray-700',
                      isSelected && 'bg-blue-50 dark:bg-blue-950'
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {multiSelect && (
                        <div
                          className={cn(
                            'flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center',
                            isSelected
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.name}
                        </div>
                        {item.subtitle && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {item.badge && (
                      <span
                        className={cn(
                          'flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full',
                          item.badgeVariant === 'success' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                          item.badgeVariant === 'error' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
                          item.badgeVariant === 'default' && 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    
                    {!multiSelect && isSelected && (
                      <Check className="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No {label.toLowerCase()}s found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DeviceSelector Skeleton - Loading state
 */
export function DeviceSelectorSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        'w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg',
        'animate-pulse',
        className
      )}
      role="status"
      aria-label="Loading device selector"
    >
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export default DeviceSelector;
