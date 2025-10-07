# Component Contracts: Device Groups UI Components

**Phase**: 1 - Design & Contracts  
**Date**: 2025-10-06  
**Feature**: 029-ui-device-groups

## Component Contract Strategy

### Testing Framework
- **React Testing Library**: Component behavior testing
- **Jest**: Test runner and assertions
- **MSW**: API mocking for integration tests
- **User Events**: Realistic user interaction simulation

## Core Components

### 1. DeviceGroupsPage Component
**Location**: `src/digital-signage-web/src/app/admin/device-groups/page.tsx`

**Contract Test**:
```typescript
describe('DeviceGroupsPage', () => {
  beforeEach(() => {
    // Mock API responses
    setupMockHandlers([
      rest.get('/api/device-groups', (req, res, ctx) => {
        return res(ctx.json({
          success: true,
          data: mockDeviceGroups,
          totalCount: mockDeviceGroups.length
        }))
      })
    ])
  })

  it('should render page title and description', async () => {
    render(<DeviceGroupsPage />)
    
    expect(screen.getByText('Device Groups')).toBeInTheDocument()
    expect(screen.getByText(/Organize devices into hierarchical groups/)).toBeInTheDocument()
  })

  it('should display loading state while fetching data', async () => {
    render(<DeviceGroupsPage />)
    
    expect(screen.getByTestId('device-groups-loading')).toBeInTheDocument()
    
    await waitForElementToBeRemoved(() => 
      screen.queryByTestId('device-groups-loading')
    )
  })

  it('should render device groups tree after data loads', async () => {
    render(<DeviceGroupsPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('device-groups-tree')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Root Group')).toBeInTheDocument()
  })

  it('should show error state when API fails', async () => {
    // Mock API error
    setupMockHandlers([
      rest.get('/api/device-groups', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }))
      })
    ])

    render(<DeviceGroupsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading device groups/)).toBeInTheDocument()
    })
    
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('should have accessible structure', () => {
    render(<DeviceGroupsPage />)
    
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
```

### 2. DeviceGroupTree Component
**Location**: `src/digital-signage-web/src/components/DeviceGroupTree.tsx`

**Contract Test**:
```typescript
describe('DeviceGroupTree', () => {
  const mockProps = {
    groups: mockDeviceGroups,
    selectedGroupId: null,
    expandedGroups: new Set([1, 2]),
    onGroupSelect: jest.fn(),
    onGroupExpand: jest.fn(),
    onGroupCreate: jest.fn(),
    onGroupEdit: jest.fn(),
    onGroupDelete: jest.fn(),
    onGroupMove: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render root groups', () => {
    render(<DeviceGroupTree {...mockProps} />)
    
    expect(screen.getByText('Root Group')).toBeInTheDocument()
    expect(screen.getByText('Another Root')).toBeInTheDocument()
  })

  it('should expand/collapse groups on click', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupTree {...mockProps} />)
    
    const expandButton = screen.getByTestId('expand-button-1')
    await user.click(expandButton)
    
    expect(mockProps.onGroupExpand).toHaveBeenCalledWith(1)
  })

  it('should show group context menu on right click', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupTree {...mockProps} />)
    
    const groupItem = screen.getByTestId('group-item-1')
    await user.pointer({ keys: '[MouseRight]', target: groupItem })
    
    expect(screen.getByText('Edit Group')).toBeInTheDocument()
    expect(screen.getByText('Delete Group')).toBeInTheDocument()
    expect(screen.getByText('Add Subgroup')).toBeInTheDocument()
  })

  it('should highlight selected group', () => {
    render(<DeviceGroupTree {...mockProps} selectedGroupId={1} />)
    
    const selectedItem = screen.getByTestId('group-item-1')
    expect(selectedItem).toHaveClass('bg-blue-100', 'border-blue-500')
  })

  it('should display device counts', () => {
    render(<DeviceGroupTree {...mockProps} />)
    
    expect(screen.getByText('5 devices')).toBeInTheDocument()
    expect(screen.getByText('15 total')).toBeInTheDocument()
  })

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupTree {...mockProps} />)
    
    const firstGroup = screen.getByTestId('group-item-1')
    firstGroup.focus()
    
    await user.keyboard('{ArrowDown}')
    expect(screen.getByTestId('group-item-2')).toHaveFocus()
    
    await user.keyboard('{Enter}')
    expect(mockProps.onGroupSelect).toHaveBeenCalledWith(2)
  })

  it('should render empty state when no groups', () => {
    render(<DeviceGroupTree {...mockProps} groups={[]} />)
    
    expect(screen.getByText('No device groups found')).toBeInTheDocument()
    expect(screen.getByText('Create your first group')).toBeInTheDocument()
  })
})
```

