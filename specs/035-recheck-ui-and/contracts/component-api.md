# Component API Contracts

**Feature**: UI Error Notification Enhancement & API Error Handling  
**Date**: 2025-10-13

## Core Error Components

### ErrorBoundary Component

```typescript
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps> | React.ReactElement;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'section' | 'component';
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  level: 'page' | section' | 'component';
}

// Usage Contract
<ErrorBoundary
  level="page"
  fallback={ErrorFallback}
  onError={(error, errorInfo) => reportError(error, errorInfo)}
  resetKeys={[userId, pageId]}
>
  {children}
</ErrorBoundary>
```

### Toast Notification Components

```typescript
export interface ToastProps {
  notification: ToastNotification;
  onDismiss: (id: string) => void;
  onAction?: (actionId: string) => void;
  position: ToastPosition;
}

export interface ToastContainerProps {
  notifications: ToastNotification[];
  position?: ToastPosition;
  maxVisible?: number;
  groupSimilar?: boolean;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

export interface ErrorToastProps extends ToastProps {
  onRetry?: () => void;
  showDetails?: boolean;
  contactSupport?: () => void;
}

// Usage Contract
<ToastContainer
  notifications={notifications}
  position="top-right"
  maxVisible={5}
  groupSimilar={true}
  onDismiss={dismissToast}
  onDismissAll={clearAllToasts}
/>
```

### Form Error Components

```typescript
export interface FormErrorProps {
  errors: FormError[];
  field?: string;
  showIcon?: boolean;
  className?: string;
  variant?: 'inline' | 'tooltip' | 'popover';
}

export interface FormFieldErrorProps extends FormErrorProps {
  field: string;
  touched?: boolean;
  showOnlyWhenTouched?: boolean;
}

export interface FormSummaryErrorProps {
  errors: Record<string, FormError[]>;
  title?: string;
  scrollToError?: boolean;
  onFieldClick?: (field: string) => void;
}

// Usage Contract
<FormFieldError
  field="email"
  errors={fieldErrors.email}
  touched={touchedFields.email}
  variant="inline"
  showIcon={true}
/>

<FormSummaryError
  errors={allFieldErrors}
  title="Please correct the following errors:"
  scrollToError={true}
  onFieldClick={scrollToField}
/>
```

## Loading State Components

### LoadingOverlay Component

```typescript
export interface LoadingOverlayProps {
  isLoading: boolean;
  error?: ApiError | null;
  onRetry?: () => void;
  children: React.ReactNode;
  showSpinner?: boolean;
  spinnerSize?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}

export interface LoadingStateProps {
  isLoading: boolean;
  error?: ApiError | null;
  onRetry?: () => void;
  loadingText?: string;
  errorText?: string;
  retryText?: string;
}

// Usage Contract
<LoadingOverlay
  isLoading={isSubmitting}
  error={submitError}
  onRetry={retrySubmit}
  showSpinner={true}
  overlay={true}
>
  <FormContent />
</LoadingOverlay>
```

### Skeleton Loading Components

```typescript
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export interface SkeletonTableProps {
  rows: number;
  columns: number;
  showHeader?: boolean;
}

export interface SkeletonCardProps {
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
}

// Usage Contract
<SkeletonTable rows={5} columns={4} showHeader={true} />
<SkeletonCard showImage={true} showTitle={true} showActions={false} />
```

## Alert & Banner Components

### ErrorAlert Component

```typescript
export interface ErrorAlertProps {
  error: ApiError | string;
  variant?: 'error' | 'warning' | 'info';
  severity?: ErrorSeverity;
  dismissible?: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
  showDetails?: boolean;
  className?: string;
}

export interface BannerAlertProps {
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  persistent?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  actions?: BannerAction[];
}

export interface BannerAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// Usage Contract
<ErrorAlert
  error={apiError}
  variant="error"
  severity="high"
  dismissible={true}
  onDismiss={clearError}
  onRetry={retryAction}
  showDetails={isDevelopment}
/>
```

## Page-Level Error Components

### ErrorPage Component

