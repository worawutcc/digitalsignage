import { DeviceConfigurationFormData, UpdateDeviceConfigurationFormData } from '@/schemas/deviceSchemas'

export interface AndroidTVConfigurationFormProps {
  initialData?: Partial<DeviceConfigurationFormData>
  onSubmit: (data: DeviceConfigurationFormData) => void
  onCancel?: () => void
  loading?: boolean
  disabled?: boolean
  mode?: 'create' | 'edit'
  className?: string
}