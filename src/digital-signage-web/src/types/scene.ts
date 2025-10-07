/**
 * Scene Types
 * Matches backend DTOs from DigitalSignage.Application.DTOs
 */

import { MediaType } from './media'

/**
 * Scene Layout Type Enum
 * Matches DigitalSignage.Domain.Enums.SceneLayoutType
 */
export enum SceneLayoutType {
  Custom = 0,
  FullScreen = 1,
  SplitScreen = 2,
  Grid = 3,
  PictureInPicture = 4,
  Sidebar = 5,
  Header = 6,
  Footer = 7
}

/**
 * Scene Item DTO
 * Matches backend SceneItemDto
 */
export interface SceneItemDto {
  id: number
  sceneId: number
  mediaId: number
  mediaName: string
  mediaFileName: string
  mediaType: MediaType
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  opacity: number // 0.0 to 1.0
  rotation: number // -360 to 360
  animationIn: string | null
  animationOut: string | null
  animationDuration: number
  durationSeconds: number
  useCustomDuration: boolean
}

/**
 * Scene DTO
 * Matches backend SceneDto
 */
export interface SceneDto {
  id: number
  name: string
  description: string
  layoutType: SceneLayoutType
  width: number
  height: number
  backgroundColor: string | null
  backgroundImageId: number | null
  backgroundImageName: string | null
  isTemplate: boolean
  templateName: string | null
  createdAt: string // ISO 8601 DateTime
  updatedAt: string | null // ISO 8601 DateTime
  createdByUserId: number | null
  createdByUserName: string | null
  sceneItems: SceneItemDto[]
  totalItems: number
}

/**
 * Create Scene Item Request
 * Matches backend CreateSceneItemRequest
 */
export interface CreateSceneItemRequest {
  mediaId: number
  x?: number
  y?: number
  width: number
  height: number
  zIndex?: number
  opacity?: number
  rotation?: number
  animationIn?: string | null
  animationOut?: string | null
  animationDuration?: number
  durationSeconds: number
  useCustomDuration?: boolean
}

/**
 * Create Scene Request
 * Matches backend CreateSceneRequest
 */
export interface CreateSceneRequest {
  name: string
  description?: string
  layoutType?: SceneLayoutType
  width?: number
  height?: number
  backgroundColor?: string | null
  backgroundImageId?: number | null
  isTemplate?: boolean
  templateName?: string | null
  sceneItems?: CreateSceneItemRequest[]
}

/**
 * Update Scene Request
 * Matches backend UpdateSceneRequest
 */
export interface UpdateSceneRequest {
  name: string
  description?: string
  layoutType?: SceneLayoutType
  width?: number
  height?: number
  backgroundColor?: string | null
  backgroundImageId?: number | null
  isTemplate?: boolean
  templateName?: string | null
}

/**
 * Scene Filter Options
 * For UI filtering and search
 */
export interface SceneFilterOptions {
  layoutType?: SceneLayoutType[]
  searchTerm?: string
  isTemplate?: boolean
  createdByUserId?: number
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'layoutType'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Scene Statistics
 * For dashboard/overview displays
 */
export interface SceneStatistics {
  totalScenes: number
  customScenes: number
  templateScenes: number
  averageItems: number
  totalAssignedDevices: number
}

/**
 * Scene Template Definition
 * Pre-built scene layouts
 */
export interface SceneTemplate {
  name: string
  layoutType: SceneLayoutType
  width: number
  height: number
  description: string
  zones: SceneZone[]
  preview?: string
}

/**
 * Scene Zone Definition
 * Predefined zones in templates
 */
export interface SceneZone {
  name: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
}

/**
 * Helper Functions
 */

export const getSceneLayoutTypeLabel = (layoutType: SceneLayoutType): string => {
  switch (layoutType) {
    case SceneLayoutType.Custom: return 'Custom Layout'
    case SceneLayoutType.FullScreen: return 'Full Screen'
    case SceneLayoutType.SplitScreen: return 'Split Screen'
    case SceneLayoutType.Grid: return 'Grid Layout'
    case SceneLayoutType.PictureInPicture: return 'Picture in Picture'
    case SceneLayoutType.Sidebar: return 'Sidebar Layout'
    case SceneLayoutType.Header: return 'Header Layout'
    case SceneLayoutType.Footer: return 'Footer Layout'
    default: return 'Unknown'
  }
}

export const getSceneLayoutIcon = (layoutType: SceneLayoutType): string => {
  switch (layoutType) {
    case SceneLayoutType.Custom: return '⚙️'
    case SceneLayoutType.FullScreen: return '🖼️'
    case SceneLayoutType.SplitScreen: return '⬜⬜'
    case SceneLayoutType.Grid: return '▦'
    case SceneLayoutType.PictureInPicture: return '📺'
    case SceneLayoutType.Sidebar: return '▨'
    case SceneLayoutType.Header: return '⬛⬜'
    case SceneLayoutType.Footer: return '⬜⬛'
    default: return '❓'
  }
}

export const validateHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexRegex.test(color)
}

