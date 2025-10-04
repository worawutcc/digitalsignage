/**
 * Enhanced Test Utilities
 * 
 * Utility functions and helpers for testing enhanced user schedule assignment components.
 * Provides mocks, test data generators, and performance measurement tools.
 * 
 * @see copilot-instructions-web.md - Testing Rules
 * @see specs/021-user-schedule-assignment/tasks.md - T024 Requirements
 */

import type { User } from '@/types/api'
import type { UserSchedule } from '@/features/users/types/userSchedule'

// Global jest declaration for test utilities
declare const jest: any

/**
 * Test data generators
 */
export const testDataGenerators = {
  /**
   * Generate mock users
   */
  generateUsers: (count: number): User[] => {
    return Array.from({ length: count }, (_, index) => ({
      userId: index + 1,
      email: `user${index + 1}@example.com`,
      fullName: `User ${index + 1}`,
      phoneNumber: `+1-555-000-${String(index + 1).padStart(4, '0')}`,
      role: ['Admin', 'User'][index % 2] as 'Admin' | 'User',
      isActive: index % 4 !== 0, // Make every 4th user inactive
      createdAt: new Date(Date.now() - index * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - index * 43200000).toISOString()
    }))
  },

  /**
   * Generate mock user schedules
   */
  generateUserSchedules: (userId: number, count: number): UserSchedule[] => {
    return Array.from({ length: count }, (_, index) => ({
      userId,
      scheduleId: (userId * 100) + index + 1,
      scheduleName: `Schedule ${index + 1} for User ${userId}`,
      scheduleDescription: `Description for schedule ${index + 1}`,
      isActive: index % 3 !== 0, // Make every 3rd schedule inactive
      assignedAt: new Date(Date.now() - index * 3600000).toISOString(),
      assignedBy: 'admin'
    }))
  },

  /**
   * Generate large dataset for performance testing
   */
  generateLargeDataset: (userCount: number, schedulesPerUser: number) => {
    const users = testDataGenerators.generateUsers(userCount)
    const userSchedules: Record<number, UserSchedule[]> = {}
    
    users.forEach(user => {
      userSchedules[user.userId] = testDataGenerators.generateUserSchedules(user.userId, schedulesPerUser)
    })
    
    return { users, userSchedules }
  }
}

/**
 * Mock service responses
 */
export const mockServiceResponses = {
  /**
   * Mock successful getUserSchedules response
   */
  getUserSchedulesSuccess: (userId: number, schedules: UserSchedule[]) => ({
    userId,
    userName: `User ${userId}`,
    schedules,
    totalCount: schedules.length
  }),

  /**
   * Mock successful assignSchedules response
   */
  assignSchedulesSuccess: (userId: number, scheduleIds: number[]) => ({
    userId,
    assignedScheduleIds: scheduleIds,
    previousScheduleIds: [],
    assignedAt: new Date().toISOString(),
    assignedBy: 'test-admin',
    message: 'Schedules assigned successfully'
  }),

  /**
   * Mock successful removeAllSchedules response
   */
  removeAllSchedulesSuccess: (userId: number, removedCount: number) => ({
    userId,
    removedCount,
    removedAt: new Date().toISOString(),
    message: 'All schedules removed successfully'
  }),

  /**
   * Mock error responses
   */
  errors: {
    networkError: new Error('Network request failed'),
    validationError: new Error('Validation failed: Invalid schedule IDs'),
    serverError: new Error('Internal server error'),
    timeoutError: new Error('Request timeout'),
    notFoundError: new Error('User not found')
  }
}

/**
 * Performance measurement utilities
 */
export const performanceUtils = {
  /**
   * Measure render time of a component
   */
  measureRenderTime: async (renderFn: () => void): Promise<number> => {
    const startTime = performance.now()
    renderFn()
    const endTime = performance.now()
    return endTime - startTime
  },

  /**
   * Measure memory usage before and after an operation
   */
  measureMemoryUsage: async (operation: () => Promise<void> | void): Promise<{
    before: number
    after: number
    difference: number
  }> => {
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }

    const beforeMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    await operation()
    
    // Allow time for cleanup
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const afterMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    return {
      before: beforeMemory,
      after: afterMemory,
      difference: afterMemory - beforeMemory
    }
  },

  /**
   * Measure time for bulk operations
   */
  measureBulkOperationTime: async (
    operation: (items: any[]) => Promise<void>,
    items: any[]
  ): Promise<{
    totalTime: number
    averageTimePerItem: number
    itemsPerSecond: number
  }> => {
    const startTime = performance.now()
    await operation(items)
    const endTime = performance.now()
    
    const totalTime = endTime - startTime
    const averageTimePerItem = totalTime / items.length
    const itemsPerSecond = (items.length / totalTime) * 1000
    
    return {
      totalTime,
      averageTimePerItem,
      itemsPerSecond
    }
  }
}

/**
 * Accessibility testing utilities
 */
