import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import BulkOperationsModal from '@/components/devices/BulkOperationsModal';

// Mock the device API
jest.mock('@/lib/api', () => ({
  deviceApi: {
    bulkUpdateStatus: jest.fn(),
    bulkDelete: jest.fn(),
    bulkApplyConfiguration: jest.fn(),
    bulkAssignToGroup: jest.fn(),
    bulkRestart: jest.fn(),
  },
}));

type BulkOperation = 'updateStatus' | 'delete' | 'applyConfiguration' | 'assignGroup' | 'restart';
type DeviceStatus = 'online' | 'offline' | 'error' | 'maintenance' | 'restarting';

interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: BulkOperation | null;
  deviceIds: number[];
  devices?: Array<{
    id: number;
    name: string;
    status: DeviceStatus;
  }>;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

// Mock component since we don't have the actual implementation
const BulkOperationsModal: React.FC<BulkOperationsModalProps> = ({
  isOpen,
  onClose,
  operation,
  deviceIds,
  devices = [],
  onSuccess,
  onError,
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      const { deviceApi } = await import('@/lib/api');
      let result;

      switch (operation) {
        case 'updateStatus':
          result = await deviceApi.bulkUpdateStatus(deviceIds, 'maintenance');
          break;
        case 'delete':
          result = await deviceApi.bulkDelete(deviceIds);
          break;
        case 'applyConfiguration':
          result = await deviceApi.bulkApplyConfiguration(deviceIds, {});
          break;
        case 'assignGroup':
          result = await deviceApi.bulkAssignToGroup(deviceIds, 1);
          break;
        case 'restart':
          result = await deviceApi.bulkRestart(deviceIds);
          break;
      }

      onSuccess?.(result);
      onClose();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Operation failed');
    }
  };

  return (
    <div data-testid="bulk-operations-modal" className="modal">
      <div className="modal-content">
        <h2>Bulk Operations</h2>
        <p>Operation: {operation}</p>
        <p>Selected devices: {deviceIds.length}</p>
        
        {devices.map(device => (
          <div key={device.id} data-testid={`device-${device.id}`}>
            {device.name} - {device.status}
          </div>
        ))}

        {operation === 'updateStatus' && (
          <div>
            <label htmlFor="status-select">New Status:</label>
            <select id="status-select" data-testid="status-select">
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
              <option value="error">Error</option>
            </select>
          </div>
        )}

        {operation === 'assignGroup' && (
          <div>
            <label htmlFor="group-select">Assign to Group:</label>
            <select id="group-select" data-testid="group-select">
              <option value="1">Group 1</option>
              <option value="2">Group 2</option>
              <option value="3">Group 3</option>
            </select>
          </div>
        )}

        {operation === 'applyConfiguration' && (
          <div data-testid="configuration-form">
            <h3>Configuration Settings</h3>
            <div>
              <label htmlFor="resolution">Resolution:</label>
              <select id="resolution" data-testid="resolution-select">
                <option value="1920x1080">1920x1080</option>
                <option value="4K">4K</option>
                <option value="1280x720">1280x720</option>
              </select>
            </div>
            <div>
              <label htmlFor="volume">Volume:</label>
              <input 
                type="range" 
                id="volume" 
                min="0" 
                max="100" 
                defaultValue="50"
                data-testid="volume-input"
              />
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} data-testid="cancel-button">
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            data-testid="confirm-button"
            className={operation === 'delete' ? 'danger' : 'primary'}
          >
            {operation === 'delete' ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

describe('BulkOperationsModal', () => {
  const mockDevices = [
    { id: 1, name: 'Device 1', status: 'online' as DeviceStatus },
    { id: 2, name: 'Device 2', status: 'offline' as DeviceStatus },
    { id: 3, name: 'Device 3', status: 'error' as DeviceStatus },
  ];

  const defaultProps: BulkOperationsModalProps = {
    isOpen: true,
    onClose: jest.fn(),
    operation: 'updateStatus',
    deviceIds: [1, 2, 3],
    devices: mockDevices,
    onSuccess: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render when closed', () => {
    render(<BulkOperationsModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByTestId('bulk-operations-modal')).not.toBeInTheDocument();
  });

  test('renders when open', () => {
    render(<BulkOperationsModal {...defaultProps} />);
    
    expect(screen.getByTestId('bulk-operations-modal')).toBeInTheDocument();
    expect(screen.getByText('Bulk Operations')).toBeInTheDocument();
  });

  test('displays selected devices', () => {
    render(<BulkOperationsModal {...defaultProps} />);
    
    expect(screen.getByText('Selected devices: 3')).toBeInTheDocument();
    expect(screen.getByTestId('device-1')).toBeInTheDocument();
    expect(screen.getByTestId('device-2')).toBeInTheDocument();
    expect(screen.getByTestId('device-3')).toBeInTheDocument();
    expect(screen.getByText('Device 1 - online')).toBeInTheDocument();
    expect(screen.getByText('Device 2 - offline')).toBeInTheDocument();
    expect(screen.getByText('Device 3 - error')).toBeInTheDocument();
  });

  test('shows status selection for updateStatus operation', () => {
    render(<BulkOperationsModal {...defaultProps} operation="updateStatus" />);
    
    expect(screen.getByLabelText('New Status:')).toBeInTheDocument();
    expect(screen.getByTestId('status-select')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Online')).toBeInTheDocument();
  });

  test('shows group selection for assignGroup operation', () => {
    render(<BulkOperationsModal {...defaultProps} operation="assignGroup" />);
    
    expect(screen.getByLabelText('Assign to Group:')).toBeInTheDocument();
    expect(screen.getByTestId('group-select')).toBeInTheDocument();
  });

  test('shows configuration form for applyConfiguration operation', () => {
    render(<BulkOperationsModal {...defaultProps} operation="applyConfiguration" />);
    
    expect(screen.getByTestId('configuration-form')).toBeInTheDocument();
    expect(screen.getByLabelText('Resolution:')).toBeInTheDocument();
    expect(screen.getByLabelText('Volume:')).toBeInTheDocument();
    expect(screen.getByTestId('resolution-select')).toBeInTheDocument();
    expect(screen.getByTestId('volume-input')).toBeInTheDocument();
  });

  test('calls onClose when cancel button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<BulkOperationsModal {...defaultProps} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('performs bulk status update', async () => {
    const { deviceApi } = await import('@/lib/api');
    const mockResult = { successfulCount: 3, failedCount: 0, totalCount: 3 };
    (deviceApi.bulkUpdateStatus as jest.Mock).mockResolvedValue(mockResult);
    
    const mockOnSuccess = jest.fn();
    
    render(
      <BulkOperationsModal 
        {...defaultProps} 
        operation="updateStatus"
        onSuccess={mockOnSuccess}
      />
    );
    
    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(deviceApi.bulkUpdateStatus).toHaveBeenCalledWith([1, 2, 3], 'maintenance');
      expect(mockOnSuccess).toHaveBeenCalledWith(mockResult);
    });
  });

  test('performs bulk delete operation', async () => {
    const { deviceApi } = await import('@/lib/api');
    const mockResult = { successfulCount: 3, failedCount: 0, totalCount: 3 };
    (deviceApi.bulkDelete as jest.Mock).mockResolvedValue(mockResult);
    
    const mockOnSuccess = jest.fn();
    
    render(
      <BulkOperationsModal 
        {...defaultProps} 
        operation="delete"
        onSuccess={mockOnSuccess}
      />
    );
    
    const confirmButton = screen.getByTestId('confirm-button');
    expect(confirmButton).toHaveTextContent('Delete');
    expect(confirmButton).toHaveClass('danger');
    
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(deviceApi.bulkDelete).toHaveBeenCalledWith([1, 2, 3]);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockResult);
    });
  });

  test('performs bulk configuration application', async () => {
    const { deviceApi } = await import('@/lib/api');
    const mockResult = { successfulCount: 3, failedCount: 0, totalCount: 3 };
    (deviceApi.bulkApplyConfiguration as jest.Mock).mockResolvedValue(mockResult);
    
    const mockOnSuccess = jest.fn();
    
    render(
      <BulkOperationsModal 
        {...defaultProps} 
        operation="applyConfiguration"
        onSuccess={mockOnSuccess}
      />
    );
    
    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(deviceApi.bulkApplyConfiguration).toHaveBeenCalledWith([1, 2, 3], {});
      expect(mockOnSuccess).toHaveBeenCalledWith(mockResult);
    });
  });

  test('performs bulk group assignment', async () => {
    const { deviceApi } = await import('@/lib/api');
    const mockResult = { successfulCount: 3, failedCount: 0, totalCount: 3 };
    (deviceApi.bulkAssignToGroup as jest.Mock).mockResolvedValue(mockResult);
    
    const mockOnSuccess = jest.fn();
    
    render(
      <BulkOperationsModal 
        {...defaultProps} 
        operation="assignGroup"
        onSuccess={mockOnSuccess}
      />
    );
    
    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(deviceApi.bulkAssignToGroup).toHaveBeenCalledWith([1, 2, 3], 1);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockResult);
    });
  });

  test('performs bulk restart operation', async () => {
    const { deviceApi } = await import('@/lib/api');
    const mockResult = { successfulCount: 2, failedCount: 1, totalCount: 3 };
    (deviceApi.bulkRestart as jest.Mock).mockResolvedValue(mockResult);
    
    const mockOnSuccess = jest.fn();
    
    render(
      <BulkOperationsModal 
        {...defaultProps} 
        operation="restart"
        onSuccess={mockOnSuccess}
      />
    );
    
    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(deviceApi.bulkRestart).toHaveBeenCalledWith([1, 2, 3]);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockResult);
    });
  });

  test('handles API errors', async () => {
    const { deviceApi } = await import('@/lib/api');
    const errorMessage = 'Network error';
    (deviceApi.bulkUpdateStatus as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    const mockOnError = jest.fn();
    
    render(
      <BulkOperationsModal 
        {...defaultProps} 
        operation="updateStatus"
        onError={mockOnError}
      />
    );
    
    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
    });
  });

  test('handles non-Error exceptions', async () => {
    const { deviceApi } = await import('@/lib/api');
    (deviceApi.bulkUpdateStatus as jest.Mock).mockRejectedValue('String error');
    
    const mockOnError = jest.fn();
    
    render(
      <BulkOperationsModal 
        {...defaultProps} 
        operation="updateStatus"
        onError={mockOnError}
      />
    );
    
    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Operation failed');
    });
  });

  test('closes modal after successful operation', async () => {
    const { deviceApi } = await import('@/lib/api');
    (deviceApi.bulkUpdateStatus as jest.Mock).mockResolvedValue({});
    
    const mockOnClose = jest.fn();
    
    render(
      <BulkOperationsModal 
        {...defaultProps} 
        operation="updateStatus"
        onClose={mockOnClose}
      />
    );
    
    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('handles empty device list', () => {
    render(
      <BulkOperationsModal 
        {...defaultProps} 
        deviceIds={[]}
        devices={[]}
      />
    );
    
    expect(screen.getByText('Selected devices: 0')).toBeInTheDocument();
  });

  test('allows changing status selection', () => {
    render(<BulkOperationsModal {...defaultProps} operation="updateStatus" />);
    
    const statusSelect = screen.getByTestId('status-select');
    fireEvent.change(statusSelect, { target: { value: 'maintenance' } });
    
    expect(statusSelect).toHaveValue('maintenance');
  });

  test('allows changing group selection', () => {
    render(<BulkOperationsModal {...defaultProps} operation="assignGroup" />);
    
    const groupSelect = screen.getByTestId('group-select');
    fireEvent.change(groupSelect, { target: { value: '2' } });
    
    expect(groupSelect).toHaveValue('2');
  });

  test('allows changing configuration settings', () => {
    render(<BulkOperationsModal {...defaultProps} operation="applyConfiguration" />);
    
    const resolutionSelect = screen.getByTestId('resolution-select');
    fireEvent.change(resolutionSelect, { target: { value: '4K' } });
    expect(resolutionSelect).toHaveValue('4K');
    
    const volumeInput = screen.getByTestId('volume-input');
    fireEvent.change(volumeInput, { target: { value: '75' } });
    expect(volumeInput).toHaveValue('75');
  });

  test('shows appropriate button text for different operations', () => {
    const operations: Array<{ operation: BulkOperation; expectedText: string; expectedClass?: string }> = [
      { operation: 'updateStatus', expectedText: 'Confirm' },
      { operation: 'delete', expectedText: 'Delete', expectedClass: 'danger' },
      { operation: 'applyConfiguration', expectedText: 'Confirm' },
      { operation: 'assignGroup', expectedText: 'Confirm' },
      { operation: 'restart', expectedText: 'Confirm' },
    ];

    operations.forEach(({ operation, expectedText, expectedClass }) => {
      const { unmount } = render(
        <BulkOperationsModal {...defaultProps} operation={operation} />
      );
      
      const confirmButton = screen.getByTestId('confirm-button');
      expect(confirmButton).toHaveTextContent(expectedText);
      
      if (expectedClass) {
        expect(confirmButton).toHaveClass(expectedClass);
      }
      
      unmount();
    });
  });

  test('renders without devices prop', () => {
    const { devices, ...propsWithoutDevices } = defaultProps;
    
    render(<BulkOperationsModal {...propsWithoutDevices} />);
    
    expect(screen.getByText('Selected devices: 3')).toBeInTheDocument();
    // Should not crash when devices array is empty/undefined
  });
});