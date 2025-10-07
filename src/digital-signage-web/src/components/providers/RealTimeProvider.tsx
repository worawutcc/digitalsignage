/**
 * RealTimeProvider Component
 * 
 * Provides centralized SignalR connection management to prevent race conditions
 * and multiple connection attempts on pages with multiple real-time components.
 * 
 * @see useRealTimeUpdates hook for connection logic
 * @see copilot-instructions-ui.instructions.md - Provider patterns
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'
import type { RealTimeConnectionState } from '@/hooks/useRealTimeUpdates'
import { useToast } from '@/hooks/useToast'

interface RealTimeContextValue {
  connectionState: RealTimeConnectionState
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  isReady: boolean
  lastError: string | null
}

const RealTimeContext = createContext<RealTimeContextValue | null>(null)

interface RealTimeProviderProps {
  children: React.ReactNode
  /** Whether to auto-connect when provider mounts */
  autoConnect?: boolean
  /** Show connection status toasts */
  showConnectionToasts?: boolean
  /** Connection retry configuration */
  retryConfig?: {
    enabled: boolean
    maxAttempts: number
    delayMs: number
  }
}

export function RealTimeProvider({ 
  children, 
  autoConnect = true,
  showConnectionToasts = false,
  retryConfig = {
    enabled: true,
    maxAttempts: 3,
    delayMs: 2000
  }
}: RealTimeProviderProps) {
  const { toast } = useToast()
  const [isReady, setIsReady] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)

  // Use the shared connection hook
  const { 
    connectionState, 
    connect: connectHook, 
    disconnect: disconnectHook 
  } = useRealTimeUpdates({
    autoConnect: false, // We'll manage connection manually
    preventMultipleConnections: true,
    connectionId: 'global-provider',
    subscriptions: {
      schedules: true,
      users: true,
      devices: true,
      conflicts: true,
      media: true
    },
    notifications: {
      showToasts: showConnectionToasts,
      critical: true
    }
  })

  // Enhanced connect with retry logic
  const connect = useCallback(async () => {
    try {
      setLastError(null)
      await connectHook()
      setConnectionAttempts(0)
      
      if (showConnectionToasts) {
        toast({
          title: 'Real-time Connection',
          description: 'Successfully connected to real-time updates',
          variant: 'default',
          duration: 3000
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed'
      setLastError(errorMessage)
      
      if (retryConfig.enabled && connectionAttempts < retryConfig.maxAttempts) {
        setConnectionAttempts(prev => prev + 1)
        
        if (showConnectionToasts) {
          toast({
            title: 'Connection Failed',
            description: `Retrying connection (${connectionAttempts + 1}/${retryConfig.maxAttempts})...`,
            variant: 'destructive',
            duration: 3000
          })
        }
        
        setTimeout(() => {
          connect()
        }, retryConfig.delayMs)
      } else {
        if (showConnectionToasts) {
          toast({
            title: 'Connection Failed',
            description: 'Unable to establish real-time connection. Some features may not work properly.',
            variant: 'destructive',
            duration: 0 // Don't auto-dismiss
          })
        }
      }
    }
  }, [connectHook, showConnectionToasts, toast, retryConfig, connectionAttempts])

  // Enhanced disconnect
  const disconnect = useCallback(async () => {
    try {
      await disconnectHook()
      setConnectionAttempts(0)
      setLastError(null)
      
      if (showConnectionToasts) {
        toast({
          title: 'Real-time Connection',
          description: 'Disconnected from real-time updates',
          variant: 'default',
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }, [disconnectHook, showConnectionToasts, toast])

  // Track ready state
  useEffect(() => {
    setIsReady(connectionState.isConnected && !connectionState.error)
  }, [connectionState.isConnected, connectionState.error])

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && !connectionState.isConnected && !connectionState.isConnecting) {
      console.log('RealTimeProvider: Auto-connecting...')
      
      // Add small delay to ensure page is ready
      const timer = setTimeout(() => {
        connect()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
    return () => {} // Return empty cleanup when condition is not met
  }, [autoConnect, connectionState.isConnected, connectionState.isConnecting, connect])

  // Monitor connection state changes
  useEffect(() => {
    if (connectionState.error && connectionState.error !== lastError) {
      setLastError(connectionState.error)
    }
  }, [connectionState.error, lastError])

  const contextValue: RealTimeContextValue = {
    connectionState,
    connect,
    disconnect,
    isReady,
    lastError
  }

  return (
    <RealTimeContext.Provider value={contextValue}>
      {children}
    </RealTimeContext.Provider>
  )
}

/**
 * Hook to access the RealTime context
 * 
 * @throws Error if used outside of RealTimeProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { connectionState, isReady, connect, disconnect } = useRealTimeContext()
 *   
 *   if (!isReady) {
 *     return (
 *       <div className="flex items-center gap-2">
 *         <Loader2 className="h-4 w-4 animate-spin" />
 *         <span>Connecting to real-time updates...</span>
 *       </div>
 *     )
 *   }
 *   
 *   return <div>Real-time features are ready!</div>
 * }
 * ```
 */
export function useRealTimeContext() {
  const context = useContext(RealTimeContext)
  
  if (!context) {
    throw new Error('useRealTimeContext must be used within a RealTimeProvider')
  }
  
  return context
}

/**
 * Connection status indicator component
 */
export function ConnectionStatusIndicator({ 
  className = "",
  showText = true 
}: { 
  className?: string
  showText?: boolean 
}) {
  const { connectionState, isReady, lastError } = useRealTimeContext()

  if (connectionState.isConnecting) {
    return (
      <div className={`flex items-center gap-2 text-yellow-600 ${className}`}>
        <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        {showText && <span className="text-sm">Connecting...</span>}
      </div>
    )
  }

  if (isReady) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <div className="h-2 w-2 rounded-full bg-green-500" />
        {showText && <span className="text-sm">Connected</span>}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 text-red-600 ${className}`}>
      <div className="h-2 w-2 rounded-full bg-red-500" />
      {showText && (
        <span className="text-sm" title={lastError || 'Disconnected'}>
          Disconnected
        </span>
      )}
    </div>
  )
}

export default RealTimeProvider