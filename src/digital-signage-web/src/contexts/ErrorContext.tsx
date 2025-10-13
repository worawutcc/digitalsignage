// Error context provider for React components
// Provides error state and functions to child components through React Context

'use client';

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  addToast, 
  dismissToast, 
  dismissAllToasts,
  setGlobalError,
  clearGlobalError,
  setOnlineStatus,
  showApiError,
  showSuccessToast,
  showWarningToast
} from '@/store/slices/errorSlice';
import { ApiError, ToastNotification } from '@/types/errors';
import { ErrorService } from '@/lib/errors/errorService';

/**
 * Error context interface for providing error management functions
 */
export interface ErrorContextValue {
  // Error state getters
  globalError: ApiError | null;
  toasts: ToastNotification[];
  isOnline: boolean;

  // Error management functions
  showError: (error: ApiError | string) => void;
  showToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  dismissToast: (id: string) => void;
  clearGlobalError: () => void;
  clearAllToasts: () => void;
  
  // Network status
  setOnline: (isOnline: boolean) => void;
  
  // Error service instance
  errorService: ErrorService;
}

/**
 * Error context with undefined default (must be used within provider)
 */
const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

/**
 * Props for ErrorProvider component
 */
interface ErrorProviderProps {
  children: ReactNode;
}

/**
 * ErrorProvider component that provides error management context to children
 */
export function ErrorProvider({ children }: ErrorProviderProps) {
  const dispatch = useDispatch();
  
  // Get error state from Redux
  const {
    globalError,
    toasts,
    isOnline
  } = useSelector((state: RootState) => state.error);

  // Get ErrorService instance
  const errorService = new ErrorService();

  // Error management functions
  const showError = useCallback((error: ApiError | string) => {
    if (typeof error === 'string') {
      const apiError: ApiError = {
        title: error,
        status: 0,
        timestamp: new Date().toISOString(),
      };
      dispatch(showApiError({ error: apiError }));
    } else {
      dispatch(showApiError({ error }));
    }
  }, [dispatch]);

  const showToast = useCallback((toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    dispatch(addToast(toast));
  }, [dispatch]);

  const dismissToastHandler = useCallback((id: string) => {
    dispatch(dismissToast(id));
  }, [dispatch]);

  const clearGlobalErrorHandler = useCallback(() => {
    dispatch(clearGlobalError());
  }, [dispatch]);

  const clearAllToasts = useCallback(() => {
    dispatch(dismissAllToasts());
  }, [dispatch]);

  // Network status
  const setOnline = useCallback((isOnline: boolean) => {
    dispatch(setOnlineStatus(isOnline));
  }, [dispatch]);

  // Context value
  const contextValue: ErrorContextValue = {
    // State
    globalError,
    toasts,
    isOnline,

    // Functions
    showError,
    showToast,
    dismissToast: dismissToastHandler,
    clearGlobalError: clearGlobalErrorHandler,
    clearAllToasts,
    setOnline,
    errorService,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
}

/**
 * Hook to use error context
 * Throws error if used outside of ErrorProvider
 */
export function useErrorContext(): ErrorContextValue {
  const context = useContext(ErrorContext);
  
  if (context === undefined) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  
  return context;
}

/**
 * Hook for convenient error handling in components
 */
export function useErrorHandler() {
  const { showError, showToast } = useErrorContext();
  
  const handleError = useCallback((error: unknown, context?: string) => {
    if (error instanceof Error) {
      showError({
        title: context || 'An error occurred',
        status: 500,
        detail: error.message,
        timestamp: new Date().toISOString(),
      });
    } else if (typeof error === 'string') {
      showError({
        title: context || 'An error occurred',
        status: 500,
        detail: error,
        timestamp: new Date().toISOString(),
      });
    } else {
      showError({
        title: context || 'An error occurred',
        status: 500,
        detail: 'An unknown error occurred',
        timestamp: new Date().toISOString(),
      });
    }
  }, [showError]);

  const handleSuccess = useCallback((message: string, title?: string) => {
    showToast({
      type: 'success',
      title: title || 'Success',
      message,
      duration: 3000,
    });
  }, [showToast]);

  const handleWarning = useCallback((message: string, title?: string) => {
    showToast({
      type: 'warning',
      title: title || 'Warning',
      message,
      duration: 4000,
    });
  }, [showToast]);

  const handleInfo = useCallback((message: string, title?: string) => {
    showToast({
      type: 'info',
      title: title || 'Information',
      message,
      duration: 3000,
    });
  }, [showToast]);

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
    showError,
    showToast,
  };
}

/**
 * Hook for network status handling
 */
export function useNetworkStatus() {
  const { isOnline, setOnline } = useErrorContext();
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial status
    setOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);
  
  return { isOnline };
}

/**
 * High-order component to provide error boundary context
 */
export function withErrorHandler<P extends object>(
  Component: React.ComponentType<P>,
  defaultErrorTitle?: string
) {
  const WithErrorHandlerComponent = (props: P) => {
    const { handleError } = useErrorHandler();
    
    const componentProps = {
      ...props,
      onError: (error: unknown) => handleError(error, defaultErrorTitle),
    } as P & { onError: (error: unknown) => void };
    
    return <Component {...componentProps} />;
  };
  
  WithErrorHandlerComponent.displayName = `withErrorHandler(${Component.displayName || Component.name})`;
  
  return WithErrorHandlerComponent;
}