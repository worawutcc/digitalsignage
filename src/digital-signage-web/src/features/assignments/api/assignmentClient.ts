/**
 * @fileoverview Assignment API Client
 * @description Typed Axios client for assignment-related API operations
 */

import { apiClient } from '@/lib/api';
import {
  AssignmentStatus,
  AssignmentTargetType,
  AssignmentType,
  type Assignment,
} from '../types/assignment.types';
import type {
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  BulkCreateAssignmentRequest,
  GetAssignmentsRequest,
  AssignmentListResponse,
  CreateAssignmentResponse,
  BulkAssignmentResponse,
  DeleteAssignmentResponse,
  AssignmentHistoryResponse,
  AssignmentAnalytics,
  AssignmentValidationResult,
  DeviceAssignmentSummary,
  UpdateAssignmentStatusRequest,
  UpdateAssignmentPriorityRequest,
  ExportAssignmentsOptions,
  ImportAssignmentsOptions,
  ImportAssignmentsResult,
} from '../types/api.types';

/**
 * Assignment API Service
 * Provides comprehensive assignment management functionality
 */
export class AssignmentApiClient {
  private readonly basePath = '/api/admin/assignments';

  // ========================================================================
  // CRUD Operations
  // ========================================================================

  /**
   * Get assignments with optional filtering, sorting, and pagination
   */
  async getAssignments(
    params?: GetAssignmentsRequest
  ): Promise<AssignmentListResponse> {
    const response = await apiClient.get<AssignmentListResponse>(
      this.basePath,
      { params }
    );
    return response.data;
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(id: number): Promise<Assignment> {
    const response = await apiClient.get<Assignment>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Create new assignment
   */
  async createAssignment(
    request: CreateAssignmentRequest
  ): Promise<CreateAssignmentResponse> {
    const response = await apiClient.post<CreateAssignmentResponse>(
      this.basePath,
      request
    );
    return response.data;
  }

  /**
   * Update existing assignment
   */
  async updateAssignment(
    id: number,
    request: UpdateAssignmentRequest
  ): Promise<Assignment> {
    const response = await apiClient.put<Assignment>(
      `${this.basePath}/${id}`,
      request
    );
    return response.data;
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(id: number): Promise<DeleteAssignmentResponse> {
    const response = await apiClient.delete<DeleteAssignmentResponse>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }

  // ========================================================================
  // Status & Priority Operations
  // ========================================================================

  /**
   * Update assignment status
   */
  async updateStatus(
    id: number,
    request: UpdateAssignmentStatusRequest
  ): Promise<Assignment> {
    const response = await apiClient.patch<Assignment>(
      `${this.basePath}/${id}/status`,
      request
    );
    return response.data;
  }

  /**
   * Update assignment priority
   */
  async updatePriority(
    id: number,
    request: UpdateAssignmentPriorityRequest
  ): Promise<Assignment> {
    const response = await apiClient.patch<Assignment>(
      `${this.basePath}/${id}/priority`,
      request
    );
    return response.data;
  }

  /**
   * Activate assignment (set status to Active)
   */
  async activateAssignment(id: number): Promise<Assignment> {
    return this.updateStatus(id, { status: AssignmentStatus.Active });
  }

  /**
   * Pause assignment (set status to Paused)
   */
  async pauseAssignment(id: number, reason?: string): Promise<Assignment> {
    const request: UpdateAssignmentStatusRequest = { status: AssignmentStatus.Paused };
    if (reason) request.reason = reason;
    return this.updateStatus(id, request);
  }

  /**
   * Cancel assignment (set status to Cancelled)
   */
  async cancelAssignment(id: number, reason?: string): Promise<Assignment> {
    const request: UpdateAssignmentStatusRequest = { status: AssignmentStatus.Cancelled };
    if (reason) request.reason = reason;
    return this.updateStatus(id, request);
  }

  // ========================================================================
  // Bulk Operations
  // ========================================================================

  /**
   * Create multiple assignments in bulk
   */
  async createBulkAssignments(
    request: BulkCreateAssignmentRequest
  ): Promise<BulkAssignmentResponse> {
    const response = await apiClient.post<BulkAssignmentResponse>(
      `${this.basePath}/bulk`,
      request
    );
    return response.data;
  }

  /**
   * Bulk activate assignments
   */
  async bulkActivate(assignmentIds: number[]): Promise<BulkAssignmentResponse> {
    const response = await apiClient.post<BulkAssignmentResponse>(
      `${this.basePath}/bulk/activate`,
      { assignmentIds }
    );
    return response.data;
  }

  /**
   * Bulk pause assignments
   */
  async bulkPause(
    assignmentIds: number[],
    reason?: string
  ): Promise<BulkAssignmentResponse> {
    const response = await apiClient.post<BulkAssignmentResponse>(
      `${this.basePath}/bulk/pause`,
      { assignmentIds, reason }
    );
    return response.data;
  }

  /**
   * Bulk delete assignments
   */
  async bulkDelete(
    assignmentIds: number[],
    reason?: string
  ): Promise<BulkAssignmentResponse> {
    const response = await apiClient.post<BulkAssignmentResponse>(
      `${this.basePath}/bulk/delete`,
      { assignmentIds, reason }
    );
    return response.data;
  }

  /**
   * Bulk update priority
   */
  async bulkUpdatePriority(
    assignmentIds: number[],
    priority: number,
    resolveConflicts = false
  ): Promise<BulkAssignmentResponse> {
    const response = await apiClient.post<BulkAssignmentResponse>(
      `${this.basePath}/bulk/priority`,
      { assignmentIds, priority, resolveConflicts }
    );
    return response.data;
  }

  // ========================================================================
  // Query & Filter Operations
  // ========================================================================

  /**
   * Get active assignments for a specific device
   */
  async getActiveAssignmentsForDevice(
    deviceId: number
  ): Promise<Assignment[]> {
    const response = await apiClient.get<Assignment[]>(
      `${this.basePath}/active`,
      {
        params: {
          targetType: AssignmentTargetType.Device,
          targetId: deviceId,
        },
      }
    );
    return response.data;
  }

  /**
   * Get active assignments for a device group
   */
  async getActiveAssignmentsForGroup(groupId: number): Promise<Assignment[]> {
    const response = await apiClient.get<Assignment[]>(
      `${this.basePath}/active`,
      {
        params: {
          targetType: AssignmentTargetType.DeviceGroup,
          targetId: groupId,
        },
      }
    );
    return response.data;
  }

  /**
   * Get assignments by type
   */
  async getAssignmentsByType(
    assignmentType: string, // Use string instead of enum
    params?: Omit<GetAssignmentsRequest, 'assignmentType'>
  ): Promise<AssignmentListResponse> {
    return this.getAssignments({ ...params, assignmentType });
  }

  /**
   * Get assignments by status
   */
  async getAssignmentsByStatus(
    status: string, // Use string instead of enum
    params?: Omit<GetAssignmentsRequest, 'status'>
  ): Promise<AssignmentListResponse> {
    return this.getAssignments({ ...params, status });
  }

  /**
   * Get emergency broadcasts
   */
  async getEmergencyBroadcasts(): Promise<Assignment[]> {
    const response = await apiClient.get<Assignment[]>(
      `${this.basePath}/emergency`
    );
    return response.data;
  }

  /**
   * Search assignments by query
   */
  async searchAssignments(
    query: string,
    params?: GetAssignmentsRequest
  ): Promise<AssignmentListResponse> {
    const response = await apiClient.get<AssignmentListResponse>(
      `${this.basePath}/search`,
      {
        params: { ...params, q: query },
      }
    );
    return response.data;
  }

  // ========================================================================
  // History & Audit
  // ========================================================================

  /**
   * Get assignment history/audit trail
   */
  async getAssignmentHistory(
    id: number,
    page = 1,
    pageSize = 20
  ): Promise<AssignmentHistoryResponse> {
    const response = await apiClient.get<AssignmentHistoryResponse>(
      `${this.basePath}/${id}/history`,
      {
        params: { page, pageSize },
      }
    );
    return response.data;
  }

  // ========================================================================
  // Analytics & Reporting
  // ========================================================================

  /**
   * Get assignment analytics/dashboard metrics
   */
  async getAnalytics(
    dateFrom?: string,
    dateTo?: string
  ): Promise<AssignmentAnalytics> {
    const response = await apiClient.get<AssignmentAnalytics>(
      `${this.basePath}/analytics`,
      {
        params: { dateFrom, dateTo },
      }
    );
    return response.data;
  }

  /**
   * Get device assignment summary
   */
  async getDeviceAssignmentSummary(
    deviceId: number
  ): Promise<DeviceAssignmentSummary> {
    const response = await apiClient.get<DeviceAssignmentSummary>(
      `${this.basePath}/device/${deviceId}/summary`
    );
    return response.data;
  }

  /**
   * Get assignment performance metrics
   */
  async getPerformanceMetrics(
    id: number
  ): Promise<{ displays: number; avgDuration: number; successRate: number }> {
    const response = await apiClient.get(
      `${this.basePath}/${id}/performance`
    );
    return response.data;
  }

  // ========================================================================
  // Validation
  // ========================================================================

  /**
   * Validate assignment before creation
   */
  async validateAssignment(
    request: CreateAssignmentRequest
  ): Promise<AssignmentValidationResult> {
    const response = await apiClient.post<AssignmentValidationResult>(
      `${this.basePath}/validate`,
      request
    );
    return response.data;
  }

  /**
   * Check for assignment conflicts
   */
  async checkConflicts(id: number): Promise<AssignmentValidationResult> {
    const response = await apiClient.get<AssignmentValidationResult>(
      `${this.basePath}/${id}/conflicts`
    );
    return response.data;
  }

  // ========================================================================
  // Import / Export
  // ========================================================================

  /**
   * Export assignments to file
   */
  async exportAssignments(options: ExportAssignmentsOptions): Promise<Blob> {
    const response = await apiClient.post(
      `${this.basePath}/export`,
      options,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  }

  /**
   * Import assignments from file
   */
  async importAssignments(
    file: File,
    options: ImportAssignmentsOptions
  ): Promise<ImportAssignmentsResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    const response = await apiClient.post<ImportAssignmentsResult>(
      `${this.basePath}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // ========================================================================
  // Duplicate & Clone
  // ========================================================================

  /**
   * Duplicate an existing assignment
   */
  async duplicateAssignment(
    id: number,
    overrides?: Partial<CreateAssignmentRequest>
  ): Promise<Assignment> {
    const response = await apiClient.post<Assignment>(
      `${this.basePath}/${id}/duplicate`,
      overrides
    );
    return response.data;
  }
}

/**
 * Singleton instance of Assignment API Client
 */
export const assignmentApi = new AssignmentApiClient();

/**
 * Default export
 */
export default assignmentApi;
