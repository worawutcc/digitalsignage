// Error types for UI error notification system
// Based on data-model.md specifications

import { ErrorInfo } from 'react';

// Core error types
export interface ApiError {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

export interface FormError {
  field: string;
  message: string;
  code?: string;
}

export interface ToastNotification {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  title?: string;
  duration?: number;
  persistent?: boolean;
  timestamp: string;
}

// UI state models
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export interface LoadingState {
  isLoading: boolean;
  error?: ApiError | null;
  lastUpdated?: string;
}

// Redux state models
export interface RetryAction {
  id: string;
  action: () => Promise<void>;
  label: string;
  timestamp: string;
}

export interface ErrorState {
  toasts: ToastNotification[];
  globalError: ApiError | null;
  isOnline: boolean;
  retryQueue: string[]; // IDs of failed requests to retry
}

export interface FormErrorState {
  fieldErrors: Record<string, FormError[]>;
  globalFormError: string | null;
  isSubmitting: boolean;
  hasValidationErrors: boolean;
}

// API response models
export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

// Component prop types
export interface ErrorDisplayOptions {
  severity?: ErrorSeverity;
  persistent?: boolean;
  showRetry?: boolean;
  autoRetry?: boolean;
  retryDelay?: number;
}

export interface ToastOptions extends ErrorDisplayOptions {
  duration?: number;
  position?: ToastPosition;
}

// Utility types
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorCategory = 
  | 'network'
  | 'validation' 
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'server_error'
  | 'client_error';

export type RecoveryAction = 
  | 'retry'
  | 'refresh'
  | 'login'
  | 'navigate'
  | 'contact_support'
  | 'ignore';

export type ErrorDisplayMode = 
  | 'toast'
  | 'inline'
  | 'modal'
  | 'page'
  | 'boundary';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export type ToastType = 'error' | 'warning' | 'success' | 'info';

// Error context types
export interface ErrorContextValue {
  showError: (error: ApiError | string) => void;
  showToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  clearError: () => void;
  dismissToast: (id: string) => void;
  retryLastAction: () => void;
}

// Form context types
export interface FormContextValue {
  errors: Record<string, FormError[]>;
  setFieldError: (field: string, error: FormError) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

// Component interfaces
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps> | React.ReactElement;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'section' | 'component';
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  level: 'page' | 'section' | 'component';
}

export interface ToastContainerProps {
  notifications: ToastNotification[];
  position?: ToastPosition;
  maxVisible?: number;
  groupSimilar?: boolean;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

export interface FormErrorProps {
  errors: FormError[];
  field?: string;
  showIcon?: boolean;
  className?: string;
  variant?: 'inline' | 'tooltip' | 'popover';
}

export interface LoadingOverlayProps {
  isLoading: boolean;
  error?: ApiError | null;
  onRetry?: () => void;
  children: React.ReactNode;
  showSpinner?: boolean;
  spinnerSize?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}