/**
 * Schedule Assignment Validation Schemas
 * 
 * Zod schemas for validating schedule assignment forms and operations.
 * Implements REPLACE semantics with confirmation requirements.
 */

import { z } from 'zod'

/**
 * Schema for validating schedule assignment to users
 * 
 * Business Rules:
 * - At least one schedule must be selected
 * - Maximum 50 schedules can be assigned at once
 * - Confirmation required when replacing existing assignments
 */
export const assignSchedulesSchema = z.object({
  scheduleIds: z
    .array(z.number().positive('Schedule ID must be positive'))
    .min(1, 'At least one schedule must be selected')
    .max(50, 'Cannot assign more than 50 schedules at once')
    .refine(
      (ids) => new Set(ids).size === ids.length,
      'Duplicate schedule IDs are not allowed'
    ),
  
  confirmReplace: z
    .boolean()
    .refine(
      (val) => val === true,
      'You must confirm replacement of existing assignments'
    )
})

/**
 * Type inference from assignSchedulesSchema
 */
export type AssignSchedulesFormData = z.infer<typeof assignSchedulesSchema>

/**
 * Schema for schedule selector search and filter
 */
export const scheduleSelectorSchema = z.object({
  searchTerm: z
    .string()
    .max(100, 'Search term must be less than 100 characters')
    .trim()
    .optional()
    .default(''),
  
  selectedIds: z
    .array(z.number().positive())
    .default([]),
  
  showActiveOnly: z
    .boolean()
    .default(true)
})

/**
 * Type inference from scheduleSelectorSchema
 */
export type ScheduleSelectorFormData = z.infer<typeof scheduleSelectorSchema>

/**
 * Schema for setting default schedule
 */
export const setDefaultScheduleSchema = z.object({
  scheduleId: z
    .number()
    .positive('Schedule ID must be positive'),
  
  isDefault: z
    .boolean()
})

/**
 * Type inference from setDefaultScheduleSchema
 */
export type SetDefaultScheduleFormData = z.infer<typeof setDefaultScheduleSchema>

/**
 * Custom validation: Check if any selected schedules are inactive
 * Used in components to prevent assigning inactive schedules
 * 
 * @param selectedIds - Array of selected schedule IDs
 * @param availableSchedules - Array of all available schedules
 * @returns Object with { valid: boolean, inactiveIds: number[] }
 */
export function validateScheduleStatus(
  selectedIds: number[],
  availableSchedules: Array<{ id: number; isActive: boolean }>
): { valid: boolean; inactiveIds: number[] } {
  const inactiveIds = selectedIds.filter((id) => {
    const schedule = availableSchedules.find((s) => s.id === id)
    return schedule && !schedule.isActive
  })
  
  return {
    valid: inactiveIds.length === 0,
    inactiveIds
  }
}

/**
 * Custom validation: Check if replacement warning should be shown
 * 
 * @param currentAssignmentCount - Number of existing assignments
 * @param newSelectionCount - Number of new selections
 * @returns true if warning should be shown
 */
export function shouldShowReplaceWarning(
  currentAssignmentCount: number,
  newSelectionCount: number
): boolean {
  return currentAssignmentCount > 0 && newSelectionCount > 0
}

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
  NO_SCHEDULES_SELECTED: 'Please select at least one schedule',
  TOO_MANY_SCHEDULES: 'You can only assign up to 50 schedules at once',
  INACTIVE_SCHEDULES: 'Cannot assign inactive schedules',
  CONFIRMATION_REQUIRED: 'You must confirm replacement of existing assignments',
  DUPLICATE_SCHEDULES: 'You have selected the same schedule multiple times',
  INVALID_SCHEDULE_ID: 'Invalid schedule ID',
} as const

/**
 * Helper function to get user-friendly error messages
 * 
 * @param error - Zod error object
 * @returns Array of formatted error messages
 */
export function getValidationErrors(error: z.ZodError<unknown>): string[] {
  return error.issues.map((issue: z.ZodIssue) => issue.message)
}