export const getDefaultSceneSize = (layoutType: SceneLayoutType): { width: number; height: number } => {
  // Default to 1920x1080 (Full HD)
  return {
    width: 1920,
    height: 1080
  }
}

/**
 * Pre-defined Scene Templates
 * Common layouts for quick scene creation
 */
export const SCENE_TEMPLATES: SceneTemplate[] = [
  {
    name: 'Full Screen',
    layoutType: SceneLayoutType.FullScreen,
    width: 1920,
    height: 1080,
    description: 'Single full-screen content',
    zones: [
      { name: 'Main', x: 0, y: 0, width: 1920, height: 1080, zIndex: 1 }
    ]
  },
  {
    name: 'Split Screen (Horizontal)',
    layoutType: SceneLayoutType.SplitScreen,
    width: 1920,
    height: 1080,
    description: 'Two equal horizontal sections',
    zones: [
      { name: 'Left', x: 0, y: 0, width: 960, height: 1080, zIndex: 1 },
      { name: 'Right', x: 960, y: 0, width: 960, height: 1080, zIndex: 1 }
    ]
  },
  {
    name: 'Split Screen (Vertical)',
    layoutType: SceneLayoutType.SplitScreen,
    width: 1920,
    height: 1080,
    description: 'Two equal vertical sections',
    zones: [
      { name: 'Top', x: 0, y: 0, width: 1920, height: 540, zIndex: 1 },
      { name: 'Bottom', x: 0, y: 540, width: 1920, height: 540, zIndex: 1 }
    ]
  },
  {
    name: '2x2 Grid',
    layoutType: SceneLayoutType.Grid,
    width: 1920,
    height: 1080,
    description: 'Four equal quadrants',
    zones: [
      { name: 'Top-Left', x: 0, y: 0, width: 960, height: 540, zIndex: 1 },
      { name: 'Top-Right', x: 960, y: 0, width: 960, height: 540, zIndex: 1 },
      { name: 'Bottom-Left', x: 0, y: 540, width: 960, height: 540, zIndex: 1 },
      { name: 'Bottom-Right', x: 960, y: 540, width: 960, height: 540, zIndex: 1 }
    ]
  },
  {
    name: 'Picture in Picture',
    layoutType: SceneLayoutType.PictureInPicture,
    width: 1920,
    height: 1080,
    description: 'Main content with small overlay',
    zones: [
      { name: 'Main', x: 0, y: 0, width: 1920, height: 1080, zIndex: 1 },
      { name: 'Overlay', x: 1440, y: 810, width: 480, height: 270, zIndex: 2 }
    ]
  },
  {
    name: 'Sidebar (Right)',
    layoutType: SceneLayoutType.Sidebar,
    width: 1920,
    height: 1080,
    description: 'Main content with right sidebar',
    zones: [
      { name: 'Main', x: 0, y: 0, width: 1440, height: 1080, zIndex: 1 },
      { name: 'Sidebar', x: 1440, y: 0, width: 480, height: 1080, zIndex: 1 }
    ]
  },
  {
    name: 'Header & Content',
    layoutType: SceneLayoutType.Header,
    width: 1920,
    height: 1080,
    description: 'Header bar with main content below',
    zones: [
      { name: 'Header', x: 0, y: 0, width: 1920, height: 200, zIndex: 2 },
      { name: 'Content', x: 0, y: 200, width: 1920, height: 880, zIndex: 1 }
    ]
  },
  {
    name: 'Content & Footer',
    layoutType: SceneLayoutType.Footer,
    width: 1920,
    height: 1080,
    description: 'Main content with footer bar',
    zones: [
      { name: 'Content', x: 0, y: 0, width: 1920, height: 930, zIndex: 1 },
      { name: 'Footer', x: 0, y: 930, width: 1920, height: 150, zIndex: 2 }
    ]
  }
]

/**
 * Animation Presets
 * Common animation effects for scene items
 */
export const ANIMATION_PRESETS = {
  in: [
    'none',
    'fadeIn',
    'slideInLeft',
    'slideInRight',
    'slideInUp',
    'slideInDown',
    'zoomIn',
    'bounceIn',
    'rotateIn'
  ],
  out: [
    'none',
    'fadeOut',
    'slideOutLeft',
    'slideOutRight',
    'slideOutUp',
    'slideOutDown',
    'zoomOut',
    'bounceOut',
    'rotateOut'
  ]
}
