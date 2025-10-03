'use client'

/**
 * ScheduleSelector Component
 * 
 * Enhanced component with fuzzy search, advanced filtering, modal/inline modes,
 * and performance optimizations. Backward compatible with ScheduleSelectorProps.
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

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { List as VirtualList } from 'react-window'
import { 
  Search, 
  Calendar, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2,
  Filter,
  SlidersHorizontal,
  X,
  Settings
} from 'lucide-react'
import { ScheduleSelectorProps } from './ScheduleSelector.types'
import type { EnhancedScheduleSelectorProps } from '@/types/enhanced-ui'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

// Fuzzy search utilities
const fuzzyMatch = (text: string, query: string): { score: number; matches: boolean } => {
  if (!query) return { score: 1, matches: true }
  
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()
  
  // Exact match gets highest score
  if (textLower.includes(queryLower)) {
    return { score: 1, matches: true }
  }
  
  // Fuzzy matching - simple implementation
  let score = 0
  let textIndex = 0
  let queryIndex = 0
  
  while (textIndex < text.length && queryIndex < query.length) {
    if (textLower[textIndex] === queryLower[queryIndex]) {
      score += 1
      queryIndex++
    }
    textIndex++
  }
  
  const matches = queryIndex === query.length
  const normalizedScore = matches ? score / query.length : 0
  
  return { score: normalizedScore, matches }
}

// Virtual scrolling configuration
const ITEM_HEIGHT = 80 // Height of each schedule item in pixels
const MAX_VISIBLE_ITEMS = 8 // Maximum items visible before scrolling
const LIST_HEIGHT = ITEM_HEIGHT * MAX_VISIBLE_ITEMS // Total height of visible list area

// Enhanced props type that extends the original
type ScheduleSelectorPropsWithEnhanced = ScheduleSelectorProps & Partial<EnhancedScheduleSelectorProps>

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
  // Enhanced props (optional)
  enableFuzzySearch = false,
  searchDebounceMs = 300,
  advancedSearch,
  enableAdvancedFiltering = false,
  filterCriteria = [],
  currentFilters = {},
  onFiltersChange,
  displayMode = 'modal',
  inlineConfig = {
    maxHeight: 400,
    showBorder: true,
    compact: false
  },
  enableSelectionValidation = false,
  selectionValidation,
  showSelectionPreview = false,
  enablePerformanceMode = false,
  virtualizationThreshold = 50,
  performanceMonitoring,
  onPerformanceMetric,
}: ScheduleSelectorPropsWithEnhanced) {
  const [searchQuery, setSearchQuery] = useState('')
  const [acknowledgedReplace, setAcknowledgedReplace] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState(currentFilters)
  const listRef = useRef<any>(null)
  const searchStartTime = useRef<number>(0)
  
  // Performance monitoring
  useEffect(() => {
    if (performanceMonitoring?.enabled && onPerformanceMetric) {
      const renderTime = Date.now() - searchStartTime.current
      if (renderTime > 0) {
        onPerformanceMetric({
          type: 'render',
          name: 'ScheduleSelector-search',
          value: renderTime,
          unit: 'ms',
          timestamp: Date.now()
        })
      }
    }
  }, [searchQuery, performanceMonitoring, onPerformanceMetric])
  
  // Debounce search query to prevent excessive filtering
  const debouncedSearchQuery = useDebouncedValue(searchQuery, searchDebounceMs)
  const isSearching = searchQuery !== debouncedSearchQuery
  
  // Enhanced search and filtering
  const filteredSchedules = useMemo(() => {
    searchStartTime.current = Date.now()
    
    let filtered = [...availableSchedules]
    
    // Apply search
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.trim()
      
      if (enableFuzzySearch) {
        // Fuzzy search with scoring
        const searchResults = filtered.map(schedule => {
          const searchFields = advancedSearch?.searchFields || ['name', 'description']
          let bestScore = 0
          
          searchFields.forEach(field => {
            const value = schedule[field as keyof typeof schedule]
            if (typeof value === 'string') {
              const { score, matches } = fuzzyMatch(value, query)
              if (matches && score > bestScore) {
                bestScore = score
              }
            }
          })
          
          return { schedule, score: bestScore }
        })
        
        const minScore = advancedSearch?.minimumMatchScore || 0.3
        filtered = searchResults
          .filter(result => result.score >= minScore)
          .sort((a, b) => b.score - a.score)
          .map(result => result.schedule)
      } else {
        // Standard search
        const queryLower = query.toLowerCase()
        filtered = filtered.filter(schedule =>
          schedule.name.toLowerCase().includes(queryLower) ||
          schedule.description?.toLowerCase().includes(queryLower)
        )
      }
    }
    
    // Apply advanced filters
    if (enableAdvancedFiltering && Object.keys(activeFilters).length > 0) {
      filtered = filtered.filter(schedule => {
        return Object.entries(activeFilters).every(([field, value]) => {
          if (!value) return true
          
          const scheduleValue = schedule[field as keyof typeof schedule]
          
          if (typeof value === 'boolean') {
            return scheduleValue === value
          }
          
          if (Array.isArray(value)) {
            return value.includes(scheduleValue)
          }
          
          if (typeof value === 'string') {
            return String(scheduleValue).toLowerCase().includes(value.toLowerCase())
          }
          
          return scheduleValue === value
        })
      })
    }
    
    return filtered
  }, [
    availableSchedules, 
    debouncedSearchQuery, 
    enableFuzzySearch, 
    advancedSearch,
    enableAdvancedFiltering,
    activeFilters
  ])
  
  // Selection validation
  const validationResult = useMemo(() => {
    if (!enableSelectionValidation || !selectionValidation) {
      return { valid: true }
    }
    
    const { minItems = 0, maxItems = Infinity, validateConflicts = false, customValidator } = selectionValidation
    
    // Check min/max items
    if (selectedScheduleIds.length < minItems) {
      return { valid: false, message: `Please select at least ${minItems} schedule(s)` }
    }
    
    if (selectedScheduleIds.length > maxItems) {
      return { valid: false, message: `Please select no more than ${maxItems} schedule(s)` }
    }
    
    // Check for conflicts (overlapping schedules)
    if (validateConflicts) {
      const selectedSchedules = availableSchedules.filter(s => selectedScheduleIds.includes(s.id))
      // Simple conflict detection - can be enhanced
      const conflicts = selectedSchedules.some((schedule, index) => {
        return selectedSchedules.slice(index + 1).some(other => {
          // Basic date overlap check
          return schedule.startDate === other.startDate
        })
      })
      
      if (conflicts) {
        return { valid: false, message: 'Selected schedules have conflicting time slots' }
      }
    }
    
    // Custom validation
    if (customValidator) {
      return customValidator(selectedScheduleIds)
    }
    
    return { valid: true }
  }, [enableSelectionValidation, selectionValidation, selectedScheduleIds, availableSchedules])

  // Handle checkbox toggle
  const handleToggleSchedule = useCallback((scheduleId: number) => {
    const newSelection = selectedScheduleIds.includes(scheduleId)
      ? selectedScheduleIds.filter(id => id !== scheduleId)
      : [...selectedScheduleIds, scheduleId]
    onSelectionChange(newSelection)
  }, [selectedScheduleIds, onSelectionChange])
  
  // Handle filter changes
  const handleFilterChange = useCallback((field: string, value: any) => {
    const newFilters = { ...activeFilters, [field]: value }
    setActiveFilters(newFilters)
    onFiltersChange?.(newFilters)
  }, [activeFilters, onFiltersChange])
  
  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setActiveFilters({})
    onFiltersChange?.({})
  }, [onFiltersChange])
  
  // Handle confirm button
  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm()
  }
  
  // Reset state when modal closes
  const handleCancel = () => {
    setSearchQuery('')
    setAcknowledgedReplace(false)
    setShowAdvancedFilters(false)
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
    (!hasExistingSchedules || acknowledgedReplace) &&
    validationResult.valid
  
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
  
  // Inline mode guard
  if (displayMode === 'inline' && !isOpen) {
    return null
  }
  
  // Modal mode guard
  if (displayMode === 'modal' && !isOpen) {
    return null
  }
  
  // Render content (shared between modal and inline)
  const renderContent = () => (
    <div 
      data-testid={displayMode === 'modal' ? "schedule-selector-modal" : "schedule-selector-inline"} 
      className={cn(
        'flex flex-col space-y-3 sm:space-y-4',
        displayMode === 'inline' && inlineConfig?.compact && 'space-y-2',
        className
      )}
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
        
        {/* Advanced Filters Toggle */}
        {enableAdvancedFiltering && filterCriteria.length > 0 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="gap-2"
              data-testid="toggle-filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Advanced Filters
              {Object.keys(activeFilters).length > 0 && (
                <span className="ml-1 bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                  {Object.keys(activeFilters).length}
                </span>
              )}
            </Button>
            
            {Object.keys(activeFilters).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="gap-2 text-red-600 hover:text-red-700"
                data-testid="clear-filters"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        )}

        {/* Advanced Filters Panel */}
        {enableAdvancedFiltering && showAdvancedFilters && filterCriteria.length > 0 && (
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Filter Schedules
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(false)}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filterCriteria.map((criteria) => (
                <div key={criteria.field} className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {criteria.label}
                  </label>
                  
                  {criteria.type === 'text' && (
                    <Input
                      type="text"
                      value={activeFilters[criteria.field] || ''}
                      onChange={(e) => handleFilterChange(criteria.field, e.target.value)}
                      placeholder={`Filter by ${criteria.label.toLowerCase()}...`}
                      className="w-full"
                    />
                  )}
                  
                  {criteria.type === 'select' && criteria.options && (
                    <select
                      value={activeFilters[criteria.field] || ''}
                      onChange={(e) => handleFilterChange(criteria.field, e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                    >
                      <option value="">All {criteria.label}</option>
                      {criteria.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {criteria.type === 'boolean' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={activeFilters[criteria.field] || false}
                        onChange={(e) => handleFilterChange(criteria.field, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Show only {criteria.label.toLowerCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Count */}
        {selectedScheduleIds.length > 0 && (
          <div 
            className="flex items-center justify-between"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>{selectedScheduleIds.length} schedule(s) selected</span>
            </div>
            
            {/* Selection Preview */}
            {showSelectionPreview && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                data-testid="preview-selection"
              >
                <Settings className="h-4 w-4" />
                Preview Selection
              </Button>
            )}
          </div>
        )}

        {/* Selection Validation Error */}
        {!validationResult.valid && validationResult.message && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-200">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{validationResult.message}</span>
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
    )
  
  // Return based on display mode
  if (displayMode === 'inline') {
    return (
      <div 
        className={cn(
          'bg-white dark:bg-gray-900 rounded-lg',
          inlineConfig?.showBorder && 'border border-gray-200 dark:border-gray-700',
          inlineConfig?.compact ? 'p-3' : 'p-4'
        )}
        style={{ 
          maxHeight: inlineConfig?.maxHeight || 400,
          overflow: 'auto'
        }}
      >
        {renderContent()}
      </div>
    )
  }
  
  // Modal display mode (default)
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Select Schedules"
      size="lg"
      closeOnOverlayClick={!isSubmitting}
      className="sm:max-h-[90vh]"
    >
      {renderContent()}
    </Modal>
  )
}

