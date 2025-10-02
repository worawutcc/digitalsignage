'use client'

/**
 * ScheduleSelector Component
 * 
 * CRITICAL: Modal with REPLACE warning when user has existing schedules.
 * Allows multi-select of schedules with search and filtering.
 * Enforces confirmation checkbox before allowing REPLACE operation.
 * 
 * PERFORMANCE: Uses react-window for virtual scrolling to handle 1000+ schedules
 * efficiently with <16ms frame time.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 * @see specs/020-phase-1/data-model.md - REPLACE Semantics
 * @see specs/020-phase-1/tasks.md - T051 Virtual Scrolling
 */

import { useState, useMemo, useRef, useCallback } from 'react'
import { List as VirtualList } from 'react-window'
import { Search, Calendar, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'
import { ScheduleSelectorProps } from './ScheduleSelector.types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

// Virtual scrolling configuration
const ITEM_HEIGHT = 80 // Height of each schedule item in pixels
const MAX_VISIBLE_ITEMS = 8 // Maximum items visible before scrolling
const LIST_HEIGHT = ITEM_HEIGHT * MAX_VISIBLE_ITEMS // Total height of visible list area

export function ScheduleSelector({
  isOpen,
  availableSchedules,
  selectedScheduleIds,
  hasExistingSchedules,
  isLoading = false,
  isSubmitting = false,
  onSelectionChange,
  onConfirm,
  onCancel,
  className,
}: ScheduleSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [acknowledgedReplace, setAcknowledgedReplace] = useState(false)
  const listRef = useRef<any>(null)
  
  // Debounce search query to prevent excessive filtering (T052)
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)
  const isSearching = searchQuery !== debouncedSearchQuery
  
  // Filter schedules based on debounced search query
  const filteredSchedules = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return availableSchedules
    
    const query = debouncedSearchQuery.toLowerCase()
    return availableSchedules.filter(
      (schedule) =>
        schedule.name.toLowerCase().includes(query) ||
        schedule.description?.toLowerCase().includes(query)
    )
  }, [availableSchedules, debouncedSearchQuery])
  
  // Handle checkbox toggle
  const handleToggleSchedule = useCallback((scheduleId: number) => {
    const newSelection = selectedScheduleIds.includes(scheduleId)
      ? selectedScheduleIds.filter(id => id !== scheduleId)
      : [...selectedScheduleIds, scheduleId]
    onSelectionChange(newSelection)
  }, [selectedScheduleIds, onSelectionChange])
  
  // Handle confirm button
  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm()
  }
  
  // Reset state when modal closes
  const handleCancel = () => {
    setSearchQuery('')
    setAcknowledgedReplace(false)
    onCancel()
  }
  
  // Reset scroll position when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    // Reset scroll to top when search changes
    if (listRef.current) {
      listRef.current.scrollToItem(0)
    }
  }
  
  // Determine if confirm button should be enabled
  const canConfirm = 
    selectedScheduleIds.length > 0 &&
    !isSubmitting &&
    (!hasExistingSchedules || acknowledgedReplace)
  
  // Virtual list row renderer
  const ScheduleRow = useCallback(({ index, style, ariaAttributes }: { 
    index: number
    style: React.CSSProperties
    ariaAttributes: {
      'aria-posinset': number
      'aria-setsize': number
      role: 'listitem'
    }
  }) => {
    const schedule = filteredSchedules[index]
    
    // Safety check - should never happen but TypeScript requires it
    if (!schedule) {
      return null
    }
    
    const isSelected = selectedScheduleIds.includes(schedule.id)
    
    return (
      <div style={style}>
        <label
          data-testid={`schedule-item-${schedule.id}`}
          className={cn(
            'flex cursor-pointer items-start gap-3 p-3 transition-colors sm:p-4 border-b border-gray-200 dark:border-gray-700',
            'hover:bg-gray-50 dark:hover:bg-gray-800',
            'active:bg-gray-100 dark:active:bg-gray-700',
            isSelected && 'bg-blue-50 dark:bg-blue-950/20',
            !schedule.isActive && 'opacity-60'
          )}
          aria-label={`${schedule.name}, ${schedule.isActive ? 'Active' : 'Inactive'} schedule, ${schedule.startDate}${schedule.endDate ? ' to ' + schedule.endDate : ''}`}
        >
          {/* Checkbox */}
          <input
            type="checkbox"
            data-testid={`schedule-checkbox-${schedule.id}`}
            checked={isSelected}
            onChange={() => handleToggleSchedule(schedule.id)}
            disabled={isSubmitting}
            aria-checked={isSelected}
            aria-describedby={`schedule-${schedule.id}-details`}
            className={cn(
              'mt-1 h-5 w-5 flex-shrink-0 rounded border-gray-300 sm:h-4 sm:w-4',
              'text-blue-600 focus:ring-2 focus:ring-blue-500',
              'dark:border-gray-600'
            )}
            style={{ minWidth: '20px', minHeight: '20px' }}
          />
          
          {/* Schedule Info */}
          <div className="flex-1 min-w-0" id={`schedule-${schedule.id}-details`}>
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {schedule.name}
              </h4>
              <span
                data-testid={`schedule-status-${schedule.id}`}
                className={cn(
                  'flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                  schedule.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                )}
              >
                {schedule.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {schedule.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                {schedule.description}
              </p>
            )}
            
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              <span>
                {schedule.startDate}
                {schedule.endDate && ` - ${schedule.endDate}`}
              </span>
            </div>
          </div>
        </label>
      </div>
    )
  }, [filteredSchedules, selectedScheduleIds, isSubmitting, handleToggleSchedule])
  
  if (!isOpen) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Select Schedules"
      size="lg"
      closeOnOverlayClick={!isSubmitting}
      className="sm:max-h-[90vh]"
    >
      <div 
        data-testid="schedule-selector-modal" 
        className={cn('flex flex-col space-y-3 sm:space-y-4', className)}
      >
        {/* CRITICAL: REPLACE WARNING */}
        {hasExistingSchedules && (
          <div
            role="alert"
            aria-live="polite"
            data-testid="replace-warning"
            className={cn(
              'rounded-lg border-2 border-amber-300 bg-amber-50 p-3 sm:p-4',
              'dark:border-amber-700 dark:bg-amber-950/30'
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 sm:text-base">
                    ⚠️ Warning: This will REPLACE existing schedules
                  </h4>
                  <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 sm:text-sm">
                    Assigning new schedules will remove ALL currently assigned schedules.
                    This action cannot be undone.
                  </p>
                </div>
                
                {/* Acknowledgment Checkbox */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    data-testid="acknowledge-checkbox"
                    checked={acknowledgedReplace}
                    onChange={(e) => setAcknowledgedReplace(e.target.checked)}
                    disabled={isSubmitting}
                    className={cn(
                      'mt-0.5 h-5 w-5 flex-shrink-0 rounded border-amber-300 sm:h-4 sm:w-4',
                      'text-amber-600 focus:ring-2 focus:ring-amber-500',
                      'dark:border-amber-700'
                    )}
                    style={{ minWidth: '20px', minHeight: '20px' }}
                  />
                  <span className="text-xs font-medium text-amber-900 dark:text-amber-200 sm:text-sm">
                    I understand this will replace all existing schedule assignments
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
        
        {/* Search Box with Debounced Loading Indicator */}
        <div className="relative" role="search">
          <label htmlFor="schedule-search" className="sr-only">
            Search schedules by name or description
          </label>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            id="schedule-search"
            type="search"
            data-testid="search-input"
            placeholder="Search schedules..."
            value={searchQuery}
            onChange={handleSearchChange}
            disabled={isSubmitting}
            aria-label="Search schedules by name or description"
            aria-describedby="search-help"
            className={cn(
              'w-full rounded-md border border-gray-300 py-3 pl-10 pr-12 sm:py-2',
              'text-sm placeholder:text-gray-400',
              'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500',
              'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{ minHeight: '44px' }}
          />
          <span id="search-help" className="sr-only">
            Type to filter schedules by name or description
          </span>
          {/* Loading indicator while debouncing */}
          {isSearching && (
            <Loader2 
              data-testid="search-loading"
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400"
              aria-label="Searching"
            />
          )}
        </div>
        
        {/* Selected Count */}
        {selectedScheduleIds.length > 0 && (
          <div 
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>{selectedScheduleIds.length} schedule(s) selected</span>
          </div>
        )}
        
        {/* Live Region for Search Results (Screen Reader Only) */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {!isLoading && debouncedSearchQuery && (
            `${filteredSchedules.length} schedule${filteredSchedules.length !== 1 ? 's' : ''} found`
          )}
        </div>
        
        {/* Schedule List */}
        <div className="max-h-[50vh] overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 sm:max-h-96">
          {/* Loading State with Skeleton (T054) */}
          {isLoading && (
            <div data-testid="loading-skeleton" className="p-4">
              <SkeletonList count={5} />
            </div>
          )}
          
          {/* Empty State - No Results */}
          {!isLoading && filteredSchedules.length === 0 && searchQuery && (
            <div className="py-8">
              <EmptyState
                icon={Search}
                title="No schedules found"
                description={`No schedules match "${searchQuery}". Try a different search term.`}
              />
            </div>
          )}
          
          {/* Empty State - No Schedules */}
          {!isLoading && availableSchedules.length === 0 && (
            <div data-testid="empty-state" className="py-8">
              <EmptyState
                icon={Calendar}
                title="No schedules available"
                description="There are no active schedules to assign at this time."
              />
            </div>
          )}
          
          {/* Schedule Items - Virtual Scrolling */}
          {!isLoading && filteredSchedules.length > 0 && (
            <div data-testid="schedule-list">
              <VirtualList
                listRef={listRef}
                defaultHeight={LIST_HEIGHT}
                rowCount={filteredSchedules.length}
                rowHeight={ITEM_HEIGHT}
                rowComponent={ScheduleRow}
                rowProps={{} as any}
                style={{ height: Math.min(LIST_HEIGHT, filteredSchedules.length * ITEM_HEIGHT), width: '100%' }}
                className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
              />
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div 
          data-testid="modal-actions" 
          className="sticky bottom-0 flex flex-col gap-2 border-t bg-white pt-3 dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:justify-end sm:gap-3 sm:pt-4"
        >
          <Button
            data-testid="cancel-button"
            onClick={handleCancel}
            disabled={isSubmitting}
            variant="outline"
            className="w-full sm:w-auto"
            style={{ minHeight: '44px' }}
          >
            Cancel
          </Button>
          <Button
            data-testid="confirm-button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            loading={isSubmitting}
            variant="default"
            className="w-full sm:w-auto"
            style={{ minHeight: '44px' }}
            aria-label={selectedScheduleIds.length > 0 ? `Assign ${selectedScheduleIds.length} schedule${selectedScheduleIds.length > 1 ? 's' : ''}` : 'Assign schedules'}
            aria-disabled={!canConfirm}
            aria-busy={isSubmitting}
            aria-describedby={!canConfirm && hasExistingSchedules ? 'confirm-help' : undefined}
          >
            {isSubmitting ? 'Assigning...' : `Assign ${selectedScheduleIds.length > 0 ? `(${selectedScheduleIds.length})` : 'Schedules'}`}
          </Button>
          {!canConfirm && hasExistingSchedules && !acknowledgedReplace && (
            <span id="confirm-help" className="sr-only">
              Please acknowledge the warning to enable this button
            </span>
          )}
          {!canConfirm && selectedScheduleIds.length === 0 && (
            <span id="confirm-help" className="sr-only">
              Select at least one schedule to enable this button
            </span>
          )}
        </div>
      </div>
    </Modal>
  )
}

