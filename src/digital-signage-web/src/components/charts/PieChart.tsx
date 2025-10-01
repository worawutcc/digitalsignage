'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface PieChartData {
  label: string
  value: number
  color?: string
}

export interface PieChartProps {
  data: PieChartData[]
  title?: string
  size?: number
  showLegend?: boolean
  showPercentages?: boolean
  loading?: boolean
  className?: string
}

const defaultColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
]

/**
 * Pie chart component for displaying proportional data
 * 
 * @param data - Array of data points
 * @param title - Chart title
 * @param size - Chart diameter in pixels
 * @param showLegend - Whether to show legend
 * @param showPercentages - Whether to show percentages in legend
 * @param loading - Loading state
 * @param className - Additional CSS classes
 */
export function PieChart({
  data,
  title,
  size = 200,
  showLegend = true,
  showPercentages = true,
  loading = false,
  className
}: PieChartProps) {
  const { processedData, total } = useMemo(() => {
    if (!data || data.length === 0) {
      return { processedData: [], total: 0 }
    }

    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = 0

    const processedData = data.map((item, index) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0
      const angle = total > 0 ? (item.value / total) * 360 : 0
      const startAngle = currentAngle
      currentAngle += angle

      return {
        ...item,
        color: item.color || defaultColors[index % defaultColors.length],
        percentage,
        angle,
        startAngle
      }
    })

    return { processedData, total }
  }, [data])

  const createPathData = (startAngle: number, endAngle: number, radius: number) => {
    const centerX = size / 2
    const centerY = size / 2
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180)
    const endAngleRad = (endAngle - 90) * (Math.PI / 180)
    
    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  if (loading) {
    return (
      <div className={cn('rounded-lg bg-white p-6 shadow-sm border', className)}>
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div className="animate-pulse flex items-center space-x-6">
          <div 
            className="bg-gray-200 rounded-full" 
            style={{ width: size, height: size }}
          />
          {showLegend && (
            <div className="flex-1 space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded flex-1"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className={cn('rounded-lg bg-white p-6 shadow-sm border', className)}>
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div className="flex items-center justify-center text-gray-500" style={{ height: size }}>
          No data available
        </div>
      </div>
    )
  }

  const radius = (size - 20) / 2

  return (
    <div className={cn('rounded-lg bg-white p-6 shadow-sm border', className)}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      
      <div className={cn('flex items-center', showLegend ? 'space-x-6' : 'justify-center')}>
        {/* Pie Chart */}
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {processedData.map((item, index) => (
              <path
                key={index}
                d={createPathData(item.startAngle, item.startAngle + item.angle, radius)}
                fill={item.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                stroke="white"
                strokeWidth="2"
              />
            ))}
          </svg>
          
          {/* Center hole for donut effect */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full flex items-center justify-center"
            style={{ 
              width: size * 0.4, 
              height: size * 0.4 
            }}
          >
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex-1 space-y-2">
            {processedData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {item.value}
                  {showPercentages && (
                    <span className="text-gray-400 ml-1">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PieChart