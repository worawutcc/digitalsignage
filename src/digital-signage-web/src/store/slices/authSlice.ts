import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User, LoginResponse } from '@/types/api'

/**
 * Token information
 */
export interface Tokens {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

/**
 * Auth state interface
 */
export interface AuthState {
  user: User | null
  tokens: Tokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

/**
 * Auth slice with Redux Toolkit
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; tokens: Tokens }>) => {
      state.isLoading = false
      state.user = action.payload.user
      state.tokens = action.payload.tokens
      state.isAuthenticated = true
      state.error = null
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.user = null
      state.tokens = null
      state.isAuthenticated = false
      state.error = action.payload
    },

    // Logout action
    logout: (state) => {
      state.user = null
      state.tokens = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
      
      // Clear tokens from storage
      if (typeof window !== 'undefined') {
        const { clearTokens } = require('@/lib/auth')
        clearTokens()
      }
    },

    // Token refresh actions
    refreshTokenStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    refreshTokenSuccess: (state, action: PayloadAction<Tokens>) => {
      state.tokens = action.payload
      state.isLoading = false
      state.error = null
    },
    refreshTokenFailure: (state, action: PayloadAction<string>) => {
      state.user = null
      state.tokens = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = action.payload
    },
    
    // Direct token update (for API interceptor)
    updateTokens: (state, action: PayloadAction<Tokens>) => {
      state.tokens = action.payload
    },

    // Profile update actions
    updateProfileStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updateProfileSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isLoading = false
      state.error = null
    },
    updateProfileFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Authentication restoration from storage
    restoreAuth: (state, action: PayloadAction<{ user: User; tokens: Tokens }>) => {
      state.user = action.payload.user
      state.tokens = action.payload.tokens
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
    },

    // Token invalidation
    invalidateToken: (state) => {
      state.user = null
      state.tokens = null
      state.isAuthenticated = false
      state.error = 'Token invalid or expired'
    },

    // Error handling
    clearError: (state) => {
      state.error = null
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
  },
})

export const authActions = authSlice.actions
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
  updateTokens,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  restoreAuth,
  invalidateToken,
  clearError,
  setError,
} = authSlice.actions

export default authSlice.reducer