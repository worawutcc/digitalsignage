/**
 * Playlist Service
 * API service for Playlist CRUD operations
 * Matches backend PlaylistController endpoints
 */

import { apiClient } from '@/lib/api'
import {
  PlaylistDto,
  CreatePlaylistRequest,
  UpdatePlaylistRequest,
  PlaylistFilterOptions,
  PlaylistStatistics,
  PlaylistAssignmentSummary
} from '@/types/playlist'

/**
 * Playlist Service
 * Provides methods for interacting with the Playlist API
 */
export class PlaylistService {
  /**
   * Get assignment summary for a playlist
   */
  static async getAssignmentSummary(id: number): Promise<PlaylistAssignmentSummary> {
    const response = await apiClient.get<PlaylistAssignmentSummary>(`/api/playlist/${id}/assignment-summary`)
    return response.data
  }
  /**
   * Get all playlists
   */
  static async getAll(): Promise<PlaylistDto[]> {
    const response = await apiClient.get<PlaylistDto[]>('/api/playlist')
    return response.data
  }

  /**
   * Get playlists by user ID
   */
  static async getByUserId(userId: number): Promise<PlaylistDto[]> {
    const response = await apiClient.get<PlaylistDto[]>(`/api/playlist/user/${userId}`)
    return response.data
  }

  /**
   * Get a specific playlist by ID
   */
  static async getById(id: number): Promise<PlaylistDto> {
    const response = await apiClient.get<PlaylistDto>(`/api/playlist/${id}`)
    return response.data
  }

  /**
   * Create a new playlist
   */
  static async create(request: CreatePlaylistRequest, userId?: number): Promise<PlaylistDto> {
    const params = userId ? { userId } : {}
    const response = await apiClient.post<PlaylistDto>(
      '/api/playlist',
      request,
      { params }
    )
    return response.data
  }

  /**
   * Update an existing playlist
   */
  static async update(id: number, request: UpdatePlaylistRequest): Promise<PlaylistDto> {
    const response = await apiClient.put<PlaylistDto>(
      `/api/playlist/${id}`,
      request
    )
    return response.data
  }

  /**
   * Delete a playlist
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/playlist/${id}`)
  }

  /**
   * Activate a playlist
   */
  static async activate(id: number): Promise<void> {
    await apiClient.post(`/api/playlist/${id}/activate`)
  }

  /**
   * Deactivate a playlist
   */
  static async deactivate(id: number): Promise<void> {
    await apiClient.post(`/api/playlist/${id}/deactivate`)
  }

  /**
   * Duplicate a playlist
   */
  static async duplicate(id: number, newName?: string): Promise<PlaylistDto> {
    const response = await apiClient.post<PlaylistDto>(
      `/api/playlist/${id}/duplicate`,
      { newName }
    )
    return response.data
  }

  /**
   * Get playlists with filtering and sorting
   */
  static async getFiltered(options: PlaylistFilterOptions): Promise<PlaylistDto[]> {
    const playlists = await this.getAll()
    
    let filtered = playlists

    // Filter by status
    if (options.status && options.status.length > 0) {
      filtered = filtered.filter(p => options.status!.includes(p.status))
    }

    // Filter by search term
    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      )
    }

    // Filter by creator
    if (options.createdByUserId) {
      filtered = filtered.filter(p => p.createdByUserId === options.createdByUserId)
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
          case 'priority':
            aValue = a.priority
            bValue = b.priority
            break
          case 'totalDuration':
            aValue = a.totalDurationSeconds
            bValue = b.totalDurationSeconds
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
   * Get playlist statistics
   */
  static async getStatistics(): Promise<PlaylistStatistics> {
    const playlists = await this.getAll()

    return {
      totalPlaylists: playlists.length,
      activePlaylists: playlists.filter(p => p.status === 1).length, // Active
      draftPlaylists: playlists.filter(p => p.status === 0).length, // Draft
      scheduledPlaylists: playlists.filter(p => p.status === 2).length, // Scheduled
      archivedPlaylists: playlists.filter(p => p.status === 3).length, // Archived
      averageDuration: playlists.length > 0
        ? Math.round(playlists.reduce((sum, p) => sum + p.totalDurationSeconds, 0) / playlists.length)
        : 0,
      totalAssignedDevices: 0 // TODO: Implement when assignment API is available
    }
  }

  /**
   * Bulk delete playlists
   */
  static async bulkDelete(ids: number[]): Promise<void> {
    await Promise.all(ids.map(id => this.delete(id)))
  }

  /**
   * Bulk activate playlists
   */
  static async bulkActivate(ids: number[]): Promise<void> {
    await Promise.all(ids.map(id => this.activate(id)))
  }

  /**
   * Bulk deactivate playlists
   */
  static async bulkDeactivate(ids: number[]): Promise<void> {
    await Promise.all(ids.map(id => this.deactivate(id)))
  }

  /**
   * Export playlist configuration as JSON
   */
  static async exportPlaylist(id: number): Promise<string> {
    const playlist = await this.getById(id)
    return JSON.stringify(playlist, null, 2)
  }

  /**
   * Import playlist from JSON configuration
   */
  static async importPlaylist(jsonData: string, userId?: number): Promise<PlaylistDto> {
    const data = JSON.parse(jsonData) as CreatePlaylistRequest
    return this.create(data, userId)
  }

  /**
   * Validate playlist before creation/update
   */
  static validatePlaylist(request: CreatePlaylistRequest | UpdatePlaylistRequest): string[] {
    const errors: string[] = []

    if (!request.name || request.name.trim().length === 0) {
      errors.push('Playlist name is required')
    }

    if (request.name && request.name.length > 200) {
      errors.push('Playlist name must be 200 characters or less')
    }

    if (request.description && request.description.length > 1000) {
      errors.push('Description must be 1000 characters or less')
    }

    if ('priority' in request && request.priority !== undefined) {
      if (request.priority < 0 || request.priority > 100) {
        errors.push('Priority must be between 0 and 100')
      }
    }

    if ('loopCount' in request && request.loopCount !== undefined && request.loopCount !== null) {
      if (request.loopCount < 0) {
        errors.push('Loop count must be 0 or greater')
      }
    }

    if ('playlistItems' in request && request.playlistItems) {
      if (request.playlistItems.length === 0) {
        errors.push('Playlist must have at least one item')
      }

      request.playlistItems.forEach((item, index) => {
        if (!item.mediaId) {
          errors.push(`Item ${index + 1}: Media ID is required`)
        }
        if (item.durationSeconds < 1) {
          errors.push(`Item ${index + 1}: Duration must be at least 1 second`)
        }
        if (item.orderIndex < 1) {
          errors.push(`Item ${index + 1}: Order index must be at least 1`)
        }
        if (item.transitionDurationMs !== undefined && item.transitionDurationMs < 0) {
          errors.push(`Item ${index + 1}: Transition duration cannot be negative`)
        }
      })
    }

    return errors
  }
}

export default PlaylistService
