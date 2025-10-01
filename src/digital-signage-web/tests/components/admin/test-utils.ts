/**
 * Admin Menu Component Test Setup
 * 
 * This file provides test utilities and configurations specific to admin menu components.
 * To use this file, install the required testing dependencies:
 * npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
 */

import { configureStore } from '@reduxjs/toolkit'
import adminMenuReducer from '../../../src/store/admin/menuSlice'

// Create a test store with admin menu reducer
export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      adminMenu: adminMenuReducer,
    },
    preloadedState,
  })
}

// Mock data for testing
export const mockAdminMenuItem = {
  id: 'dashboard',
  title: 'Dashboard',
  icon: 'home',
  path: '/admin/dashboard',
  order: 1,
  isEnabled: true,
}

export const mockMenuNotification = {
  id: 'notification-1',
  menuItemId: 'dashboard',
  type: 'count' as const,
  data: { count: 5 },
  priority: 'medium' as const,
  createdAt: new Date(),
}

export const mockMenuConfiguration = {
  version: '1.0.0',
  lastUpdated: new Date(),
  menuItems: [mockAdminMenuItem],
  permissions: [],
  defaultState: {},
  featureFlags: {},
}

// Testing configuration placeholder
export const testingConfig = {
  setupFiles: ['<rootDir>/tests/setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}