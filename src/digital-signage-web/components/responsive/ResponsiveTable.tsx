'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Responsive Table Components
 * Mobile-first approach with touch-friendly interactions
 * Following copilot-instructions-ui.instructions.md guidelines
 */

// ================================
// RESPONSIVE TABLE HOOKS
// ================================

export function useResponsiveTable() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAll = (ids: string[]) => {
    const allSelected = ids.every(id => selectedRows.has(id));
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(ids));
    }
  };

  const clearSelection = () => setSelectedRows(new Set());

  return {
    isMobile,
    selectedRows,
    toggleRow,
    toggleAll,
    clearSelection,
    hasSelection: selectedRows.size > 0,
    selectedCount: selectedRows.size
  };
}

// ================================
// MOBILE TABLE CARD
// ================================

interface MobileTableCardProps {
  data: Record<string, any>;
  fields: TableField[];
  onSelect?: ((id: string) => void) | undefined;
  isSelected?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export interface TableField {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'avatar' | 'actions';
  render?: (value: any, row: Record<string, any>) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  mobileHide?: boolean; // Hide on mobile
  mobileOnly?: boolean; // Show only on mobile
}

export const MobileTableCard: React.FC<MobileTableCardProps> = ({
  data,
  fields,
  onSelect,
  isSelected = false,
  actions,
  className = ''
}) => {
  const visibleFields = fields.filter(field => !field.mobileHide);
  const primaryField = visibleFields[0];
  const secondaryFields = visibleFields.slice(1, 3); // Show 2-3 main fields
  const actionField = fields.find(field => field.type === 'actions');

  return (
    <div
      className={cn(
        'bg-white rounded-lg border p-4 space-y-3',
        'transition-all duration-200',
        isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'hover:shadow-md',
        'active:scale-[0.99]', // Touch feedback
        className
      )}
      onClick={() => onSelect?.(data.id)}
    >
      {/* Header with primary field and selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(data.id)}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          
          {primaryField && (
            <div className="font-medium text-gray-900 text-sm">
              {primaryField.render 
                ? primaryField.render(data[primaryField.key], data)
                : data[primaryField.key]
              }
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {actions}
          {actionField?.render && (
            <div onClick={(e) => e.stopPropagation()}>
              {actionField.render(data[actionField.key], data)}
            </div>
          )}
        </div>
      </div>

      {/* Secondary fields */}
      {secondaryFields.length > 0 && (
        <div className="space-y-2">
          {secondaryFields.map(field => (
            <div key={field.key} className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">{field.label}:</span>
              <span className="text-gray-900">
                {field.render 
                  ? field.render(data[field.key], data)
                  : data[field.key] || '-'
                }
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Mobile-only fields */}
      {fields.some(field => field.mobileOnly) && (
        <div className="pt-2 border-t space-y-2">
          {fields
            .filter(field => field.mobileOnly)
            .map(field => (
              <div key={field.key} className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">{field.label}:</span>
                <span className="text-gray-900">
                  {field.render 
                    ? field.render(data[field.key], data)
                    : data[field.key] || '-'
                  }
                </span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
};

// ================================
// DESKTOP TABLE
// ================================

interface DesktopTableProps {
  data: Record<string, any>[];
  fields: TableField[];
  onRowSelect?: ((id: string) => void) | undefined;
  selectedRows?: Set<string>;
  onSelectAll?: (() => void) | undefined;
  sortField?: string | undefined;
  sortDirection?: 'asc' | 'desc';
  onSort?: ((field: string) => void) | undefined;
  className?: string;
}

export const DesktopTable: React.FC<DesktopTableProps> = ({
  data,
  fields,
  onRowSelect,
  selectedRows = new Set(),
  onSelectAll,
  sortField,
  sortDirection = 'asc',
  onSort,
  className = ''
}) => {
  const visibleFields = fields.filter(field => !field.mobileOnly);
  const hasSelection = onRowSelect && selectedRows.size > 0;
  const allSelected = data.length > 0 && data.every(row => selectedRows.has(row.id));

  return (
    <div className={cn('overflow-x-auto bg-white rounded-lg border', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {/* Selection column */}
            {onRowSelect && (
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </th>
            )}
            
            {visibleFields.map(field => (
              <th
                key={field.key}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  field.sortable && 'cursor-pointer hover:bg-gray-100',
                  field.className
                )}
                onClick={() => field.sortable && onSort?.(field.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{field.label}</span>
                  {field.sortable && sortField === field.key && (
                    <svg
                      className={cn(
                        'h-4 w-4 text-gray-400 transition-transform',
                        sortDirection === 'desc' && 'rotate-180'
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => {
            const isSelected = selectedRows.has(row.id);
            
            return (
              <tr
                key={row.id || index}
                className={cn(
                  'hover:bg-gray-50 transition-colors duration-150',
                  isSelected && 'bg-blue-50',
                  'cursor-pointer'
                )}
                onClick={() => onRowSelect?.(row.id)}
              >
                {/* Selection column */}
                {onRowSelect && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onRowSelect(row.id)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                
                {visibleFields.map(field => (
                  <td
                    key={field.key}
                    className={cn(
                      'px-6 py-4 whitespace-nowrap text-sm',
                      field.type === 'actions' && 'text-right',
                      field.className
                    )}
                    onClick={field.type === 'actions' ? (e) => e.stopPropagation() : undefined}
                  >
                    {field.render 
                      ? field.render(row[field.key], row)
                      : row[field.key] || '-'
                    }
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ================================
// RESPONSIVE TABLE CONTAINER
// ================================

interface ResponsiveTableProps {
  data: Record<string, any>[];
  fields: TableField[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  onRowSelect?: ((id: string) => void) | undefined;
  onSelectAll?: (() => void) | undefined;
  onSort?: ((field: string) => void) | undefined;
  sortField?: string | undefined;
  sortDirection?: 'asc' | 'desc';
  className?: string;
  cardActions?: (row: Record<string, any>) => React.ReactNode;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  fields,
  loading = false,
  error,
  emptyMessage = 'No data available',
  onRowSelect,
  onSelectAll,
  onSort,
  sortField,
  sortDirection = 'asc',
  className = '',
  cardActions
}) => {
  const { isMobile, selectedRows, toggleRow, toggleAll, clearSelection } = useResponsiveTable();

  // Handle selection
  const handleRowSelect = (id: string) => {
    if (onRowSelect) {
      onRowSelect(id);
    } else {
      toggleRow(id);
    }
  };

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll();
    } else {
      toggleAll(data.map(row => row.id));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {isMobile ? (
          // Mobile loading cards
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))
        ) : (
          // Desktop loading table
          <div className="bg-white rounded-lg border">
            <div className="animate-pulse p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border p-6 text-center">
        <div className="text-red-500 mb-2">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Error Loading Data</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Data</h3>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Selection toolbar */}
      {selectedRows.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-blue-800 font-medium">
              {selectedRows.size} item{selectedRows.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table content */}
      {isMobile ? (
        // Mobile card view
        <div className="space-y-3">
          {data.map((row, index) => (
            <MobileTableCard
              key={row.id || index}
              data={row}
              fields={fields}
              onSelect={handleRowSelect}
              isSelected={selectedRows.has(row.id)}
              actions={cardActions?.(row)}
            />
          ))}
        </div>
      ) : (
        // Desktop table view
        <DesktopTable
          data={data}
          fields={fields}
          onRowSelect={handleRowSelect}
          selectedRows={selectedRows}
          onSelectAll={handleSelectAll}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
      )}
    </div>
  );
};

export default ResponsiveTable;