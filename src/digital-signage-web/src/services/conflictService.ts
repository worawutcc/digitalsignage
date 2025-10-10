/**
 * Conflict Service
 * Handles conflict detection, resolution, and real-time updates
 * Provides comprehensive conflict management for schedule assignments
 */

import { apiClient } from '@/lib/api';
import type { 
  ScheduleConflict,
  ConflictType,
  ConflictSeverity,
  ConflictStatus,
  ConflictDetectionRequest,
  ConflictDetectionResponse,
  ConflictResolution,
  ResolutionType,
  ResolutionStrategy,
  BulkConflictOperation,
  BulkConflictOperationType,
  BulkConflictOperationResult,
  ConflictMonitoringConfig,
  ConflictNotificationSettings,
  ConflictEscalationRule,
  ConflictReport,
  ConflictMetrics
} from '@/types/schedule-conflicts';

/**
 * Real-time conflict notification interface
 */
export interface ConflictNotification {
  id: string;
  conflictId: string;
  type: 'new_conflict' | 'conflict_resolved' | 'conflict_escalated' | 'bulk_resolution_complete';
  severity: ConflictSeverity;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * ConflictService class
 * Manages all conflict-related operations
 */
export class ConflictService {
  private readonly basePath = '/api/schedule-conflicts';
  private eventSubscriptions = new Map<string, () => void>();

  // ============================================================================
  // CONFLICT DETECTION AND RETRIEVAL
  // ============================================================================

  /**
   * Get all schedule conflicts with filtering
   */
  async getConflicts(request?: ConflictDetectionRequest): Promise<ConflictDetectionResponse> {
    try {
      const params = new URLSearchParams();
      
      if (request?.scheduleIds?.length) {
        request.scheduleIds.forEach(id => params.append('scheduleIds', id));
      }
      
      if (request?.userIds?.length) {
        request.userIds.forEach(id => params.append('userIds', id));
      }
      
      if (request?.timeRange?.start) {
        params.append('startTime', request.timeRange.start);
      }
      
      if (request?.timeRange?.end) {
        params.append('endTime', request.timeRange.end);
      }
      
      if (request?.conflictTypes?.length) {
        request.conflictTypes.forEach(type => params.append('types', type));
      }
      
      if (request?.includeResolved !== undefined) {
        params.append('includeResolved', request.includeResolved.toString());
      }
      
      if (request?.severity?.length) {
        request.severity.forEach(s => params.append('severity', s));
      }

      const response = await apiClient.get<{
        success: boolean;
        data: ConflictDetectionResponse;
      }>(`${this.basePath}?${params.toString()}`);
      
      if (!response.data?.data) {
        console.error('[ConflictService] Invalid response structure for getConflicts');
        return { 
          conflicts: [], 
          totalConflicts: 0, 
          conflictsByType: {} as Record<ConflictType, number>,
          conflictsBySeverity: {} as Record<ConflictSeverity, number>,
          analysisMetadata: {
            analysisDuration: 0,
            schedulesAnalyzed: 0,
            usersAnalyzed: 0,
            lastAnalysisAt: new Date().toISOString()
          }
        };
      }

      console.log('[ConflictService] Conflicts retrieved:', response.data.data.totalConflicts || 0);
      return response.data.data;
    } catch (error) {
      console.error('[ConflictService] Failed to get conflicts:', error);
      return { 
        conflicts: [], 
        totalConflicts: 0, 
        conflictsByType: {} as Record<ConflictType, number>,
        conflictsBySeverity: {} as Record<ConflictSeverity, number>,
        analysisMetadata: {
          analysisDuration: 0,
          schedulesAnalyzed: 0,
          usersAnalyzed: 0,
          lastAnalysisAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get specific conflict by ID
   */
  async getConflictById(conflictId: string): Promise<ScheduleConflict | null> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ScheduleConflict;
      }>(`${this.basePath}/${conflictId}`);
      
      if (!response.data?.data) {
        console.error('[ConflictService] Invalid response structure for getConflictById');
        return null;
      }

      console.log('[ConflictService] Conflict retrieved:', conflictId);
      return response.data.data;
    } catch (error) {
      console.error('[ConflictService] Failed to get conflict by ID:', error);
      return null;
    }
  }

  /**
   * Detect conflicts for specific schedule and user assignments
   */
  async detectConflicts(
    scheduleIds: string[], 
    userIds: string[], 
    options?: {
      timeRange?: { start: string; end: string };
      strictMode?: boolean;
      includeWarnings?: boolean;
    }
  ): Promise<ConflictDetectionResponse> {
    const request: ConflictDetectionRequest = {
      scheduleIds,
      userIds,
      ...(options?.timeRange && { timeRange: options.timeRange }),
      includeResolved: false
    };

    const response = await apiClient.post<{
      success: boolean;
      data: ConflictDetectionResponse;
    }>(`${this.basePath}/detect`, {
      ...request,
      options: {
        strictMode: options?.strictMode !== false,
        includeWarnings: options?.includeWarnings !== false
      }
    });
    
    return response.data.data;
  }

  /**
   * Get conflicts for specific user
   */
  async getUserConflicts(userId: string, options?: {
    includeResolved?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<ScheduleConflict[]> {
    const params = new URLSearchParams();
    params.append('userId', userId);
    
    if (options?.includeResolved !== undefined) {
      params.append('includeResolved', options.includeResolved.toString());
    }
    
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const response = await apiClient.get<{
      success: boolean;
      data: ScheduleConflict[];
    }>(`${this.basePath}/user?${params.toString()}`);
    
    return response.data.data;
  }

  /**
   * Get conflicts for specific schedule
   */
  async getScheduleConflicts(scheduleId: string, options?: {
    includeResolved?: boolean;
    severity?: ConflictSeverity[];
  }): Promise<ScheduleConflict[]> {
    const params = new URLSearchParams();
    params.append('scheduleId', scheduleId);
    
    if (options?.includeResolved !== undefined) {
      params.append('includeResolved', options.includeResolved.toString());
    }
    
    if (options?.severity?.length) {
      options.severity.forEach(s => params.append('severity', s));
    }

    const response = await apiClient.get<{
      success: boolean;
      data: ScheduleConflict[];
    }>(`${this.basePath}/schedule?${params.toString()}`);
    
    return response.data.data;
  }

  // ============================================================================
  // CONFLICT RESOLUTION
  // ============================================================================

  /**
   * Resolve a single conflict
   */
  async resolveConflict(
    conflictId: string, 
    resolution: {
      strategy: ResolutionStrategy;
      type: ResolutionType;
      parameters?: Record<string, any>;
      notes?: string;
    }
  ): Promise<ConflictResolution | null> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: ConflictResolution;
      }>(`${this.basePath}/${conflictId}/resolve`, resolution);
      
      if (!response.data?.data) {
        console.error('[ConflictService] Invalid response structure for resolveConflict');
        return null;
      }

      console.log('[ConflictService] Conflict resolved:', conflictId, 'with strategy:', resolution.strategy);
      return response.data.data;
    } catch (error) {
      console.error('[ConflictService] Failed to resolve conflict:', error);
      return null;
    }
  }