### 3. DeviceGroupModal Component
**Location**: `src/digital-signage-web/src/components/DeviceGroupModal.tsx`

**Contract Test**:
```typescript
describe('DeviceGroupModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    mode: 'create' as const,
    groups: mockDeviceGroups,
    selectedGroup: null,
    parentGroup: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render create modal with correct title', () => {
    render(<DeviceGroupModal {...mockProps} />)
    
    expect(screen.getByText('Create Device Group')).toBeInTheDocument()
    expect(screen.getByLabelText('Group Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Parent Group')).toBeInTheDocument()
  })

  it('should render edit modal with pre-filled data', () => {
    const editProps = {
      ...mockProps,
      mode: 'edit' as const,
      selectedGroup: mockDeviceGroups[0]
    }

    render(<DeviceGroupModal {...editProps} />)
    
    expect(screen.getByText('Edit Device Group')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Root Group')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupModal {...mockProps} />)
    
    const submitButton = screen.getByText('Create Group')
    await user.click(submitButton)
    
    expect(screen.getByText('Group name is required')).toBeInTheDocument()
    expect(mockProps.onSubmit).not.toHaveBeenCalled()
  })

  it('should submit valid form data', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupModal {...mockProps} />)
    
    await user.type(screen.getByLabelText('Group Name'), 'New Group')
    await user.type(screen.getByLabelText('Description'), 'Test description')
    
    const submitButton = screen.getByText('Create Group')
    await user.click(submitButton)
    
    expect(mockProps.onSubmit).toHaveBeenCalledWith({
      name: 'New Group',
      description: 'Test description',
      parentGroupId: undefined
    })
  })

  it('should close modal on cancel', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupModal {...mockProps} />)
    
    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('should close modal on escape key', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupModal {...mockProps} />)
    
    await user.keyboard('{Escape}')
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('should prevent circular parent selection', () => {
    const editProps = {
      ...mockProps,
      mode: 'edit' as const,
      selectedGroup: mockDeviceGroups[0] // Root group with children
    }

    render(<DeviceGroupModal {...editProps} />)
    
    const parentSelect = screen.getByLabelText('Parent Group')
    const options = within(parentSelect).getAllByRole('option')
    
    // Child groups should not be available as parent options
    expect(options.find(opt => opt.textContent === 'Child Group 1')).toBeUndefined()
  })
})
```

### 4. DeviceGroupSearch Component
**Location**: `src/digital-signage-web/src/components/DeviceGroupSearch.tsx`

**Contract Test**:
```typescript
describe('DeviceGroupSearch', () => {
  const mockProps = {
    searchQuery: '',
    searchResults: [],
    isSearchActive: false,
    onSearchChange: jest.fn(),
    onSearchClear: jest.fn(),
    onResultSelect: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render search input', () => {
    render(<DeviceGroupSearch {...mockProps} />)
    
    expect(screen.getByPlaceholderText('Search device groups...')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
  })

  it('should call onSearchChange when typing', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupSearch {...mockProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search device groups...')
    await user.type(searchInput, 'office')
    
    expect(mockProps.onSearchChange).toHaveBeenCalledWith('office')
  })

  it('should show search results dropdown', () => {
    const propsWithResults = {
      ...mockProps,
      searchQuery: 'office',
      isSearchActive: true,
      searchResults: [mockDeviceGroups[0]]
    }

    render(<DeviceGroupSearch {...propsWithResults} />)
    
    expect(screen.getByText('Root Group')).toBeInTheDocument()
    expect(screen.getByText('5 devices')).toBeInTheDocument()
  })

  it('should show no results message', () => {
    const propsWithNoResults = {
      ...mockProps,
      searchQuery: 'nonexistent',
      isSearchActive: true,
      searchResults: []
    }

    render(<DeviceGroupSearch {...propsWithNoResults} />)
    
    expect(screen.getByText('No groups found')).toBeInTheDocument()
  })

  it('should select result on click', async () => {
    const user = userEvent.setup()
    const propsWithResults = {
      ...mockProps,
      searchQuery: 'office',
      isSearchActive: true,
      searchResults: [mockDeviceGroups[0]]
    }

    render(<DeviceGroupSearch {...propsWithResults} />)
    
    const resultItem = screen.getByText('Root Group')
    await user.click(resultItem)
    
    expect(mockProps.onResultSelect).toHaveBeenCalledWith(mockDeviceGroups[0])
  })

  it('should clear search on clear button click', async () => {
    const user = userEvent.setup()
    const propsWithQuery = {
      ...mockProps,
      searchQuery: 'office'
    }

    render(<DeviceGroupSearch {...propsWithQuery} />)
    
    const clearButton = screen.getByLabelText('Clear search')
    await user.click(clearButton)
    
    expect(mockProps.onSearchClear).toHaveBeenCalled()
  })

  it('should support keyboard navigation in results', async () => {
    const user = userEvent.setup()
    const propsWithResults = {
      ...mockProps,
      searchQuery: 'group',
      isSearchActive: true,
      searchResults: mockDeviceGroups.slice(0, 3)
    }

    render(<DeviceGroupSearch {...propsWithResults} />)
    
    const searchInput = screen.getByPlaceholderText('Search device groups...')
    searchInput.focus()
    
    await user.keyboard('{ArrowDown}')
    expect(screen.getByTestId('search-result-0')).toHaveClass('bg-gray-100')
    
    await user.keyboard('{Enter}')
    expect(mockProps.onResultSelect).toHaveBeenCalledWith(mockDeviceGroups[0])
  })
})
```

### 5. DeviceGroupItem Component
**Location**: `src/digital-signage-web/src/components/DeviceGroupItem.tsx`

**Contract Test**:
```typescript
describe('DeviceGroupItem', () => {
  const mockProps = {
    group: mockDeviceGroups[0],
    isSelected: false,
    isExpanded: false,
    level: 0,
    onSelect: jest.fn(),
    onExpand: jest.fn(),
    onContextMenu: jest.fn(),
    isDragOver: false,
    onDragStart: jest.fn(),
    onDragEnd: jest.fn(),
    onDrop: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render group information', () => {
    render(<DeviceGroupItem {...mockProps} />)
    
    expect(screen.getByText('Root Group')).toBeInTheDocument()
    expect(screen.getByText('5 devices')).toBeInTheDocument()
    expect(screen.getByText('15 total')).toBeInTheDocument()
  })

  it('should show expand button when group has children', () => {
    const groupWithChildren = {
      ...mockDeviceGroups[0],
      childGroupCount: 2
    }

    render(<DeviceGroupItem {...mockProps} group={groupWithChildren} />)
    
    expect(screen.getByTestId('expand-button')).toBeInTheDocument()
  })

  it('should not show expand button for leaf groups', () => {
    const leafGroup = {
      ...mockDeviceGroups[0],
      childGroupCount: 0
    }

    render(<DeviceGroupItem {...mockProps} group={leafGroup} />)
    
    expect(screen.queryByTestId('expand-button')).not.toBeInTheDocument()
  })

  it('should apply selected styling', () => {
    render(<DeviceGroupItem {...mockProps} isSelected={true} />)
    
    const item = screen.getByTestId('group-item-1')
    expect(item).toHaveClass('bg-blue-100', 'border-blue-500')
  })

  it('should show drag over styling', () => {
    render(<DeviceGroupItem {...mockProps} isDragOver={true} />)
    
    const item = screen.getByTestId('group-item-1')
    expect(item).toHaveClass('border-green-500', 'bg-green-50')
  })

  it('should handle drag and drop events', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupItem {...mockProps} />)
    
    const item = screen.getByTestId('group-item-1')
    
    // Start drag
    await user.pointer([
      { keys: '[MouseLeft>]', target: item },
      { pointerName: 'mouse', coords: { x: 100, y: 100 } }
    ])
    
    expect(mockProps.onDragStart).toHaveBeenCalledWith(mockDeviceGroups[0])
  })

  it('should show context menu on right click', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupItem {...mockProps} />)
    
    const item = screen.getByTestId('group-item-1')
    await user.pointer({ keys: '[MouseRight]', target: item })
    
    expect(mockProps.onContextMenu).toHaveBeenCalledWith(
      mockDeviceGroups[0],
      expect.any(Object) // Event object
    )
  })

  it('should apply correct indentation for nested levels', () => {
    render(<DeviceGroupItem {...mockProps} level={2} />)
    
    const item = screen.getByTestId('group-item-1')
    expect(item).toHaveStyle('margin-left: 2rem') // 2rem for level 2
  })

  it('should be focusable and handle keyboard events', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupItem {...mockProps} />)
    
    const item = screen.getByTestId('group-item-1')
    item.focus()
    
    expect(item).toHaveFocus()
    
    await user.keyboard('{Enter}')
    expect(mockProps.onSelect).toHaveBeenCalledWith(mockDeviceGroups[0])
    
    await user.keyboard('{Space}')
    expect(mockProps.onExpand).toHaveBeenCalledWith(mockDeviceGroups[0].id)
  })
})
```

## Integration Tests

