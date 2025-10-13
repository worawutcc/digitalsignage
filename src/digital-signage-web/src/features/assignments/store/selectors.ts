/**
 * @fileoverview Assignment Redux Selectors
 * @description Memoized selectors for assignment state using Reselect
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type { Assignment, AssignmentStatus } from '../types/assignment.types';
import {
  isActiveAssignment,
  isExpiredAssignment,
  isEmergencyBroadcast,
} from '../types/assignment.types';

// ========================================================================
// Base Selectors
// ========================================================================

export const selectAssignmentsState = (state: RootState) => state.assignments;

export const selectAssignments = (state: RootState) => state.assignments.assignments;

export const selectAssignmentSummaries = (state: RootState) =>
  state.assignments.assignmentSummaries;

export const selectTotalCount = (state: RootState) => state.assignments.totalCount;

export const selectCurrentPage = (state: RootState) => state.assignments.currentPage;

export const selectPageSize = (state: RootState) => state.assignments.pageSize;

export const selectCurrentAssignment = (state: RootState) =>
  state.assignments.currentAssignment;

export const selectFilters = (state: RootState) => state.assignments.filters;

export const selectSort = (state: RootState) => state.assignments.sort;

export const selectSearchQuery = (state: RootState) => state.assignments.searchQuery;

export const selectSelectedAssignmentIds = (state: RootState) =>
  state.assignments.selectedAssignmentIds;

export const selectDraftAssignment = (state: RootState) =>
  state.assignments.draftAssignment;

export const selectAnalytics = (state: RootState) => state.assignments.analytics;

export const selectUIState = (state: RootState) => state.assignments.ui;

export const selectLoadingState = (state: RootState) => state.assignments.loading;

export const selectErrors = (state: RootState) => state.assignments.errors;

// ========================================================================
// Computed Selectors
// ========================================================================

/**
 * Get selected assignments (full objects)
 */
export const selectSelectedAssignments = createSelector(
  [selectAssignments, selectSelectedAssignmentIds],
  (assignments, selectedIds) =>
    assignments.filter((assignment) => selectedIds.includes(assignment.id))
);

/**
 * Get assignment by ID
 */
export const selectAssignmentById = (assignmentId: number) =>
  createSelector([selectAssignments], (assignments) =>
    assignments.find((a) => a.id === assignmentId)
  );

/**
 * Check if assignment is selected
 */
export const selectIsAssignmentSelected = (assignmentId: number) =>
  createSelector(
    [selectSelectedAssignmentIds],
    (selectedIds) => selectedIds.includes(assignmentId)
  );

/**
 * Get selected assignments count
 */
export const selectSelectedAssignmentsCount = createSelector(
  [selectSelectedAssignmentIds],
  (selectedIds) => selectedIds.length
);

/**
 * Check if any assignments are selected
 */
export const selectHasSelection = createSelector(
  [selectSelectedAssignmentIds],
  (selectedIds) => selectedIds.length > 0
);

/**
 * Check if all assignments are selected
 */
export const selectAreAllAssignmentsSelected = createSelector(
  [selectAssignments, selectSelectedAssignmentIds],
  (assignments, selectedIds) =>
    assignments.length > 0 && assignments.length === selectedIds.length
);

/**
 * Get filtered assignments (client-side filtering)
 */
export const selectFilteredAssignments = createSelector(
  [selectAssignments, selectFilters, selectUIState],
  (assignments, filters, ui) => {
    let filtered = [...assignments];

    // Filter by assignment type
    if (filters.assignmentType !== undefined) {
      filtered = filtered.filter((a) => a.assignmentType === filters.assignmentType);
    }

    // Filter by target type
    if (filters.targetType !== undefined) {
      filtered = filtered.filter((a) => a.targetType === filters.targetType);
    }

    // Filter by status
    if (filters.status !== undefined) {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    // Filter by emergency broadcast
    if (filters.isEmergencyBroadcast !== undefined) {
      filtered = filtered.filter(
        (a) => a.isEmergencyBroadcast === filters.isEmergencyBroadcast
      );
    }

    // Filter by priority range
    if (filters.priority !== undefined) {
      filtered = filtered.filter((a) => a.priority === filters.priority);
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(
        (a) => a.startDate && new Date(a.startDate) >= new Date(filters.startDate!)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(
        (a) => a.endDate && new Date(a.endDate) <= new Date(filters.endDate!)
      );
    }

    // Filter by search query (content name or target name)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.contentName.toLowerCase().includes(query) ||
          a.targetName.toLowerCase().includes(query) ||
          (a.notes && a.notes.toLowerCase().includes(query))
      );
    }

    // UI filters
    if (!ui.showExpired) {
      filtered = filtered.filter((a) => !isExpiredAssignment(a));
    }

    if (ui.onlyEmergencyBroadcasts) {
      filtered = filtered.filter((a) => isEmergencyBroadcast(a));
    }

    return filtered;
  }
);

