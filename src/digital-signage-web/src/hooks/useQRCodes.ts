import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { qrCodeService, type QRCode, type CreateQRCodeRequest, type UpdateQRCodeRequest, type QRCodeStats } from '@/services/qrCodeService'
import { useToast } from '@/hooks/useToast'

/**
 * Query key factory for QR code-related queries
 * 
 * Provides consistent cache keys for React Query QR code operations.
 * Used internally by QR code hooks for cache management and invalidation.
 */
export const qrCodeKeys = {
  all: ['qrcodes'] as const,
  lists: () => [...qrCodeKeys.all, 'list'] as const,
  details: () => [...qrCodeKeys.all, 'detail'] as const,
  detail: (id: string) => [...qrCodeKeys.details(), id] as const,
  stats: () => [...qrCodeKeys.all, 'stats'] as const,
}

/**
 * Hook to fetch all QR codes
 * 
 * Retrieves complete QR code library with usage statistics.
 * Results are cached for 5 minutes with automatic background refetching.
 * 
 * @returns React Query result with QR codes array and query state
 */
export function useQRCodes() {
  return useQuery({
    queryKey: qrCodeKeys.lists(),
    queryFn: () => qrCodeService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single QR code by ID
 * 
 * Retrieves detailed information for a specific QR code including
 * metadata, scan statistics, and device assignment.
 * Data is cached for 10 minutes.
 * 
 * @param id - QR code ID to fetch
 * @param enabled - Whether the query should run (default: true)
 * @returns React Query result with QR code details and query state
 */
export function useQRCodeById(id: string, enabled = true) {
  return useQuery({
    queryKey: qrCodeKeys.detail(id),
    queryFn: () => qrCodeService.getById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch QR code statistics
 * 
 * Retrieves overall QR code usage statistics including total scans,
 * active codes, and scan trends.
 * 
 * @returns React Query result with QR code statistics and query state
 */
export function useQRCodeStats() {
  return useQuery({
    queryKey: qrCodeKeys.stats(),
    queryFn: () => qrCodeService.getStatistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to create a new QR code
 * 
 * Handles QR code creation with automatic cache invalidation.
 * Shows success/error notifications and returns mutation state.
 * 
 * @returns React Query mutation for creating QR codes
 */
export function useCreateQRCode() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (request: CreateQRCodeRequest) => qrCodeService.generate(request),
    onSuccess: (data) => {
      // Invalidate and refetch QR codes list
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.stats() })
      
      toast({
        title: 'Success',
        description: `QR code "${data.name}" created successfully`,
        variant: 'default',
      })
    },
    onError: (error: any) => {
      console.error('Failed to create QR code:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create QR code',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to update an existing QR code
 * 
 * Handles QR code updates with automatic cache invalidation.
 * Shows success/error notifications and returns mutation state.
 * 
 * @returns React Query mutation for updating QR codes
 */
export function useUpdateQRCode() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateQRCodeRequest }) => 
      qrCodeService.update(id, request),
    onSuccess: (data, { id }) => {
      // Invalidate and refetch QR codes list and specific detail
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.stats() })
      
      toast({
        title: 'Success',
        description: `QR code "${data.name}" updated successfully`,
        variant: 'default',
      })
    },
    onError: (error: any) => {
      console.error('Failed to update QR code:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update QR code',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to delete a QR code
 * 
 * Handles QR code deletion with automatic cache invalidation.
 * Shows success/error notifications and returns mutation state.
 * 
 * @returns React Query mutation for deleting QR codes
 */
export function useDeleteQRCode() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => qrCodeService.delete(id),
    onSuccess: (_, id) => {
      // Remove the deleted QR code from cache
      queryClient.removeQueries({ queryKey: qrCodeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.stats() })
      
      toast({
        title: 'Success',
        description: 'QR code deleted successfully',
        variant: 'default',
      })
    },
    onError: (error: any) => {
      console.error('Failed to delete QR code:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete QR code',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to download QR code image
 * 
 * Handles QR code image download as blob with proper file naming.
 * Shows success/error notifications.
 * 
 * @returns Function to trigger QR code download
 */
export function useDownloadQRCode() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const blob = await qrCodeService.downloadImage(id)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `qr-code-${name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return { success: true }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'QR code image downloaded successfully',
        variant: 'default',
      })
    },
    onError: (error: any) => {
      console.error('Failed to download QR code:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to download QR code image',
        variant: 'destructive',
      })
    },
  })
}