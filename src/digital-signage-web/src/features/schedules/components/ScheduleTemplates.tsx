import { useState } from 'react'
import { Copy, Plus, Edit, Trash2, Clock, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export interface ScheduleTemplate {
  id: string
  name: string
  description: string
  category: string
  duration: string
  devices: number
  createdBy: string
  createdAt: string
  isDefault: boolean
  previewUrl?: string
  tags: string[]
}

interface ScheduleTemplatesProps {
  templates: ScheduleTemplate[]
  onUseTemplate: (templateId: string) => void
  onCreateTemplate: (templateData: Partial<ScheduleTemplate>) => void
  onEditTemplate: (templateId: string) => void
  onDeleteTemplate: (templateId: string) => void
  className?: string
}

/**
 * Schedule templates management component
 * Allows creating, managing, and using schedule templates
 */
export function ScheduleTemplates({
  templates,
  onUseTemplate,
  onCreateTemplate,
  onEditTemplate,
  onDeleteTemplate,
  className = ''
}: ScheduleTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const categories = ['all', 'marketing', 'announcements', 'events', 'daily', 'custom']
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      marketing: 'bg-blue-100 text-blue-800',
      announcements: 'bg-green-100 text-green-800',
      events: 'bg-purple-100 text-purple-800',
      daily: 'bg-orange-100 text-orange-800',
      custom: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors.custom
  }

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Copy className="h-5 w-5" />
          Schedule Templates
        </h3>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
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

      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Template header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {template.description}
                </p>
              </div>
              
              {template.isDefault && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Default
                </span>
              )}
            </div>

            {/* Template metadata */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {template.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {template.devices} devices
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
                  {template.category}
                </span>
                {template.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Template actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                by {template.createdBy}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onUseTemplate(template.id)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Use
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditTemplate(template.id)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteTemplate(template.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
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
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      )}

      {/* Create template modal placeholder */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border shadow-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create Template</h3>
              <p className="text-gray-600">Template creation form would go here...</p>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateForm(false)}>
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}