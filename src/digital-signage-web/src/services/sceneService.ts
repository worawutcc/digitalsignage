/**
 * Scene Service
 * API service for Scene CRUD operations
 * Matches backend SceneController endpoints
 */

import { apiClient } from '@/lib/api'
import {
  SceneDto,
  CreateSceneRequest,
  UpdateSceneRequest,
  SceneFilterOptions,
  SceneStatistics,
  SceneTemplate,
  SCENE_TEMPLATES
} from '@/types/scene'

/**
 * Scene Service
 * Provides methods for interacting with the Scene API
 */
export class SceneService {
  /**
   * Get all scenes
   */
  static async getAll(): Promise<SceneDto[]> {
    const response = await apiClient.get<SceneDto[]>('/api/scene')
    return response.data
  }

  /**
   * Get scenes by user ID
   */
  static async getByUserId(userId: number): Promise<SceneDto[]> {
    const response = await apiClient.get<SceneDto[]>(`/api/scene/user/${userId}`)
    return response.data
  }

  /**
   * Get a specific scene by ID
   */
  static async getById(id: number): Promise<SceneDto> {
    const response = await apiClient.get<SceneDto>(`/api/scene/${id}`)
    return response.data
  }

  /**
   * Get all scene templates
   */
  static async getTemplates(): Promise<SceneDto[]> {
    const response = await apiClient.get<SceneDto[]>('/api/scene/templates')
    return response.data
  }

  /**
   * Create a new scene
   */
  static async create(request: CreateSceneRequest, userId?: number): Promise<SceneDto> {
    const params = userId ? { userId } : {}
    const response = await apiClient.post<SceneDto>(
      '/api/scene',
      request,
      { params }
    )
    return response.data
  }

  /**
   * Update an existing scene
   */
  static async update(id: number, request: UpdateSceneRequest): Promise<SceneDto> {
    const response = await apiClient.put<SceneDto>(
      `/api/scene/${id}`,
      request
    )
    return response.data
  }

  /**
   * Delete a scene
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/scene/${id}`)
  }

  /**
   * Duplicate a scene
   */
  static async duplicate(id: number, newName?: string): Promise<SceneDto> {
    const response = await apiClient.post<SceneDto>(
      `/api/scene/${id}/duplicate`,
      { newName }
    )
    return response.data
  }

  /**
   * Convert scene to template
   */
  static async convertToTemplate(id: number, templateName: string): Promise<SceneDto> {
    const scene = await this.getById(id)
    const updateRequest: UpdateSceneRequest = {
      name: scene.name,
      description: scene.description,
      layoutType: scene.layoutType,
      width: scene.width,
      height: scene.height,
      backgroundColor: scene.backgroundColor,
      backgroundImageId: scene.backgroundImageId,
      isTemplate: true,
      templateName
    }
    return this.update(id, updateRequest)
  }

