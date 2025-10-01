/**
 * Dynamic Import Utilities
 * Lazy loading and code splitting helpers
 */

'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import { PageLoader, Spinner } from '@/components/ui/LoadingStates'

/**
 * Dynamic import with custom loading component
 */
export function dynamicImport<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: ComponentType
    ssr?: boolean
  }
) {
  const LoadingComponent = options?.loading || PageLoader
  return dynamic(importFn, {
    loading: () => <LoadingComponent />,
    ssr: options?.ssr ?? true,
  })
}

/**
 * Dynamic import for heavy chart components
 */
export function dynamicChart<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  return dynamic(importFn, {
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    ),
    ssr: false, // Charts don't need SSR
  })
}

/**
 * Dynamic import for modal/dialog components
 */
export function dynamicModal<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  return dynamic(importFn, {
    loading: () => null, // No loading state for modals
    ssr: false, // Modals are client-side only
  })
}

/**
 * Dynamic import for admin-only components
 */
export function dynamicAdminComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  return dynamic(importFn, {
    loading: () => <PageLoader message="Loading admin panel..." />,
    ssr: false,
  })
}

/**
 * Preload component for critical paths
 */
export function preloadComponent(importFn: () => Promise<any>) {
  if (typeof window !== 'undefined') {
    // Preload on browser idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importFn())
    } else {
      setTimeout(() => importFn(), 1)
    }
  }
}

/**
 * Lazy load on intersection (viewport visibility)
 */
export function lazyLoadOnView<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  return dynamic(importFn, {
    loading: () => <div className="h-64" />, // Placeholder to maintain layout
    ssr: false,
  })
}

// Example usage exports for common heavy components
// Uncomment these when components have default exports
// export const LazyChart = dynamicChart(() => import('@/components/charts/LineChart'))
// export const LazyBarChart = dynamicChart(() => import('@/components/charts/BarChart'))
// export const LazyPieChart = dynamicChart(() => import('@/components/charts/PieChart'))

// Lazy load media-related components
// export const LazyMediaGrid = dynamicImport(() => import('@/features/media/components/MediaGrid'))
// export const LazyFileUpload = dynamicModal(() => import('@/features/media/components/FileUpload'))

// Lazy load schedule components
// export const LazyScheduleCalendar = dynamicImport(
//   () => import('@/features/schedules/components/ScheduleCalendar')
// )
// export const LazyScheduleBuilder = dynamicModal(
//   () => import('@/features/schedules/components/ScheduleBuilder')
// )

// Lazy load user management components
// export const LazyUserList = dynamicImport(() => import('@/features/users/components/UserList'))
// export const LazyRoleManager = dynamicModal(() => import('@/features/users/components/RoleManager'))

// Lazy load device components
// export const LazyDeviceList = dynamicImport(() => import('@/features/devices/components/DeviceList'))
