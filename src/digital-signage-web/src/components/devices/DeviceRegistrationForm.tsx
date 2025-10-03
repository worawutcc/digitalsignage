'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { deviceRegistrationSchema, DeviceRegistrationFormData } from '@/schemas/deviceSchemas'
import { DeviceRegistrationFormProps } from './DeviceRegistrationForm.types'
import { Smartphone, Wifi, Monitor, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Device registration form component for Android TV devices
 * Handles the complete registration workflow with hardware validation
 */
export function DeviceRegistrationForm({
  onSubmit,
  loading = false,
  disabled = false,
  className
}: DeviceRegistrationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(deviceRegistrationSchema)
  })

  const onFormSubmit = handleSubmit((data: DeviceRegistrationFormData) => {
    onSubmit(data)
  })

  return (
    <div className={cn('w-full max-w-2xl bg-white rounded-lg border shadow-sm', className)}>
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Monitor className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Register Android TV Device</h2>
        </div>
        <p className="text-gray-600">
          Enter the hardware information for your Android TV device to complete registration
        </p>
      </div>
      <div className="p-6">
        <form onSubmit={onFormSubmit} className="space-y-6">
          {/* Device Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Info className="h-4 w-4" />
              Device Information
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 mb-1">
                  Device Name *
                </label>
                <Input
                  id="deviceName"
                  placeholder="Living Room TV"
                  disabled={disabled || loading}
                  {...register('deviceName')}
                />
                {errors.deviceName && (
                  <p className="mt-1 text-sm text-red-600">{errors.deviceName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <Input
                  id="location"
                  placeholder="Conference Room A"
                  disabled={disabled || loading}
                  {...register('location')}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Hardware Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Smartphone className="h-4 w-4" />
              Hardware Details
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer *
                </label>
                <Input
                  id="manufacturer"
                  placeholder="Samsung, LG, Sony..."
                  disabled={disabled || loading}
                  {...register('manufacturer')}
                />
                {errors.manufacturer && (
                  <p className="mt-1 text-sm text-red-600">{errors.manufacturer.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Model *
                </label>
                <Input
                  id="model"
                  placeholder="QN55Q70A, OLED55C1..."
                  disabled={disabled || loading}
                  {...register('model')}
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Serial Number *
                </label>
                <Input
                  id="serialNumber"
                  placeholder="ABC123DEF456"
                  disabled={disabled || loading}
                  {...register('serialNumber')}
                />
                {errors.serialNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.serialNumber.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="macAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  MAC Address *
                </label>
                <Input
                  id="macAddress"
                  placeholder="00:11:22:33:44:55"
                  disabled={disabled || loading}
                  {...register('macAddress')}
                />
                {errors.macAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.macAddress.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Android System Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Wifi className="h-4 w-4" />
              Android System
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="androidVersion" className="block text-sm font-medium text-gray-700 mb-1">
                  Android Version *
                </label>
                <Input
                  id="androidVersion"
                  placeholder="11, 12, 13..."
                  disabled={disabled || loading}
                  {...register('androidVersion')}
                />
                {errors.androidVersion && (
                  <p className="mt-1 text-sm text-red-600">{errors.androidVersion.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="apiLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  API Level *
                </label>
                <Input
                  id="apiLevel"
                  placeholder="30, 31, 32..."
                  disabled={disabled || loading}
                  {...register('apiLevel')}
                />
                {errors.apiLevel && (
                  <p className="mt-1 text-sm text-red-600">{errors.apiLevel.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="displayResolution" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Resolution *
                </label>
                <Input
                  id="displayResolution"
                  placeholder="1920x1080, 3840x2160..."
                  disabled={disabled || loading}
                  {...register('displayResolution')}
                />
                {errors.displayResolution && (
                  <p className="mt-1 text-sm text-red-600">{errors.displayResolution.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={disabled || loading}
              loading={loading}
              className="min-w-[120px]"
            >
              {loading ? 'Registering...' : 'Register Device'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}