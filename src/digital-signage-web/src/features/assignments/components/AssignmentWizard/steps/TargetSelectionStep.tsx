/**
 * @fileoverview Target Selection Step  
 * @description Second step of assignment wizard - select target devices or device groups from API
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, Users, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAssignmentWizard } from '../AssignmentWizardContext';
import { AssignmentTargetType } from '../../../types/assignment.types';
import { getTargetsByType, type TargetDevice, type TargetDeviceGroup } from '../../../api/targetApi';

type TargetType = 'device' | 'group';
type TargetItem = TargetDevice | TargetDeviceGroup;

export function TargetSelectionStep() {
  const { data, updateTargetData } = useAssignmentWizard();
  const [targetType, setTargetType] = useState<TargetType>('device');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>(
    data.target?.targetIds || []
  );
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize target type from existing data
  useEffect(() => {
    if (data.target?.targetType !== undefined) {
      setTargetType(data.target.targetType === AssignmentTargetType.Device ? 'device' : 'group');
    }
  }, [data.target?.targetType]);

  // Fetch targets when type changes
  useEffect(() => {
    const loadTargets = async () => {
      setIsLoading(true);
      console.log('🔄 Loading targets for type:', targetType);
      
      try {
        const fetchedTargets = await getTargetsByType(targetType);
        console.log('✅ Loaded targets:', fetchedTargets.length, 'items');
        setTargets(fetchedTargets);
      } catch (error) {
        console.error('❌ Failed to load targets:', error);
        setTargets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTargets();
  }, [targetType]);

  // Filter items based on search
  const filteredItems = targets.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    if (item.type === 'device') {
      const device = item as TargetDevice;
      return device.name.toLowerCase().includes(searchLower) ||
             (device.location && device.location.toLowerCase().includes(searchLower));
    } else {
      const group = item as TargetDeviceGroup;
      return group.name.toLowerCase().includes(searchLower) ||
             (group.description && group.description.toLowerCase().includes(searchLower));
    }
  });

  // Handle target type change
  const handleTargetTypeChange = (newType: TargetType) => {
    setTargetType(newType);
    setSelectedItems([]);
    setSearchQuery('');
  };

  // Handle item selection
  const handleItemToggle = (itemId: number) => {
    setSelectedItems(prev => {
      const newSelection = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      return newSelection;
    });
  };

  // Update wizard data when selections change
  useEffect(() => {
    const targetTypeEnum = targetType === 'device' 
      ? AssignmentTargetType.Device 
      : AssignmentTargetType.DeviceGroup;
    
    const targetNames = targets
      .filter(item => selectedItems.includes(item.id))
      .map(item => item.name);

    updateTargetData({
      targetType: targetTypeEnum,
      targetIds: selectedItems,
      targetNames: targetNames,
    });
  }, [targetType, selectedItems, targets, updateTargetData]);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Select Targets</h2>
        <p className="text-gray-600">
          Choose the devices or device groups for this assignment
        </p>
      </div>

      {/* Target Type Selection */}
      <div>
        <label className="text-base font-medium mb-3 block">Target Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTargetTypeChange('device')}
            className={`flex items-center p-4 border-2 rounded-lg transition-all ${
              targetType === 'device'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Monitor className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-medium">Individual Devices</div>
              <div className="text-sm opacity-70">Select specific screens</div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => handleTargetTypeChange('group')}
            className={`flex items-center p-4 border-2 rounded-lg transition-all ${
              targetType === 'group'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Users className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-medium">Device Groups</div>
              <div className="text-sm opacity-70">Select groups of screens</div>
            </div>
          </button>
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="text-base font-medium mb-3 block">
          Select {targetType === 'device' ? 'Devices' : 'Device Groups'}
        </label>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search ${targetType === 'device' ? 'devices' : 'groups'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Target List */}
        <div className="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-4 bg-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
              <span className="text-gray-600">Loading targets...</span>
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              
              if (item.type === 'device') {
                const device = item as TargetDevice;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemToggle(item.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">{device.name}</p>
                          <p className="text-xs text-gray-500">{device.location || 'No location'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${
                          device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {device.status}
                        </Badge>
                        {isSelected && (
                          <Badge className="text-xs">Selected</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              } else {
                const group = item as TargetDeviceGroup;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemToggle(item.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">{group.name}</p>
                          <p className="text-xs text-gray-500">
                            {group.description || `${group.deviceCount} devices`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs bg-gray-100 text-gray-600">
                          {group.deviceCount} devices
                        </Badge>
                        {isSelected && (
                          <Badge className="text-xs">Selected</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No matching targets found' : 'No targets available'}
            </div>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedItems.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Selected {selectedItems.length} {targetType === 'device' ? 'device(s)' : 'group(s)'}
          </p>
          <div className="flex flex-wrap gap-2">
            {targets
              .filter(item => selectedItems.includes(item.id))
              .map(item => (
                <Badge key={item.id} className="text-xs">
                  {item.name}
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
