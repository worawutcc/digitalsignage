import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { mediaApi } from '@/services/api/mediaApi'

// Mock data
const mockMediaFiles = [
  {
    id: '1',
    filename: 'sample-video.mp4',
    originalName: 'Sample Video.mp4',
    mimeType: 'video/mp4',
    size: 15728640, // 15MB in bytes
    duration: 120, // 2 minutes in seconds
    width: 1920,
    height: 1080,
    s3Key: 'media/12345/sample-video.mp4',
    s3Url: 'https://bucket.s3.amazonaws.com/media/12345/sample-video.mp4',
    thumbnailUrl: 'https://bucket.s3.amazonaws.com/thumbnails/12345/sample-video-thumb.jpg',
    uploadedBy: 'user-1',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    filename: 'image-banner.jpg',
    originalName: 'Marketing Banner.jpg',
    mimeType: 'image/jpeg',
    size: 2048000, // 2MB in bytes
    duration: null,
    width: 1920,
    height: 1080,
    s3Key: 'media/67890/image-banner.jpg',
    s3Url: 'https://bucket.s3.amazonaws.com/media/67890/image-banner.jpg',
    thumbnailUrl: 'https://bucket.s3.amazonaws.com/thumbnails/67890/image-banner-thumb.jpg',
    uploadedBy: 'user-2',
    createdAt: '2024-01-14T15:20:00Z',
    updatedAt: '2024-01-14T15:20:00Z',
  },
]

const mockUploadResponse = {
  id: '3',
  filename: 'new-upload.mp4',
  originalName: 'New Upload.mp4',
  mimeType: 'video/mp4',
  size: 20971520, // 20MB
  s3Key: 'media/new-id/new-upload.mp4',
  uploadUrl: 'https://presigned-upload-url.com',
  uploadId: 'upload-123',
}

const mockPresignedUrlResponse = {
  url: 'https://presigned-download-url.com/media/12345/sample-video.mp4',
  expiresAt: '2024-01-15T11:30:00Z',
}

