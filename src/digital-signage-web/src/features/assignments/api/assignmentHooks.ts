/**
 * @fileoverview React Query Hooks for Assignment API
 * @description Custom hooks with caching, optimistic updates, and error handling
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { assignmentApi } from './assignmentClient';
import {
  AssignmentStatus,
  type Assignment,
  type AssignmentFilter,
  type AssignmentSort,
} from '../types/assignment.types';
import type {
  GetAssignmentsRequest,
  AssignmentListResponse,
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  UpdateAssignmentRequest,
  BulkCreateAssignmentRequest,
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

// ========================================================================
// Query Keys Factory
// ========================================================================

export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (params?: GetAssignmentsRequest) =>
    [...assignmentKeys.lists(), params] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...assignmentKeys.details(), id] as const,
  history: (id: number) => [...assignmentKeys.all, 'history', id] as const,
  analytics: (filters?: AssignmentFilter) =>
    [...assignmentKeys.all, 'analytics', filters] as const,
  deviceSummary: (deviceId: number) =>
    [...assignmentKeys.all, 'device-summary', deviceId] as const,
  active: () => [...assignmentKeys.all, 'active'] as const,
  emergency: () => [...assignmentKeys.all, 'emergency'] as const,
  search: (query: string) => [...assignmentKeys.all, 'search', query] as const,
};

// ========================================================================
// Query Hooks
// ========================================================================

/**
 * Get paginated assignments with filtering and sorting
 */
export function useAssignments(
  params?: GetAssignmentsRequest,
  options?: Omit<
    UseQueryOptions<AssignmentListResponse, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery(
    assignmentKeys.list(params),
    () => assignmentApi.getAssignments(params),
    {
      staleTime: 30000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes (v4 uses cacheTime not gcTime)
      ...options,
    }
  );
}

/**
 * Get single assignment by ID
 */
export function useAssignment(
  id: number,
  options?: Omit<
    UseQueryOptions<Assignment, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery(
    assignmentKeys.detail(id),
    () => assignmentApi.getAssignmentById(id),
    {
      staleTime: 60000, // 1 minute
      cacheTime: 10 * 60 * 1000, // 10 minutes (v4 uses cacheTime not gcTime)
      enabled: !!id && id > 0,
      ...options,
    }
  );
}

/**
 * Get assignment history/audit trail
 */
export function useAssignmentHistory(
  id: number,
  page = 1,
  pageSize = 20,
  options?: Omit<
    UseQueryOptions<AssignmentHistoryResponse, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery(
    assignmentKeys.history(id),
    () => assignmentApi.getAssignmentHistory(id, page, pageSize),
    {
      staleTime: 60000, // 1 minute
      enabled: !!id && id > 0,
      ...options,
    }
  );
}

/**
 * Get assignment analytics
 */
export function useAssignmentAnalytics(
  dateFrom?: string,
  dateTo?: string,
  options?: Omit<
    UseQueryOptions<AssignmentAnalytics, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery(
    assignmentKeys.analytics({ dateFrom, dateTo } as AssignmentFilter),
    () => assignmentApi.getAnalytics(dateFrom, dateTo),
    {
      staleTime: 60000, // 1 minute
      cacheTime: 5 * 60 * 1000,
      ...options,
    }
  );
}

/**
 * Get device assignment summary
 */
export function useDeviceAssignmentSummary(
  deviceId: number,
  options?: Omit<
    UseQueryOptions<DeviceAssignmentSummary, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery(
    assignmentKeys.deviceSummary(deviceId),
    () => assignmentApi.getDeviceAssignmentSummary(deviceId),
    {
      staleTime: 30000,
      enabled: !!deviceId && deviceId > 0,
      ...options,
    }
  );
}

/**
 * Get active assignments
 */
