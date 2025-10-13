// Error utility functions for common error handling patterns
// Provides helper functions for error processing and mapping

import { ApiError, FormError, ProblemDetails, ErrorCategory, ErrorSeverity } from '@/types/errors';
import { ZodError, ZodIssue } from 'zod';

/**
 * Convert ProblemDetails from backend to our ApiError format
 */
export function problemDetailsToApiError(problemDetails: ProblemDetails): ApiError {
  const apiError: ApiError = {
    title: problemDetails.title,
    status: problemDetails.status,
    timestamp: new Date().toISOString(),
  };

  if (problemDetails.type) {
    apiError.type = problemDetails.type;
  }

  if (problemDetails.detail) {
    apiError.detail = problemDetails.detail;
  }

  if (problemDetails.errors) {
    apiError.errors = problemDetails.errors;
  }

  return apiError;
}

/**
 * Convert Zod validation errors to FormError array
 */
export function zodErrorToFormErrors(zodError: ZodError): FormError[] {
  return zodError.issues.map((issue: ZodIssue) => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * Convert API validation errors to FormError array
 */
export function apiValidationErrorsToFormErrors(errors: Record<string, string[]>): FormError[] {
  const formErrors: FormError[] = [];
  
  Object.entries(errors).forEach(([field, messages]) => {
    messages.forEach(message => {
      formErrors.push({
        field: field.toLowerCase(),
        message,
        code: 'validation',
      });
    });
  });
  
  return formErrors;
}

/**
 * Get user-friendly error message for common HTTP status codes
 */
export function getStatusMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'The request was invalid. Please check your input and try again.',
    401: 'You need to log in to access this resource.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This action conflicts with existing data.',
    422: 'The submitted data is invalid. Please correct the errors and try again.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'An internal server error occurred. Please try again later.',
    502: 'The server is temporarily unavailable. Please try again later.',
    503: 'The service is temporarily unavailable. Please try again later.',
    504: 'The request timed out. Please try again.',
  };
  
  return messages[status] || (status >= 500 
    ? 'A server error occurred. Please try again later.' 
    : 'An error occurred. Please try again.');
}

/**
 * Determine if an error is retryable based on its characteristics
 */
export function isRetryableError(error: ApiError): boolean {
  // Network errors (status 0) are retryable
  if (error.status === 0) return true;
  
  // Server errors (5xx) are retryable
  if (error.status >= 500) return true;
  
  // Rate limiting (429) is retryable
  if (error.status === 429) return true;
  
  // Request timeout (408) is retryable
  if (error.status === 408) return true;
  
  return false;
}

/**
 * Get error severity based on status code and context
 */
export function getErrorSeverityFromStatus(status: number): ErrorSeverity {
  if (status === 0) return 'high'; // Network error
  if (status >= 500) return 'critical'; // Server error
  if (status === 401 || status === 403) return 'high'; // Auth errors
  if (status === 404) return 'medium'; // Not found
  if (status >= 400) return 'low'; // Client validation errors
  return 'low';
}

/**
 * Categorize error based on status code
 */
export function categorizeError(status: number): ErrorCategory {
  if (status === 0) return 'network';
  if (status === 401) return 'authentication';
  if (status === 403) return 'authorization';
  if (status === 404) return 'not_found';
  if (status >= 500) return 'server_error';
  if (status >= 400) return 'validation';
  return 'client_error';
}

/**
 * Create a standardized error for network failures
 */
export function createNetworkError(message?: string): ApiError {
  return {
    title: 'Network Error',
    status: 0,
    detail: message || 'Unable to connect to the server. Please check your internet connection.',
    timestamp: new Date().toISOString(),
    type: 'network_error',
  };
}

/**
 * Create a standardized error for timeout scenarios
 */
export function createTimeoutError(timeout: number): ApiError {
  return {
    title: 'Request Timeout',
    status: 408,
    detail: `The request took longer than ${timeout}ms to complete. Please try again.`,
    timestamp: new Date().toISOString(),
    type: 'timeout_error',
  };
}

/**
 * Sanitize error message for user display (remove sensitive info)
 */
export function sanitizeErrorMessage(message: string): string {
  // Remove SQL errors, stack traces, and other sensitive information
  const sanitized = message
    .replace(/\b(password|token|key|secret|auth)\s*[:=]\s*\S+/gi, '$1: [REDACTED]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL]')
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]')
    .replace(/at\s+[\w.]+\s*\([^)]*\)/g, '') // Stack trace lines
    .replace(/^\s*at\s+.*$/gm, '') // Full stack trace lines
    .trim();
  
  return sanitized || 'An error occurred while processing your request.';
}

/**
 * Group similar errors to reduce noise
 */
export function groupSimilarErrors(errors: ApiError[]): Array<ApiError & { count?: number }> {
  const grouped = new Map<string, ApiError & { count: number }>();
  
  errors.forEach(error => {
    const key = `${error.status}-${error.title}`;
    
    if (grouped.has(key)) {
      grouped.get(key)!.count++;
    } else {
      grouped.set(key, { ...error, count: 1 });
    }
  });
  
  return Array.from(grouped.values());
}

/**
 * Check if error message indicates a specific condition
 */
export function isAuthenticationError(error: ApiError): boolean {
  return error.status === 401 || 
         error.title.toLowerCase().includes('unauthorized') ||
         error.title.toLowerCase().includes('authentication');
}

export function isValidationError(error: ApiError): boolean {
  return error.status === 400 || 
         error.status === 422 ||
         !!(error.errors && Object.keys(error.errors).length > 0);
}

export function isNetworkError(error: ApiError): boolean {
  return error.status === 0 || 
         error.type === 'network_error' ||
         error.title.toLowerCase().includes('network');
}

/**
 * Format error for logging purposes
 */
export function formatErrorForLogging(error: ApiError, context?: Record<string, any>): string {
  const logEntry = {
    timestamp: error.timestamp,
    status: error.status,
    title: error.title,
    detail: error.detail,
    type: error.type,
    context,
  };
  
  return JSON.stringify(logEntry, null, 2);
}

/**
 * Create error ID for tracking and deduplication
 */
export function createErrorId(error: ApiError): string {
  const components = [
    error.status.toString(),
    error.title.replace(/\s+/g, '_').toLowerCase(),
    error.detail?.slice(0, 50).replace(/\s+/g, '_').toLowerCase() || '',
  ];
  
  return components.join('-');
}

/**
 * Determine if two errors are similar enough to be grouped
 */
export function areErrorsSimilar(error1: ApiError, error2: ApiError): boolean {
  return error1.status === error2.status && 
         error1.title === error2.title &&
         Math.abs(new Date(error1.timestamp).getTime() - new Date(error2.timestamp).getTime()) < 60000; // Within 1 minute
}

/**
 * Get suggested retry delay based on error type and attempt count
 */
export function getRetryDelay(error: ApiError, attemptCount: number): number {
  const baseDelay = 1000; // 1 second
  
  // Rate limiting - use longer delays
  if (error.status === 429) {
    return Math.min(baseDelay * Math.pow(2, attemptCount + 2), 60000); // Max 1 minute
  }
  
  // Server errors - moderate backoff
  if (error.status >= 500) {
    return Math.min(baseDelay * Math.pow(2, attemptCount), 30000); // Max 30 seconds
  }
  
  // Network errors - quick retry
  if (error.status === 0) {
    return Math.min(baseDelay * Math.pow(1.5, attemptCount), 10000); // Max 10 seconds
  }
  
  return baseDelay;
}