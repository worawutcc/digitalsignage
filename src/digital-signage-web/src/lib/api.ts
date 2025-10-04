import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'
import type { RootState } from '@/store'
import { store } from '@/store'
import { authActions } from '@/store/slices/authSlice'

/**
 * Custom API error class with enhanced error information
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message?: string,
    public code?: string
  ) {
    super(message || `API Error: ${status}`)
    this.name = 'ApiError'
  }
}

/**
 * API Response interface for consistent response handling
 */
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

/**
 * Get authentication token from Redux store (preferred) or localStorage fallback
 */
function getAuthToken(): string | null {
  // Try to get from Redux store first
  const state = store.getState() as RootState
  if (state.auth.tokens?.accessToken) {
    return state.auth.tokens.accessToken
  }
  
  // Fallback to localStorage for initial load
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string | null): boolean {
  if (!token) return true
  
  try {
    const state = store.getState() as RootState
    const expiresAt = state.auth.tokens?.expiresAt
    if (expiresAt) {
      return new Date() >= new Date(expiresAt)
    }
    return false
  } catch {
    return true
  }
}

/**
 * Axios API client configuration with comprehensive interceptors
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5100',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor for authentication and request logging
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = getAuthToken()
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request ID for tracing
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }

    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

/**
 * Response interceptor for error handling and token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const state = store.getState() as RootState
        const refreshToken = state.auth.tokens?.refreshToken

        if (refreshToken) {
          // Attempt to refresh token
          const refreshResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5100'}/api/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          )

          const { accessToken, refreshToken: newRefreshToken, expiresAt } = refreshResponse.data

          // Update tokens in Redux store
          store.dispatch(authActions.updateTokens({
            accessToken,
            refreshToken: newRefreshToken,
            expiresAt,
          }))

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error('Token refresh failed:', refreshError)
        store.dispatch(authActions.logout())
        
        // Redirect to login if in browser
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
      }
    }

    // Handle different error types
    let apiError: ApiError

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      apiError = new ApiError(
        status,
        data,
        (data && typeof data === 'object' && 'message' in data ? data.message : error.message) as string,
        (data && typeof data === 'object' && 'code' in data ? data.code : undefined) as string
      )

      // Log error details in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ API Error: ${status} ${error.config?.url}`, data)
      }
    } else if (error.request) {
      // Network error
      apiError = new ApiError(
        0,
        null,
        'Network error - please check your connection',
        'NETWORK_ERROR'
      )
    } else {
      // Request setup error
      apiError = new ApiError(
        0,
        null,
        error.message,
        'REQUEST_ERROR'
      )
    }

    return Promise.reject(apiError)
  }
)

/**
 * API client methods for common operations
 */
export const api = {
  // GET request
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.get(url, config).then(response => response.data),

  // POST request
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.post(url, data, config).then(response => response.data),

  // PUT request
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.put(url, data, config).then(response => response.data),

  // PATCH request
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.patch(url, data, config).then(response => response.data),

  // DELETE request
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.delete(url, config).then(response => response.data),

  // Upload file
  upload: <T = unknown>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> => {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          onProgress(progress)
        }
      },
    }).then(response => response.data)
  },
}

// Export both the raw client and enhanced API methods
export { apiClient }