export function useActiveAssignments(
  options?: Omit<
    UseQueryOptions<AssignmentListResponse, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery(
    assignmentKeys.active(),
    () => assignmentApi.getAssignmentsByStatus(AssignmentStatus.Active),
    {
      staleTime: 20000, // 20 seconds (more frequent updates)
      refetchInterval: 30000, // Auto-refresh every 30 seconds
      ...options,
    }
  );
}

/**
 * Get emergency broadcasts
 */
export function useEmergencyBroadcasts(
  options?: Omit<
    UseQueryOptions<Assignment[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery(
    assignmentKeys.emergency(),
    () => assignmentApi.getEmergencyBroadcasts(),
    {
      staleTime: 10000, // 10 seconds (very fresh for emergencies)
      refetchInterval: 15000, // Auto-refresh every 15 seconds
      ...options,
    }
  );
}

/**
 * Search assignments
 */
export function useAssignmentSearch(
  query: string,
  params?: GetAssignmentsRequest,
  options?: Omit<
    UseQueryOptions<AssignmentListResponse, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery(
    assignmentKeys.search(query),
    () => assignmentApi.searchAssignments(query, params),
    {
      staleTime: 30000,
      enabled: query.length >= 2, // Only search with 2+ characters
      ...options,
    }
  );
}

// ========================================================================
// Mutation Hooks
// ========================================================================

/**
 * Create new assignment
 */
export function useCreateAssignment(
  options?: UseMutationOptions<
    CreateAssignmentResponse,
    Error,
    CreateAssignmentRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation(
    (request: CreateAssignmentRequest) => assignmentApi.createAssignment(request),
    {
      onSuccess: (data) => {
        // Invalidate assignment lists to refetch with new data
        queryClient.invalidateQueries(assignmentKeys.lists());
        queryClient.invalidateQueries(assignmentKeys.analytics());
        
        // Set the new assignment in cache
        queryClient.setQueryData(
          assignmentKeys.detail(data.assignment.id),
          data.assignment
        );
      },
      ...options,
    }
  );
}

/**
 * Update assignment
 */
export function useUpdateAssignment(
  options?: UseMutationOptions<
    Assignment,
    Error,
    { id: number; request: UpdateAssignmentRequest },
    { previousAssignment: Assignment | undefined }
  >
) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, request }: { id: number; request: UpdateAssignmentRequest }) =>
      assignmentApi.updateAssignment(id, request),
    {
      onMutate: async ({ id, request }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries(assignmentKeys.detail(id));

        // Snapshot previous value
        const previousAssignment = queryClient.getQueryData<Assignment>(
          assignmentKeys.detail(id)
        );

        // Optimistically update
        if (previousAssignment) {
          queryClient.setQueryData<Assignment>(
            assignmentKeys.detail(id),
            { ...previousAssignment, ...request }
          );
        }

        return { previousAssignment };
      },
      onError: (err, { id }, context) => {
        // Rollback on error
        if (context?.previousAssignment) {
          queryClient.setQueryData(
            assignmentKeys.detail(id),
            context.previousAssignment
          );
        }
      },
      onSuccess: (data, { id }) => {
        // Update cache with server response
        queryClient.setQueryData(assignmentKeys.detail(id), data);
        queryClient.invalidateQueries(assignmentKeys.lists());
        queryClient.invalidateQueries(assignmentKeys.analytics());
      },
      ...options,
    }
  );
}

/**
 * Delete assignment
 */
export function useDeleteAssignment(
  options?: UseMutationOptions<DeleteAssignmentResponse, Error, number>
) {
  const queryClient = useQueryClient();

  return useMutation(
    (id: number) => assignmentApi.deleteAssignment(id),
    {
      onSuccess: (_, id) => {
        // Remove from cache
        queryClient.removeQueries(assignmentKeys.detail(id));
        queryClient.invalidateQueries(assignmentKeys.lists());
        queryClient.invalidateQueries(assignmentKeys.analytics());
      },
      ...options,
    }
  );
}

/**
 * Update assignment status
 */
