# Media Management UI - Developer Quick Reference

## Quick Start

### Using the Media Page
```typescript
// Navigate to media page
router.push('/media')

// The page automatically:
// - Loads all media files
// - Displays statistics
// - Enables search and filtering
```

### Uploading Media
```typescript
import { mediaApi } from '@/services/api/mediaApi'

// Upload a file
const file = // ... File object from input
const result = await mediaApi.upload({
  file: file,
  name: 'My Media', // Optional custom name
  durationSeconds: 120, // Optional, for videos
  type: 'Image' // Optional, auto-detected if not provided
})
```

### Fetching Media
```typescript
// Get all media
const allMedia = await mediaApi.getAll()

// Get by type
const images = await mediaApi.getByType('Image')
const videos = await mediaApi.getByType('Video')
const htmlContent = await mediaApi.getByType('Html')

// Search
const results = await mediaApi.search('vacation')

// Get single media
const media = await mediaApi.getById('123')
```

### Updating Media
```typescript
// Update metadata
const updated = await mediaApi.update('123', {
  name: 'New Name',
  durationSeconds: 150
})
```

### Deleting Media
```typescript
// Delete media (will fail if in use)
try {
  await mediaApi.delete('123')
} catch (error) {
  // Handle error (e.g., media in use)
  console.error(error.response?.data?.message)
}
```

### Getting Presigned URLs
```typescript
// Get URL for preview/download (60 minutes expiration)
const url = await mediaApi.getPresignedUrlWithExpiry(123, 60)

// Use for download
const link = document.createElement('a')
link.href = url
link.download = 'filename.jpg'
link.click()
```

### Getting Statistics
```typescript
const stats = await mediaApi.getStatistics()
// Returns:
// {
//   totalFileSize: 1234567890,
//   totalFileSizeFormatted: "1.2 GB",
//   countByType: { Image: 45, Video: 12, Html: 3 },
//   totalFiles: 60
// }
```

## Component Usage

### UploadMediaModal
```typescript
import { UploadMediaModal } from '@/app/media/components/UploadMediaModal'

<UploadMediaModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
/>
```

### EditMediaModal
```typescript
import { EditMediaModal } from '@/app/media/components/EditMediaModal'
import { Media } from '@/services/api/mediaApi'

const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)

<EditMediaModal
  isOpen={showModal}
  media={selectedMedia}
  onClose={() => {
    setShowModal(false)
    setSelectedMedia(null)
  }}
/>
```

### DeleteMediaDialog
```typescript
import { DeleteMediaDialog } from '@/app/media/components/DeleteMediaDialog'

<DeleteMediaDialog
  isOpen={showDialog}
  media={selectedMedia}
  onClose={() => setShowDialog(false)}
/>
```

### MediaPreviewModal
```typescript
import { MediaPreviewModal } from '@/app/media/components/MediaPreviewModal'

<MediaPreviewModal
  isOpen={showModal}
  media={selectedMedia}
  onClose={() => setShowModal(false)}
/>
```

## React Query Hooks

### Fetch Media List
```typescript
import { useQuery } from '@tanstack/react-query'
import { mediaApi } from '@/services/api/mediaApi'

const { data, isLoading, error } = useQuery({
  queryKey: ['media-files'],
  queryFn: () => mediaApi.getAll(),
  refetchInterval: 30000, // Refetch every 30 seconds
})
```

### Fetch Statistics
```typescript
const { data: stats, isLoading } = useQuery({
  queryKey: ['media-statistics'],
  queryFn: () => mediaApi.getStatistics(),
  refetchInterval: 60000, // Refetch every 60 seconds
})
```

### Upload Mutation
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

const uploadMutation = useMutation({
  mutationFn: (file: File) => mediaApi.upload({ file }),
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['media-files'] })
    queryClient.invalidateQueries({ queryKey: ['media-statistics'] })
  },
})

