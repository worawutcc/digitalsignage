/**
 * @fileoverview Scheduling Step
 * @description Third step of assignment wizard - schedule timing and options
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useAssignmentWizard } from '../AssignmentWizardContext';

export function SchedulingStep() {
  const { data, updateSchedulingData } = useAssignmentWizard();
  
  // Form state
  const [startDate, setStartDate] = useState(
    data.scheduling?.startDate || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(data.scheduling?.endDate || '');
  const [priority, setPriority] = useState(data.scheduling?.priority || 5);
  const [isEmergencyBroadcast, setIsEmergencyBroadcast] = useState(
    data.scheduling?.isEmergencyBroadcast || false
  );
  const [notes, setNotes] = useState(data.scheduling?.notes || '');

  // Get tomorrow's date for minimum date validation
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Update wizard data when form changes
  useEffect(() => {
    if (startDate) {
      const updateData: any = {
        startDate,
        priority,
        isEmergencyBroadcast,
      };
      
      if (endDate) {
        updateData.endDate = endDate;
      }
      
      if (notes) {
        updateData.notes = notes;
      }
      
      updateSchedulingData(updateData);
    }
  }, [startDate, endDate, priority, isEmergencyBroadcast, notes, updateSchedulingData]);

  // Handle emergency broadcast toggle
  const handleEmergencyToggle = (checked: boolean) => {
    setIsEmergencyBroadcast(checked);
    if (checked) {
      // Emergency broadcasts have highest priority
      setPriority(10);
      // Set start date to today for immediate deployment
      setStartDate(new Date().toISOString().split('T')[0]);
    } else {
      // Reset to normal priority
      setPriority(5);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Schedule Assignment</h2>
        <p className="text-gray-600">
          Set the timing, priority, and additional options for this assignment
        </p>
      </div>

      {/* Emergency Broadcast Toggle */}
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="emergency"
            checked={isEmergencyBroadcast}
            onChange={(e) => handleEmergencyToggle(e.target.checked)}
            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
          />
          <label htmlFor="emergency" className="flex items-center gap-2 cursor-pointer">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <div className="font-medium text-red-900">Emergency Broadcast</div>
              <div className="text-sm text-red-700">
                Override all current content with highest priority
              </div>
            </div>
          </label>
        </div>
        
        {isEmergencyBroadcast && (
          <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
            <p className="text-sm text-red-800">
              ⚠️ Emergency broadcasts will immediately interrupt all current content 
              and display with maximum priority across selected devices.
            </p>
          </div>
        )}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-base font-medium mb-3">
            <Calendar className="w-4 h-4" />
            Start Date *
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={isEmergencyBroadcast ? new Date().toISOString().split('T')[0] : tomorrowStr}
            className="w-full"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {isEmergencyBroadcast ? 'Can start today for emergency' : 'Must be at least tomorrow'}
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-base font-medium mb-3">
            <Calendar className="w-4 h-4" />
            End Date (Optional)
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="w-full"
            placeholder="Leave empty for indefinite"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to run indefinitely
          </p>
        </div>
      </div>

      {/* Priority */}
      <div>
        <label className="flex items-center gap-2 text-base font-medium mb-3">
          <Clock className="w-4 h-4" />
          Priority Level: {priority}
        </label>
        
        <div className="space-y-3">
          <input
            type="range"
            min="1"
            max="10"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            disabled={isEmergencyBroadcast}
            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
              ${isEmergencyBroadcast ? 'opacity-50' : 'hover:bg-gray-300'}
            `}
            style={{
              background: `linear-gradient(to right, 
                #f3f4f6 0%, 
                #3b82f6 ${((priority - 1) / 9) * 100}%, 
                #f3f4f6 ${((priority - 1) / 9) * 100}%)`
            }}
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 - Low</span>
            <span>5 - Normal</span>
            <span>10 - High</span>
          </div>
          
          {isEmergencyBroadcast && (
            <p className="text-sm text-red-600">
              Emergency broadcasts automatically use maximum priority (10)
            </p>
          )}
        </div>
      </div>

      {/* Priority Description */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Priority Guidelines:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>1-3 (Low):</strong> Background content, general information</li>
          <li><strong>4-6 (Normal):</strong> Regular announcements, scheduled content</li>
          <li><strong>7-9 (High):</strong> Important notifications, time-sensitive content</li>
          <li><strong>10 (Maximum):</strong> Emergency broadcasts, critical alerts</li>
        </ul>
      </div>

      {/* Notes */}
      <div>
        <label className="flex items-center gap-2 text-base font-medium mb-3">
          <FileText className="w-4 h-4" />
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes or instructions for this assignment..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional notes visible to administrators
        </p>
      </div>

      {/* Schedule Summary */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Schedule Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Start:</span>
            <div className="font-medium">
              {startDate ? new Date(startDate).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'Not set'}
            </div>
          </div>
          
          <div>
            <span className="text-gray-600">End:</span>
            <div className="font-medium">
              {endDate 
                ? new Date(endDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric', 
                    month: 'short',
                    day: 'numeric'
                  })
                : 'Indefinite'
              }
            </div>
          </div>
          
          <div>
            <span className="text-gray-600">Priority:</span>
            <div className={`font-medium ${
              priority >= 8 ? 'text-red-600' : 
              priority >= 6 ? 'text-orange-600' : 
              'text-green-600'
            }`}>
              {priority}/10 {isEmergencyBroadcast && '(Emergency)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}