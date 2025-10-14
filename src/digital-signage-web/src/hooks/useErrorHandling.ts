// Error handling hooks for React components
// Provides reusable error handling patterns and state management

'use client';

import React from 'react';
import { useErrorContext } from '@/contexts/ErrorContext';
import { ApiError, FormError } from '@/types/errors';

/**
 * Hook for handling API errors with automatic retry and error display
 */
export function useApiError() {
  const { showError, showToast } = useErrorContext();
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  const handleApiError = React.useCallback((error: ApiError, options?: {
    showToast?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    onRetrySuccess?: () => void;
    onRetryFail?: (error: ApiError) => void;
  }) => {
    const {
      showToast: shouldShowToast = true,
      maxRetries = 3,
      retryDelay = 1000,
      onRetrySuccess,
      onRetryFail,
    } = options || {};

    if (shouldShowToast) {
      showError(error);
    } else {
      showError(error);
    }

    // Return retry function if error is retryable
    if (error.status >= 500 || error.status === 0) {
      return async (action: () => Promise<any>) => {
        if (retryCount >= maxRetries) {
          onRetryFail?.(error);
          return false;
        }

        setIsRetrying(true);
        setRetryCount(prev => prev + 1);

        try {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
          const result = await action();
          setRetryCount(0);
          onRetrySuccess?.();
          return result;
        } catch (retryError) {
          if (retryCount + 1 >= maxRetries) {
            onRetryFail?.(retryError as ApiError);
          }
          throw retryError;
        } finally {
          setIsRetrying(false);
        }
      };
    }

    return null;
  }, [showError, showToast, retryCount]);

  const resetRetry = React.useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    handleApiError,
    isRetrying,
    retryCount,
    resetRetry,
  };
}

/**
 * Hook for handling form errors with validation and display
 */
export function useFormErrorHandling<T extends Record<string, any>>() {
  const [errors, setErrors] = React.useState<Record<string, FormError[]>>({});
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Add error for specific field
  const setFieldError = React.useCallback((field: string, error: FormError) => {
    setErrors(prev => ({
      ...prev,
      [field]: [error],
    }));
  }, []);

  // Add multiple errors for a field
  const setFieldErrors = React.useCallback((field: string, errors: FormError[]) => {
    setErrors(prev => ({
      ...prev,
      [field]: errors,
    }));
  }, []);

  // Clear error for specific field
  const clearFieldError = React.useCallback((field: string) => {
    setErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  // Clear all errors
  const clearAllErrors = React.useCallback(() => {
    setErrors({});
    setGlobalError(null);
  }, []);

  // Set global form error
  const setGlobalFormError = React.useCallback((error: string) => {
    setGlobalError(error);
  }, []);

  // Handle API validation errors
  const handleValidationErrors = React.useCallback((apiError: ApiError) => {
    if (apiError.errors) {
      const newErrors: Record<string, FormError[]> = {};
      
      Object.entries(apiError.errors).forEach(([field, messages]) => {
        newErrors[field.toLowerCase()] = messages.map(message => ({
          field: field.toLowerCase(),
          message,
          code: 'validation',
        }));
      });
      
      setErrors(newErrors);
    } else {
      setGlobalError(apiError.detail || apiError.title || 'Validation failed');
    }
  }, []);

  // Get errors for specific field
  const getFieldErrors = React.useCallback((field: string): FormError[] => {
    return errors[field] || [];
  }, [errors]);

  // Check if field has errors
  const hasFieldError = React.useCallback((field: string): boolean => {
    return Boolean(errors[field]?.length);
  }, [errors]);

  // Get all errors as flat array
  const getAllErrors = React.useCallback((): FormError[] => {
    const allErrors: FormError[] = [];
    
    Object.values(errors).forEach(fieldErrors => {
      allErrors.push(...fieldErrors);
    });

    if (globalError) {
      allErrors.push({
        field: 'global',
        message: globalError,
        code: 'global',
      });
    }

    return allErrors;
  }, [errors, globalError]);

  // Check if form has any errors
  const hasErrors = React.useMemo(() => {
    return Object.keys(errors).length > 0 || Boolean(globalError);
  }, [errors, globalError]);

  // Validate form data using a validator function
  const validateForm = React.useCallback(async (
    data: T,
    validator: (data: T) => Promise<Record<string, string[]> | null>
  ): Promise<boolean> => {
    try {
      const validationErrors = await validator(data);
      
      if (validationErrors) {
        const newErrors: Record<string, FormError[]> = {};
        
        Object.entries(validationErrors).forEach(([field, messages]) => {
          newErrors[field] = messages.map(message => ({
            field,
            message,
            code: 'validation',
          }));
        });
        
        setErrors(newErrors);
        return false;
      }
      
      clearAllErrors();
      return true;
    } catch (error) {
      setGlobalError('Validation failed');
      return false;
    }
  }, [clearAllErrors]);

  return {
    errors: getAllErrors(),
    fieldErrors: errors,
    globalError,
    isSubmitting,
    hasErrors,
    setFieldError,
    setFieldErrors,
    clearFieldError,
    clearAllErrors,
    setGlobalFormError,
    handleValidationErrors,
    getFieldErrors,
    hasFieldError,
    setIsSubmitting,
    validateForm,
  };
}

/**
 * Hook for async operations with error handling and loading states
 */
export function useAsyncOperation<T = any>() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<ApiError | null>(null);
  const [data, setData] = React.useState<T | null>(null);
  const { handleApiError } = useApiError();

  const execute = React.useCallback(async (
    operation: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: ApiError) => void;
      showSuccessToast?: boolean;
      successMessage?: string;
    }
  ): Promise<T | null> => {
    const {
      onSuccess,
      onError,
      showSuccessToast = false,
      successMessage = 'Operation completed successfully',
    } = options || {};

    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      setData(result);
      
      if (showSuccessToast && successMessage) {
        // Show success toast through error context
      }
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      
      const retry = handleApiError(apiError);
      onError?.(apiError);
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError]);

  const reset = React.useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    data,
    reset,
  };
}

