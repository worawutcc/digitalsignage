'use client'

/**
 * Device Configuration Modal Component
 * 
 * Modal for creating and editing Android TV device configurations.
 * Follows UI copilot instructions:
 * - React Hook Form + Zod for form validation
 * - TypeScript strict typing
 * - Tailwind CSS for styling
 * - Client Component for interactivity
 * - React Query for API state management
 * 
 * @see DeviceConfigurationModal.types.ts
 * @see copilot-instructions-ui.instructions.md - Form Handling Rules
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Settings, Monitor, Wifi, Power, Shield } from 'lucide-react'
import { 
  useCreateDeviceConfiguration, 
  useUpdateDeviceConfiguration 
} from '@/hooks/useDeviceDetail'
import { 
  DeviceConfigurationModalProps,
  DeviceConfigurationFormData,
  deviceConfigurationSchema 
} from './DeviceConfigurationModal.types'

/**
 * Device Configuration Modal
 * 
 * Provides form for creating or editing device configuration.
 * Handles both create mode (no existing config) and edit mode (with config).
 */
export function DeviceConfigurationModal({
  isOpen,
  onClose,
  deviceId,
  deviceName,
  configuration,
  onSuccess,
}: DeviceConfigurationModalProps) {
  const isEditMode = !!configuration

  // React Query mutations
  const createMutation = useCreateDeviceConfiguration()
  const updateMutation = useUpdateDeviceConfiguration()

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<DeviceConfigurationFormData>({
    resolver: zodResolver(deviceConfigurationSchema),
    defaultValues: {
      displayOrientation: 'landscape',
      resolution: '1920x1080',
      refreshRate: 60,
      screenTimeout: 300,
      powerManagement: 'standard',
      remoteManagementEnabled: true,
      networkConfig: '',
      appPermissions: '',
      proxySettings: '',
    },
  })

  // Populate form when editing existing configuration
  useEffect(() => {
    if (configuration) {
      setValue('displayOrientation', configuration.displayOrientation)
      setValue('resolution', configuration.resolution || '1920x1080')
      setValue('refreshRate', configuration.refreshRate)
      setValue('screenTimeout', configuration.screenTimeout)
      setValue('powerManagement', configuration.powerManagement)
      setValue('remoteManagementEnabled', configuration.remoteManagementEnabled)
      setValue('networkConfig', configuration.networkConfig || '')
      setValue('appPermissions', configuration.appPermissions || '')
      setValue('proxySettings', configuration.proxySettings || '')
    }
  }, [configuration, setValue])

  // Form submission handler
  const onSubmit = async (data: DeviceConfigurationFormData) => {
    // Transform form data to match backend DTO (capitalize orientation)
    const configData: any = {
      displayOrientation: (data.displayOrientation.charAt(0).toUpperCase() + 
        data.displayOrientation.slice(1)) as 'Landscape' | 'Portrait',
      refreshRate: data.refreshRate,
      screenTimeout: data.screenTimeout,
      powerManagement: data.powerManagement,
      remoteManagementEnabled: data.remoteManagementEnabled,
    }
    
    // Add optional properties only if they have values
    if (data.resolution) configData.resolution = data.resolution
    if (data.networkConfig) configData.networkConfig = data.networkConfig
    if (data.appPermissions) configData.appPermissions = data.appPermissions
    if (data.proxySettings) configData.proxySettings = data.proxySettings
    
    // Use appropriate mutation based on mode
    const mutation = isEditMode ? updateMutation : createMutation
    
    mutation.mutate(
      { deviceId, config: configData },
      {
        onSuccess: () => {
          console.log('✅ Configuration saved successfully')
          onSuccess?.()
          handleClose()
        },
        onError: (error) => {
          console.error('❌ Failed to save configuration:', error)
          // Show user-friendly error message
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Failed to save configuration. Please try again.'
          alert(errorMessage)
        },
      }
    )
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>{isEditMode ? 'Edit' : 'Create'} Device Configuration</span>
        </div>
      }
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Device Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Device:</strong> {deviceName || `Device #${deviceId}`}
          </p>
        </div>

        {/* Display Settings Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-900 font-medium">
            <Monitor className="h-5 w-5" />
            <h3>Display Settings</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Display Orientation */}
            <div>
              <label htmlFor="displayOrientation" className="block text-sm font-medium text-gray-700 mb-1">
                Orientation <span className="text-red-500">*</span>
              </label>
              <select
                id="displayOrientation"
                {...register('displayOrientation')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
              </select>
              {errors.displayOrientation && (
                <p className="mt-1 text-sm text-red-600">{errors.displayOrientation.message}</p>
              )}
            </div>

            {/* Resolution */}
            <div>
              <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
                Resolution
              </label>
              <select
                id="resolution"
                {...register('resolution')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Auto</option>
                <option value="1920x1080">1920x1080 (Full HD)</option>
                <option value="3840x2160">3840x2160 (4K UHD)</option>
                <option value="1280x720">1280x720 (HD)</option>
              </select>
              {errors.resolution && (
                <p className="mt-1 text-sm text-red-600">{errors.resolution.message}</p>
              )}
            </div>

            {/* Refresh Rate */}
            <div>
              <label htmlFor="refreshRate" className="block text-sm font-medium text-gray-700 mb-1">
                Refresh Rate (Hz) <span className="text-red-500">*</span>
              </label>
              <Input
                id="refreshRate"
                type="number"
                min="30"
                max="120"
                {...register('refreshRate', { valueAsNumber: true })}
                error={errors.refreshRate?.message || ''}
              />
              {errors.refreshRate && (
                <p className="mt-1 text-sm text-red-600">{errors.refreshRate.message}</p>
              )}
            </div>

            {/* Screen Timeout */}
            <div>
              <label htmlFor="screenTimeout" className="block text-sm font-medium text-gray-700 mb-1">
                Screen Timeout (seconds) <span className="text-red-500">*</span>
              </label>
              <Input
                id="screenTimeout"
                type="number"
                min="0"
                max="3600"
                {...register('screenTimeout', { valueAsNumber: true })}
                error={errors.screenTimeout?.message || ''}
              />
              {errors.screenTimeout && (
                <p className="mt-1 text-sm text-red-600">{errors.screenTimeout.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Power Management Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-900 font-medium">
            <Power className="h-5 w-5" />
            <h3>Power Management</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Power Management Mode */}
            <div>
              <label htmlFor="powerManagement" className="block text-sm font-medium text-gray-700 mb-1">
                Power Mode
              </label>
              <select
                id="powerManagement"
                {...register('powerManagement')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="standard">Standard</option>
                <option value="energy-saving">Energy Saving</option>
                <option value="high-performance">High Performance</option>
              </select>
              {errors.powerManagement && (
                <p className="mt-1 text-sm text-red-600">{errors.powerManagement.message}</p>
              )}
            </div>

            {/* Remote Management */}
            <div className="flex items-center space-x-2 pt-7">
              <input
                id="remoteManagementEnabled"
                type="checkbox"
                {...register('remoteManagementEnabled')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remoteManagementEnabled" className="text-sm font-medium text-gray-700">
                Enable Remote Management
              </label>
            </div>
          </div>
        </div>

        {/* Network Configuration Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-900 font-medium">
            <Wifi className="h-5 w-5" />
            <h3>Network Configuration</h3>
          </div>

          <div className="space-y-4">
            {/* Network Config JSON */}
            <div>
              <label htmlFor="networkConfig" className="block text-sm font-medium text-gray-700 mb-1">
                Network Settings (JSON)
              </label>
              <textarea
                id="networkConfig"
                {...register('networkConfig')}
                rows={3}
                placeholder='{"ssid": "YourNetwork", "securityType": "WPA2"}'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
              {errors.networkConfig && (
                <p className="mt-1 text-sm text-red-600">{errors.networkConfig.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Optional: Provide network configuration as JSON
              </p>
            </div>

            {/* Proxy Settings */}
            <div>
              <label htmlFor="proxySettings" className="block text-sm font-medium text-gray-700 mb-1">
                Proxy Settings
              </label>
              <Input
                id="proxySettings"
                type="text"
                placeholder="proxy.example.com:8080"
                {...register('proxySettings')}
                error={errors.proxySettings?.message || ''}
              />
              {errors.proxySettings && (
                <p className="mt-1 text-sm text-red-600">{errors.proxySettings.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* App Permissions Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-900 font-medium">
            <Shield className="h-5 w-5" />
            <h3>App Permissions</h3>
          </div>

          <div>
            <label htmlFor="appPermissions" className="block text-sm font-medium text-gray-700 mb-1">
              Permissions (JSON)
            </label>
            <textarea
              id="appPermissions"
              {...register('appPermissions')}
              rows={3}
              placeholder='{"allowedApps": [], "deniedApps": []}'
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            {errors.appPermissions && (
              <p className="mt-1 text-sm text-red-600">{errors.appPermissions.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Optional: Define app permissions as JSON
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {(createMutation.isPending || updateMutation.isPending)
              ? 'Saving...' 
              : isEditMode 
                ? 'Update Configuration' 
                : 'Create Configuration'
            }
          </Button>
        </div>
      </form>
    </Modal>
  )
}
