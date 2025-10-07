/**
 * Scene Template Gallery Component
 * Reusable component for browsing and selecting scene templates
 * Follows copilot-instructions-ui.instructions.md patterns
 */

'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Grid3x3, 
  Layout, 
  Maximize, 
  Columns, 
  PictureInPicture,
  Sidebar as SidebarIcon,
  PanelTop,
  PanelBottom,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  Check,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SceneService } from '@/services/sceneService'
import { SceneDto, SceneLayoutType, getSceneLayoutTypeLabel } from '@/types/scene'

/**
 * Props for SceneTemplateGallery component
 */
export interface SceneTemplateGalleryProps {
  /** Callback when a template is selected */
  onSelectTemplate: (template: SceneDto) => void
  
  /** Callback when preview is requested */
  onPreviewTemplate?: (template: SceneDto) => void
  
  /** Optional filter by layout type */
  layoutTypeFilter?: SceneLayoutType
  
  /** Optional className for custom styling */
  className?: string
  
  /** Show layout type filter */
  showFilter?: boolean
  
  /** Show search bar */
  showSearch?: boolean
  
  /** Number of columns in grid */
  columns?: 2 | 3 | 4
}

/**
 * Get icon for layout type
 */
const getLayoutIcon = (layoutType: SceneLayoutType) => {
  const iconClass = "h-5 w-5"
  
  switch (layoutType) {
    case SceneLayoutType.FullScreen:
      return <Maximize className={iconClass} />
    case SceneLayoutType.SplitScreen:
      return <Columns className={iconClass} />
    case SceneLayoutType.Grid:
      return <Grid3x3 className={iconClass} />
    case SceneLayoutType.PictureInPicture:
      return <PictureInPicture className={iconClass} />
    case SceneLayoutType.Sidebar:
      return <SidebarIcon className={iconClass} />
    case SceneLayoutType.Header:
      return <PanelTop className={iconClass} />
    case SceneLayoutType.Footer:
      return <PanelBottom className={iconClass} />
    case SceneLayoutType.Custom:
    default:
      return <Layout className={iconClass} />
  }
}

/**
 * Get color class for layout type
 */
const getLayoutColor = (layoutType: SceneLayoutType): string => {
  switch (layoutType) {
    case SceneLayoutType.FullScreen:
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
    case SceneLayoutType.SplitScreen:
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
    case SceneLayoutType.Grid:
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
    case SceneLayoutType.PictureInPicture:
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
    case SceneLayoutType.Sidebar:
      return 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300'
    case SceneLayoutType.Header:
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
    case SceneLayoutType.Footer:
      return 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300'
    case SceneLayoutType.Custom:
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
  }
}

/**
 * Scene Template Gallery Component
 * Displays a grid of scene templates with filtering and selection
 */
export function SceneTemplateGallery({
  onSelectTemplate,
  onPreviewTemplate,
  layoutTypeFilter,
  className = '',
  showFilter = true,
  showSearch = true,
  columns = 3
}: SceneTemplateGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLayoutType, setSelectedLayoutType] = useState<SceneLayoutType | 'all'>(
    layoutTypeFilter ?? 'all'
  )
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)

  // Fetch templates from API
  const { data: templates = [], isLoading, error } = useQuery<SceneDto[], Error>({
    queryKey: ['scene-templates'],
    queryFn: () => SceneService.getTemplates()
  })

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      searchTerm === '' ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.templateName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesLayout = 
      selectedLayoutType === 'all' || 
      template.layoutType === selectedLayoutType
    
    return matchesSearch && matchesLayout
  })

  // Handle template selection
  const handleSelect = (template: SceneDto) => {
    setSelectedTemplate(template.id)
    onSelectTemplate(template)
  }

  // Handle preview
  const handlePreview = (template: SceneDto, e: React.MouseEvent) => {
    e.stopPropagation()
    onPreviewTemplate?.(template)
  }

  // Grid column classes
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  // Layout type options for filter
  const layoutTypes = [
    { value: 'all' as const, label: 'All Layouts', icon: <Layout className="h-4 w-4" /> },
    { value: SceneLayoutType.FullScreen, label: 'Full Screen', icon: <Maximize className="h-4 w-4" /> },
    { value: SceneLayoutType.SplitScreen, label: 'Split Screen', icon: <Columns className="h-4 w-4" /> },
    { value: SceneLayoutType.Grid, label: 'Grid', icon: <Grid3x3 className="h-4 w-4" /> },
    { value: SceneLayoutType.PictureInPicture, label: 'PiP', icon: <PictureInPicture className="h-4 w-4" /> },
    { value: SceneLayoutType.Sidebar, label: 'Sidebar', icon: <SidebarIcon className="h-4 w-4" /> },
    { value: SceneLayoutType.Header, label: 'Header', icon: <PanelTop className="h-4 w-4" /> },
    { value: SceneLayoutType.Footer, label: 'Footer', icon: <PanelBottom className="h-4 w-4" /> }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      {(showSearch || showFilter) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Layout Type Filter */}
          {showFilter && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedLayoutType}
                onChange={(e) => setSelectedLayoutType(
                  e.target.value === 'all' ? 'all' : parseInt(e.target.value) as SceneLayoutType
                )}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {layoutTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error loading templates
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error.message}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredTemplates.length === 0 && (
        <div className="text-center py-20">
          <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || selectedLayoutType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No scene templates available'}
          </p>
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && !error && filteredTemplates.length > 0 && (
        <div className={`grid ${gridCols[columns]} gap-6`}>
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleSelect(template)}
              className={`
                relative bg-white dark:bg-gray-800 rounded-lg border shadow-sm 
                hover:shadow-md transition-all cursor-pointer
                ${selectedTemplate === template.id 
                  ? 'ring-2 ring-blue-500 border-blue-500' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }
              `}
            >
              {/* Selected Indicator */}
              {selectedTemplate === template.id && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1 z-10">
                  <Check className="h-4 w-4" />
                </div>
              )}

              {/* Template Preview Area */}
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-lg overflow-hidden">
                {/* Background Image if available */}
                {template.backgroundImageName && (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
                )}
                
                {/* Layout Type Visual Indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-300 dark:text-gray-600">
                    {getLayoutIcon(template.layoutType)}
                  </div>
                </div>

                {/* Overlay on Hover */}
                {onPreviewTemplate && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                    <Button
                      size="sm"
                      onClick={(e) => handlePreview(template, e)}
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                )}

                {/* Items Count Badge */}
                <div className="absolute bottom-3 left-3 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                  {template.totalItems} {template.totalItems === 1 ? 'item' : 'items'}
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1">
                    {template.templateName || template.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 min-h-[40px]">
                  {template.description || 'No description available'}
                </p>

                {/* Layout Type Badge */}
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getLayoutColor(template.layoutType)}`}>
                    {getLayoutIcon(template.layoutType)}
                    {getSceneLayoutTypeLabel(template.layoutType)}
                  </span>
                  
                  {/* Dimensions */}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {template.width}×{template.height}
                  </span>
                </div>

                {/* Creator Info */}
                {template.createdByUserName && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    Created by {template.createdByUserName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Count */}
      {!isLoading && !error && filteredTemplates.length > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredTemplates.length} of {templates.length} templates
        </div>
      )}
    </div>
  )
}

export default SceneTemplateGallery
