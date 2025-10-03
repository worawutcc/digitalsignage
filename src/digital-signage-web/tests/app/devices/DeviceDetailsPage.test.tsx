import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DeviceDetailsPage from '@/pages/devices/DeviceDetailsPage';
import { devicesSlice } from '@/store/slices/devicesSlice';
import { uiSlice } from '@/store/slices/uiSlice';
import type { Device, DeviceConfiguration, DeviceStatusLog } from '@/types/device';

// Mock the API functions
jest.mock('@/lib/api', () => ({
  deviceApi: {
    getDevice: jest.fn(),
    updateDevice: jest.fn(),
    updateDeviceStatus: jest.fn(),
    deleteDevice: jest.fn(),
    getDeviceConfiguration: jest.fn(),
    updateDeviceConfiguration: jest.fn(),
    getDeviceStatusHistory: jest.fn(),
    restartDevice: jest.fn(),
  },
}));

// Mock the useRouter hook
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: { id: '1' },
    pathname: '/devices/1',
    back: jest.fn(),
  }),
}));

// Mock WebSocket hook
jest.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    connectionStatus: 'open',
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  }),
}));

const mockDevice: Device = {
  id: 1,
  name: 'Test Device',
  deviceType: 'AndroidTV',
  status: 'online',
  serialNumber: 'TEST-001',
  macAddress: '00:11:22:33:44:55',
  modelName: 'Samsung Smart TV',
  firmwareVersion: '1.2.3',
  lastSeen: new Date().toISOString(),
  isRegistered: true,
  registrationStatus: 'active',
  groupId: 5,
  location: 'Conference Room A',
  description: 'Main display for presentations',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockConfiguration: DeviceConfiguration = {
  id: 1,
  deviceId: 1,
  resolution: '1920x1080',
  volume: 75,
  autoStart: true,
  orientation: 'landscape',
  brightness: 80,
  sleepMode: 'enabled',
  powerSavingMode: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockStatusHistory: DeviceStatusLog[] = [
  {
    id: 1,
    deviceId: 1,
    status: 'online',
    timestamp: new Date().toISOString(),
    details: 'Device came online',
  },
  {
    id: 2,
    deviceId: 1,
    status: 'offline',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: 'Device went offline due to network issue',
  },
  {
    id: 3,
    deviceId: 1,
    status: 'online',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    details: 'Device started up',
  },
];

const createTestStore = () => {
  return configureStore({
    reducer: {
      devices: devicesSlice.reducer,
      ui: uiSlice.reducer,
    },
    preloadedState: {
      devices: {
        items: [mockDevice],
        loading: false,
        error: null,
        selectedIds: [],
        filters: {
          status: 'all',
          deviceType: 'all',
          registrationStatus: 'all',
        },
        sortBy: 'name',
        sortOrder: 'asc',
      },
      ui: {
        notifications: [],
        modals: {
          confirmDelete: { isOpen: false, deviceId: null },
          bulkOperations: { isOpen: false, operation: null, deviceIds: [] },
        },
        loading: {},
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const store = createTestStore();

  return render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        {component}
      </Provider>
    </QueryClientProvider>
  );
};

describe('DeviceDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default API mocks
    const { deviceApi } = require('@/lib/api');
    deviceApi.getDevice.mockResolvedValue(mockDevice);
    deviceApi.getDeviceConfiguration.mockResolvedValue(mockConfiguration);
    deviceApi.getDeviceStatusHistory.mockResolvedValue(mockStatusHistory);
  });

  test('renders device details correctly', async () => {
    renderWithProviders(<DeviceDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Device')).toBeInTheDocument();
      expect(screen.getByText('TEST-001')).toBeInTheDocument();
      expect(screen.getByText('00:11:22:33:44:55')).toBeInTheDocument();
      expect(screen.getByText('Samsung Smart TV')).toBeInTheDocument();
      expect(screen.getByText('1.2.3')).toBeInTheDocument();
      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
      expect(screen.getByText('Main display for presentations')).toBeInTheDocument();
    });
  });

  test('displays current device status', async () => {
    renderWithProviders(<DeviceDetailsPage />);

    await waitFor(() => {
      const statusIndicator = screen.getByTestId('device-status');
      expect(statusIndicator).toHaveTextContent('Online');
      expect(statusIndicator).toHaveClass('status-online');
    });
  });

  test('shows device configuration details', async () => {
    renderWithProviders(<DeviceDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('1920x1080')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('Landscape')).toBeInTheDocument();
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument(); // Auto Start
      expect(screen.getByText('Enabled')).toBeInTheDocument(); // Sleep Mode
    });
  });

  test('displays status history timeline', async () => {
    renderWithProviders(<DeviceDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Device came online')).toBeInTheDocument();
      expect(screen.getByText('Device went offline due to network issue')).toBeInTheDocument();
      expect(screen.getByText('Device started up')).toBeInTheDocument();
    });
  });

  test('allows editing device information', async () => {
    const { deviceApi } = await import('@/lib/api');
    deviceApi.updateDevice.mockResolvedValue({ ...mockDevice, name: 'Updated Device Name' });

    renderWithProviders(<DeviceDetailsPage />);

    // Click edit button
    const editButton = screen.getByLabelText('Edit device');
    fireEvent.click(editButton);

    // Update device name
    const nameInput = screen.getByLabelText('Device Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Device Name' } });

    // Update location
    const locationInput = screen.getByLabelText('Location');
    fireEvent.change(locationInput, { target: { value: 'Meeting Room B' } });

    // Save changes
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(deviceApi.updateDevice).toHaveBeenCalledWith(1, {
        ...mockDevice,
        name: 'Updated Device Name',
        location: 'Meeting Room B',
      });
    });
  });

  test('allows updating device configuration', async () => {
    const { deviceApi } = await import('@/lib/api');
    deviceApi.updateDeviceConfiguration.mockResolvedValue({
      ...mockConfiguration,
      volume: 90,
      brightness: 95,
    });

    renderWithProviders(<DeviceDetailsPage />);

    // Click configuration edit button
    const configEditButton = screen.getByText('Edit Configuration');
    fireEvent.click(configEditButton);

    // Update volume
    const volumeInput = screen.getByLabelText('Volume');
    fireEvent.change(volumeInput, { target: { value: '90' } });

    // Update brightness
    const brightnessInput = screen.getByLabelText('Brightness');
    fireEvent.change(brightnessInput, { target: { value: '95' } });

    // Save configuration
    const saveConfigButton = screen.getByText('Save Configuration');
    fireEvent.click(saveConfigButton);

    await waitFor(() => {
      expect(deviceApi.updateDeviceConfiguration).toHaveBeenCalledWith(1, {
        ...mockConfiguration,
        volume: 90,
        brightness: 95,
      });
    });
  });

  test('allows changing device status', async () => {
    const { deviceApi } = await import('@/lib/api');
    deviceApi.updateDeviceStatus.mockResolvedValue(true);

    renderWithProviders(<DeviceDetailsPage />);

    // Click status change button
    const statusButton = screen.getByText('Change Status');
    fireEvent.click(statusButton);

    // Select new status
    const statusSelect = screen.getByLabelText('New Status');
    fireEvent.change(statusSelect, { target: { value: 'maintenance' } });

    // Confirm status change
    const confirmButton = screen.getByText('Update Status');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deviceApi.updateDeviceStatus).toHaveBeenCalledWith(1, 'maintenance');
    });
  });

  test('handles device restart', async () => {
    const { deviceApi } = await import('@/lib/api');
    deviceApi.restartDevice.mockResolvedValue(true);

    renderWithProviders(<DeviceDetailsPage />);

    // Click restart button
    const restartButton = screen.getByText('Restart Device');
    fireEvent.click(restartButton);

    // Confirm restart
    const confirmButton = screen.getByText('Restart');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deviceApi.restartDevice).toHaveBeenCalledWith(1);
    });
  });

  test('shows device deletion confirmation', async () => {
    const { deviceApi } = await import('@/lib/api');
    const mockPush = jest.fn();
    
    jest.doMock('next/router', () => ({
      useRouter: () => ({
        push: mockPush,
        query: { id: '1' },
        pathname: '/devices/1',
        back: jest.fn(),
      }),
    }));

    deviceApi.deleteDevice.mockResolvedValue(true);

    renderWithProviders(<DeviceDetailsPage />);

    // Click delete button
    const deleteButton = screen.getByText('Delete Device');
    fireEvent.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deviceApi.deleteDevice).toHaveBeenCalledWith(1);
      expect(mockPush).toHaveBeenCalledWith('/devices');
    });
  });

  test('displays last seen timestamp', async () => {
    renderWithProviders(<DeviceDetailsPage />);

    await waitFor(() => {
      const lastSeenElement = screen.getByTestId('last-seen');
      expect(lastSeenElement).toBeInTheDocument();
      expect(lastSeenElement).toHaveTextContent('just now'); // or similar relative time
    });
  });

  test('shows device registration status', async () => {
    renderWithProviders(<DeviceDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Registered')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  test('handles unregistered device', async () => {
    const unregisteredDevice = {
      ...mockDevice,
      isRegistered: false,
      registrationStatus: 'pending',
    };

    const { deviceApi } = await import('@/lib/api');
    deviceApi.getDevice.mockResolvedValue(unregisteredDevice);

    renderWithProviders(<DeviceDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Not Registered')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Register Device')).toBeInTheDocument();
    });
  });

  test('shows real-time status updates', async () => {
    const mockSubscribe = jest.fn();
    jest.doMock('@/hooks/useWebSocket', () => ({
      useWebSocket: () => ({
        connectionStatus: 'open',
        subscribe: mockSubscribe,
        unsubscribe: jest.fn(),
      }),
    }));

    renderWithProviders(<DeviceDetailsPage />);

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith(`device:${mockDevice.id}`, expect.any(Function));
    });
  });

  test('displays device performance metrics', async () => {
    const deviceWithMetrics = {
      ...mockDevice,
      metrics: {
        cpuUsage: 45,
        memoryUsage: 60,
        temperature: 68,
        diskSpace: 85,
      },
    };

    const { deviceApi } = await import('@/lib/api');
    deviceApi.getDevice.mockResolvedValue(deviceWithMetrics);

    renderWithProviders(<DeviceDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('45%')).toBeInTheDocument(); // CPU Usage
      expect(screen.getByText('60%')).toBeInTheDocument(); // Memory Usage
      expect(screen.getByText('68°C')).toBeInTheDocument(); // Temperature
      expect(screen.getByText('85%')).toBeInTheDocument(); // Disk Space
    });
  });

  test('handles loading state', () => {
    const { deviceApi } = require('@/lib/api');
    deviceApi.getDevice.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<DeviceDetailsPage />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('handles device not found error', async () => {
    const { deviceApi } = await import('@/lib/api');
    deviceApi.getDevice.mockRejectedValue(new Error('Device not found'));

    renderWithProviders(<DeviceDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Device not found')).toBeInTheDocument();
      expect(screen.getByText('Go back to devices')).toBeInTheDocument();
    });
  });

  test('handles configuration reset', async () => {
    const { deviceApi } = await import('@/lib/api');
    deviceApi.updateDeviceConfiguration.mockResolvedValue({
      ...mockConfiguration,
      resolution: '1920x1080',
      volume: 50,
      brightness: 50,
    });

    renderWithProviders(<DeviceDetailsPage />);

    // Click reset configuration button
    const resetButton = screen.getByText('Reset to Default');
    fireEvent.click(resetButton);

    // Confirm reset
    const confirmButton = screen.getByText('Reset');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deviceApi.updateDeviceConfiguration).toHaveBeenCalledWith(1, expect.objectContaining({
        resolution: '1920x1080',
        volume: 50,
        brightness: 50,
      }));
    });
  });

  test('validates configuration input', async () => {
    renderWithProviders(<DeviceDetailsPage />);

    // Click configuration edit button
    const configEditButton = screen.getByText('Edit Configuration');
    fireEvent.click(configEditButton);

    // Enter invalid volume (> 100)
    const volumeInput = screen.getByLabelText('Volume');
    fireEvent.change(volumeInput, { target: { value: '150' } });

    // Try to save
    const saveConfigButton = screen.getByText('Save Configuration');
    fireEvent.click(saveConfigButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Volume must be between 0 and 100')).toBeInTheDocument();
    });
  });

  test('shows connection status indicator', async () => {
    renderWithProviders(<DeviceDetailsPage />);

    await waitFor(() => {
      const connectionIndicator = screen.getByTestId('connection-status');
      expect(connectionIndicator).toBeInTheDocument();
      expect(connectionIndicator).toHaveClass('connected');
    });
  });
});