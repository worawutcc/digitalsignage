/**
 * Mock Media Service
 * Temporary mock data service until backend endpoints are implemented
 */

export interface MediaItem {
  id: string
  name: string
  type: 'image' | 'video' | 'text' | 'audio'
  size: number
  url: string
  thumbnailUrl?: string
  duration?: number
  createdAt: string
  updatedAt: string
  tags?: string[]
  status: 'active' | 'processing' | 'error'
}

/**
 * Mock media data
 */
const mockMediaItems: MediaItem[] = [
  {
    id: '1',
    name: 'company-logo.png',
    type: 'image',
    size: 156000, // 156KB
    url: 'https://via.placeholder.com/300x200/0ea5e9/ffffff?text=Company+Logo',
    thumbnailUrl: 'https://via.placeholder.com/150x100/0ea5e9/ffffff?text=Logo',
    createdAt: '2025-01-07T00:00:00Z',
    updatedAt: '2025-01-07T00:00:00Z',
    tags: ['logo', 'branding'],
    status: 'active'
  },
  {
    id: '2',
    name: 'promo-video.mp4',
    type: 'video',
    size: 25600000, // 25.6MB
    url: 'https://via.placeholder.com/640x360/10b981/ffffff?text=Promo+Video',
    thumbnailUrl: 'https://via.placeholder.com/150x100/10b981/ffffff?text=Video',
    duration: 90, // 1:30
    createdAt: '2025-01-06T00:00:00Z',
    updatedAt: '2025-01-06T00:00:00Z',
    tags: ['promotion', 'marketing'],
    status: 'active'
  },
  {
    id: '3',
    name: 'product-showcase.png',
    type: 'image', 
    size: 450000, // 450KB
    url: 'https://via.placeholder.com/800x600/f59e0b/000000?text=Product+Showcase',
    thumbnailUrl: 'https://via.placeholder.com/150x100/f59e0b/000000?text=Product',
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
    tags: ['product', 'showcase'],
    status: 'active'
  },
  {
    id: '4',
    name: 'holiday-announcement.mp4',
    type: 'video',
    size: 15200000, // 15.2MB
    url: 'https://via.placeholder.com/640x360/dc2626/ffffff?text=Holiday+Video',
    thumbnailUrl: 'https://via.placeholder.com/150x100/dc2626/ffffff?text=Holiday',
    duration: 45,
    createdAt: '2025-01-04T00:00:00Z',
    updatedAt: '2025-01-04T00:00:00Z',
    tags: ['holiday', 'announcement'],
    status: 'processing'
  },
  {
    id: '5',
    name: 'emergency-alert.png',
    type: 'image',
    size: 89000, // 89KB
    url: 'https://via.placeholder.com/400x300/ef4444/ffffff?text=Emergency+Alert',
    thumbnailUrl: 'https://via.placeholder.com/150x100/ef4444/ffffff?text=Alert',
    createdAt: '2025-01-03T00:00:00Z',
    updatedAt: '2025-01-03T00:00:00Z',
    tags: ['emergency', 'alert'],
    status: 'active'
  },
  {
    id: '6',
    name: 'welcome-message.png',
    type: 'image',
    size: 234000, // 234KB
    url: 'https://via.placeholder.com/600x400/8b5cf6/ffffff?text=Welcome',
    thumbnailUrl: 'https://via.placeholder.com/150x100/8b5cf6/ffffff?text=Welcome',
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
    tags: ['welcome', 'greeting'],
    status: 'active'
  }
]

/**
 * Mock Media Service
 * Provides mock data until backend endpoints are implemented
 */
export class MockMediaService {
  /**
   * Get all media items
   */
  static async getAll(): Promise<MediaItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...mockMediaItems]
  }

  /**
   * Get media by type
   */
  static async getByType(type: MediaItem['type']): Promise<MediaItem[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockMediaItems.filter(item => item.type === type)
  }

  /**
   * Get media by ID
   */
  static async getById(id: string): Promise<MediaItem> {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const item = mockMediaItems.find(item => item.id === id)
    if (!item) {
      throw new Error(`Media item with ID ${id} not found`)
    }
    
    return item
  }

  /**
   * Search media items
   */
  static async search(query: string): Promise<MediaItem[]> {
    await new Promise(resolve => setTimeout(resolve, 250))
    
    const searchTerm = query.toLowerCase()
    return mockMediaItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  /**
   * Upload media (mock)
   */
  static async upload(file: File): Promise<MediaItem> {
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate upload time
    
    const newItem: MediaItem = {
      id: String(Date.now()),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 
            file.type.startsWith('audio/') ? 'audio' : 'text',
      size: file.size,
      url: URL.createObjectURL(file),
      thumbnailUrl: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'processing'
    }
    
    mockMediaItems.unshift(newItem)
    
    // Simulate processing completion after 2 seconds
    setTimeout(() => {
      const item = mockMediaItems.find(i => i.id === newItem.id)
      if (item) {
        item.status = 'active'
      }
    }, 2000)
    
    return newItem
  }

  /**
   * Delete media (mock)
   */
  static async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = mockMediaItems.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error(`Media item with ID ${id} not found`)
    }
    
    mockMediaItems.splice(index, 1)
  }

  /**
   * Update media (mock)
   */
  static async update(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = mockMediaItems.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error(`Media item with ID ${id} not found`)
    }
    
    const updatedItem: MediaItem = {
      ...mockMediaItems[index],
      ...updates,
      updatedAt: new Date().toISOString()
    } as MediaItem
    
    mockMediaItems[index] = updatedItem
    
    return updatedItem
  }

  /**
   * Get media statistics
   */
  static async getStats(): Promise<{
    totalFiles: number
    totalSize: number
    byType: Record<string, number>
  }> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const totalSize = mockMediaItems.reduce((sum, item) => sum + item.size, 0)
    const byType = mockMediaItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalFiles: mockMediaItems.length,
      totalSize,
      byType
    }
  }
}

/**
 * Development flag to use mock service
 */
export const USE_MOCK_MEDIA_SERVICE = true