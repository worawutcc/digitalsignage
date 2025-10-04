/**
 * Progress Indicators Integration Example
 * 
 * Demonstrates how to integrate progress indicators and loading states
 * with existing bulk operations and real-time updates.
 * 
 * @see T034 - Progress Indicators & Loading States
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  ProgressBar, 
  BulkOperationStatus, 
  OperationQueue, 
  LoadingState,
  RealTimeUpdateIndicator
} from '@/components/feedback/ProgressIndicators'
import { TouchButton } from '@/components/mobile/MobileComponents'
import { useViewport } from '@/lib/mobile-utils'

// Example hook for managing bulk operations
export function useBulkOperations() {
  const [operations, setOperations] = useState<BulkOperationStatus[]>([])

  const addOperation = useCallback((operation: Omit<BulkOperationStatus, 'id' | 'startedAt'>) => {
    const newOperation: BulkOperationStatus = {
      ...operation,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startedAt: new Date().toISOString()
    }
    
    setOperations(prev => [...prev, newOperation])
    return newOperation.id
  }, [])

  const updateOperation = useCallback((id: string, updates: Partial<BulkOperationStatus>) => {
    setOperations(prev => prev.map(op => 
      op.id === id 
        ? { 
            ...op, 
            ...updates, 
            ...(updates.status === 'completed' || updates.status === 'failed' || updates.status === 'cancelled' 
              ? { completedAt: new Date().toISOString() }
              : {}
            )
          }
        : op
    ))
  }, [])

  const cancelOperation = useCallback((id: string) => {
    updateOperation(id, { status: 'cancelled' })
  }, [updateOperation])

  const pauseOperation = useCallback((id: string) => {
    updateOperation(id, { status: 'paused' })
  }, [updateOperation])

  const resumeOperation = useCallback((id: string) => {
    updateOperation(id, { status: 'running' })
  }, [updateOperation])

  const retryOperation = useCallback((id: string) => {
    updateOperation(id, { 
      status: 'running', 
      progress: 0, 
      processed: 0, 
      failed: 0,
      startedAt: new Date().toISOString()
    })
  }, [updateOperation])

  const clearCompleted = useCallback(() => {
    setOperations(prev => prev.filter(op => 
      op.status !== 'completed' && op.status !== 'failed' && op.status !== 'cancelled'
    ))
  }, [])

  return {
    operations,
    addOperation,
    updateOperation,
    cancelOperation,
    pauseOperation,
    resumeOperation,
    retryOperation,
    clearCompleted
  }
}

// Example component showing integration
export function BulkOperationExamples() {
  const viewport = useViewport()
  const {
    operations,
    addOperation,
    updateOperation,
    cancelOperation,
    pauseOperation,
    resumeOperation,
    retryOperation,
    clearCompleted
  } = useBulkOperations()

  // Real-time connection state
  const [realTimeConnected, setRealTimeConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString())
  const [updateCount, setUpdateCount] = useState(0)
  
  // Loading states
  const [pageLoading, setPageLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)

  // Simulate progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      operations.forEach(op => {
        if (op.status === 'running' && op.progress < 100) {
          const increment = Math.random() * 10
          const newProgress = Math.min(op.progress + increment, 100)
          const newProcessed = Math.floor((newProgress / 100) * op.total)
          const newFailed = Math.max(0, Math.floor(Math.random() * 2) - 1) // Random failures
          
          updateOperation(op.id, {
            progress: newProgress,
            processed: newProcessed,
            failed: op.failed + newFailed,
            ...(newProgress >= 100 && {
              status: 'completed' as const
            })
          })
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [operations, updateOperation])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (realTimeConnected) {
        setLastUpdate(new Date().toISOString())
        setUpdateCount(prev => prev + 1)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [realTimeConnected])

  // Example bulk operations
  const startBulkUserCreation = () => {
    addOperation({
      type: 'create',
      status: 'running',
      progress: 0,
      total: 100,
      processed: 0,
      failed: 0,
      message: 'Creating new user accounts...',
      canCancel: true,
      canPause: true,
      canRetry: false
    })
  }

  const startBulkDataExport = () => {
    addOperation({
      type: 'export',
      status: 'running',
      progress: 0,
      total: 50,
      processed: 0,
      failed: 0,
      message: 'Exporting user data to CSV...',
      canCancel: true,
      canPause: false,
      canRetry: true
    })
  }

  const startDataSync = () => {
    addOperation({
      type: 'sync',
      status: 'running',
      progress: 0,
      total: 200,
      processed: 0,
      failed: 0,
      message: 'Synchronizing with external systems...',
      canCancel: false,
      canPause: true,
      canRetry: true
    })
  }

  const simulatePageLoad = () => {
    setPageLoading(true)
    setTimeout(() => setPageLoading(false), 3000)
  }

  const simulateTableLoad = () => {
    setTableLoading(true)
    setTimeout(() => setTableLoading(false), 2000)
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Progress Indicators Examples
        </h1>
        
        <RealTimeUpdateIndicator
          connected={realTimeConnected}
          lastUpdate={lastUpdate}
          updateCount={updateCount}
          onReconnect={() => setRealTimeConnected(true)}
        />
      </div>

      {/* Page Loading Example */}
      {pageLoading && (
        <LoadingState
          type="spinner"
          size="lg"
          message="Loading page content..."
          fullscreen
        />
      )}

      {/* Control Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Control Panel
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Bulk Operations */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bulk Operations
            </h3>
            <TouchButton onClick={startBulkUserCreation} className="w-full">
              Create 100 Users
            </TouchButton>
            <TouchButton onClick={startBulkDataExport} className="w-full">
              Export Data
            </TouchButton>
            <TouchButton onClick={startDataSync} className="w-full">
              Sync Data
            </TouchButton>
          </div>

          {/* Loading States */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loading States
            </h3>
            <TouchButton onClick={simulatePageLoad} className="w-full">
              Simulate Page Load
            </TouchButton>
            <TouchButton onClick={simulateTableLoad} className="w-full">
              Simulate Table Load
            </TouchButton>
          </div>

          {/* Real-time Controls */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Real-time Connection
            </h3>
            <TouchButton 
              onClick={() => setRealTimeConnected(!realTimeConnected)}
              variant={realTimeConnected ? 'outline' : 'primary'}
              className="w-full"
            >
              {realTimeConnected ? 'Disconnect' : 'Connect'}
            </TouchButton>
            <TouchButton 
              onClick={() => setUpdateCount(0)}
              variant="outline"
              className="w-full"
            >
              Reset Counter
            </TouchButton>
          </div>
        </div>
      </div>

      {/* Progress Bar Examples */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Progress Bars
        </h2>
        
        <div className="space-y-6">
          <ProgressBar
            value={25}
            label="System Health"
            color="green"
            size="md"
          />
          
          <ProgressBar
            value={67}
            label="Storage Usage"
            color="yellow"
            size="lg"
          />
          
          <ProgressBar
            value={90}
            label="Memory Usage"
            color="red"
            size="sm"
          />
        </div>
      </div>

      {/* Table Loading Example */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Data Table with Loading
          </h2>
        </div>
        
        <div className="p-6">
          {tableLoading ? (
            <LoadingState
              type="skeleton"
              message="Loading user data..."
            />
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Table content would appear here when loaded.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      User {i + 1}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      user{i + 1}@example.com
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Operation Queue */}
      <OperationQueue
        operations={operations}
        onCancel={cancelOperation}
        onPause={pauseOperation}
        onResume={resumeOperation}
        onRetry={retryOperation}
        onClearCompleted={clearCompleted}
      />

      {/* Loading State Examples */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Loading State Variations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
              Spinner
            </h3>
            <LoadingState type="spinner" size="lg" />
          </div>
          
          <div className="text-center">
            <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
              Dots
            </h3>
            <LoadingState type="dots" size="lg" />
          </div>
          
          <div className="text-center">
            <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
              Wave
            </h3>
            <LoadingState type="wave" size="md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkOperationExamples