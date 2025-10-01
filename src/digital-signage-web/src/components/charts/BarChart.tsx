'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface BarChartData {
  label: string
  value: number
  color?: string
}

export interface BarChartProps {
  data: BarChartData[]
  title?: string
  height?: number
  showValues?: boolean
  loading?: boolean
  className?: string
  horizontal?: boolean
}

const defaultColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
]

/**
 * Bar chart component for displaying categorical data
 * 
 * @param data - Array of data points
 * @param title - Chart title
 * @param height - Chart height in pixels
 * @param showValues - Whether to show values on bars
 * @param loading - Loading state
 * @param className - Additional CSS classes
 * @param horizontal - Whether to display bars horizontally
 */
export function BarChart({
  data,
  title,
  height = 300,
  showValues = true,
  loading = false,
  className,
  horizontal = false
}: BarChartProps) {
  const { processedData, maxValue } = useMemo(() => {
    if (!data || data.length === 0) {
      return { processedData: [], maxValue: 0 }
    }

    const values = data.map(d => d.value)
    const max = Math.max(...values)

    const processedData = data.map((item, index) => ({
      ...item,
      color: item.color || defaultColors[index % defaultColors.length],
      percentage: max > 0 ? (item.value / max) * 100 : 0
    }))

    return { processedData, maxValue: max }
  }, [data])

  if (loading) {
    return (
      <div className={cn('rounded-lg bg-white p-6 shadow-sm border', className)}>
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div className="animate-pulse">
          <div className={`bg-gray-200 rounded`} style={{ height: `${height}px` }}></div>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn('rounded-lg bg-white p-6 shadow-sm border', className)}>
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div className="flex items-center justify-center text-gray-500" style={{ height: `${height}px` }}>
          No data available
        </div>
      </div>
    )
  }

  if (horizontal) {
    return (
      <div className={cn('rounded-lg bg-white p-6 shadow-sm border', className)}>
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        
        <div className="space-y-4" style={{ height: `${height}px` }}>
          {processedData.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-20 text-sm text-gray-600 text-right flex-shrink-0">
                {item.label}
              </div>
              <div className="flex-1 relative">
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full transition-all duration-700 ease-out rounded-lg flex items-center justify-end pr-2"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color
                    }}
                  >
                    {showValues && (
                      <span className="text-white text-xs font-medium">
                        {item.value}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg bg-white p-6 shadow-sm border', className)}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      
      <div className="relative" style={{ height: `${height + 40}px` }}>
        <div className="flex items-end justify-between h-full pb-8 space-x-2">
          {processedData.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="relative w-full">
                {showValues && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
                    {item.value}
                  </div>
                )}
                <div
                  className="transition-all duration-700 ease-out rounded-t-lg"
                  style={{
                    height: `${(item.percentage / 100) * height}px`,
                    backgroundColor: item.color
                  }}
                />
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center truncate w-full">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BarChart