'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getAccessToken, decodeToken, isTokenExpired, clearTokens } from '@/lib/auth'
import type { TokenPayload } from '@/lib/auth'

interface AuthWrapperProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  fallback?: React.ReactNode
}

/**
 * Authentication wrapper component that protects routes
 * Checks for valid JWT token and redirects to login if not authenticated
 */
export function AuthWrapper({ 
  children, 
  requiredPermissions = [],
  fallback 
}: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userPayload, setUserPayload] = useState<TokenPayload | null>(null)
  const isRedirectingRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = getAccessToken()
        
        if (!token) {
          console.log('No access token found')
          setIsAuthenticated(prev => prev !== false ? false : prev)
          return
        }

        const payload = decodeToken(token)
        
        if (!payload) {
          console.log('Invalid token format')
          clearTokens()
          setIsAuthenticated(prev => prev !== false ? false : prev)
          return
        }

        if (isTokenExpired(payload)) {
          console.log('Token has expired')
          clearTokens()
          setIsAuthenticated(prev => prev !== false ? false : prev)
          return
        }

        // Check required permissions (role-based for now)
        if (requiredPermissions.length > 0) {
          // For Admin role, allow all access
          if (payload.role === 'Admin') {
            // Admin has all permissions
          } else {
            // For other roles, we could check permissions here
            // For now, allow all authenticated users
            console.log('Permission check - allowing authenticated user with role:', payload.role)
          }
        }

        // Only update state if values actually changed to prevent unnecessary re-renders
        setUserPayload(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(payload)) {
            return payload
          }
          return prev
        })
        
        setIsAuthenticated(prev => prev !== true ? true : prev)
      } catch (error) {
        console.error('Authentication check failed:', error)
        clearTokens()
        setIsAuthenticated(prev => prev !== false ? false : prev)
      }
    }

    checkAuth()

    // Set up token refresh check interval
    const interval = setInterval(checkAuth, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [requiredPermissions])

  useEffect(() => {
    if (isAuthenticated === false && !isRedirectingRef.current) {
      isRedirectingRef.current = true
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  // Show loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show fallback if not authenticated
  if (isAuthenticated === false) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-4">
            You need to be logged in to access this page.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Authenticated - render children
  return <>{children}</>
}

export default AuthWrapper