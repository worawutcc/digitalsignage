import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '@/store/rootReducer'

/**
 * Redux store configuration
 * Note: Redux Persist is temporarily disabled for build compatibility
 * To enable persistence, uncomment the persistence code below
 */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

// Dummy persistor for compatibility with PersistGate
export const persistor = {
  persist: () => {},
  purge: () => Promise.resolve(),
  flush: () => Promise.resolve(),
  pause: () => {},
  dispatch: () => {},
} as any

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks for use throughout the app
export { useSelector, useDispatch } from 'react-redux'