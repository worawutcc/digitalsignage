# Agent Instructions: Enhanced Device Groups UI Feature

**Phase**: 1 - Design & Contracts  
**Date**: 2025-10-06  
**Feature**: 029-ui-device-groups

## UI-Specific Instructions (Next.js Frontend)

### Component Development Guidelines

#### Device Groups Page Implementation
**Location**: `src/digital-signage-web/src/app/admin/device-groups/page.tsx`

**Architecture Pattern**:
```typescript
// Follow this structure for the main page component
export default function DeviceGroupsPage() {
  // 1. React Query hooks for data fetching
  const { data: groups, isLoading, error } = useDeviceGroups()
  
  // 2. Local UI state management
  const [selectedGroupId, setSelectedGroupId] = useState<number>()
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
  
  // 3. Real-time updates hook
  useRealTimeUpdates('device-groups', {
    onGroupCreated: (group) => queryClient.invalidateQueries(['device-groups']),
    onGroupUpdated: (group) => queryClient.setQueryData(['device-groups', group.id], group),
    onGroupDeleted: (groupId) => queryClient.removeQueries(['device-groups', groupId])
  })
  
  // 4. Component render with error boundaries
  return (
    <AdminLayout>
      <PageHeader title="Device Groups" />
      <ErrorBoundary fallback={<DeviceGroupsError />}>
        <Suspense fallback={<DeviceGroupsLoading />}>
          <DeviceGroupsContent groups={groups} />
        </Suspense>
      </ErrorBoundary>
    </AdminLayout>
  )
}
```

#### React Query Integration Pattern
**Hooks Location**: `src/digital-signage-web/src/hooks/useDeviceGroups.ts`

```typescript
// Always use this query key structure
export const deviceGroupKeys = {
  all: ['device-groups'] as const,
  lists: () => [...deviceGroupKeys.all, 'list'] as const,
  tree: () => [...deviceGroupKeys.all, 'tree'] as const,
  search: (query: string) => [...deviceGroupKeys.all, 'search', query] as const,
}

// Implement optimistic updates for mutations
export const useCreateDeviceGroup = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateDeviceGroupRequest) => 
      api.post('/device-groups', data),
    
    onMutate: async (newGroup) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: deviceGroupKeys.lists() })
      
      // Snapshot previous value
      const previousGroups = queryClient.getQueryData(deviceGroupKeys.lists())
      
      // Optimistically update
      queryClient.setQueryData(deviceGroupKeys.lists(), (old: DeviceGroup[]) => [
        ...old,
        { ...newGroup, id: Date.now(), createdAt: new Date().toISOString() }
      ])
      
      return { previousGroups }
    },
    
    onError: (err, newGroup, context) => {
      // Rollback on error
      if (context?.previousGroups) {
        queryClient.setQueryData(deviceGroupKeys.lists(), context.previousGroups)
      }
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.lists() })
    },
  })
}
```

#### Component Architecture Requirements

**Tree Component Structure**:
```typescript
// DeviceGroupTree.tsx - Main tree component
interface DeviceGroupTreeProps {
  groups: DeviceGroup[]
  selectedGroupId?: number
  expandedGroups: Set<number>
  onGroupSelect: (group: DeviceGroup) => void
  onGroupExpand: (groupId: number) => void
  onGroupCreate: (parentGroup?: DeviceGroup) => void
  onGroupEdit: (group: DeviceGroup) => void
  onGroupDelete: (group: DeviceGroup) => void
  onGroupMove: (sourceGroup: DeviceGroup, targetGroup: DeviceGroup) => void
}

// Must implement these accessibility features
const DeviceGroupTree = (props: DeviceGroupTreeProps) => (
  <div role="tree" aria-label="Device Groups Hierarchy">
    {props.groups.map(group => (
      <DeviceGroupItem
        key={group.id}
        group={group}
        role="treeitem"
        aria-expanded={props.expandedGroups.has(group.id)}
        aria-selected={props.selectedGroupId === group.id}
        tabIndex={props.selectedGroupId === group.id ? 0 : -1}
      />
    ))}
  </div>
)
```

**Form Validation Pattern**:
```typescript
// Use Zod schemas for all form validation
const deviceGroupSchema = z.object({
  name: z.string()
    .min(1, 'Group name is required')
    .max(255, 'Group name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Group name contains invalid characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  parentGroupId: z.number().int().positive().optional(),
})

// React Hook Form integration
const DeviceGroupModal = ({ mode, selectedGroup, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(deviceGroupSchema),
    defaultValues: selectedGroup || {}
  })
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        {...register('name')}
        error={errors.name?.message}
        required
      />
      {/* Additional fields */}
    </form>
  )
}
```

### Drag & Drop Implementation

**Required Libraries**: Install `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

```typescript
// Drag and drop for group reordering
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