```typescript
export interface ErrorPageProps {
  error: Error | ApiError;
  statusCode?: number;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
  contactInfo?: ContactInfo;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  supportUrl?: string;
}

export interface NotFoundPageProps {
  resource?: string;
  searchQuery?: string;
  suggestions?: string[];
  onSearch?: (query: string) => void;
}

// Usage Contract
<ErrorPage
  error={pageError}
  statusCode={500}
  title="Something went wrong"
  message="We're having trouble loading this page"
  showRetryButton={true}
  onRetry={retryPageLoad}
  contactInfo={{ supportUrl: '/support' }}
/>
```

## Utility Components

### ErrorDetails Component

```typescript
export interface ErrorDetailsProps {
  error: Error | ApiError;
  showStackTrace?: boolean;
  showMetadata?: boolean;
  showUserActions?: boolean;
  onCopyError?: () => void;
  onReportError?: () => void;
  className?: string;
}

export interface ErrorMetadata {
  timestamp: string;
  userId?: string;
  sessionId?: string;
  userAgent: string;
  url: string;
  buildVersion?: string;
}

// Usage Contract
<ErrorDetails
  error={error}
  showStackTrace={isDevelopment}
  showMetadata={true}
  showUserActions={true}
  onCopyError={copyErrorToClipboard}
  onReportError={sendErrorReport}
/>
```

### RetryButton Component

```typescript
export interface RetryButtonProps {
  onRetry: () => void | Promise<void>;
  isRetrying?: boolean;
  disabled?: boolean;
  retryCount?: number;
  maxRetries?: number;
  cooldownMs?: number;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

// Usage Contract
<RetryButton
  onRetry={retryApiCall}
  isRetrying={isLoading}
  retryCount={attempts}
  maxRetries={3}
  cooldownMs={1000}
  variant="secondary"
>
  Try Again
</RetryButton>
```

## Layout Integration Components

### ErrorLayout Component

```typescript
export interface ErrorLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  showErrorBoundary?: boolean;
  showToastContainer?: boolean;
  toastPosition?: ToastPosition;
}

export interface AdminErrorLayoutProps extends ErrorLayoutProps {
  showSidebar?: boolean;
  showBreadcrumbs?: boolean;
  showUserMenu?: boolean;
  onNavigate?: (path: string) => void;
}

// Usage Contract
<AdminErrorLayout
  showNavigation={true}
  showSidebar={true}
  showErrorBoundary={true}
  showToastContainer={true}
  toastPosition="top-right"
>
  {children}
</AdminErrorLayout>
```

## Hook-Based Component Contracts

### Error Hook Components

```typescript
// Component using error hooks
export interface ErrorAwareComponentProps {
  onError?: (error: Error) => void;
  showErrorBoundary?: boolean;
  showToastOnError?: boolean;
}

// HOC for error handling
export interface WithErrorHandlingProps {
  errorBoundary?: boolean;
  errorFallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

// Usage Pattern
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & WithErrorHandlingProps>;

const ErrorAwareUserList = withErrorHandling(UserList);
```

## Validation Integration

### Form Error Integration

```typescript
export interface FormErrorIntegrationProps {
  form: UseFormReturn<any>;
  onSubmitError?: (error: ApiError) => void;
  showFieldErrors?: boolean;
  showSummaryError?: boolean;
  scrollToFirstError?: boolean;
}

export interface ZodErrorDisplayProps {
  zodError: ZodError;
  fieldMapping?: Record<string, string>;
  showFieldNames?: boolean;
}

// Usage Contract
<FormErrorIntegration
  form={form}
  onSubmitError={handleSubmitError}
  showFieldErrors={true}
  showSummaryError={true}
  scrollToFirstError={true}
/>
```

## Testing Component Contracts

```typescript
// Test component props
export interface ErrorComponentTestProps {
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

// All error components must extend this for testing
export interface TestableErrorComponent extends ErrorComponentTestProps {
  className?: string;
  id?: string;
}
```

## Accessibility Contracts

```typescript
export interface AccessibilityErrorProps {
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  role?: string;
}

// Screen reader announcements
export interface ScreenReaderAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  delay?: number;
}
```