'use client'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Plus, Download, Upload, Filter, Search } from 'lucide-react'
import AdminLayout from '@/components/layouts/AdminLayout'
import { DeviceList } from '@/features/devices/components/DeviceList'
import { DeviceFilters } from '@/features/devices/components/DeviceFilters'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { Device } from '@/features/devices/components/DeviceList'

interface FilterType {
  search: string
  status: string[]
  location: string[]
  deviceGroup: string[]
  resolution: string[]
}

// Mock data for development
const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Lobby Display 1',
    location: 'Main Lobby',
    status: 'online',
    resolution: '1920x1080',
    lastSeen: new Date().toISOString(),
    version: '2.1.0',
    ipAddress: '192.168.1.100',
    deviceGroup: 'Lobby Displays',
    uptime: 48,
    currentContent: 'Welcome Presentation'
  },
  {
    id: '2',
    name: 'Conference Room A',
    location: 'Meeting Room A',
    status: 'offline',
    resolution: '3840x2160',
    lastSeen: new Date(Date.now() - 300000).toISOString(),
    version: '2.0.5',
    ipAddress: '192.168.1.101',
    deviceGroup: 'Conference Rooms',
    uptime: 0,
  },
  {
    id: '3',
    name: 'Cafeteria Display',
    location: 'Employee Cafeteria',
    status: 'maintenance',
    resolution: '1920x1080',
    lastSeen: new Date(Date.now() - 1800000).toISOString(),
    version: '2.1.0',
    ipAddress: '192.168.1.102',
    deviceGroup: 'Cafeteria',
    uptime: 12,
    currentContent: 'Menu Board'
  }
]

/**
 * Device management page for digital signage system
 * Provides comprehensive device CRUD operations, filtering, and monitoring
 */
export default function DevicesPage() {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterType>({
    search: '',
    status: [],
    location: [],
    deviceGroup: [],
    resolution: [],
  })

  // Modal states
  const [showAddDevice, setShowAddDevice] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  // Mock state
  const [devices] = useState<Device[]>(mockDevices)
  const [isLoading] = useState(false)
  const [error] = useState<Error | null>(null)

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device)
  }

  const handleDeviceEdit = (device: Device) => {
    setSelectedDevice(device)
    setShowAddDevice(true)
  }

  const handleDeviceRestart = (device: Device) => {
    // Mock restart functionality
    console.log(`Device ${device.name} restart requested`)
  }

  const handleDeviceDelete = (device: Device) => {
    if (!confirm(`Are you sure you want to delete ${device.name}?`)) return
    
    // Mock delete functionality
    console.log(`Device ${device.name} deletion requested`)
  }

  const handleAddDevice = (deviceData: Partial<Device>) => {
    // Mock save functionality
    console.log('Device save requested:', deviceData)
    setShowAddDevice(false)
    setSelectedDevice(null)
  }

  const handleBulkExport = () => {
    // Export filtered devices to CSV
    console.log('Exporting devices to CSV...')
    // Implementation would generate CSV and download
  }

  const handleBulkImport = () => {
    setShowImportModal(true)
  }

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: [],
      location: [],
      deviceGroup: [],
      resolution: [],
    })
    setSearchTerm('')
  }

  // Calculate active filter count
  const activeFilterCount = Object.values(filters).reduce(
    (count, filterArray) => count + filterArray.length,
    0
  ) + (searchTerm ? 1 : 0)

  return (
    <AdminLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Device Management</h1>
            <p className="text-sm text-gray-600">
              Monitor and manage your digital signage devices
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleBulkImport}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleBulkExport}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button
              onClick={() => setShowAddDevice(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Device</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search devices by name, location, or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 ${
                activeFilterCount > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : ''
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <DeviceFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Failed to load devices
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error.message || 'An unexpected error occurred while loading devices.'}</p>
                </div>
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Device List */}
        <DeviceList
          devices={devices}
          loading={isLoading}
          onDeviceSelect={handleDeviceSelect}
          onDeviceEdit={handleDeviceEdit}
          onDeviceRestart={handleDeviceRestart}
          onDeviceDelete={handleDeviceDelete}
        />

        {/* Add/Edit Device Modal */}
        <Modal
          isOpen={showAddDevice}
          onClose={() => {
            setShowAddDevice(false)
            setSelectedDevice(null)
          }}
          title={selectedDevice ? 'Edit Device' : 'Add New Device'}
          size="lg"
        >
          <DeviceForm
            device={selectedDevice}
            onSave={handleAddDevice}
            onCancel={() => {
              setShowAddDevice(false)
              setSelectedDevice(null)
            }}
            loading={false}
          />
        </Modal>

        {/* Import Devices Modal */}
        <Modal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Import Devices"
          size="lg"
        >
          <DeviceImportForm
            onImport={(devices) => {
              // Handle bulk device import
              console.log('Importing devices:', devices)
              setShowImportModal(false)
            }}
            onCancel={() => setShowImportModal(false)}
          />
        </Modal>
      </div>
    </AdminLayout>
  )
}

