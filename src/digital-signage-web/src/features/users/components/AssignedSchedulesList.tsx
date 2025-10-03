'use client'

/**
 * AssignedSchedulesList Component
 * 
 * Enhanced component displaying list of schedules assigned to a user.
 * Features virtual scrolling, bulk operations, drag-and-drop, and enhanced filtering.
 * Backward compatible with existing AssignedSchedulesListProps.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 */

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  User, 
  AlertCircle, 
  CheckSquare, 
  Square, 
  Filter,
  Search,
  MoreVertical,
  GripVertical
} from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable 
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { AssignedSchedulesListProps } from './AssignedSchedulesList.types'
import type { EnhancedAssignedSchedulesListProps } from '@/types/enhanced-ui'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

// Temporary inline components to avoid import issues
const Badge = ({ children, variant = 'default', className, ...props }: any) => (
  <span
    className={cn(
      'inline-flex items-center font-medium rounded-full px-2.5 py-0.5 text-xs',
      variant === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      variant === 'default' && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      className
    )}
    {...props}
  >
    {children}
  </span>
)

const Checkbox = ({ checked, onChange, className, ...props }: any) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={() => onChange?.(!checked)}
    className={cn(
      'inline-flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      checked && 'border-blue-600 bg-blue-600',
      className
    )}
    {...props}
  >
    {checked && <CheckSquare className="h-3 w-3" />}
  </button>
)

// Sortable Item Component for Drag and Drop
interface SortableScheduleItemProps {
  schedule: any
  isSelected?: boolean
  onSelect?: (id: string, selected: boolean) => void | undefined
  enableDragDrop?: boolean
  enableBulkSelection?: boolean
}

