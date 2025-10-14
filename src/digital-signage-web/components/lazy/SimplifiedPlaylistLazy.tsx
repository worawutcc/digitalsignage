'use client';

import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

/**
 * Simplified Lazy Loading Components for Playlist Management
 * Only includes existing components with proper error handling
 */

// ================================
// LAZY COMPONENT IMPORTS (Only existing components)
// ================================

const PlaylistForm = lazy(() => import('../../src/features/playlists/components/PlaylistForm'));

// PlaylistAnalytics temporarily disabled due to missing UI dependencies
// const PlaylistAnalytics = lazy(() => 
//   import('../../src/features/playlists/components/PlaylistAnalytics').then(mod => ({ 
//     default: mod.PlaylistAnalytics 
//   }))
// );

// ================================
// SKELETON COMPONENTS
// ================================

export const PlaylistFormSkeleton: React.FC = () => (
  <div className="animate-pulse bg-white rounded-lg border border-gray-200 p-6 space-y-4">
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      <div className="h-10 bg-gray-300 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      <div className="h-20 bg-gray-300 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      <div className="h-10 bg-gray-300 rounded"></div>
    </div>
    <div className="flex justify-end space-x-3">
      <div className="h-10 bg-gray-300 rounded w-20"></div>
      <div className="h-10 bg-gray-300 rounded w-20"></div>
    </div>
  </div>
);

export const PlaylistAnalyticsSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
      ))}
    </div>
    
    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-300 rounded"></div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);

// ================================
// ERROR COMPONENTS
// ================================

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentName: string;
}

const ErrorFallbackComponent: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary, 
  componentName 
}) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <div className="text-red-600 mb-2">
      <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-red-800 mb-2">
      Error loading {componentName}
    </h3>
    <p className="text-red-600 text-sm mb-4">
      {error.message || 'An unexpected error occurred'}
    </p>
    <button
      onClick={resetErrorBoundary}
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

// ================================
// LAZY WRAPPER COMPONENT
// ================================

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback: React.ComponentType;
  componentName: string;
  className?: string;
}

const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback: FallbackComponent, 
  componentName,
  className = ""
}) => (
  <ErrorBoundary
    FallbackComponent={(props) => (
      <ErrorFallbackComponent {...props} componentName={componentName} />
    )}
    onError={(error) => {
      console.error(`Error in ${componentName}:`, error);
    }}
  >
    <Suspense fallback={<FallbackComponent />}>
      <div className={className}>
        {children}
      </div>
    </Suspense>
  </ErrorBoundary>
);

// ================================
// EXPORTED LAZY COMPONENTS
// ================================

export const LazyPlaylistForm: React.FC<any> = (props) => (
  <LazyWrapper
    fallback={PlaylistFormSkeleton}
    componentName="Playlist Form"
  >
    <PlaylistForm {...props} />
  </LazyWrapper>
);

// LazyPlaylistAnalytics temporarily disabled
// export const LazyPlaylistAnalytics: React.FC<any> = (props) => (
//   <LazyWrapper
//     fallback={PlaylistAnalyticsSkeleton}
//     componentName="Playlist Analytics"
//   >
//     <PlaylistAnalytics {...props} />
//   </LazyWrapper>
// );

// ================================
// PROGRESSIVE LOADING UTILITIES
// ================================

export const PlaylistLazyUtils = {
  /**
   * Preload components for better UX
   */
  preloadComponents: {
    preloadForm: () => import('../../src/features/playlists/components/PlaylistForm'),
    // preloadAnalytics: () => import('../../src/features/playlists/components/PlaylistAnalytics'), // Disabled
  },

  /**
   * Load components based on user interaction patterns
   */
  loadByPriority: {
    immediate: ['PlaylistForm'],
    high: [], // ['PlaylistAnalytics'] - disabled
    medium: [],
    low: []
  },

  /**
   * Intersection observer for lazy loading triggers
   */
  createLazyTrigger: (callback: () => void, options = {}) => {
    if (typeof window === 'undefined') return null;
    
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px', ...options }
    );
  }
};

// ================================
// PERFORMANCE MONITORING
// ================================

export const LazyLoadMonitor = {
  /**
   * Track component loading times
   */
  trackLoadTime: (componentName: string, startTime: number) => {
    const loadTime = performance.now() - startTime;
    console.log(`${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    
    // You can integrate with analytics here
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'lazy_load_time', {
        component_name: componentName,
        load_time: loadTime,
        event_category: 'performance'
      });
    }
  },

  /**
   * Monitor lazy loading errors
   */
  trackError: (componentName: string, error: Error) => {
    console.error(`Lazy loading error in ${componentName}:`, error);
    
    // You can integrate with error tracking here
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'lazy_load_error', {
        component_name: componentName,
        error_message: error.message,
        event_category: 'error'
      });
    }
  }
};