'use client'

import { useState } from 'react'
import { 
  QrCode, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Copy, 
  Edit, 
  Trash2,
  Link,
  Smartphone,
  Users,
  ExternalLink,
  BarChart3,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  useQRCodes, 
  useQRCodeStats, 
  useCreateQRCode, 
  useUpdateQRCode, 
  useDeleteQRCode, 
  useDownloadQRCode 
} from '@/hooks/useQRCodes'
import { type QRCode, type CreateQRCodeRequest } from '@/services/qrCodeService'

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'url':
      return <Link className="h-4 w-4" />
    case 'wifi':
      return <Smartphone className="h-4 w-4" />
    case 'phone':
      return <Users className="h-4 w-4" />
    case 'email':
      return <ExternalLink className="h-4 w-4" />
    default:
      return <QrCode className="h-4 w-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'inactive':
      return 'bg-gray-100 text-gray-800'
    case 'expired':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return 'N/A'
  }
}

const formatRelativeTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  } catch {
    return 'N/A'
  }
}

export default function QRCodesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('url')
  const [formData, setFormData] = useState<Partial<CreateQRCodeRequest>>({
    name: '',
    type: 'url',
    content: '',
    description: '',
  })

  // React Query hooks
  const { data: qrCodes = [], isLoading, error } = useQRCodes()
  const { data: stats } = useQRCodeStats()
  const createQRCodeMutation = useCreateQRCode()
  const deleteQRCodeMutation = useDeleteQRCode()
  const downloadQRCodeMutation = useDownloadQRCode()

  // Filter QR codes based on search term
  const filteredQRCodes = qrCodes.filter(qr =>
    qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateQRCode = async () => {
    if (!formData.name || !formData.content) return

    try {
      await createQRCodeMutation.mutateAsync(formData as CreateQRCodeRequest)
      setShowCreateModal(false)
      setFormData({
        name: '',
        type: 'url',
        content: '',
        description: '',
      })
    } catch (error) {
      console.error('Failed to create QR code:', error)
    }
  }

  const handleDeleteQRCode = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteQRCodeMutation.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete QR code:', error)
      }
    }
  }

  const handleDownloadQRCode = async (id: string, name: string) => {
    try {
      await downloadQRCodeMutation.mutateAsync({ id, name })
    } catch (error) {
      console.error('Failed to download QR code:', error)
    }
  }

  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy content:', error)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading QR codes</h3>
          <p className="text-red-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              QR Code Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage QR codes for your digital signage displays
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create QR Code
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <QrCode className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total QR Codes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalQRCodes || qrCodes.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Scans
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.totalScans || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active QR Codes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.activeQRCodes || qrCodes.filter(qr => qr.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Scans/Code
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : Math.round((stats?.totalScans || 0) / Math.max(stats?.totalQRCodes || 1, 1))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search QR codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* QR Codes Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading QR codes...</p>
            </div>
          ) : filteredQRCodes.length === 0 ? (
            <div className="p-8 text-center">
              <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No QR codes found' : 'No QR codes yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms.' 
                  : 'Create your first QR code to get started.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create QR Code
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">QR Code</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-left p-4">Device</th>
                    <th className="text-left p-4">Scans</th>
                    <th className="text-left p-4">Last Scanned</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQRCodes.map((qrCode) => (
                    <tr key={qrCode.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                            <QrCode className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {qrCode.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {qrCode.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          {getTypeIcon(qrCode.type)}
                          <span className="ml-2 text-sm capitalize">
                            {qrCode.type}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {qrCode.deviceName || 'Unassigned'}
                          </div>
                          {qrCode.deviceId && (
                            <div className="text-gray-500 text-xs">
                              ID: {qrCode.deviceId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(qrCode.scans || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-500">
                          {qrCode.lastScanned ? formatRelativeTime(qrCode.lastScanned) : 'Never'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(qrCode.status)}`}>
                          {qrCode.status}
                        </span>
                        {qrCode.expiryDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Expires: {formatDate(qrCode.expiryDate)}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" title="View QR Code">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Download"
                            onClick={() => handleDownloadQRCode(qrCode.id, qrCode.name)}
                            disabled={downloadQRCodeMutation.isPending}
                          >
                            {downloadQRCodeMutation.isPending ? 
                              <Loader2 className="h-4 w-4 animate-spin" /> : 
                              <Download className="h-4 w-4" />
                            }
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Copy Content"
                            onClick={() => handleCopyContent(qrCode.content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Delete"
                            onClick={() => handleDeleteQRCode(qrCode.id, qrCode.name)}
                            disabled={deleteQRCodeMutation.isPending}
                          >
                            {deleteQRCodeMutation.isPending ? 
                              <Loader2 className="h-4 w-4 animate-spin" /> : 
                              <Trash2 className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create QR Code Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-lg w-full max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Create New QR Code
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      QR Code Name *
                    </label>
                    <Input 
                      placeholder="Enter QR code name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={2}
                      placeholder="Describe this QR code..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      QR Code Type
                    </label>
                    <select 
                      value={formData.type || 'url'}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="url">Website URL</option>
                      <option value="wifi">WiFi Credentials</option>
                      <option value="text">Plain Text</option>
                      <option value="email">Email Address</option>
                      <option value="phone">Phone Number</option>
                      <option value="sms">SMS Message</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content *
                    </label>
                    {formData.type === 'url' && (
                      <Input 
                        placeholder="https://example.com"
                        value={formData.content || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      />
                    )}
                    {formData.type === 'text' && (
                      <textarea 
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                        rows={3}
                        placeholder="Enter your text content..."
                        value={formData.content || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      />
                    )}
                    {formData.type === 'email' && (
                      <Input 
                        placeholder="email@example.com" 
                        type="email"
                        value={formData.content || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      />
                    )}
                    {formData.type === 'phone' && (
                      <Input 
                        placeholder="+1 (555) 123-4567" 
                        type="tel"
                        value={formData.content || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      />
                    )}
                    {/* Additional type-specific inputs can be added here */}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Assign to Device
                      </label>
                      <select 
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        value={formData.deviceId || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, deviceId: e.target.value }))}
                      >
                        <option value="">Select Device</option>
                        {/* Device options would be populated from useDevices hook */}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expiry Date (Optional)
                      </label>
                      <Input 
                        type="date"
                        value={formData.expiryDate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={createQRCodeMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateQRCode}
                    disabled={createQRCodeMutation.isPending || !formData.name || !formData.content}
                  >
                    {createQRCodeMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create QR Code'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}