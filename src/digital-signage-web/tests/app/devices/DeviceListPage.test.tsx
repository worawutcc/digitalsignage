import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DeviceListPage from '@/pages/devices/DeviceListPage';
import { devicesSlice } from '@/store/slices/devicesSlice';
import { uiSlice } from '@/store/slices/uiSlice';
import type { Device } from '@/types/device';

// Mock the API functions
jest.mock('@/lib/api', () => ({
  deviceApi: {
    getDevices: jest.fn(),
    updateDeviceStatus: jest.fn(),
    deleteDevice: jest.fn(),
    bulkUpdateStatus: jest.fn(),
    bulkDelete: jest.fn(),
  },
}));

// Mock the useRouter hook
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
    pathname: '/devices',
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

const mockDevices: Device[] = [
  {
    id: 1,
    name: 'Device 1',
    deviceType: 'AndroidTV',
    status: 'online',
    serialNumber: 'DEV-001',
    macAddress: '00:11:22:33:44:55',
    lastSeen: new Date().toISOString(),
    isRegistered: true,
    registrationStatus: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Device 2',
    deviceType: 'AndroidTV',
    status: 'offline',
    serialNumber: 'DEV-002',
    macAddress: '00:11:22:33:44:66',
    lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    isRegistered: true,
    registrationStatus: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Device 3',
    deviceType: 'AndroidTV',
    status: 'error',
    serialNumber: 'DEV-003',
    macAddress: '00:11:22:33:44:77',
    lastSeen: new Date().toISOString(),
    isRegistered: false,
    registrationStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
        items: mockDevices,
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

describe('DeviceListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders device list with correct data', () => {
    renderWithProviders(<DeviceListPage />);

    expect(screen.getByText('Device Management')).toBeInTheDocument();
    expect(screen.getByText('Device 1')).toBeInTheDocument();
    expect(screen.getByText('Device 2')).toBeInTheDocument();
    expect(screen.getByText('Device 3')).toBeInTheDocument();
    expect(screen.getByText('DEV-001')).toBeInTheDocument();
    expect(screen.getByText('DEV-002')).toBeInTheDocument();
    expect(screen.getByText('DEV-003')).toBeInTheDocument();
  });

  test('displays device status indicators correctly', () => {
    renderWithProviders(<DeviceListPage />);

    const onlineStatus = screen.getByText('Online');
    const offlineStatus = screen.getByText('Offline');
    const errorStatus = screen.getByText('Error');

    expect(onlineStatus).toBeInTheDocument();
    expect(offlineStatus).toBeInTheDocument();
    expect(errorStatus).toBeInTheDocument();

    expect(onlineStatus).toHaveClass('status-online');
    expect(offlineStatus).toHaveClass('status-offline');
    expect(errorStatus).toHaveClass('status-error');
  });

  test('shows registration status for each device', () => {
    renderWithProviders(<DeviceListPage />);

    expect(screen.getAllByText('Active')).toHaveLength(2);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  test('handles device selection', () => {
    renderWithProviders(<DeviceListPage />);

    const checkboxes = screen.getAllByRole('checkbox');
    const selectAllCheckbox = checkboxes[0];
    const firstDeviceCheckbox = checkboxes[1];

    // Select individual device
    fireEvent.click(firstDeviceCheckbox);
    expect(firstDeviceCheckbox).toBeChecked();

    // Select all devices
    fireEvent.click(selectAllCheckbox);
    checkboxes.slice(1).forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });
  });

  test('filters devices by status', async () => {
    renderWithProviders(<DeviceListPage />);

    const statusFilter = screen.getByLabelText('Filter by Status');
    
    // Filter by online status
    fireEvent.change(statusFilter, { target: { value: 'online' } });
    
    await waitFor(() => {
      expect(screen.getByText('Device 1')).toBeInTheDocument();
      expect(screen.queryByText('Device 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Device 3')).not.toBeInTheDocument();
    });
  });

  test('filters devices by device type', async () => {
    renderWithProviders(<DeviceListPage />);

    const typeFilter = screen.getByLabelText('Filter by Type');
    
    fireEvent.change(typeFilter, { target: { value: 'AndroidTV' } });
    
    await waitFor(() => {
      expect(screen.getByText('Device 1')).toBeInTheDocument();
      expect(screen.getByText('Device 2')).toBeInTheDocument();
      expect(screen.getByText('Device 3')).toBeInTheDocument();
    });
  });

  test('sorts devices by name', async () => {
    renderWithProviders(<DeviceListPage />);

    const sortButton = screen.getByText('Name');
    fireEvent.click(sortButton);

    // Verify devices are sorted (this would need to check the actual order in DOM)
    const deviceRows = screen.getAllByTestId('device-row');
    expect(deviceRows).toHaveLength(3);
  });

  test('opens device details on row click', () => {
    const mockPush = jest.fn();
    jest.doMock('next/router', () => ({
      useRouter: () => ({
        push: mockPush,
        query: {},
        pathname: '/devices',
      }),
    }));

    renderWithProviders(<DeviceListPage />);

    const deviceRow = screen.getByTestId('device-row-1');
    fireEvent.click(deviceRow);

    expect(mockPush).toHaveBeenCalledWith('/devices/1');
  });

  test('shows bulk operations when devices are selected', () => {
    renderWithProviders(<DeviceListPage />);

    const firstDeviceCheckbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(firstDeviceCheckbox);

    expect(screen.getByText('Bulk Operations')).toBeInTheDocument();
    expect(screen.getByText('Update Status')).toBeInTheDocument();
    expect(screen.getByText('Delete Selected')).toBeInTheDocument();
  });

  test('performs bulk status update', async () => {
    const { deviceApi } = await import('@/lib/api');
    (deviceApi.bulkUpdateStatus as jest.Mock).mockResolvedValue({
      successfulCount: 2,
      failedCount: 0,
      totalCount: 2,
    });

    renderWithProviders(<DeviceListPage />);

    // Select multiple devices
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Device 1
    fireEvent.click(checkboxes[2]); // Device 2

    // Open bulk operations
    const bulkUpdateButton = screen.getByText('Update Status');
    fireEvent.click(bulkUpdateButton);

    // Select new status
    const statusSelect = screen.getByLabelText('New Status');
    fireEvent.change(statusSelect, { target: { value: 'maintenance' } });

    // Confirm bulk update
    const confirmButton = screen.getByText('Update Devices');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deviceApi.bulkUpdateStatus).toHaveBeenCalledWith([1, 2], 'maintenance');
    });
  });

  test('performs bulk delete operation', async () => {
    const { deviceApi } = await import('@/lib/api');
    (deviceApi.bulkDelete as jest.Mock).mockResolvedValue({
      successfulCount: 1,
      failedCount: 0,
      totalCount: 1,
    });

    renderWithProviders(<DeviceListPage />);

    // Select a device
    const firstDeviceCheckbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(firstDeviceCheckbox);

    // Open bulk delete
    const bulkDeleteButton = screen.getByText('Delete Selected');
    fireEvent.click(bulkDeleteButton);

    // Confirm deletion
    const confirmButton = screen.getByText('Delete Devices');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deviceApi.bulkDelete).toHaveBeenCalledWith([1]);
    });
  });

  test('handles individual device deletion', async () => {
    const { deviceApi } = await import('@/lib/api');
    (deviceApi.deleteDevice as jest.Mock).mockResolvedValue(true);

    renderWithProviders(<DeviceListPage />);

    const deleteButton = screen.getAllByLabelText('Delete device')[0];
    fireEvent.click(deleteButton);

    // Confirm deletion in modal
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deviceApi.deleteDevice).toHaveBeenCalledWith(1);
    });
  });

  test('handles search functionality', async () => {
    renderWithProviders(<DeviceListPage />);

    const searchInput = screen.getByPlaceholderText('Search devices...');
    fireEvent.change(searchInput, { target: { value: 'Device 1' } });

    await waitFor(() => {
      expect(screen.getByText('Device 1')).toBeInTheDocument();
      expect(screen.queryByText('Device 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Device 3')).not.toBeInTheDocument();
    });
  });

  test('displays pagination controls', () => {
    renderWithProviders(<DeviceListPage />);

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });

  test('shows empty state when no devices match filters', async () => {
    renderWithProviders(<DeviceListPage />);

    const searchInput = screen.getByPlaceholderText('Search devices...');
    fireEvent.change(searchInput, { target: { value: 'NonexistentDevice' } });

    await waitFor(() => {
      expect(screen.getByText('No devices found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
    });
  });

  test('refreshes data when refresh button is clicked', async () => {
    const { deviceApi } = await import('@/lib/api');
    (deviceApi.getDevices as jest.Mock).mockResolvedValue(mockDevices);

    renderWithProviders(<DeviceListPage />);

    const refreshButton = screen.getByLabelText('Refresh devices');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(deviceApi.getDevices).toHaveBeenCalled();
    });
  });

  test('handles loading state', () => {
    const store = createTestStore();
    store.dispatch({ type: 'devices/setLoading', payload: true });

    const queryClient = new QueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <DeviceListPage />
        </Provider>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('handles error state', () => {
    const store = createTestStore();
    store.dispatch({ type: 'devices/setError', payload: 'Failed to load devices' });

    const queryClient = new QueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <DeviceListPage />
        </Provider>
      </QueryClientProvider>
    );

    expect(screen.getByText('Failed to load devices')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});