  /**
   * Get scenes with filtering and sorting
   */
  static async getFiltered(options: SceneFilterOptions): Promise<SceneDto[]> {
    const scenes = await this.getAll()
    
    let filtered = scenes

    // Filter by layout type
    if (options.layoutType && options.layoutType.length > 0) {
      filtered = filtered.filter(s => options.layoutType!.includes(s.layoutType))
    }

    // Filter by template status
    if (options.isTemplate !== undefined) {
      filtered = filtered.filter(s => s.isTemplate === options.isTemplate)
    }

    // Filter by search term
    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase()
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower) ||
        (s.templateName && s.templateName.toLowerCase().includes(searchLower))
      )
    }

    // Filter by creator
    if (options.createdByUserId) {
      filtered = filtered.filter(s => s.createdByUserId === options.createdByUserId)
    }

    // Sort
    if (options.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (options.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
            break
          case 'updatedAt':
            aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
            bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
            break
          case 'layoutType':
            aValue = a.layoutType
            bValue = b.layoutType
            break
          default:
            aValue = a.name
            bValue = b.name
        }

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        return options.sortOrder === 'desc' ? -comparison : comparison
      })
    }

    return filtered
  }

  /**
   * Get scene statistics
   */
  static async getStatistics(): Promise<SceneStatistics> {
    const scenes = await this.getAll()

    return {
      totalScenes: scenes.length,
      customScenes: scenes.filter(s => !s.isTemplate).length,
      templateScenes: scenes.filter(s => s.isTemplate).length,
      averageItems: scenes.length > 0
        ? Math.round(scenes.reduce((sum, s) => sum + s.totalItems, 0) / scenes.length)
        : 0,
      totalAssignedDevices: 0 // TODO: Implement when assignment API is available
    }
  }

  /**
   * Get predefined scene templates
   */
  static getPredefinedTemplates(): SceneTemplate[] {
    return SCENE_TEMPLATES
  }

  /**
   * Create scene from template
   */
  static async createFromTemplate(
    template: SceneTemplate,
    name: string,
    description?: string,
    userId?: number
  ): Promise<SceneDto> {
    const request: CreateSceneRequest = {
      name,
      description: description || template.description,
      layoutType: template.layoutType,
      width: template.width,
      height: template.height,
      isTemplate: false
    }

    return this.create(request, userId)
  }

  /**
   * Bulk delete scenes
   */
  static async bulkDelete(ids: number[]): Promise<void> {
    await Promise.all(ids.map(id => this.delete(id)))
  }

  /**
   * Export scene configuration as JSON
   */
  static async exportScene(id: number): Promise<string> {
    const scene = await this.getById(id)
    return JSON.stringify(scene, null, 2)
  }

  /**
   * Import scene from JSON configuration
   */
  static async importScene(jsonData: string, userId?: number): Promise<SceneDto> {
    const data = JSON.parse(jsonData) as CreateSceneRequest
    return this.create(data, userId)
  }

  /**
   * Validate scene before creation/update
   */
  static validateScene(request: CreateSceneRequest | UpdateSceneRequest): string[] {
    const errors: string[] = []

    if (!request.name || request.name.trim().length === 0) {
      errors.push('Scene name is required')
    }

    if (request.name && request.name.length > 200) {
      errors.push('Scene name must be 200 characters or less')
    }

    if (request.description && request.description.length > 1000) {
      errors.push('Description must be 1000 characters or less')
    }

    if ('width' in request && request.width !== undefined) {
      if (request.width < 1 || request.width > 7680) {
        errors.push('Width must be between 1 and 7680 pixels')
      }
    }

    if ('height' in request && request.height !== undefined) {
      if (request.height < 1 || request.height > 4320) {
        errors.push('Height must be between 1 and 4320 pixels')
      }
    }

    if ('backgroundColor' in request && request.backgroundColor) {
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
      if (!hexRegex.test(request.backgroundColor)) {
        errors.push('Background color must be a valid hex color')
      }
    }

    if ('isTemplate' in request && request.isTemplate) {
      if (!request.templateName || request.templateName.trim().length === 0) {
        errors.push('Template name is required for templates')
      }
      if (request.templateName && request.templateName.length > 100) {
        errors.push('Template name must be 100 characters or less')
      }
    }

    if ('sceneItems' in request && request.sceneItems) {
      request.sceneItems.forEach((item, index) => {
        if (!item.mediaId) {
          errors.push(`Item ${index + 1}: Media ID is required`)
        }
        if (item.width < 1) {
          errors.push(`Item ${index + 1}: Width must be at least 1 pixel`)
        }
        if (item.height < 1) {
          errors.push(`Item ${index + 1}: Height must be at least 1 pixel`)
        }
        if (item.durationSeconds < 1) {
          errors.push(`Item ${index + 1}: Duration must be at least 1 second`)
        }
        if (item.opacity !== undefined && (item.opacity < 0 || item.opacity > 1)) {
          errors.push(`Item ${index + 1}: Opacity must be between 0.0 and 1.0`)
        }
        if (item.rotation !== undefined && (item.rotation < -360 || item.rotation > 360)) {
          errors.push(`Item ${index + 1}: Rotation must be between -360 and 360 degrees`)
        }
        if (item.zIndex !== undefined && (item.zIndex < 0 || item.zIndex > 1000)) {
          errors.push(`Item ${index + 1}: Z-index must be between 0 and 1000`)
        }
      })
    }

    return errors
  }

  /**
   * Calculate total duration for a scene
   */
  static calculateSceneDuration(scene: SceneDto): number {
    if (scene.sceneItems.length === 0) return 0
    return Math.max(...scene.sceneItems.map(item => item.durationSeconds))
  }

  /**
   * Check if scene items overlap
   */
  static checkOverlap(scene: SceneDto): boolean {
    const items = scene.sceneItems

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const item1 = items[i]!
        const item2 = items[j]!

        // Check if rectangles overlap
        const overlap = !(
          item1.x + item1.width <= item2.x ||
          item2.x + item2.width <= item1.x ||
          item1.y + item1.height <= item2.y ||
          item2.y + item2.height <= item1.y
        )

        if (overlap) return true
      }
    }

    return false
  }
}

export default SceneService
