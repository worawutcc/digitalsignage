/**
 * User Management Page
 * Uses real userService and userPermissionService APIs
 * Comprehensive user and role management interface with enhanced schedule assignment
 */

'use client';

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

import React from 'react';
import { Users, Shield, Calendar, Settings, Zap, Layers, Loader2 } from 'lucide-react';
import { UserList } from '@/features/users/components/UserList';
import { RoleManager } from '@/features/users/components/RoleManager';
import { UserScheduleAssignment } from '@/features/users/components/UserScheduleAssignment';
import { CreateUserModal } from '@/features/users/components/CreateUserModal';
import { useQuery } from '@tanstack/react-query';
import { userService, userPermissionService } from '@/services';
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
  const [showBulkOperationsPanel, setShowBulkOperationsPanel] = React.useState(false);

  // Real API data fetching with React Query
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
    error: usersError
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
    refetchInterval: 60000, // Refresh every minute
  });

  const {
    data: userPermissions = [],
    isLoading: isLoadingPermissions,
    refetch: refetchPermissions
  } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: () => userPermissionService.getMyPermissions(),
    refetchInterval: 60000,
  });

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
          {/* Enhanced Performance Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {/* Performance Metrics */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Performance</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400">Live</span>
                </div>
              </div>
              {performanceMetrics.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Avg Response</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(
                        performanceMetrics.reduce((acc, m) => acc + m.value, 0) / 
                        performanceMetrics.length
                      )}ms
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Operations</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {performanceMetrics.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setPerformanceMetrics([])}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    Clear History
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  No metrics yet
                </div>
              )}
            </div>

            {/* Enhanced Features Toggle */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Features</h3>
                <Zap className={`w-4 h-4 ${enhancedFeaturesEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Enhanced Mode</span>
                  <button
                    onClick={() => setEnhancedFeaturesEnabled(!enhancedFeaturesEnabled)}
                    className={`${
                      enhancedFeaturesEnabled 
                        ? 'bg-blue-600' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        enhancedFeaturesEnabled ? 'translate-x-5' : 'translate-x-1'
                      } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                    />
                  </button>
                </div>
                {enhancedFeaturesEnabled && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    ✓ Bulk ops, real-time updates, advanced filters
                  </div>
                )}
              </div>
            </div>

            {/* Quick Navigation Actions */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                <Settings className="w-4 h-4 text-gray-500" />
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left text-xs flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    activeTab === 'users' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Users className="w-3 h-3 mr-2" />
                  Manage Users
                </button>
                <button
                  onClick={() => setShowBulkOperationsPanel(!showBulkOperationsPanel)}
                  className={`w-full text-left text-xs flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    showBulkOperationsPanel ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Layers className="w-3 h-3 mr-2" />
                  Bulk Operations
                </button>
              </div>
            </div>

            {/* Active Bulk Operations Status */}
            <div className={`p-4 rounded-lg shadow border transition-all duration-200 ${
              bulkOperations.length > 0 
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-semibold ${
                  bulkOperations.length > 0 
                    ? 'text-yellow-900 dark:text-yellow-100' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  Bulk Operations
                </h3>
                {bulkOperations.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Loader2 className="w-3 h-3 animate-spin text-yellow-600" />
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">Active</span>
                  </div>
                )}
              </div>
              {bulkOperations.length > 0 ? (
                <div className="space-y-2">
                  {bulkOperations.slice(0, 2).map((operation) => (
                    <div key={operation.id} className="text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-800 dark:text-yellow-200 truncate max-w-24">
                          {operation.type}
                        </span>
                        <span className="text-yellow-600 dark:text-yellow-400 ml-1">
                          {Math.round((operation.progress.completed / operation.progress.total) * 100)}%
                        </span>
                      </div>
                      <div className="text-yellow-700 dark:text-yellow-300">
                        {operation.selectedItems.length} items
                      </div>
                    </div>
                  ))}
                  {bulkOperations.length > 2 && (
                    <div className="text-xs text-yellow-600 dark:text-yellow-400">
                      +{bulkOperations.length - 2} more...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  No active operations
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Bulk Operations Panel */}
        {showBulkOperationsPanel && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Operations Center</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Perform batch operations on multiple users, schedules, and roles
                  </p>
                </div>
                <button
                  onClick={() => setShowBulkOperationsPanel(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* User Operations */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    User Operations
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      Bulk Activate Users
                    </button>
                    <button className="w-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                      Bulk Deactivate Users
                    </button>
                    <button className="w-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-2 rounded text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                      Change User Roles
                    </button>
                  </div>
                </div>

                {/* Schedule Operations */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-green-500" />
                    Schedule Operations
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-2 rounded text-sm hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      Assign Schedules
                    </button>
                    <button className="w-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-3 py-2 rounded text-sm hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                      Remove Assignments
                    </button>
                    <button className="w-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-3 py-2 rounded text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                      Update Priorities
                    </button>
                  </div>
                </div>

                {/* Advanced Operations */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-indigo-500" />
                    Advanced Operations
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
                      Export User Data
                    </button>
                    <button className="w-full bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-3 py-2 rounded text-sm hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors">
                      Import Users
                    </button>
                    <button className="w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      Generate Reports
                    </button>
                  </div>
                </div>
              </div>

              {/* Operation Status */}
              {bulkOperations.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Active Operations ({bulkOperations.length})
                  </h4>
                  <div className="space-y-3">
                    {bulkOperations.map((operation) => (
                      <div
                        key={operation.id}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {operation.type}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {Math.round((operation.progress.completed / operation.progress.total) * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>{operation.selectedItems.length} items selected</span>
                          <span>
                            {operation.progress.completed}/{operation.progress.total} completed
                          </span>
                        </div>
                        <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(operation.progress.completed / operation.progress.total) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
                // Enhanced features when enabled
                enableBulkOperations={enhancedFeaturesEnabled}
                enableVirtualization={enhancedFeaturesEnabled}
                enableConflictDetection={enhancedFeaturesEnabled}
                enableRealTimeUpdates={enhancedFeaturesEnabled}
                onBulkAssignSchedules={(userIds, scheduleIds) => {
                  // Trigger bulk operation
                  const newOperation: BulkOperation = {
                    id: Date.now().toString(),
                    type: 'assign',
                    selectedItems: userIds.map(id => id.toString()),
                    options: { scheduleIds: scheduleIds.map(id => id.toString()) },
                    progress: { total: userIds.length, completed: 0, failed: 0, skipped: 0 },
                    validation: { warnings: [], errors: [], canProceed: true }
                  };
                  setBulkOperations(prev => [...prev, newOperation]);
                  
                  // Simulate progress and remove after completion
                  setTimeout(() => {
                    setBulkOperations(prev => prev.filter(op => op.id !== newOperation.id));
                  }, 3000);
                }}
                onBulkRemoveAssignments={(userIds, scheduleIds) => {
                  const newOperation: BulkOperation = {
                    id: Date.now().toString(),
                    type: 'remove',
                    selectedItems: userIds.map(id => id.toString()),
                    options: { scheduleIds: scheduleIds.map(id => id.toString()) },
                    progress: { total: userIds.length, completed: 0, failed: 0, skipped: 0 },
                    validation: { warnings: [], errors: [], canProceed: true }
                  };
                  setBulkOperations(prev => [...prev, newOperation]);
                  
                  setTimeout(() => {
                    setBulkOperations(prev => prev.filter(op => op.id !== newOperation.id));
                  }, 2500);
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
                  userId={selectedUser.userId}
                  user={{
                    id: selectedUser.userId,
                    name: selectedUser.fullName,
                    email: selectedUser.email,
                    role: selectedUser.role,
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
            onPerformanceMetric={(metric) => {
              setPerformanceMetrics(prev => [...prev.slice(-9), metric]);
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
            onPerformanceMetric={(metric) => {
              setPerformanceMetrics(prev => [...prev.slice(-9), metric]);
            }}
          />
        )}
      </div>
    </div>
  );
}

// CreateUserModal is now imported from separate file

/**
 * Edit User Modal Component
 */
interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
  onPerformanceMetric?: (metric: PerformanceMetric) => void;
}

function EditUserModal({ user, onClose, onSuccess, onPerformanceMetric }: EditUserModalProps) {
  const [formData, setFormData] = React.useState({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startTime = performance.now();
    
    try {
      // TODO: Implement user update logic
      console.log('Update user:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Track performance metric
      if (onPerformanceMetric) {
        const endTime = performance.now();
        onPerformanceMetric({
          type: 'interaction',
          name: 'User Update',
          value: endTime - startTime,
          unit: 'ms',
          timestamp: Date.now()
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
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
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'User' | 'Admin' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
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
