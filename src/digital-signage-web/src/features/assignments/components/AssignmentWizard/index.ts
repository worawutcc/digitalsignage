/**
 * @fileoverview Assignment Wizard - Module Exports
 * @description Centralized exports for Assignment Creation Wizard
 */

// Main Components
export { AssignmentWizard } from './AssignmentWizard';
export { AssignmentWizardProvider, useAssignmentWizard } from './AssignmentWizardContext';

// Step Components
export { ContentSelectionStep } from './steps/ContentSelectionStep';
export { TargetSelectionStep } from './steps/TargetSelectionStep';
export { SchedulingStep } from './steps/SchedulingStep';
export { ReviewStep } from './steps/ReviewStep';

// UI Components
export { WizardProgress } from './WizardProgress';
export { WizardNavigation } from './WizardNavigation';

// Types
export type {
  AssignmentWizardProps,
  AssignmentWizardData,
  ContentSelectionData,
  TargetSelectionData,
  SchedulingData,
} from './AssignmentWizard.types';

export { WizardStep } from './AssignmentWizard.types';