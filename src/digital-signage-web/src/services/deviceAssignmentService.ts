import { apiClient } from '@/lib/api';
import type { DeviceAssignmentConfig } from '@/features/playlists/components/DeviceAssignmentModal';

/**
 * Device assignment request for creating new assignments
 */
export interface CreateDeviceAssignmentRequest {
  /** Playlist ID to assign */
  playlistId: number;
  /** Device ID to assign to */
  deviceId: number;
  /** Priority level (1-10, higher = more priority) */
  priority: number;
  /** Start date and time for the assignment (ISO 8601) */
  scheduledStart?: string;
  /** End date and time for the assignment (ISO 8601) */
  scheduledEnd?: string;
  /** Whether the assignment is active */
  isActive: boolean;
}

/**
 * Device assignment response from API
 */
export interface DeviceAssignmentResponse {
  /** Assignment ID */
  id: number;
  /** Playlist ID */
  playlistId: number;
  /** Playlist name */
  playlistName: string;
  /** Device ID */
  deviceId: number;
  /** Device name */
  deviceName: string;
  /** Priority level */
  priority: number;
  /** Start time (ISO 8601) */
  startTime?: string;
  /** End time (ISO 8601) */
  endTime?: string;
  /** Whether active */
  isActive: boolean;
  /** Creation timestamp */
  createdAt: string;
  /** Creator user ID */
  createdById: number;
  /** Creator user name */
  createdByName: string;
}

/**
 * Bulk assignment request
 */
export interface BulkDeviceAssignmentRequest {
  /** Playlist ID to assign */
  playlistId: number;
  /** Device IDs to assign to */
  deviceIds: number[];
  /** Priority level (1-10, higher = more priority) */
  priority: number;
  /** Start date and time for the assignment (ISO 8601) */
  scheduledStart?: string;
  /** End date and time for the assignment (ISO 8601) */
  scheduledEnd?: string;
  /** Whether the assignments are active */
  isActive: boolean;
  /** Whether to override existing assignments */
  overrideExisting: boolean;
}

/**
 * Bulk assignment result
 */
export interface BulkAssignmentResult {
  /** Number of successful assignments */
  successCount: number;
  /** Number of failed assignments */
  failedCount: number;
  /** Detailed results */
  results: {
    deviceId: number;
    deviceName: string;
    success: boolean;
    assignmentId?: number;
    error?: string;
  }[];
  /** Summary message */
  message: string;
}

/**
 * Assignment conflict information
 */
export interface AssignmentConflict {
  /** Device ID with conflict */
  deviceId: number;
  /** Device name */
  deviceName: string;
  /** Existing playlist ID */
  existingPlaylistId: number;
  /** Existing playlist name */
  existingPlaylistName: string;
  /** Existing assignment priority */
  existingPriority: number;
  /** New assignment priority */
  newPriority: number;
  /** Whether the new assignment would override */
  wouldOverride: boolean;
}

/**
 * Device assignment filters
 */
export interface DeviceAssignmentFilters {
  /** Filter by playlist ID */
  playlistId?: number;
  /** Filter by device ID */
  deviceId?: number;
  /** Filter by active status */
  isActive?: boolean;
  /** Filter by priority range */
  minPriority?: number;
  maxPriority?: number;
  /** Filter by date range */
  startDate?: string;
  endDate?: string;
  /** Pagination */
  page?: number;
  pageSize?: number;
}

/**
 * Device Assignment Service
 * 
 * Handles all device assignment related API operations following the apiClient pattern.
 * Provides methods for creating, updating, retrieving, and managing playlist-device assignments.
 */
export class DeviceAssignmentService {
  /**
   * Assign a playlist to multiple devices with advanced configuration
   */
  static async assignPlaylistToDevices(
    playlistId: number, 
    config: DeviceAssignmentConfig
  ): Promise<BulkAssignmentResult> {
    try {
      console.log('📦 Assigning playlist to devices:', { playlistId, config });

      const request: BulkDeviceAssignmentRequest = {
        playlistId,
        deviceIds: config.deviceIds,
        priority: config.schedule.priority,
        isActive: config.schedule.isActive,
        overrideExisting: config.overrideExisting
      };

      // Only add optional fields if they have values
      if (config.schedule.startDateTime) {
        request.scheduledStart = config.schedule.startDateTime;
      }
      if (config.schedule.endDateTime) {
        request.scheduledEnd = config.schedule.endDateTime;
      }

      const response = await apiClient.post('/api/playlist/assign-devices', request);
      
      console.log('✅ Bulk device assignment successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to assign playlist to devices:', error);
      throw error;
    }
  }

  /**
   * Create a single device assignment
   */
  static async createAssignment(request: CreateDeviceAssignmentRequest): Promise<DeviceAssignmentResponse> {
    try {
      console.log('📦 Creating device assignment:', request);

      const response = await apiClient.post('/api/device-assignments', request);
      
      console.log('✅ Device assignment created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create device assignment:', error);
      throw error;
    }
  }

  /**
   * Get all assignments with optional filtering
   */
  static async getAssignments(filters?: DeviceAssignmentFilters): Promise<DeviceAssignmentResponse[]> {
    try {
      console.log('📦 Fetching device assignments with filters:', filters);

      const response = await apiClient.get('/api/device-assignments', { 
        params: filters 
      });
      
      const assignments = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Device assignments fetched:', assignments.length, 'items');
      return assignments;
    } catch (error) {
      console.error('❌ Failed to fetch device assignments:', error);
      return [];
    }
  }

