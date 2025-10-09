/**
 * @fileoverview Assignment Dashboard Page
 * @description Main assignment management page with filtering, sorting, and bulk operations
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Download, Upload, Filter, LayoutGrid, LayoutList, Calendar, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  AssignmentCard,
} from '@/features/assignments/components/AssignmentCard';
import { AssignmentWizard } from '@/features/assignments/components/AssignmentWizard';
import { useAssignments } from '@/features/assignments/api/assignmentHooks';
import {
  AssignmentStatus,
  AssignmentTargetType,
  type AssignmentFilter,
  type AssignmentSort,
} from '@/features/assignments/types/assignment.types';
import {
  setPage,
  updateFilter,
  updateSort,
  setViewMode,
  toggleAssignmentSelection,
  clearSelection,
  clearFilters,
} from '@/features/assignments/store/assignmentSlice';
import {
  selectFilters,
  selectSort,
  selectCurrentPage,
  selectSelectedAssignmentIds,
  selectUIState,
} from '@/features/assignments/store/selectors';
import { useDispatch, useSelector } from '@/store';
import type { AppDispatch } from '@/store';
import { cn } from '@/lib/utils';

/**
 * View mode type
 */
type ViewMode = 'list' | 'grid' | 'calendar';

/**
 * Assignment Dashboard Page Component
 */