// Mock server handlers
const handlers = [
  // Get all media files
  rest.get('/api/media', (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page') || '1')
    const pageSize = parseInt(req.url.searchParams.get('pageSize') || '10')
    const search = req.url.searchParams.get('search')
    const mimeType = req.url.searchParams.get('mimeType')
    const uploadedBy = req.url.searchParams.get('uploadedBy')

    let filteredMedia = [...mockMediaFiles]

    if (search) {
      filteredMedia = filteredMedia.filter(media =>
        media.originalName.toLowerCase().includes(search.toLowerCase()) ||
        media.filename.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (mimeType) {
      filteredMedia = filteredMedia.filter(media => media.mimeType.includes(mimeType))
    }

    if (uploadedBy) {
      filteredMedia = filteredMedia.filter(media => media.uploadedBy === uploadedBy)
    }

    const total = filteredMedia.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedMedia = filteredMedia.slice(startIndex, endIndex)

    return res(
      ctx.json({
        media: paginatedMedia,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      })
    )
  }),

  // Get media file by ID
  rest.get('/api/media/:id', (req, res, ctx) => {
    const { id } = req.params
    const media = mockMediaFiles.find(m => m.id === id)

    if (!media) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Media file not found' })
      )
    }

    return res(ctx.json(media))
  }),

  // Upload media file - initiate upload
  rest.post('/api/media/upload', (req, res, ctx) => {
    const body = req.body as any
    
    // Validate file data
    if (!body.filename || !body.mimeType || !body.size) {
      return res(
        ctx.status(400),
        ctx.json({
          message: 'Validation failed',
          errors: {
            filename: body.filename ? null : ['Filename is required'],
            mimeType: body.mimeType ? null : ['MIME type is required'],
            size: body.size ? null : ['File size is required'],
          },
        })
      )
    }

    // Simulate file size limit (50MB)
    if (body.size > 50 * 1024 * 1024) {
      return res(
        ctx.status(413),
        ctx.json({ message: 'File too large. Maximum size is 50MB' })
      )
    }

    // Check supported file types
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov']
    if (!supportedTypes.includes(body.mimeType)) {
      return res(
        ctx.status(415),
        ctx.json({ message: 'Unsupported file type' })
      )
    }

    return res(
      ctx.status(201),
      ctx.json(mockUploadResponse)
    )
  }),

  // Confirm upload completion
  rest.post('/api/media/:id/upload-complete', (req, res, ctx) => {
    const { id } = req.params
    
    if (id !== '3') {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Upload not found' })
      )
    }

    const completedMedia = {
      ...mockUploadResponse,
      s3Url: 'https://bucket.s3.amazonaws.com/media/new-id/new-upload.mp4',
      thumbnailUrl: 'https://bucket.s3.amazonaws.com/thumbnails/new-id/new-upload-thumb.jpg',
      uploadUrl: undefined, // Remove upload URL after completion
      uploadId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return res(ctx.json(completedMedia))
  }),

  // Get presigned download URL
  rest.get('/api/media/:id/presigned-url', (req, res, ctx) => {
    const { id } = req.params
    const media = mockMediaFiles.find(m => m.id === id)

    if (!media) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Media file not found' })
      )
    }

    return res(ctx.json(mockPresignedUrlResponse))
  }),

  // Update media metadata
  rest.put('/api/media/:id', (req, res, ctx) => {
    const { id } = req.params
    const media = mockMediaFiles.find(m => m.id === id)

    if (!media) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Media file not found' })
      )
    }

    const updatedMedia = {
      ...media,
      ...req.body,
      updatedAt: new Date().toISOString(),
    }

    return res(ctx.json(updatedMedia))
  }),

  // Delete media file
  rest.delete('/api/media/:id', (req, res, ctx) => {
    const { id } = req.params
    const media = mockMediaFiles.find(m => m.id === id)

    if (!media) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Media file not found' })
      )
    }

    return res(ctx.status(204))
  }),

  // Get media usage/references
  rest.get('/api/media/:id/usage', (req, res, ctx) => {
    const { id } = req.params
    const media = mockMediaFiles.find(m => m.id === id)

    if (!media) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Media file not found' })
      )
    }

    const mockUsage = {
      schedules: [
        { id: '1', name: 'Main Hall Schedule' },
        { id: '2', name: 'Lobby Schedule' },
      ],
      playlists: [
        { id: '1', name: 'Marketing Content' },
      ],
      totalReferences: 3,
    }

    return res(ctx.json(mockUsage))
  }),

  // Bulk delete media files
  rest.post('/api/media/bulk-delete', (req, res, ctx) => {
    const { mediaIds } = req.body as any

    if (!mediaIds || !Array.isArray(mediaIds)) {
      return res(
        ctx.status(400),
        ctx.json({ message: 'Invalid media IDs provided' })
      )
    }

    const results = mediaIds.map((id: string) => {
      const media = mockMediaFiles.find(m => m.id === id)
      return {
        id,
        success: !!media,
        error: media ? null : 'Media file not found',
      }
    })

    return res(ctx.json({ results }))
  }),

  // Error simulation endpoints
  rest.get('/api/media/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ message: 'Internal server error' })
    )
  }),

  rest.get('/api/media/network-error', (req, res, ctx) => {
    return res.networkError('Network error')
  }),
]

// Setup server
const server = setupServer(...handlers)

