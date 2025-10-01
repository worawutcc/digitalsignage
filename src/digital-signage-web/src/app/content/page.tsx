'use client'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  Trash2,
  FileImage,
  FileVideo,
  FileText,
  HardDrive,
  TrendingUp,
  X,
  SlidersHorizontal
} from 'lucide-react'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { MediaGrid, MediaFile } from '@/features/media/components/MediaGrid'
import { FileUpload } from '@/features/media/components/FileUpload'
import { MediaPreview } from '@/features/media/components/MediaPreview'
import { useMedia, MediaFilters } from '@/features/media/hooks/useMedia'
import { cn } from '@/lib/utils'

/**
 * Media management page for digital signage system
 * Provides comprehensive media file management with upload, preview, and organization features
 */
export default function ContentPage() {
  // State for view mode and filters
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<MediaFilters>({})
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null)

  // Media data and operations
  const { 
    media, 
    mediaStats, 
    isLoading,
    error,
    createMedia,
    updateMedia,
    deleteMedia,
    uploadMedia,
    filterMedia,
    sortMedia,
    getFilterOptions
  } = useMedia()

  // Apply filters and search to media
  const filteredMedia = filterMedia(media, {
    search: searchTerm,
    ...filters
  })

  // Sort media by date (newest first) by default
  const sortedMedia = sortMedia(filteredMedia, 'createdAt', 'desc')

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const handleItemSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleItemPreview = (media: MediaFile) => {
    setPreviewMedia(media)
    setShowPreviewModal(true)
  }

  const handleItemEdit = (media: MediaFile) => {
    // Open edit modal - would be implemented with a form
    console.log('Edit media:', media)
  }

  const handleItemDelete = (media: MediaFile) => {
    if (confirm(`Are you sure you want to delete "${media.name}"?`)) {
      deleteMedia(media.id)
    }
  }

  const handleItemDownload = (media: MediaFile) => {
    // In a real app, this would get a presigned download URL
    const link = document.createElement('a')
    link.href = media.url
    link.download = media.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return
    
    if (confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      selectedItems.forEach(id => deleteMedia(id))
      setSelectedItems([])
    }
  }

  const handleFileUpload = async (files: File[]) => {
    try {
      for (const file of files) {
        await uploadMedia({ 
          file, 
          onProgress: (progress) => console.log(`Upload progress: ${progress}%`) 
        })
      }
      setShowUploadModal(false)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({})
    setSelectedItems([])
  }

  const filterOptions = getFilterOptions(media)

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Error loading media</div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Media Library</h1>
            <p className="text-sm text-gray-600">
              Manage your digital signage content and media files
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => {/* Export functionality */}}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Media</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileImage className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Images</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {mediaStats?.byType.image || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <FileVideo className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Videos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {mediaStats?.byType.video || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Documents</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {mediaStats?.byType.document || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <HardDrive className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {mediaStats?.totalSize ? formatFileSize(mediaStats.totalSize) : '0 B'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search media files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Filter Toggle */}
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </Button>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-200 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none border-l border-gray-200"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
                  <span className="text-sm text-gray-600">
                    {selectedItems.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* File Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={filters.type?.[0] || ''}
                    onChange={(e) => {
                      const newFilters = { ...filters }
                      if (e.target.value) {
                        newFilters.type = [e.target.value as 'image' | 'video' | 'document' | 'other']
                      } else {
                        delete newFilters.type
                      }
                      setFilters(newFilters)
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="document">Documents</option>
                  </select>
                </div>

                {/* Size Filter - simplified without dedicated interface */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">Any Size</option>
                    <option value="small">Small (&lt; 1MB)</option>
                    <option value="medium">Medium (1-10MB)</option>
                    <option value="large">Large (&gt; 10MB)</option>
                  </select>
                </div>

                {/* Date Filter - simplified */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Added
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">Any Date</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {/* Tags Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <select
                    value={filters.tags?.[0] || ''}
                    onChange={(e) => {
                      const newFilters = { ...filters }
                      if (e.target.value) {
                        newFilters.tags = [e.target.value]
                      } else {
                        delete newFilters.tags
                      }
                      setFilters(newFilters)
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">All Tags</option>
                    {filterOptions.tags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="sm:col-span-2 lg:col-span-2 flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear Filters</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Media Grid/List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading media...</p>
            </div>
          ) : sortedMedia.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || Object.keys(filters).length > 0 
                  ? 'No media files match your search criteria'
                  : 'No media files uploaded yet'
                }
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm || Object.keys(filters).length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first media file to get started'
                }
              </p>
            </div>
          ) : (
            <MediaGrid
              media={sortedMedia}
              viewMode={viewMode}
              selectedItems={selectedItems}
              onItemSelect={handleItemSelect}
              onItemPreview={handleItemPreview}
              onItemEdit={handleItemEdit}
              onItemDelete={handleItemDelete}
              onItemDownload={handleItemDownload}
            />
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Media Files"
        size="lg"
      >
        <FileUpload onFilesSelected={handleFileUpload} />
      </Modal>

      {/* Preview Modal */}
      {showPreviewModal && previewMedia && (
        <MediaPreview
          media={previewMedia}
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          onEdit={handleItemEdit}
          onDelete={handleItemDelete}
          onDownload={handleItemDownload}
        />
      )}
    </AdminLayout>
  )
}