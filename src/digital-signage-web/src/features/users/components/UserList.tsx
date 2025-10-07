/**
 * Enhanced UserList Component
 * Displays users in a virtualized data table with advanced search, bulk selection, and CRUD actions
 * 
 * @see copilot-instructions-ui.instructions.md - React Query patterns
 * Enhanced with:
 * - Virtualization for large user lists (>100 users)
 * - Advanced search with debouncing
 * - Bulk selection and operations
 * - Real-time updates
 * - Mobile-responsive design
 */

'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  MoreVertical,
  Edit2, 
  Edit,
  Trash2, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Filter,
  ChevronDown,
  Square,
  CheckSquare,
  Calendar,
  Mail,
  Phone,
  Clock,
  UserX,
  XCircle,
  CheckCircle,
  Ban,
  X,
  UserCheck,
  Key
} from 'lucide-react';
import { DataTable, DataTableColumn } from '@/components/tables/DataTable';
import { useUsers, useDeleteUser, useActivateUser, useDeactivateUser, useResetUserPassword } from '../hooks/useUsers';
import { useUserFilters, useBulkAssignSchedules, useBulkRemoveScheduleAssignments } from '../hooks/useUsers';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { useConflictDetection } from '@/hooks/useConflictDetection';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { useDebounce } from '@/hooks/useDebounce';
import { useViewport } from '@/lib/mobile-utils';
import { MobileTable, MobileSearch, MobilePagination, MobileDrawer, TouchButton } from '@/components/mobile/MobileComponents';
import { userService } from '../services/userService';
import type { User, CreateUserRequest, UpdateUserRequest, UserFilters } from '../types';

interface UserListProps {
  onUserSelect?: (user: User) => void;
  onCreateUser?: () => void;
  onEditUser?: (user: User) => void;
  onBulkAssignSchedules?: (userIds: number[], scheduleIds: number[]) => void;
  onBulkRemoveAssignments?: (userIds: number[], assignmentIds: number[]) => void;
  enableBulkOperations?: boolean;
  enableVirtualization?: boolean;
  enableConflictDetection?: boolean;
  enableRealTimeUpdates?: boolean;
  maxHeight?: number;
  className?: string;
}

/**
 * Enhanced UserList Component
 * Comprehensive user management table with advanced features, bulk operations, and real-time updates
 */
