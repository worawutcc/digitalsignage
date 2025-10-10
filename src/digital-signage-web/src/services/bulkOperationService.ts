/**
 * Bulk Operation Service
 * Manages bulk operations, progress tracking, and error handling
 * Provides comprehensive bulk operation management with real-time updates
 */

import { apiClient } from '@/lib/api';
import type { 
  BulkOperation, 
  BulkOperationError, 
  BulkOperationStatus, 
  BulkOperationType,
  BulkOperationPerformance 
} from '@/types/bulk-operations';

/**
 * Bulk operation request structure
 */
export interface BulkOperationRequest {
  type: BulkOperationType;
  targets: Array<{
    id: string;
    type: 'user' | 'schedule' | 'device' | 'media';
    metadata?: Record<string, any>;
  }>;
  operation: {
    action: string;
    parameters: Record<string, any>;
  };
  options: {
    batchSize?: number;
    continueOnError?: boolean;
    notifyOnCompletion?: boolean;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  };
}

/**
 * Bulk operation result structure
 */
export interface BulkOperationResult {
  operationId: string;
  status: BulkOperationStatus;
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
    processing: number;
  };
  results: Array<{
    targetId: string;
    success: boolean;
    data?: any;
    error?: BulkOperationError;
    processingTime?: number;
  }>;
  performance: BulkOperationPerformance;
  metadata: {
    startedAt: string;
    completedAt?: string;
    estimatedDuration?: number;
    actualDuration?: number;
  };
}

/**
 * Bulk operation progress update
 */
export interface BulkOperationProgress {
  operationId: string;
  status: BulkOperationStatus;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  currentBatch?: {
    batchNumber: number;
    totalBatches: number;
    batchSize: number;
  };
  performance: {
    itemsPerSecond: number;
    estimatedTimeRemaining: number;
    averageProcessingTime: number;
  };
  errors: BulkOperationError[];
  warnings: string[];
}

/**
 * BulkOperationService class
 * Handles all bulk operation management
 */
export class BulkOperationService {
  private readonly basePath = '/api/bulk-operations';

  /**
   * Start a new bulk operation
   */
  async startBulkOperation(request: BulkOperationRequest): Promise<BulkOperation> {
    try {
      const response = await apiClient.post<{ success: boolean; data: BulkOperation }>(
        this.basePath,
        request
      );
      
      if (!response.data?.data) {
        throw new Error('Invalid bulk operation response structure');
      }
      
      console.log('[BulkOperationService] Bulk operation started:', response.data.data.id, request.type);
      return response.data.data;
    } catch (error) {
      console.error('[BulkOperationService] Failed to start bulk operation:', error);
      throw error;
    }
  }

  /**
   * Get bulk operation status and progress
   */
  async getBulkOperationStatus(operationId: string): Promise<BulkOperationProgress> {
    try {
      const response = await apiClient.get<{ success: boolean; data: BulkOperationProgress }>(
        `${this.basePath}/${operationId}/status`
      );
      
      if (!response.data?.data) {
        throw new Error('Invalid bulk operation status response structure');
      }
      
      console.log('[BulkOperationService] Bulk operation status retrieved:', operationId, response.data.data.status);
      return response.data.data;
    } catch (error) {
      console.error('[BulkOperationService] Failed to get bulk operation status:', operationId, error);
      throw error;
    }
  }

  /**
   * Get bulk operation results
   */
  async getBulkOperationResult(operationId: string): Promise<BulkOperationResult> {
    try {
      const response = await apiClient.get<{ success: boolean; data: BulkOperationResult }>(
        `${this.basePath}/${operationId}/result`
      );
      
      if (!response.data?.data) {
        throw new Error('Invalid bulk operation result response structure');
      }
      
      console.log('[BulkOperationService] Bulk operation result retrieved:', operationId, response.data.data.summary);
      return response.data.data;
    } catch (error) {
      console.error('[BulkOperationService] Failed to get bulk operation result:', operationId, error);
      throw error;
    }
  }