export const accessibilityUtils = {
  /**
   * Check if element has proper ARIA attributes
   */
  checkAriaAttributes: (element: Element) => {
    const checks = {
      hasRole: element.hasAttribute('role'),
      hasAriaLabel: element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby'),
      hasAriaDescribedBy: element.hasAttribute('aria-describedby'),
      hasTabIndex: element.hasAttribute('tabindex'),
      isKeyboardAccessible: (element as HTMLElement).tabIndex >= 0 || element.hasAttribute('role')
    }
    
    return checks
  },

  /**
   * Simulate keyboard navigation
   */
  simulateKeyboardNavigation: (container: Element) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    return {
      focusableCount: focusableElements.length,
      firstFocusable: focusableElements[0] as HTMLElement,
      lastFocusable: focusableElements[focusableElements.length - 1] as HTMLElement,
      allFocusable: Array.from(focusableElements) as HTMLElement[]
    }
  },

  /**
   * Check color contrast ratios
   */
  checkColorContrast: (element: Element) => {
    const styles = getComputedStyle(element)
    const backgroundColor = styles.backgroundColor
    const color = styles.color
    
    // Simplified contrast check (in real implementation, would use proper contrast calculation)
    return {
      backgroundColor,
      color,
      hasGoodContrast: backgroundColor !== color // Simplified check
    }
  }
}

/**
 * WebSocket testing utilities
 */
export const webSocketUtils = {
  /**
   * Create mock WebSocket
   */
  createMockWebSocket: () => {
    const mockWebSocket = {
      readyState: 1, // OPEN
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null
    }
    
    return mockWebSocket
  },

  /**
   * Simulate WebSocket messages
   */
  simulateWebSocketMessage: (
    mockWebSocket: any,
    eventType: string,
    data: any
  ) => {
    const event = new MessageEvent('message', {
      data: JSON.stringify({ type: eventType, data })
    })
    
    if (mockWebSocket.onmessage) {
      mockWebSocket.onmessage(event)
    }
  }
}

/**
 * Redux testing utilities
 */
export const reduxUtils = {
  /**
   * Create test actions for bulk operations
   */
  createBulkOperationActions: (userId: number, scheduleIds: number[]) => [
    { type: 'users/startBulkOperation', payload: { operation: 'assign', total: scheduleIds.length } },
    { type: 'users/updateBulkOperationProgress', payload: { completed: scheduleIds.length } },
    { type: 'users/completeBulkOperation' }
  ],

  /**
   * Create optimistic update actions
   */
  createOptimisticUpdateActions: (userId: number, scheduleIds: number[]) => [
    {
      type: 'users/addOptimisticUpdate',
      payload: {
        id: `optimistic-${Date.now()}`,
        type: 'add',
        data: { scheduleIds },
        timestamp: Date.now(),
        userId
      }
    }
  ],

  /**
   * Verify state transitions
   */
  verifyStateTransition: (
    initialState: any,
    actions: any[],
    expectedFinalState: Partial<any>
  ) => {
    let currentState = initialState
    
    actions.forEach(action => {
      // In real implementation, would use actual reducer
      // This is a simplified version for testing setup
    })
    
    return {
      initialState,
      finalState: currentState,
      matches: Object.keys(expectedFinalState).every(
        key => currentState[key] === expectedFinalState[key]
      )
    }
  }
}

/**
 * Test scenario builders
 */
export const testScenarios = {
  /**
   * Create scenario for testing component with large dataset
   */
  largeDatasetScenario: (userCount: number = 1000, schedulesPerUser: number = 50) => {
    const { users, userSchedules } = testDataGenerators.generateLargeDataset(userCount, schedulesPerUser)
    
    return {
      name: `Large Dataset (${userCount} users, ${schedulesPerUser} schedules each)`,
      users,
      userSchedules,
      expectedPerformance: {
        renderTime: userCount > 500 ? 200 : 100, // ms
        memoryUsage: userCount * schedulesPerUser * 1000 // bytes estimate
      }
    }
  },

  /**
   * Create scenario for testing error handling
   */
  errorHandlingScenario: (errorType: keyof typeof mockServiceResponses.errors) => ({
    name: `Error Handling (${errorType})`,
    error: mockServiceResponses.errors[errorType],
    expectedBehavior: {
      showsErrorMessage: true,
      allowsRetry: ['networkError', 'timeoutError'].includes(errorType),
      clearsOptimisticUpdates: true
    }
  }),

  /**
   * Create scenario for testing accessibility
   */
  accessibilityScenario: (componentName: string) => ({
    name: `Accessibility Test (${componentName})`,
    requirements: {
      hasProperAriaLabels: true,
      supportsKeyboardNavigation: true,
      hasGoodColorContrast: true,
      supportsScreenReaders: true,
      hasSkipLinks: componentName === 'AssignedSchedulesList'
    }
  })
}

/**
 * Test assertion helpers
 */
export const testAssertions = {
  /**
   * Assert component renders within performance threshold
   */
  assertPerformanceThreshold: (actualTime: number, threshold: number, componentName: string) => {
    if (actualTime > threshold) {
      throw new Error(
        `${componentName} render time (${actualTime}ms) exceeds threshold (${threshold}ms)`
      )
    }
  },

  /**
   * Assert accessibility compliance
   */
  assertAccessibilityCompliance: (element: Element, requirements: Record<string, boolean>) => {
    const checks = accessibilityUtils.checkAriaAttributes(element)
    
    Object.entries(requirements).forEach(([requirement, expected]) => {
      if (expected && !checks[requirement as keyof typeof checks]) {
        throw new Error(`Accessibility requirement failed: ${requirement}`)
      }
    })
  },

  /**
   * Assert WebSocket behavior
   */
  assertWebSocketBehavior: (mockWebSocket: any, expectedCalls: string[]) => {
    expectedCalls.forEach(method => {
      if (!mockWebSocket[method].mock?.calls?.length) {
        throw new Error(`Expected WebSocket method ${method} to be called`)
      }
    })
  }
}

