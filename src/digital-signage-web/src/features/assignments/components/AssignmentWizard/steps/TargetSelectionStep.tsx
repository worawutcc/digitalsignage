/**
 * @fileoverview Target Selection Step
 * @description Second step of assignment wizard - select target devices or device groups
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, Users, Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAssignmentWizard } from '../AssignmentWizardContext';
import { AssignmentTargetType } from '../../../types/assignment.types';

// Mock data - replace with actual API calls
const MOCK_DEVICES = [
  { id: 1, name: 'Lobby Screen 1', location: 'Main Lobby', status: 'online', type: 'device' },
  { id: 2, name: 'Lobby Screen 2', location: 'Main Lobby', status: 'online', type: 'device' },
  { id: 3, name: 'Conference Room A Display', location: 'Floor 2', status: 'online', type: 'device' },
  { id: 4, name: 'Cafeteria Menu Board', location: 'Cafeteria', status: 'offline', type: 'device' },
  { id: 5, name: 'Emergency Exit Display', location: 'Stairwell B', status: 'online', type: 'device' },
];

const MOCK_DEVICE_GROUPS = [
  { id: 101, name: 'Lobby Displays', deviceCount: 2, description: 'All lobby area screens', type: 'group' },
  { id: 102, name: 'Conference Rooms', deviceCount: 5, description: 'Meeting room displays', type: 'group' },
  { id: 103, name: 'All Emergency Exits', deviceCount: 8, description: 'Emergency information displays', type: 'group' },
  { id: 104, name: 'Marketing Displays', deviceCount: 12, description: 'Customer-facing screens', type: 'group' },
];

type TargetType = 'devices' | 'groups';

export function TargetSelectionStep() {
  const { data, updateTargetData } = useAssignmentWizard();
  const [targetType, setTargetType] = useState<TargetType>('devices');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>(
    data.target?.targetIds || []
  );

  // Initialize target type from existing data
  useEffect(() => {
    if (data.target?.targetType !== undefined) {
      setTargetType(data.target.targetType === AssignmentTargetType.Device ? 'devices' : 'groups');
    }
  }, []);

  // Filter items based on search and selected type
  const filteredItems = targetType === 'devices'
    ? MOCK_DEVICES.filter(device =>
        device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_DEVICE_GROUPS.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

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
    const targetTypeEnum = targetType === 'devices' 
      ? AssignmentTargetType.Device 
      : AssignmentTargetType.DeviceGroup;
    
    updateTargetData({
      targetType: targetTypeEnum,
      targetIds: selectedItems,
      targetNames: selectedItems.length > 0 ? getSelectedNames() : [],
    });
  }, [targetType, selectedItems, updateTargetData]);

  const getSelectedNames = () => {
    if (targetType === 'devices') {
      return MOCK_DEVICES
        .filter(device => selectedItems.includes(device.id))
        .map(device => device.name);
    } else {
      return MOCK_DEVICE_GROUPS
        .filter(group => selectedItems.includes(group.id))
        .map(group => group.name);
    }
  };

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
            onClick={() => handleTargetTypeChange('devices')}
            className={`flex items-center p-4 border-2 rounded-lg transition-all ${
              targetType === 'devices'
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
            onClick={() => handleTargetTypeChange('groups')}
            className={`flex items-center p-4 border-2 rounded-lg transition-all ${
              targetType === 'groups'
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
          Select {targetType === 'devices' ? 'Devices' : 'Device Groups'}
        </label>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search ${targetType}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isSelected = selectedItems.includes(item.id);
            const isDevice = targetType === 'devices';
            
            return (
              <div
                key={item.id}
                onClick={() => handleItemToggle(item.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isDevice && (item as any).status === 'offline' ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    
                    {isDevice ? (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-600">{(item as any).location}</p>
                        <Badge 
                          className={`text-xs ${
                            (item as any).status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {(item as any).status}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-600">{(item as any).description}</p>
                        <Badge className="text-xs">
                          {(item as any).deviceCount} devices
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? `No matching ${targetType} found` : `No ${targetType} available`}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedItems.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">
              Selected {targetType === 'devices' ? 'Devices' : 'Groups'}: {selectedItems.length}
            </p>
            <button
              type="button"
              onClick={() => setSelectedItems([])}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {getSelectedNames().map((name, index) => (
              <Badge key={index} className="text-xs">
                {name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}