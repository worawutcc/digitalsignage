'use client';

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

import React from 'react';
import { useState } from 'react';
import { Plus, Folder, FolderOpen, Edit, Trash2, MoreVertical, Users, GripVertical } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DeviceGroupForm } from '@/components/forms/DeviceGroupForm';
import type { DeviceGroupFormData } from '@/lib/validations/deviceGroup.schema';
import type { DeviceGroup } from '@/types/deviceGroup.types';
import { useDeviceGroups } from '@/hooks/useDeviceGroups';
import { useCreateDeviceGroup } from '@/hooks/useCreateDeviceGroup';
import { useUpdateDeviceGroup } from '@/hooks/useUpdateDeviceGroup';
import { useDeleteDeviceGroup } from '@/hooks/useDeleteDeviceGroup';



interface DeviceGroupNodeProps {
  group: DeviceGroup;
  level: number;
  onEdit: (group: DeviceGroup) => void;
  onDelete: (group: DeviceGroup) => void;
  onAddSubGroup: (parentGroup: DeviceGroup) => void;
  onMove: (groupId: number, newParentId?: number) => void;
}

/**
 * Sortable Device Group Tree Node Component  
 * Displays individual group with expand/collapse, drag-and-drop, and actions
 */
function DeviceGroupNode({ group, level, onEdit, onDelete, onAddSubGroup, onMove }: DeviceGroupNodeProps) {
  const [isExpanded, setIsExpanded] = useState(group.isExpanded ?? true);
  const [showActions, setShowActions] = useState(false);
  
  const deviceCount = group.deviceCount || 0;
  const childCount = group.childGroupCount || 0;

  // DnD Kit sortable functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    data: {
      type: 'DeviceGroup',
      group,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="relative"
    >
      {/* Group Row */}
      <div 
        className={`flex items-center py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 group rounded-lg border transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-transparent'
        }`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {/* Drag Handle */}
        <button
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-2"
          disabled={childCount === 0}
        >
          {childCount > 0 ? (
            isExpanded ? <FolderOpen className="h-4 w-4 text-blue-600" /> : <Folder className="h-4 w-4 text-blue-600" />
          ) : (
            <Folder className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {/* Group Info */}
        <div className="flex-1">
          <div className="flex items-center">
            <h4 className="font-medium text-gray-900 dark:text-white">{group.name}</h4>
            <span className="ml-2 text-sm text-gray-500">
              ({deviceCount} devices{childCount > 0 ? `, ${childCount} subgroups` : ''})
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{group.description}</p>
        </div>

        {/* Status Badge */}
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Active
        </span>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showActions && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit(group);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Group
                </button>
                <button
                  onClick={() => {
                    onAddSubGroup(group);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subgroup
                </button>
                <button
                  onClick={() => {
                    onDelete(group);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Group
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Child Groups */}
      {isExpanded && group.children && group.children.length > 0 && (
        <SortableContext 
          items={group.children.map(child => child.id)} 
          strategy={verticalListSortingStrategy}
        >
          {group.children.map((childGroup) => (
            <DeviceGroupNode
              key={childGroup.id}
              group={childGroup}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubGroup={onAddSubGroup}
              onMove={onMove}
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
}

/**
 * Device Groups Management Page
 * Provides hierarchical device group management with CRUD operations
 * Following copilot-instructions-ui.instructions.md guidelines
 */
export default function DeviceGroupsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DeviceGroup | null>(null);
  const [parentGroup, setParentGroup] = useState<DeviceGroup | null>(null);
  
  // Use React Query hook for device groups data
  const { 
    data: deviceGroups = [], 
    isLoading, 
    error, 
    refetch 
  } = useDeviceGroups();

  // React Query mutations for CRUD operations
  const createDeviceGroupMutation = useCreateDeviceGroup({ enableOptimisticUpdate: true });
  const updateDeviceGroupMutation = useUpdateDeviceGroup({ enableOptimisticUpdate: true });
  const deleteDeviceGroupMutation = useDeleteDeviceGroup({ enableOptimisticUpdate: true });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate stats
  const totalGroups = deviceGroups.reduce((count, group) => {
    const countChildGroups = (g: DeviceGroup): number => {
      return 1 + (g.children?.reduce((sum: number, child: DeviceGroup) => sum + countChildGroups(child), 0) || 0);
    };
    return count + countChildGroups(group);
  }, 0);

  const totalDevices = deviceGroups.reduce((count, group) => {
    const countDevices = (g: DeviceGroup): number => {
      return g.deviceCount + (g.children?.reduce((sum: number, child: DeviceGroup) => sum + countDevices(child), 0) || 0);
    };
    return count + countDevices(group);
  }, 0);

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setParentGroup(null);
    setShowCreateModal(true);
  };

  const handleEditGroup = (group: DeviceGroup) => {
    setEditingGroup(group);
    setParentGroup(null);
    setShowCreateModal(true);
  };

  const handleAddSubGroup = (parent: DeviceGroup) => {
    setEditingGroup(null);
    setParentGroup(parent);
    setShowCreateModal(true);
  };

  const handleDeleteGroup = (group: DeviceGroup) => {
    if (!confirm(`Are you sure you want to delete "${group.name}"? This action cannot be undone.`)) {
      return;
    }
    
    deleteDeviceGroupMutation.mutate(group.id, {
      onSuccess: () => {
        console.log('Device group deleted successfully');
        // TODO: Show success toast notification
      },
      onError: (error) => {
        console.error('Failed to delete device group:', error);
        alert(`Failed to delete device group: ${error instanceof Error ? error.message : 'Unknown error'}`);
      },
    });
  };

  const handleFormSubmit = (data: DeviceGroupFormData) => {
    // Transform form data to API request format
    const requestData = {
      name: data.name,
      ...(data.description && { description: data.description }),
      ...(data.parentGroupId && { parentGroupId: data.parentGroupId }),
    };

    if (editingGroup) {
      // Update existing group
      updateDeviceGroupMutation.mutate(
        { id: editingGroup.id, data: requestData as any },
        {
          onSuccess: () => {
            setShowEditModal(false);
            setEditingGroup(null);
            setParentGroup(null);
          },
          onError: (error) => {
            console.error('Failed to update device group:', error);
            alert(`Failed to update device group: ${error instanceof Error ? error.message : 'Unknown error'}`);
          },
        }
      );
    } else {
      // Create new group
      createDeviceGroupMutation.mutate(requestData as any, {
        onSuccess: () => {
          setShowCreateModal(false);
          setParentGroup(null);
          console.log('Device group created successfully');
        },
        onError: (error) => {
          console.error('Failed to create device group:', error);
          alert(`Failed to create device group: ${error instanceof Error ? error.message : 'Unknown error'}`);
        },
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over?.id) {
      // Get the active group data
      const activeGroup = deviceGroups.find(g => g.id === active.id);
      const overGroup = deviceGroups.find(g => g.id === over.id);
      
      if (activeGroup && overGroup) {
        // Move the active group to be a sibling of the over group
        // or as a child if it's dropped on a parent
        const newParentId = overGroup.parentId;
        
        console.log(`Moving group "${activeGroup.name}" to be sibling of "${overGroup.name}"`);
        handleMoveGroup(activeGroup.id, newParentId);
      }
    }
  };

  const handleMoveGroup = (groupId: number, newParentId?: number) => {
    const moveData = {
      ...(newParentId && { parentGroupId: newParentId }),
    };

    updateDeviceGroupMutation.mutate(
      { id: groupId, data: moveData as any },
      {
        onSuccess: () => {
          console.log('Device group moved successfully');
          // TODO: Show success toast notification
        },
        onError: (error) => {
          console.error('Failed to move device group:', error);
          alert(`Failed to move device group: ${error instanceof Error ? error.message : 'Unknown error'}`);
        },
      }
    );
  };

  // Toggle expand/collapse for a specific group
  const toggleGroupExpansion = (groupId: number) => {
    // TODO: Implement local state management for expanded groups
    // This could be stored in localStorage or component state
    console.log('Toggle expansion for group:', groupId);
  };

  // Get all groups for parent selection (excluding editing group and its children)
  const getAvailableParents = (): DeviceGroup[] => {
    const flattenGroups = (groups: DeviceGroup[]): DeviceGroup[] => {
      return groups.reduce((acc, group) => {
        acc.push(group);
        if (group.children) {
          acc.push(...flattenGroups(group.children));
        }
        return acc;
      }, [] as DeviceGroup[]);
    };

    return flattenGroups(deviceGroups).filter(group => {
      // Don't include the group being edited or its children
      if (editingGroup && (group.id === editingGroup.id || group.path.startsWith(editingGroup.path + '/'))) {
        return false;
      }
      return true;
    });
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Device Groups</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Organize your devices into hierarchical groups for better management
            </p>
          </div>
          <Button
            onClick={handleCreateGroup}
            className="flex items-center space-x-2"
            disabled={createDeviceGroupMutation.isPending || updateDeviceGroupMutation.isPending || deleteDeviceGroupMutation.isPending}
          >
            <Plus className="h-4 w-4" />
            <span>Create Group</span>
          </Button>
        </div>

        {/* Operation Status */}
        {(createDeviceGroupMutation.isPending || updateDeviceGroupMutation.isPending || deleteDeviceGroupMutation.isPending) && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-800 dark:text-blue-200">
                {createDeviceGroupMutation.isPending && 'Creating device group...'}
                {updateDeviceGroupMutation.isPending && 'Updating device group...'}
                {deleteDeviceGroupMutation.isPending && 'Deleting device group...'}
              </span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Folder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Groups</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalGroups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Devices</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalDevices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <FolderOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Root Groups</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {deviceGroups.filter(g => !g.parentId).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Device Groups Tree */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Group Hierarchy</h3>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading device groups...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600 dark:text-red-400 mb-2">Failed to load device groups</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            ) : deviceGroups.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No device groups created yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Create your first group to organize your devices
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={updateDeviceGroupMutation.isPending ? () => {} : handleDragEnd}
              >
                <SortableContext 
                  items={deviceGroups.filter(group => !group.parentId).map(group => group.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={`space-y-1 ${
                    (updateDeviceGroupMutation.isPending || deleteDeviceGroupMutation.isPending) 
                      ? 'pointer-events-none opacity-60' 
                      : ''
                  }`}>
                    {deviceGroups.filter(group => !group.parentId).map((group) => (
                      <DeviceGroupNode
                        key={group.id}
                        group={group}
                        level={0}
                        onEdit={handleEditGroup}
                        onDelete={handleDeleteGroup}
                        onAddSubGroup={handleAddSubGroup}
                        onMove={handleMoveGroup}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <Modal
            isOpen={showCreateModal || showEditModal}
            onClose={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              setEditingGroup(null);
              setParentGroup(null);
            }}
            size="lg"
            showCloseButton={false}
          >
            <DeviceGroupForm
              group={editingGroup}
              parentGroup={parentGroup}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowCreateModal(false);
                setShowEditModal(false);  
                setEditingGroup(null);
                setParentGroup(null);
              }}
              mode={editingGroup ? 'edit' : 'create'}
            />
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}