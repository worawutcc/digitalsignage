/**
 * @fileoverview Assignment Feature Exports
 * @description Central export point for all assignment-related functionality
 * 
 * NOTE: Components are exported with explicit names to avoid collisions
 * with enums (e.g., AssignmentStatus enum vs AssignmentStatus component)
 */

// Types
export * from './types/index.js';

// API clients
export * from './api/index.js';

// Redux store
export * from './store/index.js';

// Components - Use explicit imports to avoid enum collisions
export {
  // Status components
  AssignmentStatus as AssignmentStatusBadge, // Renamed to avoid enum collision
  AssignmentStatusDot,
  getAssignmentStatusVariant,
  type AssignmentStatusProps,
  
  // Priority components
  AssignmentPriority,
  AssignmentPriorityBar,
  getAssignmentPriorityVariant,
  getPriorityLevel,
  type AssignmentPriorityProps,
  type PriorityConfig,
  
  // Card components
  AssignmentCard,
  AssignmentCardSkeleton,
  type AssignmentCardProps,
  
  // Selector components
  DeviceSelector,
  DeviceSelectorSkeleton,
  type DeviceSelectorProps,
} from './components/index.js';

// Hooks - Will be added here as custom hooks are created
// React Query hooks are available from './api/assignmentHooks'
