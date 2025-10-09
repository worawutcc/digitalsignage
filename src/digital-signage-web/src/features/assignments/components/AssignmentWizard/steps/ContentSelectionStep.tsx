/**
 * @fileoverview Content Selection Step (Simplified)
 * @description First step of assignment wizard - select assignment type and content
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, List, Image, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAssignmentWizard } from '../AssignmentWizardContext';
import { AssignmentType } from '../../../types/assignment.types';

// Mock data - replace with actual API calls
const MOCK_CONTENT = [
  { id: 1, name: 'Morning News Display', type: 'schedule', description: 'Daily news from 6-10 AM' },
  { id: 2, name: 'Lunch Menu Board', type: 'schedule', description: 'Restaurant menu 11 AM-2 PM' },
  { id: 4, name: 'Marketing Campaign Q4', type: 'playlist', description: '5 promotional videos' },
  { id: 5, name: 'Safety Training Loop', type: 'playlist', description: '3 safety instruction videos' },
  { id: 7, name: 'Emergency Exit Map', type: 'media', description: 'Building evacuation plan' },
  { id: 8, name: 'Company Logo Animation', type: 'media', description: 'Animated brand logo' },
];

const ASSIGNMENT_TYPES = [
  { value: AssignmentType.Schedule, label: 'Schedule', icon: Calendar },
  { value: AssignmentType.Playlist, label: 'Playlist', icon: List },
  { value: AssignmentType.Media, label: 'Media', icon: Image },
  { value: AssignmentType.Emergency, label: 'Emergency', icon: AlertTriangle },
];

export function ContentSelectionStep() {
  const { data, updateContentData } = useAssignmentWizard();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<AssignmentType>(
    data.content?.assignmentType || AssignmentType.Schedule
  );
  const [selectedContent, setSelectedContent] = useState<number | null>(
    data.content?.contentId || null
  );

  // Filter content based on search
  const filteredContent = MOCK_CONTENT.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update wizard data when selections change
  useEffect(() => {
    const selectedItem = MOCK_CONTENT.find(item => item.id === selectedContent);
    if (selectedType && selectedContent && selectedItem) {
      updateContentData({
        assignmentType: selectedType,
        contentId: selectedContent,
        contentName: selectedItem.name,
        contentType: selectedItem.type as 'schedule' | 'playlist' | 'media',
      });
    } else if (selectedType !== data.content?.assignmentType) {
      updateContentData({
        assignmentType: selectedType,
        contentId: 0,
      });
      setSelectedContent(null);
    }
  }, [selectedType, selectedContent, updateContentData, data.content?.assignmentType]);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Select Content</h2>
        <p className="text-gray-600">
          Choose the type of assignment and select the content to display
        </p>
      </div>

      {/* Assignment Type Selection */}
      <div>
        <label className="text-base font-medium mb-3 block">Assignment Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ASSIGNMENT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  setSelectedType(type.value);
                  setSelectedContent(null);
                  setSearchQuery('');
                }}
                className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Selection */}
      <div>
        <label className="text-base font-medium mb-3 block">
          Select Content
        </label>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {filteredContent.length > 0 ? (
            filteredContent.map((item) => {
              const isSelected = selectedContent === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedContent(item.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    {isSelected && (
                      <Badge className="text-xs">Selected</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500">
              {searchQuery ? 'No matching content found' : 'No content available'}
            </div>
          )}
        </div>

        {/* Selection Summary */}
        {selectedContent && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium">Selected:</p>
            <p className="text-sm text-gray-600">
              {MOCK_CONTENT.find(item => item.id === selectedContent)?.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}