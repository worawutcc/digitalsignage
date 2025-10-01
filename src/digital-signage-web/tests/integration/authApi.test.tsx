import { render, screen, waitFor } from '@testing-library/react'
import { authApi } from '@/services/api/authApi'

// Mock API responses
const mockLoginResponse = {
  user: {
    id: '1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    permissions: ['devices:read', 'devices:write', 'media:read', 'media:write'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  tokens: {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: '2024-01-15T12:00:00Z',
  },
}

const mockRefreshResponse = {
  accessToken: 'new-access-token',
  expiresAt: '2024-01-15T13:00:00Z',
}

const mockUserProfile = {
  id: '1',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  permissions: ['devices:read', 'devices:write', 'media:read', 'media:write'],
  lastLoginAt: '2024-01-15T10:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

// Mock fetch implementation
const createMockFetch = () => {
  return jest.fn().mockImplementation((url: string, options?: any) => {
    const method = options?.method || 'GET'
    const body = options?.body ? JSON.parse(options.body) : null

    console.log(`Mock fetch: ${method} ${url}`, body)

    // Login endpoint
    if (url.includes('/api/auth/login') && method === 'POST') {
      if (body?.email === 'admin@example.com' && body?.password === 'password') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockLoginResponse),
        })
      } else if (body?.email === 'invalid@example.com') {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Invalid credentials' }),
        })
      } else if (body?.email === 'locked@example.com') {
        return Promise.resolve({
          ok: false,
          status: 423,
          json: () => Promise.resolve({ message: 'Account locked' }),
        })
      }
    }

    // Refresh token endpoint
    if (url.includes('/api/auth/refresh') && method === 'POST') {
      if (body?.refreshToken === 'mock-refresh-token') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockRefreshResponse),
        })
      } else {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Invalid refresh token' }),
        })
      }
    }

    // Logout endpoint
    if (url.includes('/api/auth/logout') && method === 'POST') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'Logged out successfully' }),
      })
    }

    // Get user profile endpoint
    if (url.includes('/api/auth/profile') && method === 'GET') {
      const authHeader = options?.headers?.Authorization
      if (authHeader && authHeader.includes('mock-access-token')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockUserProfile),
        })
      } else {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Unauthorized' }),
        })
      }
    }

    // Update profile endpoint
    if (url.includes('/api/auth/profile') && method === 'PUT') {
      const authHeader = options?.headers?.Authorization
      if (authHeader && authHeader.includes('mock-access-token')) {
        const updatedProfile = {
          ...mockUserProfile,
          ...body,
          updatedAt: new Date().toISOString(),
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(updatedProfile),
        })
      } else {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Unauthorized' }),
        })
      }
    }

    // Change password endpoint
    if (url.includes('/api/auth/change-password') && method === 'POST') {
      const authHeader = options?.headers?.Authorization
      if (authHeader && authHeader.includes('mock-access-token')) {
        if (body?.currentPassword === 'wrongpassword') {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({ message: 'Current password is incorrect' }),
          })
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ message: 'Password changed successfully' }),
        })
      } else {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Unauthorized' }),
        })
      }
    }

    // Verify token endpoint
    if (url.includes('/api/auth/verify') && method === 'POST') {
      const authHeader = options?.headers?.Authorization
      if (authHeader && authHeader.includes('mock-access-token')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ valid: true, user: mockUserProfile }),
        })
      } else {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ valid: false, message: 'Invalid token' }),
        })
      }
    }

    // Error simulation
    if (url.includes('error')) {
      return Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      })
    }

    // Network error simulation
    if (url.includes('network-error')) {
      return Promise.reject(new Error('Network error'))
    }

    // Default: Not found
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Not found' }),
    })
  })
}

