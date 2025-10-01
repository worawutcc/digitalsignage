import '@testing-library/jest-dom'
import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { rootReducer } from '@/store/rootReducer'
import { devicesActions } from '@/store/slices/devicesSlice'
import { addNotification } from '@/store/slices/uiSlice'
import { websocketClient } from '@/lib/websocket'
import { RealTimeEventsClient } from '@/components/providers/RealTimeEventsClient'

const createTestStore = () => configureStore({
  reducer: rootReducer,
})

const renderWithProviders = (store: ReturnType<typeof createTestStore>) => {
  const queryClient = new QueryClient()

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RealTimeEventsClient />
      </QueryClientProvider>
    </Provider>
  )
}

describe('RealTimeEventsClient', () => {
  afterEach(() => {
    websocketClient.clearAllListeners()
  })

  it('dispatches device status updates when device events arrive', () => {
    const store = createTestStore()
    store.dispatch(
      devicesActions.fetchDevicesSuccess({
        devices: [
          {
            id: 'device-101',
            name: 'Lobby Display',
            deviceKey: 'device-key',
            status: 'offline',
            location: 'Lobby',
            lastSeen: '2025-01-01T00:00:00Z',
            currentScheduleId: null,
            deviceGroupId: 'group-1',
            resolution: '1920x1080',
            orientation: 'landscape',
            createdAt: '2024-12-01T00:00:00Z',
            updatedAt: '2024-12-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 1,
          totalPages: 1,
        },
      })
    )

    renderWithProviders(store)

    websocketClient.emit({
      type: 'device_status_changed',
      timestamp: new Date().toISOString(),
      payload: {
        deviceId: 'device-101',
        status: 'online',
        lastSeen: '2025-01-01T12:00:00Z',
      },
    })

    const device = store.getState().devices.devices.find(d => d.id === 'device-101')
    expect(device?.status).toBe('online')
    expect(device?.lastSeen).toBe('2025-01-01T12:00:00Z')
  })

  it('creates warning notifications when schedule conflicts are emitted', () => {
    const store = createTestStore()

    renderWithProviders(store)

    websocketClient.emit({
      type: 'schedule_conflict_detected',
      timestamp: new Date().toISOString(),
      payload: {
        conflictId: 'conflict-42',
        scheduleId: 'schedule-42',
        scheduleName: 'Morning Rotation',
        devices: ['device-101'],
        severity: 'warning',
        message: 'Schedule overlap detected on device Lobby Display',
      },
    })

    const notifications = store.getState().ui.notifications
    expect(notifications).toHaveLength(1)
    expect(notifications[0]).toBeDefined()
    expect(notifications[0]?.type).toBe('warning')
    expect(notifications[0]?.title).toMatch(/schedule conflict/i)
  })
})
