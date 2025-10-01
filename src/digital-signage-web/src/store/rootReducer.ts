import { combineReducers } from '@reduxjs/toolkit'
import authSlice from '@/store/slices/authSlice'
import uiSlice from '@/store/slices/uiSlice'
import devicesSlice from '@/store/slices/devicesSlice'

/**
 * Root reducer combining all feature slices
 */
export const rootReducer = combineReducers({
  auth: authSlice,
  ui: uiSlice,
  devices: devicesSlice,
})