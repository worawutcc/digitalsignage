'use client'

import { useState } from 'react'
import { 
  Plus, 
  QrCode,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  Smartphone,
  Link,
  Calendar,
  Users,
  BarChart3,
  RefreshCw,
  Share2,
  ExternalLink
} from 'lucide-react'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface QRCode {
  id: string
  name: string
  type: 'url' | 'wifi' | 'text' | 'email' | 'phone' | 'sms'
  content: string
  description: string
  scans: number
  lastScanned: string
  createdDate: string
  status: 'active' | 'inactive' | 'expired'
  expiryDate?: string
  deviceId?: string
  deviceName?: string
}

const mockQRCodes: QRCode[] = [
  {
    id: '1',
    name: 'Lobby WiFi Access',
    type: 'wifi',
    content: 'WIFI:T:WPA;S:CompanyGuest;P:guest123;H:false;;',
    description: 'Guest WiFi credentials for lobby visitors',
    scans: 1234,
    lastScanned: '2 hours ago',
    createdDate: '2024-12-15',
    status: 'active',
    deviceId: 'device-1',
    deviceName: 'Lobby Display 1'
  },
  {
    id: '2',
    name: 'Product Demo Video',
    type: 'url',
    content: 'https://company.com/products/demo',
    description: 'Link to product demonstration video',
    scans: 856,
    lastScanned: '15 minutes ago',
    createdDate: '2024-12-10',
    status: 'active',
    deviceId: 'device-2',
    deviceName: 'Conference Room A'
  },
  {
    id: '3',
    name: 'Customer Support',
    type: 'phone',
    content: 'tel:+1234567890',
    description: 'Direct line to customer support',
    scans: 423,
    lastScanned: '1 day ago',
    createdDate: '2024-12-01',
    status: 'active',
    deviceId: 'device-3',
    deviceName: 'Reception Display'
  },
  {
    id: '4',
    name: 'Event Registration',
    type: 'url',
    content: 'https://company.com/events/register',
    description: 'Registration form for upcoming event',
    scans: 234,
    lastScanned: '3 days ago',
    createdDate: '2024-11-25',
    status: 'expired',
    expiryDate: '2024-12-31',
    deviceId: 'device-4',
    deviceName: 'Cafeteria Screen'
  }
]

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

export default function QRCodesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('url')

  const filteredQRCodes = mockQRCodes.filter(qr =>
    qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalScans = mockQRCodes.reduce((acc, qr) => acc + qr.scans, 0)
  const activeQRCodes = mockQRCodes.filter(qr => qr.status === 'active').length

  return (
    <AdminLayout>
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
                  {mockQRCodes.length}
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
                  {totalScans.toLocaleString()}
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
                  {activeQRCodes}
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
                  {Math.round(totalScans / mockQRCodes.length)}
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
                            {qrCode.description}
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
                        {qrCode.scans.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-500">
                        {qrCode.lastScanned}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(qrCode.status)}`}>
                        {qrCode.status}
                      </span>
                      {qrCode.expiryDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          Expires: {qrCode.expiryDate}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" title="View QR Code">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Copy Link">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                      QR Code Name
                    </label>
                    <Input placeholder="Enter QR code name" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={2}
                      placeholder="Describe this QR code..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      QR Code Type
                    </label>
                    <select 
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
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
                      Content
                    </label>
                    {selectedType === 'url' && (
                      <Input placeholder="https://example.com" />
                    )}
                    {selectedType === 'wifi' && (
                      <div className="space-y-2">
                        <Input placeholder="Network Name (SSID)" />
                        <Input placeholder="Password" type="password" />
                        <select className="w-full p-3 border border-gray-300 rounded-lg">
                          <option value="WPA">WPA/WPA2</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">No Password</option>
                        </select>
                      </div>
                    )}
                    {selectedType === 'text' && (
                      <textarea 
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                        rows={3}
                        placeholder="Enter your text content..."
                      />
                    )}
                    {selectedType === 'email' && (
                      <Input placeholder="email@example.com" type="email" />
                    )}
                    {selectedType === 'phone' && (
                      <Input placeholder="+1 (555) 123-4567" type="tel" />
                    )}
                    {selectedType === 'sms' && (
                      <div className="space-y-2">
                        <Input placeholder="Phone Number" type="tel" />
                        <textarea 
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                          rows={2}
                          placeholder="SMS message..."
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Assign to Device
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option value="">Select Device</option>
                        <option value="device-1">Lobby Display 1</option>
                        <option value="device-2">Conference Room A</option>
                        <option value="device-3">Reception Display</option>
                        <option value="device-4">Cafeteria Screen</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expiry Date (Optional)
                      </label>
                      <Input type="date" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button>
                    Create QR Code
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