/**
 * Hook for handling network status and offline scenarios
 */
export function useNetworkErrorHandling() {
  const [isOnline, setIsOnline] = React.useState(() => 
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [offlineQueue, setOfflineQueue] = React.useState<Array<() => Promise<any>>>([]);
  const { showToast } = useErrorContext();

  // Network status listeners
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast({
        type: 'success',
        message: 'Connection restored',
        duration: 3000,
      });
      
      // Process offline queue
      if (offlineQueue.length > 0) {
        processOfflineQueue();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast({
        type: 'warning',
        message: 'Connection lost. Actions will be queued until reconnection.',
        persistent: true,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue, showToast]);

  // Process queued actions when back online
  const processOfflineQueue = React.useCallback(async () => {
    const queue = [...offlineQueue];
    setOfflineQueue([]);

    for (const action of queue) {
      try {
        await action();
      } catch (error) {
        console.error('Failed to process queued action:', error);
      }
    }

    if (queue.length > 0) {
      showToast({
        type: 'success',
        message: `Processed ${queue.length} queued actions`,
        duration: 3000,
      });
    }
  }, [offlineQueue, showToast]);

  // Queue action for later execution
  const queueAction = React.useCallback((action: () => Promise<any>) => {
    if (isOnline) {
      return action();
    } else {
      setOfflineQueue(prev => [...prev, action]);
      showToast({
        type: 'info',
        message: 'Action queued for when connection is restored',
        duration: 3000,
      });
      return Promise.resolve();
    }
  }, [isOnline, showToast]);

  return {
    isOnline,
    queueAction,
    offlineQueueLength: offlineQueue.length,
    processOfflineQueue,
  };
}

/**
 * Hook for debounced error reporting to prevent spam
 */
export function useDebouncedErrorReporting(delay = 1000) {
  const [errorQueue, setErrorQueue] = React.useState<ApiError[]>([]);
  const { showError } = useErrorContext();

  // Debounced error reporting
  React.useEffect(() => {
    if (errorQueue.length === 0) return;

    const timer = setTimeout(() => {
      // Group similar errors
      const groupedErrors = errorQueue.reduce((acc, error) => {
        const key = `${error.status}-${error.title}`;
        if (!acc[key]) {
          acc[key] = { ...error, count: 1 };
        } else {
          acc[key].count++;
        }
        return acc;
      }, {} as Record<string, ApiError & { count: number }>);

      // Show grouped errors
      Object.values(groupedErrors).forEach(error => {
        const apiError: ApiError = {
          title: error.title,
          status: error.status,
          timestamp: error.timestamp,
        };

        if (error.type) {
          apiError.type = error.type;
        }

        if (error.detail) {
          apiError.detail = error.count > 1 
            ? `${error.detail} (${error.count} similar errors)`
            : error.detail;
        }

        if (error.errors) {
          apiError.errors = error.errors;
        }

        showError(apiError);
      });

      setErrorQueue([]);
    }, delay);

    return () => clearTimeout(timer);
  }, [errorQueue, delay, showError]);

  const reportError = React.useCallback((error: ApiError) => {
    setErrorQueue(prev => [...prev, error]);
  }, []);

  return { reportError };
}

/**
 * Hook for error recovery patterns
 */
export function useErrorRecovery() {
  const [recoveryActions, setRecoveryActions] = React.useState<Map<string, () => void>>(new Map());

  const registerRecoveryAction = React.useCallback((errorType: string, action: () => void) => {
    setRecoveryActions(prev => new Map(prev).set(errorType, action));
  }, []);

  const executeRecovery = React.useCallback((error: ApiError) => {
    // Try specific error recovery first
    const specificRecovery = recoveryActions.get(`${error.status}-${error.type}`);
    if (specificRecovery) {
      specificRecovery();
      return true;
    }

    // Try general status code recovery
    const statusRecovery = recoveryActions.get(error.status.toString());
    if (statusRecovery) {
      statusRecovery();
      return true;
    }

    // Default recovery patterns
    if (error.status === 401) {
      window.location.href = '/login';
      return true;
    }

    if (error.status === 403) {
      window.history.back();
      return true;
    }

    return false;
  }, [recoveryActions]);

  return {
    registerRecoveryAction,
    executeRecovery,
  };
}