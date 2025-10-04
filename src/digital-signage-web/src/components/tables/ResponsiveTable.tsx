/**
 * Responsive Data Table Component
 * 
 * Automatically switches between desktop table view and mobile card view
 * based on screen size with mobile-friendly pagination and filtering.
 * 
 * @see T033 - Responsive Data Tables
 */

'use client'

import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useViewport } from '@/lib/mobile-utils'
import { TouchButton, MobileSearch, MobilePagination, MobileDrawer } from '@/components/mobile/MobileComponents'
import { Button } from '@/components/ui/Button'

export interface ResponsiveTableColumn<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (value: any, row: T, index: number) => React.ReactNode
  className?: string
  width?: string
  // Mobile-specific options
  mobileRender?: (value: any, row: T, index: number) => React.ReactNode
  showInMobile?: boolean
  mobileOrder?: number
}

export interface ResponsiveTableProps<T> {
  data: T[]
  columns: ResponsiveTableColumn<T>[]
  loading?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems?: number
    onPageChange: (page: number) => void
  }
  sorting?: {
    sortBy: string | null
    sortOrder: 'asc' | 'desc'
    onSort: (key: string) => void
  }
  filtering?: {
    searchValue: string
    onSearchChange: (value: string) => void
    filters?: Array<{
      key: string
      label: string
      options: Array<{ value: string; label: string }>
      value: string
      onChange: (value: string) => void
    }>
  }
  emptyMessage?: string
  className?: string
  rowClassName?: (row: T, index: number) => string
  onRowClick?: (row: T, index: number) => void
  // Mobile card customization
  mobileCardRender?: (row: T, index: number) => React.ReactNode
  mobileCardClassName?: string
}

/**
 * Responsive data table that switches between table and card views
 */