  /**
   * Cancel running bulk operation
   */
  async cancelBulkOperation(operationId: string, reason?: string): Promise<void> {
    try {
      await apiClient.post(`${this.basePath}/${operationId}/cancel`, {
        reason: reason || 'User cancelled'
      });
      console.log('[BulkOperationService] Bulk operation cancelled:', operationId, reason);
    } catch (error) {
      console.error('[BulkOperationService] Failed to cancel bulk operation:', operationId, error);
      throw error;
    }
  }

  /**
   * Pause running bulk operation
   */
  async pauseBulkOperation(operationId: string): Promise<void> {
    try {
      await apiClient.post(`${this.basePath}/${operationId}/pause`);
      console.log('[BulkOperationService] Bulk operation paused:', operationId);
    } catch (error) {
      console.error('[BulkOperationService] Failed to pause bulk operation:', operationId, error);
      throw error;
    }
  }

  /**
   * Resume paused bulk operation
   */
  async resumeBulkOperation(operationId: string): Promise<void> {
    try {
      await apiClient.post(`${this.basePath}/${operationId}/resume`);
      console.log('[BulkOperationService] Bulk operation resumed:', operationId);
    } catch (error) {
      console.error('[BulkOperationService] Failed to resume bulk operation:', operationId, error);
      throw error;
    }
  }

  /**
   * Retry failed items in bulk operation
   */
  async retryFailedItems(operationId: string, targetIds?: string[]): Promise<BulkOperation> {
    try {
      const response = await apiClient.post<{ success: boolean; data: BulkOperation }>(
        `${this.basePath}/${operationId}/retry`,
        { targetIds }
      );
      
      if (!response.data?.data) {
        throw new Error('Invalid retry response structure');
      }
      
      console.log('[BulkOperationService] Bulk operation retry initiated:', operationId, targetIds?.length || 'all failed items');
      return response.data.data;
    } catch (error) {
      console.error('[BulkOperationService] Failed to retry bulk operation items:', operationId, error);
      throw error;
    }
  }

