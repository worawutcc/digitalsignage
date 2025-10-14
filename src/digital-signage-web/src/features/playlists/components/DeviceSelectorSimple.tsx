'use client';

import React, { useState, useMemo } from 'react';
import { Check, Search, Filter, X, Monitor, Smartphone, Tablet, Tv, Laptop } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';
import type { Device } from '@/features/devices/types/device.types';

/**
 * Device Selection Mode
 */
export type DeviceSelectionMode = 'single' | 'multiple';

/**
 * Device Selection Props
 */
export interface DeviceSelectorProps {
  /**
   * Available devices to choose from
   */
  devices: Device[];
  
  /**
   * Currently selected device IDs
   */
  selectedDeviceIds: number[];
  
  /**
   * Callback when device selection changes
   */
  onSelectionChange: (deviceIds: number[]) => void;
  
  /**
   * Selection mode - single or multiple
   * @default 'multiple'
   */
  selectionMode?: DeviceSelectionMode;
  
  /**
   * Whether to show device status indicators
   * @default true
   */
  showStatus?: boolean;
  
  /**
   * Whether to show device location
   * @default true
   */
  showLocation?: boolean;
  
  /**
   * Whether to enable filtering
   * @default true
   */
  enableFiltering?: boolean;
  
  /**
   * Placeholder text for search input
   */
  searchPlaceholder?: string;
  
  /**
   * Maximum height for the device list
   */
  maxHeight?: string;
  
  /**
   * Custom className for styling
   */
  className?: string;
  
  /**
   * Whether the selector is disabled
   */
  disabled?: boolean;
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Empty state message
   */
  emptyMessage?: string;
}

/**
 * Device Status Configuration
 */
const deviceStatusConfig = {
  online: {
    label: 'Online',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50'
  },
  offline: {
    label: 'Offline', 
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50'
  },
  error: {
    label: 'Error',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50'
  },
  maintenance: {
    label: 'Maintenance',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50'
  }
} as const;

/**
 * Get device type icon based on device type or name patterns
 */
const getDeviceIcon = (device: Device) => {
  const name = device.name.toLowerCase();
  
  if (name.includes('android') || name.includes('tv')) {
    return <Tv className="h-4 w-4" />;
  }
  if (name.includes('phone') || name.includes('mobile')) {
    return <Smartphone className="h-4 w-4" />;
  }
  if (name.includes('tablet') || name.includes('ipad')) {
    return <Tablet className="h-4 w-4" />;
  }
  if (name.includes('laptop') || name.includes('notebook')) {
    return <Laptop className="h-4 w-4" />;
  }
  
  return <Monitor className="h-4 w-4" />;
};

/**
 * DeviceSelector Component
 * Allows selecting one or multiple devices for playlist assignment
 * Following Next.js App Router patterns and TypeScript strict mode
 */
export function DeviceSelector({
  devices,
  selectedDeviceIds,
  onSelectionChange,
  selectionMode = 'multiple',
  showStatus = true,
  showLocation = true,
  enableFiltering = true,
  searchPlaceholder = 'Search devices...',
  maxHeight = '400px',
  className,
  disabled = false,
  loading = false,
  emptyMessage = 'No devices available'
}: DeviceSelectorProps) {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          device.name.toLowerCase().includes(query) ||
          device.location.toLowerCase().includes(query) ||
          (device.deviceGroup && device.deviceGroup.toLowerCase().includes(query)) ||
          device.ipAddress.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && device.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  }, [devices, searchQuery, statusFilter]);

  /**
   * Handle device selection/deselection
   */
  const handleDeviceToggle = (deviceId: number) => {
    if (disabled) return;
    
    if (selectionMode === 'single') {
      // Single selection mode
      onSelectionChange(selectedDeviceIds.includes(deviceId) ? [] : [deviceId]);
    } else {
      // Multiple selection mode
      if (selectedDeviceIds.includes(deviceId)) {
        onSelectionChange(selectedDeviceIds.filter(id => id !== deviceId));
      } else {
        onSelectionChange([...selectedDeviceIds, deviceId]);
      }
    }
  };

  /**
   * Handle select all/none for multiple selection
   */
  const handleSelectAll = () => {
    if (disabled) return;
    
    if (selectedDeviceIds.length === filteredDevices.length) {
      // Deselect all
      onSelectionChange([]);
    } else {
      // Select all filtered devices
      onSelectionChange(filteredDevices.map(device => device.id));
    }
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = searchQuery || statusFilter !== 'all';

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filters Header */}
      {enableFiltering && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={disabled}
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Status Filter Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  disabled={disabled}
                  className="px-3 py-1 border rounded-md bg-background"
                >
                  <option value="all">All Statuses</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="error">Error</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  disabled={disabled}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            
            {/* Selection Summary */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedDeviceIds.length} of {filteredDevices.length} selected
              </span>
              
              {selectionMode === 'multiple' && filteredDevices.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={disabled}
                >
                  {selectedDeviceIds.length === filteredDevices.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t" />

      {/* Device List */}
      <div 
        className={cn(
          'space-y-2 overflow-y-auto',
          disabled && 'opacity-50 pointer-events-none'
        )}
        style={{ maxHeight }}
      >
        {filteredDevices.length === 0 ? (
          <div className="text-center py-8">
            <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {hasActiveFilters ? 'No devices match your filters' : emptyMessage}
            </p>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          filteredDevices.map(device => {
            const isSelected = selectedDeviceIds.includes(device.id);
            const statusConfig = deviceStatusConfig[device.status as keyof typeof deviceStatusConfig];
            
            return (
              <div
                key={device.id}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50',
                  isSelected && 'bg-primary/10 border-primary',
                  disabled && 'cursor-not-allowed'
                )}
                onClick={() => handleDeviceToggle(device.id)}
              >
                {/* Selection Checkbox/Radio */}
                <div className="flex-shrink-0">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleDeviceToggle(device.id)}
                    disabled={disabled}
                  />
                </div>

                {/* Device Icon */}
                <div className="flex-shrink-0 text-muted-foreground">
                  {getDeviceIcon(device)}
                </div>

                {/* Device Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {device.name}
                    </p>
                    
                    {/* Status Badge */}
                    {showStatus && statusConfig && (
                      <Badge 
                        variant="info"
                        className={cn(
                          'text-xs',
                          statusConfig.textColor,
                          statusConfig.bgColor
                        )}
                      >
                        <div className={cn('w-1.5 h-1.5 rounded-full mr-1', statusConfig.color)} />
                        {statusConfig.label}
                      </Badge>
                    )}
                  </div>

                  {/* Location and Details */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {showLocation && device.location && (
                      <span>📍 {device.location}</span>
                    )}
                    
                    {device.deviceGroup && (
                      <span>🏷️ {device.deviceGroup}</span>
                    )}
                    
                    <span>💻 {device.ipAddress}</span>
                  </div>

                  {/* Resolution and Last Seen */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>🖥️ {device.resolution}</span>
                    <span>⏰ Last seen: {new Date(device.lastSeen).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}