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
import { getAssignmentTypeText } from '../../../utils/assignmentHelpers';

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

  // Debug: Log current selection states
  console.log('🔧 ContentSelection State:', {
    selectedType: `${selectedType} (${getAssignmentTypeText(selectedType)})`,
    selectedContent,
    dataAssignmentType: data.content?.assignmentType ? `${data.content.assignmentType} (${getAssignmentTypeText(data.content.assignmentType)})` : 'None',
    dataContentId: data.content?.contentId
  });

  // Sync local state with wizard context data
  useEffect(() => {
    if (data.content?.assignmentType && data.content.assignmentType !== selectedType) {
      console.log('🔄 Syncing selectedType from wizard context:', data.content.assignmentType);
      setSelectedType(data.content.assignmentType);
    }
    if (data.content?.contentId !== undefined && data.content.contentId !== selectedContent) {
      console.log('🔄 Syncing selectedContent from wizard context:', data.content.contentId);
      setSelectedContent(data.content.contentId || null);
    }
  }, [data.content?.assignmentType, data.content?.contentId, selectedType, selectedContent]);

  // Fetch content when type changes
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      console.log('🔄 ContentSelection: Loading content for type:', `${selectedType} (${getAssignmentTypeText(selectedType)})`);
      
      try {
        const typeMap: Record<AssignmentType, 'schedule' | 'playlist' | 'media'> = {
          [AssignmentType.Schedule]: 'schedule',
          [AssignmentType.Playlist]: 'playlist',
          [AssignmentType.Media]: 'media',
          [AssignmentType.Emergency]: 'media', // Emergency uses media
        };
        
        const apiType = typeMap[selectedType];
        console.log('📡 API call will be for type:', apiType);
        
        const fetchedContent = await getContentByType(apiType);
        console.log('✅ ContentSelection: Loaded content:', fetchedContent.length, 'items for', `${selectedType} (${getAssignmentTypeText(selectedType)})`);
        console.log('📋 Content details:', fetchedContent);
        
        setContent(fetchedContent);
        
        // If no content and this is initial load with Schedule type
        if (fetchedContent.length === 0 && selectedType === AssignmentType.Schedule) {
          console.log('⚠️ No schedules found! This might be why the user sees empty list');
        }
      } catch (error) {
        console.error('❌ Failed to load content for type', selectedType, ':', error);
        setContent([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Always load content when component mounts or type changes
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
    
    console.log('🎯 ContentSelection - Selection updated:', {
      selectedType,
      selectedContent,
      selectedItem: selectedItem?.name,
      hasValidSelection: !!(selectedType && selectedContent && selectedItem)
    });
    
    if (selectedType && selectedContent && selectedItem) {
      const contentData = {
        assignmentType: selectedType,
        contentId: selectedContent,
        contentName: selectedItem.name,
        contentType: selectedItem.type as 'schedule' | 'playlist' | 'media',
      };
      
      console.log('✅ ContentSelection - Updating content data:', contentData);
      updateContentData(contentData);
    } else if (selectedType !== undefined) {
      // Update assignment type but don't clear contentId to 0 if no content selected yet
      console.log('🔄 ContentSelection - Updating assignment type only');
      updateContentData({
        assignmentType: selectedType,
        // Don't update contentId unless there's a valid selection
        ...(selectedContent ? { contentId: selectedContent } : {}),
      });
    }
  }, [selectedType, selectedContent, updateContentData, content]);

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
                  console.log('🔄 ContentSelection: User clicked type button:', type.value, 'current:', selectedType);
                  setSelectedType(type.value);
                  setSelectedContent(null);
                  setSearchQuery('');
                  
                  // Update wizard data with new type only (don't set contentId to 0)
                  updateContentData({
                    assignmentType: type.value,
                    // Remove contentId from previous selection to avoid validation issues
                  });
                  
                  console.log('✅ ContentSelection: Type updated to:', type.value);
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
          Select Content <span className="text-red-500">*</span>
        </label>
        
        {/* Progress Indicator */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${selectedType !== undefined ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className={selectedType !== undefined ? 'text-green-700 font-medium' : 'text-gray-600'}>
              Step 1: Select assignment type 
              {selectedType !== undefined ? (
                <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  ✅ {getAssignmentTypeText(selectedType)}
                </span>
              ) : (
                <span className="text-gray-500">(None selected)</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <div className={`w-3 h-3 rounded-full ${selectedContent ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className={selectedContent ? 'text-green-700 font-medium' : 'text-gray-600'}>
              Step 2: Choose specific content item {selectedContent ? '✅' : '(Required to continue)'}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search ${getAssignmentTypeText(selectedType).toLowerCase()} content...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Debug Information */}
        <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <div>Debug: Type={selectedType} ({getAssignmentTypeText(selectedType)}), Loading={isLoading ? 'Yes' : 'No'}</div>
          <div>Content Count={content.length}, Filtered={filteredContent.length}</div>
          <div>Wizard Data Type={data.content?.assignmentType !== undefined ? `${data.content.assignmentType} (${getAssignmentTypeText(data.content.assignmentType)})` : 'None'}, Content ID={data.content?.contentId || 'None'}</div>
          <div>Selection Valid: {!!(selectedType !== undefined && selectedContent) ? '✅ Yes' : '❌ No'}</div>
        </div>

        {/* Content List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="col-span-2 flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
              <span className="text-gray-600">Loading {getAssignmentTypeText(selectedType).toLowerCase()} content...</span>
            </div>
          ) : filteredContent.length > 0 ? (
            filteredContent.map((item) => {
              const isSelected = selectedContent === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    console.log('🎯 ContentSelection: User selected item:', item);
                    setSelectedContent(item.id);
                  }}
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
            <div className="col-span-2 text-center py-8">
              <div className="text-gray-500 mb-2">
                {searchQuery ? 'No matching content found' : `No ${getAssignmentTypeText(selectedType).toLowerCase()} content available`}
              </div>
              {selectedType === AssignmentType.Schedule && (
                <div className="text-xs text-orange-600">
                  💡 Tip: Make sure schedules exist in the system. 
                  You can create schedules in the Schedules section first.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selection Summary */}
        {selectedContent && content.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">✅ Content Selected:</p>
            <p className="text-sm text-green-700">
              {content.find(item => item.id === selectedContent)?.name}
            </p>
          </div>
        )}
        
        {/* Validation Message */}
        {selectedType !== undefined && !selectedContent && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">⚠️ Action Required:</p>
            <p className="text-sm text-yellow-700">
              Please select a specific {getAssignmentTypeText(selectedType).toLowerCase()} from the list above to continue to the next step.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}