import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { BreadcrumbItem, BreadcrumbsProps } from './Breadcrumbs.types'

/**
 * Breadcrumbs navigation component
 * Provides contextual navigation path for media and schedule management
 */
export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-500 ${className}`}>
      <Link 
        href="/dashboard"
        className="flex items-center hover:text-gray-900 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2" />
          {item.href ? (
            <Link 
              href={item.href}
              className="hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}