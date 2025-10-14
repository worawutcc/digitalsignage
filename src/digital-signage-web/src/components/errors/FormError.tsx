// FormError component for displaying form validation errors
// Provides consistent error display for form fields and global form errors

'use client';

import React from 'react';
import { FormError, FormErrorProps } from '@/types/errors';

/**
 * Single form error display component
 */
export function FormErrorMessage({ 
  error, 
  showIcon = true,
  className = '',
}: { 
  error: FormError; 
  showIcon?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-1 text-red-600 ${className}`} role="alert">
      {showIcon && (
        <svg 
          className="w-4 h-4 mt-0.5 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      )}
      <span className="text-sm font-medium">{error.message}</span>
    </div>
  );
}

/**
 * Multiple form errors display component
 */
export function FormErrorsList({
  errors,
  field,
  showIcon = true,
  className = '',
  variant = 'inline',
}: FormErrorProps) {
  // Filter errors by field if specified
  const displayErrors = field 
    ? errors.filter(error => error.field === field)
    : errors;

  // Don't render if no errors
  if (displayErrors.length === 0) {
    return null;
  }

  // Inline variant (default)
  if (variant === 'inline') {
    return (
      <div className={`space-y-1 ${className}`}>
        {displayErrors.map((error, index) => (
          <FormErrorMessage 
            key={`${error.field}-${index}`}
            error={error}
            showIcon={showIcon}
          />
        ))}
      </div>
    );
  }

  // Tooltip variant
  if (variant === 'tooltip') {
    return (
      <div className={`relative group ${className}`}>
        {/* Tooltip trigger icon */}
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 text-red-500 cursor-help" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>

        {/* Tooltip content */}
        <div className="absolute z-10 invisible group-hover:visible bottom-full left-0 mb-2 p-2 bg-red-600 text-white text-sm rounded shadow-lg min-w-max max-w-xs">
          {displayErrors.map((error, index) => (
            <div key={`${error.field}-${index}`} className="mb-1 last:mb-0">
              {error.message}
            </div>
          ))}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
        </div>
      </div>
    );
  }

  // Popover variant
  if (variant === 'popover') {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className={`relative ${className}`}>
        {/* Popover trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center p-1 rounded text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </button>

        {/* Popover content */}
        {isOpen && (
          <div className="absolute z-20 bottom-full left-0 mb-2 p-3 bg-white border border-red-200 rounded-lg shadow-lg min-w-max max-w-xs">
            <div className="space-y-2">
              {displayErrors.map((error, index) => (
                <div key={`${error.field}-${index}`} className="text-sm text-red-700">
                  <div className="font-medium">{error.field}</div>
                  <div>{error.message}</div>
                </div>
              ))}
            </div>
            {/* Popover arrow */}
            <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
          </div>
        )}

        {/* Backdrop to close popover */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  return null;
}

/**
 * Field wrapper component that includes error display
 */
export function FormFieldWrapper({
  children,
  errors = [],
  field,
  label,
  required = false,
  className = '',
  errorVariant = 'inline',
  showErrorIcon = true,
}: {
  children: React.ReactNode;
  errors?: FormError[];
  field?: string;
  label?: string;
  required?: boolean;
  className?: string;
  errorVariant?: 'inline' | 'tooltip' | 'popover';
  showErrorIcon?: boolean;
}) {
  const fieldErrors = field ? errors.filter(error => error.field === field) : [];
  const hasErrors = fieldErrors.length > 0;

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <div className="flex items-center gap-2">
          <label className={`text-sm font-medium ${hasErrors ? 'text-red-700' : 'text-gray-700'}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {/* Error indicator for tooltip/popover variants */}
          {hasErrors && errorVariant !== 'inline' && (
            <FormErrorsList
              errors={fieldErrors}
              variant={errorVariant}
              showIcon={showErrorIcon}
            />
          )}
        </div>
      )}

      {/* Field input */}
      <div className={hasErrors ? 'relative' : ''}>
        {children}
        
        {/* Error border indicator */}
        {hasErrors && (
          <div className="absolute inset-0 border-2 border-red-300 rounded pointer-events-none" />
        )}
      </div>

      {/* Inline errors */}
      {hasErrors && errorVariant === 'inline' && (
        <FormErrorsList
          errors={fieldErrors}
          variant="inline"
          showIcon={showErrorIcon}
        />
      )}
    </div>
  );
}

/**
 * Global form errors component for non-field-specific errors
 */
export function GlobalFormErrors({
  errors,
  title = 'Please correct the following errors:',
  className = '',
  onDismiss,
}: {
  errors: FormError[];
  title?: string;
  className?: string;
  onDismiss?: () => void;
}) {
  // Filter out field-specific errors to show only global ones
  const globalErrors = errors.filter(error => !error.field || error.field === 'global');

  if (globalErrors.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-md bg-red-50 border border-red-200 p-4 ${className}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-red-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          
          <div className="mt-2 text-sm text-red-700">
            {globalErrors.length === 1 ? (
              <p>{globalErrors[0]?.message}</p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {globalErrors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for managing form errors state
 */
export function useFormErrors() {
  const [errors, setErrors] = React.useState<FormError[]>([]);

  const addError = React.useCallback((error: FormError) => {
    setErrors(prev => {
      // Remove existing error for the same field
      const filtered = prev.filter(e => e.field !== error.field);
      return [...filtered, error];
    });
  }, []);

  const removeError = React.useCallback((field: string) => {
    setErrors(prev => prev.filter(e => e.field !== field));
  }, []);

  const clearErrors = React.useCallback(() => {
    setErrors([]);
  }, []);

  const hasErrors = errors.length > 0;
  const getFieldErrors = React.useCallback((field: string) => 
    errors.filter(e => e.field === field), [errors]);

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    hasErrors,
    getFieldErrors,
  };
}