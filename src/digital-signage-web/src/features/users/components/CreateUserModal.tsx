/**
 * CreateUserModal Component
 * Placeholder modal for creating new users
 * NOTE: Backend API endpoint for creating users needs to be implemented
 */

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { PerformanceMetric } from '@/types/enhanced-ui';

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onPerformanceMetric?: (metric: PerformanceMetric) => void;
}

export function CreateUserModal({
  onClose,
  onSuccess,
  onPerformanceMetric
}: CreateUserModalProps) {

  const handleCreatePlaceholder = () => {
    toast.error('Create User API endpoint not implemented yet');
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create New User"
      size="md"
      className="z-50"
    >
      <div className="text-center py-8">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Feature Under Development</h3>
        <p className="text-gray-600 mb-6">
          The Create User feature requires backend API implementation.
          <br />
          Please follow the admin workflow below instead:
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg text-left mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">Recommended Admin Workflow:</h4>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Create device groups first</li>
            <li>Upload media content</li>
            <li>Create schedules and assign content</li>
            <li>Register devices and assign to groups</li>
            <li>Monitor device status and content delivery</li>
          </ol>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreatePlaceholder}
            className="min-w-[120px]"
          >
            <User className="w-4 h-4 mr-2" />
            Acknowledge
          </Button>
        </div>
      </div>
    </Modal>
  );
}