export default function AssignmentsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const filters = useSelector(selectFilters);
  const sort = useSelector(selectSort);
  const uiState = useSelector(selectUIState);
  const viewMode = uiState?.viewMode || 'list';
  const page = useSelector(selectCurrentPage);
  const selectedIds = useSelector(selectSelectedAssignmentIds);

  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const pageSize = 20;

  // Fetch assignments with React Query
  const { data, isLoading, isError, error } = useAssignments({
    page,
    pageSize,
    ...filters,
    sortBy: sort.field,
    sortDirection: sort.direction,
  });

  // Computed values with client-side search filtering
  const allAssignments = data?.items || [];
  const filteredAssignments = searchQuery
    ? allAssignments.filter((assignment) => {
        const searchLower = searchQuery.toLowerCase();
        // Search in content name, target name, and notes
        return (
          assignment.contentName?.toLowerCase().includes(searchLower) ||
          assignment.targetName?.toLowerCase().includes(searchLower) ||
          assignment.notes?.toLowerCase().includes(searchLower)
        );
      })
    : allAssignments;
  
  const assignments = filteredAssignments;
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasSelection = selectedIds.length > 0;

  /**
   * Handle search
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    dispatch(setPage(1)); // Reset to first page on search
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (newFilters: Partial<AssignmentFilter>) => {
    dispatch(updateFilter(newFilters));
    dispatch(setPage(1)); // Reset to first page on filter
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (field: AssignmentSort['field']) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    dispatch(updateSort({ field, direction: newDirection }));
  };

  /**
   * Handle view mode change
   */
  const handleViewModeChange = (mode: ViewMode) => {
    dispatch(setViewMode(mode));
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  /**
   * Handle assignment selection
   */
  const handleSelectAssignment = (id: number) => {
    dispatch(toggleAssignmentSelection(id));
  };

  /**
   * Handle select all
   */
  const handleSelectAll = () => {
    if (hasSelection) {
      dispatch(clearSelection());
    } else {
      // Select all on current page
      assignments.forEach((assignment) => {
        dispatch(toggleAssignmentSelection(assignment.id));
      });
    }
  };

  /**
   * Handle create new assignment
   */
  const handleCreate = () => {
    setShowWizard(true);
  };

  /**
   * Handle wizard success
   */
  const handleWizardSuccess = (assignmentId: number) => {
    setShowWizard(false);
    // Optionally navigate to the new assignment or refetch data
    router.push(`/assignments/${assignmentId}`);
  };

  /**
   * Handle wizard close
   */
  const handleWizardClose = () => {
    setShowWizard(false);
  };

  /**
   * Handle assignment click
   */
  const handleAssignmentClick = (id: number) => {
    router.push(`/assignments/${id}`);
  };

  /**
   * Handle bulk export
   */
  const handleBulkExport = () => {
    // TODO: Implement bulk export
    console.log('Bulk export:', selectedIds);
  };

  /**
   * Handle bulk import
   */
  const handleBulkImport = () => {
    // TODO: Implement bulk import modal
    console.log('Bulk import');
  };

  /**
   * Clear filters
   */
  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchQuery('');
    dispatch(setPage(1));
  };

  /**
   * Active filter count
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.assignmentType) count++;
    if (filters.targetType) count++;
    if (filters.status) count++;
    if (filters.isEmergencyBroadcast) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.priority !== undefined) count++;
    return count;
  }, [filters]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <LoadingSkeleton count={5} className="h-32" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <EmptyState
          icon={AlertCircle}
          title="Failed to load assignments"
          description={error?.message || 'An error occurred while loading assignments'}
          action={{
            label: "Retry",
            onClick: () => window.location.reload()
          }}
        />
      </div>
    );
  }

  // Empty state
  if (assignments.length === 0 && !searchQuery && activeFilterCount === 0) {
    return (
      <div className="container mx-auto py-6">
        <EmptyState
          icon={Calendar}
          title="No assignments yet"
          description="Get started by creating your first content assignment"
          action={{
            label: "Create Assignment",
            onClick: handleCreate
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground mt-1">
            Manage content assignments to devices and groups
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBulkImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkExport} disabled={!hasSelection}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search assignments by content name, target, or notes..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(activeFilterCount > 0 && 'border-primary')}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="default" className="ml-2 h-5 min-w-5 rounded-full">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear all
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.status || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const newFilters = { ...filters };
                  if (value) {
                    newFilters.status = value as unknown as AssignmentStatus;
                  } else {
                    delete newFilters.status;
                  }
                  handleFilterChange(newFilters);
                }}
              >
                <option value="">All statuses</option>
                <option value={AssignmentStatus.Draft}>Draft</option>
                <option value={AssignmentStatus.Scheduled}>Scheduled</option>
                <option value={AssignmentStatus.Active}>Active</option>
                <option value={AssignmentStatus.Paused}>Paused</option>
                <option value={AssignmentStatus.Expired}>Expired</option>
                <option value={AssignmentStatus.Cancelled}>Cancelled</option>
              </select>
            </div>

            {/* Target Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Type</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.targetType || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const newFilters = { ...filters };
                  if (value) {
                    newFilters.targetType = value as unknown as AssignmentTargetType;
                  } else {
                    delete newFilters.targetType;
                  }
                  handleFilterChange(newFilters);
                }}
              >
                <option value="">All types</option>
                <option value={AssignmentTargetType.Device}>Device</option>
                <option value={AssignmentTargetType.DeviceGroup}>Device Group</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Priority</label>
              <input
                type="number"
                min="1"
                max="10"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.priority || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const newFilters = { ...filters };
                  if (value) {
                    newFilters.priority = parseInt(value);
                  } else {
                    delete newFilters.priority;
                  }
                  handleFilterChange(newFilters);
                }}
                placeholder="1-10"
              />
            </div>

            {/* Emergency Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Emergency Only</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-input"
                  checked={filters.isEmergencyBroadcast || false}
                  onChange={(e) => {
                    const newFilters = { ...filters };
                    if (e.target.checked) {
                      newFilters.isEmergencyBroadcast = true;
                    } else {
                      delete newFilters.isEmergencyBroadcast;
                    }
                    handleFilterChange(newFilters);
                  }}
                />
                <span className="text-sm">Show emergency broadcasts</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* View Controls and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'assignment' : 'assignments'}
            {hasSelection && ` • ${selectedIds.length} selected`}
          </div>
          {hasSelection && (
            <Button variant="ghost" size="sm" onClick={() => dispatch(clearSelection())}>
              Clear selection
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Controls */}
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={`${sort.field}-${sort.direction}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              dispatch(updateSort({ field: field as AssignmentSort['field'], direction: direction as 'asc' | 'desc' }));
            }}
          >
            <option value="createdAt-desc">Newest first</option>
            <option value="createdAt-asc">Oldest first</option>
            <option value="priority-desc">Highest priority</option>
            <option value="priority-asc">Lowest priority</option>
            <option value="startDate-desc">Start date (latest)</option>
            <option value="startDate-asc">Start date (earliest)</option>
            <option value="contentName-asc">Content name (A-Z)</option>
            <option value="contentName-desc">Content name (Z-A)</option>
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center rounded-md border">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => handleViewModeChange('list')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-none border-x"
              onClick={() => handleViewModeChange('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => handleViewModeChange('calendar')}
              disabled
              title="Calendar view coming soon"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Selection Toolbar */}
      {hasSelection && (
        <div className="rounded-lg border bg-muted/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedIds.length === assignments.length}
              onChange={handleSelectAll}
              className="rounded border-input"
            />
            <span className="text-sm font-medium">
              {selectedIds.length} of {assignments.length} selected on this page
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Activate
            </Button>
            <Button variant="outline" size="sm">
              Pause
            </Button>
            <Button variant="outline" size="sm">
              Update Priority
            </Button>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Assignment List/Grid */}
      {assignments.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No assignments found"
          description="Try adjusting your search or filters"
          action={{
            label: "Clear filters",
            onClick: handleClearFilters
          }}
        />
      ) : (
        <div
          className={cn(
            viewMode === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
            viewMode === 'list' && 'space-y-4'
          )}
        >
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              selected={selectedIds.includes(assignment.id)}
              onSelect={() => handleSelectAssignment(assignment.id)}
              onClick={() => handleAssignmentClick(assignment.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Assignment Creation Wizard */}
      <AssignmentWizard
        isOpen={showWizard}
        onClose={handleWizardClose}
        onSuccess={handleWizardSuccess}
      />
    </div>
  );
}
