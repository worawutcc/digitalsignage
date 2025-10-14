'use client';

import React, { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { DeviceSelector } from './DeviceSelector';
import { cn } from '@/lib/utils';
import { 
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Settings,
  Monitor
} from 'lucide-react';
import type { Device } from '@/features/devices/types/device.types';
import type { Playlist } from '@/types/playlist';

/**
 * Schedule configuration for device assignment
 */
export interface AssignmentSchedule {
  /** Start date and time for the assignment (ISO 8601) */
  startDateTime?: string | undefined;
  /** End date and time for the assignment (ISO 8601) */
  endDateTime?: string | undefined;
  /** Whether the assignment should be active immediately */
  isActive: boolean;
  /** Priority level (1-10, higher numbers = higher priority) */
  priority: number;
}

/**
 * Device assignment configuration
 */
export interface DeviceAssignmentConfig {
  /** Selected device IDs */
  deviceIds: number[];
  /** Schedule configuration */
  schedule: AssignmentSchedule;
  /** Whether to override existing assignments */
  overrideExisting: boolean;
}

/**
 * Props for DeviceAssignmentModal component
 */
export interface DeviceAssignmentModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should be closed */
  onClose: () => void;
  /** The playlist to assign to devices */
  playlist?: Playlist;
  /** Available devices */
  devices: Device[];
  /** Loading state for device assignment */
  isAssigning?: boolean;
  /** Callback when assignment is confirmed */
  onAssign: (config: DeviceAssignmentConfig) => Promise<void>;
  /** Pre-selected device IDs (optional) */
  initialSelectedDevices?: number[];
  /** Custom CSS classes */
  className?: string;
}

/**
 * DeviceAssignmentModal Component
 * 
 * A comprehensive modal for assigning playlists to devices with advanced scheduling options.
 * Features device selection, priority management, scheduling, and conflict resolution.
 * 
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback when modal should be closed
 * @param playlist - The playlist to assign to devices
 * @param devices - Available devices for assignment
 * @param isAssigning - Loading state for device assignment
 * @param onAssign - Callback when assignment is confirmed
 * @param initialSelectedDevices - Pre-selected device IDs
 * @param className - Additional CSS classes
 */
