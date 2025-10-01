/**
 * RoleManager Component
 * Manages role assignment and role CRUD operations
 */

'use client';

import React from 'react';
import { Plus, Edit, Trash2, Users, Shield } from 'lucide-react';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '../hooks/useUsers';
import type { UserRole, CreateRoleRequest, UpdateRoleRequest } from '../types';
import { PermissionMatrix } from './PermissionMatrix';

interface RoleManagerProps {
  onRoleSelect?: (role: UserRole) => void;
  selectedRoleId?: string;
  className?: string;
}

/**
 * RoleManager Component
 * Displays list of roles with create, edit, delete capabilities
 */
export function RoleManager({
  onRoleSelect,
  selectedRoleId,
  className = '',
}: RoleManagerProps) {
  const { data: rolesResponse, isLoading, error } = useRoles();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<UserRole | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<UserRole | null>(null);

  const roles = rolesResponse || [];

  const handleCreateRole = React.useCallback(
    async (data: CreateRoleRequest) => {
      try {
        await createRoleMutation.mutateAsync(data);
        setShowCreateModal(false);
      } catch (error) {
        console.error('Failed to create role:', error);
      }
    },
    [createRoleMutation]
  );

  const handleUpdateRole = React.useCallback(
    async (id: string, data: UpdateRoleRequest) => {
      try {
        await updateRoleMutation.mutateAsync({ id, data });
        setEditingRole(null);
      } catch (error) {
        console.error('Failed to update role:', error);
      }
    },
    [updateRoleMutation]
  );

  const handleDeleteRole = React.useCallback(
    async (id: string) => {
      try {
        await deleteRoleMutation.mutateAsync(id);
        setShowDeleteConfirm(null);
      } catch (error) {
        console.error('Failed to delete role:', error);
      }
    },
    [deleteRoleMutation]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">
          Failed to load roles. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Role Management
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage user roles and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow ${
              selectedRoleId === role.id
                ? 'ring-2 ring-blue-500'
                : 'ring-1 ring-gray-200 dark:ring-gray-700'
            }`}
          >
            <div className="p-6">
              {/* Role Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {role.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Level {role.level}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingRole(role)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label="Edit role"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {role.userCount === 0 && (
                    <button
                      onClick={() => setShowDeleteConfirm(role)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      aria-label="Delete role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Role Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {role.description}
              </p>

              {/* Role Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{role.userCount || 0} users</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {role.permissions.length} permissions
                </div>
              </div>

              {/* Select Button */}
              {onRoleSelect && (
                <button
                  onClick={() => onRoleSelect(role)}
                  className="mt-4 w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Role Modal */}
      {(showCreateModal || editingRole) && (
        <RoleFormModal
          role={editingRole}
          onClose={() => {
            setShowCreateModal(false);
            setEditingRole(null);
          }}
          onSubmit={(data) => {
            if (editingRole) {
              handleUpdateRole(editingRole.id, data);
            } else {
              handleCreateRole(data as CreateRoleRequest);
            }
          }}
          isSubmitting={createRoleMutation.isPending || updateRoleMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          role={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => handleDeleteRole(showDeleteConfirm.id)}
          isDeleting={deleteRoleMutation.isPending}
        />
      )}
    </div>
  );
}

/**
 * Role Form Modal Component
 */
interface RoleFormModalProps {
  role: UserRole | null;
  onClose: () => void;
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => void;
  isSubmitting: boolean;
}

function RoleFormModal({ role, onClose, onSubmit, isSubmitting }: RoleFormModalProps) {
  const [formData, setFormData] = React.useState<CreateRoleRequest>({
    name: role?.name || '',
    description: role?.description || '',
    level: role?.level || 4,
    permissions: role?.permissions.map(p => ({ resource: p.resource, action: p.action })) || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handlePermissionChange = (permissions: Array<{ resource: string; action: string }>) => {
    setFormData((prev) => ({ ...prev, permissions }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {role ? 'Edit Role' : 'Create New Role'}
              </h3>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Access Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value={1}>Super Administrator (Level 1)</option>
                  <option value={2}>Administrator (Level 2)</option>
                  <option value={3}>Manager (Level 3)</option>
                  <option value={4}>Operator (Level 4)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissions
                </label>
                <PermissionMatrix
                  role={{
                    ...role,
                    id: role?.id || 'new',
                    name: formData.name,
                    description: formData.description,
                    level: formData.level,
                    permissions: formData.permissions.map(p => ({ ...p, id: `${p.resource}-${p.action}` })),
                    createdAt: role?.createdAt || new Date().toISOString(),
                  }}
                  onPermissionChange={handlePermissionChange}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * Delete Confirmation Modal
 */
interface DeleteConfirmModalProps {
  role: UserRole;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DeleteConfirmModal({ role, onClose, onConfirm, isDeleting }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Delete Role
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete the role &quot;{role.name}&quot;? This action cannot be undone.
            </p>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