// Use it
await uploadMutation.mutateAsync(file)
```

### Delete Mutation
```typescript
const deleteMutation = useMutation({
  mutationFn: (id: string) => mediaApi.delete(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['media-files'] })
    queryClient.invalidateQueries({ queryKey: ['media-statistics'] })
  },
  onError: (error: any) => {
    if (error.response?.data?.message?.includes('being used')) {
      toast.error('Cannot delete media in use')
    }
  },
})
```

## TypeScript Types

### MediaType
```typescript
type MediaType = 'Image' | 'Video' | 'Html'
```

### Media (API Response)
```typescript
interface Media {
  id: number
  name: string
  fileName: string
  type: MediaType
  fileSize: number
  fileSizeFormatted: string
  s3Key: string
  mimeType: string
  durationSeconds: number
  createdAt: string
  updatedAt?: string
  typeDisplayName: string
}
```

### MediaUploadRequest
```typescript
interface MediaUploadRequest {
  file: File
  name?: string
  durationSeconds?: number
  type?: MediaType
}
```

### MediaUpdateRequest
```typescript
interface MediaUpdateRequest {
  name?: string
  durationSeconds?: number
}
```

### MediaStatistics
```typescript
interface MediaStatistics {
  totalFileSize: number
  totalFileSizeFormatted: string
  countByType: Record<string, number>
  totalFiles: number
}
```

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media` | Get all media files |
| GET | `/api/media/{id}` | Get media by ID |
| GET | `/api/media/type/{type}` | Get media by type |
| GET | `/api/media/search?searchTerm={term}` | Search media |
| GET | `/api/media/statistics` | Get storage statistics |
| GET | `/api/media/{id}/presigned-url?expirationMinutes={min}` | Get presigned URL |
| GET | `/api/media/{id}/validate` | Validate media integrity |
| POST | `/api/media/upload` | Upload media file |
| PUT | `/api/media/{id}` | Update media metadata |
| DELETE | `/api/media/{id}` | Delete media |

## Error Handling

### Common Error Patterns
```typescript
try {
  await mediaApi.delete(id)
} catch (error: any) {
  const message = error.response?.data?.message || 'An error occurred'
  
  if (message.includes('being used')) {
    // Media is in use in playlists/scenes
    toast.error('Cannot delete media that is being used')
  } else if (error.response?.status === 404) {
    // Media not found
    toast.error('Media not found')
  } else {
    // Generic error
    toast.error(message)
  }
}
```

### Upload Errors
```typescript
try {
  await mediaApi.upload({ file })
} catch (error: any) {
  if (error.response?.status === 413) {
    toast.error('File too large (max 100MB)')
  } else if (error.response?.status === 400) {
    toast.error('Invalid file type')
  } else {
    toast.error('Upload failed')
  }
}
```

## Best Practices

### 1. Always Invalidate Queries After Mutations
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['media-files'] })
  queryClient.invalidateQueries({ queryKey: ['media-statistics'] })
}
```

### 2. Use Toast Notifications
```typescript
import toast from 'react-hot-toast'

toast.success('Media uploaded successfully')
toast.error('Failed to delete media')
toast.loading('Uploading...')
```

### 3. Handle Loading States
```typescript
{isLoading ? (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
) : (
  // Content
)}
```

### 4. Disable Actions During Operations
```typescript
<Button
  onClick={handleDelete}
  disabled={deleteMutation.isPending}
>
  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
</Button>
```

### 5. Clean Up State on Modal Close
```typescript
const handleClose = () => {
  setShowModal(false)
  setSelectedMedia(null)
  reset() // Reset form if using React Hook Form
}
```

## Common Patterns

### Filter Media by Type
```typescript
const filteredMedia = allMedia.filter(media => media.type === 'Image')
```

### Search Media
```typescript
const searchResults = allMedia.filter(media =>
  media.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  media.fileName.toLowerCase().includes(searchTerm.toLowerCase())
)
```

### Download Media
```typescript
const handleDownload = async (media: Media) => {
  const url = await mediaApi.getPresignedUrlWithExpiry(media.id, 60)
  const link = document.createElement('a')
  link.href = url
  link.download = media.fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
```

### Format File Size
```typescript
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
```

## Troubleshooting

### Issue: Upload fails with 413
**Solution**: File is larger than 100MB. Backend enforces this limit.

### Issue: Delete fails with 409 Conflict
**Solution**: Media is being used in playlists or scenes. Remove it from those first.

### Issue: Preview shows error
**Solution**: Check if presigned URL has expired (60 minutes). The component auto-fetches new URLs.

### Issue: Statistics not updating
**Solution**: Check if query invalidation is called after mutations. Statistics auto-refresh every 60 seconds.

### Issue: TypeScript errors with Media type
**Solution**: Import from `@/services/api/mediaApi` not from local types file.

## Performance Tips

1. **Use Query Invalidation Carefully**: Only invalidate what changed
2. **Implement Pagination**: For large media libraries (>100 files)
3. **Lazy Load Thumbnails**: Load thumbnails on demand
4. **Debounce Search**: Use debounce for search input (300ms)
5. **Cache Presigned URLs**: They're valid for 60 minutes

## Security Considerations

1. **Presigned URLs**: Expire after 60 minutes
2. **File Types**: Backend validates file types
3. **File Size**: Backend enforces 100MB limit
4. **Authentication**: All API calls require JWT token
5. **Sandboxed Previews**: HTML content shown in sandboxed iframe

---

**Last Updated**: 2025-01-06
**Maintained By**: Digital Signage Development Team
