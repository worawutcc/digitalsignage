import { render, screen, waitFor } from '@testing-library/react'
import { DashboardStats } from '@/components/dashboard/DashboardStats'

// Mock data for testing
const mockStats = [
  {
    id: 'total-devices',
    title: 'Total Devices',
    value: 156,
    change: '+12%',
    changeType: 'positive' as const,
    icon: 'Monitor',
    description: 'Total registered devices',
  },
  {
    id: 'active-devices',
    title: 'Active Devices',
    value: 142,
    change: '+8%',
    changeType: 'positive' as const,
    icon: 'Activity',
    description: 'Currently online devices',
  },
  {
    id: 'media-files',
    title: 'Media Files',
    value: 89,
    change: '-3%',
    changeType: 'negative' as const,
    icon: 'FileVideo',
    description: 'Total media files stored',
  },
  {
    id: 'storage-used',
    title: 'Storage Used',
    value: '2.4 GB',
    change: '+15%',
    changeType: 'positive' as const,
    icon: 'HardDrive',
    description: 'Total storage consumed',
  },
]

const mockErrorStats = [
  {
    id: 'error-stat',
    title: 'Error Stat',
    value: null,
    change: null,
    changeType: 'neutral' as const,
    icon: 'AlertTriangle',
    description: 'Failed to load',
    error: 'Failed to fetch data',
  },
]

