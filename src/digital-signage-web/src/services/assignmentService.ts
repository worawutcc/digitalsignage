import { apiClient } from '@/lib/api';
import type { Assignment } from '@/features/assignments/types';

export const assignmentService = {
  async getById(id: number): Promise<Assignment> {
    try {
      const response = await apiClient.get(`/api/admin/assignments/${id}`);
      console.log('📋 Assignment detail API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch assignment:', error);
      throw error;
    }
  },

  async getAll(): Promise<Assignment[]> {
    try {
      const response = await apiClient.get('/api/admin/assignments');
      console.log('📋 Assignments list API response:', response.data);
      
      // Handle paginated response
      if (response.data.items) {
        return response.data.items;
      }
      
      // Handle direct array response
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ Failed to fetch assignments:', error);
      return [];
    }
  },

  async create(assignment: Partial<Assignment>): Promise<Assignment> {
    try {
      const response = await apiClient.post('/api/admin/assignments', assignment);
      console.log('📋 Create assignment API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create assignment:', error);
      throw error;
    }
  },

  async update(id: number, assignment: Partial<Assignment>): Promise<Assignment> {
    try {
      const response = await apiClient.put(`/api/admin/assignments/${id}`, assignment);
      console.log('📋 Update assignment API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update assignment:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/admin/assignments/${id}`);
      console.log('📋 Assignment deleted successfully:', id);
    } catch (error) {
      console.error('❌ Failed to delete assignment:', error);
      throw error;
    }
  }
};