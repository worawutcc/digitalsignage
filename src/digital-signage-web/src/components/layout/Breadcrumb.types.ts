/**
 * Breadcrumb Types
 * Type definitions for breadcrumb navigation component
 */

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
}