export function useUpdateAssignmentStatus(
  options?: UseMutationOptions<
    Assignment,
    Error,
    { id: number; request: UpdateAssignmentStatusRequest }
  >
) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, request }: { id: number; request: UpdateAssignmentStatusRequest }) =>
      assignmentApi.updateStatus(id, request),
    {
      onSuccess: (data, { id }) => {
        queryClient.setQueryData(assignmentKeys.detail(id), data);
        queryClient.invalidateQueries(assignmentKeys.lists());
        queryClient.invalidateQueries(assignmentKeys.active());
        queryClient.invalidateQueries(assignmentKeys.analytics());
      },
      ...options,
    }
  );
}

/**
 * Update assignment priority
 */
export function useUpdateAssignmentPriority(
  options?: UseMutationOptions<
    Assignment,
    Error,
    { id: number; request: UpdateAssignmentPriorityRequest }
  >
) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, request }: { id: number; request: UpdateAssignmentPriorityRequest }) =>
      assignmentApi.updatePriority(id, request),
    {
      onSuccess: (data, { id }) => {
        queryClient.setQueryData(assignmentKeys.detail(id), data);
        queryClient.invalidateQueries(assignmentKeys.lists());
      },
      ...options,
    }
  );
}

/**
 * Activate assignment
 */
export function useActivateAssignment(
  options?: UseMutationOptions<Assignment, Error, number>
) {
  const queryClient = useQueryClient();

  return useMutation(
    (id: number) => assignmentApi.activateAssignment(id),
    {
      onSuccess: (data, id) => {
        queryClient.setQueryData(assignmentKeys.detail(id), data);
        queryClient.invalidateQueries(assignmentKeys.lists());
        queryClient.invalidateQueries(assignmentKeys.active());
        queryClient.invalidateQueries(assignmentKeys.analytics());
      },
      ...options,
    }
  );
}

/**
 * Pause assignment
 */
export function usePauseAssignment(
  options?: UseMutationOptions<Assignment, Error, { id: number; reason?: string }>
) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, reason }: { id: number; reason?: string }) => assignmentApi.pauseAssignment(id, reason),
    {
      onSuccess: (data, { id }) => {
        queryClient.setQueryData(assignmentKeys.detail(id), data);
        queryClient.invalidateQueries(assignmentKeys.lists());
        queryClient.invalidateQueries(assignmentKeys.active());
      },
      ...options,
    }
  );
}

/**
 * Cancel assignment
 */
export function useCancelAssignment(
  options?: UseMutationOptions<Assignment, Error, { id: number; reason?: string }>
) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, reason }: { id: number; reason?: string }) => assignmentApi.cancelAssignment(id, reason),
    {
      onSuccess: (data, { id }) => {
        queryClient.setQueryData(assignmentKeys.detail(id), data);
        queryClient.invalidateQueries(assignmentKeys.lists());
        queryClient.invalidateQueries(assignmentKeys.active());
      },
      ...options,
    }
  );
}

// ========================================================================
// Bulk Operation Hooks
// ========================================================================

/**
 * Bulk create assignments
 */
export function useBulkCreateAssignments(
  options?: UseMutationOptions<
    BulkAssignmentResponse,
    Error,
    BulkCreateAssignmentRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation(
    (request: BulkCreateAssignmentRequest) => assignmentApi.createBulkAssignments(request),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(assignmentKeys.lists());
        queryClient.invalidateQueries(assignmentKeys.analytics());
      },
      ...options,
    }
  );
}

/**
 * Bulk activate assignments
 */
export function useBulkActivate(
  options?: UseMutationOptions<BulkAssignmentResponse, Error, number[]>
) {
  const queryClient = useQueryClient();

  return useMutation(
    (assignmentIds: number[]) => assignmentApi.bulkActivate(assignmentIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(assignmentKeys.lists());
        queryClient.invalidateQueries(assignmentKeys.active());
        queryClient.invalidateQueries(assignmentKeys.analytics());
      },
      ...options,
    }
  );
}

/**
 * Bulk pause assignments
 */
