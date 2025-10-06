'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { DeviceGroup } from '@/types/api';

interface DeviceGroupFormProps {
  group?: DeviceGroup | null;
  parentGroup?: DeviceGroup | null;
  availableParents?: DeviceGroup[];
  onSubmit: (data: DeviceGroupFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface DeviceGroupFormData {
  name: string;
  description: string;
  parentGroupId?: number | undefined;
  isActive: boolean;
}

/**
 * Device Group Form Component
 * Handles create/edit operations for device groups
 * Following copilot-instructions-ui.instructions.md guidelines
 */
export function DeviceGroupForm({
  group,
  parentGroup,
  availableParents = [],
  onSubmit,
  onCancel,
  isLoading = false
}: DeviceGroupFormProps) {
  const [formData, setFormData] = useState<DeviceGroupFormData>({
    name: '',
    description: '',
    isActive: true
  });
  
  const [errors, setErrors] = useState<Partial<DeviceGroupFormData>>({});

  // Initialize form data when editing or adding subgroup
  useEffect(() => {
    if (group) {
      // Editing existing group
      const data: DeviceGroupFormData = {
        name: group.name,
        description: group.description,
        isActive: group.isActive
      };
      if (group.parentGroupId) {
        data.parentGroupId = group.parentGroupId;
      }
      setFormData(data);
    } else if (parentGroup) {
      // Adding subgroup
      setFormData({
        name: '',
        description: '',
        parentGroupId: parentGroup.id,
        isActive: true
      });
    } else {
      // Creating new root group
      setFormData({
        name: '',
        description: '',
        isActive: true
      });
    }
  }, [group, parentGroup]);

  const validateForm = (): boolean => {
    const newErrors: Partial<DeviceGroupFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Group name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Group name must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data
    const submitData: DeviceGroupFormData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      isActive: formData.isActive
    };
    
    if (formData.parentGroupId) {
      submitData.parentGroupId = formData.parentGroupId;
    }

    onSubmit(submitData);
  };

  const handleInputChange = (field: keyof DeviceGroupFormData, value: string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const isEditing = !!group;
  const title = isEditing 
    ? `Edit "${group.name}"` 
    : parentGroup 
      ? `Add Subgroup to "${parentGroup.name}"` 
      : 'Create New Group';

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isEditing 
            ? 'Update the device group information below.'
            : parentGroup
              ? 'Create a new subgroup within the selected parent group.'
              : 'Create a new device group to organize your devices.'
          }
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Group Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 ${
              errors.name 
                ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            placeholder="e.g., Main Building, Conference Rooms..."
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-start">
              <span className="inline-block w-4 h-4 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-xs leading-4 text-center mr-2 mt-0.5">!</span>
              {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 resize-none ${
              errors.description 
                ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            placeholder="Describe the purpose and location of this device group..."
            disabled={isLoading}
          />
          <div className="mt-1 flex justify-between items-center">
            {errors.description ? (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-start">
                <span className="inline-block w-4 h-4 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-xs leading-4 text-center mr-2 mt-0.5">!</span>
                {errors.description}
              </p>
            ) : (
              <span></span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formData.description.length}/500
            </span>
          </div>
        </div>

        {/* Parent Group */}
        {!parentGroup && availableParents.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Parent Group
            </label>
            <select
              value={formData.parentGroupId || ''}
              onChange={(e) => handleInputChange('parentGroupId', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 hover:border-gray-400 dark:hover:border-gray-500"
              disabled={isLoading}
            >
              <option value="">None (Root Group)</option>
              {availableParents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.path}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Select a parent group to create this as a subgroup, or leave empty for a root-level group.
            </p>
          </div>
        )}

        {/* Parent Group Info (when adding subgroup) */}
        {parentGroup && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Creating subgroup under:
              </h4>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium pl-4">
              {parentGroup.path}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 pl-4">
              This group will inherit permissions and settings from its parent.
            </p>
          </div>
        )}

        {/* Status */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700"
              disabled={isLoading}
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Active Group
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                When enabled, devices in this group will be available for content scheduling and management operations.
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              isEditing ? 'Update Group' : 'Create Group'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}