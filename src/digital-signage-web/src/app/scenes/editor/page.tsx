/**
 * Scene Canvas Editor Demo Page
 * Demonstrates SceneCanvasEditor component usage
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SceneCanvasEditor } from '@/components/scenes'
import { SceneItemDto, CreateSceneItemRequest } from '@/types/scene'
import { MediaType } from '@/types/media'

export default function SceneEditorPage() {
  const router = useRouter()
  
  // Demo scene configuration
  const [sceneWidth] = useState(1920)
  const [sceneHeight] = useState(1080)
  const [backgroundColor] = useState('#1e1e1e')
  
  // Demo scene items
  const [sceneItems, setSceneItems] = useState<SceneItemDto[]>([
    {
      id: 1,
      sceneId: 1,
      mediaId: 101,
      mediaName: 'Welcome Banner',
      mediaFileName: 'welcome.jpg',
      mediaType: MediaType.Image,
      x: 100,
      y: 100,
      width: 800,
      height: 450,
      zIndex: 0,
      opacity: 1.0,
      rotation: 0,
      animationIn: null,
      animationOut: null,
      animationDuration: 0,
      durationSeconds: 10,
      useCustomDuration: false
    },
    {
      id: 2,
      sceneId: 1,
      mediaId: 102,
      mediaName: 'Company Logo',
      mediaFileName: 'logo.png',
      mediaType: MediaType.Image,
      x: 1400,
      y: 50,
      width: 400,
      height: 200,
      zIndex: 1,
      opacity: 0.9,
      rotation: 0,
      animationIn: null,
      animationOut: null,
      animationDuration: 0,
      durationSeconds: 10,
      useCustomDuration: false
    }
  ])

  const handleItemsChange = (items: SceneItemDto[]) => {
    setSceneItems(items)
    console.log('Scene items updated:', items)
  }

  const handleAddItem = (request: CreateSceneItemRequest) => {
    console.log('Add item request:', request)
    // In real app, would call API here
  }

  const handleRemoveItem = (itemId: number) => {
    console.log('Remove item:', itemId)
    // In real app, would call API here
  }

  const handleSave = () => {
    console.log('Save scene with items:', sceneItems)
    alert('Scene saved! Check console for details.')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Scene Canvas Editor Demo
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Visual scene layout editor with drag-drop and resize controls
              </p>
            </div>
          </div>

          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Scene
          </Button>
        </div>

        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-600 dark:text-gray-400">
          <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer">
            Scenes
          </span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">
            Editor Demo
          </span>
        </nav>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ✨ Features
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• <strong>Drag-and-Drop:</strong> Click and drag items to reposition</li>
            <li>• <strong>Resize:</strong> Use corner/edge handles to resize items</li>
            <li>• <strong>Layer Management:</strong> Control z-index with Bring to Front/Send to Back</li>
            <li>• <strong>Visual Controls:</strong> Adjust opacity (slider) and rotation (slider)</li>
            <li>• <strong>Alignment:</strong> Center items horizontally or vertically</li>
            <li>• <strong>Grid Snapping:</strong> Toggle grid for precise positioning (20px grid)</li>
            <li>• <strong>Zoom:</strong> Zoom in/out for detailed editing</li>
            <li>• <strong>Properties Panel:</strong> Edit position, size, and visual properties manually</li>
          </ul>
        </div>

        {/* Scene Configuration */}
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Scene Configuration
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Width:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {sceneWidth}px
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Height:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {sceneHeight}px
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Aspect Ratio:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                16:9 (Full HD)
              </span>
            </div>
          </div>
        </div>

        {/* Canvas Editor */}
        <SceneCanvasEditor
          width={sceneWidth}
          height={sceneHeight}
          items={sceneItems}
          onItemsChange={handleItemsChange}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          backgroundColor={backgroundColor}
          enableGrid={true}
          gridSize={20}
        />

        {/* Item List */}
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Scene Items ({sceneItems.length})
          </h3>
          <div className="space-y-2">
            {sceneItems
              .sort((a, b) => b.zIndex - a.zIndex)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium px-2 py-1 rounded">
                      Z: {item.zIndex}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.mediaName}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {item.width} × {item.height} at ({item.x}, {item.y})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <span>Opacity: {Math.round(item.opacity * 100)}%</span>
                    <span>Rotation: {item.rotation}°</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
