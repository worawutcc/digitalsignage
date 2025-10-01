import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface MenuState {
  activeSection: string
  expandedSections: string[]
  collapsedSidebar: boolean
  pinnedItems: string[]
  isLoading: boolean
  error: string | null
}

const initialState: MenuState = {
  activeSection: '',
  expandedSections: [],
  collapsedSidebar: false,
  pinnedItems: [],
  isLoading: false,
  error: null,
}

const adminMenuSlice = createSlice({
  name: 'adminMenu',
  initialState,
  reducers: {
    setActiveSection: (state, action: PayloadAction<string>) => {
      state.activeSection = action.payload
    },
    toggleSection: (state, action: PayloadAction<string>) => {
      const sectionId = action.payload
      if (state.expandedSections.includes(sectionId)) {
        state.expandedSections = state.expandedSections.filter(id => id !== sectionId)
      } else {
        state.expandedSections.push(sectionId)
      }
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.collapsedSidebar = action.payload
    },
    togglePinnedItem: (state, action: PayloadAction<string>) => {
      const itemId = action.payload
      if (state.pinnedItems.includes(itemId)) {
        state.pinnedItems = state.pinnedItems.filter(id => id !== itemId)
      } else {
        state.pinnedItems.push(itemId)
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetMenuState: () => initialState,
  },
})

export const {
  setActiveSection,
  toggleSection,
  setSidebarCollapsed,
  togglePinnedItem,
  setLoading,
  setError,
  resetMenuState,
} = adminMenuSlice.actions

export default adminMenuSlice.reducer