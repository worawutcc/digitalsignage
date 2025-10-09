/**
 * @fileoverview Review Step
 * @description Final step of assignment wizard - review all selections before submission
 */

'use client';

import React from 'react';
import { Edit, Calendar, Monitor, Users, Image, List, FileText, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useAssignmentWizard } from '../AssignmentWizardContext';
import { AssignmentType, AssignmentTargetType } from '../../../types/assignment.types';
import { WizardStep } from '../AssignmentWizard.types';

export function ReviewStep() {
  const { data, goToStep, isSubmitting } = useAssignmentWizard();

  const getAssignmentTypeLabel = (type: AssignmentType) => {
    switch (type) {
      case AssignmentType.Schedule: return 'Schedule';
      case AssignmentType.Playlist: return 'Playlist';
      case AssignmentType.Media: return 'Media';
      case AssignmentType.Emergency: return 'Emergency';
      default: return 'Unknown';
    }
  };

  const getAssignmentTypeIcon = (type: AssignmentType) => {
    switch (type) {
      case AssignmentType.Schedule: return Calendar;
      case AssignmentType.Playlist: return List;
      case AssignmentType.Media: return Image;
      case AssignmentType.Emergency: return AlertTriangle;
      default: return FileText;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Review Assignment</h2>
        <p className="text-gray-600">
          Review your assignment details before submitting. Click any section to edit.
        </p>
      </div>

      {/* Content Selection Review */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            {data.content?.assignmentType !== undefined && (
              <>
                {React.createElement(getAssignmentTypeIcon(data.content.assignmentType), { 
                  className: "w-5 h-5" 
                })}
                Content Selection
              </>
            )}
          </h3>
          <button
            type="button"
            onClick={() => goToStep(WizardStep.ContentSelection)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
            disabled={isSubmitting}
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        {data.content ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Type:</span>
              <Badge className={`${
                data.content.assignmentType === AssignmentType.Emergency ? 'bg-red-100 text-red-800' : ''
              }`}>
                {getAssignmentTypeLabel(data.content.assignmentType)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Content:</span>
              <span className="font-medium">{data.content.contentName || 'Not specified'}</span>
            </div>
            {data.content.contentType && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Content Type:</span>
                <Badge>{data.content.contentType}</Badge>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-600">❌ Content selection incomplete</p>
        )}
      </div>

      {/* Target Selection Review */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            {data.target?.targetType === AssignmentTargetType.Device ? (
              <Monitor className="w-5 h-5" />
            ) : (
              <Users className="w-5 h-5" />
            )}
            Target Selection
          </h3>
          <button
            type="button"
            onClick={() => goToStep(WizardStep.TargetSelection)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
            disabled={isSubmitting}
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        {data.target && data.target.targetIds.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Target Type:</span>
              <Badge>
                {data.target.targetType === AssignmentTargetType.Device ? 'Individual Devices' : 'Device Groups'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Count:</span>
              <span className="font-medium">{data.target.targetIds.length}</span>
            </div>
            {data.target.targetNames && data.target.targetNames.length > 0 && (
              <div>
                <span className="text-gray-600">Selected:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.target.targetNames.map((name, index) => (
                    <Badge key={index} className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-600">❌ Target selection incomplete</p>
        )}
      </div>

      {/* Scheduling Review */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Scheduling
          </h3>
          <button
            type="button"
            onClick={() => goToStep(WizardStep.Scheduling)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
            disabled={isSubmitting}
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        {data.scheduling ? (
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium">{formatDate(data.scheduling.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">End Date:</span>
                <span className="font-medium">
                  {data.scheduling.endDate ? formatDate(data.scheduling.endDate) : 'Indefinite'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Priority:</span>
              <Badge className={`${
                data.scheduling.priority >= 8 ? 'bg-red-100 text-red-800' : 
                data.scheduling.priority >= 6 ? 'bg-orange-100 text-orange-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {data.scheduling.priority}/10
              </Badge>
            </div>

            {data.scheduling.isEmergencyBroadcast && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <Badge className="bg-red-100 text-red-800">Emergency Broadcast</Badge>
              </div>
            )}

            {data.scheduling.notes && (
              <div>
                <span className="text-gray-600">Notes:</span>
                <p className="mt-1 text-sm p-2 bg-gray-50 rounded border">
                  {data.scheduling.notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-600">❌ Scheduling information incomplete</p>
        )}
      </div>

      {/* Validation Summary */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-medium mb-3">Validation Status</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {data.content ? (
              <span className="text-green-600">✅ Content selected</span>
            ) : (
              <span className="text-red-600">❌ Content selection required</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {data.target && data.target.targetIds.length > 0 ? (
              <span className="text-green-600">✅ Targets selected</span>
            ) : (
              <span className="text-red-600">❌ Target selection required</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {data.scheduling ? (
              <span className="text-green-600">✅ Schedule configured</span>
            ) : (
              <span className="text-red-600">❌ Schedule configuration required</span>
            )}
          </div>
        </div>
      </div>

      {/* Final Warning */}
      {data.scheduling?.isEmergencyBroadcast && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h4 className="font-medium text-red-900">Emergency Broadcast Warning</h4>
          </div>
          <p className="text-sm text-red-800">
            This assignment will immediately interrupt all current content on the selected devices.
            All users will see this content with highest priority. Make sure this is intentional.
          </p>
        </div>
      )}

      {/* Submission Status */}
      {isSubmitting && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Creating assignment...</span>
          </div>
        </div>
      )}
    </div>
  );
}