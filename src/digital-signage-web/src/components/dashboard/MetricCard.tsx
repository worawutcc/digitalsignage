'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MetricCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  loading?: boolean
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
    suffix?: string
  }
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo' | 'orange'
  className?: string
  onClick?: () => void
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-500',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    trend: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-500',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    trend: 'text-green-600'
  },
  red: {
    bg: 'bg-red-500',
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    trend: 'text-red-600'
  },
  yellow: {
    bg: 'bg-yellow-500',
    iconBg: 'bg-yellow-100',
    iconText: 'text-yellow-600',
    trend: 'text-yellow-600'
  },
  purple: {
    bg: 'bg-purple-500',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    trend: 'text-purple-600'
  },
  indigo: {
    bg: 'bg-indigo-500',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-600',
    trend: 'text-indigo-600'
  },
  orange: {
    bg: 'bg-orange-500',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
    trend: 'text-orange-600'
  }
}

/**
 * Metric card component for displaying key statistics
 * Shows a value with icon, title, and optional trend indicator
 * 
 * @param title - Card title
 * @param value - Main metric value
 * @param icon - Lucide icon component
 * @param loading - Loading state
 * @param subtitle - Optional subtitle text
 * @param trend - Optional trend information
 * @param color - Color theme
 * @param className - Additional CSS classes
 * @param onClick - Click handler
 */
export function MetricCard({
  title,
  value,
  icon: Icon,
  loading = false,
  subtitle,
  trend,
  color = 'blue',
  className,
  onClick
}: MetricCardProps) {
  const styles = colorStyles[color]

  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
    return val.toString()
  }

  if (loading) {
    return (
      <div className={cn(
        'rounded-lg bg-white p-6 shadow-sm border animate-pulse',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}>
        <div className="flex items-center">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2 w-24"></div>
            <div className="h-8 bg-gray-200 rounded mb-2 w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="ml-4">
            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg bg-white p-6 shadow-sm border transition-shadow',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-gray-600">{title}</p>
          
          {/* Value */}
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {formatValue(value)}
          </p>
          
          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          
          {/* Trend */}
          {trend && (
            <div className={cn(
              'flex items-center mt-2 text-sm',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              <span className={cn(
                'inline-flex items-center text-xs',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.isPositive ? '↗' : '↘'}
                <span className="ml-1">
                  {typeof trend.value === 'number' ? 
                    (trend.value % 1 === 0 ? trend.value : trend.value.toFixed(1)) : 
                    trend.value
                  }
                  {trend.suffix && ` ${trend.suffix}`}
                </span>
              </span>
            </div>
          )}
        </div>
        
        {/* Icon */}
        <div className="ml-4">
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            styles.iconBg
          )}>
            <Icon className={cn('h-6 w-6', styles.iconText)} />
          </div>
        </div>
      </div>
      
      {/* Accent bar */}
      <div className={cn('mt-4 h-1 w-full rounded-full bg-gray-100')}>
        <div 
          className={cn('h-1 rounded-full transition-all duration-500', styles.bg)}
          style={{ 
            width: trend ? `${Math.min(Math.max(trend.value, 0), 100)}%` : '100%' 
          }}
        />
      </div>
    </div>
  )
}

export default MetricCard