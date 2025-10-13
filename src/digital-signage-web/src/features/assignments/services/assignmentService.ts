import { apiClient } from '@/lib/api';
import { AssignmentDto, CreateAssignmentRequest } from '@/types';
import { AssignmentType, AssignmentStatus, AssignmentTargetType } from '../types/assignment.types';

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface AssignmentFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: string;
  type?: string;
  targetType?: string;
  priorityLevel?: number;
  startDateFrom?: string;
  startDateTo?: string;
}

class AssignmentService {
  private baseUrl = '/api/admin/assignments';

  async getAll(filters: AssignmentFilters = {}): Promise<PagedResult<AssignmentDto>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get<PagedResult<AssignmentDto>>(
      `${this.baseUrl}?${params.toString()}`
    );
    return response.data;
  }

  async getById(id: number): Promise<AssignmentDto> {
    const response = await apiClient.get<AssignmentDto>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(request: CreateAssignmentRequest): Promise<AssignmentDto> {
    const response = await apiClient.post<AssignmentDto>(this.baseUrl, request);
    return response.data;
  }

  async update(id: number, request: Partial<CreateAssignmentRequest>): Promise<AssignmentDto> {
    const response = await apiClient.put<AssignmentDto>(`${this.baseUrl}/${id}`, request);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async updateStatus(id: number, status: string, reason?: string): Promise<AssignmentDto> {
    const response = await apiClient.patch<AssignmentDto>(`${this.baseUrl}/${id}/status`, {
      status,
      reason
    });
    return response.data;
  }
}

export const assignmentService = new AssignmentService();