  /**
   * Get all bulk operations with filtering
   */
  async getBulkOperations(options?: {
    status?: BulkOperationStatus[];
    type?: BulkOperationType[];
    startDate?: string;
    endDate?: string;
    userId?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'completedAt' | 'status' | 'type';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    operations: BulkOperation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    aggregations: {
      totalOperations: number;
      operationsByStatus: Record<BulkOperationStatus, number>;
      operationsByType: Record<BulkOperationType, number>;
      averageCompletionTime: number;
      successRate: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      
      if (options?.status?.length) {
        options.status.forEach(status => params.append('status', status));
      }
      
      if (options?.type?.length) {
        options.type.forEach(type => params.append('type', type));
      }
      
      if (options?.startDate) params.append('startDate', options.startDate);
      if (options?.endDate) params.append('endDate', options.endDate);
      if (options?.userId) params.append('userId', options.userId);
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.sortBy) params.append('sortBy', options.sortBy);
      if (options?.sortOrder) params.append('sortOrder', options.sortOrder);

      const response = await apiClient.get<{
        success: boolean;
        data: {
          operations: BulkOperation[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
          aggregations: {
            totalOperations: number;
            operationsByStatus: Record<BulkOperationStatus, number>;
            operationsByType: Record<BulkOperationType, number>;
            averageCompletionTime: number;
            successRate: number;
          };
        };
      }>(`${this.basePath}?${params.toString()}`);
      
      if (!response.data?.data) {
        throw new Error('Invalid bulk operations list response structure');
      }
      
      console.log('[BulkOperationService] Bulk operations list retrieved:', response.data.data.operations.length);
      return response.data.data;
    } catch (error) {
      console.error('[BulkOperationService] Failed to get bulk operations:', error);
      throw error;
    }
  }

  /**
   * Delete completed bulk operation (cleanup)
   */
  async deleteBulkOperation(operationId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${operationId}`);
      console.log('[BulkOperationService] Bulk operation deleted:', operationId);
    } catch (error) {
      console.error('[BulkOperationService] Failed to delete bulk operation:', operationId, error);
      throw error;
    }
  }

  /**
   * Get bulk operation analytics
   */
  async getBulkOperationAnalytics(options?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<{
    totalOperations: number;
    successRate: number;
    averageCompletionTime: number;
    operationsByType: Record<BulkOperationType, {
      count: number;
      successRate: number;
      averageTime: number;
    }>;
    operationTrends: Array<{
      date: string;
      operations: number;
      successful: number;
      failed: number;
      averageTime: number;
    }>;
    topErrors: Array<{
      errorCode: string;
      message: string;
      count: number;
      percentage: number;
    }>;
    performanceMetrics: {
      peakHour: string;
      averageItemsPerSecond: number;
      bottlenecks: Array<{
        operation: string;
        averageTime: number;
        frequency: number;
      }>;
    };
  }> {
    const params = new URLSearchParams();
    
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.groupBy) params.append('groupBy', options.groupBy);

    const response = await apiClient.get<{
      success: boolean;
      data: {
        totalOperations: number;
        successRate: number;
        averageCompletionTime: number;
        operationsByType: Record<BulkOperationType, {
          count: number;
          successRate: number;
          averageTime: number;
        }>;
        operationTrends: Array<{
          date: string;
          operations: number;
          successful: number;
          failed: number;
          averageTime: number;
        }>;
        topErrors: Array<{
          errorCode: string;
          message: string;
          count: number;
          percentage: number;
        }>;
        performanceMetrics: {
          peakHour: string;
          averageItemsPerSecond: number;
          bottlenecks: Array<{
            operation: string;
            averageTime: number;
            frequency: number;
          }>;
        };
      };
    }>(`${this.basePath}/analytics?${params.toString()}`);
    
    return response.data.data;
  }

  // ============================================================================
  // SPECIALIZED BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk assign schedules to users
   */
  async bulkAssignSchedulesToUsers(
    userIds: number[], 
    scheduleIds: number[], 
    options?: {
      priority?: number;
      allowConflicts?: boolean;
      notes?: string;
      batchSize?: number;
    }
  ): Promise<BulkOperation> {
    const request: BulkOperationRequest = {
      type: 'assign_schedules',
      targets: userIds.map(id => ({ id: id.toString(), type: 'user' as const })),
      operation: {
        action: 'assign_schedules',
        parameters: {
          scheduleIds,
          priority: options?.priority || 1,
          allowConflicts: options?.allowConflicts || false,
          notes: options?.notes
        }
      },
      options: {
        batchSize: options?.batchSize || 50,
        continueOnError: true,
        notifyOnCompletion: true,
        priority: 'medium'
      }
    };

    return this.startBulkOperation(request);
  }

  /**
   * Bulk remove schedule assignments from users
   */
  async bulkRemoveScheduleAssignments(
    userIds: number[], 
    scheduleIds: number[], 
    options?: {
      notes?: string;
      batchSize?: number;
    }
  ): Promise<BulkOperation> {
    const request: BulkOperationRequest = {
      type: 'update_users',
      targets: userIds.map(id => ({ id: id.toString(), type: 'user' as const })),
      operation: {
        action: 'remove_schedules',
        parameters: {
          scheduleIds,
          notes: options?.notes
        }
      },
      options: {
        batchSize: options?.batchSize || 100,
        continueOnError: true,
        notifyOnCompletion: true,
        priority: 'medium'
      }
    };

    return this.startBulkOperation(request);
  }

  /**
   * Bulk update user roles
   */
  async bulkUpdateUserRoles(
    userIds: number[], 
    roleId: string, 
    options?: {
      notes?: string;
      batchSize?: number;
      validatePermissions?: boolean;
    }
  ): Promise<BulkOperation> {
    const request: BulkOperationRequest = {
      type: 'update_users',
      targets: userIds.map(id => ({ id: id.toString(), type: 'user' as const })),
      operation: {
        action: 'update_role',
        parameters: {
          roleId,
          notes: options?.notes,
          validatePermissions: options?.validatePermissions !== false
        }
      },
      options: {
        batchSize: options?.batchSize || 25,
        continueOnError: false, // Role updates should be more cautious
        notifyOnCompletion: true,
        priority: 'high'
      }
    };

    return this.startBulkOperation(request);
  }

  /**
   * Bulk activate/deactivate users
   */
  async bulkToggleUserStatus(
    userIds: number[], 
    isActive: boolean, 
    options?: {
      reason?: string;
      batchSize?: number;
    }
  ): Promise<BulkOperation> {
    const request: BulkOperationRequest = {
      type: 'update_users',
      targets: userIds.map(id => ({ id: id.toString(), type: 'user' as const })),
      operation: {
        action: isActive ? 'activate' : 'deactivate',
        parameters: {
          isActive,
          reason: options?.reason
        }
      },
      options: {
        batchSize: options?.batchSize || 50,
        continueOnError: true,
        notifyOnCompletion: true,
        priority: 'medium'
      }
    };

    return this.startBulkOperation(request);
  }

  /**
   * Bulk delete schedules
   */
  async bulkDeleteSchedules(
    scheduleIds: number[], 
    options?: {
      force?: boolean;
      removeAssignments?: boolean;
      batchSize?: number;
    }
  ): Promise<BulkOperation> {
    const request: BulkOperationRequest = {
      type: 'delete_users',
      targets: scheduleIds.map(id => ({ id: id.toString(), type: 'schedule' as const })),
      operation: {
        action: 'delete',
        parameters: {
          force: options?.force || false,
          removeAssignments: options?.removeAssignments !== false
        }
      },
      options: {
        batchSize: options?.batchSize || 20,
        continueOnError: false, // Deletion should be careful
        notifyOnCompletion: true,
        priority: 'high'
      }
    };

    return this.startBulkOperation(request);
  }

  // ============================================================================
  // REAL-TIME MONITORING AND EVENTS
  // ============================================================================

  /**
   * Subscribe to bulk operation events (WebSocket)
   */
  subscribeToOperationEvents(
    operationId: string, 
    callbacks: {
      onProgress?: (progress: BulkOperationProgress) => void;
      onCompleted?: (result: BulkOperationResult) => void;
      onError?: (error: BulkOperationError) => void;
      onCancelled?: () => void;
    }
  ): () => void {
    // This would typically use WebSocket connection
    // For now, return a mock unsubscribe function
    console.log(`Subscribing to events for operation ${operationId}`);
    
    // Mock implementation - in real scenario this would establish WebSocket connection
    const interval = setInterval(async () => {
      try {
        const progress = await this.getBulkOperationStatus(operationId);
        callbacks.onProgress?.(progress);
        
        if (progress.status === 'completed') {
          const result = await this.getBulkOperationResult(operationId);
          callbacks.onCompleted?.(result);
          clearInterval(interval);
        } else if (progress.status === 'failed') {
          if (progress.errors.length > 0 && progress.errors[0]) {
            callbacks.onError?.(progress.errors[0]);
          }
          clearInterval(interval);
        } else if (progress.status === 'cancelled') {
          callbacks.onCancelled?.();
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error monitoring bulk operation:', error);
        callbacks.onError?.(error as BulkOperationError);
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds

    // Return unsubscribe function
    return () => {
      clearInterval(interval);
    };
  }

  /**
   * Validate bulk operation before starting
   */
  async validateBulkOperation(request: BulkOperationRequest): Promise<{
    valid: boolean;
    warnings: string[];
    errors: string[];
    estimatedDuration: number;
    estimatedItemsPerSecond: number;
    resourceRequirements: {
      memory: number;
      cpu: number;
      network: number;
    };
  }> {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        valid: boolean;
        warnings: string[];
        errors: string[];
        estimatedDuration: number;
        estimatedItemsPerSecond: number;
        resourceRequirements: {
          memory: number;
          cpu: number;
          network: number;
        };
      };
    }>(`${this.basePath}/validate`, request);
    
    return response.data.data;
  }
}

// Export singleton instance
export const bulkOperationService = new BulkOperationService();

// Export interfaces for convenience - using different naming to avoid conflicts
export type {
  BulkOperationRequest as BulkOpRequest,
  BulkOperationResult as BulkOpResult,
  BulkOperationProgress as BulkOpProgress
};