/**
 * @fileoverview Wizard Progress Component
 * @description Visual progress indicator for multi-step wizard
 */

'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAssignmentWizard } from './AssignmentWizardContext';
import { WizardStep } from './AssignmentWizard.types';

const STEPS = [
  {
    key: WizardStep.ContentSelection,
    label: 'Content',
    description: 'Select content type',
  },
  {
    key: WizardStep.TargetSelection,
    label: 'Targets',
    description: 'Choose devices',
  },
  {
    key: WizardStep.Scheduling,
    label: 'Schedule',
    description: 'Set timing',
  },
  {
    key: WizardStep.Review,
    label: 'Review',
    description: 'Confirm details',
  },
];

export function WizardProgress() {
  const { currentStep, goToStep, isStepValid } = useAssignmentWizard();

  const currentIndex = STEPS.findIndex(step => step.key === currentStep);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentIndex) {
      return 'completed';
    } else if (stepIndex === currentIndex) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

  const canNavigateToStep = (stepIndex: number) => {
    // Can navigate to current step or any completed step
    if (stepIndex === currentIndex) return true;
    if (stepIndex > currentIndex) return false;
    
    // Check if all previous steps are valid
    for (let i = 0; i < stepIndex; i++) {
      const step = STEPS[i];
      if (!step || !isStepValid(step.key)) {
        return false;
      }
    }
    return true;
  };

  const handleStepClick = (stepIndex: number) => {
    if (canNavigateToStep(stepIndex)) {
      const step = STEPS[stepIndex];
      if (step) {
        goToStep(step.key);
      }
    }
  };

  return (
    <nav className="flex items-center justify-center w-full mb-8">
      <ol className="flex items-center space-x-4 sm:space-x-8">
        {STEPS.map((step, index) => {
          const status = getStepStatus(index);
          const canNavigate = canNavigateToStep(index);
          
          return (
            <li key={step.key} className="flex items-center">
              {/* Step Circle */}
              <button
                onClick={() => handleStepClick(index)}
                disabled={!canNavigate}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200',
                  {
                    // Completed step
                    'bg-primary border-primary text-primary-foreground hover:bg-primary/90': 
                      status === 'completed',
                    // Current step
                    'border-primary text-primary bg-background': 
                      status === 'current',
                    // Upcoming step
                    'border-muted-foreground/30 text-muted-foreground bg-background': 
                      status === 'upcoming',
                    // Interactive states
                    'cursor-pointer hover:border-primary/60 hover:text-primary/80': 
                      canNavigate && status !== 'current',
                    'cursor-not-allowed opacity-50': 
                      !canNavigate,
                  }
                )}
              >
                {status === 'completed' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </button>

              {/* Step Label */}
              <div className="ml-3 min-w-0 hidden sm:block">
                <p
                  className={cn(
                    'text-sm font-medium transition-colors',
                    {
                      'text-primary': status === 'current' || status === 'completed',
                      'text-muted-foreground': status === 'upcoming',
                    }
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-8 sm:w-12 h-px mx-4 transition-colors',
                    {
                      'bg-primary': index < currentIndex,
                      'bg-muted-foreground/30': index >= currentIndex,
                    }
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile Step Indicator */}
      <div className="sm:hidden ml-4">
        <p className="text-sm font-medium">
          Step {currentIndex + 1} of {STEPS.length}
        </p>
        <p className="text-xs text-muted-foreground">
          {STEPS[currentIndex]?.label}
        </p>
      </div>
    </nav>
  );
}