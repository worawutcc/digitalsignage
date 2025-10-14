'use client';

import React, { useMemo, useCallback } from 'react';
import { useVirtualScrolling, VirtualScrollingOptions } from '../../hooks/useVirtualScrolling';

/**
 * Virtual Table Component for efficient rendering of large datasets
 * Follows UI copilot patterns with TypeScript strict mode and accessibility
 */

export interface VirtualTableColumn<T = any> {
  /** Unique column identifier */
  key: string;
  /** Column header text */
  title: string;
  /** Column width in pixels */
  width: number;
  /** Render function for cell content */
  render: (item: T, index: number) => React.ReactNode;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is resizable */
  resizable?: boolean;
  /** Minimum column width */
  minWidth?: number;
  /** Maximum column width */
  maxWidth?: number;
}

export interface VirtualTableProps<T = any> {
  /** Array of data items to display */
  data: T[];
  /** Column definitions */
  columns: VirtualTableColumn<T>[];
  /** Row height in pixels */
  rowHeight?: number;
  /** Container height in pixels */
  height: number;
  /** Container width in pixels or percentage */
  width?: number | string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Row selection */
  selectedRows?: Set<number>;
  /** Row selection callback */
  onRowSelect?: (index: number, selected: boolean) => void;
  /** Row click handler */
  onRowClick?: (item: T, index: number) => void;
  /** Row double click handler */
  onRowDoubleClick?: (item: T, index: number) => void;
  /** Virtual scrolling options */
  virtualOptions?: Partial<VirtualScrollingOptions>;
  /** CSS class name */
  className?: string;
  /** Row CSS class name function */
  rowClassName?: (item: T, index: number) => string;
  /** Show header */
  showHeader?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Zebra striping */
  striped?: boolean;
  /** Hover effect */
  hoverable?: boolean;
  /** Compact mode */
  compact?: boolean;
}

