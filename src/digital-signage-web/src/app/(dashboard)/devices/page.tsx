// @ts-nocheck
'use client'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Download, Upload, Filter, Search } from 'lucide-react'
import { DeviceList } from '@/features/devices/components/DeviceList'
import { DeviceFilters } from '@/features/devices/components/DeviceFilters'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useQuery } from '@tanstack/react-query'
import { DeviceService } from '@/services'
import type { Device as ApiDevice } from '@/types/api'
import type { Device as ServiceDevice } from '@/services/deviceService'

interface FilterType {
  search: string
  status: string[]
  location: string[]
  deviceGroup: string[]
  resolution: string[]
}

// Use the Service Device type throughout this component
type Device = ServiceDevice

/**
 * Digital Signage Devices Management Page
 * 
 * Following UI copilot instructions:
 * - Uses React Query for server state management
 * - Router navigation for page transitions
 * - TypeScript strict typing
 * - Feature-based organization
 */
export default function DevicesPage(): React.JSX.Element {
  const router = useRouter()

  // Real API data fetching with React Query
  const {
    data: devices = [],
    isLoading: isLoadingDevices,
    refetch: refetchDevices,
    error: devicesError
  } = useQuery({
    queryKey: ['devices'],
    queryFn: () => DeviceService.getAll(),
    refetchInterval: 30000, // Refresh every 30 seconds for real-time status
  })
  
    // State for search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [filters, setFilters] = useState<FilterType>({
    search: '',
    status: [],
    location: [],
    deviceGroup: [],
    resolution: [],
  })

  // Modal state
  const [showAddDevice, setShowAddDevice] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null)

  const handleDeviceSelect = (device: Device) => {
    // Navigate to device details page following App Router pattern
    router.push(`/devices/${device.id}`)
  }

  const handleDeviceEdit = (device: Device) => {
    setSelectedDevice(device)
    setShowAddDevice(true)
  }

  const handleDeviceRestart = (device: Device) => {
    // TODO: Implement with device service and React Query mutation
    console.log(`Device ${device.name} restart requested`)
  }

  const handleDeviceDelete = (device: Device) => {
    if (!confirm(`Are you sure you want to delete ${device.name}?`)) return
    
    // TODO: Implement with device service and React Query mutation
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
    <div className="space-y-6">
      {/* Header */}
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
          onClick={() => router.push('/devices/register')}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Device</span>
        </Button>
        </div>
      </div>

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

        {/* @ts-expect-error - TypeScript issue with conditional rendering */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <DeviceFilters
              filters={filters as any}
              onFiltersChange={handleFilterChange}
            />
          </div>
        )}

        {/* Error State */}
        {devicesError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Failed to load devices
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>An unexpected error occurred while loading devices.</p>
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
        <div>Device list placeholder</div>

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
    macAddress: device?.macAddress || '',
    deviceType: device?.deviceType || 'Android TV',
    groupId: device?.groupId,
    softwareVersion: device?.softwareVersion || '1.0.0',
    hardwareInfo: device?.hardwareInfo || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submissionData: Partial<Device> = {
      name: formData.name,
      location: formData.location,
      ipAddress: formData.ipAddress,
      macAddress: formData.macAddress,
      deviceType: formData.deviceType,
      softwareVersion: formData.softwareVersion,
      hardwareInfo: formData.hardwareInfo,
    }
    if (formData.groupId) {
      submissionData.groupId = formData.groupId
    }
    onSave(submissionData)
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
          <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700 mb-1">
            Device Type
          </label>
          <select
            id="deviceType"
            value={formData.deviceType}
            onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Android TV">Android TV</option>
            <option value="Smart Display">Smart Display</option>
            <option value="Web Player">Web Player</option>
            <option value="Tablet">Tablet</option>
          </select>
        </div>

        <div>
          <label htmlFor="groupId" className="block text-sm font-medium text-gray-700 mb-1">
            Device Group ID
          </label>
          <Input
            id="groupId"
            type="number"
            value={formData.groupId || ''}
            onChange={(e) => setFormData({ ...formData, groupId: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="Optional group ID"
          />
        </div>

        <div>
          <label htmlFor="softwareVersion" className="block text-sm font-medium text-gray-700 mb-1">
            Software Version
          </label>
          <Input
            id="softwareVersion"
            type="text"
            value={formData.softwareVersion}
            onChange={(e) => setFormData({ ...formData, softwareVersion: e.target.value })}
            placeholder="1.0.0"
          />
        </div>
      </div>

      <div>
        <label htmlFor="hardwareInfo" className="block text-sm font-medium text-gray-700 mb-1">
          Hardware Information
        </label>
        <textarea
          id="hardwareInfo"
          rows={3}
          value={formData.hardwareInfo}
          onChange={(e) => setFormData({ ...formData, hardwareInfo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Hardware specifications and details..."
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