function SortableScheduleItem({ 
  schedule, 
  isSelected = false, 
  onSelect, 
  enableDragDrop = false,
  enableBulkSelection = false
}: SortableScheduleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: schedule.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`schedule-card-${schedule.id}`}
      className={cn(
        'rounded-lg border p-4 transition-all hover:shadow-md',
        schedule.isActive
          ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
        isDragging && 'opacity-50',
        isSelected && 'ring-2 ring-blue-500'
      )}
    >
      {/* Header with selection and drag handle */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          {enableBulkSelection && (
            <Checkbox
              checked={isSelected}
              onChange={(checked: boolean) => onSelect?.(schedule.id.toString(), checked)}
              aria-label={`Select ${schedule.name}`}
              data-testid={`schedule-checkbox-${schedule.id}`}
            />
          )}
          
          {enableDragDrop && (
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              aria-label={`Drag ${schedule.name}`}
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </button>
          )}
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {schedule.name}
            </h3>
            {schedule.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {schedule.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge
            variant={schedule.isActive ? 'success' : 'default'}
            data-testid={`schedule-status-${schedule.id}`}
          >
            {schedule.isActive ? 'Active' : 'Inactive'}
          </Badge>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            aria-label={`More actions for ${schedule.name}`}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Schedule Details */}
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        {/* Dates */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            {schedule.startDate}
            {schedule.endDate && ` - ${schedule.endDate}`}
          </span>
        </div>

        {/* Assigned By */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Assigned by: {schedule.createdBy}</span>
        </div>
      </div>
    </div>
  )
}

// Enhanced props type that extends the original
type AssignedSchedulesListPropsWithEnhanced = AssignedSchedulesListProps & Partial<EnhancedAssignedSchedulesListProps>

export function AssignedSchedulesList({
  schedules,
  isLoading = false,
  onRemoveAll,
  disableRemove = false,
  className,
  // Enhanced props (optional)
  enableVirtualScrolling = false,
  enableBulkSelection = false,
  selectedItems = new Set(),
  onItemSelect,
  onBulkSelect,
  enableDragDrop = false,
  onReorder,
  enableFiltering = false,
  showFilterControls = false,
  filterOptions = {
    searchTerm: '',
    statusFilter: [],
    sortBy: 'name',
    sortOrder: 'asc' as const
  },
  onFilterChange,
  performanceMonitoring,
  onPerformanceMetric,
}: AssignedSchedulesListPropsWithEnhanced) {
  // Performance monitoring
  const renderStartTime = useRef<number>(Date.now())
  useEffect(() => {
    if (performanceMonitoring?.enabled && onPerformanceMetric) {
      const renderTime = Date.now() - renderStartTime.current
      onPerformanceMetric({
        type: 'render',
        name: 'AssignedSchedulesList-render',
        value: renderTime,
        unit: 'ms',
        timestamp: Date.now()
      })
    }
  }, [performanceMonitoring, onPerformanceMetric])

  // Internal state for drag and drop
  const [internalSchedules, setInternalSchedules] = useState(schedules)
  const [filteredSchedules, setFilteredSchedules] = useState(schedules)
  const [searchTerm, setSearchTerm] = useState(filterOptions?.searchTerm || '')

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update internal state when schedules prop changes
  useEffect(() => {
    setInternalSchedules(schedules)
  }, [schedules])

  // Filter and search functionality
  useEffect(() => {
    let filtered = internalSchedules

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(schedule =>
        schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filterOptions?.statusFilter && filterOptions.statusFilter.length > 0) {
      filtered = filtered.filter(schedule => {
        const status = schedule.isActive ? 'active' : 'inactive'
        return filterOptions.statusFilter.includes(status)
      })
    }

    // Apply sorting
    if (filterOptions?.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[filterOptions.sortBy as keyof typeof a] ?? ''
        const bValue = b[filterOptions.sortBy as keyof typeof b] ?? ''
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        return filterOptions.sortOrder === 'desc' ? -comparison : comparison
      })
    }

    setFilteredSchedules(filtered)
  }, [internalSchedules, searchTerm, filterOptions])

  // Virtual scrolling setup
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: enableVirtualScrolling ? filteredSchedules.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated height of each schedule card
    overscan: 5,
  })

  // Drag end handler
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = internalSchedules.findIndex(schedule => schedule.id === active.id)
      const newIndex = internalSchedules.findIndex(schedule => schedule.id === over.id)

      const reorderedSchedules = arrayMove(internalSchedules, oldIndex, newIndex)
      setInternalSchedules(reorderedSchedules)
      
      if (onReorder) {
        onReorder(oldIndex, newIndex)
      }
    }
  }, [internalSchedules, onReorder])

  // Bulk selection handlers
  const handleSelectAll = useCallback(() => {
    if (onBulkSelect) {
      onBulkSelect('all')
    }
  }, [onBulkSelect])

  const handleSelectNone = useCallback(() => {
    if (onBulkSelect) {
      onBulkSelect('none')
    }
  }, [onBulkSelect])

  const selectedCount = selectedItems ? selectedItems.size : 0
  const allSelected = selectedCount === filteredSchedules.length && filteredSchedules.length > 0
  const someSelected = selectedCount > 0 && selectedCount < filteredSchedules.length

  // Loading state with skeleton (T054)
  if (isLoading) {
    return (
      <div data-testid="loading-skeleton" className={cn('grid gap-4 sm:grid-cols-1 lg:grid-cols-2', className)}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  // Empty state
  if (schedules.length === 0) {
    return (
      <div data-testid="empty-state">
        <EmptyState
          icon={Calendar}
          title="No schedules assigned"
          description="This user doesn't have any content schedules assigned yet. Click 'Assign Schedules' to get started."
          {...(className && { className })}
        />
      </div>
    )
  }

  const schedulesToRender = filteredSchedules

  const renderContent = () => {
    if (enableVirtualScrolling && virtualizer) {
      return (
        <div 
          ref={parentRef} 
          className="h-96 overflow-auto"
          data-testid="virtual-scroll-container"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const schedule = schedulesToRender[virtualItem.index]
              if (!schedule) return null

              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <SortableScheduleItem
                    schedule={schedule}
                    isSelected={selectedItems?.has(schedule.id.toString())}
                    {...(onItemSelect && { onSelect: onItemSelect })}
                    enableDragDrop={enableDragDrop}
                    enableBulkSelection={enableBulkSelection}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Regular grid layout
    return (
      <div data-testid="schedules-grid" className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {enableDragDrop ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={schedulesToRender.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {schedulesToRender.map((schedule) => (
                <SortableScheduleItem
                  key={schedule.id}
                  schedule={schedule}
                  isSelected={selectedItems?.has(schedule.id.toString())}
                  {...(onItemSelect && { onSelect: onItemSelect })}
                  enableDragDrop={enableDragDrop}
                  enableBulkSelection={enableBulkSelection}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          // Standard rendering without drag and drop
          schedulesToRender.map((schedule) => (
            <SortableScheduleItem
              key={schedule.id}
              schedule={schedule}
              isSelected={selectedItems?.has(schedule.id.toString())}
              {...(onItemSelect && { onSelect: onItemSelect })}
              enableDragDrop={false}
              enableBulkSelection={enableBulkSelection}
            />
          ))
        )}
      </div>
    )
  }

  return (
    <div data-testid="schedules-list" className={cn('space-y-6', className)}>
      {/* Enhanced Controls */}
      {(enableFiltering || enableBulkSelection) && (
        <div className="space-y-4 border-b pb-4 dark:border-gray-700">
          {/* Search and Filter Controls */}
          {enableFiltering && showFilterControls && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      onFilterChange?.({ ...filterOptions, searchTerm: e.target.value })
                    }}
                    className="pl-10"
                    data-testid="schedule-search"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>
          )}

          {/* Bulk Selection Controls */}
          {enableBulkSelection && schedulesToRender.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={allSelected}
                  onChange={allSelected ? handleSelectNone : handleSelectAll}
                  className={cn(someSelected && !allSelected && 'bg-blue-600 border-blue-600')}
                  aria-label="Select all schedules"
                  data-testid="select-all-checkbox"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedCount > 0 ? (
                    <>
                      {selectedCount} of {schedulesToRender.length} selected
                    </>
                  ) : (
                    `Select all ${schedulesToRender.length} schedules`
                  )}
                </span>
              </div>

              {selectedCount > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Edit Selected ({selectedCount})
                  </Button>
                  <Button variant="destructive" size="sm">
                    Remove Selected ({selectedCount})
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Schedules Content */}
      {renderContent()}

      {/* Bottom Controls */}
      <div className="flex items-center justify-between border-t pt-4 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-4 w-4" />
          <span>
            {filteredSchedules.length} 
            {filteredSchedules.length !== schedules.length && ` of ${schedules.length}`} 
            schedule(s) {selectedCount > 0 && `• ${selectedCount} selected`}
          </span>
        </div>
        <Button
          data-testid="remove-all-button"
          onClick={onRemoveAll}
          disabled={disableRemove || filteredSchedules.length === 0}
          variant="destructive"
        >
          Remove All {filteredSchedules.length !== schedules.length ? 'Filtered ' : ''}Schedules
        </Button>
      </div>
    </div>
  )
}

