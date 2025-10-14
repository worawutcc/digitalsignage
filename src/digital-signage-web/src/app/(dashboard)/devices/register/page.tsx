'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  ArrowLeft, 
  Monitor, 
  Wifi, 
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useFormErrorHandling } from '@/hooks/useErrorHandling'
import { GlobalFormErrors, FormFieldWrapper } from '@/components/errors/FormError'
// Card components defined locally

/**
 * Simple card components for layout
 */
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className || ''}`}>
      {children}
    </div>
  )
}

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 border-b border-gray-200 ${className || ''}`}>
      {children}
    </div>
  )
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 ${className || ''}`}>
      {children}
    </div>
  )
}

function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className || ''}`}>
      {children}
    </h3>
  )
}

/**
 * Device registration form schema with Zod validation
 * Following UI copilot instructions for form validation
 */
const deviceRegistrationSchema = z.object({
  name: z.string().min(1, 'Device name is required').max(100, 'Device name must be less than 100 characters'),
  location: z.string().min(1, 'Location is required').max(100, 'Location must be less than 100 characters'),
  ipAddress: z.string().regex(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, 'Please enter a valid IP address'),
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'Please enter a valid MAC address (e.g., 00:1B:44:11:3A:B7)').optional().or(z.literal('')),
  resolution: z.string().regex(/^\d+x\d+$/, 'Please enter a valid resolution (e.g., 1920x1080)'),
  deviceGroup: z.string().min(1, 'Device group is required'),
  model: z.string().min(1, 'Device model is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  description: z.string().optional(),
})

type DeviceRegistrationFormData = z.infer<typeof deviceRegistrationSchema>

const DEVICE_GROUPS = [
  'Lobby Displays',
  'Conference Room Displays',
  'Cafeteria Displays',
  'Hallway Displays',
  'Reception Displays',
  'Waiting Area Displays'
]

const RESOLUTIONS = [
  { value: '1920x1080', label: '1920x1080 (Full HD)' },
  { value: '3840x2160', label: '3840x2160 (4K UHD)' },
  { value: '1366x768', label: '1366x768 (HD)' },
  { value: '1280x720', label: '1280x720 (HD Ready)' },
  { value: '2560x1440', label: '2560x1440 (QHD)' },
  { value: '1440x900', label: '1440x900 (WXGA+)' }
]

/**
 * Device registration page
 * 
 * Following UI copilot instructions:
 * - React Hook Form + Zod for form validation
 * - TypeScript strict typing
 * - Tailwind CSS for styling
 * - Feature-based organization
 * - Server Components by default with client components for interactivity
 */
export default function DeviceRegistrationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Error handling
  const { 
    errors: allFormErrors, 
    globalError, 
    clearAllErrors, 
    handleValidationErrors,
    setGlobalFormError 
  } = useFormErrorHandling<DeviceRegistrationFormData>()

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset
  } = useForm<DeviceRegistrationFormData>({
    resolver: zodResolver(deviceRegistrationSchema),
    defaultValues: {
      name: '',
      location: '',
      ipAddress: '',
      macAddress: '',
      resolution: '1920x1080',
      deviceGroup: 'Lobby Displays',
      model: '',
      serialNumber: '',
      description: '',
    },
    mode: 'onChange'
  })

  // Watch form values for validation feedback
  const watchedValues = watch()

  /**
   * Handle form submission
   */
  const onSubmit = async (data: DeviceRegistrationFormData) => {
    // Clear previous errors
    clearAllErrors()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // TODO: Replace with actual device service call using React Query mutation
      console.log('Registering device:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock successful registration
      setSubmitSuccess(true)
      clearAllErrors()
      
      // Reset form after success
      setTimeout(() => {
        router.push('/devices')
      }, 2000)

    } catch (error: any) {
      console.error('❌ Failed to register device:', error)
      
      // Handle validation errors from API
      if (error?.status === 400 && error?.errors) {
        handleValidationErrors(error)
      } else {
        // Handle general errors
        const errorMessage = error?.message || error?.detail || 'Failed to register device. Please try again.'
        setGlobalFormError(errorMessage)
        setSubmitError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    router.push('/devices')
  }

  /**
   * Handle form reset
   */
  const handleReset = () => {
    reset()
    setSubmitError(null)
    setSubmitSuccess(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Devices</span>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Register New Device</h1>
          <p className="text-sm text-gray-600">
            Add a new Android TV device to your digital signage network
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Message */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Device Registered Successfully</h3>
                <p className="text-sm text-green-700 mt-1">
                  The device has been added to your network. Redirecting to device list...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
                <p className="text-sm text-red-700 mt-1">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Global Form Errors */}
          {(globalError || allFormErrors.length > 0) && (
            <GlobalFormErrors
              errors={allFormErrors}
              onDismiss={clearAllErrors}
            />
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Device Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    {...register('name')}
                    placeholder="Enter device name (e.g., Lobby Display 1)"
                    className={errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <Input
                    id="location"
                    type="text"
                    {...register('location')}
                    placeholder="Enter device location (e.g., Main Lobby)"
                    className={errors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    Device Model *
                  </label>
                  <Input
                    id="model"
                    type="text"
                    {...register('model')}
                    placeholder="Enter device model (e.g., Android TV Box Pro)"
                    className={errors.model ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
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
                    type="text"
                    {...register('serialNumber')}
                    placeholder="Enter serial number (e.g., ATV-LP-001)"
                    className={errors.serialNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.serialNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.serialNumber.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="deviceGroup" className="block text-sm font-medium text-gray-700 mb-1">
                    Device Group *
                  </label>
                  <select
                    id="deviceGroup"
                    {...register('deviceGroup')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {DEVICE_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                  {errors.deviceGroup && (
                    <p className="mt-1 text-sm text-red-600">{errors.deviceGroup.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
                    Resolution *
                  </label>
                  <select
                    id="resolution"
                    {...register('resolution')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {RESOLUTIONS.map((res) => (
                      <option key={res.value} value={res.value}>
                        {res.label}
                      </option>
                    ))}
                  </select>
                  {errors.resolution && (
                    <p className="mt-1 text-sm text-red-600">{errors.resolution.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  {...register('description')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional description of the device..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Network Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wifi className="h-5 w-5" />
                <span>Network Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    IP Address *
                  </label>
                  <Input
                    id="ipAddress"
                    type="text"
                    {...register('ipAddress')}
                    placeholder="192.168.1.100"
                    className={errors.ipAddress ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.ipAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.ipAddress.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="macAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    MAC Address
                  </label>
                  <Input
                    id="macAddress"
                    type="text"
                    {...register('macAddress')}
                    placeholder="00:1B:44:11:3A:B7 (optional)"
                    className={errors.macAddress ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.macAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.macAddress.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>* Required fields</p>
                  {!isValid && Object.keys(errors).length > 0 && (
                    <p className="text-red-600 mt-1">
                      Please fix the errors above before submitting.
                    </p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={!isValid || isSubmitting}
                  >
                    {isSubmitting ? 'Registering...' : 'Register Device'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Form Validation Summary (Development Aid) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="border-dashed border-gray-300">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Development: Form State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-2">
                <div>
                  <strong>Form Valid:</strong> {isValid ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Errors:</strong> {Object.keys(errors).length}
                </div>
                {Object.keys(errors).length > 0 && (
                  <div>
                    <strong>Error Fields:</strong> {Object.keys(errors).join(', ')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}