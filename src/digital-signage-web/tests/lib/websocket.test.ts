import { websocketClient } from '@/lib/websocket'
import type { RealTimeEvent } from '@/lib/websocket'

const sampleEvent: RealTimeEvent = {
  type: 'device_status_changed',
  payload: {
    deviceId: 'device-123',
    status: 'online',
    lastSeen: new Date().toISOString(),
  },
  timestamp: new Date().toISOString(),
}

describe('websocketClient', () => {
  afterEach(() => {
    websocketClient.clearAllListeners()
  })

  it('notifies subscribers when an event is emitted', () => {
    const handler = jest.fn()
    const unsubscribe = websocketClient.subscribe('device_status_changed', handler)

    websocketClient.emit(sampleEvent)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(sampleEvent.payload, sampleEvent)

    unsubscribe()
  })

  it('does not notify handlers after unsubscribe', () => {
    const handler = jest.fn()
    const unsubscribe = websocketClient.subscribe('device_status_changed', handler)

    unsubscribe()
    websocketClient.emit(sampleEvent)

    expect(handler).not.toHaveBeenCalled()
  })

  it('allows subscribing to all events via wildcard channel', () => {
    const handler = jest.fn()
    websocketClient.subscribe('*', handler)

    websocketClient.emit(sampleEvent)

    expect(handler).toHaveBeenCalledWith(sampleEvent.payload, sampleEvent)
  })
})
