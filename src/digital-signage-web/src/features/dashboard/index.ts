// Hooks
export { useDashboard } from './hooks/useDashboard'

// Types
export type {
  RecentItem,
  RecentItemsProps,
  DashboardStats,
  SystemHealth,
  QuickAction
} from './types'

// Components - import dynamically to avoid JSX issues
export const DashboardComponents = {
  RecentItems: () => import('./components/RecentItems').then(m => ({ default: m.RecentItems }))
}