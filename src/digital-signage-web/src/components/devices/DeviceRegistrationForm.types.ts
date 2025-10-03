import { DeviceRegistrationFormData } from '@/schemas/deviceSchemas'

export interface DeviceRegistrationFormProps {
  onSubmit: (data: DeviceRegistrationFormData) => void
  loading?: boolean
  disabled?: boolean
  className?: string
}