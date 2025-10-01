import React, { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export interface DataTableColumn<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (value: any, row: T, index: number) => React.ReactNode
  className?: string
  width?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  loading?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    pageSize: number
    onPageChange: (page: number) => void
  }
  sorting?: {
    sortBy: string | null
    sortOrder: 'asc' | 'desc'
    onSort: (key: string) => void
  }
  emptyMessage?: string
  className?: string
  rowClassName?: (row: T, index: number) => string
  onRowClick?: (row: T, index: number) => void
}

/**
 * Reusable data table component with sorting, pagination, and customizable columns
 * 
 * @param data - Array of data objects to display
 * @param columns - Column configuration array
 * @param loading - Loading state
 * @param pagination - Pagination configuration
 * @param sorting - Sorting configuration
 * @param emptyMessage - Message when no data
 * @param className - Additional CSS classes
 * @param rowClassName - Function to generate row CSS classes
 * @param onRowClick - Row click handler
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  emptyMessage = 'No data available',
  className,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const getCellValue = (row: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      // Handle nested keys like 'user.name'
      return key.split('.').reduce((obj, k) => obj?.[k], row)
    }
    return row[key as keyof T]
  }

  const renderSortIcon = (columnKey: string) => {
    if (!sorting || sorting.sortBy !== columnKey) {
      return <ChevronUp className="h-4 w-4 opacity-30" />
    }
    return sorting.sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  if (loading) {
    return (
      <div className={cn('overflow-hidden rounded-lg border bg-background', className)}>
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="border-b bg-muted/50 p-4">
            <div className="flex space-x-4">
              {columns.map((_, index) => (
                <div key={index} className="h-4 flex-1 rounded bg-muted" />
              ))}
            </div>
          </div>
          {/* Rows skeleton */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border-b p-4">
              <div className="flex space-x-4">
                {columns.map((_, colIndex) => (
                  <div key={colIndex} className="h-4 flex-1 rounded bg-muted/30" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border bg-background', className)}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
                    column.sortable && 'cursor-pointer select-none hover:text-foreground',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => {
                    if (column.sortable && sorting) {
                      sorting.onSort(column.key as string)
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.header}</span>
                    {column.sortable && renderSortIcon(column.key as string)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    'border-b transition-colors hover:bg-muted/50',
                    onRowClick && 'cursor-pointer',
                    hoveredRow === rowIndex && 'bg-muted/30',
                    rowClassName?.(row, rowIndex)
                  )}
                  onMouseEnter={() => setHoveredRow(rowIndex)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        'px-4 py-3 text-sm',
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(getCellValue(row, column.key), row, rowIndex)
                        : getCellValue(row, column.key)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable