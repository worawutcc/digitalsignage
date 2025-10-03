/**
 * Enhanced Components Test Configuration
 * 
 * Configuration for comprehensive testing of enhanced user schedule assignment components.
 * Includes performance benchmarks, accessibility validation, and mocked services.
 * 
 * @see copilot-instructions-web.md - Testing Rules
 * @see specs/021-user-schedule-assignment/tasks.md - T024 Requirements
 */

/**
 * Test Configuration for Enhanced Components
 * 
 * This file contains configuration objects for testing enhanced user schedule components.
 * It defines performance benchmarks, accessibility rules, and mock service configurations.
 */

/**
 * Performance Benchmark Configuration
 */
export const performanceBenchmarks = {
  // Component render time thresholds (milliseconds)
  renderTimeThresholds: {
    AssignedSchedulesList: 50,
    ScheduleSelector: 40,
    DefaultScheduleToggle: 20,
    EnhancedConfirmationModal: 30
  },
  
  // Memory usage thresholds (bytes)
  memoryThresholds: {
    componentMount: 1000000,    // 1MB
    largeDatasetsRender: 5000000, // 5MB
    virtualScrolling: 2000000   // 2MB
  },
  
  // Network request timeouts (milliseconds)
  networkTimeouts: {
    userSchedulesFetch: 2000,
    scheduleAssignment: 3000,
    bulkOperations: 10000
  },
  
  // Virtual scrolling performance
  virtualScrollingBenchmarks: {
    itemCount: 1000,
    expectedRenderTime: 100,
    expectedMemoryUsage: 2000000
  }
}

/**
 * Accessibility Test Configuration
 */
export const accessibilityConfig = {
  // WCAG 2.1 AA compliance rules
  axeRules: {
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'aria-labels': { enabled: true },
    'focus-management': { enabled: true },
    'semantic-markup': { enabled: true },
    'alternative-text': { enabled: true }
  },
  
  // Screen reader compatibility
  screenReaderTests: {
    announcements: true,
    landmarks: true,
    headings: true,
    lists: true,
    forms: true
  },
  
  // Keyboard navigation patterns
  keyboardTests: {
    tabNavigation: true,
    arrowKeyNavigation: true,
    escapeKey: true,
    enterSpaceActivation: true,
    skipLinks: true
  }
}

/**
 * Mock Service Configuration
 */
export const mockServiceConfig = {
  // User schedule service mocks
  userScheduleService: {
    getUserSchedules: {
      delay: 100, // Simulate network latency
      successRate: 0.95,
      errorTypes: ['NetworkError', 'ValidationError', 'ServerError']
    },
    assignSchedules: {
      delay: 200,
      successRate: 0.9,
      errorTypes: ['ConflictError', 'ValidationError', 'ServerError']
    },
    removeAllSchedules: {
      delay: 150,
      successRate: 0.95,
      errorTypes: ['NotFoundError', 'ServerError']
    }
  },
  
  // WebSocket connection mocks
  webSocket: {
    connectionDelay: 50,
    messageDelay: 10,
    disconnectionRate: 0.05,
    reconnectionAttempts: 3
  },
  
  // Analytics service mocks
  analytics: {
    trackingDelay: 5,
    batchSize: 10,
    flushInterval: 1000
  }
}

/**
 * Test Data Configuration
 */
export const testDataConfig = {
  // User data variations
  users: {
    small: 10,
    medium: 100,
    large: 1000,
    extraLarge: 10000
  },
  
  // Schedule data variations
  schedules: {
    minimal: 1,
    typical: 5,
    heavy: 50,
    extreme: 500
  },
  
  // Bulk operation sizes
  bulkOperations: {
    small: 5,
    medium: 25,
    large: 100,
    extreme: 1000
  }
}

