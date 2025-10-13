/**
 * @fileoverview Assignment Wizard Context
 * @description React context for managing wizard state and navigation
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  WizardStep,
  type AssignmentWizardContextValue,
  type AssignmentWizardData,
  type ContentSelectionData,
  type TargetSelectionData,
  type SchedulingData,
  contentSelectionSchema,
  targetSelectionSchema,
  schedulingSchema,
} from './AssignmentWizard.types';
import { useCreateAssignment } from '../../api/assignmentHooks';

const AssignmentWizardContext = createContext<AssignmentWizardContextValue | null>(null);

const STEP_ORDER: WizardStep[] = [
  WizardStep.ContentSelection,
  WizardStep.TargetSelection,
  WizardStep.Scheduling,
  WizardStep.Review,
];

interface AssignmentWizardProviderProps {
  children: React.ReactNode;
  initialData?: Partial<AssignmentWizardData>;
  onSuccess?: (assignmentId: number) => void;
  onClose?: () => void;
}

export function AssignmentWizardProvider({
  children,
  initialData,
  onSuccess,
  onClose,
}: AssignmentWizardProviderProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.ContentSelection);
  const [data, setData] = useState<Partial<AssignmentWizardData>>(initialData || {});
  
  const createAssignmentMutation = useCreateAssignment();

  // Navigation
  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      const nextStep = STEP_ORDER[currentIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep);
      }
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = STEP_ORDER[currentIndex - 1];
      if (prevStep) {
        setCurrentStep(prevStep);
      }
    }
  }, [currentStep]);

  // Data management
  const updateContentData = useCallback((contentData: Partial<ContentSelectionData>) => {
    setData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        ...contentData,
      } as ContentSelectionData,
    }));
  }, []);

  const updateTargetData = useCallback((targetData: Partial<TargetSelectionData>) => {
    setData((prev) => ({
      ...prev,
      target: {
        ...prev.target,
        ...targetData,
      } as TargetSelectionData,
    }));
  }, []);

  const updateSchedulingData = useCallback((schedulingData: Partial<SchedulingData>) => {
    setData((prev) => ({
      ...prev,
      scheduling: {
        ...prev.scheduling,
        ...schedulingData,
      } as SchedulingData,
    }));
  }, []);

  // Validation
  const isStepValid = useCallback(
    (step: WizardStep): boolean => {
      try {
        switch (step) {
          case WizardStep.ContentSelection:
            console.log('🔍 Validating ContentSelection:', data.content);
            if (!data.content) {
              console.log('❌ ContentSelection validation failed: no content data');
              return false;
            }
            
            try {
              contentSelectionSchema.parse(data.content);
              console.log('✅ ContentSelection validation passed');
              return true;
            } catch (validationError) {
              console.log('❌ ContentSelection validation failed:', validationError);
              return false;
            }
            
          case WizardStep.TargetSelection:
            console.log('🔍 Validating TargetSelection:', data.target);
            if (!data.target) {
              console.log('❌ TargetSelection validation failed: no target data');
              return false;
            }
            
            try {
              targetSelectionSchema.parse(data.target);
              console.log('✅ TargetSelection validation passed');
              return true;
            } catch (validationError) {
              console.log('❌ TargetSelection validation failed:', validationError);
              return false;
            }
            
          case WizardStep.Scheduling:
            console.log('🔍 Validating Scheduling:', data.scheduling);
            if (!data.scheduling) {
              console.log('❌ Scheduling validation failed: no scheduling data');
              return false;
            }
            
            try {
              schedulingSchema.parse(data.scheduling);
              console.log('✅ Scheduling validation passed');
              return true;
            } catch (validationError) {
              console.log('❌ Scheduling validation failed:', validationError);
              return false;
            }
            
          case WizardStep.Review:
            const contentValid = isStepValid(WizardStep.ContentSelection);
            const targetValid = isStepValid(WizardStep.TargetSelection);
            const schedulingValid = isStepValid(WizardStep.Scheduling);
            
            console.log('🔍 Validating Review step:', {
              contentValid,
              targetValid,
              schedulingValid
            });
            
            return contentValid && targetValid && schedulingValid;
            
          default:
            console.log('❌ Unknown step validation:', step);
            return false;
        }
      } catch {
        return false;
      }
    },
    [data]
  );

  // Submission
  const submitWizard = useCallback(async () => {
    console.log('📋 Submit wizard called');
    console.log('Data:', JSON.stringify(data, null, 2));
    
    if (!isStepValid(WizardStep.Review)) {
      console.error('❌ Validation failed: Please complete all required fields');
      alert('Please complete all required fields before submitting.');
      return;
    }

    if (!data.content || !data.target || !data.scheduling) {
      console.error('❌ Missing required data:', { 
        hasContent: !!data.content, 
        hasTarget: !!data.target, 
        hasScheduling: !!data.scheduling 
      });
      alert('Missing required data. Please complete all steps.');
      return;
    }

    const firstTargetId = data.target.targetIds[0];
    if (!firstTargetId) {
      console.error('❌ No target selected');
      alert('Please select at least one target device or group.');
      return;
    }

    try {
      console.log('🚀 Submitting assignment...');
      const payload = {
        assignmentType: data.content.assignmentType,
        contentId: data.content.contentId,
        targetType: data.target.targetType,
        targetId: firstTargetId,
        startDate: data.scheduling.startDate,
        endDate: data.scheduling.endDate || null,
        priority: data.scheduling.priority || 5, // Default to priority 5 if not set
        isEmergencyBroadcast: data.scheduling.isEmergencyBroadcast || false,
        recurrencePattern: data.scheduling.recurrencePattern || null,
        notes: data.scheduling.notes || null,
      };
      
      console.log('📦 Payload:', JSON.stringify(payload, null, 2));
      
      const assignment = await createAssignmentMutation.mutateAsync(payload);

      console.log('✅ Assignment created successfully:', assignment);
      
      // Reset wizard first
      setCurrentStep(WizardStep.ContentSelection);
      setData(initialData || {});
      
      // Then call callbacks (Backend returns Assignment directly, not wrapped)
      if (onSuccess && assignment?.id) {
        onSuccess(assignment.id);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error('❌ Failed to create assignment:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      alert(`Failed to create assignment: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
    }
  }, [data, isStepValid, createAssignmentMutation, onSuccess, onClose, initialData]);

  // Reset
  const resetWizard = useCallback(() => {
    setCurrentStep(WizardStep.ContentSelection);
    setData(initialData || {});
  }, [initialData]);

  const contextValue = useMemo<AssignmentWizardContextValue>(
    () => ({
      currentStep,
      data,
      goToStep,
      nextStep,
      previousStep,
      updateContentData,
      updateTargetData,
      updateSchedulingData,
      isStepValid,
      submitWizard,
      isSubmitting: createAssignmentMutation.isPending,
      resetWizard,
    }),
    [
      currentStep,
      data,
      goToStep,
      nextStep,
      previousStep,
      updateContentData,
      updateTargetData,
      updateSchedulingData,
      isStepValid,
      submitWizard,
      createAssignmentMutation.isPending,
      resetWizard,
    ]
  );

  return (
    <AssignmentWizardContext.Provider value={contextValue}>
      {children}
    </AssignmentWizardContext.Provider>
  );
}

/**
 * Hook to use the Assignment Wizard context
 */
export function useAssignmentWizard() {
  const context = useContext(AssignmentWizardContext);
  if (!context) {
    throw new Error('useAssignmentWizard must be used within AssignmentWizardProvider');
  }
  return context;
}