export function VirtualTable<T = any>({
  data,
  columns,
  rowHeight = 48,
  height,
  width = '100%',
  loading = false,
  emptyMessage = 'No data available',
  selectedRows,
  onRowSelect,
  onRowClick,
  onRowDoubleClick,
  virtualOptions,
  className = '',
  rowClassName,
  showHeader = true,
  stickyHeader = true,
  striped = true,
  hoverable = true,
  compact = false
}: VirtualTableProps<T>) {
  // Virtual scrolling setup
  const virtualConfig = useMemo(() => ({
    totalItems: data.length,
    itemHeight: rowHeight,
    containerHeight: showHeader ? height - 40 : height, // Account for header
    overscan: 5,
    ...virtualOptions
  }), [data.length, rowHeight, height, showHeader, virtualOptions]);

  const {
    visibleItems,
    totalSize,
    offsetBefore,
    offsetAfter,
    containerRef,
    scrollToIndex,
    scrollToTop,
    isScrolling
  } = useVirtualScrolling(virtualConfig);

  // Calculate total table width
  const totalWidth = useMemo(() => {
    return columns.reduce((sum, col) => sum + col.width, 0);
  }, [columns]);

  // Handle row selection
  const handleRowSelect = useCallback((index: number) => {
    if (!onRowSelect) return;
    const isSelected = selectedRows?.has(index) ?? false;
    onRowSelect(index, !isSelected);
  }, [onRowSelect, selectedRows]);

  // Handle row click
  const handleRowClick = useCallback((item: T, index: number, event: React.MouseEvent) => {
    if (event.detail === 2 && onRowDoubleClick) {
      // Double click
      onRowDoubleClick(item, index);
    } else if (onRowClick) {
      // Single click
      onRowClick(item, index);
    }
  }, [onRowClick, onRowDoubleClick]);

  // Render table header
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div
        className={`
          flex border-b border-gray-200 bg-gray-50
          ${stickyHeader ? 'sticky top-0 z-10' : ''}
        `}
        style={{ width: totalWidth }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className={`
              px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider
              border-r border-gray-200 last:border-r-0
              ${column.align === 'center' ? 'text-center' : ''}
              ${column.align === 'right' ? 'text-right' : ''}
              ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
            `}
            style={{ 
              width: column.width,
              minWidth: column.minWidth,
              maxWidth: column.maxWidth
            }}
          >
            {column.title}
          </div>
        ))}
      </div>
    );
  };

  // Render table row
  const renderRow = (item: T, index: number, virtualIndex: number) => {
    const isSelected = selectedRows?.has(index) ?? false;
    const isEven = virtualIndex % 2 === 0;
    const customRowClass = rowClassName ? rowClassName(item, index) : '';

    return (
      <div
        key={index}
        className={`
          flex border-b border-gray-100 cursor-pointer transition-colors
          ${isSelected ? 'bg-blue-50 border-blue-200' : ''}
          ${striped && !isSelected && isEven ? 'bg-gray-50' : ''}
          ${hoverable && !isSelected ? 'hover:bg-gray-100' : ''}
          ${compact ? 'text-sm' : ''}
          ${customRowClass}
        `}
        style={{ 
          height: rowHeight,
          width: totalWidth
        }}
        onClick={(e) => handleRowClick(item, index, e)}
        role="row"
        tabIndex={0}
        aria-selected={isSelected}
      >
        {columns.map((column) => (
          <div
            key={`${index}-${column.key}`}
            className={`
              px-3 py-2 border-r border-gray-100 last:border-r-0
              flex items-center overflow-hidden
              ${column.align === 'center' ? 'justify-center' : ''}
              ${column.align === 'right' ? 'justify-end' : ''}
            `}
            style={{ 
              width: column.width,
              minWidth: column.minWidth,
              maxWidth: column.maxWidth
            }}
          >
            {onRowSelect && column.key === '_select' ? (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleRowSelect(index)}
                onClick={(e) => e.stopPropagation()}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            ) : (
              <div className="truncate w-full">
                {column.render(item, index)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-white border border-gray-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {renderHeader()}
      
      <div
        ref={containerRef}
        className="relative overflow-auto"
        style={{ 
          height: showHeader ? height - 40 : height,
          width: typeof width === 'string' ? width : `${width}px`
        }}
      >
        {/* Virtual scrolling container */}
        <div style={{ height: totalSize, width: totalWidth }}>
          {/* Spacer before visible items */}
          {offsetBefore > 0 && (
            <div style={{ height: offsetBefore }} />
          )}
          
          {/* Visible items */}
          {visibleItems.map((virtualIndex) => {
            const item = data[virtualIndex];
            if (!item) return null;
            return renderRow(item, virtualIndex, virtualIndex);
          })}
          
          {/* Spacer after visible items */}
          {offsetAfter > 0 && (
            <div style={{ height: offsetAfter }} />
          )}
        </div>

        {/* Scroll indicator during scrolling */}
        {isScrolling && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            Scrolling...
          </div>
        )}
      </div>
      
      {/* Table footer with scroll controls */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
        <span>{data.length} items total</span>
        <div className="flex gap-2">
          <button
            onClick={scrollToTop}
            className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            disabled={data.length === 0}
          >
            Top
          </button>
          <button
            onClick={() => scrollToIndex(Math.max(0, data.length - 1))}
            className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            disabled={data.length === 0}
          >
            Bottom
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Utility functions for Virtual Table
 */
export const VirtualTableUtils = {
  /**
   * Create selection column for row selection
   */
  createSelectionColumn: <T = any>(): VirtualTableColumn<T> => ({
    key: '_select',
    title: '',
    width: 40,
    align: 'center',
    render: () => null // Handled by table component
  }),

  /**
   * Create index column
   */
  createIndexColumn: <T = any>(startIndex: number = 1): VirtualTableColumn<T> => ({
    key: '_index',
    title: '#',
    width: 60,
    align: 'center',
    render: (_, index) => (
      <span className="text-gray-500 font-mono text-sm">
        {startIndex + index}
      </span>
    )
  }),

  /**
   * Create action column with buttons
   */
  createActionColumn: <T = any>(
    actions: Array<{
      key: string;
      label: string;
      onClick: (item: T, index: number) => void;
      disabled?: (item: T, index: number) => boolean;
      variant?: 'primary' | 'secondary' | 'danger';
    }>
  ): VirtualTableColumn<T> => ({
    key: '_actions',
    title: 'Actions',
    width: actions.length * 80,
    align: 'center',
    render: (item, index) => (
      <div className="flex gap-1">
        {actions.map((action) => {
          const isDisabled = action.disabled?.(item, index) ?? false;
          const variant = action.variant ?? 'secondary';
          
          const buttonClasses = {
            primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300',
            secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100',
            danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300'
          };

          return (
            <button
              key={action.key}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(item, index);
              }}
              disabled={isDisabled}
              className={`
                px-2 py-1 text-xs rounded transition-colors
                ${buttonClasses[variant]}
                disabled:cursor-not-allowed disabled:text-gray-500
              `}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    )
  }),

  /**
   * Calculate optimal column widths based on content
   */
  calculateColumnWidths: <T = any>(
    data: T[],
    columns: VirtualTableColumn<T>[],
    maxSampleSize: number = 100
  ): VirtualTableColumn<T>[] => {
    const sampleData = data.slice(0, maxSampleSize);
    
    return columns.map((column) => {
      if (column.width) return column; // Already has fixed width

      // Calculate content width (simplified approximation)
      const headerWidth = column.title.length * 8 + 40; // Approximate pixel width
      const maxContentWidth = Math.max(
        ...sampleData.map((item, index) => {
          const content = column.render(item, index);
          const contentString = typeof content === 'string' ? content : '...';
          return contentString.length * 8 + 40;
        })
      );

      const calculatedWidth = Math.max(headerWidth, maxContentWidth);
      
      return {
        ...column,
        width: Math.min(
          Math.max(calculatedWidth, column.minWidth ?? 60),
          column.maxWidth ?? 300
        )
      };
    });
  }
};