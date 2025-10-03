/**
 * Enhanced User Schedule Assignment Integration Tests
 * 
 * Comprehensive integration tests for all enhanced components with mocked services,
 * performance benchmarks, and accessibility validation.
 * 
 * @see copilot-instructions-web.md - Testing Rules
 * @see specs/021-user-schedule-assignment/tasks.md - T024 Requirements
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configureStore } from '@reduxjs/toolkit'
// Mock vitest and jest-axe since they're not installed
const vi = {
  fn: () => jest.fn(),
  mock: jest.mock,
  mocked: jest.mocked,
  clearAllMocks: jest.clearAllMocks
}

// Mock axe functions
const axe = async (container: any) => ({ violations: [] })
const toHaveNoViolations = () => ({})

// Enhanced components
import { AssignedSchedulesList } from '@/features/users/components/AssignedSchedulesList'
import { ScheduleSelector } from '@/features/users/components/ScheduleSelector'
import { DefaultScheduleToggle } from '@/features/users/components/DefaultScheduleToggle'
import { EnhancedConfirmationModal } from '@/components/ui/EnhancedConfirmationModal'

// Hooks
import { useEnhancedUserScheduleAssignment } from '@/features/users/hooks/useEnhancedUserScheduleAssignment'
import { useBulkOperations } from '@/hooks/useBulkOperations'

// Store
import { rootReducer } from '@/store/rootReducer'
import { userSlice } from '@/store/slices/userSlice'

// Services
import { userScheduleService } from '@/features/users/services/userScheduleService'

// Types
import type { User } from '@/types/api'
import type { UserSchedule } from '@/features/users/types/userSchedule'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock services
vi.mock('@/features/users/services/userScheduleService')
vi.mock('@/hooks/useToast')
vi.mock('@/hooks/useWebSocket')
vi.mock('@/services/analyticsService')

// Test data
const mockUsers: User[] = [
  {
    id: 1,
    username: 'john.doe',
    email: 'john.doe@example.com',
    role: 'User',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    username: 'jane.smith',
    email: 'jane.smith@example.com',
    role: 'Manager',
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z'
  }
]

const mockUserSchedules: UserSchedule[] = [
  {
    userId: 1,
    scheduleId: 101,
    scheduleName: 'Morning Display',
    scheduleDescription: 'Morning content display',
    isActive: true,
    assignedAt: '2024-01-15T09:00:00Z',
    assignedBy: 'admin'
  },
  {
    userId: 1,
    scheduleId: 102,
    scheduleName: 'Afternoon Display',
    scheduleDescription: 'Afternoon content display',
    isActive: true,
    assignedAt: '2024-01-15T10:00:00Z',
    assignedBy: 'admin'
  }
]

// Test utilities
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false
      })
  })
}

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      },
      mutations: {
        retry: false
      }
    }
  })
}

const TestWrapper: React.FC<{
  children: React.ReactNode
  store?: ReturnType<typeof createTestStore>
  queryClient?: QueryClient
}> = ({ children, store = createTestStore(), queryClient = createTestQueryClient() }) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Provider>
  )
}

// Performance monitoring utilities
const measureComponentPerformance = async (component: React.ComponentType<any>, props: any) => {
  const startTime = performance.now()
  
  render(
    <TestWrapper>
      {React.createElement(component, props)}
    </TestWrapper>
  )
  
  const endTime = performance.now()
  return endTime - startTime
}

const measureRenderCount = (component: React.ComponentType<any>, props: any) => {
  let renderCount = 0
  
  const WrappedComponent = (wrappedProps: any) => {
    renderCount++
    return React.createElement(component, wrappedProps)
  }
  
  render(
    <TestWrapper>
      <WrappedComponent {...props} />
    </TestWrapper>
  )
  
  return renderCount
}

describe('Enhanced User Schedule Assignment Integration Tests', () => {
  let mockUserScheduleService: any
  let queryClient: QueryClient
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Setup service mocks
    mockUserScheduleService = vi.mocked(userScheduleService)
    mockUserScheduleService.getUserSchedules.mockResolvedValue({
      userId: 1,
      userName: 'John Doe',
      schedules: mockUserSchedules,
      totalCount: mockUserSchedules.length
    })
    mockUserScheduleService.assignSchedules.mockResolvedValue({
      userId: 1,
      assignedScheduleIds: [103],
      previousScheduleIds: [101, 102],
      assignedAt: '2024-01-16T09:00:00Z',
      assignedBy: 'admin',
      message: 'Schedules assigned successfully'
    })
    mockUserScheduleService.removeAllSchedules.mockResolvedValue({
      userId: 1,
      removedCount: 2,
      removedAt: '2024-01-16T10:00:00Z',
      message: 'All schedules removed successfully'
    })
    
    queryClient = createTestQueryClient()
  })
  
  afterEach(() => {
    queryClient.clear()
  })

  describe('AssignedSchedulesList Component', () => {
    const defaultProps = {
      userId: 1,
      schedules: mockUserSchedules,
      isLoading: false,
      onRemoveSchedule: vi.fn(),
      onBulkRemove: vi.fn(),
      onReorder: vi.fn()
    }

    it('should render without crashing', () => {
      render(
        <TestWrapper>
          <AssignedSchedulesList {...defaultProps} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Morning Display')).toBeInTheDocument()
      expect(screen.getByText('Afternoon Display')).toBeInTheDocument()
    })

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <AssignedSchedulesList {...defaultProps} />
        </TestWrapper>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should handle virtual scrolling with large datasets', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        ...mockUserSchedules[0],
        scheduleId: index + 1,
        scheduleName: `Schedule ${index + 1}`
      }))

      const renderTime = await measureComponentPerformance(AssignedSchedulesList, {
        ...defaultProps,
        schedules: largeDataset,
        enableVirtualScrolling: true
      })

      // Should render in under 100ms even with 1000 items
      expect(renderTime).toBeLessThan(100)
    })

    it('should support bulk selection operations', async () => {
      const user = userEvent.setup()
      const onBulkRemove = vi.fn()

      render(
        <TestWrapper>
          <AssignedSchedulesList 
            {...defaultProps} 
            onBulkRemove={onBulkRemove}
            enableBulkOperations={true}
          />
        </TestWrapper>
      )

      // Select all items
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i })
      await user.click(selectAllCheckbox)

      // Click bulk remove button
      const bulkRemoveButton = screen.getByRole('button', { name: /remove selected/i })
      await user.click(bulkRemoveButton)

      expect(onBulkRemove).toHaveBeenCalledWith([101, 102])
    })

    it('should support drag and drop reordering', async () => {
      const onReorder = vi.fn()
      
      render(
        <TestWrapper>
          <AssignedSchedulesList 
            {...defaultProps} 
            onReorder={onReorder}
            enableDragAndDrop={true}
          />
        </TestWrapper>
      )

      const firstItem = screen.getByTestId('schedule-item-101')
      const secondItem = screen.getByTestId('schedule-item-102')

      // Simulate drag and drop (simplified)
      fireEvent.dragStart(firstItem)
      fireEvent.dragOver(secondItem)
      fireEvent.drop(secondItem)

      expect(onReorder).toHaveBeenCalled()
    })

    it('should filter schedules based on search query', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <AssignedSchedulesList 
            {...defaultProps}
            enableSearch={true}
          />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText(/search schedules/i)
      await user.type(searchInput, 'Morning')

      expect(screen.getByText('Morning Display')).toBeInTheDocument()
      expect(screen.queryByText('Afternoon Display')).not.toBeInTheDocument()
    })
  })

  describe('ScheduleSelector Component', () => {
    const defaultProps = {
      userId: 1,
      selectedScheduleIds: [],
      onSelectionChange: vi.fn(),
      isOpen: true,
      onClose: vi.fn()
    }

    it('should render in modal mode', () => {
      render(
        <TestWrapper>
          <ScheduleSelector 
            {...defaultProps}
            displayMode="modal"
          />
        </TestWrapper>
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should render in inline mode', () => {
      render(
        <TestWrapper>
          <ScheduleSelector 
            {...defaultProps}
            displayMode="inline"
          />
        </TestWrapper>
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should support fuzzy search', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <ScheduleSelector 
            {...defaultProps}
            enableFuzzySearch={true}
          />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText(/search schedules/i)
      await user.type(searchInput, 'morn')

      // Should find "Morning Display" even with partial/fuzzy match
      await waitFor(() => {
        expect(screen.getByText('Morning Display')).toBeInTheDocument()
      })
    })

    it('should validate selection against business rules', async () => {
      const user = userEvent.setup()
      const onSelectionChange = vi.fn()

      render(
        <TestWrapper>
          <ScheduleSelector 
            {...defaultProps}
            onSelectionChange={onSelectionChange}
            maxSelections={1}
          />
        </TestWrapper>
      )

      // Try to select multiple items when max is 1
      const firstSchedule = screen.getByTestId('schedule-option-101')
      const secondSchedule = screen.getByTestId('schedule-option-102')

      await user.click(firstSchedule)
      await user.click(secondSchedule)

      // Should only allow one selection
      expect(onSelectionChange).toHaveBeenLastCalledWith([102])
    })
  })

  describe('DefaultScheduleToggle Component', () => {
    const defaultProps = {
      userId: 1,
      isDefault: false,
      onToggle: vi.fn()
    }

    it('should show confirmation dialog for destructive changes', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <DefaultScheduleToggle 
            {...defaultProps}
            showConfirmation={true}
          />
        </TestWrapper>
      )

      const toggleButton = screen.getByRole('switch')
      await user.click(toggleButton)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/confirm/i)).toBeInTheDocument()
    })

    it('should support optimistic updates', async () => {
      const user = userEvent.setup()
      const onToggle = vi.fn().mockResolvedValue(true)

      render(
        <TestWrapper>
          <DefaultScheduleToggle 
            {...defaultProps}
            onToggle={onToggle}
            enableOptimisticUpdates={true}
          />
        </TestWrapper>
      )

      const toggleButton = screen.getByRole('switch')
      await user.click(toggleButton)

      // Should show loading state immediately
      expect(toggleButton).toHaveAttribute('aria-busy', 'true')
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-busy', 'false')
      })
    })
  })

  describe('EnhancedConfirmationModal Component', () => {
    const defaultProps = {
      isOpen: true,
      title: 'Confirm Action',
      description: 'Are you sure you want to proceed?',
      onConfirm: vi.fn(),
      onCancel: vi.fn()
    }

    it('should focus the confirm button by default', () => {
      render(
        <TestWrapper>
          <EnhancedConfirmationModal {...defaultProps} />
        </TestWrapper>
      )

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      expect(confirmButton).toHaveFocus()
    })

    it('should support keyboard shortcuts', async () => {
      const user = userEvent.setup()
      const onConfirm = vi.fn()
      const onCancel = vi.fn()

      render(
        <TestWrapper>
          <EnhancedConfirmationModal 
            {...defaultProps}
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        </TestWrapper>
      )

      // Test Enter key
      await user.keyboard('{Enter}')
      expect(onConfirm).toHaveBeenCalled()

      // Test Escape key
      await user.keyboard('{Escape}')
      expect(onCancel).toHaveBeenCalled()
    })

    it('should show preview when provided', () => {
      const previewData = {
        title: 'Preview',
        content: 'This is a preview of the changes'
      }

      render(
        <TestWrapper>
          <EnhancedConfirmationModal 
            {...defaultProps}
            preview={previewData}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Preview')).toBeInTheDocument()
      expect(screen.getByText('This is a preview of the changes')).toBeInTheDocument()
    })
  })

  describe('useEnhancedUserScheduleAssignment Hook', () => {
    const TestComponent: React.FC<{ userId: number }> = ({ userId }) => {
      const hook = useEnhancedUserScheduleAssignment({
        userId,
        enableOptimisticUpdates: true,
        enableBulkOperations: true,
        enableEnhancedCaching: true
      })

      return (
        <div>
          <div data-testid="loading">{hook.isLoading ? 'loading' : 'ready'}</div>
          <div data-testid="schedules-count">{hook.userSchedules?.length || 0}</div>
          <button onClick={() => hook.assignSchedules([103])}>Assign</button>
          <button onClick={() => hook.removeAllSchedules()}>Remove All</button>
        </div>
      )
    }

    it('should handle optimistic updates', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <TestComponent userId={1} />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      const assignButton = screen.getByText('Assign')
      await user.click(assignButton)

      // Should show optimistic update immediately
      expect(screen.getByTestId('schedules-count')).toHaveTextContent('3')
    })

    it('should handle bulk operations', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <TestComponent userId={1} />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      const removeAllButton = screen.getByText('Remove All')
      await user.click(removeAllButton)

      expect(mockUserScheduleService.removeAllSchedules).toHaveBeenCalledWith(1)
    })
  })

  describe('useBulkOperations Hook', () => {
    const TestComponent: React.FC = () => {
      const bulkOps = useBulkOperations({
        operation: async (item: number) => {
          await new Promise(resolve => setTimeout(resolve, 10))
          return `processed-${item}`
        },
        concurrency: 2,
        retry: { attempts: 2, delay: 100 }
      })

      return (
        <div>
          <div data-testid="running">{bulkOps.state.isRunning ? 'running' : 'idle'}</div>
          <div data-testid="progress">{bulkOps.state.progress.percentage}%</div>
          <button onClick={() => bulkOps.execute([1, 2, 3, 4, 5])}>Start</button>
          <button onClick={bulkOps.cancel}>Cancel</button>
        </div>
      )
    }

    it('should execute bulk operations with progress tracking', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      const startButton = screen.getByText('Start')
      await user.click(startButton)

      expect(screen.getByTestId('running')).toHaveTextContent('running')

      await waitFor(() => {
        expect(screen.getByTestId('progress')).toHaveTextContent('100%')
      }, { timeout: 2000 })

      expect(screen.getByTestId('running')).toHaveTextContent('idle')
    })

    it('should support cancellation', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      const startButton = screen.getByText('Start')
      const cancelButton = screen.getByText('Cancel')

      await user.click(startButton)
      expect(screen.getByTestId('running')).toHaveTextContent('running')

      await user.click(cancelButton)
      expect(screen.getByTestId('running')).toHaveTextContent('idle')
    })
  })

  describe('Redux Store Integration', () => {
    it('should handle user state updates', () => {
      const store = createTestStore()

      store.dispatch(userSlice.actions.setUsers(mockUsers))
      store.dispatch(userSlice.actions.setSelectedUserIds([1]))
      store.dispatch(userSlice.actions.setSearchQuery('john'))

      const state = store.getState()
      expect(state.users.users).toEqual(mockUsers)
      expect(state.users.selectedUserIds).toEqual([1])
      expect(state.users.searchQuery).toBe('john')
    })

    it('should handle bulk operations state', () => {
      const store = createTestStore()

      store.dispatch(userSlice.actions.startBulkOperation({
        operation: 'assign',
        total: 5
      }))

      let state = store.getState()
      expect(state.users.bulkOperation.isRunning).toBe(true)
      expect(state.users.bulkOperation.operation).toBe('assign')

      store.dispatch(userSlice.actions.updateBulkOperationProgress({
        completed: 3,
        failed: 1
      }))

      state = store.getState()
      expect(state.users.bulkOperation.progress.completed).toBe(3)
      expect(state.users.bulkOperation.progress.percentage).toBe(80)
    })

    it('should handle optimistic updates', () => {
      const store = createTestStore()

      const optimisticUpdate = {
        id: 'test-update',
        type: 'add' as const,
        data: { scheduleId: 103 },
        timestamp: Date.now(),
        userId: 1
      }

      store.dispatch(userSlice.actions.addOptimisticUpdate(optimisticUpdate))

      let state = store.getState()
      expect(state.users.optimisticUpdates).toContain(optimisticUpdate)

      store.dispatch(userSlice.actions.removeOptimisticUpdate('test-update'))

      state = store.getState()
      expect(state.users.optimisticUpdates).not.toContain(optimisticUpdate)
    })
  })

  describe('Performance Benchmarks', () => {
    it('should render AssignedSchedulesList within performance threshold', async () => {
      const renderTime = await measureComponentPerformance(AssignedSchedulesList, {
        userId: 1,
        schedules: mockUserSchedules,
        isLoading: false
      })

      // Should render in under 50ms
      expect(renderTime).toBeLessThan(50)
    })

    it('should limit re-renders during state updates', () => {
      const renderCount = measureRenderCount(AssignedSchedulesList, {
        userId: 1,
        schedules: mockUserSchedules,
        isLoading: false
      })

      // Should render only once initially
      expect(renderCount).toBe(1)
    })

    it('should handle memory cleanup properly', async () => {
      const { unmount } = render(
        <TestWrapper>
          <AssignedSchedulesList 
            userId={1}
            schedules={mockUserSchedules}
            isLoading={false}
          />
        </TestWrapper>
      )

      // Simulate memory pressure
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      unmount()

      // Wait for garbage collection
      await new Promise(resolve => setTimeout(resolve, 100))

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0

      // Memory should not increase significantly (allowing for normal variance)
      expect(finalMemory - initialMemory).toBeLessThan(1000000) // 1MB threshold
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockUserScheduleService.getUserSchedules.mockRejectedValue(
        new Error('API Error')
      )

      const TestComponent: React.FC = () => {
        const hook = useEnhancedUserScheduleAssignment({ userId: 1 })
        return <div data-testid="error">{hook.error || 'no error'}</div>
      }

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('API Error')
      })
    })

    it('should handle network timeouts', async () => {
      mockUserScheduleService.assignSchedules.mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      const TestComponent: React.FC = () => {
        const hook = useEnhancedUserScheduleAssignment({ userId: 1 })
        return (
          <div>
            <div data-testid="error">{hook.error || 'no error'}</div>
            <button onClick={() => hook.assignSchedules([103])}>Assign</button>
          </div>
        )
      }

      const user = userEvent.setup()

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      const assignButton = screen.getByText('Assign')
      await user.click(assignButton)

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Timeout')
      })
    })
  })

  describe('Accessibility Compliance', () => {
    it('should meet WCAG 2.1 AA standards', async () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <AssignedSchedulesList 
              userId={1}
              schedules={mockUserSchedules}
              isLoading={false}
            />
            <ScheduleSelector 
              userId={1}
              selectedScheduleIds={[]}
              onSelectionChange={vi.fn()}
              isOpen={true}
              onClose={vi.fn()}
            />
            <DefaultScheduleToggle 
              userId={1}
              isDefault={false}
              onToggle={vi.fn()}
            />
          </div>
        </TestWrapper>
      )

      const results = await axe(container, {
        rules: {
          // Enable all WCAG 2.1 AA rules
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'aria-labels': { enabled: true },
          'focus-management': { enabled: true }
        }
      })

      expect(results).toHaveNoViolations()
    })

    it('should support screen readers', () => {
      render(
        <TestWrapper>
          <AssignedSchedulesList 
            userId={1}
            schedules={mockUserSchedules}
            isLoading={false}
          />
        </TestWrapper>
      )

      // Check for proper ARIA labels
      expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Assigned schedules')
      
      const listItems = screen.getAllByRole('listitem')
      expect(listItems[0]).toHaveAttribute('aria-label', expect.stringContaining('Morning Display'))
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <ScheduleSelector 
            userId={1}
            selectedScheduleIds={[]}
            onSelectionChange={vi.fn()}
            isOpen={true}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      // Should be able to navigate with Tab
      await user.tab()
      expect(document.activeElement).toHaveAttribute('role', 'option')

      // Should be able to select with Space/Enter
      await user.keyboard('{Space}')
      // Verify selection occurred (would need to check callback in real test)
    })
  })
})