export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  filtering,
  emptyMessage = 'No data available',
  className = '',
  rowClassName,
  onRowClick,
  mobileCardRender,
  mobileCardClassName = ''
}: ResponsiveTableProps<T>) {
  const viewport = useViewport()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const getCellValue = (row: T, key: string | keyof T) => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj: any, k: string) => obj?.[k], row)
    }
    return row[key as keyof T]
  }

  // Filter columns for mobile view
  const mobileColumns = useMemo(() => {
    return columns
      .filter(col => col.showInMobile !== false)
      .sort((a, b) => (a.mobileOrder || 0) - (b.mobileOrder || 0))
  }, [columns])

  // Mobile Card Component
  const MobileCard = ({ row, index }: { row: T; index: number }) => {
    if (mobileCardRender) {
      return (
        <div
          className={cn(
            'bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700',
            onRowClick && 'cursor-pointer active:bg-gray-50 dark:active:bg-gray-700',
            rowClassName?.(row, index),
            mobileCardClassName
          )}
          onClick={() => onRowClick?.(row, index)}
        >
          {mobileCardRender(row, index)}
        </div>
      )
    }

    // Default card layout
    return (
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700',
          onRowClick && 'cursor-pointer active:bg-gray-50 dark:active:bg-gray-700',
          rowClassName?.(row, index),
          mobileCardClassName
        )}
        onClick={() => onRowClick?.(row, index)}
      >
        <div className="space-y-2">
          {mobileColumns.map((column, colIndex) => {
            const value = getCellValue(row, column.key)
            const displayValue = column.mobileRender 
              ? column.mobileRender(value, row, index)
              : column.render 
                ? column.render(value, row, index)
                : value

            return (
              <div key={colIndex} className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0 w-1/3">
                  {column.header}:
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100 flex-1 text-right">
                  {displayValue}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Loading Component
  const LoadingContent = () => (
    <div className="space-y-3">
      {Array.from({ length: viewport.isMobile ? 3 : 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse',
            viewport.isMobile 
              ? 'bg-gray-200 dark:bg-gray-700 rounded-lg h-20'
              : 'bg-gray-200 dark:bg-gray-700 rounded h-12'
          )}
        />
      ))}
    </div>
  )

  // Empty State Component
  const EmptyContent = () => (
    <div className="text-center py-12">
      <div className="text-gray-400 dark:text-gray-600 mb-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto flex items-center justify-center">
          <Search className="w-8 h-8" />
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
    </div>
  )

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow', className)}>
      {/* Mobile Header */}
      {viewport.isMobile && filtering && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <MobileSearch
                value={filtering.searchValue}
                onChange={filtering.onSearchChange}
                placeholder="Search..."
                onClear={() => filtering.onSearchChange('')}
              />
            </div>
            {filtering.filters && filtering.filters.length > 0 && (
              <TouchButton
                onClick={() => setMobileFiltersOpen(true)}
                variant="outline"
                size="sm"
              >
                <Filter className="w-4 h-4" />
              </TouchButton>
            )}
          </div>
        </div>
      )}

      {/* Desktop Header */}
      {!viewport.isMobile && filtering && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={filtering.searchValue}
                  onChange={(e) => filtering.onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            {filtering.filters && filtering.filters.length > 0 && (
              <div className="flex items-center space-x-3">
                {filtering.filters.map((filter) => (
                  <div key={filter.key}>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {filter.label}
                    </label>
                    <select
                      value={filter.value}
                      onChange={(e) => filter.onChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {filter.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="min-h-[200px]">
        {loading ? (
          <div className="p-4">
            <LoadingContent />
          </div>
        ) : data.length === 0 ? (
          <EmptyContent />
        ) : viewport.isMobile ? (
          /* Mobile Card View */
          <div className="p-4 space-y-3">
            {data.map((row, index) => (
              <MobileCard key={index} row={row} index={index} />
            ))}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                        column.sortable && 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none',
                        column.className
                      )}
                      style={{ width: column.width }}
                      onClick={() => column.sortable && sorting?.onSort(column.key as string)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.header}</span>
                        {column.sortable && sorting && (
                          <div className="flex flex-col">
                            <ChevronUp 
                              className={cn(
                                'h-3 w-3',
                                sorting.sortBy === column.key && sorting.sortOrder === 'asc'
                                  ? 'text-blue-600'
                                  : 'text-gray-400'
                              )}
                            />
                            <ChevronDown 
                              className={cn(
                                'h-3 w-3 -mt-1',
                                sorting.sortBy === column.key && sorting.sortOrder === 'desc'
                                  ? 'text-blue-600'
                                  : 'text-gray-400'
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={cn(
                      'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                      onRowClick && 'cursor-pointer',
                      rowClassName?.(row, rowIndex)
                    )}
                    onClick={() => onRowClick?.(row, rowIndex)}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={cn(
                          'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render(getCellValue(row, column.key), row, rowIndex)
                          : getCellValue(row, column.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {viewport.isMobile ? (
            <div className="p-4">
              <MobilePagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                {...(pagination.totalItems && { totalItems: pagination.totalItems })}
                pageSize={pagination.pageSize}
                onPageChange={pagination.onPageChange}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {pagination.totalItems ? (
                  <>
                    Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
                    {pagination.totalItems} results
                  </>
                ) : (
                  <>Page {pagination.currentPage} of {pagination.totalPages}</>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Filters Drawer */}
      {viewport.isMobile && filtering?.filters && (
        <MobileDrawer
          isOpen={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          title="Filters"
        >
          <div className="p-4 space-y-4">
            {filtering.filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {filter.label}
                </label>
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {filter.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            
            <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <TouchButton
                onClick={() => {
                  filtering.filters?.forEach(filter => filter.onChange(''))
                  setMobileFiltersOpen(false)
                }}
                variant="outline"
                className="flex-1"
              >
                Clear
              </TouchButton>
              <TouchButton
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1"
              >
                Apply
              </TouchButton>
            </div>
          </div>
        </MobileDrawer>
      )}
    </div>
  )
}

export default ResponsiveTable