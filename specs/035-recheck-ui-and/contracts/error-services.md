# Error Handling Service Contracts

**Feature**: UI Error Notification Enhancement & API Error Handling  
**Date**: 2025-10-13

## IErrorService Interface

```typescript
export interface IErrorService {
  // Error display
  showError(error: ApiError | string, options?: ErrorDisplayOptions): void;
  showToast(message: string, type?: ToastType, options?: ToastOptions): void;
  
  // Error management
  clearError(): void;
  clearAllErrors(): void;
  dismissToast(id: string): void;
  
  // Error state
  getActiveErrors(): ApiError[];
  getToastNotifications(): ToastNotification[];
  hasActiveErrors(): boolean;
  
  // Error recovery
  retryLastAction(): Promise<void>;
  registerRetryAction(actionId: string, action: () => Promise<void>): void;
}

export interface ErrorDisplayOptions {
  severity?: ErrorSeverity;
  persistent?: boolean;
  showRetry?: boolean;
  autoRetry?: boolean;
  retryDelay?: number;
}

export interface ToastOptions extends ErrorDisplayOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}
```

## IFormErrorHandler Interface

```typescript
export interface IFormErrorHandler {
  // Field validation
  setFieldError(field: string, error: string | FormError): void;
  clearFieldError(field: string): void;
  getFieldErrors(field: string): FormError[];
  
  // Form-level errors
  setFormError(error: string): void;
  clearFormError(): void;
  getFormError(): string | null;
  
  // Validation state
  hasErrors(): boolean;
  hasFieldErrors(field?: string): boolean;
  getErrorCount(): number;
  
  // Error mapping
  mapZodErrors(zodError: ZodError): void;
  mapApiErrors(apiError: ProblemDetails): void;
}
```

## IApiErrorHandler Interface

```typescript
export interface IApiErrorHandler {
  // Request/response handling
  handleRequest(config: AxiosRequestConfig): AxiosRequestConfig;
  handleResponse(response: AxiosResponse): AxiosResponse;
  handleError(error: AxiosError): Promise<never>;
  
  // Retry logic
  shouldRetry(error: AxiosError): boolean;
  getRetryDelay(retryCount: number): number;
  executeWithRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
  
  // Error classification
  classifyError(error: AxiosError): ErrorCategory;
  getSeverity(error: AxiosError): ErrorSeverity;
  getRecoveryActions(error: AxiosError): RecoveryAction[];
}

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: AxiosError) => boolean;
}
```

## IErrorBoundary Interface

```typescript
export interface IErrorBoundary {
  // Error capture
  captureError(error: Error, errorInfo: ErrorInfo): void;
  
  // Recovery
  resetError(): void;
  canRecover(error: Error): boolean;
  
  // Reporting
  reportError(error: Error, context: ErrorContext): void;
  
  // State management
  getErrorState(): ErrorBoundaryState;
  hasError(): boolean;
}

export interface ErrorContext {
  componentStack: string;
  userId?: string;
  page: string;
  action?: string;
  timestamp: string;
}
```

## INotificationService Interface

```typescript
export interface INotificationService {
  // Toast management
  showToast(notification: CreateToastRequest): string;
  dismissToast(id: string): void;
  dismissAllToasts(): void;
  
  // Notification queuing
  queueNotification(notification: CreateToastRequest): void;
  processQueue(): void;
  clearQueue(): void;
  
  // Settings
  setDefaultDuration(duration: number): void;
  setMaxNotifications(max: number): void;
  enableGrouping(enabled: boolean): void;
}

export interface CreateToastRequest {
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
  persistent?: boolean;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}
```

## Backend Error Contracts

### Controller Error Response Contract

