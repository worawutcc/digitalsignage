'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, 
  Search, 
  Filter,
  Grid3x3,
  List,
  Edit,
  Trash2,
  Copy,
  Layout,
  Image as ImageIcon,
  Maximize2,
  Columns,
  Grid2x2,
  PictureInPicture,
  Sidebar,
  ArrowUpDown,
  MoreHorizontal,
  AlertCircle,
  Loader2,
  Layers,
  Sparkles
} from 'lucide-react'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import SceneService from '@/services/sceneService'
import {
  SceneDto,
  SceneLayoutType,
  SceneStatistics,
  getSceneLayoutTypeLabel,
  getSceneLayoutIcon,
  SCENE_TEMPLATES
} from '@/types/scene'

export default function ScenesPage() {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [layoutFilter, setLayoutFilter] = useState<SceneLayoutType[]>([])
  const [templateFilter, setTemplateFilter] = useState<'all' | 'templates' | 'custom'>('all')
  const [selectedScene, setSelectedScene] = useState<SceneDto | null>(null)
  const [showTemplateGallery, setShowTemplateGallery] = useState(false)

  // Fetch scenes
  const { data: scenes = [], isLoading, error } = useQuery<SceneDto[], Error>({
    queryKey: ['scenes'],
    queryFn: () => SceneService.getAll()
  })

  // Fetch statistics
  const { data: stats } = useQuery<SceneStatistics>({
    queryKey: ['scene-stats'],
    queryFn: () => SceneService.getStatistics()
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => SceneService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenes'] })
      queryClient.invalidateQueries({ queryKey: ['scene-stats'] })
    }
  })

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: (id: number) => SceneService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenes'] })
    }
  })

  // Filter scenes
  const filteredScenes = scenes.filter(scene => {
    const matchesSearch = !searchTerm || 
      scene.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scene.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLayout = layoutFilter.length === 0 || 
      layoutFilter.includes(scene.layoutType)
    
    const matchesTemplate = 
      templateFilter === 'all' ||
      (templateFilter === 'templates' && scene.isTemplate) ||
      (templateFilter === 'custom' && !scene.isTemplate)
    
    return matchesSearch && matchesLayout && matchesTemplate
  })

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this scene?')) return
    await deleteMutation.mutateAsync(id)
  }

  const handleDuplicate = async (id: number) => {
    await duplicateMutation.mutateAsync(id)
  }

  const getLayoutIcon = (layoutType: SceneLayoutType) => {
    switch (layoutType) {
      case SceneLayoutType.FullScreen:
        return <Maximize2 className="h-5 w-5" />
      case SceneLayoutType.SplitScreen:
        return <Columns className="h-5 w-5" />
      case SceneLayoutType.Grid:
        return <Grid2x2 className="h-5 w-5" />
      case SceneLayoutType.PictureInPicture:
        return <PictureInPicture className="h-5 w-5" />
      case SceneLayoutType.Sidebar:
        return <Sidebar className="h-5 w-5" />
      default:
        return <Layout className="h-5 w-5" />
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Scenes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage spatial layouts for multi-media displays
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowTemplateGallery(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Scene
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <Layout className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Scenes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalScenes ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <Sparkles className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Templates
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.templateScenes ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <Layers className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Custom
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.customScenes ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <ImageIcon className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Items
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.averageItems ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search scenes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            {/* Template Filter */}
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value as 'all' | 'templates' | 'custom')}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Scenes</option>
              <option value="templates">Templates Only</option>
              <option value="custom">Custom Only</option>
            </select>

            <Button
              variant={layoutFilter.length > 0 ? 'default' : 'outline'}
              onClick={() => {
                // Toggle layout filter (simplified)
                if (layoutFilter.length === 0) {
                  setLayoutFilter([SceneLayoutType.FullScreen])
                } else {
                  setLayoutFilter([])
                }
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Layout {layoutFilter.length > 0 && `(${layoutFilter.length})`}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">
                  Failed to load scenes
                </h3>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredScenes.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-12 text-center">
            <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No scenes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || layoutFilter.length > 0
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first scene or using a template'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setShowTemplateGallery(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Browse Templates
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Scene
              </Button>
            </div>
          </div>
        )}

        {/* Grid View */}
        {!isLoading && !error && viewMode === 'grid' && filteredScenes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onEdit={() => setSelectedScene(scene)}
                getLayoutIcon={getLayoutIcon}
              />
            ))}
          </div>
        )}

        {/* List View */}
        {!isLoading && !error && viewMode === 'list' && filteredScenes.length > 0 && (
          <SceneTable
            scenes={filteredScenes}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onEdit={(scene) => setSelectedScene(scene)}
            getLayoutIcon={getLayoutIcon}
          />
        )}

        {/* Template Gallery Modal */}
        {showTemplateGallery && (
          <TemplateGalleryModal
            onClose={() => setShowTemplateGallery(false)}
            onSelect={(template) => {
              console.log('Selected template:', template)
              setShowTemplateGallery(false)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}

// Scene Card Component
interface SceneCardProps {
  scene: SceneDto
  onDelete: (id: number) => void
  onDuplicate: (id: number) => void
  onEdit: () => void
  getLayoutIcon: (layoutType: SceneLayoutType) => React.ReactElement
}

function SceneCard({ scene, onDelete, onDuplicate, onEdit, getLayoutIcon }: SceneCardProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {scene.name}
              </h3>
              {scene.isTemplate && (
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                  Template
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {scene.description}
            </p>
          </div>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    onEdit()
                    setShowActions(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDuplicate(scene.id)
                    setShowActions(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    onDelete(scene.id)
                    setShowActions(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scene Preview */}
        <div className="mb-4 bg-gray-100 dark:bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
          {getLayoutIcon(scene.layoutType)}
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {getSceneLayoutTypeLabel(scene.layoutType)}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <Layers className="h-4 w-4 mr-1" />
              Items:
            </span>
            <span className="font-medium">{scene.totalItems}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
            <span className="font-medium">{scene.width} × {scene.height}</span>
          </div>
          {scene.backgroundColor && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Background:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: scene.backgroundColor }}
                />
                <span className="font-medium text-xs">{scene.backgroundColor}</span>
              </div>
            </div>
          )}
        </div>

        {scene.createdByUserName && (
          <div className="text-xs text-gray-500 mb-4">
            Created by {scene.createdByUserName}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDuplicate(scene.id)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Scene Table Component
interface SceneTableProps {
  scenes: SceneDto[]
  onDelete: (id: number) => void
  onDuplicate: (id: number) => void
  onEdit: (scene: SceneDto) => void
  getLayoutIcon: (layoutType: SceneLayoutType) => React.ReactElement
}

function SceneTable({ scenes, onDelete, onDuplicate, onEdit, getLayoutIcon }: SceneTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr className="border-b">
              <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Layout</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Items</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Dimensions</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Created By</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scenes.map((scene) => (
              <tr key={scene.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <td className="p-4">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {scene.name}
                      {scene.isTemplate && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                          Template
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {scene.description}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getLayoutIcon(scene.layoutType)}
                    <span className="text-sm">{getSceneLayoutTypeLabel(scene.layoutType)}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {scene.totalItems}
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {scene.width} × {scene.height}
                </td>
                <td className="p-4 text-sm">
                  {scene.isTemplate ? (
                    <span className="text-purple-600 dark:text-purple-400">Template</span>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400">Custom</span>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {scene.createdByUserName || '-'}
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEdit(scene)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDuplicate(scene.id)}
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDelete(scene.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Template Gallery Modal
interface TemplateGalleryModalProps {
  onClose: () => void
  onSelect: (template: typeof SCENE_TEMPLATES[0]) => void
}

function TemplateGalleryModal({ onClose, onSelect }: TemplateGalleryModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Scene Templates
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Choose a pre-built layout to get started quickly
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
            >
              ×
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SCENE_TEMPLATES.map((template) => (
              <div 
                key={template.name}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelect(template)}
              >
                <div className="mb-4 bg-gray-100 dark:bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                  <span className="text-3xl">{getSceneLayoutIcon(template.layoutType)}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {template.description}
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{template.zones.length} zones</span>
                  <span>{template.width}×{template.height}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
