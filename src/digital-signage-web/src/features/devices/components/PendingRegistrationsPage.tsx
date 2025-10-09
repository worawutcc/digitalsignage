'use client'

/**
 * Pending Registrations Page Component
 * 
 * Main component for displaying and managing pending device registrations.
 * Features auto-refresh, user matching display, and approval workflow.
 * 
 * @see copilot-instructions-ui.md - Component Development Rules
 * @see CODE-REVIEW-UI-REQUIREMENTS.md - Device Registration Admin UI Requirements
 */

import React, { useState } from 'react'
import { 
  Clock, 
  Shield, 
  User, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react'
import { 
  usePendingRegistrations, 
  useApproveRegistration, 
  useRejectRegistration,
  useBulkApproveRegistrations
} from '../hooks/useDeviceRegistration'
// import { PendingRegistrationCard } from './PendingRegistrationCard'
// import { DeviceApprovalModal } from './DeviceApprovalModal'
// import { DeviceRejectionModal } from './DeviceRejectionModal'
// import { BulkApprovalModal } from './BulkApprovalModal'
import type { PendingRegistration, ApprovalRequest } from '../types/deviceRegistration'

export function PendingRegistrationsPage() {
  // State for modals and selection
  const [selectedForApproval, setSelectedForApproval] = useState<PendingRegistration | null>(null)
  const [selectedForRejection, setSelectedForRejection] = useState<PendingRegistration | null>(null)
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([])
  const [showBulkApproval, setShowBulkApproval] = useState(false)
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [filterByUserMatch, setFilterByUserMatch] = useState<'all' | 'matched' | 'unmatched'>('all')

  // React Query hooks
  const { 
    data: registrationsData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = usePendingRegistrations()
  
  const approveRegistration = useApproveRegistration()
  const rejectRegistration = useRejectRegistration()
  const bulkApproveRegistrations = useBulkApproveRegistrations()

  // Filter registrations based on search and filters
  const filteredRegistrations = React.useMemo(() => {
    if (!registrationsData?.registrations) return []
    
    return registrationsData.registrations.filter((registration: PendingRegistration) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          registration.deviceModel.toLowerCase().includes(searchLower) ||
          registration.manufacturer.toLowerCase().includes(searchLower) ||
          registration.macAddress.toLowerCase().includes(searchLower) ||
          registration.requestedUsername?.toLowerCase().includes(searchLower) ||
          registration.matchedUser?.email.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }
      
      // User match filter
      if (filterByUserMatch === 'matched' && !registration.matchedUser) return false
      if (filterByUserMatch === 'unmatched' && registration.matchedUser) return false
      
      return true
    })
  }, [registrationsData?.registrations, searchTerm, filterByUserMatch])

  // Handle individual approval
  const handleApprove = async (registration: PendingRegistration, approvalData: ApprovalRequest) => {
    try {
      console.log('Approving registration via Dashboard (no PIN required):', registration.registrationId)
      
      // No PIN needed for dashboard approval - admin is already authenticated
      await approveRegistration.mutateAsync({
        registrationId: registration.registrationId,
        data: approvalData
      })
      setSelectedForApproval(null)
    } catch (error) {
      console.error('Failed to approve registration:', error)
      alert(`Failed to approve registration: ${error}`)
    }
  }

  // Handle individual rejection
  const handleReject = async (registration: PendingRegistration, reason: string) => {
    try {
      console.log('Rejecting registration via Dashboard (no PIN required):', registration.registrationId)
      
      // No PIN needed for dashboard rejection - admin is already authenticated
      await rejectRegistration.mutateAsync({
        registrationId: registration.registrationId,
        reason
      })
      setSelectedForRejection(null)
    } catch (error) {
      console.error('Failed to reject registration:', error)
    }
  }

  // Handle bulk approval
  const handleBulkApprove = async (approvalData: Omit<ApprovalRequest, 'registrationId'>) => {
    try {
      await bulkApproveRegistrations.mutateAsync({
        registrationIds: selectedRegistrations,
        data: approvalData
      })
      setSelectedRegistrations([])
      setShowBulkApproval(false)
    } catch (error) {
      console.error('Failed to bulk approve registrations:', error)
    }
  }

  // Handle selection changes
  const handleSelectionChange = (registrationId: string, selected: boolean) => {
    if (selected) {
      setSelectedRegistrations(prev => [...prev, registrationId])
    } else {
      setSelectedRegistrations(prev => prev.filter(id => id !== registrationId))
    }
  }

  const handleSelectAll = () => {
    if (selectedRegistrations.length === filteredRegistrations.length) {
      setSelectedRegistrations([])
    } else {
      setSelectedRegistrations(filteredRegistrations.map((reg: PendingRegistration) => reg.registrationId))
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading pending registrations...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error Loading Registrations
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error instanceof Error ? error.message : 'Failed to load pending registrations'}
            </div>
            <div className="mt-4">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalRegistrations = registrationsData?.totalCount ?? 0

  return (
    <div className="space-y-6">
      {/* Statistics and Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Pending
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {totalRegistrations}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    With Matched User
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {filteredRegistrations.filter((reg: PendingRegistration) => reg.matchedUser).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Expiring Soon
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {filteredRegistrations.filter((reg: PendingRegistration) => {
                      const expiresAt = new Date(reg.expiresAt)
                      const now = new Date()
                      const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)
                      return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0
                    }).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Selected
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {selectedRegistrations.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by device model, MAC address, or user..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter by User Match */}
          <div className="sm:w-64">
            <select
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={filterByUserMatch}
              onChange={(e) => setFilterByUserMatch(e.target.value as 'all' | 'matched' | 'unmatched')}
            >
              <option value="all">All Registrations</option>
              <option value="matched">With Matched User</option>
              <option value="unmatched">No Matched User</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRegistrations.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                {selectedRegistrations.length} registration(s) selected
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowBulkApproval(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Bulk Approve
              </button>
              <button
                onClick={() => setSelectedRegistrations([])}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration List */}
      <div className="space-y-4">
        {/* Select All */}
        {filteredRegistrations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={selectedRegistrations.length === filteredRegistrations.length}
                onChange={handleSelectAll}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Select all ({filteredRegistrations.length})
              </span>
            </label>
          </div>
        )}

        {/* Empty State */}
        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No pending registrations
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {totalRegistrations === 0 
                ? 'All device registrations have been processed.'
                : 'No registrations match your current filters.'
              }
            </p>
          </div>
        )}

        {/* Registration Cards - Simplified for now */}
        {filteredRegistrations.map((registration: PendingRegistration) => (
          <div key={registration.registrationId} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={selectedRegistrations.includes(registration.registrationId)}
                  onChange={(e) => handleSelectionChange(registration.registrationId, e.target.checked)}
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {registration.manufacturer} {registration.deviceModel}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    MAC: {registration.macAddress} | PIN: {registration.pin}
                  </p>
                  {registration.matchedUser && (
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Matched User: {registration.matchedUser.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedForApproval(registration)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => setSelectedForRejection(registration)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals - Simplified for now */}
      {selectedForApproval && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                Approve Device Registration
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Approve registration for {selectedForApproval.manufacturer} {selectedForApproval.deviceModel}?
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleApprove(selectedForApproval, {
                    registrationId: selectedForApproval.registrationId,
                    deviceName: `${selectedForApproval.manufacturer} ${selectedForApproval.deviceModel}`,
                    location: 'Main Floor', // Default location
                    notes: 'Auto-approved from admin panel',
                    reason: 'Approved via dashboard'
                  })}
                  className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  Approve
                </button>
                <button
                  onClick={() => setSelectedForApproval(null)}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedForRejection && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                Reject Device Registration
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reject registration for {selectedForRejection.manufacturer} {selectedForRejection.deviceModel}?
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleReject(selectedForRejection, "Device registration rejected by admin")}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Reject
                </button>
                <button
                  onClick={() => setSelectedForRejection(null)}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}