/**
 * Responsive User List Example
 * 
 * Demonstrates how to use ResponsiveTable with user management data.
 * Shows automatic switching between table and card views.
 * 
 * @see T033 - Responsive Data Tables
 */

'use client'

import React, { useState } from 'react'
import { Edit2, Trash2, Eye, EyeOff, UserCheck, Calendar, Mail, Phone } from 'lucide-react'
import ResponsiveTable from '@/components/tables/ResponsiveTable'
import type { ResponsiveTableColumn } from '@/components/tables/ResponsiveTable'
import type { User } from '@/types/api'

export interface ResponsiveUserListProps {
  users: User[]
  loading?: boolean
  onUserSelect?: (user: User) => void
  onEditUser?: (user: User) => void
  onDeleteUser?: (user: User) => void
  pagination?: {
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems?: number
    onPageChange: (page: number) => void
  }
  className?: string
}

/**
 * Example of ResponsiveTable usage with user data
 */
export function ResponsiveUserList({
  users,
  loading = false,
  onUserSelect,
  onEditUser,
  onDeleteUser,
  pagination,
  className = ''
}: ResponsiveUserListProps) {
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState<string | null>('fullName')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Filter data based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchValue || 
      user.fullName.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.email.toLowerCase().includes(searchValue.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive)
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  // Define table columns
  const columns: ResponsiveTableColumn<User>[] = [
    {
      key: 'fullName',
      header: 'Name',
      sortable: true,
      showInMobile: true,
      mobileOrder: 1,
      render: (value, user) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
            {user.fullName[0]}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {user.fullName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </div>
          </div>
        </div>
      ),
      mobileRender: (value, user) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {user.fullName[0]}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {user.fullName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      showInMobile: true,
      mobileOrder: 2,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'Admin' 
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      showInMobile: true,
      mobileOrder: 3,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      showInMobile: false, // Hide in mobile view to save space
      render: (value) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'lastLoginAt',
      header: 'Last Login',
      sortable: true,
      showInMobile: false,
      render: (value) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {value ? new Date(value).toLocaleDateString() : 'Never'}
        </span>
      )
    },
    {
      key: 'userId',
      header: 'Actions',
      sortable: false,
      showInMobile: true,
      mobileOrder: 4,
      render: (value, user) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEditUser?.(user)
            }}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            title="Edit user"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteUser?.(user)
            }}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            title="Delete user"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      mobileRender: (value, user) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEditUser?.(user)
            }}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded-lg"
            title="Edit user"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteUser?.(user)
            }}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-100 dark:bg-gray-700 rounded-lg"
            title="Delete user"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  // Custom mobile card render
  const mobileCardRender = (user: User, index: number) => (
    <div className="space-y-3">
      {/* User Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user.fullName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {user.fullName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            user.role === 'Admin' 
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
          }`}>
            {user.role}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            user.isActive 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* User Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {user.phoneNumber && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Phone className="w-3 h-3" />
            <span className="truncate">{user.phoneNumber}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
        {user.lastLoginAt && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-2">
            <UserCheck className="w-3 h-3" />
            <span>Last login {new Date(user.lastLoginAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEditUser?.(user)
          }}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
        >
          <Edit2 className="w-4 h-4 mr-1" />
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDeleteUser?.(user)
          }}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </button>
      </div>
    </div>
  )

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  return (
    <ResponsiveTable
      data={filteredUsers}
      columns={columns}
      loading={loading}
      {...(pagination && { pagination })}
      sorting={{
        sortBy,
        sortOrder,
        onSort: handleSort
      }}
      filtering={{
        searchValue,
        onSearchChange: setSearchValue,
        filters: [
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          },
          {
            key: 'role',
            label: 'Role',
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { value: 'all', label: 'All Roles' },
              { value: 'Admin', label: 'Admin' },
              { value: 'User', label: 'User' }
            ]
          }
        ]
      }}
      emptyMessage="No users found"
      {...(onUserSelect && { onRowClick: onUserSelect })}
      mobileCardRender={mobileCardRender}
      className={className}
    />
  )
}

export default ResponsiveUserList