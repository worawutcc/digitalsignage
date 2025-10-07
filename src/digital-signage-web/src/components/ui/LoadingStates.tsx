/**
 * Loading States and Skeleton Components
 * Reusable loading indicators and skeleton screens for better UX
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import {
  SpinnerProps,
  LoadingCardProps,
  LoadingTableProps,
} from './LoadingStates.types'

/**
 * Base Spinner Component
 */

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * Loading Overlay
 * Full-screen or contained loading overlay
 */
export interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  fullScreen?: boolean
  className?: string
}

export function LoadingOverlay({
  isLoading,
  message,
  fullScreen = false,
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80',
        fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        {message && (
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{message}</p>
        )}
      </div>
    </div>
  )
}

/**
 * Skeleton Base Component
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  animate?: boolean
}

export function Skeleton({ className, animate = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-gray-200 dark:bg-gray-700',
        animate && 'animate-pulse',
        className
      )}
      {...props}
    />
  )
}

/**
 * Skeleton Text Lines
 */
export interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 && 'w-3/4')}
        />
      ))}
    </div>
  )
}

/**
 * Skeleton Card
 */
export interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800', className)}>
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <SkeletonText lines={3} />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton Table
 */
export interface SkeletonTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton List
 */
export interface SkeletonListProps {
  items?: number
  className?: string
}

export function SkeletonList({ items = 5, className }: SkeletonListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton Grid
 */
export interface SkeletonGridProps {
  items?: number
  columns?: number
  className?: string
}

export function SkeletonGrid({ items = 6, columns = 3, className }: SkeletonGridProps) {
  return (
    <div
      className={cn('grid gap-6', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton Avatar
 */
export interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  return <Skeleton className={cn('rounded-full', sizeClasses[size], className)} />
}

/**
 * Skeleton Form
 */
export interface SkeletonFormProps {
  fields?: number
  className?: string
}

export function SkeletonForm({ fields = 4, className }: SkeletonFormProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

/**
 * Skeleton Chart
 */
export interface SkeletonChartProps {
  className?: string
}

export function SkeletonChart({ className }: SkeletonChartProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton className="h-6 w-1/3" />
      <div className="flex items-end justify-between gap-2 h-64">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton Dashboard Stats
 */
export function SkeletonDashboardStats({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton Device Card
 */
export function SkeletonDeviceCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800', className)}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton Media Grid
 */
export function SkeletonMediaGrid({ items = 12, className }: { items?: number; className?: string }) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <Skeleton className="aspect-video w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Loading Button State
 */
export interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
}

export function LoadingButtonContent({ isLoading, children, loadingText }: LoadingButtonProps) {
  if (isLoading) {
    return (
      <span className="flex items-center gap-2">
        <Spinner size="sm" />
        {loadingText || 'Loading...'}
      </span>
    )
  }
  return <>{children}</>
}

/**
 * Page Loading State
 */
export function PageLoader({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        {message && (
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{message}</p>
        )}
      </div>
    </div>
  )
}

/**
 * Empty State
 */
export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex min-h-[400px] flex-col items-center justify-center p-8 text-center', className)}>
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-md">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