export function UserList({
  onUserSelect,
  onCreateUser,
  onEditUser,
  onBulkAssignSchedules,
  onBulkRemoveAssignments,
  enableBulkOperations = true,
  enableVirtualization = true,
  enableConflictDetection = true,
  enableRealTimeUpdates = false,
  maxHeight = 600,
  className = '',
}: UserListProps) {
  const router = useRouter();
  const { filters, updateFilters, resetFilters } = useUserFilters();
  const { data: usersResponse, isLoading, error } = useUsers(filters);
  const deleteUserMutation = useDeleteUser();
  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();
  const resetPasswordMutation = useResetUserPassword();

  // Enhanced state management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [actionMenuUserId, setActionMenuUserId] = useState<number | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [bulkActionMenuOpen, setBulkActionMenuOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Mobile responsiveness
  const viewport = useViewport();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileBulkActionsOpen, setMobileBulkActionsOpen] = useState(false);

  // Bulk operations hooks
  const bulkAssignSchedules = useBulkAssignSchedules();
  const bulkRemoveAssignments = useBulkRemoveScheduleAssignments();

  // Real-time updates
  const { connect, disconnect, events, connectionState } = useRealTimeUpdates({
    autoConnect: false, // Manual connection to prevent race conditions
    subscriptions: {
      users: true,
      conflicts: enableConflictDetection,
    },
    connectionId: 'user-list',
    preventMultipleConnections: true,
  });

  // Conflict detection
  const { state: conflictState } = useConflictDetection({
    refreshInterval: enableConflictDetection ? 30000 : 0,
    filters: {
      userIds: Array.from(selectedUserIds).map(id => id.toString()),
    },
  });

  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination;

  // Handle search with debounce - use debouncedSearchQuery
  useEffect(() => {
    updateFilters({ search: debouncedSearchQuery, page: 1 });
  }, [debouncedSearchQuery, updateFilters]);

  // Manual connection management to prevent race conditions
  useEffect(() => {
    if (enableRealTimeUpdates && !connectionState.isConnected && !connectionState.isConnecting) {
      console.log('UserList: Initiating SignalR connection...')
      const connectTimer = setTimeout(() => {
        connect()
      }, 500) // Delay to let other components mount first
      
      return () => clearTimeout(connectTimer)
    }
    return () => {} // Return empty cleanup when condition is not met
  }, [enableRealTimeUpdates, connectionState.isConnected, connectionState.isConnecting, connect]);

  // Bulk selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedUserIds.size === users.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(users.map((user: User) => user.userId)));
    }
  }, [users, selectedUserIds.size]);

  const handleSelectUser = useCallback((userId: number) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUserIds(new Set());
  }, []);

  // Enhanced filtering with conflict detection
  const filteredUsers = useMemo(() => {
    if (!enableConflictDetection) return users;
    
    return users.map((user: User) => ({
      ...user,
      hasConflicts: conflictState.conflicts.some(conflict => 
        conflict.affectedUsers.some(affectedUser => affectedUser.id?.toString() === user.userId.toString())
      ),
    }));
  }, [users, conflictState.conflicts, enableConflictDetection]);

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
  const handleDeleteUser = async (userId: number) => {
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
        await deactivateUserMutation.mutateAsync(user.userId);
      } else {
        await activateUserMutation.mutateAsync(user.userId);
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleResetPassword = async (userId: number) => {
    if (!confirm('Generate a temporary password for this user?')) return;
    
    try {
      const result = await resetPasswordMutation.mutateAsync(userId);
      alert(`Temporary password: ${result.temporaryPassword}\n\nPlease save this password and send it to the user securely.`);
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  // Bulk operations handlers
  const handleBulkAssignSchedules = useCallback(async (scheduleIds: number[]) => {
    const userIds = Array.from(selectedUserIds);
    if (userIds.length === 0) return;

    try {
      await bulkAssignSchedules.mutateAsync({
        userIds,
        scheduleIds,
        assignmentSettings: {
          priority: 1,
          allowConflicts: false,
          replaceExisting: false,
          notes: `Bulk assignment of ${scheduleIds.length} schedules to ${userIds.length} users`,
        },
      });
      clearSelection();
      onBulkAssignSchedules?.(userIds, scheduleIds);
    } catch (error) {
      console.error('Failed to bulk assign schedules:', error);
    }
  }, [selectedUserIds, bulkAssignSchedules, clearSelection, onBulkAssignSchedules]);

  const handleBulkRemoveAssignments = useCallback(async (scheduleIds: number[]) => {
    const userIds = Array.from(selectedUserIds);
    if (userIds.length === 0) return;

    try {
      await bulkRemoveAssignments.mutateAsync({ userIds, scheduleIds });
      clearSelection();
      onBulkRemoveAssignments?.(userIds, scheduleIds);
    } catch (error) {
      console.error('Failed to bulk remove assignments:', error);
    }
  }, [selectedUserIds, bulkRemoveAssignments, clearSelection, onBulkRemoveAssignments]);

  const handleBulkActivate = useCallback(async () => {
    const userIds = Array.from(selectedUserIds);
    if (userIds.length === 0) return;

    if (!confirm(`Activate ${userIds.length} selected users?`)) return;

    try {
      await Promise.all(userIds.map(userId => activateUserMutation.mutateAsync(userId)));
      clearSelection();
    } catch (error) {
      console.error('Failed to bulk activate users:', error);
    }
  }, [selectedUserIds, activateUserMutation, clearSelection]);

  const handleBulkDeactivate = useCallback(async () => {
    const userIds = Array.from(selectedUserIds);
    if (userIds.length === 0) return;

    if (!confirm(`Deactivate ${userIds.length} selected users?`)) return;

    try {
      await Promise.all(userIds.map(userId => deactivateUserMutation.mutateAsync(userId)));
      clearSelection();
    } catch (error) {
      console.error('Failed to bulk deactivate users:', error);
    }
  }, [selectedUserIds, deactivateUserMutation, clearSelection]);

  // Define table columns with enhanced features
  const columns: DataTableColumn<User>[] = [
    // Bulk selection column
    ...(enableBulkOperations ? [{
      key: 'select' as keyof User,
      header: '',
      sortable: false,
      width: '60px',
      className: 'text-center',
      render: (_: any, user: User) => (
        <div className="flex items-center">
          <button
            onClick={() => handleSelectUser(user.userId)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label={`${selectedUserIds.has(user.userId) ? 'Deselect' : 'Select'} user ${user.fullName}`}
          >
            {selectedUserIds.has(user.userId) ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      ),
    }] : []),
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
          {user.role}
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
            onClick={() => setActionMenuUserId(actionMenuUserId === user.userId ? null : user.userId)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="User actions"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {actionMenuUserId === user.userId && (
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
                    router.push(`/users/${user.userId}/schedules`);
                    setActionMenuUserId(null);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Schedules
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
                    handleResetPassword(user.userId);
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
                    handleDeleteUser(user.userId);
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

  // Mobile card render function
  const renderUserCard = useCallback((user: User, index: number) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user.fullName?.[0] || user.email?.[0] || 'U'}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user.fullName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.isActive 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
          {enableBulkOperations && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectUser(user.userId);
              }}
              className="p-1"
            >
              {selectedUserIds.has(user.userId) ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{user.role || 'No role assigned'}</span>
        <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
      </div>
    </div>
  ), [selectedUserIds, enableBulkOperations, handleSelectUser]);

  return (
    <div className={className}>
      {/* Mobile Header */}
      {viewport.isMobile ? (
        <div className="mb-6 space-y-4">
          {/* Mobile Search and Actions */}
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <MobileSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search users..."
                onClear={() => setSearchQuery('')}
              />
            </div>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={onCreateUser}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Selected Count */}
          {enableBulkOperations && selectedUserIds.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedUserIds.size} selected
              </span>
              <button
                onClick={() => setMobileBulkActionsOpen(true)}
                className="text-sm text-blue-600 dark:text-blue-400 font-medium"
              >
                Actions
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Header */
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
      )}

      {/* Bulk Operations Bar */}
      {enableBulkOperations && selectedUserIds.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
                aria-label={selectedUserIds.size === users.length ? 'Deselect all' : 'Select all'}
              >
                {selectedUserIds.size === users.length ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedUserIds.size} user{selectedUserIds.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkActivate}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Activate
              </button>
              <button
                onClick={handleBulkDeactivate}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Deactivate
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile/Desktop Data Rendering */}
      {viewport.isMobile ? (
        <div className="space-y-4">
          {/* Mobile List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : users?.length ? (
            <div className="space-y-3">
              {users.map((user: User, index: number) => (
                <div
                  key={user.userId}
                  onClick={() => onUserSelect?.(user)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700 cursor-pointer"
                >
                  {renderUserCard(user, index)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {error
                  ? 'Failed to load users. Please try again.'
                  : searchQuery || selectedRole !== 'all' || selectedStatus !== 'all'
                  ? 'No users match the selected filters.'
                  : 'No users found. Create your first user to get started.'}
              </p>
            </div>
          )}

          {/* Mobile Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <MobilePagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => updateFilters({ page })}
            />
          )}
        </div>
      ) : (
        /* Desktop Data Table */
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
      )}

      {/* Mobile Filters Drawer */}
      <MobileDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filter Users"
      >
        <div className="space-y-6 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <TouchButton
              onClick={() => {
                setSelectedRole('all');
                setSelectedStatus('all');
                setSearchQuery('');
                resetFilters();
              }}
              variant="outline"
              className="flex-1"
            >
              Clear
            </TouchButton>
            <TouchButton
              onClick={() => {
                const updates: Partial<UserFilters> = {};
                if (selectedRole !== 'all') {
                  updates.role = [selectedRole];
                }
                if (selectedStatus !== 'all') {
                  updates.status = [selectedStatus as 'active' | 'inactive'];
                }
                updateFilters(updates);
                setMobileFiltersOpen(false);
              }}
              className="flex-1"
            >
              Apply
            </TouchButton>
          </div>
        </div>
      </MobileDrawer>

      {/* Mobile Bulk Actions Drawer */}
      <MobileDrawer
        isOpen={mobileBulkActionsOpen}
        onClose={() => setMobileBulkActionsOpen(false)}
        title={`Actions (${selectedUserIds.size} selected)`}
      >
        <div className="space-y-3 p-4">
          <TouchButton
            onClick={() => {
              // Handle bulk assign schedules
              onBulkAssignSchedules?.(Array.from(selectedUserIds), []);
              setMobileBulkActionsOpen(false);
            }}
            variant="outline"
            className="w-full justify-start"
            disabled={!onBulkAssignSchedules}
          >
            <Calendar className="w-4 h-4 mr-3" />
            Assign Schedules
          </TouchButton>
          
          <TouchButton
            onClick={() => {
              // Handle bulk remove assignments
              onBulkRemoveAssignments?.(Array.from(selectedUserIds), []);
              setMobileBulkActionsOpen(false);
            }}
            variant="outline"
            className="w-full justify-start"
            disabled={!onBulkRemoveAssignments}
          >
            <XCircle className="w-4 h-4 mr-3" />
            Remove Assignments
          </TouchButton>

          <TouchButton
            onClick={() => {
              // Handle bulk activate
              selectedUserIds.forEach(userId => {
                activateUserMutation.mutate(userId);
              });
              setSelectedUserIds(new Set());
              setMobileBulkActionsOpen(false);
            }}
            variant="outline"
            className="w-full justify-start"
          >
            <CheckCircle className="w-4 h-4 mr-3" />
            Activate Users
          </TouchButton>

          <TouchButton
            onClick={() => {
              // Handle bulk deactivate
              selectedUserIds.forEach(userId => {
                deactivateUserMutation.mutate(userId);
              });
              setSelectedUserIds(new Set());
              setMobileBulkActionsOpen(false);
            }}
            variant="outline"
            className="w-full justify-start"
          >
            <Ban className="w-4 h-4 mr-3" />
            Deactivate Users
          </TouchButton>

          <TouchButton
            onClick={() => {
              setSelectedUserIds(new Set());
              setMobileBulkActionsOpen(false);
            }}
            variant="outline"
            className="w-full justify-start"
          >
            <X className="w-4 h-4 mr-3" />
            Clear Selection
          </TouchButton>
        </div>
      </MobileDrawer>
    </div>
  );
}
