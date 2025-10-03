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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Group Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.name 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter group name..."
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.description 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter group description..."
            disabled={isLoading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
          )}
        </div>

        {/* Parent Group */}
        {!parentGroup && availableParents.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Parent Group
            </label>
            <select
              value={formData.parentGroupId || ''}
              onChange={(e) => handleInputChange('parentGroupId', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            >
              <option value="">None (Root Group)</option>
              {availableParents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.path}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Parent Group Info (when adding subgroup) */}
        {parentGroup && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              Adding subgroup to:
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">{parentGroup.path}</p>
          </div>
        )}

        {/* Status */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Active (devices in this group will be available for scheduling)
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Group' : 'Create Group'}
          </Button>
        </div>
      </form>
    </div>
  );
}