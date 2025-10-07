/**
 * Enhanced Media Upload Types
 * 
 * Type definitions for Enhanced Media Upload with Variants system.
 * Based on the backend API implementation and UI instructions.
 * 
 * @see copilot-instructions-ui.instructions.md - TypeScript Strict Mode
 * @see copilot-instructions-api.instructions.md - Enhanced Media Upload
 */

// Core Media Types
export interface MediaDto {
  id: number
  name: string
  fileName: string
  s3Key: string
  fileSize: number
  mimeType: string
  type: MediaType
  durationSeconds: number
  originalWidth?: number
  originalHeight?: number
  originalBitrate?: number
  status?: MediaStatus
  originalKey?: string
  processedAt?: string
  processingError?: string
  createdAt: string
  updatedAt?: string
}

export enum MediaType {
  Image = 'Image',
  Video = 'Video',
  Audio = 'Audio',
  Document = 'Document',
  Html = 'Html',
  Text = 'Text',
  Presentation = 'Presentation'
}

export enum MediaStatus {
  Pending = 'Pending',
  Uploading = 'Uploading',
  Processing = 'Processing',
  Processed = 'Processed',
  Failed = 'Failed'
}

export enum MediaVariantType {
  Original = 'Original',
  Thumbnail = 'Thumbnail',
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large'
}

// Enhanced Upload Request/Response Types
export interface CreateUploadRequestDto {
  fileName: string
  contentType: string
  fileSizeBytes: number
  description?: string
  originalWidth?: number
  originalHeight?: number
  originalBitrate?: number
  durationSeconds?: number
  targetDeviceId?: number
  requestedVariants: MediaVariantType[]
}

export interface UploadRequestResponseDto {
  uploadRequestId: string
  mediaId: number
  presignedUrl: string
  expiresAt: string
  formFields: Record<string, string>
  status: MediaStatus
  estimatedProcessingMinutes: number
  plannedVariants: PlannedVariantDto[]
  instructions: string
}

export interface PlannedVariantDto {
  variantType: MediaVariantType
  width: number
  height: number
  estimatedSizeReduction: number
}

export interface CompleteUploadDto {
  uploadRequestId: string
  actualFileSizeBytes: number
  etag?: string
}

export interface UploadStatusDto {
  uploadRequestId: string
  mediaId: number
  status: MediaStatus
  progressPercentage: number
  currentStep: string
  variantsCompleted: number
  totalVariants: number
  processingStartedAt?: string
  processingCompletedAt?: string
  estimatedMinutesRemaining?: number
  errorMessage?: string
  completedVariants: MediaVariantDto[]
}

export interface MediaVariantDto {
  id: number
  mediaId: number
  variantType: MediaVariantType
  width: number
  height: number
  fileSizeBytes: number
  contentType: string
  bitrate?: number
  quality: number
  qualityScore: number
  s3Key: string
  cloudFrontUrl?: string
  etag?: string
  createdAt: string
}

// Device Optimization Types
export interface DeviceOptimalMediaDto {
  media: MediaDto
  optimalVariant: MediaVariantDto
  alternativeVariants: MediaVariantDto[]
  selectionCriteria: VariantSelectionCriteriaDto
  presignedUrl: string
  urlExpiresAt: string
}

export interface VariantSelectionCriteriaDto {
  deviceResolution: string
  networkType: string
  bandwidthKbps: number
  selectionAlgorithm: string
  selectionReason: string
}

export interface DeviceCapabilityDto {
  id: number
  deviceId: number
  deviceName: string
  maxWidth: number
  maxHeight: number
  maxBitrate: number
  networkType: string
  bandwidthKbps: number
  cpuScore: number
  ramMb: number
  storageMb: number
  supportedFormats: string[]
  lastUpdated: string
  capabilityScore: number
}

export interface UpdateDeviceCapabilityDto {
  maxWidth: number
  maxHeight: number
  maxBitrate: number
  networkType: string
  bandwidthKbps: number
  cpuScore: number
  ramMb: number
  storageMb: number
  supportedFormats: string[]
}

// Quick Assignment Types
export interface QuickAssignRequestDto {
  assignmentType: 'new-schedule' | 'existing-schedule'
  scheduleName?: string
  scheduleId?: number
  startDate?: string
  endDate?: string
  durationSeconds?: number
  userIds?: number[]
  deviceGroupIds?: number[]
}

export interface QuickAssignResponseDto {
  mediaId: number
  mediaName: string
  scheduleId: number
  scheduleName: string
  newScheduleCreated: boolean
  usersAssignedCount: number
  deviceGroupsAssignedCount: number
  assignedUserIds: number[]
  assignedDeviceGroupIds: number[]
  assignedAt: string
  message: string
}

// UI Component Types
export interface EnhancedUploadFile {
  id: string
  file: File
  uploadRequestId?: string
  mediaId?: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  uploadProgress: number
  processingProgress: number
  error?: string
  presignedUrl?: string
  variants: MediaVariantDto[]
  estimatedProcessingMinutes: number
  currentStep: string
  variantsCompleted: number
  totalVariants: number
  processingStartedAt?: string
  processingCompletedAt?: string
  estimatedMinutesRemaining?: number
}

export interface EnhancedFileUploadProps {
  accept?: string
  multiple?: boolean
  maxFileSize?: number
  maxFiles?: number
  targetDeviceId?: number
  requestedVariants?: MediaVariantType[]
  onFilesSelected?: (files: File[]) => void
  onUploadStart?: (fileId: string, uploadRequestId: string) => void
  onUploadProgress?: (fileId: string, progress: number) => void
  onProcessingProgress?: (fileId: string, status: UploadStatusDto) => void
  onUploadComplete?: (fileId: string, media: MediaDto) => void
  onUploadError?: (fileId: string, error: string) => void
  onFileRemove?: (fileId: string) => void
  className?: string
  disabled?: boolean
  showQuickAssignment?: boolean
  onQuickAssign?: (mediaId: number, assignmentData: QuickAssignRequestDto) => void
}

// Upload Progress Types
export interface UploadProgressProps {
  file: EnhancedUploadFile
  onCancel?: (fileId: string) => void
  onRetry?: (fileId: string) => void
  showVariantDetails?: boolean
}

export interface VariantProgressProps {
  variants: MediaVariantDto[]
  totalVariants: number
  completedVariants: number
  currentStep: string
  estimatedMinutesRemaining?: number
}

// Legacy compatibility types
export interface MediaFile {
  id: number
  name: string
  fileName: string
  filePath: string
  mediaType: 'Image' | 'Video' | 'Document'
  fileSize: number
  uploadedAt: string
  lastModified: string
  isActive: boolean
  tags?: string[]
  thumbnailUrl?: string
  duration?: number
}

export interface MediaUploadRequest {
  file: File
  name?: string
  tags?: string[]
}

export interface MediaSearchParams {
  searchTerm?: string
  mediaType?: string
  tags?: string[]
  page?: number
  pageSize?: number
}

export interface MediaResponse {
  data: MediaFile[]
  total: number
}

export interface MediaStatsResponse {
  totalFiles: number
  totalSize: number
  byType: Record<string, number>
}