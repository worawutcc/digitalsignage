/**
 * @fileoverview Assignment Helper Functions
 * @description Utility functions for formatting assignment data in UI
 */

/**
 * Convert AssignmentType enum value to display string
 */
export const getAssignmentTypeDisplay = (assignmentType: string | number): string => {
  // Handle both string and numeric values from API
  const normalizedType = typeof assignmentType === 'string' 
    ? assignmentType 
    : convertNumericAssignmentType(assignmentType);
    
  switch (normalizedType.toLowerCase()) {
    case 'schedule':
    case '0':
      return 'Schedule';
    case 'playlist':
    case '1':
      return 'Playlist';
    case 'media':
    case '2':
      return 'Media';
    case 'emergency':
    case '3':
      return 'Emergency';
    default:
      return 'Unknown';
  }
};

/**
 * Convert numeric AssignmentType to string
 */
export const convertNumericAssignmentType = (assignmentType: number): string => {
  switch (assignmentType) {
    case 0:
      return 'Schedule';
    case 1:
      return 'Playlist';
    case 2:
      return 'Media';
    case 3:
      return 'Emergency';
    default:
      return 'Unknown';
  }
};

/**
 * Convert AssignmentTargetType enum value to display string
 */
export const getAssignmentTargetTypeDisplay = (targetType: string | number): string => {
  const normalizedType = typeof targetType === 'string' 
    ? targetType 
    : convertNumericTargetType(targetType);
    
  switch (normalizedType.toLowerCase()) {
    case 'device':
    case '0':
      return 'Device';
    case 'devicegroup':
    case '1':
      return 'Device Group';
    default:
      return 'Unknown';
  }
};

/**
 * Convert numeric AssignmentTargetType to string
 */
export const convertNumericTargetType = (targetType: number): string => {
  switch (targetType) {
    case 0:
      return 'Device';
    case 1:
      return 'Device Group';
    default:
      return 'Unknown';
  }
};

/**
 * Convert AssignmentStatus enum value to display string
 */
export const getAssignmentStatusDisplay = (status: string | number): string => {
  const normalizedStatus = typeof status === 'string' 
    ? status 
    : convertNumericStatus(status);
    
  switch (normalizedStatus.toLowerCase()) {
    case 'draft':
    case '0':
      return 'Draft';
    case 'scheduled':
    case '1':
      return 'Scheduled';
    case 'active':
    case '2':
      return 'Active';
    case 'expired':
    case '3':
      return 'Expired';
    case 'paused':
    case '4':
      return 'Paused';
    case 'cancelled':
    case '5':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

/**
 * Convert numeric AssignmentStatus to string
 */
export const convertNumericStatus = (status: number): string => {
  switch (status) {
    case 0:
      return 'Draft';
    case 1:
      return 'Scheduled';
    case 2:
      return 'Active';
    case 3:
      return 'Expired';
    case 4:
      return 'Paused';
    case 5:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

/**
 * Get CSS classes for assignment status badge
 */
export const getAssignmentStatusClasses = (status: string | number): string => {
  const normalizedStatus = typeof status === 'string' 
    ? status 
    : convertNumericStatus(status);
    
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
  
  switch (normalizedStatus.toLowerCase()) {
    case 'active':
    case '2':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'scheduled':
    case '1':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'draft':
    case '0':
      return `${baseClasses} bg-gray-100 text-gray-800`;
    case 'paused':
    case '4':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'expired':
    case '3':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'cancelled':
    case '5':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

/**
 * Get CSS classes for assignment type badge
 */
export const getAssignmentTypeClasses = (assignmentType: string | number): string => {
  const normalizedType = typeof assignmentType === 'string' 
    ? assignmentType 
    : convertNumericAssignmentType(assignmentType);
    
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
  
  switch (normalizedType.toLowerCase()) {
    case 'schedule':
    case '0':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'playlist':
    case '1':
      return `${baseClasses} bg-purple-100 text-purple-800`;
    case 'media':
    case '2':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'emergency':
    case '3':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};