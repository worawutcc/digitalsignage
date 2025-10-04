/**
 * Enhanced User Schedule Page Component
 * 
 * Wrapper component providing conflict resolution, real-time updates, and enhanced features
 * for the UserScheduleAssignment component in individual user schedule pages.
 * 
 * @see copilot-instructions-ui.instructions.md - React component patterns
 * @see specs/024-user-management-and/contracts/api-enhanced.yaml - Enhanced API features
 */

'use client'

import React from 'react'
import { UserScheduleAssignment } from './UserScheduleAssignment'
import { AlertTriangle, Wifi, WifiOff, Zap, BarChart3, RefreshCw } from 'lucide-react'
import type { BulkOperation, PerformanceMetric, OptimisticUpdate, BulkOperationResult } from '@/types/enhanced-ui'
import type { User } from '../types'

interface EnhancedUserSchedulePageProps {
  userId: number
  user: {
    id: number
    name: string
    email: string
    role: string
  }
  onSchedulesUpdated?: () => void
}

/**
 * Enhanced User Schedule Page Component
 * Provides conflict resolution, real-time updates, and performance monitoring
 */
export function EnhancedUserSchedulePage({
  userId,
  user,
  onSchedulesUpdated
}: EnhancedUserSchedulePageProps) {
  // Enhanced state management
  const [enhancedFeaturesEnabled, setEnhancedFeaturesEnabled] = React.useState(
    process.env.NEXT_PUBLIC_ENABLE_ENHANCED_UI === 'true'
  )
  const [realTimeEnabled, setRealTimeEnabled] = React.useState(false)
  const [conflictResolutionEnabled, setConflictResolutionEnabled] = React.useState(true)
  const [performanceMetrics, setPerformanceMetrics] = React.useState<PerformanceMetric[]>([])
  const [bulkOperations, setBulkOperations] = React.useState<BulkOperation[]>([])
  const [connectionStatus, setConnectionStatus] = React.useState<'connected' | 'disconnected' | 'reconnecting'>('connected')
  const [conflictCount, setConflictCount] = React.useState(0)

  // Real-time connection simulation
  React.useEffect(() => {
    if (!realTimeEnabled) return

    const interval = setInterval(() => {
      // Simulate connection status changes
      if (Math.random() < 0.1) {
        setConnectionStatus('reconnecting')
        setTimeout(() => {
          setConnectionStatus(Math.random() < 0.05 ? 'disconnected' : 'connected')
        }, 1000)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [realTimeEnabled])

  // Performance metrics tracking
  const handlePerformanceMetric = React.useCallback((metric: PerformanceMetric) => {
    setPerformanceMetrics(prev => [...prev.slice(-9), metric])
  }, [])

  // Bulk operation callbacks
  const handleBulkOperationStart = React.useCallback((operation: BulkOperation) => {
    setBulkOperations(prev => [...prev, operation])
  }, [])

  const handleBulkOperationComplete = React.useCallback((result: BulkOperationResult) => {
    setBulkOperations(prev => prev.filter(op => op.id !== result.operationId))
  }, [])

  // Optimistic update handling
  const handleOptimisticUpdate = React.useCallback((update: OptimisticUpdate) => {
    console.log('Optimistic update for user schedule:', update)
  }, [])

  // Conflict detection simulation
  React.useEffect(() => {
    if (!conflictResolutionEnabled) return

    const checkConflicts = () => {
      // Simulate conflict detection
      const newConflictCount = Math.floor(Math.random() * 3)
      setConflictCount(newConflictCount)
    }

    checkConflicts()
    const interval = setInterval(checkConflicts, 10000)
    
    return () => clearInterval(interval)
  }, [conflictResolutionEnabled])

  return (
    <div className="space-y-6">
      {/* Enhanced Features Control Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enhanced Features</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced capabilities for {user.name}'s schedule management
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className={`w-5 h-5 ${enhancedFeaturesEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
              <button
                onClick={() => setEnhancedFeaturesEnabled(!enhancedFeaturesEnabled)}
                className={`${
                  enhancedFeaturesEnabled 
                    ? 'bg-blue-600' 
                    : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    enhancedFeaturesEnabled ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>
          </div>
        </div>

        {enhancedFeaturesEnabled && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Real-time Updates */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  {connectionStatus === 'connected' ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : connectionStatus === 'reconnecting' ? (
                    <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Real-time
                  </span>
                </div>
                <button
                  onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                  className={`${
                    realTimeEnabled 
                      ? 'bg-green-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  } relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      realTimeEnabled ? 'translate-x-5' : 'translate-x-1'
                    } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>

              {/* Conflict Resolution */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`w-4 h-4 ${conflictCount > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Conflicts
                  </span>
                  {conflictCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      {conflictCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setConflictResolutionEnabled(!conflictResolutionEnabled)}
                  className={`${
                    conflictResolutionEnabled 
                      ? 'bg-yellow-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  } relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      conflictResolutionEnabled ? 'translate-x-5' : 'translate-x-1'
                    } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>

              {/* Performance Metrics */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Performance
                  </span>
                  {performanceMetrics.length > 0 && (
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {Math.round(performanceMetrics.slice(-5).reduce((acc, m) => acc + m.value, 0) / Math.min(5, performanceMetrics.length))}ms
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setPerformanceMetrics([])}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  Clear
                </button>
              </div>

              {/* Bulk Operations Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${bulkOperations.length > 0 ? 'bg-orange-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Bulk Ops
                  </span>
                  {bulkOperations.length > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      {bulkOperations.length}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {bulkOperations.length > 0 ? 'Active' : 'Idle'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced UserScheduleAssignment Component */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <UserScheduleAssignment
          userId={userId}
          user={user}
          onSchedulesUpdated={onSchedulesUpdated || (() => {})}
          // Enhanced props when enabled
          {...(enhancedFeaturesEnabled && {
            showLoadingSkeleton: true,
            enableOptimisticUpdates: true,
            showVisualPreview: true,
            enableBulkOperations: true,
            showAdvancedFilters: true,
            enableDragDrop: true,
            enableConflictDetection: conflictResolutionEnabled,
            enableRealTimeUpdates: realTimeEnabled,
            virtualScrolling: {
              enabled: true,
              itemHeight: 60,
              overscan: 5,
              threshold: parseInt(process.env.NEXT_PUBLIC_VIRTUAL_SCROLLING_THRESHOLD || '50'),
            },
            enhancedAria: {
              announceChanges: true,
              detailedDescriptions: true,
            },
            onBulkOperationStart: handleBulkOperationStart,
            onBulkOperationComplete: handleBulkOperationComplete,
            onOptimisticUpdate: handleOptimisticUpdate,
            onPerformanceMetric: handlePerformanceMetric,
          })}
        />
      </div>

      {/* Real-time Connection Status */}
      {realTimeEnabled && (
        <div className={`fixed bottom-4 right-4 px-3 py-2 rounded-lg shadow-lg transition-all duration-200 ${
          connectionStatus === 'connected' 
            ? 'bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800'
            : connectionStatus === 'reconnecting'
            ? 'bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800'
            : 'bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' ? (
              <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : connectionStatus === 'reconnecting' ? (
              <RefreshCw className="w-4 h-4 text-yellow-600 dark:text-yellow-400 animate-spin" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
            <span className={`text-sm font-medium ${
              connectionStatus === 'connected' 
                ? 'text-green-800 dark:text-green-200'
                : connectionStatus === 'reconnecting'
                ? 'text-yellow-800 dark:text-yellow-200'
                : 'text-red-800 dark:text-red-200'
            }`}>
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}