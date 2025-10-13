// Dashboard Types
export interface DashboardStats {
  activeDisplays: number;
  contentItems: number;
  scheduled: number;
  uptime: string;
}

// Component Props Types
export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor?: string;
}

// Navigation Types  
export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Display Status Types
export type DisplayStatus = 'online' | 'offline';

export interface DisplayDevice {
  id: string;
  name: string;
  location: string;
  status: DisplayStatus;
  lastSeen?: string;
  resolution?: string;
}

// Assignment Types
export interface AssignmentDto {
  id: number;
  assignmentType: string;
  targetType: string;
  targetId: number;
  targetName?: string;
  contentId: number;
  contentName?: string;
  status: string;
  priority: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  daysOfWeek?: string;
  isEmergencyBroadcast: boolean;
  emergencyExpiresAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId: number;
  createdByUserName?: string;
  lastModifiedByUserName?: string;
}

export interface CreateAssignmentRequest {
  assignmentType: string;
  targetType: string;
  targetId: number;
  contentId: number;
  priority?: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  daysOfWeek?: string;
  isEmergencyBroadcast?: boolean;
  emergencyExpiresAt?: string;
  notes?: string;
}

// Enhanced UI Types
export * from './enhanced-ui'