```typescript
// Expected from .NET Controllers
export interface ControllerErrorResponse extends ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
  traceId?: string;
}

// Validation error format
export interface ValidationErrorResponse extends ControllerErrorResponse {
  errors: Record<string, string[]>;
  title: 'One or more validation errors occurred.';
  status: 400;
}

// Authentication error format  
export interface AuthenticationErrorResponse extends ControllerErrorResponse {
  title: 'Authentication failed.';
  status: 401;
  detail: string;
}
```

### API Client Contract

```typescript
export interface IDigitalSignageApiClient {
  // Error handling configuration
  configureErrorHandling(config: ApiClientConfig): void;
  
  // Request methods with error handling
  get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  
  // Specialized methods
  uploadFile(url: string, file: File, config?: UploadConfig): Promise<ApiResponse<any>>;
  downloadFile(url: string, config?: RequestConfig): Promise<Blob>;
}

export interface RequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean;
  customErrorHandler?: (error: AxiosError) => void;
  retryConfig?: RetryOptions;
}

export interface UploadConfig extends RequestConfig {
  onUploadProgress?: (progress: number) => void;
}
```

## Hook Contracts

### Error Handling Hooks

```typescript
// Primary error handling hook
export interface UseErrorHandlerResult {
  showError: (error: ApiError | string) => void;
  showToast: (message: string, type?: ToastType) => void;
  clearErrors: () => void;
  errors: ApiError[];
  hasErrors: boolean;
}

// Form error hook
export interface UseFormErrorsResult {
  fieldErrors: Record<string, FormError[]>;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
  hasFieldError: (field: string) => boolean;
}

// API error hook
export interface UseApiErrorResult {
  executeWithErrorHandling: <T>(fn: () => Promise<T>) => Promise<T | null>;
  isLoading: boolean;
  error: ApiError | null;
  retry: () => void;
  clearError: () => void;
}
```

## Component Contracts

### Error Display Components

```typescript
// Error boundary component contract
export interface ErrorBoundaryComponent extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState>;
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
  render(): React.ReactNode;
}

// Toast container contract
export interface ToastContainerComponent extends React.FC<ToastContainerProps> {
  // Component must handle toast lifecycle
  // Position management
  // Animation states
}

export interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxToasts?: number;
  groupSimilar?: boolean;
}
```

## Event Contracts

```typescript
// Error events
export type ErrorEventMap = {
  'error:api': { error: ApiError; requestId: string };
  'error:validation': { field: string; error: FormError };
  'error:network': { error: NetworkError; retryCount: number };
  'error:boundary': { error: Error; componentStack: string };
  'error:cleared': { errorId: string };
};

// Recovery events
export type RecoveryEventMap = {
  'recovery:retry': { actionId: string; attempt: number };
  'recovery:success': { actionId: string; attempts: number };
  'recovery:failed': { actionId: string; finalError: Error };
  'recovery:manual': { action: RecoveryAction };
};

// Event emitter contract
export interface IErrorEventEmitter {
  emit<K extends keyof ErrorEventMap>(event: K, data: ErrorEventMap[K]): void;
  on<K extends keyof ErrorEventMap>(event: K, handler: (data: ErrorEventMap[K]) => void): void;
  off<K extends keyof ErrorEventMap>(event: K, handler: (data: ErrorEventMap[K]) => void): void;
}
```

## Testing Contracts

```typescript
// Test utilities
export interface ErrorTestUtils {
  createMockApiError(status: number, message?: string): ApiError;
  createMockFormError(field: string, message: string): FormError;
  createMockNetworkError(): NetworkError;
  
  // Test helpers
  triggerApiError(client: IDigitalSignageApiClient, errorType: ErrorCategory): void;
  expectToastDisplayed(message: string): void;
  expectErrorCleared(): void;
}

// Mock implementations
export interface MockErrorService extends IErrorService {
  // Spy methods for testing
  getShowErrorCalls(): Array<{ error: ApiError | string; options?: ErrorDisplayOptions }>;
  getToastCalls(): Array<{ message: string; type?: ToastType; options?: ToastOptions }>;
  reset(): void;
}
```