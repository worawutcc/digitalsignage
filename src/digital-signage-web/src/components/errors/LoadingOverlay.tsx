// LoadingOverlay component for displaying loading states with optional error handling
// Provides consistent loading experience across the application

'use client';

import React from 'react';
import { LoadingOverlayProps } from '@/types/errors';

/**
 * Spinner component for loading animations
 */
function Spinner({ size = 'medium', className = '' }: { 
  size?: 'small' | 'medium' | 'large'; 
  className?: string;
}) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Skeleton placeholder component for content loading
 */
export function SkeletonPlaceholder({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-300 rounded ${
            index === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * LoadingOverlay component for full-screen or container loading states
 */
export function LoadingOverlay({
  isLoading,
  error = null,
  onRetry,
  children,
  showSpinner = true,
  spinnerSize = 'medium',
  overlay = true,
}: LoadingOverlayProps) {
  // Don't render anything if not loading and no error
  if (!isLoading && !error) {
    return children || null;
  }

  // Error state
  if (error && !isLoading) {
    return (
      <div
        className={`
          ${overlay ? 'absolute inset-0 bg-white/80 backdrop-blur-sm' : ''}
          flex items-center justify-center p-4
        `}
        data-testid="loading-overlay-error"
      >
        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
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
          </div>
          
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Loading Error
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {error.detail || error.title || 'Failed to load content'}
          </p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div
      className={`
        ${overlay ? 'absolute inset-0 bg-white/80 backdrop-blur-sm' : ''}
        flex items-center justify-center p-4
      `}
      data-testid="loading-overlay"
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      <div className="text-center">
        {/* Spinner */}
        {showSpinner && (
          <div className="flex justify-center mb-3">
            <Spinner size={spinnerSize} className="text-blue-600" />
          </div>
        )}

        {/* Loading message */}
        <p className="text-sm font-medium text-gray-900 mb-2">Loading...</p>
      </div>

      {/* Screen reader content */}
      <div className="sr-only">Loading content</div>
    </div>
  );
}

/**
 * Inline loading component for smaller areas
 */
export function InlineLoading({
  message = 'Loading...',
  size = 'small',
  className = '',
}: {
  message?: string;
  size?: 'small' | 'medium';
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`} role="status">
      <Spinner size={size} className="text-gray-500" />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
}

/**
 * Button loading state component
 */
export function ButtonLoading({
  loading = false,
  children,
  loadingText = 'Loading...',
  className = '',
  disabled = false,
  ...props
}: {
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}) {
  return (
    <button
      className={`
        relative
        ${loading ? 'cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded">
          <div className="flex items-center gap-2">
            <Spinner size="small" />
            <span className="text-sm">{loadingText}</span>
          </div>
        </div>
      )}
      
      {/* Button content */}
      <div className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </div>
    </button>
  );
}

/**
 * Page loading component for full-page loading states
 */
export function PageLoading({
  message = 'Loading page...',
  showLogo = true,
}: {
  message?: string;
  showLogo?: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Logo placeholder */}
        {showLogo && (
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        <div className="flex justify-center mb-4">
          <Spinner size="large" className="text-blue-600" />
        </div>

        {/* Loading message */}
        <p className="text-lg font-medium text-gray-900 mb-2">{message}</p>
        <p className="text-sm text-gray-500">Please wait while we prepare your content</p>
      </div>
    </div>
  );
}

/**
 * Hook for managing loading states with error handling
 */
export function useLoadingState(initialLoading = false) {
  const [isLoading, setIsLoading] = React.useState(initialLoading);
  const [error, setError] = React.useState<any>(null);
  const [progress, setProgress] = React.useState(0);

  const startLoading = React.useCallback((message?: string) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
    setProgress(100);
  }, []);

  const setLoadingError = React.useCallback((error: any) => {
    setIsLoading(false);
    setError(error);
  }, []);

  const reset = React.useCallback(() => {
    setIsLoading(false);
    setError(null);
    setProgress(0);
  }, []);

  return {
    isLoading,
    error,
    progress,
    startLoading,
    stopLoading,
    setLoadingError,
    setProgress,
    reset,
  };
}