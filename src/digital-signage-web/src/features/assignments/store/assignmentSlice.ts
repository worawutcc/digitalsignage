/**
 * @fileoverview Assignment Redux Slice
 * @description Redux Toolkit slice for assignment state management with comprehensive CRUD operations
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AssignmentState } from '../types/state.types';
import type {
  Assignment,
  AssignmentFilter,
  AssignmentSort,
  AssignmentStatus,
} from '../types/assignment.types';
import type { AssignmentAnalytics } from '../types/api.types';

/**
 * Initial state for assignments
 */
const initialState: AssignmentState = {
  // Data
  assignments: [],
  assignmentSummaries: [],
  totalCount: 0,
  currentPage: 1,
  pageSize: 20,
  currentAssignment: null,

  // Filters & Sort
  filters: {},
  sort: {
    field: 'createdAt',
    direction: 'desc',
  },
  searchQuery: '',

  // Selection
  selectedAssignmentIds: [],

  // Draft
  draftAssignment: null,

  // Analytics
  analytics: null,

  // UI State
  ui: {
    isDrawerOpen: false,
    isBulkPanelVisible: false,
    isFilterPanelExpanded: false,
    viewMode: 'list',
    showExpired: false,
    onlyEmergencyBroadcasts: false,
  },

  // Loading States
  loading: {
    fetchingAssignments: false,
    fetchingAssignment: false,
    creatingAssignment: false,
    updatingAssignment: false,
    deletingAssignment: false,
    bulkOperationInProgress: false,
    fetchingAnalytics: false,
    validatingAssignment: false,
  },

  // Errors
  errors: {
    fetchError: null,
    createError: null,
    updateError: null,
    deleteError: null,
    bulkErrors: [],
    analyticsError: null,
    validationErrors: {},
  },
};

/**
 * Assignment slice with comprehensive state management
 */
const assignmentSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    // ========================================================================
    // Fetch Assignments
    // ========================================================================
    fetchAssignmentsStart: (state) => {
      state.loading.fetchingAssignments = true;
      state.errors.fetchError = null;
    },
    fetchAssignmentsSuccess: (
      state,
      action: PayloadAction<{
        assignments: Assignment[];
        totalCount: number;
        page: number;
        pageSize: number;
      }>
    ) => {
      state.loading.fetchingAssignments = false;
      state.assignments = action.payload.assignments;
      state.totalCount = action.payload.totalCount;
      state.currentPage = action.payload.page;
      state.pageSize = action.payload.pageSize;
      state.errors.fetchError = null;
    },
    fetchAssignmentsFailure: (state, action: PayloadAction<string>) => {
      state.loading.fetchingAssignments = false;
      state.errors.fetchError = action.payload;
    },

    // ========================================================================
    // Fetch Single Assignment
    // ========================================================================
    fetchAssignmentStart: (state) => {
      state.loading.fetchingAssignment = true;
      state.errors.fetchError = null;
    },
    fetchAssignmentSuccess: (state, action: PayloadAction<Assignment>) => {
      state.loading.fetchingAssignment = false;
      state.currentAssignment = action.payload;
      state.errors.fetchError = null;
    },
    fetchAssignmentFailure: (state, action: PayloadAction<string>) => {
      state.loading.fetchingAssignment = false;
      state.errors.fetchError = action.payload;
    },

    // ========================================================================
    // Create Assignment
    // ========================================================================
    createAssignmentStart: (state) => {
      state.loading.creatingAssignment = true;
      state.errors.createError = null;
    },
    createAssignmentSuccess: (state, action: PayloadAction<Assignment>) => {
      state.loading.creatingAssignment = false;
      state.assignments.unshift(action.payload); // Add to beginning
      state.totalCount += 1;
      state.draftAssignment = null; // Clear draft on success
      state.errors.createError = null;
    },
    createAssignmentFailure: (state, action: PayloadAction<string>) => {
      state.loading.creatingAssignment = false;
      state.errors.createError = action.payload;
    },

    // ========================================================================
    // Update Assignment
    // ========================================================================
    updateAssignmentStart: (state) => {
      state.loading.updatingAssignment = true;
      state.errors.updateError = null;
    },
    updateAssignmentSuccess: (state, action: PayloadAction<Assignment>) => {
      state.loading.updatingAssignment = false;
      const index = state.assignments.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.assignments[index] = action.payload;
      }
      if (state.currentAssignment?.id === action.payload.id) {
        state.currentAssignment = action.payload;
      }
      state.errors.updateError = null;
    },
    updateAssignmentFailure: (state, action: PayloadAction<string>) => {
      state.loading.updatingAssignment = false;
      state.errors.updateError = action.payload;
    },

    // ========================================================================
    // Delete Assignment
    // ========================================================================
    deleteAssignmentStart: (state) => {
      state.loading.deletingAssignment = true;
      state.errors.deleteError = null;
    },
    deleteAssignmentSuccess: (state, action: PayloadAction<number>) => {
      state.loading.deletingAssignment = false;
      state.assignments = state.assignments.filter((a) => a.id !== action.payload);
      state.selectedAssignmentIds = state.selectedAssignmentIds.filter(
        (id) => id !== action.payload
      );
      state.totalCount -= 1;
      if (state.currentAssignment?.id === action.payload) {
        state.currentAssignment = null;
      }
      state.errors.deleteError = null;
    },
    deleteAssignmentFailure: (state, action: PayloadAction<string>) => {
      state.loading.deletingAssignment = false;
      state.errors.deleteError = action.payload;
    },

    // ========================================================================
    // Bulk Operations
    // ========================================================================
    bulkOperationStart: (state) => {
      state.loading.bulkOperationInProgress = true;
      state.errors.bulkErrors = [];
    },
    bulkOperationSuccess: (state) => {
      state.loading.bulkOperationInProgress = false;
      state.selectedAssignmentIds = []; // Clear selection after bulk operation
      state.errors.bulkErrors = [];
    },
    bulkOperationFailure: (state, action: PayloadAction<string[]>) => {
      state.loading.bulkOperationInProgress = false;
      state.errors.bulkErrors = action.payload;
    },

    // ========================================================================
    // Selection Management
    // ========================================================================
    selectAssignment: (state, action: PayloadAction<number>) => {
      if (!state.selectedAssignmentIds.includes(action.payload)) {
        state.selectedAssignmentIds.push(action.payload);
      }
    },
    deselectAssignment: (state, action: PayloadAction<number>) => {
      state.selectedAssignmentIds = state.selectedAssignmentIds.filter(
        (id) => id !== action.payload
      );
    },
    selectAllAssignments: (state) => {
      state.selectedAssignmentIds = state.assignments.map((a) => a.id);
    },
    clearSelection: (state) => {
      state.selectedAssignmentIds = [];
    },
    toggleAssignmentSelection: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (state.selectedAssignmentIds.includes(id)) {
        state.selectedAssignmentIds = state.selectedAssignmentIds.filter((i) => i !== id);
      } else {
        state.selectedAssignmentIds.push(id);
      }
    },
    bulkSelectAssignments: (
      state,
      action: PayloadAction<{ assignmentIds: number[]; mode: 'add' | 'remove' | 'replace' }>
    ) => {
      const { assignmentIds, mode } = action.payload;
      if (mode === 'replace') {
        state.selectedAssignmentIds = assignmentIds;
      } else if (mode === 'add') {
        const newIds = assignmentIds.filter((id) => !state.selectedAssignmentIds.includes(id));
        state.selectedAssignmentIds.push(...newIds);
      } else if (mode === 'remove') {
        state.selectedAssignmentIds = state.selectedAssignmentIds.filter(
          (id) => !assignmentIds.includes(id)
        );
      }
    },

    // ========================================================================
    // Filter Management
    // ========================================================================
    updateFilter: (state, action: PayloadAction<Partial<AssignmentFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filtering
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      if (action.payload) {
        state.filters.searchQuery = action.payload;
      } else {
        delete state.filters.searchQuery;
      }
      state.currentPage = 1;
    },

    // ========================================================================
    // Sort Management
    // ========================================================================
    updateSort: (state, action: PayloadAction<AssignmentSort>) => {
      state.sort = action.payload;
    },
    toggleSortDirection: (state) => {
      state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc';
    },
    clearSort: (state) => {
      state.sort = initialState.sort;
    },

    // ========================================================================
    // Pagination
    // ========================================================================
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page
    },

    // ========================================================================
    // Draft Management
    // ========================================================================
    updateDraft: (
      state,
      action: PayloadAction<{ changes: Partial<Assignment>; merge: boolean }>
    ) => {
      const { changes, merge } = action.payload;
      if (merge && state.draftAssignment) {
        state.draftAssignment = { ...state.draftAssignment, ...changes };
      } else {
        state.draftAssignment = changes;
      }
    },
    clearDraft: (state) => {
      state.draftAssignment = null;
    },
    loadDraft: (state, action: PayloadAction<Partial<Assignment>>) => {
      state.draftAssignment = action.payload;
    },

    // ========================================================================
    // Current Assignment
    // ========================================================================
    setCurrentAssignment: (state, action: PayloadAction<Assignment | null>) => {
      state.currentAssignment = action.payload;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },

    // ========================================================================
    // UI State Management
    // ========================================================================
    toggleDrawer: (state) => {
      state.ui.isDrawerOpen = !state.ui.isDrawerOpen;
    },
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isDrawerOpen = action.payload;
    },
    toggleBulkPanel: (state) => {
      state.ui.isBulkPanelVisible = !state.ui.isBulkPanelVisible;
    },
    setBulkPanelVisible: (state, action: PayloadAction<boolean>) => {
      state.ui.isBulkPanelVisible = action.payload;
    },
    toggleFilterPanel: (state) => {
      state.ui.isFilterPanelExpanded = !state.ui.isFilterPanelExpanded;
    },
    setFilterPanelExpanded: (state, action: PayloadAction<boolean>) => {
      state.ui.isFilterPanelExpanded = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'list' | 'grid' | 'calendar'>) => {
      state.ui.viewMode = action.payload;
    },
    toggleShowExpired: (state) => {
      state.ui.showExpired = !state.ui.showExpired;
    },
    setShowExpired: (state, action: PayloadAction<boolean>) => {
      state.ui.showExpired = action.payload;
    },
    toggleOnlyEmergencyBroadcasts: (state) => {
      state.ui.onlyEmergencyBroadcasts = !state.ui.onlyEmergencyBroadcasts;
    },
    setOnlyEmergencyBroadcasts: (state, action: PayloadAction<boolean>) => {
      state.ui.onlyEmergencyBroadcasts = action.payload;
    },

    // ========================================================================
    // Analytics
    // ========================================================================
    fetchAnalyticsStart: (state) => {
      state.loading.fetchingAnalytics = true;
      state.errors.analyticsError = null;
    },
    fetchAnalyticsSuccess: (state, action: PayloadAction<AssignmentAnalytics>) => {
      state.loading.fetchingAnalytics = false;
      state.analytics = action.payload;
      state.errors.analyticsError = null;
    },
    fetchAnalyticsFailure: (state, action: PayloadAction<string>) => {
      state.loading.fetchingAnalytics = false;
      state.errors.analyticsError = action.payload;
    },

    // ========================================================================
    // Validation
    // ========================================================================
    validationStart: (state) => {
      state.loading.validatingAssignment = true;
      state.errors.validationErrors = {};
    },
    validationSuccess: (state) => {
      state.loading.validatingAssignment = false;
      state.errors.validationErrors = {};
    },
    validationFailure: (
      state,
      action: PayloadAction<Record<string, string>>
    ) => {
      state.loading.validatingAssignment = false;
      state.errors.validationErrors = action.payload;
    },
    clearValidationErrors: (state) => {
      state.errors.validationErrors = {};
    },

    // ========================================================================
    // Error Management
    // ========================================================================
    clearErrors: (state) => {
      state.errors = initialState.errors;
    },
    clearError: (
      state,
      action: PayloadAction<
        | 'fetchError'
        | 'createError'
        | 'updateError'
        | 'deleteError'
        | 'analyticsError'
      >
    ) => {
      state.errors[action.payload] = null;
    },

    // ========================================================================
    // Real-time Updates (for SignalR/WebSocket)
    // ========================================================================
    assignmentUpdatedViaSignalR: (state, action: PayloadAction<Assignment>) => {
      const index = state.assignments.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.assignments[index] = action.payload;
      }
      if (state.currentAssignment?.id === action.payload.id) {
        state.currentAssignment = action.payload;
      }
    },
    assignmentDeletedViaSignalR: (state, action: PayloadAction<number>) => {
      state.assignments = state.assignments.filter((a) => a.id !== action.payload);
      if (state.currentAssignment?.id === action.payload) {
        state.currentAssignment = null;
      }
    },

    // ========================================================================
    // Reset State
    // ========================================================================
    resetAssignmentState: () => initialState,
  },
});

