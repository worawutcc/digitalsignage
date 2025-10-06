/**
 * Mock Playlist Service
 * Temporary mock data service until backend endpoints are implemented
 */

export interface PlaylistItem {
  id: string
  name: string
  description?: string
  mediaItems: string[] // Media IDs
  duration: number // Total duration in seconds
  isActive: boolean
  createdAt: string
  updatedAt: string
  tags?: string[]
  scheduleCount: number
}

/**
 * Mock playlist data
 */
const mockPlaylists: PlaylistItem[] = [
  {
    id: '1',
    name: 'Welcome Playlist',
    description: 'Main welcome content for visitors',
    mediaItems: ['1', '2', '6'],
    duration: 180,
    isActive: true,
    createdAt: '2025-01-07T00:00:00Z',
    updatedAt: '2025-01-07T00:00:00Z',
    tags: ['welcome', 'main'],
    scheduleCount: 3
  },
  {
    id: '2',
    name: 'Product Showcase',
    description: 'Latest product demonstrations',
    mediaItems: ['3', '2'],
    duration: 135,
    isActive: true,
    createdAt: '2025-01-06T00:00:00Z',
    updatedAt: '2025-01-06T00:00:00Z',
    tags: ['product', 'demo'],
    scheduleCount: 2
  },
  {
    id: '3',
    name: 'Emergency Alerts',
    description: 'Emergency and important announcements',
    mediaItems: ['5'],
    duration: 30,
    isActive: false,
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
    tags: ['emergency', 'alert'],
    scheduleCount: 0
  },
  {
    id: '4',
    name: 'Holiday Special',
    description: 'Holiday themed content',
    mediaItems: ['4', '6'],
    duration: 75,
    isActive: true,
    createdAt: '2025-01-04T00:00:00Z',
    updatedAt: '2025-01-04T00:00:00Z',
    tags: ['holiday', 'seasonal'],
    scheduleCount: 1
  }
]

/**
 * Mock Playlist Service
 * Provides mock data until backend endpoints are implemented
 */
export class MockPlaylistService {
  /**
   * Get all playlists
   */
  static async getAll(): Promise<PlaylistItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...mockPlaylists]
  }

  /**
   * Get playlist by ID
   */
  static async getById(id: string): Promise<PlaylistItem> {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const playlist = mockPlaylists.find(p => p.id === id)
    if (!playlist) {
      throw new Error(`Playlist with ID ${id} not found`)
    }
    
    return playlist
  }

  /**
   * Create new playlist
   */
  static async create(data: Omit<PlaylistItem, 'id' | 'createdAt' | 'updatedAt' | 'scheduleCount'>): Promise<PlaylistItem> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const newPlaylist: PlaylistItem = {
      ...data,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scheduleCount: 0
    }
    
    mockPlaylists.unshift(newPlaylist)
    return newPlaylist
  }

  /**
   * Update playlist
   */
  static async update(id: string, updates: Partial<PlaylistItem>): Promise<PlaylistItem> {
    await new Promise(resolve => setTimeout(resolve, 350))
    
    const index = mockPlaylists.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error(`Playlist with ID ${id} not found`)
    }
    
    const updatedPlaylist: PlaylistItem = {
      ...mockPlaylists[index],
      ...updates,
      updatedAt: new Date().toISOString()
    } as PlaylistItem
    
    mockPlaylists[index] = updatedPlaylist
    return updatedPlaylist
  }

  /**
   * Delete playlist
   */
  static async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 250))
    
    const index = mockPlaylists.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error(`Playlist with ID ${id} not found`)
    }
    
    mockPlaylists.splice(index, 1)
  }

  /**
   * Search playlists
   */
  static async search(query: string): Promise<PlaylistItem[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const searchTerm = query.toLowerCase()
    return mockPlaylists.filter(playlist =>
      playlist.name.toLowerCase().includes(searchTerm) ||
      playlist.description?.toLowerCase().includes(searchTerm) ||
      playlist.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  /**
   * Get playlist statistics
   */
  static async getStats(): Promise<{
    totalPlaylists: number
    activePlaylists: number
    totalDuration: number
    averageDuration: number
  }> {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const activePlaylists = mockPlaylists.filter(p => p.isActive).length
    const totalDuration = mockPlaylists.reduce((sum, p) => sum + p.duration, 0)
    
    return {
      totalPlaylists: mockPlaylists.length,
      activePlaylists,
      totalDuration,
      averageDuration: totalDuration / mockPlaylists.length || 0
    }
  }
}

/**
 * Development flag to use mock service
 */
export const USE_MOCK_PLAYLIST_SERVICE = true