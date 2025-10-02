'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { BreadcrumbProps } from './Breadcrumb.types'

/**
 * Breadcrumb Navigation Component
 * 
 * Provides accessible breadcrumb navigation with Next.js routing support.
 * Follows WAI-ARIA breadcrumb pattern for screen readers.
 * 
 * @example
 * ```tsx
 * <Breadcrumb items={[
 *   { label: 'Dashboard', href: '/dashboard' },
 *   { label: 'Users', href: '/users' },
 *   { label: 'John Doe', current: true }
 * ]} />
 * ```
 */
export function Breadcrumb({ 
  items, 
  separator = <ChevronRight className="h-4 w-4" />,
  className = '' 
}: BreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      <ol className="flex items-center space-x-2">
        {/* Home Link */}
        <li>
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isCurrent = item.current || isLast

          return (
            <li key={index} className="flex items-center space-x-2">
              {/* Separator */}
              <span className="text-gray-400 dark:text-gray-600" aria-hidden="true">
                {separator}
              </span>

              {/* Breadcrumb Item */}
              {isCurrent ? (
                <span 
                  className="font-medium text-gray-900 dark:text-white"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * Helper function to generate breadcrumb items from path segments
 * 
 * @example
 * ```tsx
 * const items = generateBreadcrumbs('/users/123/schedules', {
 *   users: 'Users',
 *   '123': 'John Doe',
 *   schedules: 'Schedules'
 * })
 * ```
 */
export function generateBreadcrumbs(
  pathname: string,
  labelMap?: Record<string, string>
): BreadcrumbProps['items'] {
  const segments = pathname.split('/').filter(Boolean)
  
  return segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = labelMap?.[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    
    return {
      label,
      href,
      current: index === segments.length - 1
    }
  })
}
