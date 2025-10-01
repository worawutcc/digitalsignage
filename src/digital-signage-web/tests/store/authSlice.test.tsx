import { configureStore } from '@reduxjs/toolkit'
import { authSlice, authActions } from '@/store/slices/authSlice'
import type { AuthState } from '@/store/slices/authSlice'

// Mock user data
const mockUser = {
  id: '1',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin' as const,
  permissions: ['devices:read', 'devices:write', 'media:read', 'media:write'],
  createdAt: '2024-01-01T00:00:00Z',
}

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: '2024-01-15T12:00:00Z',
}

// Helper function to create test store
const createTestStore = (initialState?: Partial<AuthState>) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
    },
    preloadedState: {
      auth: {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        ...initialState,
      },
    },
  })
}

describe('Auth Store Tests', () => {
  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = createTestStore()
      const state = store.getState().auth

      expect(state).toEqual({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    })
  })

  describe('Login Actions', () => {
    it('should handle login start', () => {
      const store = createTestStore()
      
      store.dispatch(authActions.loginStart())
      const state = store.getState().auth

      expect(state.isLoading).toBe(true)
      expect(state.error).toBe(null)
    })

    it('should handle login success', () => {
      const store = createTestStore()
      const loginPayload = {
        user: mockUser,
        tokens: mockTokens,
      }

      store.dispatch(authActions.loginSuccess(loginPayload))
      const state = store.getState().auth

      expect(state.user).toEqual(mockUser)
      expect(state.tokens).toEqual(mockTokens)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle login failure', () => {
      const store = createTestStore()
      const errorMessage = 'Invalid credentials'

      store.dispatch(authActions.loginFailure(errorMessage))
      const state = store.getState().auth

      expect(state.user).toBe(null)
      expect(state.tokens).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('Logout Actions', () => {
    it('should handle logout', () => {
      const store = createTestStore({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
      })

      store.dispatch(authActions.logout())
      const state = store.getState().auth

      expect(state.user).toBe(null)
      expect(state.tokens).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle logout from unauthenticated state', () => {
      const store = createTestStore()

      store.dispatch(authActions.logout())
      const state = store.getState().auth

      expect(state.user).toBe(null)
      expect(state.tokens).toBe(null)
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('Token Management', () => {
    it('should handle token refresh start', () => {
      const store = createTestStore({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
      })

      store.dispatch(authActions.refreshTokenStart())
      const state = store.getState().auth

      expect(state.isLoading).toBe(true)
      expect(state.error).toBe(null)
      // Should maintain authentication state during refresh
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual(mockUser)
    })

    it('should handle token refresh success', () => {
      const store = createTestStore({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
        isLoading: true,
      })

      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: '2024-01-15T13:00:00Z',
      }

      store.dispatch(authActions.refreshTokenSuccess(newTokens))
      const state = store.getState().auth

      expect(state.tokens).toEqual(newTokens)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual(mockUser)
    })

    it('should handle token refresh failure', () => {
      const store = createTestStore({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
        isLoading: true,
      })

      const errorMessage = 'Refresh token expired'

      store.dispatch(authActions.refreshTokenFailure(errorMessage))
      const state = store.getState().auth

      expect(state.user).toBe(null)
      expect(state.tokens).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('User Profile Actions', () => {
    it('should handle update profile start', () => {
      const store = createTestStore({
        user: mockUser,
        isAuthenticated: true,
      })

      store.dispatch(authActions.updateProfileStart())
      const state = store.getState().auth

      expect(state.isLoading).toBe(true)
      expect(state.error).toBe(null)
    })

    it('should handle update profile success', () => {
      const store = createTestStore({
        user: mockUser,
        isAuthenticated: true,
        isLoading: true,
      })

      const updatedUser = {
        ...mockUser,
        firstName: 'Updated',
        lastName: 'Name',
        updatedAt: '2024-01-15T12:00:00Z',
      }

      store.dispatch(authActions.updateProfileSuccess(updatedUser))
      const state = store.getState().auth

      expect(state.user).toEqual(updatedUser)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
      expect(state.isAuthenticated).toBe(true)
    })

    it('should handle update profile failure', () => {
      const store = createTestStore({
        user: mockUser,
        isAuthenticated: true,
        isLoading: true,
      })

      const errorMessage = 'Validation failed'

      store.dispatch(authActions.updateProfileFailure(errorMessage))
      const state = store.getState().auth

      expect(state.user).toEqual(mockUser) // Should keep original user data
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(errorMessage)
      expect(state.isAuthenticated).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle clearing errors', () => {
      const store = createTestStore({
        error: 'Some error message',
      })

      store.dispatch(authActions.clearError())
      const state = store.getState().auth

      expect(state.error).toBe(null)
    })

    it('should handle setting errors', () => {
      const store = createTestStore()
      const errorMessage = 'Custom error message'

      store.dispatch(authActions.setError(errorMessage))
      const state = store.getState().auth

      expect(state.error).toBe(errorMessage)
    })
  })

  describe('Authentication State Management', () => {
    it('should handle authentication restore from storage', () => {
      const store = createTestStore()
      const storedAuthData = {
        user: mockUser,
        tokens: mockTokens,
      }

      store.dispatch(authActions.restoreAuth(storedAuthData))
      const state = store.getState().auth

      expect(state.user).toEqual(mockUser)
      expect(state.tokens).toEqual(mockTokens)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle invalid token scenario', () => {
      const store = createTestStore({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
      })

      store.dispatch(authActions.invalidateToken())
      const state = store.getState().auth

      expect(state.user).toBe(null)
      expect(state.tokens).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.error).toBe('Token invalid or expired')
    })
  })

  describe('Complex Authentication Flows', () => {
    it('should handle complete login flow', () => {
      const store = createTestStore()

      // Start login
      store.dispatch(authActions.loginStart())
      expect(store.getState().auth.isLoading).toBe(true)

      // Login success
      const loginPayload = { user: mockUser, tokens: mockTokens }
      store.dispatch(authActions.loginSuccess(loginPayload))
      
      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual(mockUser)
      expect(state.tokens).toEqual(mockTokens)
    })

    it('should handle token refresh during session', () => {
      const store = createTestStore({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
      })

      // Start token refresh
      store.dispatch(authActions.refreshTokenStart())
      expect(store.getState().auth.isLoading).toBe(true)
      expect(store.getState().auth.isAuthenticated).toBe(true) // Should stay authenticated

      // Token refresh success
      const newTokens = {
        accessToken: 'new-token',
        refreshToken: 'new-refresh-token',
        expiresAt: '2024-01-15T13:00:00Z',
      }
      store.dispatch(authActions.refreshTokenSuccess(newTokens))
      
      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.isAuthenticated).toBe(true)
      expect(state.tokens).toEqual(newTokens)
      expect(state.user).toEqual(mockUser)
    })

    it('should handle failed login followed by successful login', () => {
      const store = createTestStore()

      // Failed login
      store.dispatch(authActions.loginStart())
      store.dispatch(authActions.loginFailure('Invalid credentials'))
      
      let state = store.getState().auth
      expect(state.isAuthenticated).toBe(false)
      expect(state.error).toBe('Invalid credentials')

      // Clear error and try again
      store.dispatch(authActions.clearError())
      store.dispatch(authActions.loginStart())
      store.dispatch(authActions.loginSuccess({ user: mockUser, tokens: mockTokens }))

      state = store.getState().auth
      expect(state.isAuthenticated).toBe(true)
      expect(state.error).toBe(null)
      expect(state.user).toEqual(mockUser)
    })
  })

  describe('Permission Management', () => {
    it('should handle user with different permissions', () => {
      const store = createTestStore()
      const limitedUser = {
        ...mockUser,
        role: 'user' as const,
        permissions: ['devices:read', 'media:read'],
      }

      store.dispatch(authActions.loginSuccess({
        user: limitedUser,
        tokens: mockTokens,
      }))

      const state = store.getState().auth
      expect(state.user?.permissions).toEqual(['devices:read', 'media:read'])
      expect(state.user?.role).toBe('user')
    })

    it('should handle permission updates during profile update', () => {
      const store = createTestStore({
        user: mockUser,
        isAuthenticated: true,
      })

      const updatedUser = {
        ...mockUser,
        permissions: [...mockUser.permissions, 'admin:read'],
      }

      store.dispatch(authActions.updateProfileSuccess(updatedUser))
      const state = store.getState().auth

      expect(state.user?.permissions).toContain('admin:read')
    })
  })

  describe('Async Thunk-like Behavior', () => {
    it('should handle multiple concurrent operations correctly', () => {
      const store = createTestStore({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
      })

      // Simulate concurrent profile update and token refresh
      store.dispatch(authActions.updateProfileStart())
      store.dispatch(authActions.refreshTokenStart())
      
      let state = store.getState().auth
      expect(state.isLoading).toBe(true)

      // Complete both operations
      const newTokens = { ...mockTokens, accessToken: 'new-token' }
      const updatedUser = { ...mockUser, firstName: 'Updated' }

      store.dispatch(authActions.refreshTokenSuccess(newTokens))
      store.dispatch(authActions.updateProfileSuccess(updatedUser))

      state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.tokens).toEqual(newTokens)
      expect(state.user).toEqual(updatedUser)
    })
  })

  describe('Edge Cases', () => {
    it('should handle logout during loading state', () => {
      const store = createTestStore({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
        isLoading: true,
      })

      store.dispatch(authActions.logout())
      const state = store.getState().auth

      expect(state.user).toBe(null)
      expect(state.tokens).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle token refresh with no existing tokens', () => {
      const store = createTestStore()

      store.dispatch(authActions.refreshTokenStart())
      store.dispatch(authActions.refreshTokenFailure('No refresh token available'))

      const state = store.getState().auth
      expect(state.isAuthenticated).toBe(false)
      expect(state.error).toBe('No refresh token available')
    })

    it('should maintain state consistency after multiple errors', () => {
      const store = createTestStore()

      // Multiple failed operations
      store.dispatch(authActions.loginFailure('Login failed'))
      store.dispatch(authActions.refreshTokenFailure('Refresh failed'))
      store.dispatch(authActions.updateProfileFailure('Update failed'))

      const state = store.getState().auth
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBe(null)
      expect(state.tokens).toBe(null)
      expect(state.error).toBe('Update failed') // Last error wins
    })
  })
})