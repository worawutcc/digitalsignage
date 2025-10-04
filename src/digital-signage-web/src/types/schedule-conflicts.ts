/**
 * Schedule Conflict Detection and Resolution Types
 * Handles conflict detection, resolution strategies, and conflict management UI
 */

import { User } from '@/types/api';
import { Schedule } from '@/features/schedules/types';

// Core conflict types
export interface ScheduleConflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  status: ConflictStatus;
  scheduleIds: string[];
  affectedUsers: User[];
  conflictDetails: ConflictDetails;
  detectedAt: string;
  resolvedAt?: string;
  resolutionStrategy?: ConflictResolution;
  autoResolvable: boolean;
  requiresUserInput: boolean;
}

export enum ConflictType {
  TIME_OVERLAP = 'time_overlap',
  RESOURCE_CONFLICT = 'resource_conflict',
  USER_OVERLOAD = 'user_overload',
  CAPACITY_EXCEEDED = 'capacity_exceeded',
  PERMISSION_CONFLICT = 'permission_conflict',
  DEVICE_UNAVAILABLE = 'device_unavailable',
  CONTENT_DEPENDENCY = 'content_dependency'
}

export enum ConflictSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ConflictStatus {
  DETECTED = 'detected',
  ANALYZING = 'analyzing',
  PENDING_RESOLUTION = 'pending_resolution',
  RESOLVING = 'resolving',
  RESOLVED = 'resolved',
  IGNORED = 'ignored',
  FAILED_RESOLUTION = 'failed_resolution'
}

// Conflict details based on type
export interface ConflictDetails {
  description: string;
  affectedTimeRange?: {
    start: string;
    end: string;
  };
  affectedResources?: string[];
  userCapacityIssues?: UserCapacityConflict[];
  deviceConflicts?: DeviceConflict[];
  permissionIssues?: PermissionConflict[];
  contentDependencies?: ContentDependencyConflict[];
  suggestedActions: string[];
  impactAssessment: ConflictImpact;
}

export interface UserCapacityConflict {
  userId: string;
  userName: string;
  maxConcurrentSchedules: number;
  currentScheduleCount: number;
  conflictingScheduleIds: string[];
  overloadSeverity: number; // 1-10 scale
}

export interface DeviceConflict {
  deviceId: string;
  deviceName: string;
  conflictingScheduleIds: string[];
  availabilityWindow?: {
    start: string;
    end: string;
  };
  maintenanceScheduled: boolean;
}

export interface PermissionConflict {
  userId: string;
  userName: string;
  requiredPermissions: string[];
  missingPermissions: string[];
  scheduleId: string;
  canEscalate: boolean;
}

export interface ContentDependencyConflict {
  scheduleId: string;
  missingContent: string[];
  dependentContent: string[];
  contentAvailability: {
    [contentId: string]: {
      available: boolean;
      expectedDate?: string;
      alternativeOptions?: string[];
    };
  };
}

export interface ConflictImpact {
  affectedUsersCount: number;
  affectedSchedulesCount: number;
  businessImpact: ImpactLevel;
  technicalImpact: ImpactLevel;
  estimatedDowntime?: number; // in minutes
  revenueImpact?: number;
  userExperienceImpact: ImpactLevel;
}

export enum ImpactLevel {
  NONE = 'none',
  MINIMAL = 'minimal',
  MODERATE = 'moderate',
  SIGNIFICANT = 'significant',
  SEVERE = 'severe'
}

// Resolution strategies and types
export interface ConflictResolution {
  id: string;
  type: ResolutionType;
  strategy: ResolutionStrategy;
  description: string;
  automated: boolean;
  approvalRequired: boolean;
  approvedBy?: string;
  appliedAt?: string;
  rollbackable: boolean;
  rollbackData?: unknown;
  results: ResolutionResult;
}

export enum ResolutionType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  HYBRID = 'hybrid',
  ESCALATED = 'escalated'
}

