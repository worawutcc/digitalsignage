// Redux error slice for centralized error state management
// Following Redux Toolkit patterns and copilot-instructions-ui.instructions.md

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorState, ToastNotification, ApiError } from '@/types/errors';

const initialState: ErrorState = {
  toasts: [],
  globalError: null,
  isOnline: typeof window !== 'undefined' ? navigator?.onLine ?? true : true,
  retryQueue: [],
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    // Toast management
    addToast: (state, action: PayloadAction<Omit<ToastNotification, 'id' | 'timestamp'>>) => {
      const toast: ToastNotification = {
        ...action.payload,
        id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };
      
      // Check for duplicate toasts to prevent spam
      const isDuplicate = state.toasts.some(
        (existingToast) => 
          existingToast.message === toast.message && 
          existingToast.type === toast.type &&
          (Date.now() - new Date(existingToast.timestamp).getTime()) < 5000 // 5 second window
      );
      
      if (!isDuplicate) {
        state.toasts.push(toast);
        
        // Limit max toasts to prevent UI overflow
        if (state.toasts.length > 5) {
          state.toasts = state.toasts.slice(-5);
        }
      }
    },

    dismissToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },

    dismissAllToasts: (state) => {
      state.toasts = [];
    },

    // Global error management
    setGlobalError: (state, action: PayloadAction<ApiError>) => {
      state.globalError = action.payload;
    },

    clearGlobalError: (state) => {
      state.globalError = null;
    },

    // Network status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      
      // Clear retry queue if going offline
      if (!action.payload) {
        state.retryQueue = [];
      }
    },

    // Retry queue management
    addToRetryQueue: (state, action: PayloadAction<string>) => {
      if (!state.retryQueue.includes(action.payload)) {
        state.retryQueue.push(action.payload);
      }
    },

    removeFromRetryQueue: (state, action: PayloadAction<string>) => {
      state.retryQueue = state.retryQueue.filter(id => id !== action.payload);
    },

    clearRetryQueue: (state) => {
      state.retryQueue = [];
    },

    // Convenience actions for common error scenarios
    showApiError: (state, action: PayloadAction<{ error: ApiError; showToast?: boolean }>) => {
      const { error, showToast = true } = action.payload;
      
      state.globalError = error;
      
      if (showToast) {
        const toast: ToastNotification = {
          id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'error',
          message: error.detail || error.title || 'An error occurred',
          title: error.status >= 500 ? 'Server Error' : 'Request Failed',
          timestamp: new Date().toISOString(),
          persistent: error.status >= 500, // Server errors stay until dismissed
          ...(error.status < 500 && { duration: 5000 }),
        };
        
        // Check for duplicates
        const isDuplicate = state.toasts.some(
          (existingToast) => existingToast.message === toast.message && 
          (Date.now() - new Date(existingToast.timestamp).getTime()) < 5000
        );
        
        if (!isDuplicate) {
          state.toasts.push(toast);
          if (state.toasts.length > 5) {
            state.toasts = state.toasts.slice(-5);
          }
        }
      }
    },

    showSuccessToast: (state, action: PayloadAction<{ message: string; title?: string }>) => {
      const { message, title } = action.payload;
      const toast: ToastNotification = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'success',
        message,
        timestamp: new Date().toISOString(),
        duration: 3000, // Success messages dismiss quickly
        ...(title && { title }),
      };
      
      state.toasts.push(toast);
      if (state.toasts.length > 5) {
        state.toasts = state.toasts.slice(-5);
      }
    },

    showWarningToast: (state, action: PayloadAction<{ message: string; title?: string }>) => {
      const { message, title } = action.payload;
      const toast: ToastNotification = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'warning',
        message,
        timestamp: new Date().toISOString(),
        duration: 4000, // Warnings stay a bit longer
        ...(title && { title }),
      };
      
      state.toasts.push(toast);
      if (state.toasts.length > 5) {
        state.toasts = state.toasts.slice(-5);
      }
    },
  },
});

export const {
  addToast,
  dismissToast,
  dismissAllToasts,
  setGlobalError,
  clearGlobalError,
  setOnlineStatus,
  addToRetryQueue,
  removeFromRetryQueue,
  clearRetryQueue,
  showApiError,
  showSuccessToast,
  showWarningToast,
} = errorSlice.actions;

export default errorSlice.reducer;

// Selectors
export const selectToasts = (state: { error: ErrorState }) => state.error.toasts;
export const selectGlobalError = (state: { error: ErrorState }) => state.error.globalError;
export const selectIsOnline = (state: { error: ErrorState }) => state.error.isOnline;
export const selectRetryQueue = (state: { error: ErrorState }) => state.error.retryQueue;
export const selectHasErrors = (state: { error: ErrorState }) => 
  state.error.globalError !== null || state.error.toasts.some(toast => toast.type === 'error');
export const selectErrorCount = (state: { error: ErrorState }) =>
  (state.error.globalError ? 1 : 0) + state.error.toasts.filter(toast => toast.type === 'error').length;