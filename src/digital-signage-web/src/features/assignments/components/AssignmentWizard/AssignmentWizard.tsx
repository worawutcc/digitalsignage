/**
 * @fileoverview Assignment Wizard - Main Component
 * @description Multi-step wizard for creating content assignments
 */

'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { AssignmentWizardProvider, useAssignmentWizard } from './AssignmentWizardContext';
import { WizardStep, type AssignmentWizardProps } from './AssignmentWizard.types';
import { ContentSelectionStep } from './steps/ContentSelectionStep';
import { TargetSelectionStep } from './steps/TargetSelectionStep';
import { SchedulingStep } from './steps/SchedulingStep';
import { ReviewStep } from './steps/ReviewStep';
import { WizardNavigation } from './WizardNavigation';
import { WizardProgress } from './WizardProgress';

/**
 * Wizard content component (uses wizard context)
 */
function AssignmentWizardContent() {
  const { currentStep } = useAssignmentWizard();

  const renderStep = () => {
    switch (currentStep) {
      case WizardStep.ContentSelection:
        return <ContentSelectionStep />;
      case WizardStep.TargetSelection:
        return <TargetSelectionStep />;
      case WizardStep.Scheduling:
        return <SchedulingStep />;
      case WizardStep.Review:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <WizardProgress />

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      <WizardNavigation />
    </div>
  );
}

/**
 * Main Assignment Wizard Component
 */
export function AssignmentWizard({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEditMode = false,
  assignmentId,
}: AssignmentWizardProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={isEditMode ? 'Edit Assignment' : 'Create New Assignment'}
      size="xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      <AssignmentWizardProvider
        initialData={initialData || {}}
        onSuccess={onSuccess || (() => {})}
        onClose={onClose}
      >
        <AssignmentWizardContent />
      </AssignmentWizardProvider>
    </Modal>
  );
}