export function useBulkPause(
  options?: UseMutationOptions<
    BulkAssignmentResponse,
    Error,
    { assignmentIds: number[]; reason?: string }
  >
) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ assignmentIds, reason }: { assignmentIds: number[]; reason?: string }) =>
      assignmentApi.bulkPause(assignmentIds, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(assignmentKeys.lists());
        queryClient.invalidateQueries(assignmentKeys.active());
      },
      ...options,
    }
  );
}

/**
 * Bulk delete assignments
 */
export function useBulkDelete(
  options?: UseMutationOptions<
    BulkAssignmentResponse,
    Error,
    { assignmentIds: number[]; reason?: string }
  >
) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ assignmentIds, reason }: { assignmentIds: number[]; reason?: string }) =>
      assignmentApi.bulkDelete(assignmentIds, reason),
    {
      onSuccess: (_, { assignmentIds }) => {
        // Remove individual items from cache
        assignmentIds.forEach((id) => {
          queryClient.removeQueries(assignmentKeys.detail(id));
        });
        queryClient.invalidateQueries(assignmentKeys.lists());
        queryClient.invalidateQueries(assignmentKeys.analytics());
      },
      ...options,
    }
  );
}

/**
 * Bulk update priority
 */
export function useBulkUpdatePriority(
  options?: UseMutationOptions<
    BulkAssignmentResponse,
    Error,
    { assignmentIds: number[]; priority: number; resolveConflicts?: boolean }
  >
) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ assignmentIds, priority, resolveConflicts }: { assignmentIds: number[]; priority: number; resolveConflicts?: boolean }) =>
      assignmentApi.bulkUpdatePriority(assignmentIds, priority, resolveConflicts),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(assignmentKeys.lists());
      },
      ...options,
    }
  );
}

// ========================================================================
// Validation & Utility Hooks
// ========================================================================

/**
 * Validate assignment
 */
export function useValidateAssignment(
  options?: UseMutationOptions<
    AssignmentValidationResult,
    Error,
    CreateAssignmentRequest
  >
) {
  return useMutation(
    (request: CreateAssignmentRequest) => assignmentApi.validateAssignment(request),
    options
  );
}

/**
 * Check assignment conflicts
 */
export function useCheckConflicts(
  id: number,
  options?: Omit<
    UseQueryOptions<AssignmentValidationResult, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery(
    [...assignmentKeys.detail(id), 'conflicts'],
    () => assignmentApi.checkConflicts(id),
    {
      enabled: !!id && id > 0,
      staleTime: 30000,
      ...options,
    }
  );
}

/**
 * Duplicate assignment
 */
export function useDuplicateAssignment(
  options?: UseMutationOptions<
    Assignment,
    Error,
    { id: number; overrides?: Partial<CreateAssignmentRequest> }
  >
) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, overrides }: { id: number; overrides?: Partial<CreateAssignmentRequest> }) =>
      assignmentApi.duplicateAssignment(id, overrides),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(assignmentKeys.detail(data.id), data);
        queryClient.invalidateQueries(assignmentKeys.lists());
      },
      ...options,
    }
  );
}

// ========================================================================
// Import/Export Hooks
// ========================================================================

/**
 * Export assignments
 */
export function useExportAssignments(
  options?: UseMutationOptions<Blob, Error, ExportAssignmentsOptions>
) {
  return useMutation(
    (exportOptions: ExportAssignmentsOptions) => assignmentApi.exportAssignments(exportOptions),
    options
  );
}

/**
 * Import assignments
 */
export function useImportAssignments(
  options?: UseMutationOptions<
    ImportAssignmentsResult,
    Error,
    { file: File; options: ImportAssignmentsOptions }
  >
) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ file, options: importOptions }: { file: File; options: ImportAssignmentsOptions }) =>
      assignmentApi.importAssignments(file, importOptions),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(assignmentKeys.lists());
        queryClient.invalidateQueries(assignmentKeys.analytics());
      },
      ...options,
    }
  );
}
