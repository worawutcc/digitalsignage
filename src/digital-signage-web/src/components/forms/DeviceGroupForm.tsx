'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCreateDeviceGroup } from '@/hooks/useCreateDeviceGroup';
import { useUpdateDeviceGroup } from '@/hooks/useUpdateDeviceGroup';
import { useDeviceGroups } from '@/hooks/useDeviceGroups';
import { useDeviceGroupNameValidation } from '@/hooks/useDeviceGroups';
import { deviceGroupSchema } from '@/lib/validations/deviceGroup.schema';
import type { 
  DeviceGroup, 
  CreateDeviceGroupRequest,
  UpdateDeviceGroupRequest 
} from '@/types/deviceGroup.types';
import type { DeviceGroupFormData } from '@/lib/validations/deviceGroup.schema';

interface DeviceGroupFormProps {
  group?: DeviceGroup | null;
  parentGroup?: DeviceGroup | null;
  onSubmit?: (data: DeviceGroup) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
}

/**
 * Enhanced Device Group Form Component
 * Handles create/edit operations for device groups with React Query integration
 * Following copilot-instructions-ui.instructions.md guidelines
 */
export function DeviceGroupForm({
  group,
  parentGroup,
  onSubmit,
  onCancel,
  mode = group ? 'edit' : 'create'
}: DeviceGroupFormProps) {
  // React Query hooks
  const { data: availableParents = [] } = useDeviceGroups({}, { staleTime: 60000 });
  
  const createMutation = useCreateDeviceGroup({
    onSuccess: (response) => {
      if (response.data) {
        onSubmit?.(response.data);
      }
    },
    onError: (error) => {
      console.error('Create error:', error);
    },
  });

  const updateMutation = useUpdateDeviceGroup({
    onSuccess: (response) => {
      if (response.data) {
        onSubmit?.(response.data);
      }
    },
    onError: (error) => {
      console.error('Update error:', error);
    },
  });

  // Form setup with React Hook Form + Zod
  const form = useForm<DeviceGroupFormData>({
    resolver: zodResolver(deviceGroupSchema),
    defaultValues: {
      name: group?.name ?? '',
      ...(group?.description && { description: group.description }),
      ...(group?.parentId && { parentGroupId: group.parentId }),
      ...(!group?.parentId && parentGroup?.id && { parentGroupId: parentGroup.id }),
    },
  });



  const { handleSubmit, register, formState: { errors, isSubmitting }, watch, setValue } = form;

  // Watch name for validation
  const watchedName = watch('name');
  const selectedParentId = watch('parentGroupId');

  // Name uniqueness validation
  const { data: isNameUnique } = useDeviceGroupNameValidation(
    watchedName || '',
    selectedParentId,
    group?.id,
    {
      enabled: !!watchedName && watchedName.length >= 2,
      staleTime: 2000,
    }
  );

  // Reset form when group changes
  useEffect(() => {
    if (group) {
      setValue('name', group.name);
      setValue('description', group.description || '');
      setValue('parentGroupId', group.parentId);
    } else if (parentGroup) {
      setValue('parentGroupId', parentGroup.id);
    }
  }, [group, parentGroup, setValue]);

  const onFormSubmit = async (data: DeviceGroupFormData) => {
    try {
      if (mode === 'edit' && group) {
        const updateData: UpdateDeviceGroupRequest = {
          name: data.name,
        };
        if (data.description) {
          updateData.description = data.description;
        }
        if (data.parentGroupId !== undefined) {
          updateData.parentGroupId = data.parentGroupId;
        }
        await updateMutation.mutateAsync({ id: group.id, data: updateData });
      } else {
        const createData: CreateDeviceGroupRequest = {
          name: data.name,
        };
        if (data.description) {
          createData.description = data.description;
        }
        if (data.parentGroupId !== undefined) {
          createData.parentGroupId = data.parentGroupId;
        }
        await createMutation.mutateAsync(createData);
      }
    } catch (error) {
      // Error is handled by mutation error callbacks
      console.error('Form submission error:', error);
    }
  };

  const isLoading = isSubmitting || createMutation.isLoading || updateMutation.isLoading;
  const isEditing = mode === 'edit';
  const title = isEditing 
    ? `Edit "${group?.name}"` 
    : parentGroup 
      ? `Add Subgroup to "${parentGroup.name}"` 
      : 'Create New Group';

  // Filter available parents to exclude current group and its descendants
  const filteredParents = availableParents.filter(parent => {
    if (group && parent.id === group.id) return false;
    if (group && parent.path?.startsWith(group.path + '/')) return false;
    return true;
  });

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
      <form onSubmit={handleSubmit(data => onFormSubmit(data as unknown as DeviceGroupFormData))} className="space-y-6">
        {/* Group Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Group Name *
          </label>
          <input
            type="text"
            {...register('name')}
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
              {errors.name.message}
            </p>
          )}
          {watchedName && watchedName.length >= 2 && isNameUnique === false && (
            <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 flex items-start">
              <span className="inline-block w-4 h-4 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 text-xs leading-4 text-center mr-2 mt-0.5">!</span>
              This name is already used in the selected location
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
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
                {errors.description.message}
              </p>
            ) : (
              <span></span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {watch('description')?.length || 0}/500
            </span>
          </div>
        </div>

        {/* Parent Group */}
        {!parentGroup && filteredParents.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Parent Group
            </label>
            <select
              {...register('parentGroupId', { 
                setValueAs: value => value === '' ? undefined : Number(value)
              })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 hover:border-gray-400 dark:hover:border-gray-500"
              disabled={isLoading}
            >
              <option value="">None (Root Group)</option>
              {filteredParents.map((parent) => (
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