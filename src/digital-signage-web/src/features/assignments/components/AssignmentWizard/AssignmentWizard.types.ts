/**
 * @fileoverview Assignment Wizard Types
 * @description Type definitions for the assignment creation wizard
 */

import { z } from 'zod';
import {
  AssignmentType,
  AssignmentTargetType,
  type RecurrencePattern,
} from '../../types/assignment.types';

/**
 * Wizard step identifiers
 */
export enum WizardStep {
  ContentSelection = 'content',
  TargetSelection = 'target',
  Scheduling = 'scheduling',
  Review = 'review',
}

/**
 * Content selection step data
 */
export interface ContentSelectionData {
  assignmentType: AssignmentType;
  contentId: number;
  contentName?: string;
  contentType?: 'schedule' | 'playlist' | 'media';
}

/**
 * Target selection step data
 */
export interface TargetSelectionData {
  targetType: AssignmentTargetType;
  targetIds: number[];
  targetNames?: string[];
}

/**
 * Scheduling step data for assignment wizard
 * @interface SchedulingData
 */
export interface SchedulingData {
  /** Assignment start date in YYYY-MM-DD format */
  startDate: string;
  /** Optional assignment end date in YYYY-MM-DD format */
  endDate?: string;
  /** Optional daily start time in HH:mm format */
  startTime?: string;
  /** Optional daily end time in HH:mm format */
  endTime?: string;
  /** Assignment priority level (1-10, where 1 = highest priority) */
  priority: number;
  isEmergencyBroadcast: boolean;
  recurrencePattern?: string; // JSON string for recurrence pattern
  notes?: string;
}

/**
 * Complete wizard form data
 */
export interface AssignmentWizardData {
  content: ContentSelectionData;
  target: TargetSelectionData;
  scheduling: SchedulingData;
}

/**
 * Wizard navigation props
 */
export interface WizardNavigationProps {
  currentStep: WizardStep;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  canProgress: boolean;
  isSubmitting: boolean;
}

/**
 * Wizard context value
 */
export interface AssignmentWizardContextValue {
  // Current step
  currentStep: WizardStep;
  
  // Form data
  data: Partial<AssignmentWizardData>;
  
  // Navigation
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Data management
  updateContentData: (data: Partial<ContentSelectionData>) => void;
  updateTargetData: (data: Partial<TargetSelectionData>) => void;
  updateSchedulingData: (data: Partial<SchedulingData>) => void;
  
  // Validation
  isStepValid: (step: WizardStep) => boolean;
  
  // Submission
  submitWizard: () => Promise<void>;
  isSubmitting: boolean;
  
  // Reset
  resetWizard: () => void;
}

/**
 * Zod validation schemas for each step
 */
export const contentSelectionSchema = z.object({
  assignmentType: z.nativeEnum(AssignmentType),
  contentId: z.number().positive('Please select content'),
  contentName: z.string().optional(),
  contentType: z.enum(['schedule', 'playlist', 'media']).optional(),
}).refine(
  (data) => {
    // Must have both assignmentType (including 0) and a valid contentId
    return data.assignmentType !== undefined && data.contentId > 0;
  },
  {
    message: 'Please select both assignment type and specific content',
    path: ['contentId']
  }
);

export const targetSelectionSchema = z.object({
  targetType: z.nativeEnum(AssignmentTargetType),
  targetIds: z.array(z.number()).min(1, 'Please select at least one target'),
  targetNames: z.array(z.string()).optional(),
});

export const schedulingSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  priority: z.number().min(1).max(10),
  isEmergencyBroadcast: z.boolean(),
  recurrencePattern: z.string().optional(), // JSON string for recurrence pattern
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
}).refine(
  (data) => {
    if (data.endDate) {
      return new Date(data.startDate) < new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      const startParts = data.startTime.split(':').map(Number);
      const endParts = data.endTime.split(':').map(Number);
      
      if (startParts.length === 2 && endParts.length === 2) {
        const startMinutes = startParts[0]! * 60 + startParts[1]!;
        const endMinutes = endParts[0]! * 60 + endParts[1]!;
        return startMinutes < endMinutes;
      }
    }
    return true;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

/**
 * Props for the main AssignmentWizard component
 */
export interface AssignmentWizardProps {
  /**
   * Whether the wizard is open
   */
  isOpen: boolean;
  
  /**
   * Callback when wizard is closed
   */
  onClose: () => void;
  
  /**
   * Callback when assignment is successfully created
   */
  onSuccess?: (assignmentId: number) => void;
  
  /**
   * Initial data to pre-fill the wizard (for editing)
   */
  initialData?: Partial<AssignmentWizardData>;
  
  /**
   * Whether this is an edit mode
   */
  isEditMode?: boolean;
  
  /**
   * Assignment ID for edit mode
   */
  assignmentId?: number;
}
