/**
 * Schedule Assignment Slice
 * 
 * Redux Toolkit slice for managing schedule assignment UI state.
 * Handles modal visibility, selection state, and search/filter state.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

/**
 * Schedule Assignment UI State
 */
export interface ScheduleAssignmentState {
  // Modal visibility states
  isAssignModalOpen: boolean
  isRemoveModalOpen: boolean
  isUserListModalOpen: boolean
  
  // Current context
  currentUserId: number | null
  currentScheduleId: number | null
  
  // Selection state for schedule assignment
  selectedScheduleIds: number[]
  
  // Warning state for REPLACE semantics
  showReplaceWarning: boolean
  existingAssignmentsCount: number
  
  // Search and filter state
  searchQuery: string
  filterActiveOnly: boolean
  
  // Confirmation state
  replaceConfirmed: boolean
}

/**
 * Initial state
 */
const initialState: ScheduleAssignmentState = {
  isAssignModalOpen: false,
  isRemoveModalOpen: false,
  isUserListModalOpen: false,
  
  currentUserId: null,
  currentScheduleId: null,
  
  selectedScheduleIds: [],
  
  showReplaceWarning: false,
  existingAssignmentsCount: 0,
  
  searchQuery: '',
  filterActiveOnly: true,
  
  replaceConfirmed: false,
}

/**
 * Schedule Assignment slice
 */
export const scheduleAssignmentSlice = createSlice({
  name: 'scheduleAssignment',
  initialState,
  reducers: {
    // Modal actions
    openAssignModal: (state, action: PayloadAction<{ userId: number; existingCount: number }>) => {
      state.isAssignModalOpen = true
      state.currentUserId = action.payload.userId
      state.existingAssignmentsCount = action.payload.existingCount
      state.showReplaceWarning = action.payload.existingCount > 0
      state.replaceConfirmed = false
      state.selectedScheduleIds = []
      state.searchQuery = ''
    },
    
    closeAssignModal: (state) => {
      state.isAssignModalOpen = false
      state.currentUserId = null
      state.selectedScheduleIds = []
      state.showReplaceWarning = false
      state.existingAssignmentsCount = 0
      state.replaceConfirmed = false
      state.searchQuery = ''
    },
    
    openRemoveModal: (state, action: PayloadAction<number>) => {
      state.isRemoveModalOpen = true
      state.currentUserId = action.payload
    },
    
    closeRemoveModal: (state) => {
      state.isRemoveModalOpen = false
      state.currentUserId = null
    },
    
    openUserListModal: (state, action: PayloadAction<number>) => {
      state.isUserListModalOpen = true
      state.currentScheduleId = action.payload
    },
    
    closeUserListModal: (state) => {
      state.isUserListModalOpen = false
      state.currentScheduleId = null
    },
    
    // Selection actions
    toggleScheduleSelection: (state, action: PayloadAction<number>) => {
      const scheduleId = action.payload
      const index = state.selectedScheduleIds.indexOf(scheduleId)
      
      if (index === -1) {
        // Add to selection
        state.selectedScheduleIds.push(scheduleId)
      } else {
        // Remove from selection
        state.selectedScheduleIds.splice(index, 1)
      }
      
      // Update replace warning based on selections
      state.showReplaceWarning = 
        state.existingAssignmentsCount > 0 && state.selectedScheduleIds.length > 0
    },
    
    setSelectedScheduleIds: (state, action: PayloadAction<number[]>) => {
      state.selectedScheduleIds = action.payload
      
      // Update replace warning
      state.showReplaceWarning = 
        state.existingAssignmentsCount > 0 && action.payload.length > 0
    },
    
    clearSelection: (state) => {
      state.selectedScheduleIds = []
      state.showReplaceWarning = false
      state.replaceConfirmed = false
    },
    
    // Search and filter actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    
    setFilterActiveOnly: (state, action: PayloadAction<boolean>) => {
      state.filterActiveOnly = action.payload
    },
    
    clearSearchAndFilters: (state) => {
      state.searchQuery = ''
      state.filterActiveOnly = true
    },
    
    // Confirmation actions
    setReplaceConfirmed: (state, action: PayloadAction<boolean>) => {
      state.replaceConfirmed = action.payload
    },
    
    // Reset all state
    resetAssignmentState: () => initialState,
  },
})

/**
 * Export actions
 */
export const {
  openAssignModal,
  closeAssignModal,
  openRemoveModal,
  closeRemoveModal,
  openUserListModal,
  closeUserListModal,
  toggleScheduleSelection,
  setSelectedScheduleIds,
  clearSelection,
  setSearchQuery,
  setFilterActiveOnly,
  clearSearchAndFilters,
  setReplaceConfirmed,
  resetAssignmentState,
} = scheduleAssignmentSlice.actions

/**
 * Selectors
 */

// Modal selectors
export const selectIsAssignModalOpen = (state: RootState) => 
  state.scheduleAssignment.isAssignModalOpen

export const selectIsRemoveModalOpen = (state: RootState) => 
  state.scheduleAssignment.isRemoveModalOpen

export const selectIsUserListModalOpen = (state: RootState) => 
  state.scheduleAssignment.isUserListModalOpen

// Context selectors
export const selectCurrentUserId = (state: RootState) => 
  state.scheduleAssignment.currentUserId

export const selectCurrentScheduleId = (state: RootState) => 
  state.scheduleAssignment.currentScheduleId

// Selection selectors
export const selectSelectedScheduleIds = (state: RootState) => 
  state.scheduleAssignment.selectedScheduleIds

export const selectSelectedScheduleCount = (state: RootState) => 
  state.scheduleAssignment.selectedScheduleIds.length

export const selectHasSelection = (state: RootState) => 
  state.scheduleAssignment.selectedScheduleIds.length > 0

export const selectIsScheduleSelected = (scheduleId: number) => (state: RootState) =>
  state.scheduleAssignment.selectedScheduleIds.includes(scheduleId)

// Warning selectors
export const selectShowReplaceWarning = (state: RootState) => 
  state.scheduleAssignment.showReplaceWarning

export const selectExistingAssignmentsCount = (state: RootState) => 
  state.scheduleAssignment.existingAssignmentsCount

export const selectReplaceConfirmed = (state: RootState) => 
  state.scheduleAssignment.replaceConfirmed

// Search and filter selectors
export const selectSearchQuery = (state: RootState) => 
  state.scheduleAssignment.searchQuery

export const selectFilterActiveOnly = (state: RootState) => 
  state.scheduleAssignment.filterActiveOnly

// Composite selectors
export const selectCanAssign = (state: RootState) => {
  const hasSelection = state.scheduleAssignment.selectedScheduleIds.length > 0
  const needsConfirmation = state.scheduleAssignment.showReplaceWarning
  const isConfirmed = state.scheduleAssignment.replaceConfirmed
  
  // Can assign if: has selection AND (no warning OR warning is confirmed)
  return hasSelection && (!needsConfirmation || isConfirmed)
}

export const selectAssignmentContext = (state: RootState) => ({
  userId: state.scheduleAssignment.currentUserId,
  selectedCount: state.scheduleAssignment.selectedScheduleIds.length,
  existingCount: state.scheduleAssignment.existingAssignmentsCount,
  showWarning: state.scheduleAssignment.showReplaceWarning,
  canAssign: selectCanAssign(state),
})

/**
 * Export reducer
 */
export default scheduleAssignmentSlice.reducer