export const DeviceAssignmentModal = memo(({
  isOpen,
  onClose,
  playlist,
  devices,
  isAssigning = false,
  onAssign,
  initialSelectedDevices = [],
  className
}: DeviceAssignmentModalProps) => {
  // State management
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<number[]>(initialSelectedDevices);
  const [schedule, setSchedule] = useState<AssignmentSchedule>({
    isActive: true,
    priority: 1
  });
  const [overrideExisting, setOverrideExisting] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Reset modal state when closed
   */
  const resetState = useCallback(() => {
    setSelectedDeviceIds(initialSelectedDevices);
    setSchedule({
      isActive: true,
      priority: 1
    });
    setOverrideExisting(false);
    setShowAdvancedOptions(false);
    setErrors({});
  }, [initialSelectedDevices]);

  /**
   * Handle modal close
   */
  const handleClose = useCallback(() => {
    if (!isAssigning) {
      resetState();
      onClose();
    }
  }, [isAssigning, resetState, onClose]);

  /**
   * Validate assignment configuration
   */
  const validateAssignment = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Check if devices are selected
    if (selectedDeviceIds.length === 0) {
      newErrors.devices = 'Please select at least one device';
    }

    // Check if playlist exists
    if (!playlist) {
      newErrors.playlist = 'No playlist selected';
    }

    // Validate date range if provided
    if (schedule.startDateTime && schedule.endDateTime) {
      const start = new Date(schedule.startDateTime);
      const end = new Date(schedule.endDateTime);
      
      if (end <= start) {
        newErrors.schedule = 'End date must be after start date';
      }
    }

    // Validate priority
    if (schedule.priority < 1 || schedule.priority > 10) {
      newErrors.priority = 'Priority must be between 1 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedDeviceIds, playlist, schedule]);

  /**
   * Handle assignment confirmation
   */
  const handleAssign = useCallback(async () => {
    if (!validateAssignment()) {
      return;
    }

    const config: DeviceAssignmentConfig = {
      deviceIds: selectedDeviceIds,
      schedule,
      overrideExisting
    };

    try {
      await onAssign(config);
      handleClose();
    } catch (error) {
      console.error('❌ Failed to assign playlist to devices:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to assign playlist'
      });
    }
  }, [validateAssignment, selectedDeviceIds, schedule, overrideExisting, onAssign, handleClose]);

  /**
   * Format date-time for input field
   */
  const formatDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  /**
   * Get current date-time as default
   */
  const getCurrentDateTime = (): string => {
    return formatDateTime(new Date());
  };

  if (!playlist) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Playlist to Devices"
      size="xl"
      className={cn('max-w-4xl', className)}
    >
      <div className="space-y-6">
        {/* Playlist Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Monitor className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">
                {playlist.name}
              </h3>
              <p className="text-sm text-blue-700">
                {playlist.totalItems} items • Priority: {playlist.priority}
              </p>
              {playlist.description && (
                <p className="text-sm text-blue-600 mt-1">
                  {playlist.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Device Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Select Devices
            </h3>
            <span className="text-sm text-gray-500">
              {selectedDeviceIds.length} device{selectedDeviceIds.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          {errors.devices && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errors.devices}
            </div>
          )}

          <DeviceSelector
            devices={devices}
            selectedDeviceIds={selectedDeviceIds}
            onSelectionChange={setSelectedDeviceIds}
            selectionMode="multiple"
            showStatus={true}
            showLocation={true}
            enableFiltering={true}
            searchPlaceholder="Search devices to assign..."
            maxHeight="300px"
            className="border rounded-lg"
          />
        </div>

        {/* Assignment Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Assignment Configuration
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
            </Button>
          </div>

          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <Input
                type="number"
                min={1}
                max={10}
                value={schedule.priority}
                onChange={(e) => setSchedule(prev => ({
                  ...prev,
                  priority: parseInt(e.target.value) || 1
                }))}
                placeholder="1-10 (higher = more priority)"
                className={errors.priority ? 'border-red-500' : ''}
              />
              {errors.priority && (
                <p className="text-red-600 text-sm mt-1">{errors.priority}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={schedule.isActive}
                onChange={(e) => setSchedule(prev => ({
                  ...prev,
                  isActive: e.target.checked
                }))}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Start assignment immediately
              </label>
            </div>
          </div>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              {/* Scheduling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Start Date & Time (Optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={schedule.startDateTime || ''}
                    onChange={(e) => setSchedule(prev => ({
                      ...prev,
                      startDateTime: e.target.value ? e.target.value : undefined
                    }))}
                    min={getCurrentDateTime()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    End Date & Time (Optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={schedule.endDateTime || ''}
                    onChange={(e) => setSchedule(prev => ({
                      ...prev,
                      endDateTime: e.target.value ? e.target.value : undefined
                    }))}
                    min={schedule.startDateTime || getCurrentDateTime()}
                  />
                </div>
              </div>

              {errors.schedule && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.schedule}
                </div>
              )}

              {/* Override Existing */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="overrideExisting"
                  checked={overrideExisting}
                  onChange={(e) => setOverrideExisting(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="overrideExisting" className="ml-2 text-sm text-gray-700">
                  Override existing playlist assignments on selected devices
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Global Error */}
        {errors.submit && (
          <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            {errors.submit}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedDeviceIds.length === 0 || isAssigning}
            className="min-w-[120px]"
          >
            {isAssigning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Assigning...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Assign to {selectedDeviceIds.length} Device{selectedDeviceIds.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
});

DeviceAssignmentModal.displayName = 'DeviceAssignmentModal';

export default DeviceAssignmentModal;