export enum ResolutionStrategy {
  RESCHEDULE = 'reschedule',
  REASSIGN_USERS = 'reassign_users',
  SPLIT_SCHEDULE = 'split_schedule',
  MERGE_SCHEDULES = 'merge_schedules',
  REDUCE_CAPACITY = 'reduce_capacity',
  ADD_RESOURCES = 'add_resources',
  DEFER_SCHEDULE = 'defer_schedule',
  CANCEL_CONFLICTING = 'cancel_conflicting',
  OVERRIDE_LIMITS = 'override_limits',
  REQUEST_APPROVAL = 'request_approval'
}

export interface ResolutionResult {
  success: boolean;
  conflictResolved: boolean;
  newConflictsCreated: string[];
  affectedSchedules: string[];
  affectedUsers: string[];
  changes: ResolutionChange[];
  warnings: string[];
  errors: string[];
}

export interface ResolutionChange {
  type: 'schedule_update' | 'user_assignment' | 'resource_allocation';
  entityId: string;
  beforeState: unknown;
  afterState: unknown;
  description: string;
}

// Conflict detection and analysis
export interface ConflictDetectionRequest {
  scheduleIds?: string[];
  userIds?: string[];
  timeRange?: {
    start: string;
    end: string;
  };
  conflictTypes?: ConflictType[];
  includeResolved?: boolean;
  severity?: ConflictSeverity[];
}

export interface ConflictDetectionResponse {
  conflicts: ScheduleConflict[];
  totalConflicts: number;
  conflictsByType: Record<ConflictType, number>;
  conflictsBySeverity: Record<ConflictSeverity, number>;
  analysisMetadata: {
    analysisDuration: number;
    schedulesAnalyzed: number;
    usersAnalyzed: number;
    lastAnalysisAt: string;
  };
}

export interface ConflictAnalysisOptions {
  deepAnalysis: boolean;
  predictiveAnalysis: boolean;
  includeRecommendations: boolean;
  analysisTimeframe: number; // days ahead to analyze
  considerMaintenanceWindows: boolean;
  includeUserPreferences: boolean;
}

// Bulk conflict operations
export interface BulkConflictOperation {
  id: string;
  type: BulkConflictOperationType;
  conflictIds: string[];
  resolutionStrategy?: ResolutionStrategy;
  parameters?: Record<string, unknown>;
  status: BulkOperationStatus;
  results?: BulkConflictOperationResult;
  createdAt: string;
  completedAt?: string;
}

export enum BulkConflictOperationType {
  RESOLVE_MULTIPLE = 'resolve_multiple',
  IGNORE_MULTIPLE = 'ignore_multiple',
  ESCALATE_MULTIPLE = 'escalate_multiple',
  ANALYZE_BATCH = 'analyze_batch',
  APPLY_STRATEGY = 'apply_strategy'
}

export enum BulkOperationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  PARTIALLY_COMPLETED = 'partially_completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface BulkConflictOperationResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  skipped: number;
  results: ConflictOperationResult[];
  errors: BulkConflictError[];
  warnings: string[];
}

export interface ConflictOperationResult {
  conflictId: string;
  success: boolean;
  resolution?: ConflictResolution;
  error?: string;
  newConflictsCreated?: string[];
}

export interface BulkConflictError {
  conflictId: string;
  error: string;
  code: string;
  details?: unknown;
  recoverable: boolean;
}

// UI and state management types
export interface ConflictManagementState {
  conflicts: ScheduleConflict[];
  selectedConflicts: string[];
  filterOptions: ConflictFilterOptions;
  sortOptions: ConflictSortOptions;
  bulkOperations: BulkConflictOperation[];
  currentAnalysis?: ConflictDetectionResponse;
  uiState: ConflictUIState;
}

export interface ConflictFilterOptions {
  types: ConflictType[];
  severities: ConflictSeverity[];
  statuses: ConflictStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  affectedUsers?: string[];
  schedules?: string[];
  autoResolvableOnly: boolean;
  requiresInputOnly: boolean;
}

export interface ConflictSortOptions {
  field: ConflictSortField;
  direction: 'asc' | 'desc';
  secondarySort?: {
    field: ConflictSortField;
    direction: 'asc' | 'desc';
  };
}

