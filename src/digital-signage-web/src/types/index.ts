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

// Enhanced UI Types
export * from './enhanced-ui'