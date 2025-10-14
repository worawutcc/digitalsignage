# Data Model: UI Error Notification Enhancement

**Feature**: UI Error Notification Enhancement & API Error Handling  
**Date**: 2025-10-13

## Frontend Data Models

### Error State Models

```typescript
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
```

### Redux State Models

```typescript
// Error slice state
export interface ErrorState {
  toasts: ToastNotification[];
  globalError: ApiError | null;
  isOnline: boolean;
  retryQueue: string[]; // IDs of failed requests to retry
}

// Form error state
export interface FormErrorState {
  fieldErrors: Record<string, FormError[]>;
  globalFormError: string | null;
  isSubmitting: boolean;
  hasValidationErrors: boolean;
}
```

### API Response Models

```typescript
// Standardized API error response
export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

// Success response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

// Paginated response model
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
```

## Error Display Component Props

```typescript
// Error boundary component
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

// Toast notification component
export interface ErrorToastProps {
  notification: ToastNotification;
  onDismiss: (id: string) => void;
  onRetry?: () => void;
}

// Form error component  
export interface FormErrorProps {
  errors: FormError[];
  fieldName?: string;
  className?: string;
}

// Loading state component
export interface LoadingStateProps {
  isLoading: boolean;
  error?: ApiError | null;
  onRetry?: () => void;
  children?: React.ReactNode;
}
```

## Error Context Models

```typescript
// Error context for React context API
export interface ErrorContextValue {
  showError: (error: ApiError | string) => void;
  showToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  clearError: () => void;
  dismissToast: (id: string) => void;
  retryLastAction: () => void;
}

// Form context for error handling
export interface FormContextValue {
  errors: Record<string, FormError[]>;
  setFieldError: (field: string, error: FormError) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}
```

## HTTP Client Error Models

```typescript
// Axios error response
export interface AxiosErrorResponse {
  status: number;
  statusText: string;
  data: ProblemDetails;
  headers: Record<string, string>;
}

// Request retry configuration
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition: (error: AxiosError) => boolean;
}

// API client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retry: RetryConfig;
  errorHandler: (error: AxiosError) => void;
}
```

## Form Validation Models

```typescript
// Zod schema error mapping
export interface ZodErrorMapping {
  field: string;
  zodPath: string;
  message: string;
  code: ZodIssueCode;
}

// Form submission state
export interface FormSubmissionState {
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
  lastSubmitResult?: 'success' | 'error' | 'validation_error';
  errors: Record<string, FormError[]>;
}
```

## Analytics & Monitoring Models

```typescript
// Error tracking for analytics
export interface ErrorMetrics {
  errorId: string;
  errorType: 'api_error' | 'validation_error' | 'network_error' | 'client_error';
  page: string;
  action: string;
  statusCode?: number;
  userAgent: string;
  timestamp: string;
  userId?: string;
}

// Performance metrics
export interface PerformanceMetrics {
  apiResponseTime: number;
  errorRecoveryTime: number;
  userRetryCount: number;
  errorFrequency: number;
}
```

## Utility Type Definitions

```typescript
// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Error categories
export type ErrorCategory = 
  | 'network'
  | 'validation' 
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'server_error'
  | 'client_error';

// Recovery actions
export type RecoveryAction = 
  | 'retry'
  | 'refresh'
  | 'login'
  | 'navigate'
  | 'contact_support'
  | 'ignore';

// Error display modes
export type ErrorDisplayMode = 
  | 'toast'
  | 'inline'
  | 'modal'
  | 'page'
  | 'boundary';
```

## Data Flow Summary

1. **API Errors**: HTTP client catches errors → Maps to `ProblemDetails` → Dispatches to Redux error slice → UI components render error states

2. **Form Validation**: Zod validation fails → Maps to `FormError[]` → Form components display field errors → Global form error in toast

3. **Network Errors**: Connection failures → Retry queue management → Offline state indicators → Auto-retry when online

4. **Component Errors**: React Error Boundary catches → Error fallback UI → Optional error reporting → User recovery actions

5. **State Management**: All error states in Redux store → Selectors for component consumption → Actions for error lifecycle management