// API error handler for Axios interceptors
// Handles HTTP errors and integrates with Redux error state

import axios, { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { Dispatch } from '@reduxjs/toolkit';
import { showApiError, addToRetryQueue, setOnlineStatus } from '@/store/slices/errorSlice';
import { ApiError, ProblemDetails, ErrorCategory, ErrorSeverity } from '@/types/errors';

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition: (error: AxiosError) => boolean;
}

interface RequestConfigWithRetry extends AxiosRequestConfig {
  _retryCount?: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  },
};

export function setupApiErrorHandler(
  axiosInstance: AxiosInstance, 
  dispatch: Dispatch,
  retryConfig: RetryConfig = defaultRetryConfig
) {
  // Request interceptor for adding retry metadata
  axiosInstance.interceptors.request.use(
    (config) => {
      const configWithRetry = config as RequestConfigWithRetry;
      configWithRetry._retryCount = configWithRetry._retryCount || 0;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const config = error.config as RequestConfigWithRetry & { _authRetry?: boolean };
      
      // Handle network connectivity
      if (typeof window !== 'undefined' && !navigator.onLine) {
        dispatch(setOnlineStatus(false));
        const networkError: ApiError = {
          title: 'Network Unavailable',
          status: 0,
          detail: 'Please check your internet connection and try again.',
          timestamp: new Date().toISOString(),
        };
        dispatch(showApiError({ error: networkError, showToast: true }));
        return Promise.reject(error);
      } else {
        dispatch(setOnlineStatus(true));
      }

      // Determine if we should retry
      const shouldRetry = retryConfig.retryCondition(error) && 
                         (config?._retryCount || 0) < retryConfig.maxRetries;

      if (shouldRetry && config) {
        config._retryCount = (config._retryCount || 0) + 1;
        
        // Calculate exponential backoff delay
        const delay = retryConfig.retryDelay * Math.pow(2, config._retryCount - 1);
        
        // Add to retry queue for tracking
        dispatch(addToRetryQueue(`${config.method}-${config.url}-${config._retryCount}`));
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return axiosInstance(config);
      }

      // Convert error to our standard format
      const apiError = mapAxiosErrorToApiError(error);
      
      // Dispatch to Redux store
      dispatch(showApiError({ error: apiError, showToast: true }));

      return Promise.reject(error);
    }
  );
}

export function mapAxiosErrorToApiError(error: AxiosError): ApiError {
  // Network error (no response)
  if (!error.response) {
    return {
      title: 'Network Error',
      status: 0,
      detail: error.message || 'Unable to connect to the server. Please check your connection.',
      timestamp: new Date().toISOString(),
      type: 'network_error',
    };
  }

  const { data, status, statusText } = error.response;

  // If response has ProblemDetails format, use it
  if (data && typeof data === 'object' && 'title' in data) {
    const problemDetails = data as ProblemDetails;
    return {
      ...problemDetails,
      status,
      timestamp: new Date().toISOString(),
    };
  }

  // Fallback error mapping
  return {
    title: getErrorTitleForStatus(status),
    status,
    detail: typeof data === 'string' ? data : statusText || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  };
}

export function getErrorTitleForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Authentication Required';
    case 403:
      return 'Access Denied';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Validation Failed';
    case 429:
      return 'Too Many Requests';
    case 500:
      return 'Server Error';
    case 502:
      return 'Bad Gateway';
    case 503:
      return 'Service Unavailable';
    case 504:
      return 'Gateway Timeout';
    default:
      return status >= 500 ? 'Server Error' : 'Request Failed';
  }
}

export function classifyError(error: AxiosError): ErrorCategory {
  if (!error.response) {
    return 'network';
  }

  const status = error.response.status;

  if (status === 401) return 'authentication';
  if (status === 403) return 'authorization';
  if (status === 404) return 'not_found';
  if (status >= 400 && status < 500) return 'client_error';
  if (status >= 500) return 'server_error';
  
  return 'client_error';
}

export function getErrorSeverity(error: AxiosError): ErrorSeverity {
  if (!error.response) {
    return 'high'; // Network errors are serious
  }

  const status = error.response.status;

  if (status >= 500) return 'critical'; // Server errors
  if (status === 401 || status === 403) return 'high'; // Auth errors
  if (status === 404) return 'medium'; // Not found
  if (status >= 400) return 'low'; // Client validation errors

  return 'low';
}

export function shouldRetryError(error: AxiosError): boolean {
  // Don't retry client errors (4xx) except for specific cases
  if (error.response && error.response.status >= 400 && error.response.status < 500) {
    // Retry on authentication timeout or rate limiting
    return error.response.status === 408 || error.response.status === 429;
  }

  // Retry on network errors or server errors (5xx)
  return !error.response || error.response.status >= 500;
}

// Enhanced setup with custom retry logic for specific endpoints
export function setupAdvancedApiErrorHandler(
  axiosInstance: AxiosInstance,
  dispatch: Dispatch,
  options?: {
    retryConfig?: Partial<RetryConfig>;
    customRetryConditions?: Record<string, (error: AxiosError) => boolean>;
    onError?: (error: ApiError) => void;
  }
) {
  const retryConfig = { ...defaultRetryConfig, ...options?.retryConfig };
  
  setupApiErrorHandler(axiosInstance, dispatch, {
    ...retryConfig,
    retryCondition: (error: AxiosError) => {
      // Check custom conditions for specific endpoints
      if (options?.customRetryConditions && error.config?.url) {
        const customCondition = options.customRetryConditions[error.config.url];
        if (customCondition) {
          return customCondition(error);
        }
      }
      
      return retryConfig.retryCondition(error);
    },
  });

  // Add custom error handler
  if (options?.onError) {
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError = mapAxiosErrorToApiError(error);
        options.onError!(apiError);
        return Promise.reject(error);
      }
    );
  }
}