/**
 * Scene Canvas Editor Component
 * Visual scene layout editor with drag-drop, resize, and positioning controls
 * Follows copilot-instructions-ui.instructions.md patterns
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Plus,
  Trash2,
  Move,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Grid as GridIcon,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  RotateCw,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Settings,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MediaService, MediaFile } from '@/services/mediaService'
import { SceneItemDto, CreateSceneItemRequest } from '@/types/scene'
import { MediaType } from '@/types/media'

/**
 * Props for SceneCanvasEditor component
 */
export interface SceneCanvasEditorProps {
  /** Scene width in pixels */
  width: number
  
  /** Scene height in pixels */
  height: number
  
  /** Existing scene items */
  items: SceneItemDto[]
  
  /** Callback when items change */
  onItemsChange: (items: SceneItemDto[]) => void
  
  /** Callback when new item is added */
  onAddItem?: (request: CreateSceneItemRequest) => void
  
  /** Callback when item is removed */
  onRemoveItem?: (itemId: number) => void
  
  /** Background color */
  backgroundColor?: string
  
  /** Optional className */
  className?: string
  
  /** Read-only mode */
  readOnly?: boolean
  
  /** Enable grid snapping */
  enableGrid?: boolean
  
  /** Grid size in pixels */
  gridSize?: number
}

/**
 * Selected item state
 */
interface SelectedItem {
  id: number
  isResizing: boolean
  resizeHandle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null
}

/**
 * Get icon for media type
 */
const getMediaIcon = (mediaType: MediaType) => {
  const iconClass = "h-4 w-4"
  
  switch (mediaType) {
    case MediaType.Image:
      return <ImageIcon className={iconClass} />
    case MediaType.Video:
      return <Video className={iconClass} />
    case MediaType.Audio:
      return <Music className={iconClass} />
    default:
      return <FileText className={iconClass} />
  }
}

/**
 * Scene Canvas Editor Component
 */