/**
 * Device form component for creating/editing devices
 */
interface DeviceFormProps {
  device?: Device | null
  onSave: (data: Partial<Device>) => void
  onCancel: () => void
  loading?: boolean
}

function DeviceForm({ device, onSave, onCancel, loading }: DeviceFormProps) {
  const [formData, setFormData] = useState({
    name: device?.name || '',
    location: device?.location || '',
    ipAddress: device?.ipAddress || '',
    macAddress: '',
    resolution: device?.resolution || '1920x1080',
    deviceGroup: device?.deviceGroup || 'Lobby Displays',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Device Name *
          </label>
          <Input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter device name"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <Input
            id="location"
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Enter location"
          />
        </div>

        <div>
          <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 mb-1">
            IP Address *
          </label>
          <Input
            id="ipAddress"
            type="text"
            required
            value={formData.ipAddress}
            onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
            placeholder="192.168.1.100"
          />
        </div>

        <div>
          <label htmlFor="macAddress" className="block text-sm font-medium text-gray-700 mb-1">
            MAC Address
          </label>
          <Input
            id="macAddress"
            type="text"
            value={formData.macAddress}
            onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
            placeholder="00:1B:44:11:3A:B7"
          />
        </div>

        <div>
          <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
            Resolution
          </label>
          <select
            id="resolution"
            value={formData.resolution}
            onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1920x1080">1920x1080 (Full HD)</option>
            <option value="3840x2160">3840x2160 (4K UHD)</option>
            <option value="1366x768">1366x768 (HD)</option>
            <option value="1280x720">1280x720 (HD Ready)</option>
          </select>
        </div>

        <div>
          <label htmlFor="deviceGroup" className="block text-sm font-medium text-gray-700 mb-1">
            Device Group
          </label>
          <select
            id="deviceGroup"
            value={formData.deviceGroup}
            onChange={(e) => setFormData({ ...formData, deviceGroup: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Lobby Displays">Lobby Displays</option>
            <option value="Conference Room Displays">Conference Room Displays</option>
            <option value="Cafeteria Displays">Cafeteria Displays</option>
            <option value="Hallway Displays">Hallway Displays</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional device description..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading || false}
        >
          {device ? 'Update Device' : 'Add Device'}
        </Button>
      </div>
    </form>
  )
}

/**
 * Device import form component for bulk operations
 */
interface DeviceImportFormProps {
  onImport: (devices: Partial<Device>[]) => void
  onCancel: () => void
}

function DeviceImportForm({ onImport, onCancel }: DeviceImportFormProps) {
  const [dragActive, setDragActive] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<Partial<Device>[]>([])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      setCsvFile(file)
      // Parse CSV and set preview data
      // This would be implemented with a CSV parsing library
      console.log('CSV file selected:', file.name)
    } else {
      alert('Please select a CSV file')
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        <p>Import devices from a CSV file. The file should include the following columns:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>name (required)</li>
          <li>location (required)</li>
          <li>ipAddress (required)</li>
          <li>macAddress (optional)</li>
          <li>resolution (optional, defaults to 1920x1080)</li>
          <li>deviceGroup (optional)</li>
        </ul>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          {csvFile ? `Selected: ${csvFile.name}` : 'Click to select or drag and drop your CSV file'}
        </p>
        <p className="text-xs text-gray-500 mt-1">CSV files only</p>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onImport(previewData)}
          disabled={!csvFile}
        >
          Import Devices
        </Button>
      </div>
    </div>
  )
}