### Page-Level Integration
```typescript
describe('DeviceGroups Page Integration', () => {
  it('should handle complete CRUD workflow', async () => {
    const user = userEvent.setup()
    
    // Setup API mocks for full workflow
    setupMockHandlers([
      rest.get('/api/device-groups', handleGetGroups),
      rest.post('/api/device-groups', handleCreateGroup),
      rest.put('/api/device-groups/:id', handleUpdateGroup),
      rest.delete('/api/device-groups/:id', handleDeleteGroup),
    ])

    render(<DeviceGroupsPage />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Root Group')).toBeInTheDocument()
    })

    // Create new group
    await user.click(screen.getByText('Add Group'))
    await user.type(screen.getByLabelText('Group Name'), 'New Test Group')
    await user.click(screen.getByText('Create Group'))

    // Verify new group appears
    await waitFor(() => {
      expect(screen.getByText('New Test Group')).toBeInTheDocument()
    })

    // Edit group
    const groupItem = screen.getByText('New Test Group')
    await user.pointer({ keys: '[MouseRight]', target: groupItem })
    await user.click(screen.getByText('Edit Group'))
    
    const nameInput = screen.getByDisplayValue('New Test Group')
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Test Group')
    await user.click(screen.getByText('Save Changes'))

    // Verify update
    await waitFor(() => {
      expect(screen.getByText('Updated Test Group')).toBeInTheDocument()
    })

    // Delete group
    const updatedGroupItem = screen.getByText('Updated Test Group')
    await user.pointer({ keys: '[MouseRight]', target: updatedGroupItem })
    await user.click(screen.getByText('Delete Group'))
    await user.click(screen.getByText('Confirm Delete'))

    // Verify deletion
    await waitFor(() => {
      expect(screen.queryByText('Updated Test Group')).not.toBeInTheDocument()
    })
  })

  it('should handle search and filtering', async () => {
    const user = userEvent.setup()
    
    setupMockHandlers([
      rest.get('/api/device-groups', handleGetGroups),
      rest.get('/api/device-groups/search', handleSearchGroups),
    ])

    render(<DeviceGroupsPage />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Root Group')).toBeInTheDocument()
    })

    // Search for groups
    const searchInput = screen.getByPlaceholderText('Search device groups...')
    await user.type(searchInput, 'office')

    // Verify search results
    await waitFor(() => {
      expect(screen.getByText('Office Group')).toBeInTheDocument()
    })

    // Clear search
    await user.click(screen.getByLabelText('Clear search'))

    // Verify all groups are shown again
    await waitFor(() => {
      expect(screen.getByText('Root Group')).toBeInTheDocument()
    })
  })

  it('should handle drag and drop reordering', async () => {
    const user = userEvent.setup()
    
    setupMockHandlers([
      rest.get('/api/device-groups', handleGetGroups),
      rest.put('/api/device-groups/:id', handleMoveGroup),
    ])

    render(<DeviceGroupsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Child Group 1')).toBeInTheDocument()
    })

    // Simulate drag and drop
    const sourceGroup = screen.getByTestId('group-item-3')
    const targetGroup = screen.getByTestId('group-item-2')

    await user.pointer([
      { keys: '[MouseLeft>]', target: sourceGroup },
      { pointerName: 'mouse', target: targetGroup },
      { keys: '[/MouseLeft]' }
    ])

    // Verify the move API was called
    await waitFor(() => {
      expect(screen.getByText('Group moved successfully')).toBeInTheDocument()
    })
  })
})
```

## Accessibility Tests

### A11y Compliance
```typescript
describe('Device Groups Accessibility', () => {
  it('should have proper ARIA labels and roles', () => {
    render(<DeviceGroupsPage />)
    
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('tree')).toBeInTheDocument()
    expect(screen.getAllByRole('treeitem')).toHaveLength(
      mockDeviceGroups.length
    )
  })

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupsPage />)
    
    // Tab to tree
    await user.tab()
    expect(screen.getByRole('tree')).toHaveFocus()
    
    // Navigate with arrow keys
    await user.keyboard('{ArrowDown}')
    expect(screen.getByTestId('group-item-1')).toHaveFocus()
    
    await user.keyboard('{ArrowRight}')
    // Should expand group if it has children
  })

  it('should have proper focus management in modals', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupsPage />)
    
    await user.click(screen.getByText('Add Group'))
    
    // Focus should be on first form field
    expect(screen.getByLabelText('Group Name')).toHaveFocus()
    
    // Tab through form
    await user.tab()
    expect(screen.getByLabelText('Description')).toHaveFocus()
  })

  it('should announce changes to screen readers', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupsPage />)
    
    await user.click(screen.getByText('Add Group'))
    await user.type(screen.getByLabelText('Group Name'), 'New Group')
    await user.click(screen.getByText('Create Group'))
    
    // Should have live region announcement
    expect(screen.getByRole('status')).toHaveTextContent(
      'Device group "New Group" created successfully'
    )
  })
})
```

---

**Component Contract Status**: ✅ Complete - All major UI components covered with behavior, interaction, and accessibility tests