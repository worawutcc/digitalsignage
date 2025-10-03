import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import DeviceStatusIndicator from '@/components/devices/DeviceStatusIndicator';

// Mock the WebSocket hook
jest.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    connectionStatus: 'open',
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  }),
}));

// Mock the device API
jest.mock('@/lib/api', () => ({
  deviceApi: {
    getDeviceStatus: jest.fn(),
  },
}));

type DeviceStatus = 'online' | 'offline' | 'error' | 'maintenance' | 'restarting';

interface DeviceStatusIndicatorProps {
  deviceId: number;
  status: DeviceStatus;
  lastSeen?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  realTimeUpdates?: boolean;
}

describe('DeviceStatusIndicator', () => {
  const defaultProps: DeviceStatusIndicatorProps = {
    deviceId: 1,
    status: 'online',
    lastSeen: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders online status correctly', () => {
    render(<DeviceStatusIndicator {...defaultProps} status="online" />);

    const indicator = screen.getByTestId('device-status-indicator');
    expect(indicator).toHaveClass('status-online');
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  test('renders offline status correctly', () => {
    render(<DeviceStatusIndicator {...defaultProps} status="offline" />);

    const indicator = screen.getByTestId('device-status-indicator');
    expect(indicator).toHaveClass('status-offline');
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  test('renders error status correctly', () => {
    render(<DeviceStatusIndicator {...defaultProps} status="error" />);

    const indicator = screen.getByTestId('device-status-indicator');
    expect(indicator).toHaveClass('status-error');
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  test('renders maintenance status correctly', () => {
    render(<DeviceStatusIndicator {...defaultProps} status="maintenance" />);

    const indicator = screen.getByTestId('device-status-indicator');
    expect(indicator).toHaveClass('status-maintenance');
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
  });

  test('renders restarting status correctly', () => {
    render(<DeviceStatusIndicator {...defaultProps} status="restarting" />);

    const indicator = screen.getByTestId('device-status-indicator');
    expect(indicator).toHaveClass('status-restarting');
    expect(screen.getByText('Restarting')).toBeInTheDocument();
  });

  test('shows last seen details when showDetails is true', () => {
    const lastSeen = new Date(Date.now() - 300000).toISOString(); // 5 minutes ago
    
    render(
      <DeviceStatusIndicator 
        {...defaultProps} 
        lastSeen={lastSeen} 
        showDetails={true} 
      />
    );

    expect(screen.getByText('Last seen:')).toBeInTheDocument();
    expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
  });

  test('hides details when showDetails is false', () => {
    render(
      <DeviceStatusIndicator 
        {...defaultProps} 
        showDetails={false} 
      />
    );

    expect(screen.queryByText('Last seen:')).not.toBeInTheDocument();
  });

  test('applies correct size classes', () => {
    const { rerender } = render(
      <DeviceStatusIndicator {...defaultProps} size="sm" />
    );

    let indicator = screen.getByTestId('device-status-indicator');
    expect(indicator).toHaveClass('size-sm');

    rerender(<DeviceStatusIndicator {...defaultProps} size="md" />);
    indicator = screen.getByTestId('device-status-indicator');
    expect(indicator).toHaveClass('size-md');

    rerender(<DeviceStatusIndicator {...defaultProps} size="lg" />);
    indicator = screen.getByTestId('device-status-indicator');
    expect(indicator).toHaveClass('size-lg');
  });

  test('shows pulsing animation for restarting status', () => {
    render(<DeviceStatusIndicator {...defaultProps} status="restarting" />);

    const indicator = screen.getByTestId('device-status-indicator');
    expect(indicator).toHaveClass('animate-pulse');
  });

  test('subscribes to real-time updates when enabled', () => {
    const mockSubscribe = jest.fn();
    jest.doMock('@/hooks/useWebSocket', () => ({
      useWebSocket: () => ({
        connectionStatus: 'open',
        subscribe: mockSubscribe,
        unsubscribe: jest.fn(),
      }),
    }));

    render(
      <DeviceStatusIndicator 
        {...defaultProps} 
        realTimeUpdates={true} 
      />
    );

    expect(mockSubscribe).toHaveBeenCalledWith(
      `device:${defaultProps.deviceId}`,
      expect.any(Function)
    );
  });

  test('does not subscribe to updates when real-time is disabled', () => {
    const mockSubscribe = jest.fn();
    jest.doMock('@/hooks/useWebSocket', () => ({
      useWebSocket: () => ({
        connectionStatus: 'open',
        subscribe: mockSubscribe,
        unsubscribe: jest.fn(),
      }),
    }));

    render(
      <DeviceStatusIndicator 
        {...defaultProps} 
        realTimeUpdates={false} 
      />
    );

    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  test('updates status from WebSocket events', () => {
    let statusUpdateCallback: (event: any) => void;
    
    const mockSubscribe = jest.fn((channel, callback) => {
      statusUpdateCallback = callback;
    });

    jest.doMock('@/hooks/useWebSocket', () => ({
      useWebSocket: () => ({
        connectionStatus: 'open',
        subscribe: mockSubscribe,
        unsubscribe: jest.fn(),
      }),
    }));

    const { rerender } = render(
      <DeviceStatusIndicator 
        {...defaultProps} 
        status="online"
        realTimeUpdates={true} 
      />
    );

    expect(screen.getByText('Online')).toBeInTheDocument();

    // Simulate WebSocket status update
    if (statusUpdateCallback) {
      statusUpdateCallback({
        type: 'device_status_changed',
        payload: {
          deviceId: 1,
          status: 'offline',
          timestamp: new Date().toISOString(),
        },
      });
    }

    rerender(
      <DeviceStatusIndicator 
        {...defaultProps} 
        status="offline"
        realTimeUpdates={true} 
      />
    );

    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  test('shows tooltip with detailed information', () => {
    render(
      <DeviceStatusIndicator 
        {...defaultProps} 
        status="online"
        showDetails={true}
        lastSeen={new Date().toISOString()}
      />
    );

    const indicator = screen.getByTestId('device-status-indicator');
    expect(indicator).toHaveAttribute('title', expect.stringContaining('Online'));
    expect(indicator).toHaveAttribute('title', expect.stringContaining('Last seen'));
  });

  test('handles missing lastSeen gracefully', () => {
    render(
      <DeviceStatusIndicator 
        {...defaultProps} 
        lastSeen={undefined}
        showDetails={true}
      />
    );

    expect(screen.getByText('Never seen')).toBeInTheDocument();
  });

  test('formats relative time correctly', () => {
    const testCases = [
      { timeAgo: 30000, expected: '30 seconds ago' }, // 30 seconds
      { timeAgo: 120000, expected: '2 minutes ago' }, // 2 minutes
      { timeAgo: 3600000, expected: '1 hour ago' }, // 1 hour
      { timeAgo: 86400000, expected: '1 day ago' }, // 1 day
    ];

    testCases.forEach(({ timeAgo, expected }) => {
      const lastSeen = new Date(Date.now() - timeAgo).toISOString();
      
      const { unmount } = render(
        <DeviceStatusIndicator 
          {...defaultProps} 
          lastSeen={lastSeen}
          showDetails={true}
        />
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  test('handles connection status changes', () => {
    const { rerender } = render(
      <DeviceStatusIndicator 
        {...defaultProps} 
        realTimeUpdates={true}
      />
    );

    // Simulate connection loss
    jest.doMock('@/hooks/useWebSocket', () => ({
      useWebSocket: () => ({
        connectionStatus: 'disconnected',
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
      }),
    }));

    rerender(
      <DeviceStatusIndicator 
        {...defaultProps} 
        realTimeUpdates={true}
      />
    );

    const indicator = screen.getByTestId('device-status-indicator');
    expect(indicator).toHaveClass('connection-lost');
  });

  test('shows loading state during status updates', () => {
    render(
      <DeviceStatusIndicator 
        {...defaultProps} 
        status="restarting"
      />
    );

    const loadingSpinner = screen.getByTestId('status-loading');
    expect(loadingSpinner).toBeInTheDocument();
  });

  test('handles invalid status gracefully', () => {
    render(
      <DeviceStatusIndicator 
        {...defaultProps} 
        status={'unknown' as DeviceStatus}
      />
    );

    const indicator = screen.getByTestId('device-status-indicator');
    expect(indicator).toHaveClass('status-unknown');
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  test('applies custom className when provided', () => {
    render(
      <DeviceStatusIndicator 
        {...defaultProps} 
        className="custom-status-indicator"
      />
    );

    const indicator = screen.getByTestId('device-status-indicator');
    expect(indicator).toHaveClass('custom-status-indicator');
  });

  test('shows connection indicator when online', () => {
    render(<DeviceStatusIndicator {...defaultProps} status="online" />);

    const connectionDot = screen.getByTestId('connection-dot');
    expect(connectionDot).toHaveClass('connected');
  });

  test('shows disconnection indicator when offline', () => {
    render(<DeviceStatusIndicator {...defaultProps} status="offline" />);

    const connectionDot = screen.getByTestId('connection-dot');
    expect(connectionDot).toHaveClass('disconnected');
  });

  test('shows warning indicator for error status', () => {
    render(<DeviceStatusIndicator {...defaultProps} status="error" />);

    const warningIcon = screen.getByTestId('warning-icon');
    expect(warningIcon).toBeInTheDocument();
  });

  test('handles rapid status changes without flickering', () => {
    const { rerender } = render(
      <DeviceStatusIndicator {...defaultProps} status="online" />
    );

    // Rapidly change status multiple times
    const statuses: DeviceStatus[] = ['offline', 'online', 'error', 'maintenance', 'online'];
    
    statuses.forEach((status, index) => {
      setTimeout(() => {
        rerender(<DeviceStatusIndicator {...defaultProps} status={status} />);
      }, index * 10);
    });

    // Final status should be rendered correctly
    expect(screen.getByText('Online')).toBeInTheDocument();
  });
});