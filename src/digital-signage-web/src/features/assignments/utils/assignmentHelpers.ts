/**
 * @fileoverview Assignment Helper Functions
 * @description Utility functions for assignments
 */

import { AssignmentType, AssignmentStatus, AssignmentTargetType } from '../types/assignment.types';

/**
 * Get assignment type display text
 */
export function getAssignmentTypeText(type: AssignmentType): string {
  switch (type) {
    case AssignmentType.Schedule:
      return 'Schedule';
    case AssignmentType.Playlist:
      return 'Playlist';
    case AssignmentType.Media:
      return 'Media';
    case AssignmentType.Emergency:
      return 'Emergency';
    default:
      return 'Unknown';
  }
}

/**
 * Get assignment status display text
 */
export function getAssignmentStatusText(status: AssignmentStatus): string {
  switch (status) {
    case AssignmentStatus.Draft:
      return 'Draft';
    case AssignmentStatus.Scheduled:
      return 'Scheduled';
    case AssignmentStatus.Active:
      return 'Active';
    case AssignmentStatus.Expired:
      return 'Expired';
    case AssignmentStatus.Paused:
      return 'Paused';
    case AssignmentStatus.Cancelled:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

/**
 * Get assignment target type display text
 */
export function getAssignmentTargetTypeText(targetType: AssignmentTargetType): string {
  switch (targetType) {
    case AssignmentTargetType.Device:
      return 'Device';
    case AssignmentTargetType.DeviceGroup:
      return 'Device Group';
    default:
      return 'Unknown';
  }
}