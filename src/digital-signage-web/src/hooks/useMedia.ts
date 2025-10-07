import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MediaService, MediaFile, MediaUploadRequest, MediaSearchParams } from '@/services'
import { useToast } from '@/hooks/useToast'

/**
 * Query key factory for media-related queries
 * 
 * Provides consistent cache keys for React Query media operations.
 * Used internally by media hooks for cache management and invalidation.
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/query-keys
 */
export const mediaKeys = {
  all: ['media'] as const,
  lists: () => [...mediaKeys.all, 'list'] as const,
  list: (params: MediaSearchParams) => [...mediaKeys.lists(), params] as const,
  details: () => [...mediaKeys.all, 'detail'] as const,
  detail: (id: number) => [...mediaKeys.details(), id] as const,
  search: (params: MediaSearchParams) => [...mediaKeys.all, 'search', params] as const,
  type: (type: string) => [...mediaKeys.all, 'type', type] as const,
  usage: (id: number) => [...mediaKeys.all, 'usage', id] as const,
}

/**
 * Hook to fetch all media files
 * 
 * Retrieves complete media library including images, videos, and documents.
 * Results are cached for 5 minutes with automatic background refetching.
 * 
 * @returns React Query result with media files array and query state
 * 
 * @example
 * ```tsx
 * const { data: mediaFiles, isLoading, error } = useMedia()
 * 
 * if (isLoading) return <LoadingSkeleton variant="card" count={6} />
 * if (error) return <ErrorState error={error} />
 * 
 * return (
 *   <MediaGrid>
 *     {mediaFiles?.map(media => (
 *       <MediaCard key={media.id} media={media} />
 *     ))}
 *   </MediaGrid>
 * )
 * ```
 * 
 * @see MediaService.getAll for API implementation
 */
export function useMedia() {
  return useQuery({
    queryKey: mediaKeys.lists(),
    queryFn: MediaService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single media file by ID
 * 
 * Retrieves detailed information for a specific media file including
 * metadata, file size, dimensions, duration (for videos), and usage statistics.
 * Data is cached for 10 minutes.
 * 
 * @param id - Media file ID to fetch
 * @param enabled - Whether the query should run (default: true)
 * @returns React Query result with media file details and query state
 * 
 * @example
 * ```tsx
 * const { data: media, isLoading } = useMediaById(mediaId)
 * 
 * if (isLoading) return <LoadingSkeleton variant="image" />
 * if (!media) return <EmptyState message="Media not found" />
 * 
 * return <MediaPreview media={media} />
 * ```
 * 
 * @see MediaService.getById for API implementation
 */
export function useMediaById(id: number, enabled = true) {
  return useQuery({
    queryKey: mediaKeys.detail(id),
    queryFn: () => MediaService.getById(id),
    enabled: enabled && id > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to search media files with filters
 * 
 * Performs search across media library with support for text search,
 * type filtering, tag filtering, and date range filtering.
 * Only runs when search parameters are provided.
 * 
 * @param params - Search parameters (searchTerm, mediaType, tags, dateRange)
 * @returns React Query result with matching media files and query state
 * 
 * @example
 * ```tsx
 * const { data: results, isLoading } = useMediaSearch({
 *   searchTerm: 'banner',
 *   mediaType: 'image',
 *   tags: ['promotion', 'seasonal']
 * })
 * 
 * return <MediaSearchResults results={results} loading={isLoading} />
 * ```
 */
export function useMediaSearch(params: MediaSearchParams) {
  return useQuery({
    queryKey: mediaKeys.search(params),
    queryFn: () => MediaService.search(params),
    enabled: !!(params.searchTerm || params.mediaType || params.tags?.length),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook for fetching media by type
 */
export function useMediaByType(mediaType: string) {
  return useQuery({
    queryKey: mediaKeys.type(mediaType),
    queryFn: () => MediaService.getByType(mediaType),
    enabled: !!mediaType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for fetching media usage statistics
 */
export function useMediaUsage(id: number) {
  return useQuery({
    queryKey: mediaKeys.usage(id),
    queryFn: () => MediaService.getUsageStats(id),
    enabled: id > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Hook for uploading media files
 */
export function useMediaUpload() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (uploadData: MediaUploadRequest) =>
      MediaService.upload(uploadData),
    onSuccess: (newMedia) => {
      // Invalidate and refetch media lists
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: mediaKeys.search({}) })
      
      // Add to cache
      queryClient.setQueryData(mediaKeys.detail(newMedia.id), newMedia)
      
      toast({
        title: 'Upload successful',
        description: `${newMedia.name} has been uploaded successfully.`,
        variant: 'success',
      })
    },
    onError: (error) => {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload media file. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for updating media files
 */
export function useMediaUpdate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<MediaFile> }) =>
      MediaService.update(id, updates),
    onSuccess: (updatedMedia) => {
      // Update cache
      queryClient.setQueryData(mediaKeys.detail(updatedMedia.id), updatedMedia)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: mediaKeys.search({}) })
      
      toast({
        title: 'Media updated',
        description: `${updatedMedia.name} has been updated successfully.`,
        variant: 'success',
      })
    },
    onError: (error) => {
      console.error('Update error:', error)
      toast({
        title: 'Update failed',
        description: 'Failed to update media file. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for deleting media files
 */
export function useMediaDelete() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: number) => MediaService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: mediaKeys.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: mediaKeys.search({}) })
      
      toast({
        title: 'Media deleted',
        description: 'Media file has been deleted successfully.',
        variant: 'success',
      })
    },
    onError: (error) => {
      console.error('Delete error:', error)
      toast({
        title: 'Delete failed',
        description: 'Failed to delete media file. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for bulk deleting media files
 */
export function useMediaBulkDelete() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (ids: number[]) => MediaService.bulkDelete(ids),
    onSuccess: (_, deletedIds) => {
      // Remove from cache
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: mediaKeys.detail(id) })
      })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: mediaKeys.search({}) })
      
      toast({
        title: 'Media deleted',
        description: `${deletedIds.length} media files have been deleted successfully.`,
        variant: 'success',
      })
    },
    onError: (error) => {
      console.error('Bulk delete error:', error)
      toast({
        title: 'Delete failed',
        description: 'Failed to delete media files. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for adding tags to media
 */
export function useMediaAddTags() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, tags }: { id: number; tags: string[] }) =>
      MediaService.addTags(id, tags),
    onSuccess: (updatedMedia) => {
      // Update cache
      queryClient.setQueryData(mediaKeys.detail(updatedMedia.id), updatedMedia)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: mediaKeys.search({}) })
      
      toast({
        title: 'Tags added',
        description: 'Tags have been added successfully.',
        variant: 'success',
      })
    },
    onError: (error) => {
      console.error('Add tags error:', error)
      toast({
        title: 'Failed to add tags',
        description: 'Failed to add tags. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for removing tags from media
 */
export function useMediaRemoveTags() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, tags }: { id: number; tags: string[] }) =>
      MediaService.removeTags(id, tags),
    onSuccess: (updatedMedia) => {
      // Update cache
      queryClient.setQueryData(mediaKeys.detail(updatedMedia.id), updatedMedia)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: mediaKeys.search({}) })
      
      toast({
        title: 'Tags removed',
        description: 'Tags have been removed successfully.',
        variant: 'success',
      })
    },
    onError: (error) => {
      console.error('Remove tags error:', error)
      toast({
        title: 'Failed to remove tags',
        description: 'Failed to remove tags. Please try again.',
        variant: 'destructive',
      })
    },
  })
}