// Types for playlist analytics
export interface PlaylistAnalyticsData {
  id: number;
  name: string;
  totalViews: number;
  uniqueDevices: number;
  averagePlayTime: number;
  lastAccessed: Date;
  devices: DeviceMetrics[];
  mediaItems: MediaItemAnalytics[];
}

export interface PlaylistViewMetrics {
  totalViews: number;
  uniqueViews: number;
  averageViewDuration: number;
  viewsByHour: Array<{ hour: number; count: number }>;
  viewsByDay: Array<{ day: string; count: number }>;
}

export interface DeviceMetrics {
  deviceId: number;
  deviceName: string;
  location: string;
  viewCount: number;
  lastViewed: Date;
  averagePlayTime: number;
  status: 'online' | 'offline' | 'error';
}

export interface MediaItemAnalytics {
  mediaId: number;
  mediaName: string;
  mediaType: 'image' | 'video' | 'html';
  position: number;
  viewCount: number;
  skipCount: number;
  averageViewTime: number;
  engagementRate: number;
}

export interface AnalyticsTimeRange {
  start: Date;
  end: Date;
  label: string;
}

export interface AnalyticsFilter {
  devices?: number[];
  mediaTypes?: string[];
  timeRange?: AnalyticsTimeRange;
}