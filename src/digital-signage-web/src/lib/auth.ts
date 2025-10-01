/**
 * JWT Token Management Utilities
 * Handles token encoding, decoding, verification, and storage
 */

/**
 * JWT token payload interface
 */
export interface TokenPayload {
  userId: string
  email: string
  role: 'admin' | 'manager' | 'user'
  permissions: string[]
  iat: number // Issued at (timestamp)
  exp: number // Expiration (timestamp)
}

/**
 * Decode JWT token without verification
 * WARNING: This does NOT verify the token signature. Only use for reading payload.
 * @param token - JWT token string to decode
 * @returns Decoded token payload or null if invalid
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3 || !parts[1]) {
      return null
    }

    // Decode the payload (base64url)
    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload) as TokenPayload
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

/**
 * Verify JWT token (server-side only - requires secret)
 * For client-side, this would need to call an API endpoint
 * @param token - JWT token string to verify
 * @returns Promise with decoded and verified token payload
 * @throws Error if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  // In a real implementation, this would verify the signature using the JWT secret
  // For now, we'll decode and check expiration
  const payload = decodeToken(token)

  if (!payload) {
    throw new Error('Invalid token format')
  }

  if (isTokenExpired(payload)) {
    throw new Error('Token has expired')
  }

  return payload
}

/**
 * Check if token is expired
 * @param payload - Decoded token payload
 * @returns boolean indicating if token is expired
 */
export function isTokenExpired(payload: TokenPayload): boolean {
  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}

/**
 * Get token expiration time in milliseconds
 * @param payload - Decoded token payload
 * @returns Expiration timestamp in milliseconds
 */
export function getTokenExpirationTime(payload: TokenPayload): number {
  return payload.exp * 1000
}

/**
 * Get time remaining until token expires (in milliseconds)
 * @param payload - Decoded token payload
 * @returns Time remaining in milliseconds (0 if expired)
 */
export function getTokenTimeRemaining(payload: TokenPayload): number {
  const expirationTime = getTokenExpirationTime(payload)
  const now = Date.now()
  return Math.max(0, expirationTime - now)
}

/**
 * Check if token needs refresh (expires within threshold)
 * @param payload - Decoded token payload
 * @param thresholdMinutes - Threshold in minutes before expiration (default: 5)
 * @returns boolean indicating if token should be refreshed
 */
export function shouldRefreshToken(payload: TokenPayload, thresholdMinutes: number = 5): boolean {
  const timeRemaining = getTokenTimeRemaining(payload)
  const thresholdMs = thresholdMinutes * 60 * 1000
  return timeRemaining < thresholdMs
}

/**
 * Storage keys for tokens
 */
const TOKEN_STORAGE_KEY = 'digital-signage-access-token'
const REFRESH_TOKEN_STORAGE_KEY = 'digital-signage-refresh-token'
const TOKEN_EXPIRY_KEY = 'digital-signage-token-expiry'

/**
 * Save access token to storage
 * @param token - JWT access token to store
 * @param rememberMe - If true, uses localStorage; otherwise sessionStorage
 */
export function saveAccessToken(token: string, rememberMe: boolean = false): void {
  if (typeof window === 'undefined') return

  const storage = rememberMe ? localStorage : sessionStorage
  storage.setItem(TOKEN_STORAGE_KEY, token)

  // Decode and store expiry time
  const payload = decodeToken(token)
  if (payload) {
    storage.setItem(TOKEN_EXPIRY_KEY, payload.exp.toString())
  }
}

/**
 * Get access token from storage
 * @returns Access token string or null if not found
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null

  // Try localStorage first (remember me)
  let token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) return token

  // Try sessionStorage
  token = sessionStorage.getItem(TOKEN_STORAGE_KEY)
  return token
}

/**
 * Save refresh token to storage
 * @param token - JWT refresh token to store
 * @param rememberMe - If true, uses localStorage; otherwise sessionStorage
 */
export function saveRefreshToken(token: string, rememberMe: boolean = false): void {
  if (typeof window === 'undefined') return

  const storage = rememberMe ? localStorage : sessionStorage
  storage.setItem(REFRESH_TOKEN_STORAGE_KEY, token)
}

/**
 * Get refresh token from storage
 * @returns Refresh token string or null if not found
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null

  // Try localStorage first (remember me)
  let token = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
  if (token) return token

  // Try sessionStorage
  token = sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
  return token
}

/**
 * Clear all auth tokens from storage
 * Removes tokens from both localStorage and sessionStorage
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return

  // Clear from both storages
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)

  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY)
}

/**
 * Check if user is authenticated (has valid token)
 * @returns boolean indicating if user has valid, non-expired token
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken()
  if (!token) return false

  const payload = decodeToken(token)
  if (!payload) return false

  return !isTokenExpired(payload)
}

/**
 * Get current user from token
 * @returns Decoded token payload with user information or null if not authenticated
 */
export function getCurrentUser(): TokenPayload | null {
  const token = getAccessToken()
  if (!token) return null

  const payload = decodeToken(token)
  if (!payload || isTokenExpired(payload)) return null

  return payload
}

/**
 * Set up automatic token refresh
 * Returns cleanup function to stop the refresh interval
 * @param onRefresh - Async callback function to handle token refresh
 * @param checkIntervalMinutes - How often to check for refresh (default: 1 minute)
 * @returns Cleanup function to stop the interval
 */
export function setupTokenRefresh(
  onRefresh: () => Promise<void>,
  checkIntervalMinutes: number = 1
): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const checkInterval = checkIntervalMinutes * 60 * 1000

  const intervalId = setInterval(async () => {
    const token = getAccessToken()
    if (!token) return

    const payload = decodeToken(token)
    if (!payload) return

    // Check if token needs refresh (5 minutes threshold)
    if (shouldRefreshToken(payload, 5)) {
      try {
        await onRefresh()
      } catch (error) {
        console.error('Token refresh failed:', error)
        // Token refresh failed - user will be redirected to login on next API call
      }
    }
  }, checkInterval)

  // Return cleanup function
  return () => {
    clearInterval(intervalId)
  }
}

/**
 * Format token for Authorization header
 * @param token - JWT token
 * @returns Formatted Bearer token string
 */
export function formatAuthorizationHeader(token: string): string {
  return `Bearer ${token}`
}

/**
 * Extract user permissions from token
 * @returns Array of permission strings or empty array if not authenticated
 */
export function getUserPermissions(): string[] {
  const user = getCurrentUser()
  return user?.permissions || []
}

/**
 * Check if user has specific permission
 * @param permission - Permission string to check (e.g., "devices:read")
 * @returns boolean indicating if user has the permission
 */
export function hasPermission(permission: string): boolean {
  const permissions = getUserPermissions()
  const user = getCurrentUser()

  // Admin has all permissions
  if (user?.role === 'admin') {
    return true
  }

  // Check for exact permission match
  if (permissions.includes(permission)) {
    return true
  }

  // Check for wildcard permissions
  const [resource] = permission.split(':')
  const wildcardPermission = `${resource}:*`
  return permissions.includes(wildcardPermission)
}

/**
 * Check if user has specific role
 * @param role - Role to check ('admin', 'manager', or 'user')
 * @returns boolean indicating if user has the role
 */
export function hasRole(role: 'admin' | 'manager' | 'user'): boolean {
  const user = getCurrentUser()
  return user?.role === role
}