/**
 * Get sorted assignments
 */
export const selectSortedAssignments = createSelector(
  [selectFilteredAssignments, selectSort],
  (assignments, sort) => {
    if (!sort) return assignments;

    const sorted = [...assignments];
    sorted.sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Compare values
      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }
);

/**
 * Get paginated assignments (for current page)
 */
export const selectPaginatedAssignments = createSelector(
  [selectSortedAssignments, selectCurrentPage, selectPageSize],
  (assignments, currentPage, pageSize) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return assignments.slice(startIndex, endIndex);
  }
);

/**
 * Get total pages count
 */
export const selectTotalPages = createSelector(
  [selectFilteredAssignments, selectPageSize],
  (assignments, pageSize) => Math.ceil(assignments.length / pageSize)
);

/**
 * Check if there are more pages
 */
export const selectHasNextPage = createSelector(
  [selectCurrentPage, selectTotalPages],
  (currentPage, totalPages) => currentPage < totalPages
);

/**
 * Check if there is a previous page
 */
export const selectHasPreviousPage = createSelector(
  [selectCurrentPage],
  (currentPage) => currentPage > 1
);

// ========================================================================
// Statistics & Analytics
// ========================================================================

/**
 * Get assignment statistics
 */
export const selectAssignmentStatistics = createSelector(
  [selectAssignments],
  (assignments) => {
    const stats = {
      total: assignments.length,
      byStatus: {} as Record<string, number>,
      emergencyCount: 0,
      activeHighPriority: 0,
    };

    assignments.forEach((assignment) => {
      // Count by status
      stats.byStatus[assignment.status] =
        (stats.byStatus[assignment.status] || 0) + 1;

      // Count emergency broadcasts
      if (isEmergencyBroadcast(assignment)) {
        stats.emergencyCount++;
      }

      // Count active high-priority assignments (priority >= 8)
      if (isActiveAssignment(assignment) && assignment.priority >= 8) {
        stats.activeHighPriority++;
      }
    });

    return stats;
  }
);

/**
 * Get active assignments
 */
export const selectActiveAssignments = createSelector(
  [selectAssignments],
  (assignments) => assignments.filter((a) => isActiveAssignment(a))
);

/**
 * Get active assignments count
 */
export const selectActiveAssignmentsCount = createSelector(
  [selectActiveAssignments],
  (activeAssignments) => activeAssignments.length
);

/**
 * Get expired assignments
 */
export const selectExpiredAssignments = createSelector(
  [selectAssignments],
  (assignments) => assignments.filter((a) => isExpiredAssignment(a))
);

/**
 * Get expired assignments count
 */
export const selectExpiredAssignmentsCount = createSelector(
  [selectExpiredAssignments],
  (expiredAssignments) => expiredAssignments.length
);

/**
 * Get emergency broadcasts
 */
export const selectEmergencyBroadcasts = createSelector(
  [selectAssignments],
  (assignments) => assignments.filter((a) => isEmergencyBroadcast(a))
);

/**
 * Get emergency broadcasts count
 */
export const selectEmergencyBroadcastsCount = createSelector(
  [selectEmergencyBroadcasts],
  (emergencyBroadcasts) => emergencyBroadcasts.length
);

/**
 * Get assignments by priority level
 */
export const selectAssignmentsByPriorityLevel = createSelector(
  [selectAssignments],
  (assignments) => ({
    low: assignments.filter((a) => a.priority >= 1 && a.priority <= 3),
    medium: assignments.filter((a) => a.priority >= 4 && a.priority <= 7),
    high: assignments.filter((a) => a.priority >= 8 && a.priority <= 10),
  })
);

