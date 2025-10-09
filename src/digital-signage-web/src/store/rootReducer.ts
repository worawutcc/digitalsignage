import { combineReducers } from '@reduxjs/toolkit'
import authSlice from '@/store/slices/authSlice'
import uiSlice from '@/store/slices/uiSlice'
import devicesSlice from '@/store/slices/devicesSlice'
import scheduleAssignmentSlice from '@/store/slices/scheduleAssignmentSlice'
import userSlice from '@/store/slices/userSlice'
import assignmentSlice from '@/features/assignments/store/assignmentSlice'

/**
 * Root reducer combining all feature slices
 */
export const rootReducer = combineReducers({
  auth: authSlice,
  ui: uiSlice,
  devices: devicesSlice,
  scheduleAssignment: scheduleAssignmentSlice,
  users: userSlice,
  assignments: assignmentSlice,
})