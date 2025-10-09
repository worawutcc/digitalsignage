/**
 * @fileoverview Assignment Components Barrel Export
 * @description Centralized exports for assignment components
 * 
 * NOTE: Using named exports to avoid name collisions with enums from types
 */

// Base Components (Task 32) - Named exports to avoid AssignmentStatus enum collision

// AssignmentStatus component exports
export {
  AssignmentStatus,
  AssignmentStatusDot,
  getAssignmentStatusVariant,
  type AssignmentStatusProps,
} from './AssignmentStatus.js';

// AssignmentPriority component exports
export {
  AssignmentPriority,
  AssignmentPriorityBar,
  getAssignmentPriorityVariant,
  getPriorityLevel,
  type AssignmentPriorityProps,
  type PriorityConfig,
} from './AssignmentPriority.js';

// AssignmentCard component exports
export {
  AssignmentCard,
  AssignmentCardSkeleton,
  type AssignmentCardProps,
} from './AssignmentCard.js';

// DeviceSelector component exports
export {
  DeviceSelector,
  DeviceSelectorSkeleton,
  type DeviceSelectorProps,
} from './DeviceSelector.js';