const DeviceGroupDragDrop = ({ groups, onGroupMove }) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const sourceGroup = groups.find(g => g.id === active.id)
      const targetGroup = groups.find(g => g.id === over.id)
      
      if (sourceGroup && targetGroup) {
        onGroupMove(sourceGroup, targetGroup)
      }
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={groups} strategy={verticalListSortingStrategy}>
        {groups.map(group => (
          <SortableDeviceGroupItem key={group.id} group={group} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

### Real-Time Updates Integration

**SignalR Hook Usage**:
```typescript
// useRealTimeUpdates.ts implementation for device groups
export const useDeviceGroupRealTime = () => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const connection = getSignalRConnection()
    
    connection?.on('GroupCreated', (group: DeviceGroup) => {
      queryClient.setQueryData(
        deviceGroupKeys.lists(),
        (old: DeviceGroup[] = []) => [...old, group]
      )
      
      // Show success notification
      toast.success(`Device group "${group.name}" was created`)
    })
    
    connection?.on('GroupUpdated', (group: DeviceGroup) => {
      queryClient.setQueryData(deviceGroupKeys.lists(), (old: DeviceGroup[] = []) =>
        old.map(g => g.id === group.id ? group : g)
      )
    })
    
    connection?.on('GroupDeleted', (groupId: number) => {
      queryClient.setQueryData(deviceGroupKeys.lists(), (old: DeviceGroup[] = []) =>
        old.filter(g => g.id !== groupId)
      )
    })
    
    return () => {
      connection?.off('GroupCreated')
      connection?.off('GroupUpdated')  
      connection?.off('GroupDeleted')
    }
  }, [queryClient])
}
```

### Error Handling Standards

**Error Boundary Pattern**:
```typescript
// DeviceGroupsErrorBoundary.tsx
class DeviceGroupsErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong with device groups</h2>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}

// API Error handling with react-query
const useDeviceGroups = () => {
  return useQuery({
    queryKey: deviceGroupKeys.lists(),
    queryFn: () => api.get('/device-groups'),
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false
      }
      return failureCount < 3
    },
    onError: (error) => {
      // Global error handling
      if (error.response?.status === 401) {
        redirectToLogin()
      } else {
        toast.error('Failed to load device groups')
      }
    }
  })
}
```

### Performance Optimization Requirements

**Virtualization for Large Lists**:
```typescript
// Use react-window for large device group lists
import { FixedSizeList as List } from 'react-window'

const VirtualizedDeviceGroupList = ({ groups }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <DeviceGroupItem group={groups[index]} />
    </div>
  )
  
  return (
    <List
      height={600}
      itemCount={groups.length}
      itemSize={60}
      itemData={groups}
    >
      {Row}
    </List>
  )
}
```

**Search Debouncing**:
```typescript
// Debounced search hook
const useDeviceGroupSearch = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)
  
  const searchResults = useQuery({
    queryKey: deviceGroupKeys.search(debouncedQuery),
    queryFn: () => api.get(`/device-groups/search?query=${debouncedQuery}`),
    enabled: debouncedQuery.length > 0,
    staleTime: 30000, // 30 seconds
  })
  
  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearchActive: debouncedQuery.length > 0
  }
}
```

### Testing Requirements

**Component Testing Pattern**:
```typescript
// DeviceGroupsPage.test.tsx
describe('DeviceGroupsPage', () => {
  beforeEach(() => {
    // Setup MSW handlers
    server.use(
      rest.get('/api/device-groups', (req, res, ctx) => {
        return res(ctx.json({ success: true, data: mockDeviceGroups }))
      })
    )
  })
  
  it('should render device groups tree', async () => {
    render(<DeviceGroupsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Root Group')).toBeInTheDocument()
    })
  })
  
  it('should handle group creation', async () => {
    const user = userEvent.setup()
    render(<DeviceGroupsPage />)
    
    await user.click(screen.getByText('Add Group'))
    await user.type(screen.getByLabelText('Group Name'), 'New Group')
    await user.click(screen.getByText('Create Group'))
    
    await waitFor(() => {
      expect(screen.getByText('New Group')).toBeInTheDocument()
    })
  })
})
```

### Accessibility Compliance

**Required ARIA Attributes**:
- `role="tree"` on tree container
- `role="treeitem"` on each group item  
- `aria-expanded` for expandable groups
- `aria-selected` for selected groups
- `aria-label` for action buttons
- `tabindex` management for keyboard navigation

**Keyboard Navigation**:
- Arrow keys: Navigate between groups
- Enter/Space: Select group
- Right arrow: Expand group
- Left arrow: Collapse group
- Delete: Delete selected group (with confirmation)

### Code Quality Standards

**TypeScript Requirements**:
- Strict mode enabled
- No `any` types allowed
- All component props typed with interfaces
- API response types defined
- Zod schemas for runtime validation

**File Naming Conventions**:
- PascalCase for components: `DeviceGroupTree.tsx`
- camelCase for hooks: `useDeviceGroups.ts`
- kebab-case for pages: `device-groups/page.tsx`
- `.types.ts` suffix for type-only files

---

**Agent Instructions Status**: ✅ Complete - Comprehensive frontend development guidelines specific to device groups feature