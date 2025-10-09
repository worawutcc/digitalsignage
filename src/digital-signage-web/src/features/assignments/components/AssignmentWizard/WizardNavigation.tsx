/**
 * @fileoverview Wizard Navigation Component
 * @description Navigation controls for wizard (Back/Next/Submit buttons)
 */

'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAssignmentWizard } from './AssignmentWizardContext';
import { WizardStep } from './AssignmentWizard.types';

const STEP_ORDER = [
  WizardStep.ContentSelection,
  WizardStep.TargetSelection,
  WizardStep.Scheduling,
  WizardStep.Review,
];

export function WizardNavigation() {
  const {
    currentStep,
    nextStep,
    previousStep,
    submitWizard,
    isStepValid,
    isSubmitting,
  } = useAssignmentWizard();

  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === STEP_ORDER.length - 1;
  const canProgress = isStepValid(currentStep);

  const getNextButtonText = () => {
    if (isLastStep) {
      return isSubmitting ? 'Creating...' : 'Create Assignment';
    }
    return 'Next';
  };

  const handleNext = () => {
    if (isLastStep) {
      submitWizard();
    } else {
      nextStep();
    }
  };

  const getStepName = (step: WizardStep): string => {
    switch (step) {
      case WizardStep.ContentSelection:
        return 'Content Selection';
      case WizardStep.TargetSelection:
        return 'Target Selection';
      case WizardStep.Scheduling:
        return 'Scheduling';
      case WizardStep.Review:
        return 'Review';
      default:
        return 'Unknown Step';
    }
  };

  return (
    <div className="flex items-center justify-between pt-6 border-t border-border">
      {/* Progress Info */}
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          Step {currentIndex + 1} of {STEP_ORDER.length}: {getStepName(currentStep)}
        </p>
        {!canProgress && !isFirstStep && (
          <p className="text-xs text-destructive mt-1">
            Please complete all required fields to continue
          </p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <Button
          type="button"
          variant="outline"
          onClick={previousStep}
          disabled={isFirstStep || isSubmitting}
          className="min-w-[100px]"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {/* Next/Submit Button */}
        <Button
          type="button"
          onClick={handleNext}
          disabled={!canProgress || isSubmitting}
          className="min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              {getNextButtonText()}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}