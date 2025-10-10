/**
 * Playlist Types
 * Matches backend DTOs from DigitalSignage.Application.DTOs
 */

import { MediaType } from '@/types/media'

/**
 * Playlist Status Enum
 * Matches DigitalSignage.Domain.Enums.PlaylistStatus
 */
export enum PlaylistStatus {
  Draft = 0,
  Active = 1,
  Scheduled = 2,
  Archived = 3
}

/**
 * Transition Effect Enum
 * Matches DigitalSignage.Domain.Enums.TransitionEffect
 */
export enum TransitionEffect {
  Cut = 0,
  Fade = 1,
  Slide = 2,
  Zoom = 3,
  Wipe = 4,
  Push = 5,
  Reveal = 6,
  Dissolve = 7
}

/**
 * Playlist Item DTO
 * Matches backend PlaylistItemDto
 */
export interface PlaylistItemDto {
  id: number
  playlistId: number
  mediaId: number
  mediaName: string
  mediaFileName: string
  mediaType: MediaType
  orderIndex: number
  durationSeconds: number
  useCustomDuration: boolean
  transitionEffect: TransitionEffect
  transitionDurationMs: number
  isConditional: boolean
  startTime: string | null // TimeOnly as "HH:mm:ss"
  endTime: string | null // TimeOnly as "HH:mm:ss"
}

/**
 * Playlist DTO
 * Matches backend PlaylistDto
 */
export interface PlaylistDto {
  id: number
  name: string
  description: string
  status: PlaylistStatus
  isLooped: boolean
  loopCount: number | null
  priority: number
  createdAt: string // ISO 8601 DateTime
  updatedAt: string | null // ISO 8601 DateTime
  createdByUserId: number | null
  createdByUserName: string | null
  playlistItems: PlaylistItemDto[]
  totalItems: number
  totalDurationSeconds: number
}

/**
 * Create Playlist Item Request
 * Matches backend CreatePlaylistItemRequest
 */
export interface CreatePlaylistItemRequest {
  mediaId: number
  orderIndex: number
  durationSeconds: number
  useCustomDuration?: boolean
  transitionEffect?: TransitionEffect
  transitionDurationMs?: number
  isConditional?: boolean
  startTime?: string | null // TimeOnly as "HH:mm:ss"
  endTime?: string | null // TimeOnly as "HH:mm:ss"
}

/**
 * Create Playlist Request
 * Matches backend CreatePlaylistRequest
 */
export interface CreatePlaylistRequest {
  name: string
  description?: string
  status?: PlaylistStatus
  isLooped?: boolean
  loopCount?: number | null
  priority?: number
  playlistItems?: CreatePlaylistItemRequest[]
}

/**
 * Update Playlist Request
 * Matches backend UpdatePlaylistRequest
 */
export interface UpdatePlaylistRequest {
  name: string
  description?: string
  status?: PlaylistStatus
  isLooped?: boolean
  loopCount?: number | null
  priority?: number
}

/**
 * Playlist Filter Options
 * For UI filtering and search
 */
export interface PlaylistFilterOptions {
  status?: PlaylistStatus[]
  searchTerm?: string
  createdByUserId?: number
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'priority' | 'totalDuration'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Playlist Statistics
 * For dashboard/overview displays
 */
export interface PlaylistStatistics {
  totalPlaylists: number
  activePlaylists: number
  draftPlaylists: number
  scheduledPlaylists: number
  archivedPlaylists: number
  averageDuration: number
  totalAssignedDevices: number
}

/**
 * Playlist Assignment Summary
 * Shows where a playlist is assigned
 */
export interface PlaylistAssignmentSummary {
  playlistId: number
  playlistName: string
  totalAssignments: number
  activeAssignments: number
  deviceCount: number
  deviceGroupCount: number
  assignments: PlaylistAssignmentDto[]
}

export interface PlaylistAssignmentDto {
  id: number
  playlistId: number
  playlistName: string
  deviceId: number
  deviceName: string
  priority: number
  startTime: string | null // ISO 8601 DateTime
  endTime: string | null // ISO 8601 DateTime
  createdAt: string // ISO 8601 DateTime
  createdById: number
  createdByName: string
}

/**
 * Helper Functions
 */

export const formatPlaylistDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

export const getPlaylistStatusLabel = (status: PlaylistStatus): string => {
  switch (status) {
    case PlaylistStatus.Draft: return 'Draft'
    case PlaylistStatus.Active: return 'Active'
    case PlaylistStatus.Scheduled: return 'Scheduled'
    case PlaylistStatus.Archived: return 'Archived'
    default: return 'Unknown'
  }
}

export const getPlaylistStatusColor = (status: PlaylistStatus): string => {
  switch (status) {
    case PlaylistStatus.Draft: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case PlaylistStatus.Active: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case PlaylistStatus.Scheduled: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case PlaylistStatus.Archived: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getTransitionEffectLabel = (effect: TransitionEffect): string => {
  switch (effect) {
    case TransitionEffect.Cut: return 'Cut'
    case TransitionEffect.Fade: return 'Fade'
    case TransitionEffect.Slide: return 'Slide'
    case TransitionEffect.Zoom: return 'Zoom'
    case TransitionEffect.Wipe: return 'Wipe'
    case TransitionEffect.Push: return 'Push'
    case TransitionEffect.Reveal: return 'Reveal'
    case TransitionEffect.Dissolve: return 'Dissolve'
    default: return 'Unknown'
  }
}

export const formatTimeOnly = (time: string | null): string => {
  if (!time) return '--:--'
  return time.substring(0, 5) // "HH:mm"
}