  /**
   * Get resolution suggestions for a conflict
   */
  async getResolutionSuggestions(conflictId: string): Promise<{
    suggestions: Array<{
      strategy: ResolutionStrategy;
      type: ResolutionType;
      description: string;
      impact: string;
      automated: boolean;
      parameters?: Record<string, any>;
      estimatedTime?: number;
    }>;
    recommendedStrategy?: ResolutionStrategy;
    warningsBeforeResolution: string[];
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          suggestions: Array<{
            strategy: ResolutionStrategy;
            type: ResolutionType;
            description: string;
            impact: string;
            automated: boolean;
            parameters?: Record<string, any>;
            estimatedTime?: number;
          }>;
          recommendedStrategy?: ResolutionStrategy;
          warningsBeforeResolution: string[];
        };
      }>(`${this.basePath}/${conflictId}/suggestions`);
      
      if (!response.data?.data) {
        console.error('[ConflictService] Invalid response structure for getResolutionSuggestions');
        return { suggestions: [], warningsBeforeResolution: [] };
      }

      console.log('[ConflictService] Resolution suggestions retrieved:', response.data.data.suggestions?.length || 0);
      return response.data.data;
    } catch (error) {
      console.error('[ConflictService] Failed to get resolution suggestions:', error);
      return { suggestions: [], warningsBeforeResolution: [] };
    }
  }

  /**
   * Rollback conflict resolution
   */
  async rollbackResolution(conflictId: string, reason?: string): Promise<ScheduleConflict> {
    const response = await apiClient.post<{
      success: boolean;
      data: ScheduleConflict;
    }>(`${this.basePath}/${conflictId}/rollback`, { reason });
    
    return response.data.data;
  }

  /**
   * Ignore conflict (mark as resolved without action)
   */
  async ignoreConflict(conflictId: string, reason: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${conflictId}/ignore`, { reason });
  }

  // ============================================================================
  // BULK CONFLICT OPERATIONS
  // ============================================================================

  /**
   * Start bulk conflict operation
   */
  async startBulkConflictOperation(
    type: BulkConflictOperationType,
    conflictIds: string[],
    parameters?: {
      resolutionStrategy?: ResolutionStrategy;
      notes?: string;
      [key: string]: any;
    }
  ): Promise<BulkConflictOperation> {
    const response = await apiClient.post<{
      success: boolean;
      data: BulkConflictOperation;
    }>(`${this.basePath}/bulk-operations`, {
      type,
      conflictIds,
      parameters: parameters || {}
    });
    
    return response.data.data;
  }

  /**
   * Get bulk operation status
   */
  async getBulkOperationStatus(operationId: string): Promise<BulkConflictOperation> {
    const response = await apiClient.get<{
      success: boolean;
      data: BulkConflictOperation;
    }>(`${this.basePath}/bulk-operations/${operationId}`);
    
    return response.data.data;
  }

  /**
   * Get bulk operation results
   */
  async getBulkOperationResults(operationId: string): Promise<BulkConflictOperationResult> {
    const response = await apiClient.get<{
      success: boolean;
      data: BulkConflictOperationResult;
    }>(`${this.basePath}/bulk-operations/${operationId}/results`);
    
    return response.data.data;
  }

  /**
   * Cancel bulk operation
   */
  async cancelBulkOperation(operationId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/bulk-operations/${operationId}/cancel`);
  }

  // ============================================================================
  // REAL-TIME MONITORING AND NOTIFICATIONS
  // ============================================================================

  /**
   * Subscribe to conflict events for real-time updates
   */
  subscribeToConflictEvents(
    options?: {
      scheduleIds?: string[];
      userIds?: string[];
      severity?: ConflictSeverity[];
    },
    callbacks?: {
      onNewConflict?: (conflict: ScheduleConflict) => void;
      onConflictResolved?: (conflict: ScheduleConflict) => void;
      onConflictEscalated?: (conflict: ScheduleConflict) => void;
      onBulkOperationUpdate?: (operation: BulkConflictOperation) => void;
    }
  ): () => void {
    const subscriptionId = `conflict-events-${Date.now()}`;
    
    // Mock WebSocket implementation - in real scenario this would establish WebSocket connection
    console.log(`Subscribing to conflict events with ID: ${subscriptionId}`);
    
    // Simulate periodic polling for demonstration
    const interval = setInterval(async () => {
      try {
        // In real implementation, this would receive WebSocket messages
        // For demo, we could poll for new conflicts
        const conflictRequest: ConflictDetectionRequest = {
          includeResolved: false,
          ...(options?.scheduleIds && { scheduleIds: options.scheduleIds }),
          ...(options?.userIds && { userIds: options.userIds }),
          ...(options?.severity && { severity: options.severity })
        };
        const conflicts = await this.getConflicts(conflictRequest);
        
        // Process new conflicts (in real implementation, server would push these)
        // callbacks?.onNewConflict?.(conflict);
      } catch (error) {
        console.error('Error in conflict event subscription:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Store unsubscribe function
    const unsubscribe = () => {
      clearInterval(interval);
      this.eventSubscriptions.delete(subscriptionId);
    };
    
    this.eventSubscriptions.set(subscriptionId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Unsubscribe from all conflict events
   */
  unsubscribeFromAllEvents(): void {
    this.eventSubscriptions.forEach(unsubscribe => unsubscribe());
    this.eventSubscriptions.clear();
  }

  /**
   * Get conflict monitoring configuration
   */
  async getMonitoringConfig(): Promise<ConflictMonitoringConfig> {
    const response = await apiClient.get<{
      success: boolean;
      data: ConflictMonitoringConfig;
    }>(`${this.basePath}/monitoring/config`);
    
    return response.data.data;
  }

  /**
   * Update conflict monitoring configuration
   */
  async updateMonitoringConfig(config: Partial<ConflictMonitoringConfig>): Promise<ConflictMonitoringConfig> {
    const response = await apiClient.put<{
      success: boolean;
      data: ConflictMonitoringConfig;
    }>(`${this.basePath}/monitoring/config`, config);
    
    return response.data.data;
  }

  /**
   * Test conflict notification settings
   */
  async testNotificationSettings(): Promise<{
    success: boolean;
    results: Array<{
      channel: 'email' | 'push' | 'slack';
      delivered: boolean;
      error?: string;
    }>;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        success: boolean;
        results: Array<{
          channel: 'email' | 'push' | 'slack';
          delivered: boolean;
          error?: string;
        }>;
      };
    }>(`${this.basePath}/monitoring/test-notifications`);
    
    return response.data.data;
  }

  // ============================================================================
  // ANALYTICS AND REPORTING
  // ============================================================================

  /**
   * Get conflict analytics
   */
  async getConflictAnalytics(options?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
    includeResolved?: boolean;
  }): Promise<ConflictMetrics> {
    const params = new URLSearchParams();
    
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.groupBy) params.append('groupBy', options.groupBy);
    if (options?.includeResolved !== undefined) {
      params.append('includeResolved', options.includeResolved.toString());
    }

    const response = await apiClient.get<{
      success: boolean;
      data: ConflictMetrics;
    }>(`${this.basePath}/analytics?${params.toString()}`);
    
    return response.data.data;
  }

  /**
   * Generate conflict report
   */
  async generateConflictReport(options: {
    title: string;
    startDate: string;
    endDate: string;
    includeResolved?: boolean;
    includeMetrics?: boolean;
    includeRecommendations?: boolean;
  }): Promise<ConflictReport> {
    const response = await apiClient.post<{
      success: boolean;
      data: ConflictReport;
    }>(`${this.basePath}/reports`, options);
    
    return response.data.data;
  }

  /**
   * Get conflict trends
   */
  async getConflictTrends(options?: {
    period: 'week' | 'month' | 'quarter' | 'year';
    conflictTypes?: ConflictType[];
  }): Promise<{
    trends: Array<{
      period: string;
      totalConflicts: number;
      resolvedConflicts: number;
      averageResolutionTime: number;
      topConflictType: ConflictType;
      severityDistribution: Record<ConflictSeverity, number>;
    }>;
    insights: {
      trendDirection: 'increasing' | 'decreasing' | 'stable';
      seasonalPatterns?: string[];
      recommendations: string[];
    };
  }> {
    const params = new URLSearchParams();
    
    if (options?.period) params.append('period', options.period);
    if (options?.conflictTypes?.length) {
      options.conflictTypes.forEach(type => params.append('types', type));
    }

    const response = await apiClient.get<{
      success: boolean;
      data: {
        trends: Array<{
          period: string;
          totalConflicts: number;
          resolvedConflicts: number;
          averageResolutionTime: number;
          topConflictType: ConflictType;
          severityDistribution: Record<ConflictSeverity, number>;
        }>;
        insights: {
          trendDirection: 'increasing' | 'decreasing' | 'stable';
          seasonalPatterns?: string[];
          recommendations: string[];
        };
      };
    }>(`${this.basePath}/analytics/trends?${params.toString()}`);
    
    return response.data.data;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get conflict summary for dashboard
   */
  async getConflictSummary(): Promise<{
    activeConflicts: number;
    criticalConflicts: number;
    resolvedToday: number;
    averageResolutionTime: number;
    topConflictType: ConflictType;
    conflictsByStatus: Record<ConflictStatus, number>;
    recentActivity: Array<{
      type: 'created' | 'resolved' | 'escalated';
      conflict: ScheduleConflict;
      timestamp: string;
    }>;
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        activeConflicts: number;
        criticalConflicts: number;
        resolvedToday: number;
        averageResolutionTime: number;
        topConflictType: ConflictType;
        conflictsByStatus: Record<ConflictStatus, number>;
        recentActivity: Array<{
          type: 'created' | 'resolved' | 'escalated';
          conflict: ScheduleConflict;
          timestamp: string;
        }>;
      };
    }>(`${this.basePath}/summary`);
    
    return response.data.data;
  }

  /**
   * Validate conflict resolution before applying
   */
  async validateResolution(
    conflictId: string, 
    strategy: ResolutionStrategy,
    parameters?: Record<string, any>
  ): Promise<{
    valid: boolean;
    warnings: string[];
    errors: string[];
    impact: {
      affectedUsers: number;
      affectedSchedules: number;
      estimatedDowntime: number;
    };
    rollbackPlan?: {
      canRollback: boolean;
      rollbackSteps: string[];
    };
  }> {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        valid: boolean;
        warnings: string[];
        errors: string[];
        impact: {
          affectedUsers: number;
          affectedSchedules: number;
          estimatedDowntime: number;
        };
        rollbackPlan?: {
          canRollback: boolean;
          rollbackSteps: string[];
        };
      };
    }>(`${this.basePath}/${conflictId}/validate-resolution`, {
      strategy,
      parameters: parameters || {}
    });
    
    return response.data.data;
  }

  /**
   * Get conflict history
   */
  async getConflictHistory(conflictId: string): Promise<Array<{
    action: string;
    performedBy: string;
    performedAt: string;
    details: Record<string, any>;
    previousState?: any;
    newState?: any;
  }>> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Array<{
          action: string;
          performedBy: string;
          performedAt: string;
          details: Record<string, any>;
          previousState?: any;
          newState?: any;
        }>;
      }>(`${this.basePath}/${conflictId}/history`);
      
      const historyArray = Array.isArray(response.data?.data) ? response.data.data : [];
      console.log('[ConflictService] Conflict history retrieved:', historyArray.length, 'entries');
      return historyArray;
    } catch (error) {
      console.error('[ConflictService] Failed to get conflict history:', error);
      return [];
    }
  }
}

// Export singleton instance
export const conflictService = new ConflictService();

// Export additional types for convenience
export type { ConflictNotification as ConflictNotificationEvent };