describe('DashboardStats Component', () => {
  it('should render all stats cards', () => {
    render(<DashboardStats stats={mockStats} />)
    
    // Check that all stat titles are rendered
    expect(screen.getByText('Total Devices')).toBeInTheDocument()
    expect(screen.getByText('Active Devices')).toBeInTheDocument()
    expect(screen.getByText('Media Files')).toBeInTheDocument()
    expect(screen.getByText('Storage Used')).toBeInTheDocument()
  })

  it('should display stat values correctly', () => {
    render(<DashboardStats stats={mockStats} />)
    
    // Check numeric values
    expect(screen.getByText('156')).toBeInTheDocument()
    expect(screen.getByText('142')).toBeInTheDocument()
    expect(screen.getByText('89')).toBeInTheDocument()
    
    // Check string value
    expect(screen.getByText('2.4 GB')).toBeInTheDocument()
  })

  it('should display change percentages with correct styling', () => {
    render(<DashboardStats stats={mockStats} />)
    
    // Check positive changes
    const positiveChanges = screen.getAllByText('+12%')
    expect(positiveChanges[0]).toBeInTheDocument()
    expect(positiveChanges[0]).toHaveClass('text-green-600') // Or whatever your positive change class is
    
    // Check negative change
    const negativeChange = screen.getByText('-3%')
    expect(negativeChange).toBeInTheDocument()
    expect(negativeChange).toHaveClass('text-red-600') // Or whatever your negative change class is
  })

  it('should render stat descriptions', () => {
    render(<DashboardStats stats={mockStats} />)
    
    expect(screen.getByText('Total registered devices')).toBeInTheDocument()
    expect(screen.getByText('Currently online devices')).toBeInTheDocument()
    expect(screen.getByText('Total media files stored')).toBeInTheDocument()
    expect(screen.getByText('Total storage consumed')).toBeInTheDocument()
  })

  it('should show loading state for individual stats', () => {
    const loadingStats = [
      {
        id: 'loading-stat',
        title: 'Loading Stat',
        value: null,
        change: null,
        changeType: 'neutral' as const,
        icon: 'Loader',
        description: 'Loading...',
        loading: true,
      },
    ]

    render(<DashboardStats stats={loadingStats} />)
    
    expect(screen.getByText('Loading Stat')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Should show loading spinner or skeleton
    expect(screen.getByTestId('stat-loading-spinner')).toBeInTheDocument()
  })

  it('should show overall loading state', () => {
    render(<DashboardStats stats={[]} loading />)
    
    // Should show loading skeleton for all stats
    expect(screen.getByTestId('dashboard-stats-loading')).toBeInTheDocument()
  })

  it('should handle error states for individual stats', () => {
    render(<DashboardStats stats={mockErrorStats} />)
    
    expect(screen.getByText('Error Stat')).toBeInTheDocument()
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
    
    // Should show error indicator
    expect(screen.getByTestId('stat-error-indicator')).toBeInTheDocument()
  })

  it('should display proper icons for each stat', () => {
    render(<DashboardStats stats={mockStats} />)
    
    // Check that icons are rendered (this depends on your icon implementation)
    expect(screen.getByTestId('stat-icon-Monitor')).toBeInTheDocument()
    expect(screen.getByTestId('stat-icon-Activity')).toBeInTheDocument()
    expect(screen.getByTestId('stat-icon-FileVideo')).toBeInTheDocument()
    expect(screen.getByTestId('stat-icon-HardDrive')).toBeInTheDocument()
  })

  it('should be responsive and render in grid layout', () => {
    render(<DashboardStats stats={mockStats} />)
    
    const container = screen.getByTestId('dashboard-stats-container')
    expect(container).toBeInTheDocument()
    
    // Should have grid classes for responsive layout
    expect(container).toHaveClass('grid') // Or your grid implementation
  })

  it('should handle empty stats array', () => {
    render(<DashboardStats stats={[]} />)
    
    // Should show empty state or no stats message
    expect(screen.getByText(/no statistics available/i)).toBeInTheDocument()
  })

  it('should animate value changes', async () => {
    const { rerender } = render(<DashboardStats stats={mockStats} />)
    
    // Initial render
    expect(screen.getByText('156')).toBeInTheDocument()
    
    // Update with new value
    const updatedStats = [
      {
        ...mockStats[0],
        value: 160,
        change: '+15%',
      },
      ...mockStats.slice(1),
    ]
    
    rerender(<DashboardStats stats={updatedStats} />)
    
    // Should animate to new value
    await waitFor(() => {
      expect(screen.getByText('160')).toBeInTheDocument()
    })
  })

  it('should handle click events on stat cards', () => {
    const onStatClick = jest.fn()
    render(<DashboardStats stats={mockStats} onStatClick={onStatClick} />)
    
    const firstStatCard = screen.getByTestId('stat-card-total-devices')
    firstStatCard.click()
    
    expect(onStatClick).toHaveBeenCalledWith(mockStats[0])
  })

  it('should support different size variants', () => {
    render(<DashboardStats stats={mockStats} size="compact" />)
    
    const container = screen.getByTestId('dashboard-stats-container')
    expect(container).toHaveClass('compact') // Or your compact size class
  })

  it('should have proper accessibility attributes', () => {
    render(<DashboardStats stats={mockStats} />)
    
    // Check for proper labeling
    const statCards = screen.getAllByRole('article') // Or whatever role you use for stat cards
    expect(statCards.length).toBe(mockStats.length)
    
    // Check for aria-labels
    expect(screen.getByLabelText('Total Devices: 156')).toBeInTheDocument()
  })

  it('should format large numbers correctly', () => {
    const largeNumberStats = [
      {
        id: 'large-number',
        title: 'Large Number',
        value: 1234567,
        change: '+5%',
        changeType: 'positive' as const,
        icon: 'TrendingUp',
        description: 'A very large number',
      },
    ]

    render(<DashboardStats stats={largeNumberStats} />)
    
    // Should format large numbers (e.g., 1.23M or 1,234,567)
    expect(screen.getByText(/1\.23M|1,234,567/)).toBeInTheDocument()
  })

  it('should handle refresh functionality', () => {
    const onRefresh = jest.fn()
    render(<DashboardStats stats={mockStats} onRefresh={onRefresh} refreshable />)
    
    const refreshButton = screen.getByTestId('stats-refresh-button')
    refreshButton.click()
    
    expect(onRefresh).toHaveBeenCalled()
  })
})