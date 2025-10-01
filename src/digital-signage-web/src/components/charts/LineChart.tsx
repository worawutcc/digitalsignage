'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface LineChartData {
  label: string
  value: number
  timestamp?: string | Date
}

export interface LineChartProps {
  data: LineChartData[]
  title?: string
  height?: number
  color?: string
  showGrid?: boolean
  showTooltip?: boolean
  loading?: boolean
  className?: string
}

/**
 * Simple line chart component for displaying trends over time
 * 
 * @param data - Array of data points
 * @param title - Chart title
 * @param height - Chart height in pixels
 * @param color - Line color
 * @param showGrid - Whether to show grid lines
 * @param showTooltip - Whether to show tooltips on hover
 * @param loading - Loading state
 * @param className - Additional CSS classes
 */
export function LineChart({
  data,
  title,
  height = 200,
  color = '#3B82F6',
  showGrid = true,
  showTooltip = true,
  loading = false,
  className
}: LineChartProps) {
  const { pathData, points, maxValue, minValue } = useMemo(() => {
    if (!data || data.length === 0) {
      return { pathData: '', points: [], maxValue: 0, minValue: 0 }
    }

    const values = data.map(d => d.value)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1

    const width = 400 // SVG viewBox width
    const chartHeight = height - 40 // Account for padding

    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width
      const y = chartHeight - ((point.value - min) / range) * chartHeight
      return { x, y, ...point }
    })

    const pathData = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ')

    return { pathData, points, maxValue: max, minValue: min }
  }, [data, height])

  if (loading) {
    return (
      <div className={cn('rounded-lg bg-white p-6 shadow-sm border', className)}>
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn('rounded-lg bg-white p-6 shadow-sm border', className)}>
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div className="flex items-center justify-center h-48 text-gray-500">
          No data available
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg bg-white p-6 shadow-sm border', className)}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      
      <div className="relative">
        <svg
          viewBox={`0 0 400 ${height}`}
          className="w-full"
          style={{ height: `${height}px` }}
        >
          {/* Grid lines */}
          {showGrid && (
            <g className="stroke-gray-200" strokeWidth="1">
              {/* Horizontal lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  key={`h-${ratio}`}
                  x1="0"
                  y1={ratio * (height - 40)}
                  x2="400"
                  y2={ratio * (height - 40)}
                />
              ))}
              {/* Vertical lines */}
              {data.map((_, index) => {
                if (index % Math.ceil(data.length / 5) === 0) {
                  const x = (index / (data.length - 1)) * 400
                  return (
                    <line
                      key={`v-${index}`}
                      x1={x}
                      y1="0"
                      x2={x}
                      y2={height - 40}
                    />
                  )
                }
                return null
              })}
            </g>
          )}

          {/* Area under curve */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          <path
            d={`${pathData} L 400 ${height - 40} L 0 ${height - 40} Z`}
            fill="url(#lineGradient)"
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              className="hover:r-6 transition-all cursor-pointer"
            />
          ))}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-12">
          <span>{maxValue}</span>
          <span>{Math.round((maxValue + minValue) / 2)}</span>
          <span>{minValue}</span>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {data.map((point, index) => {
            if (index % Math.ceil(data.length / 5) === 0) {
              return (
                <span key={index} className="text-center">
                  {point.label}
                </span>
              )
            }
            return null
          })}
        </div>
      </div>
    </div>
  )
}

export default LineChart