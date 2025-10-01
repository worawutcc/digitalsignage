/**
 * UserList Component
 * Displays users in a data table with search, filters, and CRUD actions
 */

'use client';

import React from 'react';
import { Search, UserPlus, MoreVertical, Edit, Trash2, Key, UserCheck, UserX } from 'lucide-react';
import { DataTable, DataTableColumn } from '@/components/tables/DataTable';
import { useUsers, useDeleteUser, useActivateUser, useDeactivateUser, useResetUserPassword } from '../hooks/useUsers';
import { useUserFilters } from '../hooks/useUsers';
import { userService } from '../services/userService';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types';

interface UserListProps {
  onUserSelect?: (user: User) => void;
  onCreateUser?: () => void;
  onEditUser?: (user: User) => void;
  className?: string;
}

/**
 * UserList Component
 * Comprehensive user management table with filters and actions
 */
export function UserList({
  onUserSelect,
  onCreateUser,
  onEditUser,
  className = '',
}: UserListProps) {
  const { filters, updateFilters, resetFilters } = useUserFilters();
  const { data: usersResponse, isLoading, error } = useUsers(filters);
  const deleteUserMutation = useDeleteUser();
  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();
  const resetPasswordMutation = useResetUserPassword();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [actionMenuUserId, setActionMenuUserId] = React.useState<string | null>(null);

  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination;

  // Handle search with debounce
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters({ search: searchQuery, page: 1 });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, updateFilters]);

  // Handle filter changes
  const handleRoleFilterChange = (value: string) => {
    setSelectedRole(value);
    if (value === 'all') {
      const { role, ...rest } = filters;
      updateFilters({ ...rest, page: 1 });
    } else {
      updateFilters({ role: [value], page: 1 });
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setSelectedStatus(value);
    if (value === 'all') {
      const { status, ...rest } = filters;
      updateFilters({ ...rest, page: 1 });
    } else {
      updateFilters({ status: [value as 'active' | 'inactive'], page: 1 });
    }
  };

  // Action handlers
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      if (user.isActive) {
        await deactivateUserMutation.mutateAsync(user.id);
      } else {
        await activateUserMutation.mutateAsync(user.id);
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Generate a temporary password for this user?')) return;
    
    try {
      const result = await resetPasswordMutation.mutateAsync(userId);
      alert(`Temporary password: ${result.temporaryPassword}\n\nPlease save this password and send it to the user securely.`);
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  // Define table columns
  const columns: DataTableColumn<User>[] = [
    {
      key: 'username',
      header: 'Username',
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </span>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'firstName',
      header: 'Name',
      sortable: true,
      render: (_, user) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {userService.getUserFullName(user)}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (_, user) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {user.role.name}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (_, user) => {
        const badge = userService.getUserStatusBadge(user);
        const colorClasses = {
          success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[badge.variant]}`}>
            {badge.label}
          </span>
        );
      },
    },
    {
      key: 'lastLoginAt',
      header: 'Last Login',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {userService.formatLastLogin(value)}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, user) => (
        <div className="relative">
          <button
            onClick={() => setActionMenuUserId(actionMenuUserId === user.id ? null : user.id)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="User actions"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {actionMenuUserId === user.id && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu">
                <button
                  onClick={() => {
                    onEditUser?.(user);
                    setActionMenuUserId(null);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </button>
                
                <button
                  onClick={() => {
                    handleToggleUserStatus(user);
                    setActionMenuUserId(null);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  {user.isActive ? (
                    <>
                      <UserX className="w-4 h-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Activate
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    handleResetPassword(user.id);
                    setActionMenuUserId(null);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </button>

                <button
                  onClick={() => {
                    handleDeleteUser(user.id);
                    setActionMenuUserId(null);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </button>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={className}>
      {/* Header with Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <button
            onClick={onCreateUser}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="role-1">Super Administrator</option>
              <option value="role-2">Administrator</option>
              <option value="role-3">Manager</option>
              <option value="role-4">Operator</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {(searchQuery || selectedRole !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('all');
                setSelectedStatus('all');
                resetFilters();
              }}
              className="mt-6 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={isLoading}
        {...(pagination && {
          pagination: {
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            pageSize: pagination.limit,
            onPageChange: (page) => updateFilters({ page }),
          },
        })}
        sorting={{
          sortBy: filters.sort || null,
          sortOrder: filters.order || 'desc',
          onSort: (key) => {
            const newOrder =
              filters.sort === key && filters.order === 'asc' ? 'desc' : 'asc';
            updateFilters({ sort: key, order: newOrder });
          },
        }}
        emptyMessage={
          error
            ? 'Failed to load users. Please try again.'
            : searchQuery || selectedRole !== 'all' || selectedStatus !== 'all'
            ? 'No users match the selected filters.'
            : 'No users found. Create your first user to get started.'
        }
        {...(onUserSelect && {
          onRowClick: (user: User) => onUserSelect(user),
        })}
        className="shadow-sm"
      />
    </div>
  );
}
