/**
 * Schedule Builder Component Types
 * 
 * Type definitions for ScheduleBuilder component.
 * Uses types from ../types for CreateScheduleRequest, TimeSlot, etc.
 * 
 * @see ScheduleBuilder.tsx
 * @see ../types
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

import type {
  CreateScheduleRequest,
  TimeSlot,
  TargetDevice,
  ScheduleContent,
  RecurrenceConfig,
} from '../types'

export interface ScheduleBuilderProps {
  initialData?: Partial<CreateScheduleRequest>
  onSubmit?: (data: CreateScheduleRequest) => void
  onCancel?: () => void
  mode?: 'create' | 'edit'
  className?: string
}

export interface ScheduleFormData extends CreateScheduleRequest {
  // Extended form-specific fields if needed
}
