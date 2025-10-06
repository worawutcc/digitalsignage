'use client';

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

import React from 'react';
import { useState } from 'react';
import { Plus, Folder, FolderOpen, Edit, Trash2, MoreVertical, Users } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DeviceGroupForm, type DeviceGroupFormData } from '@/components/forms/DeviceGroupForm';
import type { DeviceGroup } from '@/types/api';

// Mock data for development - matching API schema
const mockDeviceGroups: DeviceGroup[] = [
  {
    id: 1,
    name: 'Main Building',
    description: 'Devices in the main building',
    isActive: true,
    path: '/Main Building',
    level: 0,
    createdAt: new Date().toISOString(),
    devices: [],
    childGroups: [
      {
        id: 2,
        name: 'Lobby',
        description: 'Lobby displays',
        isActive: true,
        parentGroupId: 1,
        path: '/Main Building/Lobby',
        level: 1,
        createdAt: new Date().toISOString(),
        devices: [],
        childGroups: []
      },
      {
        id: 3,
        name: 'Meeting Rooms',
        description: 'Conference room displays',
        isActive: true,
        parentGroupId: 1,
        path: '/Main Building/Meeting Rooms',
        level: 1,
        createdAt: new Date().toISOString(),
        devices: [],
        childGroups: []
      }
    ]
  },
  {
    id: 4,
    name: 'Cafeteria',
    description: 'Food court and dining area displays',
    isActive: true,
    path: '/Cafeteria',
    level: 0,
    createdAt: new Date().toISOString(),
    devices: [],
    childGroups: []
  }
];

interface DeviceGroupNodeProps {
  group: DeviceGroup;
  level: number;
  onEdit: (group: DeviceGroup) => void;
  onDelete: (group: DeviceGroup) => void;
  onAddSubGroup: (parentGroup: DeviceGroup) => void;
}

/**
 * Device Group Tree Node Component  
 * Displays individual group with expand/collapse and actions
 */
function DeviceGroupNode({ group, level, onEdit, onDelete, onAddSubGroup }: DeviceGroupNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showActions, setShowActions] = useState(false);
  
  const deviceCount = group.devices?.length || 0;
  const childCount = group.childGroups?.length || 0;

  return (
    <div className="relative">
      {/* Group Row */}
      <div 
        className="flex items-center py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 group rounded-lg"
        style={{ marginLeft: `${level * 24}px` }}
      >
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${
          group.isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
          {group.isActive ? 'Active' : 'Inactive'}
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
      {isExpanded && group.childGroups && group.childGroups.map((childGroup) => (
        <DeviceGroupNode
          key={childGroup.id}
          group={childGroup}
          level={level + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSubGroup={onAddSubGroup}
        />
      ))}
    </div>
  );
}

/**
 * Device Groups Management Page
 * Provides hierarchical device group management with CRUD operations
 * Following copilot-instructions-ui.instructions.md guidelines
 */
export default function DeviceGroupsPage() {
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>(mockDeviceGroups);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DeviceGroup | null>(null);
  const [parentGroup, setParentGroup] = useState<DeviceGroup | null>(null);

  // Calculate stats
  const totalGroups = deviceGroups.reduce((count, group) => {
    const countChildGroups = (g: DeviceGroup): number => {
      return 1 + (g.childGroups?.reduce((sum, child) => sum + countChildGroups(child), 0) || 0);
    };
    return count + countChildGroups(group);
  }, 0);

  const totalDevices = deviceGroups.reduce((count, group) => {
    const countDevices = (g: DeviceGroup): number => {
      return (g.devices?.length || 0) + (g.childGroups?.reduce((sum, child) => sum + countDevices(child), 0) || 0);
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
    // TODO: Implement delete logic
    console.log('Delete group:', group);
  };

  const handleFormSubmit = (data: DeviceGroupFormData) => {
    console.log('Form submitted:', data);
    // TODO: Implement API call
    setShowCreateModal(false);
  };

  // Get all groups for parent selection (excluding editing group and its children)
  const getAvailableParents = (): DeviceGroup[] => {
    const flattenGroups = (groups: DeviceGroup[]): DeviceGroup[] => {
      return groups.reduce((acc, group) => {
        acc.push(group);
        if (group.childGroups) {
          acc.push(...flattenGroups(group.childGroups));
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
          >
            <Plus className="h-4 w-4" />
            <span>Create Group</span>
          </Button>
        </div>

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
                  {deviceGroups.filter(g => !g.parentGroupId).length}
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
            {deviceGroups.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No device groups created yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Create your first group to organize your devices
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {deviceGroups.filter(group => !group.parentGroupId).map((group) => (
                  <DeviceGroupNode
                    key={group.id}
                    group={group}
                    level={0}
                    onEdit={handleEditGroup}
                    onDelete={handleDeleteGroup}
                    onAddSubGroup={handleAddSubGroup}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <Modal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            size="lg"
            showCloseButton={false}
          >
            <DeviceGroupForm
              group={editingGroup}
              parentGroup={parentGroup}
              availableParents={getAvailableParents()}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowCreateModal(false)}
            />
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}