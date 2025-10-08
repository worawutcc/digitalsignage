/**
 * User Device Association Service
 * Connects to backend /api/user-device-associations endpoints (UserDeviceAssociationController)
 */
import { apiClient } from '@/lib/api';

/**
 * TypeScript interfaces matching backend DTOs
 */
export interface UserDeviceAssociationDto {
  id: string;
  userId: string;
  deviceId: string;
  associatedAt: string; // ISO 8601 date string
  associationType?: string;
  isActive: boolean;
}

export interface CreateUserDeviceAssociationRequest {
  userId: number;
  deviceId: number;
  associationType?: string;
}

export interface UpdateUserDeviceAssociationRequest {
  id: number;
  associationType?: string;
  isActive?: boolean;
}

export interface SearchUserDeviceAssociationRequest {
  userId?: number;
  deviceId?: number;
  associationType?: string;
  skip?: number;
  take?: number;
}

/**
 * User Device Association Service
 * Handles user-device relationship operations
 */
class UserDeviceAssociationService {
  private readonly basePath = '/api/user-device-associations';

  /**
   * GET /api/user-device-associations
   * Get all user-device associations
   */
  async getAll(): Promise<UserDeviceAssociationDto[]> {
    const response = await apiClient.get<UserDeviceAssociationDto[]>(this.basePath);
    return response.data;
  }

  /**
   * GET /api/user-device-associations/search
   * Search user-device associations with filters
   */
  async search(params: SearchUserDeviceAssociationRequest): Promise<UserDeviceAssociationDto[]> {
    const response = await apiClient.get<UserDeviceAssociationDto[]>(`${this.basePath}/search`, {
      params,
    });
    return response.data;
  }

  /**
   * GET /api/user-device-associations/{id}
   * Get a specific user-device association by ID
   */
  async getById(id: number): Promise<UserDeviceAssociationDto | null> {
    try {
      const response = await apiClient.get<UserDeviceAssociationDto>(`${this.basePath}/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * POST /api/user-device-associations
   * Create a new user-device association
   */
  async create(request: CreateUserDeviceAssociationRequest): Promise<UserDeviceAssociationDto> {
    const response = await apiClient.post<UserDeviceAssociationDto>(this.basePath, request);
    return response.data;
  }

  /**
   * POST /api/user-device-associations/bulk
   * Create multiple user-device associations at once
   */
  async bulkCreate(requests: CreateUserDeviceAssociationRequest[]): Promise<UserDeviceAssociationDto[]> {
    const response = await apiClient.post<UserDeviceAssociationDto[]>(`${this.basePath}/bulk`, requests);
    return response.data;
  }

  /**
   * PUT /api/user-device-associations/{id}
   * Update an existing user-device association
   */
  async update(id: number, request: UpdateUserDeviceAssociationRequest): Promise<void> {
    await apiClient.put(`${this.basePath}/${id}`, request);
  }

  /**
   * DELETE /api/user-device-associations/{id}
   * Delete a user-device association
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Helper Methods
   */

  /**
   * Get all associations for a specific user
   */
  async getByUserId(userId: number): Promise<UserDeviceAssociationDto[]> {
    return this.search({ userId });
  }

  /**
   * Get all associations for a specific device
   */
  async getByDeviceId(deviceId: number): Promise<UserDeviceAssociationDto[]> {
    return this.search({ deviceId });
  }

  /**
   * Get associations by type
   */
  async getByAssociationType(associationType: string): Promise<UserDeviceAssociationDto[]> {
    return this.search({ associationType });
  }

  /**
   * Check if a user is associated with a device
   */
  async isUserAssociatedWithDevice(userId: number, deviceId: number): Promise<boolean> {
    const associations = await this.search({ userId, deviceId });
    return associations.some((a) => a.isActive);
  }

  /**
   * Get active associations only
   */
  async getActiveAssociations(): Promise<UserDeviceAssociationDto[]> {
    const all = await this.getAll();
    return all.filter((a) => a.isActive);
  }

  /**
   * Activate an association
   */
  async activate(id: number): Promise<void> {
    await this.update(id, { id, isActive: true });
  }

  /**
   * Deactivate an association
   */
  async deactivate(id: number): Promise<void> {
    await this.update(id, { id, isActive: false });
  }

  /**
   * Get count of associations for a user
   */
  async getAssociationCountForUser(userId: number): Promise<number> {
    const associations = await this.getByUserId(userId);
    return associations.filter((a) => a.isActive).length;
  }

  /**
   * Get count of associations for a device
   */
  async getAssociationCountForDevice(deviceId: number): Promise<number> {
    const associations = await this.getByDeviceId(deviceId);
    return associations.filter((a) => a.isActive).length;
  }

  /**
   * Associate multiple devices to a user
   */
  async associateDevicesToUser(userId: number, deviceIds: number[], associationType?: string): Promise<UserDeviceAssociationDto[]> {
    const requests: CreateUserDeviceAssociationRequest[] = deviceIds.map((deviceId) => {
      const req: CreateUserDeviceAssociationRequest = {
        userId,
        deviceId,
      };
      if (associationType) {
        req.associationType = associationType;
      }
      return req;
    });
    return this.bulkCreate(requests);
  }

  /**
   * Associate multiple users to a device
   */
  async associateUsersToDevice(deviceId: number, userIds: number[], associationType?: string): Promise<UserDeviceAssociationDto[]> {
    const requests: CreateUserDeviceAssociationRequest[] = userIds.map((userId) => {
      const req: CreateUserDeviceAssociationRequest = {
        userId,
        deviceId,
      };
      if (associationType) {
        req.associationType = associationType;
      }
      return req;
    });
    return this.bulkCreate(requests);
  }

  /**
   * Remove all associations for a user
   */
  async removeAllForUser(userId: number): Promise<void> {
    const associations = await this.getByUserId(userId);
    await Promise.all(associations.map((a) => this.delete(parseInt(a.id))));
  }

  /**
   * Remove all associations for a device
   */
  async removeAllForDevice(deviceId: number): Promise<void> {
    const associations = await this.getByDeviceId(deviceId);
    await Promise.all(associations.map((a) => this.delete(parseInt(a.id))));
  }
}

// Export singleton instance
export const userDeviceAssociationService = new UserDeviceAssociationService();

// Export static methods for convenience
export const {
  getAll: getAllUserDeviceAssociations,
  search: searchUserDeviceAssociations,
  getById: getUserDeviceAssociationById,
  create: createUserDeviceAssociation,
  bulkCreate: bulkCreateUserDeviceAssociations,
  update: updateUserDeviceAssociation,
  delete: deleteUserDeviceAssociation,
  getByUserId: getUserDeviceAssociationsByUserId,
  getByDeviceId: getUserDeviceAssociationsByDeviceId,
  getByAssociationType: getUserDeviceAssociationsByType,
  isUserAssociatedWithDevice,
  getActiveAssociations: getActiveUserDeviceAssociations,
  activate: activateUserDeviceAssociation,
  deactivate: deactivateUserDeviceAssociation,
  getAssociationCountForUser,
  getAssociationCountForDevice,
  associateDevicesToUser,
  associateUsersToDevice,
  removeAllForUser: removeAllUserDeviceAssociationsForUser,
  removeAllForDevice: removeAllUserDeviceAssociationsForDevice,
} = userDeviceAssociationService;

export default userDeviceAssociationService;
