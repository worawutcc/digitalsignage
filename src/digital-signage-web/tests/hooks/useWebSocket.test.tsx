import { act, render, screen } from '@testing-library/react'
import React from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { websocketClient } from '@/lib/websocket'
import type { RealTimeEvent } from '@/lib/websocket'

const sampleEvent: RealTimeEvent = {
  type: 'device_status_changed',
  payload: {
    deviceId: 'device-999',
    status: 'offline',
    lastSeen: new Date().toISOString(),
  },
  timestamp: new Date().toISOString(),
}

const TestComponent: React.FC<{ onEvent: jest.Mock }> = ({ onEvent }) => {
  const { status } = useWebSocket({
    device_status_changed: onEvent,
  })

  return <span data-testid="connection-status">{status}</span>
}

describe('useWebSocket hook', () => {
  afterEach(() => {
    websocketClient.clearAllListeners()
  })

  it('invokes the handler when a subscribed event is emitted', () => {
    const handler = jest.fn()
    render(<TestComponent onEvent={handler} />)

    act(() => {
      websocketClient.emit(sampleEvent)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(sampleEvent.payload, sampleEvent)
  })

  it('updates connection status when client state changes', () => {
    const handler = jest.fn()
    render(<TestComponent onEvent={handler} />)

    act(() => {
      websocketClient.emitConnectionStatus('open')
    })

    expect(screen.getByTestId('connection-status').textContent).toBe('open')

    act(() => {
      websocketClient.emitConnectionStatus('error')
    })

    expect(screen.getByTestId('connection-status').textContent).toBe('error')
  })
})
