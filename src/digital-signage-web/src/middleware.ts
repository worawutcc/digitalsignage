import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * JWT token payload interface matching backend API format
 */
interface TokenPayload {
  nameid: string      // Backend uses 'nameid' instead of 'userId'
  email: string
  role: string        // Backend returns 'Admin', 'User', etc.
  sub: string
  jti: string
  iat: number
  nbf: number
  exp: number
  iss: string
  aud: string
  // Legacy frontend fields (for compatibility)
  userId?: string
  permissions?: string[]
}

/**
 * Decode JWT token without verification
 * WARNING: This does NOT verify the token signature. Only use for reading payload.
 * @param token - JWT token string to decode
 * @returns Decoded token payload or null if invalid
 */
function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || !parts[1]) {
      return null
    }

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
 * Check if token is expired
 * @param payload - Decoded token payload
 * @returns boolean indicating if token is expired
 */
function isTokenExpired(payload: TokenPayload): boolean {
  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}

/**
 * Verify JWT token (decode and check expiration)
 * @param token - JWT token string to verify
 * @returns Promise with decoded token payload
 * @throws Error if token is invalid or expired
 */
async function verifyToken(token: string): Promise<TokenPayload> {
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
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

/**
 * Routes that require specific permissions
 * Maps route paths to array of required permissions (user needs ANY of them)
 */
const PROTECTED_ROUTES: Record<string, string[]> = {
  '/users': ['users:read', 'admin:*'],
  '/users/create': ['users:write', 'admin:*'],
  '/devices': ['devices:read'],
  '/devices/create': ['devices:write'],
  '/content': ['media:read'],
  '/content/upload': ['media:write'],
  '/schedules': ['schedules:read'],
  '/schedules/create': ['schedules:write'],
  '/settings': ['admin:*'],
}

/**
 * Admin-only routes
 */
const ADMIN_ROUTES = ['/settings', '/users', '/system', '/audit-logs']

/**
 * Extract token from request cookies or headers
 * @param request - Next.js request object
 * @returns JWT token string or null if not found
 */
function getToken(request: NextRequest): string | null {
  // Try to get token from cookie
  const tokenFromCookie = request.cookies.get('accessToken')?.value

  if (tokenFromCookie) {
    return tokenFromCookie
  }

  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

/**
 * Check if user has required permissions
 * @param userPermissions - Array of user's permissions
 * @param requiredPermissions - Array of required permissions (ANY match grants access)
 * @returns boolean indicating if user has at least one required permission
 */
function hasRequiredPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((required) => {
    // Check for exact permission match
    if (userPermissions.includes(required)) {
      return true
    }

    // Check for wildcard permissions (e.g., "devices:*" matches "devices:read")
    const [resource] = required.split(':')
    const wildcardPermission = `${resource}:*`
    if (userPermissions.includes(wildcardPermission)) {
      return true
    }

    return false
  })
}

/**
 * Next.js middleware for route protection and authentication
 * Handles token validation, permission checks, and redirects for unauthorized access
 * @param request - Next.js request object
 * @returns NextResponse with appropriate redirect or continuation
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow static files and API routes to pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Files with extensions (images, fonts, etc.)
  ) {
    return NextResponse.next()
  }

  // Get authentication token
  const token = getToken(request)

  // Redirect to login if no token
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify token
    const payload = await verifyToken(token)

    // Check if token is expired
    if (isTokenExpired(payload)) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('reason', 'expired')
      
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('accessToken')
      return response
    }

    // Check admin-only routes
    if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
      if (payload.role !== 'Admin') {  // Backend returns 'Admin', not 'admin'
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // Check permission-based routes
    for (const [route, requiredPermissions] of Object.entries(PROTECTED_ROUTES)) {
      if (pathname.startsWith(route)) {
        const userRole = payload.role

        // Admin role has all permissions (backend returns 'Admin')
        if (userRole === 'Admin') {
          return NextResponse.next()
        }

        // For now, allow all authenticated users to access these routes
        // TODO: Implement proper permission system in backend
        return NextResponse.next()
      }
    }

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.nameid || payload.userId || '')
    requestHeaders.set('x-user-role', payload.role || '')
    requestHeaders.set('x-user-email', payload.email || '')

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // Invalid token - redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    loginUrl.searchParams.set('reason', 'invalid')
    
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('accessToken')
    return response
  }
}

/**
 * Configure which routes the middleware should run on
 * Excludes static files, API routes, and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
