'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { deviceConfigurationSchema, DeviceConfigurationFormData } from '@/schemas/deviceSchemas'
import { AndroidTVConfigurationFormProps } from './AndroidTVConfigurationForm.types'
import { 
  Monitor, 
  RotateCcw, 
  Power, 
  Wifi, 
  Shield, 
  Settings,
  Clock,
  Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Android TV Configuration form component
 * Handles device-specific settings for Android TV devices
 */
export function AndroidTVConfigurationForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  disabled = false,
  mode = 'create',
  className
}: AndroidTVConfigurationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(deviceConfigurationSchema),
    defaultValues: {
      displayOrientation: initialData?.displayOrientation || 'Landscape',
      screenTimeout: initialData?.screenTimeout || 300,
      powerManagement: initialData?.powerManagement || 'Standard',
      autoRotate: initialData?.autoRotate || false,
      networkConfig: initialData?.networkConfig || {},
      appPermissions: initialData?.appPermissions || {},
      proxySettings: initialData?.proxySettings || {}
    }
  })

  const watchedOrientation = watch('displayOrientation')
  const watchedAutoRotate = watch('autoRotate')
  const watchedPowerManagement = watch('powerManagement')

  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data as DeviceConfigurationFormData)
  })

  const handleOrientationChange = (orientation: 'Portrait' | 'Landscape' | 'Auto') => {
    setValue('displayOrientation', orientation)
    if (orientation === 'Auto') {
      setValue('autoRotate', true)
    }
  }

  return (
    <div className={cn('w-full max-w-4xl bg-white rounded-lg border shadow-sm', className)}>
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Smartphone className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Configure Android TV' : 'Edit Configuration'}
          </h2>
        </div>
        <p className="text-gray-600">
          Configure display, power, and network settings for your Android TV device
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={onFormSubmit} className="space-y-8">
          {/* Display Settings */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <Monitor className="h-5 w-5 text-blue-600" />
              Display Settings
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display Orientation */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Display Orientation *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Portrait', 'Landscape', 'Auto'] as const).map((orientation) => (
                    <button
                      key={orientation}
                      type="button"
                      onClick={() => handleOrientationChange(orientation)}
                      className={cn(
                        'p-3 border rounded-lg text-sm font-medium transition-all',
                        watchedOrientation === orientation
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      )}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Monitor 
                          className={cn(
                            'h-4 w-4',
                            orientation === 'Portrait' && 'rotate-90'
                          )} 
                        />
                        {orientation}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.displayOrientation && (
                  <p className="text-sm text-red-600">{errors.displayOrientation.message}</p>
                )}
              </div>

              {/* Screen Timeout */}
              <div>
                <label htmlFor="screenTimeout" className="block text-sm font-medium text-gray-700 mb-1">
                  Screen Timeout (seconds) *
                </label>
                <Input
                  id="screenTimeout"
                  type="number"
                  min="30"
                  max="86400"
                  placeholder="300"
                  disabled={disabled || loading}
                  {...register('screenTimeout', { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Time before screen turns off (30 seconds to 24 hours)
                </p>
                {errors.screenTimeout && (
                  <p className="text-sm text-red-600">{errors.screenTimeout.message}</p>
                )}
              </div>
            </div>

            {/* Auto Rotate */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-gray-600" />
                <div>
                  <label htmlFor="autoRotate" className="text-sm font-medium text-gray-900">
                    Auto Rotate Screen
                  </label>
                  <p className="text-xs text-gray-500">
                    Automatically rotate screen based on device orientation
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  id="autoRotate"
                  type="checkbox"
                  disabled={disabled || loading || watchedOrientation === 'Auto'}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  {...register('autoRotate')}
                />
              </div>
            </div>
          </div>

          {/* Power Management */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <Power className="h-5 w-5 text-blue-600" />
              Power Management
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Power Mode *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['Standard', 'Optimized', 'Maximum'] as const).map((mode) => (
                    <div
                      key={mode}
                      className={cn(
                        'relative p-4 border rounded-lg cursor-pointer transition-all',
                        watchedPowerManagement === mode
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        id={`power-${mode}`}
                        type="radio"
                        value={mode}
                        disabled={disabled || loading}
                        className="absolute top-3 right-3"
                        {...register('powerManagement')}
                      />
                      <label htmlFor={`power-${mode}`} className="cursor-pointer">
                        <div className="text-sm font-medium text-gray-900 mb-1">{mode}</div>
                        <div className="text-xs text-gray-500">
                          {mode === 'Standard' && 'Balanced performance and energy saving'}
                          {mode === 'Optimized' && 'Enhanced energy efficiency'}
                          {mode === 'Maximum' && 'Maximum performance, higher power usage'}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                {errors.powerManagement && (
                  <p className="text-sm text-red-600">{errors.powerManagement.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Network Configuration */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <Wifi className="h-5 w-5 text-blue-600" />
              Network Configuration
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Settings className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Advanced Settings</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Network and proxy configurations will be available after initial device registration.
                    These settings require device-specific network capabilities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* App Permissions */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <Shield className="h-5 w-5 text-blue-600" />
              App Permissions
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Automated Configuration</p>
                  <p className="text-xs text-blue-700 mt-1">
                    App permissions will be configured automatically based on the digital signage requirements.
                    This includes display control, network access, and system-level permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={disabled || loading}
              loading={loading}
              className="min-w-[120px]"
            >
              {loading 
                ? (mode === 'create' ? 'Saving...' : 'Updating...') 
                : (mode === 'create' ? 'Save Configuration' : 'Update Configuration')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}