import { render, screen } from '@testing-library/react'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configureStore } from '@reduxjs/toolkit'

// Mock store for testing
const mockStore = configureStore({
  reducer: {
    auth: (state = { user: null, isAuthenticated: false }, action) => state,
    ui: (state = { sidebarCollapsed: false, theme: 'light' }, action) => state,
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={mockStore}>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </Provider>
)

describe('AdminLayout Component', () => {
  it('should render children content', () => {
    render(
      <TestWrapper>
        <AdminLayout>
          <div data-testid="test-content">Test Content</div>
        </AdminLayout>
      </TestWrapper>
    )

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('should display page title when provided', () => {
    render(
      <TestWrapper>
        <AdminLayout title="Device Management">
          <div>Content</div>
        </AdminLayout>
      </TestWrapper>
    )

    expect(screen.getByText('Device Management')).toBeInTheDocument()
  })

  it('should display page description when provided', () => {
    render(
      <TestWrapper>
        <AdminLayout 
          title="Device Management" 
          description="Manage and monitor all digital signage devices"
        >
          <div>Content</div>
        </AdminLayout>
      </TestWrapper>
    )

    expect(screen.getByText('Manage and monitor all digital signage devices')).toBeInTheDocument()
  })

  it('should render breadcrumbs when provided', () => {
    const breadcrumbs = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Devices', href: '/devices' },
    ]

    render(
      <TestWrapper>
        <AdminLayout breadcrumbs={breadcrumbs}>
          <div>Content</div>
        </AdminLayout>
      </TestWrapper>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Devices')).toBeInTheDocument()
  })

  it('should render header actions when provided', () => {
    const actions = [
      {
        label: 'Add Device',
        onClick: jest.fn(),
        variant: 'primary' as const,
      },
    ]

    render(
      <TestWrapper>
        <AdminLayout actions={actions}>
          <div>Content</div>
        </AdminLayout>
      </TestWrapper>
    )

    expect(screen.getByText('Add Device')).toBeInTheDocument()
  })

  it('should handle sidebar toggle functionality', () => {
    const mockToggle = jest.fn()
    
    render(
      <TestWrapper>
        <AdminLayout 
          sidebar={{ collapsed: false, onToggle: mockToggle }}
        >
          <div>Content</div>
        </AdminLayout>
      </TestWrapper>
    )

    // Test will verify the toggle button exists and can be clicked
    // This test should FAIL initially since AdminLayout doesn't exist yet
    const toggleButton = screen.queryByRole('button', { name: /toggle sidebar/i })
    expect(toggleButton).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <AdminLayout title="Test Page">
          <div>Content</div>
        </AdminLayout>
      </TestWrapper>
    )

    // Check for proper ARIA labels and roles
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('should render with collapsed sidebar when specified', () => {
    render(
      <TestWrapper>
        <AdminLayout sidebar={{ collapsed: true, onToggle: jest.fn() }}>
          <div>Content</div>
        </AdminLayout>
      </TestWrapper>
    )

    // This should fail initially - testing for collapsed sidebar styling
    const sidebar = screen.getByRole('navigation')
    expect(sidebar).toHaveClass('collapsed')
  })
})