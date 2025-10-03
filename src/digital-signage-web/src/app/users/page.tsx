/**
 * User Management Page
 * Comprehensive user and role management interface with enhanced schedule assignment
 */

'use client';

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

import React from 'react';
import { Users, Shield, Calendar, Settings } from 'lucide-react';
import { UserList } from '@/features/users/components/UserList';
import { RoleManager } from '@/features/users/components/RoleManager';
import { UserScheduleAssignment } from '@/features/users/components/UserScheduleAssignment';
import type { User, UserRole } from '@/features/users/types';
import type { BulkOperation, BulkOperationResult, OptimisticUpdate, PerformanceMetric } from '@/types/enhanced-ui';

export default function UsersPage() {
  const [activeTab, setActiveTab] = React.useState<'users' | 'roles' | 'schedules'>('users');
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<UserRole | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = React.useState(false);
  const [showEditUserModal, setShowEditUserModal] = React.useState(false);
  
  // Enhanced state for schedule assignment
  const [bulkOperations, setBulkOperations] = React.useState<BulkOperation[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = React.useState<PerformanceMetric[]>([]);
  const [enhancedFeaturesEnabled, setEnhancedFeaturesEnabled] = React.useState(
    process.env.NEXT_PUBLIC_ENABLE_ENHANCED_UI === 'true'
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Enhanced Features Info */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                User Management
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Manage users, roles, and permissions for your digital signage system
              </p>
            </div>
            
            {enhancedFeaturesEnabled && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Enhanced UI Active
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Bulk ops • Virtual scroll • Optimistic updates
                  </div>
                </div>
                <button
                  onClick={() => setEnhancedFeaturesEnabled(false)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Disable
                </button>
              </div>
            )}
          </div>

          {/* Performance Metrics Dashboard (when enhanced features are active) */}
          {enhancedFeaturesEnabled && performanceMetrics.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Performance Metrics
                </h3>
                <button
                  onClick={() => setPerformanceMetrics([])}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  Clear
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {performanceMetrics.slice(-4).map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="font-medium text-blue-800 dark:text-blue-200">
                      {metric.value.toFixed(1)}{metric.unit}
                    </div>
                    <div className="text-blue-600 dark:text-blue-400">
                      {metric.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Bulk Operations */}
          {bulkOperations.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Active Bulk Operations ({bulkOperations.length})
              </h3>
              <div className="space-y-2">
                {bulkOperations.map((operation) => (
                  <div key={operation.id} className="flex items-center justify-between text-xs">
                    <span className="text-yellow-800 dark:text-yellow-200">
                      {operation.type}: {operation.selectedItems.length} items
                    </span>
                    <span className="text-yellow-600 dark:text-yellow-400">
                      In Progress...
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Tabs with Schedule Assignment */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
            >
              <Users className="w-5 h-5 mr-2" />
              Users
            </button>

            <button
              onClick={() => setActiveTab('schedules')}
              className={`${
                activeTab === 'schedules'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Assignment
              {enhancedFeaturesEnabled && (
                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Enhanced
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('roles')}
              className={`${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
            >
              <Shield className="w-5 h-5 mr-2" />
              Roles & Permissions
            </button>
          </nav>
        </div>

        {/* Tab Content with Enhanced Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {activeTab === 'users' && (
            <div className="p-6">
              <UserList
                onUserSelect={(user) => {
                  setSelectedUser(user);
                  setActiveTab('schedules'); // Switch to schedule assignment tab
                }}
                onCreateUser={() => setShowCreateUserModal(true)}
                onEditUser={(user) => {
                  setSelectedUser(user);
                  setShowEditUserModal(true);
                }}
              />
            </div>
          )}

          {activeTab === 'schedules' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  User Schedule Assignment
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Assign schedules to users with enhanced features for bulk operations and real-time feedback
                </p>
              </div>

              {selectedUser ? (
                <UserScheduleAssignment
                  userId={parseInt(selectedUser.id)}
                  user={{
                    id: parseInt(selectedUser.id),
                    name: `${selectedUser.firstName} ${selectedUser.lastName}`,
                    email: selectedUser.email,
                    role: selectedUser.role.name,
                  }}
                  onSchedulesUpdated={() => {
                    // Refresh user data if needed
                    console.log('Schedules updated for user:', selectedUser.id);
                  }}
                  // Enhanced props when enabled
                  {...(enhancedFeaturesEnabled && {
                    showLoadingSkeleton: true,
                    enableOptimisticUpdates: true,
                    showVisualPreview: true,
                    enableBulkOperations: true,
                    showAdvancedFilters: true,
                    enableDragDrop: true,
                    virtualScrolling: {
                      threshold: parseInt(process.env.NEXT_PUBLIC_VIRTUAL_SCROLLING_THRESHOLD || '50'),
                      itemHeight: 60,
                      overscan: 5,
                    },
                    enhancedAria: {
                      enabled: true,
                      announceUpdates: true,
                      detailedDescriptions: true,
                    },
                    onBulkOperationStart: (operation: BulkOperation) => {
                      setBulkOperations(prev => [...prev, operation]);
                      console.log('Bulk operation started:', operation);
                    },
                    onBulkOperationComplete: (result: BulkOperationResult) => {
                      setBulkOperations(prev => 
                        prev.filter(op => op.id !== result.operationId)
                      );
                      console.log('Bulk operation completed:', result);
                    },
                    onOptimisticUpdate: (update: OptimisticUpdate) => {
                      console.log('Optimistic update:', update);
                    },
                    onPerformanceMetric: (metric: PerformanceMetric) => {
                      setPerformanceMetrics(prev => [...prev.slice(-9), metric]);
                    },
                  })}
                />
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No user selected
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Select a user from the Users tab to manage their schedule assignments
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Users
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="p-6">
              <RoleManager
                onRoleSelect={(role) => setSelectedRole(role)}
                {...(selectedRole && { selectedRoleId: selectedRole.id })}
              />
            </div>
          )}
        </div>

        {/* Modals */}
        {showCreateUserModal && (
          <CreateUserModal
            onClose={() => setShowCreateUserModal(false)}
            onSuccess={() => {
              setShowCreateUserModal(false);
              // User list will auto-refresh via React Query
            }}
          />
        )}

        {showEditUserModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => {
              setShowEditUserModal(false);
              setSelectedUser(null);
            }}
            onSuccess={() => {
              setShowEditUserModal(false);
              setSelectedUser(null);
              // User list will auto-refresh via React Query
            }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Create User Modal Component
 */
interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roleId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement user creation logic
    console.log('Create user:', formData);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Create New User
              </h3>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select a role...</option>
                  <option value="role-2">Administrator</option>
                  <option value="role-3">Manager</option>
                  <option value="role-4">Operator</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * Edit User Modal Component
 */
interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const [formData, setFormData] = React.useState({
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roleId: user.role.id,
    isActive: user.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement user update logic
    console.log('Update user:', formData);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Edit User
              </h3>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="role-2">Administrator</option>
                  <option value="role-3">Manager</option>
                  <option value="role-4">Operator</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Active User
                </label>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
