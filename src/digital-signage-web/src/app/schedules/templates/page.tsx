'use client'

import { useState } from 'react'
import { Plus, Copy, Edit, Trash2, Search, Calendar, Clock, Users, ArrowLeft, Eye } from 'lucide-react'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ScheduleTemplates, ScheduleTemplate } from '@/features/schedules/components/ScheduleTemplates'
import Link from 'next/link'
import Image from 'next/image'

// Mock templates data
const mockTemplates: ScheduleTemplate[] = [
  {
    id: '1',
    name: 'Morning Broadcast Template',
    description: 'Standard morning announcements and promotional content',
    category: 'daily',
    duration: '8 hours',
    devices: 15,
    createdBy: 'Admin',
    createdAt: '2025-01-01',
    isDefault: true,
    tags: ['morning', 'daily', 'announcements'],
    previewUrl: '/api/placeholder/template/1/preview'
  },
  {
    id: '2',
    name: 'Holiday Promotion Template',
    description: 'Seasonal promotional content with festive themes',
    category: 'marketing',
    duration: '12 hours',
    devices: 25,
    createdBy: 'Marketing Team',
    createdAt: '2025-01-02',
    isDefault: false,
    tags: ['holiday', 'promotion', 'seasonal'],
    previewUrl: '/api/placeholder/template/2/preview'
  },
  {
    id: '3',
    name: 'Emergency Alert Template',
    description: 'Critical announcements and emergency information',
    category: 'announcements',
    duration: 'Until cleared',
    devices: 50,
    createdBy: 'Safety Team',
    createdAt: '2025-01-03',
    isDefault: false,
    tags: ['emergency', 'critical', 'priority'],
    previewUrl: '/api/placeholder/template/3/preview'
  },
  {
    id: '4',
    name: 'Event Schedule Template',
    description: 'Conference and event scheduling with speaker information',
    category: 'events',
    duration: '2 days',
    devices: 8,
    createdBy: 'Event Manager',
    createdAt: '2025-01-04',
    isDefault: false,
    tags: ['conference', 'speakers', 'agenda'],
    previewUrl: '/api/placeholder/template/4/preview'
  }
]

/**
 * Schedule Templates Management Page
 * Comprehensive template management with preview and analytics
 */
export default function ScheduleTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<ScheduleTemplate | null>(null)

  const categories = ['all', 'daily', 'marketing', 'announcements', 'events', 'custom']

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleUseTemplate = (templateId: string) => {
    console.log('Using template:', templateId)
    // Navigate to schedule builder with template
  }

  const handleCreateTemplate = (templateData: Partial<ScheduleTemplate>) => {
    console.log('Creating template:', templateData)
    setShowCreateModal(false)
  }

  const handleEditTemplate = (templateId: string) => {
    console.log('Editing template:', templateId)
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      console.log('Deleting template:', templateId)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedTemplates.length} selected templates?`)) {
      console.log('Bulk deleting templates:', selectedTemplates)
      setSelectedTemplates([])
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      daily: 'bg-blue-100 text-blue-800',
      marketing: 'bg-green-100 text-green-800',
      announcements: 'bg-yellow-100 text-yellow-800',
      events: 'bg-purple-100 text-purple-800',
      custom: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors.custom
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Schedules', href: '/schedules' },
          { label: 'Templates' }
        ]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/schedules">
                <Button variant="secondary" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Schedules
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Copy className="h-7 w-7" />
                Schedule Templates
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage reusable schedule templates
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Copy className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Templates
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockTemplates.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Devices
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockTemplates.reduce((sum, t) => sum + t.devices, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Most Popular
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Daily
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Default Templates
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockTemplates.filter(t => t.isDefault).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {selectedTemplates.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedTemplates.length} selected
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedTemplates([])}
              >
                Clear
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`
                border rounded-lg overflow-hidden transition-all hover:shadow-lg
                ${selectedTemplates.includes(template.id) 
                  ? 'ring-2 ring-blue-500 border-blue-500' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Template Preview */}
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50">
                {template.previewUrl ? (
                  <Image 
                    src={template.previewUrl} 
                    alt={template.name}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setPreviewTemplate(template)}
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template.id)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </div>

                {/* Default badge */}
                {template.isDefault && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Default
                  </div>
                )}

                {/* Selection checkbox */}
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedTemplates.includes(template.id)}
                    onChange={() => {
                      setSelectedTemplates(prev => 
                        prev.includes(template.id)
                          ? prev.filter(id => id !== template.id)
                          : [...prev, template.id]
                      )
                    }}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {template.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {template.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {template.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {template.devices} devices
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{template.tags.length - 3} more</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    by {template.createdBy}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUseTemplate(template.id)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTemplate(template.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Copy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Create your first schedule template to get started'
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        )}

        {/* Create Template Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Create Schedule Template</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template Name
                      </label>
                      <Input placeholder="Enter template name..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="daily">Daily</option>
                        <option value="marketing">Marketing</option>
                        <option value="announcements">Announcements</option>
                        <option value="events">Events</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Describe this template..."
                    />
                  </div>
                  <div className="text-gray-600">
                    Template configuration details would go here...
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleCreateTemplate({})}>
                    Create Template
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg border shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{previewTemplate.name}</h3>
                  <Button variant="secondary" onClick={() => setPreviewTemplate(null)}>
                    Close
                  </Button>
                </div>
                <div className="text-gray-600 mb-4">
                  Template preview would show detailed schedule configuration, timeline, and content preview here...
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}