// Export actions
export const {
  // Fetch
  fetchAssignmentsStart,
  fetchAssignmentsSuccess,
  fetchAssignmentsFailure,
  fetchAssignmentStart,
  fetchAssignmentSuccess,
  fetchAssignmentFailure,
  // Create
  createAssignmentStart,
  createAssignmentSuccess,
  createAssignmentFailure,
  // Update
  updateAssignmentStart,
  updateAssignmentSuccess,
  updateAssignmentFailure,
  // Delete
  deleteAssignmentStart,
  deleteAssignmentSuccess,
  deleteAssignmentFailure,
  // Bulk
  bulkOperationStart,
  bulkOperationSuccess,
  bulkOperationFailure,
  // Selection
  selectAssignment,
  deselectAssignment,
  selectAllAssignments,
  clearSelection,
  toggleAssignmentSelection,
  bulkSelectAssignments,
  // Filters
  updateFilter,
  clearFilters,
  setSearchQuery,
  // Sort
  updateSort,
  toggleSortDirection,
  clearSort,
  // Pagination
  setPage,
  setPageSize,
  // Draft
  updateDraft,
  clearDraft,
  loadDraft,
  // Current Assignment
  setCurrentAssignment,
  clearCurrentAssignment,
  // UI
  toggleDrawer,
  setDrawerOpen,
  toggleBulkPanel,
  setBulkPanelVisible,
  toggleFilterPanel,
  setFilterPanelExpanded,
  setViewMode,
  toggleShowExpired,
  setShowExpired,
  toggleOnlyEmergencyBroadcasts,
  setOnlyEmergencyBroadcasts,
  // Analytics
  fetchAnalyticsStart,
  fetchAnalyticsSuccess,
  fetchAnalyticsFailure,
  // Validation
  validationStart,
  validationSuccess,
  validationFailure,
  clearValidationErrors,
  // Errors
  clearErrors,
  clearError,
  // Real-time
  assignmentUpdatedViaSignalR,
  assignmentDeletedViaSignalR,
  // Reset
  resetAssignmentState,
} = assignmentSlice.actions;

// Export reducer
export default assignmentSlice.reducer;
