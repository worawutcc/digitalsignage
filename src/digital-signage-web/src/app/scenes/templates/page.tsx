/**
 * Scene Template Gallery Demo Page
 * Demonstrates SceneTemplateGallery component usage
 */

'use client'

import React, { useState } from 'react'
import { ArrowLeft, Eye, X } from 'lucide-react'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { SceneTemplateGallery } from '@/components/scenes'
import { SceneDto } from '@/types/scene'
import Link from 'next/link'

export default function SceneTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<SceneDto | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<SceneDto | null>(null)

  const breadcrumbs = [
    { label: 'Scenes', href: '/scenes' },
    { label: 'Templates', href: '/scenes/templates' }
  ]

  const handleSelectTemplate = (template: SceneDto) => {
    setSelectedTemplate(template)
    console.log('Selected template:', template)
  }

  const handlePreviewTemplate = (template: SceneDto) => {
    setPreviewTemplate(template)
  }

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      // Navigate to scene creation with template
      console.log('Using template:', selectedTemplate)
      // TODO: Implement navigation to scene creation
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumbs items={breadcrumbs} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              Scene Templates
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Browse and select from pre-designed scene templates
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/scenes">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Scenes
              </Button>
            </Link>
            {selectedTemplate && (
              <Button onClick={handleUseTemplate}>
                Use Selected Template
              </Button>
            )}
          </div>
        </div>

        {/* Selected Template Info */}
        {selectedTemplate && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  Selected Template
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {selectedTemplate.templateName || selectedTemplate.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Template Gallery */}
        <SceneTemplateGallery
          onSelectTemplate={handleSelectTemplate}
          onPreviewTemplate={handlePreviewTemplate}
          showFilter={true}
          showSearch={true}
          columns={3}
        />

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {previewTemplate.templateName || previewTemplate.name}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewTemplate(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Template Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Layout Type
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {previewTemplate.layoutType}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Dimensions
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {previewTemplate.width} × {previewTemplate.height}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Items
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {previewTemplate.totalItems} items
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Background
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {previewTemplate.backgroundColor || 'None'}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {previewTemplate.description || 'No description available'}
                    </p>
                  </div>

                  {/* Scene Items */}
                  {previewTemplate.sceneItems && previewTemplate.sceneItems.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Scene Items ({previewTemplate.sceneItems.length})
                      </label>
                      <div className="space-y-2">
                        {previewTemplate.sceneItems.map((item, index) => (
                          <div
                            key={item.id}
                            className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {item.mediaName}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {item.width}×{item.height}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Position: ({item.x}, {item.y}) • Z-Index: {item.zIndex}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewTemplate(null)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedTemplate(previewTemplate)
                      setPreviewTemplate(null)
                    }}
                  >
                    Use This Template
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
