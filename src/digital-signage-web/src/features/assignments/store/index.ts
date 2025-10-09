/**
 * @fileoverview Assignment Redux Store
 * @description Redux Toolkit slice, selectors, and persistence for assignment state management
 */

// Redux slice exports
export * from './assignmentSlice.js';

// Selectors
export * from './selectors.js';

// Persistence utilities - exported as namespace to avoid name collisions
import * as assignmentPersistence from './persistence.js';
export { assignmentPersistence };

// Re-export key types from persistence
export type { PersistedAssignmentState, PersistenceConfig } from './persistence';