describe('Auth API Integration Tests', () => {
  let originalFetch: typeof global.fetch

  beforeAll(() => {
    originalFetch = global.fetch
  })

  beforeEach(() => {
    global.fetch = createMockFetch()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const credentials = {
        email: 'admin@example.com',
        password: 'password',
      }

      const result = await authApi.login(credentials)

      expect(result).toMatchObject({
        user: {
          id: '1',
          email: 'admin@example.com',
          role: 'admin',
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      })
      expect(result.user.permissions).toContain('devices:read')
    })

    it('should throw error with invalid credentials', async () => {
      const credentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      }

      await expect(authApi.login(credentials)).rejects.toThrow('Invalid credentials')
    })

    it('should handle account locked scenario', async () => {
      const credentials = {
        email: 'locked@example.com',
        password: 'password',
      }

      await expect(authApi.login(credentials)).rejects.toThrow('Account locked')
    })

    it('should validate required fields', async () => {
      await expect(authApi.login({} as any)).rejects.toThrow()
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const result = await authApi.refreshToken('mock-refresh-token')

      expect(result).toMatchObject({
        accessToken: 'new-access-token',
        expiresAt: expect.any(String),
      })
    })

    it('should throw error with invalid refresh token', async () => {
      await expect(
        authApi.refreshToken('invalid-refresh-token')
      ).rejects.toThrow('Invalid refresh token')
    })

    it('should handle missing refresh token', async () => {
      await expect(authApi.refreshToken('')).rejects.toThrow()
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      await expect(authApi.logout()).resolves.not.toThrow()
    })

    it('should handle logout with refresh token', async () => {
      await expect(authApi.logout('mock-refresh-token')).resolves.not.toThrow()
    })
  })

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      // Mock authenticated API client
      const mockApiClient = {
        setAuthToken: jest.fn(),
        get: jest.fn().mockResolvedValue(mockUserProfile),
      }

      const profile = await authApi.getProfile()

      expect(profile).toMatchObject({
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      })
      expect(profile.permissions).toContain('devices:read')
    })

    it('should throw error without authentication', async () => {
      // Mock unauthenticated API client
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' }),
      })

      await expect(authApi.getProfile()).rejects.toThrow('Unauthorized')
    })
  })

  describe('PUT /api/auth/profile', () => {
    it('should update profile successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      }

      const result = await authApi.updateProfile(updateData)

      expect(result).toMatchObject({
        firstName: 'Updated',
        lastName: 'Name',
        updatedAt: expect.any(String),
      })
    })

    it('should throw error without authentication', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' }),
      })

      await expect(
        authApi.updateProfile({ firstName: 'Test' })
      ).rejects.toThrow('Unauthorized')
    })

    it('should handle validation errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          message: 'Validation failed',
          errors: {
            email: ['Invalid email format'],
          },
        }),
      })

      await expect(
        authApi.updateProfile({ email: 'invalid-email' })
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'currentpassword',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword',
      }

      await expect(authApi.changePassword(passwordData)).resolves.not.toThrow()
    })

    it('should throw error with incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword',
      }

      await expect(authApi.changePassword(passwordData)).rejects.toThrow(
        'Current password is incorrect'
      )
    })

    it('should handle password mismatch', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Passwords do not match' }),
      })

      const passwordData = {
        currentPassword: 'currentpassword',
        newPassword: 'newpassword',
        confirmPassword: 'differentpassword',
      }

      await expect(authApi.changePassword(passwordData)).rejects.toThrow(
        'Passwords do not match'
      )
    })
  })

  describe('POST /api/auth/verify', () => {
    it('should verify valid token', async () => {
      const result = await authApi.verifyToken('mock-access-token')

      expect(result).toMatchObject({
        valid: true,
        user: {
          id: '1',
          email: 'admin@example.com',
        },
      })
    })

    it('should return invalid for bad token', async () => {
      const result = await authApi.verifyToken('invalid-token')

      expect(result).toMatchObject({
        valid: false,
        message: 'Invalid token',
      })
    })
  })

  describe('Authentication Flow', () => {
    it('should handle complete authentication flow', async () => {
      // 1. Login
      const loginResult = await authApi.login({
        email: 'admin@example.com',
        password: 'password',
      })

      expect(loginResult.tokens.accessToken).toBeDefined()
      expect(loginResult.tokens.refreshToken).toBeDefined()

      // 2. Verify token
      const verifyResult = await authApi.verifyToken(loginResult.tokens.accessToken)
      expect(verifyResult.valid).toBe(true)

      // 3. Get profile
      const profile = await authApi.getProfile()
      expect(profile.id).toBe(loginResult.user.id)

      // 4. Refresh token
      const refreshResult = await authApi.refreshToken(loginResult.tokens.refreshToken)
      expect(refreshResult.accessToken).toBeDefined()

      // 5. Logout
      await expect(authApi.logout(loginResult.tokens.refreshToken)).resolves.not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should handle server errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      })

      await expect(
        authApi.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow('Internal server error')
    })

    it('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

      await expect(
        authApi.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow('Network error')
    })

    it('should handle timeout errors', async () => {
      global.fetch = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 10000))
      )

      // Assuming your API client has timeout configuration
      await expect(
        authApi.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow(/timeout/i)
    }, 6000)
  })

  describe('Request Headers', () => {
    it('should include proper content-type for POST requests', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockLoginResponse),
      })
      global.fetch = mockFetch

      await authApi.login({
        email: 'admin@example.com',
        password: 'password',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should include authorization header for authenticated requests', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUserProfile),
      })
      global.fetch = mockFetch

      // Mock setting auth token
      await authApi.getProfile()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      )
    })
  })

  describe('Token Management', () => {
    it('should handle token expiration and auto-refresh', async () => {
      // This would test automatic token refresh logic
      // Implementation depends on your token management strategy
      const expiredTokenResponse = {
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Token expired' }),
      }

      const successResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUserProfile),
      }

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(expiredTokenResponse) // First call fails with expired token
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockRefreshResponse),
        }) // Token refresh succeeds
        .mockResolvedValueOnce(successResponse) // Retry succeeds

      const result = await authApi.getProfile()
      expect(result).toMatchObject(mockUserProfile)
    })

    it('should handle refresh token expiration', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Refresh token expired' }),
      })

      await expect(
        authApi.refreshToken('expired-refresh-token')
      ).rejects.toThrow('Refresh token expired')
    })
  })
})