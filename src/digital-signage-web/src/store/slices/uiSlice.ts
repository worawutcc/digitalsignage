import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * Theme types
 */
export type Theme = 'light' | 'dark' | 'system'

/**
 * Notification types
 */
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number // in milliseconds, null for persistent
  timestamp: number
}

/**
 * UI state interface
 */
export interface UIState {
  // Sidebar state
  sidebar: {
    isCollapsed: boolean
    isMobileOpen: boolean
  }
  
  // Theme state
  theme: Theme
  
  // Notifications
  notifications: Notification[]
  
  // Modal state
  modals: {
    [key: string]: {
      isOpen: boolean
      data?: any
    }
  }
  
  // Loading states for different operations
  loading: {
    [key: string]: boolean
  }
  
  // Page state
  page: {
    title: string
    breadcrumbs: Array<{ label: string; href?: string }>
  }
}

const initialState: UIState = {
  sidebar: {
    isCollapsed: false,
    isMobileOpen: false,
  },
  theme: 'system',
  notifications: [],
  modals: {},
  loading: {},
  page: {
    title: 'Dashboard',
    breadcrumbs: [{ label: 'Dashboard' }],
  },
}

/**
 * UI slice with Redux Toolkit
 */
export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebar.isCollapsed = !state.sidebar.isCollapsed
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isCollapsed = action.payload
    },
    toggleMobileSidebar: (state) => {
      state.sidebar.isMobileOpen = !state.sidebar.isMobileOpen
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isMobileOpen = action.payload
    },

    // Theme actions
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
    },

    // Notification actions
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notification-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        // You could add a 'read' property to the notification interface if needed
      }
    },

    // Modal actions
    openModal: (state, action: PayloadAction<{ key: string; data?: any }>) => {
      state.modals[action.payload.key] = {
        isOpen: true,
        data: action.payload.data,
      }
    },
    closeModal: (state, action: PayloadAction<string>) => {
      const modal = state.modals[action.payload]
      if (modal) {
        modal.isOpen = false
        modal.data = undefined
      }
    },
    setModalData: (state, action: PayloadAction<{ key: string; data: any }>) => {
      const modal = state.modals[action.payload.key]
      if (modal) {
        modal.data = action.payload.data
      }
    },

    // Loading actions
    setLoading: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.isLoading
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload]
    },

    // Page state actions
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.page.title = action.payload
    },
    setBreadcrumbs: (state, action: PayloadAction<Array<{ label: string; href?: string }>>) => {
      state.page.breadcrumbs = action.payload
    },
    setPage: (state, action: PayloadAction<{ title: string; breadcrumbs: Array<{ label: string; href?: string }> }>) => {
      state.page = action.payload
    },

    // Utility actions
    resetUI: (state) => {
      return { ...initialState, theme: state.theme } // Keep theme preference
    },
  },
})

export const uiActions = uiSlice.actions
export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  openModal,
  closeModal,
  setModalData,
  setLoading,
  clearLoading,
  setPageTitle,
  setBreadcrumbs,
  setPage,
  resetUI,
} = uiSlice.actions

export default uiSlice.reducer