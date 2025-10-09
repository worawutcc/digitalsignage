/**
 * @fileoverview Content Selection Step
 * @description First step of assignment wizard - select assignment type and content from API
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, List, Image, AlertTriangle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAssignmentWizard } from '../AssignmentWizardContext';
import { AssignmentType } from '../../../types/assignment.types';
import { getContentByType, type ContentItem } from '../../../api/contentApi';

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
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch content when type changes
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      console.log('🔄 Loading content for type:', selectedType);
      
      try {
        const typeMap: Record<AssignmentType, 'schedule' | 'playlist' | 'media'> = {
          [AssignmentType.Schedule]: 'schedule',
          [AssignmentType.Playlist]: 'playlist',
          [AssignmentType.Media]: 'media',
          [AssignmentType.Emergency]: 'media', // Emergency uses media
        };
        
        const fetchedContent = await getContentByType(typeMap[selectedType]);
        console.log('✅ Loaded content:', fetchedContent.length, 'items');
        setContent(fetchedContent);
      } catch (error) {
        console.error('❌ Failed to load content:', error);
        setContent([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [selectedType]);

  // Filter content based on search
  const filteredContent = content.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Update wizard data when selections change
  useEffect(() => {
    const selectedItem = content.find(item => item.id === selectedContent);
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
  }, [selectedType, selectedContent, updateContentData, data.content?.assignmentType, content]);

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
          {isLoading ? (
            <div className="col-span-2 flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
              <span className="text-gray-600">Loading content...</span>
            </div>
          ) : filteredContent.length > 0 ? (
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
        {selectedContent && content.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium">Selected:</p>
            <p className="text-sm text-gray-600">
              {content.find(item => item.id === selectedContent)?.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}