export enum ConflictSortField {
  DETECTED_AT = 'detectedAt',
  SEVERITY = 'severity',
  TYPE = 'type',
  STATUS = 'status',
  AFFECTED_USERS = 'affectedUsers',
  IMPACT_SCORE = 'impactScore'
}

export interface ConflictUIState {
  loading: boolean;
  analyzing: boolean;
  selectedConflictId?: string;
  showResolutionDialog: boolean;
  showBulkOperationsPanel: boolean;
  conflictDetailsExpanded: Record<string, boolean>;
  filterPanelOpen: boolean;
  lastRefresh?: string;
}

// Real-time conflict monitoring
export interface ConflictMonitoringConfig {
  enabled: boolean;
  checkInterval: number; // minutes
  autoResolveEnabled: boolean;
  notificationSettings: ConflictNotificationSettings;
  escalationRules: ConflictEscalationRule[];
}

export interface ConflictNotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  slackEnabled: boolean;
  severityThreshold: ConflictSeverity;
  recipients: string[];
  templates: Record<ConflictType, string>;
}

export interface ConflictEscalationRule {
  id: string;
  name: string;
  condition: EscalationCondition;
  action: EscalationAction;
  enabled: boolean;
  priority: number;
}

export interface EscalationCondition {
  severity?: ConflictSeverity[];
  type?: ConflictType[];
  unresolvedDuration?: number; // minutes
  affectedUsersThreshold?: number;
  businessImpactLevel?: ImpactLevel;
}

export interface EscalationAction {
  type: 'notify' | 'auto_resolve' | 'escalate_to_admin' | 'create_ticket';
  recipients?: string[];
  template?: string;
  autoResolutionStrategy?: ResolutionStrategy;
  ticketPriority?: 'low' | 'medium' | 'high' | 'urgent';
}

// Conflict history and reporting
export interface ConflictHistoryEntry {
  id: string;
  conflictId: string;
  action: ConflictAction;
  performedBy: string;
  performedAt: string;
  details: unknown;
  previousState?: unknown;
  newState?: unknown;
}

export enum ConflictAction {
  DETECTED = 'detected',
  ANALYZED = 'analyzed',
  RESOLUTION_ATTEMPTED = 'resolution_attempted',
  RESOLVED = 'resolved',
  IGNORED = 'ignored',
  ESCALATED = 'escalated',
  ROLLED_BACK = 'rolled_back',
  COMMENTS_ADDED = 'comments_added'
}

export interface ConflictReport {
  id: string;
  title: string;
  period: {
    start: string;
    end: string;
  };
  metrics: ConflictMetrics;
  trends: ConflictTrend[];
  topConflictTypes: Array<{
    type: ConflictType;
    count: number;
    percentage: number;
  }>;
  resolutionEffectiveness: ResolutionEffectivenessMetrics;
  recommendations: string[];
  generatedAt: string;
}

export interface ConflictMetrics {
  totalConflicts: number;
  resolvedConflicts: number;
  unresolvedConflicts: number;
  averageResolutionTime: number; // minutes
  autoResolutionRate: number;
  escalationRate: number;
  conflictsByType: Record<ConflictType, number>;
  conflictsBySeverity: Record<ConflictSeverity, number>;
}

export interface ConflictTrend {
  date: string;
  totalConflicts: number;
  resolvedConflicts: number;
  averageResolutionTime: number;
  topConflictType: ConflictType;
}

export interface ResolutionEffectivenessMetrics {
  strategySuccessRates: Record<ResolutionStrategy, {
    attempts: number;
    successes: number;
    rate: number;
  }>;
  averageTimeToResolution: Record<ConflictType, number>;
  rollbackRate: number;
  userSatisfactionScore?: number;
}

// Export collection for convenience
export type ConflictManagement = {
  conflicts: ScheduleConflict[];
  operations: BulkConflictOperation[];
  state: ConflictManagementState;
  config: ConflictMonitoringConfig;
  history: ConflictHistoryEntry[];
};