// ========================================================================
// Loading State Selectors
// ========================================================================

export const selectIsFetchingAssignments = (state: RootState) =>
  state.assignments.loading.fetchingAssignments;

export const selectIsFetchingAssignment = (state: RootState) =>
  state.assignments.loading.fetchingAssignment;

export const selectIsCreatingAssignment = (state: RootState) =>
  state.assignments.loading.creatingAssignment;

export const selectIsUpdatingAssignment = (state: RootState) =>
  state.assignments.loading.updatingAssignment;

export const selectIsDeletingAssignment = (state: RootState) =>
  state.assignments.loading.deletingAssignment;

export const selectIsBulkOperationInProgress = (state: RootState) =>
  state.assignments.loading.bulkOperationInProgress;

export const selectIsFetchingAnalytics = (state: RootState) =>
  state.assignments.loading.fetchingAnalytics;

export const selectIsValidatingAssignment = (state: RootState) =>
  state.assignments.loading.validatingAssignment;

/**
 * Check if any loading operation is in progress
 */
export const selectIsLoading = createSelector([selectLoadingState], (loading) =>
  Object.values(loading).some((isLoading) => isLoading)
);

// ========================================================================
// Error Selectors
// ========================================================================

export const selectFetchError = (state: RootState) => state.assignments.errors.fetchError;

export const selectCreateError = (state: RootState) =>
  state.assignments.errors.createError;

export const selectUpdateError = (state: RootState) =>
  state.assignments.errors.updateError;

export const selectDeleteError = (state: RootState) =>
  state.assignments.errors.deleteError;

export const selectBulkErrors = (state: RootState) => state.assignments.errors.bulkErrors;

export const selectAnalyticsError = (state: RootState) =>
  state.assignments.errors.analyticsError;

export const selectValidationErrors = (state: RootState) =>
  state.assignments.errors.validationErrors;

/**
 * Check if there are any errors
 */
export const selectHasErrors = createSelector([selectErrors], (errors) => {
  return (
    errors.fetchError !== null ||
    errors.createError !== null ||
    errors.updateError !== null ||
    errors.deleteError !== null ||
    errors.bulkErrors.length > 0 ||
    errors.analyticsError !== null ||
    Object.keys(errors.validationErrors).length > 0
  );
});

/**
 * Get validation status
 */
export const selectValidationStatus = createSelector(
  [selectValidationErrors],
  (validationErrors) => ({
    isValid: Object.keys(validationErrors).length === 0,
    hasErrors: Object.keys(validationErrors).length > 0,
    hasWarnings: false, // Extend if you have warnings
    errorCount: Object.keys(validationErrors).length,
    warningCount: 0,
  })
);

// ========================================================================
// UI State Selectors
// ========================================================================

export const selectIsDrawerOpen = (state: RootState) => state.assignments.ui.isDrawerOpen;

export const selectIsBulkPanelVisible = (state: RootState) =>
  state.assignments.ui.isBulkPanelVisible;

export const selectIsFilterPanelExpanded = (state: RootState) =>
  state.assignments.ui.isFilterPanelExpanded;

export const selectViewMode = (state: RootState) => state.assignments.ui.viewMode;

export const selectShowExpired = (state: RootState) => state.assignments.ui.showExpired;

export const selectOnlyEmergencyBroadcasts = (state: RootState) =>
  state.assignments.ui.onlyEmergencyBroadcasts;

// ========================================================================
// Draft Selectors
// ========================================================================

/**
 * Check if there is a draft in progress
 */
export const selectHasDraft = createSelector(
  [selectDraftAssignment],
  (draft) => draft !== null && Object.keys(draft).length > 0
);

/**
 * Check if draft is valid (has required fields)
 */
export const selectIsDraftValid = createSelector([selectDraftAssignment], (draft) => {
  if (!draft) return false;
  // Check required fields for assignment creation
  return !!(
    draft.assignmentType !== undefined &&
    draft.contentId !== undefined &&
    draft.targetType !== undefined &&
    draft.targetId !== undefined &&
    draft.priority !== undefined &&
    draft.startDate &&
    draft.endDate
  );
});