export function SceneCanvasEditor({
  width,
  height,
  items,
  onItemsChange,
  onAddItem,
  onRemoveItem,
  backgroundColor = '#1e1e1e',
  className = '',
  readOnly = false,
  enableGrid = true,
  gridSize = 20
}: SceneCanvasEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [showMediaSelector, setShowMediaSelector] = useState(false)
  const [showGrid, setShowGrid] = useState(enableGrid)
  const [zoom, setZoom] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch available media
  const { data: mediaList = [], isLoading, error } = useQuery({
    queryKey: ['media-all'],
    queryFn: () => MediaService.getAll(),
    enabled: showMediaSelector
  })

  // Filter media
  const filteredMedia = (mediaList as MediaFile[]).filter((media: MediaFile) =>
    searchTerm === '' ||
    media.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    media.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Snap to grid
  const snapToGrid = (value: number): number => {
    if (!showGrid) return value
    return Math.round(value / gridSize) * gridSize
  }

  // Add media to scene
  const handleAddMedia = (media: MediaFile) => {
    const mediaType = media.mediaType === 'Image' ? MediaType.Image :
                     media.mediaType === 'Video' ? MediaType.Video :
                     MediaType.Document

    const newItem: SceneItemDto = {
      id: Date.now(), // Temporary ID
      sceneId: 0,
      mediaId: media.id,
      mediaName: media.name,
      mediaFileName: media.fileName,
      mediaType: mediaType,
      x: snapToGrid(50),
      y: snapToGrid(50),
      width: snapToGrid(400),
      height: snapToGrid(300),
      zIndex: items.length,
      opacity: 1.0,
      rotation: 0,
      animationIn: null,
      animationOut: null,
      animationDuration: 0,
      durationSeconds: media.duration || 10,
      useCustomDuration: false
    }

    onItemsChange([...items, newItem])
    setShowMediaSelector(false)

    if (onAddItem) {
      const request: CreateSceneItemRequest = {
        mediaId: media.id,
        x: newItem.x,
        y: newItem.y,
        width: newItem.width,
        height: newItem.height,
        zIndex: newItem.zIndex,
        opacity: 1.0,
        rotation: 0,
        durationSeconds: newItem.durationSeconds
      }
      onAddItem(request)
    }
  }

  // Handle mouse down on item (start drag/resize)
  const handleMouseDown = (e: React.MouseEvent, itemId: number, handle?: string) => {
    if (readOnly) return
    e.stopPropagation()

    const item = items.find(i => i.id === itemId)
    if (!item) return

    setSelectedItem({
      id: itemId,
      isResizing: !!handle,
      resizeHandle: handle as any || null
    })

    setDragStart({
      x: e.clientX,
      y: e.clientY
    })
  }

  // Handle mouse move (drag/resize)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedItem || !dragStart || readOnly) return

    const deltaX = (e.clientX - dragStart.x) / zoom
    const deltaY = (e.clientY - dragStart.y) / zoom

    const updatedItems = items.map((item, index) => {
      if (index !== items.findIndex(i => i.id === selectedItem.id)) {
        return item
      }

      const newItem = { ...item }

      if (selectedItem.isResizing && selectedItem.resizeHandle) {
        // Resize logic
        const handle = selectedItem.resizeHandle

        if (handle.includes('e')) {
          newItem.width = Math.max(50, snapToGrid(newItem.width + deltaX))
        }
        if (handle.includes('w')) {
          const newWidth = Math.max(50, snapToGrid(newItem.width - deltaX))
          const widthDiff = newItem.width - newWidth
          newItem.width = newWidth
          newItem.x = snapToGrid(newItem.x + widthDiff)
        }
        if (handle.includes('s')) {
          newItem.height = Math.max(50, snapToGrid(newItem.height + deltaY))
        }
        if (handle.includes('n')) {
          const newHeight = Math.max(50, snapToGrid(newItem.height - deltaY))
          const heightDiff = newItem.height - newHeight
          newItem.height = newHeight
          newItem.y = snapToGrid(newItem.y + heightDiff)
        }
      } else {
        // Move logic
        newItem.x = Math.max(0, Math.min(width - newItem.width, snapToGrid(newItem.x + deltaX)))
        newItem.y = Math.max(0, Math.min(height - newItem.height, snapToGrid(newItem.y + deltaY)))
      }

      return newItem
    })

    onItemsChange(updatedItems)

    setDragStart({
      x: e.clientX,
      y: e.clientY
    })
  }

  // Handle mouse up (end drag/resize)
  const handleMouseUp = () => {
    setDragStart(null)
  }

  // Update item property
  const handleUpdateItem = (itemId: number, updates: Partial<SceneItemDto>) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    )
    onItemsChange(newItems)
  }

  // Delete item
  const handleDeleteItem = (itemId: number) => {
    const newItems = items.filter(i => i.id !== itemId)
    onItemsChange(newItems)
    
    if (onRemoveItem && itemId > 0) {
      onRemoveItem(itemId)
    }
    
    if (selectedItem?.id === itemId) {
      setSelectedItem(null)
    }
  }

  // Duplicate item
  const handleDuplicateItem = (itemId: number) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    const newItem: SceneItemDto = {
      ...item,
      id: Date.now(),
      x: snapToGrid(item.x + 20),
      y: snapToGrid(item.y + 20),
      zIndex: items.length
    }

    onItemsChange([...items, newItem])
  }

  // Move item to front/back
  const handleChangeZIndex = (itemId: number, direction: 'front' | 'back') => {
    const updatedItems = items.map(item => {
      if (item.id !== itemId) return item

      const newItem = { ...item }
      if (direction === 'front') {
        newItem.zIndex = Math.max(...items.map(i => i.zIndex)) + 1
      } else {
        newItem.zIndex = Math.min(...items.map(i => i.zIndex)) - 1
      }
      return newItem
    })

    // Re-normalize z-indices
    const sortedItems = updatedItems.sort((a, b) => a.zIndex - b.zIndex)
    const normalizedItems = sortedItems.map((item, index) => ({
      ...item,
      zIndex: index
    }))

    onItemsChange(normalizedItems)
  }

  // Align items
  const handleAlign = (type: 'center-h' | 'center-v') => {
    if (!selectedItem) return

    const updatedItems = items.map(item => {
      if (item.id !== selectedItem.id) return item

      const newItem = { ...item }
      if (type === 'center-h') {
        newItem.x = snapToGrid((width - newItem.width) / 2)
      } else {
        newItem.y = snapToGrid((height - newItem.height) / 2)
      }
      return newItem
    })

    onItemsChange(updatedItems)
  }

  const selectedItemData = selectedItem ? items.find(i => i.id === selectedItem.id) : null

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Canvas Area */}
      <div className="flex-1 space-y-4">
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMediaSelector(true)}
                disabled={readOnly}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Media
              </Button>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className={showGrid ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              >
                <GridIcon className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>

              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.min(2, zoom + 0.25))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(1)}
              >
                Reset
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {selectedItemData && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAlign('center-h')}
                    disabled={readOnly}
                  >
                    <AlignHorizontalJustifyCenter className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAlign('center-v')}
                    disabled={readOnly}
                  >
                    <AlignVerticalJustifyCenter className="h-4 w-4" />
                  </Button>

                  <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateItem(selectedItem!.id)}
                    disabled={readOnly}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(selectedItem!.id)}
                    disabled={readOnly}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
          <div
            ref={canvasRef}
            className="relative mx-auto shadow-2xl"
            style={{
              width: width * zoom,
              height: height * zoom,
              backgroundColor,
              backgroundImage: showGrid
                ? `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`
                : 'none',
              backgroundSize: showGrid ? `${gridSize * zoom}px ${gridSize * zoom}px` : 'auto'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Scene Items */}
            {items
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((item) => {
                const isSelected = selectedItem?.id === item.id

                return (
                  <div
                    key={item.id}
                    className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                    style={{
                      left: item.x * zoom,
                      top: item.y * zoom,
                      width: item.width * zoom,
                      height: item.height * zoom,
                      opacity: item.opacity,
                      transform: `rotate(${item.rotation}deg)`,
                      zIndex: item.zIndex
                    }}
                    onMouseDown={(e) => handleMouseDown(e, item.id)}
                  >
                    {/* Item Content */}
                    <div className="w-full h-full bg-gray-800/50 border-2 border-white/20 rounded flex items-center justify-center backdrop-blur-sm">
                      <div className="text-center text-white">
                        {getMediaIcon(item.mediaType)}
                        <div className="text-xs mt-2 truncate px-2 max-w-full">
                          {item.mediaName}
                        </div>
                      </div>
                    </div>

                    {/* Resize Handles (only when selected) */}
                    {isSelected && !readOnly && (
                      <>
                        {/* Corner handles */}
                        {['nw', 'ne', 'sw', 'se'].map((handle) => (
                          <div
                            key={handle}
                            className={`absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-${
                              handle === 'nw' ? 'nwse' :
                              handle === 'ne' ? 'nesw' :
                              handle === 'sw' ? 'nesw' : 'nwse'
                            }-resize`}
                            style={{
                              top: handle.includes('n') ? -6 : 'auto',
                              bottom: handle.includes('s') ? -6 : 'auto',
                              left: handle.includes('w') ? -6 : 'auto',
                              right: handle.includes('e') ? -6 : 'auto'
                            }}
                            onMouseDown={(e) => handleMouseDown(e, item.id, handle)}
                          />
                        ))}

                        {/* Edge handles */}
                        {['n', 's', 'e', 'w'].map((handle) => (
                          <div
                            key={handle}
                            className={`absolute bg-blue-500 border border-white cursor-${
                              handle === 'n' || handle === 's' ? 'ns' : 'ew'
                            }-resize`}
                            style={{
                              ...(handle === 'n' || handle === 's'
                                ? { width: '30%', height: '4px', left: '35%' }
                                : { width: '4px', height: '30%', top: '35%' }),
                              top: handle === 'n' ? -2 : handle === 's' ? 'auto' : undefined,
                              bottom: handle === 's' ? -2 : undefined,
                              left: handle === 'w' ? -2 : handle === 'e' ? 'auto' : undefined,
                              right: handle === 'e' ? -2 : undefined
                            }}
                            onMouseDown={(e) => handleMouseDown(e, item.id, handle)}
                          />
                        ))}
                      </>
                    )}

                    {/* Item Label */}
                    {isSelected && (
                      <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {item.mediaName}
                      </div>
                    )}
                  </div>
                )
              })}

            {/* Empty State */}
            {items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Layers className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Empty Canvas</p>
                  <p className="text-sm mt-2">Add media items to start designing</p>
                  {!readOnly && (
                    <Button
                      className="mt-4"
                      onClick={() => setShowMediaSelector(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Media
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Info */}
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span>Canvas: {width} × {height}px</span>
          <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-white dark:bg-gray-800 border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Properties
        </h3>

        {selectedItemData ? (
          <div className="space-y-4">
            {/* Item Info */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedItemData.mediaName}
              </p>
            </div>

            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  X
                </label>
                <Input
                  type="number"
                  value={selectedItemData.x}
                  onChange={(e) => handleUpdateItem(selectedItemData.id, {
                    x: parseInt(e.target.value) || 0
                  })}
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Y
                </label>
                <Input
                  type="number"
                  value={selectedItemData.y}
                  onChange={(e) => handleUpdateItem(selectedItemData.id, {
                    y: parseInt(e.target.value) || 0
                  })}
                  disabled={readOnly}
                />
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Width
                </label>
                <Input
                  type="number"
                  value={selectedItemData.width}
                  onChange={(e) => handleUpdateItem(selectedItemData.id, {
                    width: Math.max(50, parseInt(e.target.value) || 50)
                  })}
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Height
                </label>
                <Input
                  type="number"
                  value={selectedItemData.height}
                  onChange={(e) => handleUpdateItem(selectedItemData.id, {
                    height: Math.max(50, parseInt(e.target.value) || 50)
                  })}
                  disabled={readOnly}
                />
              </div>
            </div>

            {/* Z-Index */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Layer Order
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangeZIndex(selectedItemData.id, 'front')}
                  disabled={readOnly}
                  className="flex-1"
                >
                  Bring to Front
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangeZIndex(selectedItemData.id, 'back')}
                  disabled={readOnly}
                  className="flex-1"
                >
                  Send to Back
                </Button>
              </div>
            </div>

            {/* Opacity */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Opacity: {Math.round(selectedItemData.opacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedItemData.opacity}
                onChange={(e) => handleUpdateItem(selectedItemData.id, {
                  opacity: parseFloat(e.target.value)
                })}
                disabled={readOnly}
                className="w-full"
              />
            </div>

            {/* Rotation */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Rotation: {selectedItemData.rotation}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                step="15"
                value={selectedItemData.rotation}
                onChange={(e) => handleUpdateItem(selectedItemData.id, {
                  rotation: parseInt(e.target.value)
                })}
                disabled={readOnly}
                className="w-full"
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select an item to edit properties</p>
          </div>
        )}
      </div>

      {/* Media Selector Modal */}
      {showMediaSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select Media
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMediaSelector(false)}
                >
                  ×
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Input
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              )}

              {error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <AlertCircle className="h-5 w-5 text-red-500 inline mr-2" />
                  <span className="text-red-800 dark:text-red-200">
                    {error instanceof Error ? error.message : 'Error loading media'}
                  </span>
                </div>
              ) : null}

              {!isLoading && !error && filteredMedia.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No media found
                </div>
              )}

              {!isLoading && !error && filteredMedia.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMedia.map((media) => {
                    const mediaType = media.mediaType === 'Image' ? MediaType.Image :
                                     media.mediaType === 'Video' ? MediaType.Video :
                                     MediaType.Document

                    return (
                      <div
                        key={media.id}
                        onClick={() => handleAddMedia(media)}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-gray-600 dark:text-gray-400">
                            {getMediaIcon(mediaType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {media.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {media.fileName}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SceneCanvasEditor
