import { apiClient } from '@/lib/api'

export interface Tag {
  id: number
  name: string
  color?: string
  description?: string
  mediaCount: number
  createdAt: string
  updatedAt: string
}

export interface TagSearchParams {
  searchTerm?: string
  sortBy?: 'name' | 'mediaCount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface CreateTagRequest {
  name: string
  color?: string
  description?: string
}

export interface TagStatistics {
  totalTags: number
  averageMediaPerTag: number
  mostUsedTags: Array<{
    tag: Tag
    usageCount: number
  }>
  recentTags: Tag[]
  tagsByCategory: Array<{
    category: string
    count: number
    tags: Tag[]
  }>
}

/**
 * Tag service for API integration
 * Handles all tag-related API calls
 */
export class TagService {
  /**
   * Get all tags
   */
  static async getAll(): Promise<Tag[]> {
    const response = await apiClient.get('/api/tags')
    return response.data
  }

  /**
   * Get tag by ID
   */
  static async getById(id: number): Promise<Tag> {
    const response = await apiClient.get(`/api/tags/${id}`)
    return response.data
  }

  /**
   * Search tags
   */
  static async search(params: TagSearchParams): Promise<Tag[]> {
    const response = await apiClient.get('/api/tags/search', { params })
    return response.data
  }

  /**
   * Get popular tags
   */
  static async getPopular(limit: number = 10): Promise<Tag[]> {
    const response = await apiClient.get('/api/tags/popular', { params: { limit } })
    return response.data
  }

  /**
   * Get recent tags
   */
  static async getRecent(limit: number = 10): Promise<Tag[]> {
    const response = await apiClient.get('/api/tags/recent', { params: { limit } })
    return response.data
  }

  /**
   * Create new tag
   */
  static async create(tagData: CreateTagRequest): Promise<Tag> {
    const response = await apiClient.post('/api/tags', tagData)
    return response.data
  }

  /**
   * Update tag
   */
  static async update(id: number, updates: Partial<Tag>): Promise<Tag> {
    const response = await apiClient.put(`/api/tags/${id}`, updates)
    return response.data
  }

  /**
   * Delete tag
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/tags/${id}`)
  }

  /**
   * Bulk delete tags
   */
  static async bulkDelete(ids: number[]): Promise<void> {
    await apiClient.post('/api/tags/bulk-delete', { ids })
  }

  /**
   * Get tag statistics
   */
  static async getStatistics(): Promise<TagStatistics> {
    const response = await apiClient.get('/api/tags/statistics')
    return response.data
  }

  /**
   * Get media files by tag
   */
  static async getMediaByTag(tagId: number): Promise<Array<{
    id: number
    name: string
    fileName: string
    mediaType: string
    thumbnailUrl?: string
  }>> {
    const response = await apiClient.get(`/api/tags/${tagId}/media`)
    return response.data
  }

  /**
   * Merge tags
   */
  static async merge(sourceTagIds: number[], targetTagId: number): Promise<Tag> {
    const response = await apiClient.post('/api/tags/merge', {
      sourceTagIds,
      targetTagId
    })
    return response.data
  }

  /**
   * Get suggested tags for media
   */
  static async getSuggestions(mediaId: number): Promise<Tag[]> {
    const response = await apiClient.get(`/api/tags/suggestions/${mediaId}`)
    return response.data
  }

  /**
   * Get tag usage analytics
   */
  static async getUsageAnalytics(tagId: number): Promise<{
    usageOverTime: Array<{
      date: string
      count: number
    }>
    mediaBreakdown: Array<{
      mediaType: string
      count: number
    }>
    associatedTags: Array<{
      tag: Tag
      frequency: number
    }>
  }> {
    const response = await apiClient.get(`/api/tags/${tagId}/analytics`)
    return response.data
  }
}