  /**
   * Get assignments for a specific playlist
   */
  static async getAssignmentsByPlaylist(playlistId: number): Promise<DeviceAssignmentResponse[]> {
    try {
      console.log('📦 Fetching assignments for playlist:', playlistId);

      const response = await apiClient.get(`/api/playlists/${playlistId}/assignments`);
      
      const assignments = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Playlist assignments fetched:', assignments.length, 'items');
      return assignments;
    } catch (error) {
      console.error('❌ Failed to fetch playlist assignments:', error);
      return [];
    }
  }

  /**
   * Get assignments for a specific device
   */
  static async getAssignmentsByDevice(deviceId: number): Promise<DeviceAssignmentResponse[]> {
    try {
      console.log('📦 Fetching assignments for device:', deviceId);

      const response = await apiClient.get(`/api/devices/${deviceId}/assignments`);
      
      const assignments = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Device assignments fetched:', assignments.length, 'items');
      return assignments;
    } catch (error) {
      console.error('❌ Failed to fetch device assignments:', error);
      return [];
    }
  }

  /**
   * Update an existing assignment
   */
  static async updateAssignment(
    assignmentId: number, 
    updates: Partial<CreateDeviceAssignmentRequest>
  ): Promise<DeviceAssignmentResponse> {
    try {
      console.log('📦 Updating device assignment:', { assignmentId, updates });

      const response = await apiClient.put(`/api/device-assignments/${assignmentId}`, updates);
      
      console.log('✅ Device assignment updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update device assignment:', error);
      throw error;
    }
  }

  /**
   * Delete a device assignment
   */
  static async deleteAssignment(assignmentId: number): Promise<void> {
    try {
      console.log('📦 Deleting device assignment:', assignmentId);

      await apiClient.delete(`/api/device-assignments/${assignmentId}`);
      
      console.log('✅ Device assignment deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete device assignment:', error);
      throw error;
    }
  }

  /**
   * Delete all assignments for a playlist
   */
  static async deleteAssignmentsByPlaylist(playlistId: number): Promise<void> {
    try {
      console.log('📦 Deleting all assignments for playlist:', playlistId);

      await apiClient.delete(`/api/playlists/${playlistId}/assignments`);
      
      console.log('✅ All playlist assignments deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete playlist assignments:', error);
      throw error;
    }
  }

  /**
   * Delete all assignments for a device
   */
  static async deleteAssignmentsByDevice(deviceId: number): Promise<void> {
    try {
      console.log('📦 Deleting all assignments for device:', deviceId);

      await apiClient.delete(`/api/devices/${deviceId}/assignments`);
      
      console.log('✅ All device assignments deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete device assignments:', error);
      throw error;
    }
  }

  /**
   * Check for assignment conflicts before creating assignments
   */
  static async checkAssignmentConflicts(
    playlistId: number,
    deviceIds: number[],
    priority: number,
    startTime?: string,
    endTime?: string
  ): Promise<AssignmentConflict[]> {
    try {
      console.log('📦 Checking assignment conflicts:', { playlistId, deviceIds, priority });

      const response = await apiClient.post('/api/device-assignments/check-conflicts', {
        playlistId,
        deviceIds,
        priority,
        startTime,
        endTime
      });
      
      const conflicts = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Assignment conflicts checked:', conflicts.length, 'conflicts found');
      return conflicts;
    } catch (error) {
      console.error('❌ Failed to check assignment conflicts:', error);
      return [];
    }
  }

  /**
   * Activate/deactivate an assignment
   */
  static async toggleAssignmentStatus(assignmentId: number, isActive: boolean): Promise<DeviceAssignmentResponse> {
    try {
      console.log('📦 Toggling assignment status:', { assignmentId, isActive });

      const response = await apiClient.patch(`/api/device-assignments/${assignmentId}/status`, {
        isActive
      });
      
      console.log('✅ Assignment status toggled:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to toggle assignment status:', error);
      throw error;
    }
  }

  /**
   * Bulk update assignment priorities
   */
  static async updateAssignmentPriorities(
    updates: { assignmentId: number; priority: number }[]
  ): Promise<DeviceAssignmentResponse[]> {
    try {
      console.log('📦 Updating assignment priorities:', updates);

      const response = await apiClient.patch('/api/device-assignments/bulk-priority', {
        updates
      });
      
      const assignments = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Assignment priorities updated:', assignments.length, 'items');
      return assignments;
    } catch (error) {
      console.error('❌ Failed to update assignment priorities:', error);
      throw error;
    }
  }

  /**
   * Get assignment summary for a playlist (counts, status, etc.)
   */
  static async getPlaylistAssignmentSummary(playlistId: number): Promise<{
    totalAssignments: number;
    activeAssignments: number;
    deviceCount: number;
    averagePriority: number;
    lastAssigned?: string;
  }> {
    try {
      console.log('📦 Fetching assignment summary for playlist:', playlistId);

      const response = await apiClient.get(`/api/playlists/${playlistId}/assignment-summary`);
      
      console.log('✅ Assignment summary fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch assignment summary:', error);
      return {
        totalAssignments: 0,
        activeAssignments: 0,
        deviceCount: 0,
        averagePriority: 0
      };
    }
  }
}

// Export default instance for convenience
export const deviceAssignmentService = DeviceAssignmentService;
export default DeviceAssignmentService;