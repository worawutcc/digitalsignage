import '@testing-library/jest-dom'
import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import { uiSlice, removeNotification } from '@/store/slices/uiSlice'
import type { UIState } from '@/store/slices/uiSlice'

const createStoreWithNotifications = (notifications: UIState['notifications']) => {
  const preloadedState: { ui: UIState } = {
    ui: {
      ...uiSlice.getInitialState(),
      notifications,
    },
  }

  return configureStore({
    reducer: {
      ui: uiSlice.reducer,
    },
    preloadedState,
  })
}

describe('NotificationCenter', () => {
  let root: HTMLDivElement

  beforeEach(() => {
    root = document.createElement('div')
    root.setAttribute('id', 'notification-root')
    document.body.appendChild(root)
    jest.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.clearAllTimers()
    jest.useRealTimers()
    document.body.removeChild(root)
  })

  it('renders active notifications in the portal', () => {
    const notifications: UIState['notifications'] = [
      {
        id: 'notif-1',
        type: 'success',
        title: 'Device online',
        message: 'Lobby screen reconnected',
        timestamp: Date.now(),
      },
      {
        id: 'notif-2',
        type: 'warning',
        title: 'Schedule conflict',
        message: 'Morning playlist overlaps with Lunch specials',
        timestamp: Date.now(),
        duration: 10000,
      },
    ]

    const store = createStoreWithNotifications(notifications)

    render(
      <Provider store={store}>
        <NotificationCenter />
      </Provider>
    )

    expect(screen.getByText('Device online')).toBeInTheDocument()
    expect(screen.getByText('Schedule conflict')).toBeInTheDocument()
  })

  it('auto dismisses notifications after their duration', () => {
    const notifications: UIState['notifications'] = [
      {
        id: 'notif-auto',
        type: 'info',
        title: 'Heartbeat',
        message: 'Device heartbeat received',
        timestamp: Date.now(),
        duration: 3000,
      },
    ]

    const store = createStoreWithNotifications(notifications)

    render(
      <Provider store={store}>
        <NotificationCenter />
      </Provider>
    )

    expect(screen.getByText('Heartbeat')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(3500)
    })

    expect(store.getState().ui.notifications).toHaveLength(0)
  })

  it('allows manual dismissal via close button', () => {
    const notifications: UIState['notifications'] = [
      {
        id: 'notif-close',
        type: 'error',
        title: 'Device offline',
        message: 'Entrance display lost connection',
        timestamp: Date.now(),
      },
    ]

    const store = createStoreWithNotifications(notifications)

    render(
      <Provider store={store}>
        <NotificationCenter />
      </Provider>
    )

    fireEvent.click(screen.getByLabelText('Dismiss notification'))

    expect(store.getState().ui.notifications).toHaveLength(0)
  })
})
