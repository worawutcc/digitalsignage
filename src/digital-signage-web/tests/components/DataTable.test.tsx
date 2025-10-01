import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from '@/components/ui/DataTable'

// Mock data for testing
const mockColumns = [
  {
    header: 'Name',
    accessor: 'name' as const,
    sortable: true,
  },
  {
    header: 'Email',
    accessor: 'email' as const,
    sortable: true,
  },
  {
    header: 'Status',
    accessor: 'status' as const,
    sortable: false,
  },
  {
    header: 'Actions',
    accessor: 'actions' as const,
    sortable: false,
    render: (value: any, row: any) => (
      <div>
        <button data-testid={`edit-${row.id}`}>Edit</button>
        <button data-testid={`delete-${row.id}`}>Delete</button>
      </div>
    ),
  },
]

const mockData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'Pending' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', status: 'Active' },
]

describe('DataTable Component', () => {
  const user = userEvent.setup()

  it('should render basic table with data', () => {
    render(<DataTable columns={mockColumns} data={mockData} />)
    
    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
    
    // Check first row data
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('should handle sorting when column is sortable', async () => {
    const onSortChange = jest.fn()
    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        sortable
        onSortChange={onSortChange}
      />
    )
    
    const nameHeader = screen.getByText('Name')
    await user.click(nameHeader)
    
    expect(onSortChange).toHaveBeenCalledWith({
      column: 'name',
      direction: 'asc'
    })
  })

  it('should not allow sorting on non-sortable columns', async () => {
    const onSortChange = jest.fn()
    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        sortable
        onSortChange={onSortChange}
      />
    )
    
    const statusHeader = screen.getByText('Status')
    await user.click(statusHeader)
    
    expect(onSortChange).not.toHaveBeenCalled()
  })

  it('should handle search/filtering functionality', async () => {
    const onFilterChange = jest.fn()
    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        searchable
        onFilterChange={onFilterChange}
      />
    )
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'John')
    
    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith('John')
    })
  })

  it('should handle pagination', async () => {
    const onPageChange = jest.fn()
    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        pagination={{
          page: 1,
          pageSize: 2,
          total: mockData.length,
          onPageChange,
          onPageSizeChange: jest.fn()
        }}
      />
    )
    
    // Should show pagination controls
    expect(screen.getByText('1')).toBeInTheDocument() // Current page
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('Previous')).toBeInTheDocument()
    
    // Click next page
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('should handle row selection', async () => {
    const onSelectionChange = jest.fn()
    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        selectable
        onSelectionChange={onSelectionChange}
      />
    )
    
    // Should show selection checkboxes
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)
    
    // Select first row
    await user.click(checkboxes[1]) // Index 0 is "select all"
    
    expect(onSelectionChange).toHaveBeenCalledWith([mockData[0]])
  })

  it('should handle select all functionality', async () => {
    const onSelectionChange = jest.fn()
    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        selectable
        onSelectionChange={onSelectionChange}
      />
    )
    
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
    await user.click(selectAllCheckbox)
    
    expect(onSelectionChange).toHaveBeenCalledWith(mockData)
  })

  it('should render custom cell content using render function', () => {
    render(<DataTable columns={mockColumns} data={mockData} />)
    
    // Check that custom action buttons are rendered
    expect(screen.getByTestId('edit-1')).toBeInTheDocument()
    expect(screen.getByTestId('delete-1')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(<DataTable columns={mockColumns} data={[]} loading />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should show empty state when no data', () => {
    render(<DataTable columns={mockColumns} data={[]} />)
    
    expect(screen.getByText(/no data/i)).toBeInTheDocument()
  })

  it('should be responsive and show mobile view', () => {
    // Mock window.matchMedia for responsive testing
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('768px') ? false : true, // Mock mobile view
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })

    render(<DataTable columns={mockColumns} data={mockData} />)
    
    // In mobile view, table should adapt (this depends on your implementation)
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })

  it('should handle keyboard navigation', async () => {
    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        selectable
        onSelectionChange={jest.fn()}
      />
    )
    
    const firstCheckbox = screen.getAllByRole('checkbox')[1]
    firstCheckbox.focus()
    
    // Should be able to navigate with Space key
    await user.keyboard(' ')
    
    expect(firstCheckbox).toBeChecked()
  })

  it('should have proper accessibility attributes', () => {
    render(<DataTable columns={mockColumns} data={mockData} />)
    
    const table = screen.getByRole('table')
    expect(table).toHaveAttribute('aria-label')
    
    // Check for proper table structure
    expect(screen.getByRole('rowgroup')).toBeInTheDocument() // thead or tbody
    expect(screen.getAllByRole('row').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('columnheader').length).toBe(mockColumns.length)
  })
})