describe('Media API Integration Tests', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  describe('GET /api/media', () => {
    it('should fetch media files successfully', async () => {
      const result = await mediaApi.getMediaFiles()

      expect(result.media).toHaveLength(2)
      expect(result.media[0]).toMatchObject({
        id: '1',
        filename: 'sample-video.mp4',
        mimeType: 'video/mp4',
      })
      expect(result.pagination).toMatchObject({
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      })
    })

    it('should fetch media files with pagination', async () => {
      const result = await mediaApi.getMediaFiles({ page: 1, pageSize: 1 })

      expect(result.media).toHaveLength(1)
      expect(result.pagination).toMatchObject({
        page: 1,
        pageSize: 1,
        total: 2,
        totalPages: 2,
      })
    })

    it('should filter media files by search term', async () => {
      const result = await mediaApi.getMediaFiles({ search: 'sample' })

      expect(result.media).toHaveLength(1)
      expect(result.media[0].filename).toBe('sample-video.mp4')
    })

    it('should filter media files by MIME type', async () => {
      const result = await mediaApi.getMediaFiles({ mimeType: 'video' })

      expect(result.media).toHaveLength(1)
      expect(result.media[0].mimeType).toBe('video/mp4')
    })

    it('should filter media files by uploader', async () => {
      const result = await mediaApi.getMediaFiles({ uploadedBy: 'user-1' })

      expect(result.media).toHaveLength(1)
      expect(result.media[0].uploadedBy).toBe('user-1')
    })
  })

  describe('GET /api/media/:id', () => {
    it('should fetch media file by ID successfully', async () => {
      const media = await mediaApi.getMediaFile('1')

      expect(media).toMatchObject({
        id: '1',
        filename: 'sample-video.mp4',
        mimeType: 'video/mp4',
        size: 15728640,
      })
    })

    it('should throw error for non-existent media file', async () => {
      await expect(mediaApi.getMediaFile('999')).rejects.toThrow('Media file not found')
    })
  })

  describe('POST /api/media/upload', () => {
    it('should initiate media upload successfully', async () => {
      const uploadData = {
        filename: 'test-video.mp4',
        originalName: 'Test Video.mp4',
        mimeType: 'video/mp4',
        size: 20971520,
      }

      const result = await mediaApi.initiateUpload(uploadData)

      expect(result).toMatchObject({
        id: '3',
        filename: 'new-upload.mp4',
        uploadUrl: expect.any(String),
        uploadId: expect.any(String),
      })
    })

    it('should handle validation errors', async () => {
      await expect(
        mediaApi.initiateUpload({} as any)
      ).rejects.toThrow('Validation failed')
    })

    it('should reject files that are too large', async () => {
      const largeFileData = {
        filename: 'large-file.mp4',
        mimeType: 'video/mp4',
        size: 60 * 1024 * 1024, // 60MB
      }

      await expect(
        mediaApi.initiateUpload(largeFileData)
      ).rejects.toThrow('File too large')
    })

    it('should reject unsupported file types', async () => {
      const unsupportedFileData = {
        filename: 'document.pdf',
        mimeType: 'application/pdf',
        size: 1024000,
      }

      await expect(
        mediaApi.initiateUpload(unsupportedFileData)
      ).rejects.toThrow('Unsupported file type')
    })
  })

  describe('POST /api/media/:id/upload-complete', () => {
    it('should confirm upload completion successfully', async () => {
      const result = await mediaApi.confirmUpload('3')

      expect(result).toMatchObject({
        id: '3',
        s3Url: expect.any(String),
        thumbnailUrl: expect.any(String),
      })
      expect(result.uploadUrl).toBeUndefined()
      expect(result.uploadId).toBeUndefined()
    })

    it('should throw error for non-existent upload', async () => {
      await expect(mediaApi.confirmUpload('999')).rejects.toThrow('Upload not found')
    })
  })

  describe('GET /api/media/:id/presigned-url', () => {
    it('should get presigned download URL successfully', async () => {
      const result = await mediaApi.getPresignedUrl('1')

      expect(result).toMatchObject({
        url: expect.any(String),
        expiresAt: expect.any(String),
      })
    })

    it('should throw error for non-existent media file', async () => {
      await expect(mediaApi.getPresignedUrl('999')).rejects.toThrow('Media file not found')
    })
  })

  describe('PUT /api/media/:id', () => {
    it('should update media metadata successfully', async () => {
      const updateData = {
        originalName: 'Updated Video Name.mp4',
      }

      const result = await mediaApi.updateMedia('1', updateData)

      expect(result).toMatchObject({
        id: '1',
        originalName: 'Updated Video Name.mp4',
        updatedAt: expect.any(String),
      })
    })

    it('should throw error for non-existent media file', async () => {
      await expect(
        mediaApi.updateMedia('999', { originalName: 'Test' })
      ).rejects.toThrow('Media file not found')
    })
  })

  describe('DELETE /api/media/:id', () => {
    it('should delete media file successfully', async () => {
      await expect(mediaApi.deleteMedia('1')).resolves.not.toThrow()
    })

    it('should throw error for non-existent media file', async () => {
      await expect(mediaApi.deleteMedia('999')).rejects.toThrow('Media file not found')
    })
  })

  describe('GET /api/media/:id/usage', () => {
    it('should get media usage information successfully', async () => {
      const usage = await mediaApi.getMediaUsage('1')

      expect(usage).toMatchObject({
        schedules: expect.any(Array),
        playlists: expect.any(Array),
        totalReferences: expect.any(Number),
      })
      expect(usage.schedules).toHaveLength(2)
      expect(usage.playlists).toHaveLength(1)
    })

    it('should throw error for non-existent media file', async () => {
      await expect(mediaApi.getMediaUsage('999')).rejects.toThrow('Media file not found')
    })
  })

  describe('POST /api/media/bulk-delete', () => {
    it('should perform bulk delete successfully', async () => {
      const mediaIds = ['1', '2']
      const result = await mediaApi.bulkDeleteMedia(mediaIds)

      expect(result.results).toHaveLength(2)
      expect(result.results[0]).toMatchObject({
        id: '1',
        success: true,
        error: null,
      })
    })

    it('should handle mixed success/failure results', async () => {
      const mediaIds = ['1', '999']
      const result = await mediaApi.bulkDeleteMedia(mediaIds)

      expect(result.results).toHaveLength(2)
      expect(result.results[0].success).toBe(true)
      expect(result.results[1].success).toBe(false)
      expect(result.results[1].error).toBe('Media file not found')
    })

    it('should handle invalid request data', async () => {
      await expect(mediaApi.bulkDeleteMedia(null as any)).rejects.toThrow('Invalid media IDs')
    })
  })

  describe('Error Handling', () => {
    it('should handle server errors', async () => {
      await expect(mediaApi.getMediaFile('error')).rejects.toThrow('Internal server error')
    })

    it('should handle network errors', async () => {
      await expect(mediaApi.getMediaFile('network-error')).rejects.toThrow('Network error')
    })

    it('should handle timeout errors', async () => {
      server.use(
        rest.get('/api/media/:id', (req, res, ctx) => {
          return res(ctx.delay(10000)) // Simulate timeout
        })
      )

      await expect(mediaApi.getMediaFile('1')).rejects.toThrow(/timeout/i)
    }, 6000)
  })

  describe('File Upload Flow', () => {
    it('should handle complete upload flow', async () => {
      // 1. Initiate upload
      const uploadData = {
        filename: 'test-upload.mp4',
        originalName: 'Test Upload.mp4',
        mimeType: 'video/mp4',
        size: 10485760, // 10MB
      }

      const initiateResult = await mediaApi.initiateUpload(uploadData)
      expect(initiateResult.uploadUrl).toBeDefined()
      expect(initiateResult.uploadId).toBeDefined()

      // 2. Simulate file upload to S3 (this would happen client-side)
      // In real implementation, you'd upload to the presigned URL

      // 3. Confirm upload completion
      const completedMedia = await mediaApi.confirmUpload(initiateResult.id)
      expect(completedMedia.s3Url).toBeDefined()
      expect(completedMedia.thumbnailUrl).toBeDefined()
      expect(completedMedia.uploadUrl).toBeUndefined()
    })
  })

  describe('Content Validation', () => {
    it('should validate video file properties', async () => {
      const videoData = {
        filename: 'video.mp4',
        mimeType: 'video/mp4',
        size: 15728640,
        duration: 120,
        width: 1920,
        height: 1080,
      }

      const result = await mediaApi.initiateUpload(videoData)
      expect(result).toBeDefined()
    })

    it('should validate image file properties', async () => {
      const imageData = {
        filename: 'image.jpg',
        mimeType: 'image/jpeg',
        size: 2048000,
        width: 1920,
        height: 1080,
      }

      const result = await mediaApi.initiateUpload(imageData)
      expect(result).toBeDefined()
    })
  })
})