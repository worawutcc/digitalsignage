'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'

interface ReduxProviderProps {
  children: React.ReactNode
}

/**
 * Redux provider wrapper component
 */
export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>
}