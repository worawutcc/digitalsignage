/**
 * Device Registration Service
 * 
 * API client for admin device registration management operations.
 * Handles pending registrations approval/rejection workflow.
 */

import { apiClient } from '@/lib/api'
import type {
  PendingRegistration,
  ApprovalRequest,
  ApprovalResponse,
  GetPendingRegistrationsResponse,
  RejectionRequest,
  BulkApprovalRequest,
  BulkApprovalResponse,
  RegistrationStatistics,
  GetPendingRegistrationsRequest
} from '../types/deviceRegistration.js'

/**
 * Base API path for device registration endpoints
 */
const BASE_PATH = '/api/admin/device-registration'

/**
 * Device Registration Service
 * 
 * Provides methods for managing device registration approval workflow
 */
export const deviceRegistrationService = {
  /**
   * Get all pending device registrations awaiting admin approval
   * 
   * @returns Promise with pending registrations data
   * @throws ApiError on failure (401, 403, 500)
   */
  async getPendingRegistrations(): Promise<GetPendingRegistrationsResponse> {
    try {
      const response = await apiClient.get<GetPendingRegistrationsResponse>(
        `${BASE_PATH}/pending`
      )
      return response.data
    } catch (error: any) {
      // Enhanced error handling
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 401:
            throw new Error('Authentication required. Please log in.')
          case 403:
            throw new Error('You do not have permission to view pending registrations.')
          case 500:
            throw new Error('Server error while fetching pending registrations. Please try again.')
          default:
            throw new Error(data?.message || 'Failed to fetch pending registrations.')
        }
      }
      
      throw new Error('Network error. Please check your connection.')
    }
  },

  /**
   * Approve a device registration request
   * 
   * @param registrationId - Registration ID to approve
   * @param data - Approval data including device name, location, etc.
   * @returns Promise with approval response
   * @throws ApiError on failure (400, 401, 403, 404, 500)
   */
  async approveRegistration(
    registrationId: string,
    data: ApprovalRequest
  ): Promise<ApprovalResponse> {
    try {
      const response = await apiClient.post<ApprovalResponse>(
        `${BASE_PATH}/${registrationId}/approve`,
        data
      )
      
      return response.data
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 400:
            throw new Error(data?.message || 'Invalid approval request. Please check your input.')
          case 401:
            throw new Error('Authentication required. Please log in.')
          case 403:
            throw new Error('You do not have permission to approve device registrations.')
          case 404:
            throw new Error('Registration request not found.')
          case 500:
            throw new Error('Server error while approving registration. Please try again.')
          default:
            throw new Error(data?.message || 'Failed to approve registration.')
        }
      }
      
      throw new Error('Network error. Please check your connection.')
    }
  },

  /**
   * Reject a device registration request
   * 
   * @param registrationId - Registration ID to reject
   * @param reason - Rejection reason
   * @returns Promise with rejection response
   * @throws ApiError on failure (400, 401, 403, 404, 500)
   */
  async rejectRegistration(
    registrationId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        `${BASE_PATH}/${registrationId}/reject`,
        { reason }
      )
      
      return response.data
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 400:
            throw new Error(data?.message || 'Invalid rejection request. Please provide a reason.')
          case 401:
            throw new Error('Authentication required. Please log in.')
          case 403:
            throw new Error('You do not have permission to reject device registrations.')
          case 404:
            throw new Error('Registration request not found.')
          case 500:
            throw new Error('Server error while rejecting registration. Please try again.')
          default:
            throw new Error(data?.message || 'Failed to reject registration.')
        }
      }
      
      throw new Error('Network error. Please check your connection.')
    }
  },

  /**
   * Bulk approve multiple device registrations
   * 
   * @param registrationIds - Array of registration IDs to approve
   * @param data - Common approval data for all devices
   * @returns Promise with bulk approval response
   * @throws ApiError on failure (400, 401, 403, 500)
   */
  async bulkApproveRegistrations(
    registrationIds: string[],
    data: Omit<ApprovalRequest, 'registrationId'>
  ): Promise<{
    succeeded: number
    failed: number
    errors: Array<{ registrationId: string; error: string }>
  }> {
    try {
      const response = await apiClient.post<{
        succeeded: number
        failed: number
        errors: Array<{ registrationId: string; error: string }>
      }>(`${BASE_PATH}/bulk-approve`, {
        registrationIds,
        ...data
      })
      
      return response.data
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 400:
            throw new Error(data?.message || 'Invalid bulk approval request.')
          case 401:
            throw new Error('Authentication required. Please log in.')
          case 403:
            throw new Error('You do not have permission to approve device registrations.')
          case 500:
            throw new Error('Server error during bulk approval. Please try again.')
          default:
            throw new Error(data?.message || 'Failed to perform bulk approval.')
        }
      }
      
      throw new Error('Network error. Please check your connection.')
    }
  }
}

export default deviceRegistrationService