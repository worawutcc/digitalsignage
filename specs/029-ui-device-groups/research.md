# Research: Enhanced Device Groups UI with API Integration

**Phase**: 0 - Outline & Research  
**Date**: 2025-10-06  
**Feature**: 029-ui-device-groups

## Technology Decisions

### Decision: Next.js 15 App Router with React 18
**Rationale**: Existing codebase uses Next.js 15 with App Router pattern. The device-groups page already exists at `src/app/device-groups/page.tsx` using client components with mock data.

**Alternatives considered**: 
- Server Components: Not suitable due to need for interactive tree, drag-and-drop, and real-time updates
- Pages Router: Legacy approach, inconsistent with existing App Router structure

### Decision: React Query/TanStack Query for API State Management
**Rationale**: 
- Specified in copilot-instructions-ui.instructions.md as preferred over SWR
- Provides automatic caching, background refetching, optimistic updates
- Essential for hierarchical data that changes frequently
- Handles loading and error states elegantly

**Alternatives considered**:
- SWR: Explicitly not preferred per UI guidelines
- Redux only: Would require manual caching and refetch logic
- Native fetch: No caching, loading states, or error handling

### Decision: Axios with TypeScript API Client
**Rationale**: 
- Existing `lib/api.ts` already configured with Axios
- JWT token interceptor already implemented
- Better error handling than fetch
- TypeScript integration for type safety

**Alternatives considered**:
- Native fetch: Less features, no automatic token handling
- GraphQL: Backend uses REST API, would require dual implementation

### Decision: Feature-Based Architecture in features/device-groups/
**Rationale**:
- Follows established pattern in copilot-instructions-ui.instructions.md
- Existing features directory structure (features/users/, etc.)
- Separates device group logic from generic components
- Easier maintenance and testing

**Alternatives considered**:
- Monolithic components: Harder to maintain, test, and reuse
- Pages-only approach: Doesn't scale for complex features

## API Integration Analysis

### Existing Backend API Assessment
**Available Endpoints** (from DeviceGroupController.cs):
- `GET /api/devicegroup` - Get all groups
- `GET /api/devicegroup/{id}` - Get specific group
- `POST /api/devicegroup` - Create group
- `PUT /api/devicegroup/{id}` - Update group
- `DELETE /api/devicegroup/{id}` - Delete group
- `GET /api/devicegroup/tree` - Get hierarchical tree
- `GET /api/devicegroup/search` - Search groups
- `GET /api/devicegroup/{id}/children` - Get child groups
- `POST /api/devicegroup/{groupId}/assign-content` - Assign content

**Decision**: Use existing comprehensive API - no backend changes needed

### Real-time Updates Strategy
**Decision**: WebSocket integration via existing SignalR hub
**Rationale**: 
- NotificationHub already exists with device group event support
- Real-time updates essential for multi-admin environments
- Prevents stale data and conflicts

**Alternatives considered**:
- Polling: Less efficient, higher server load
- No real-time: Poor UX for collaborative editing

## UI/UX Patterns

### Decision: Hierarchical Tree with Drag-and-Drop
**Rationale**:
- Users need visual hierarchy representation
- Drag-and-drop provides intuitive reorganization
- Existing DeviceGroupNode component provides foundation

**Implementation approach**:
- Use react-dnd or similar for drag-and-drop
- Maintain expanded/collapsed state in local storage
- Show device counts and status indicators

### Decision: Modal Forms for CRUD Operations
**Rationale**:
- Existing Modal component and DeviceGroupForm available
- Consistent with current UX patterns
- Preserves tree view context during operations

**Alternatives considered**:
- Inline editing: More complex state management
- Separate pages: Breaks user flow and context

### Decision: Optimistic Updates with Error Handling
**Rationale**:
- Improves perceived performance
- React Query supports optimistic updates natively
- Essential for drag-and-drop responsiveness

**Implementation approach**:
- Update UI immediately on user action
- Rollback changes if API call fails
- Show loading states for slower operations

## Performance Considerations

### Decision: Virtual Scrolling for Large Trees
**Rationale**: 
- Support for 1000+ device groups requirement
- Prevents DOM bloat and memory issues
- Maintains smooth scrolling performance

**Alternatives considered**:
- Full rendering: Would cause performance issues with large trees
- Pagination: Breaks hierarchy visualization

### Decision: Debounced Search with Highlighting
**Rationale**:
- Reduces API calls during typing
- Highlights matches without losing tree structure
- 300ms debounce provides good balance

**Implementation approach**:
- Use useDebounce hook
- Maintain search state in URL for bookmarking
- Clear search resets to full tree view

## Testing Strategy (Per User Request - Skip Implementation)

### Planned Approach (Documentation Only):
- Unit tests for hooks (useDeviceGroups, etc.)
- Component tests for DeviceGroupTree, DeviceGroupForm
- Integration tests for API service
- E2E tests for complete CRUD workflows

**Note**: User requested skipping test implementation, so tests will be described but not created.

## Migration Strategy

### Decision: Enhance Existing Page Instead of Replacing
**Rationale**:
- Less risk than complete rewrite
- Maintains existing route structure
- Gradual replacement of mock data with real API calls

**Implementation approach**:
1. Create feature-based components alongside existing ones
2. Replace mock data with React Query hooks
3. Enhance existing DeviceGroupForm for API integration
4. Add new components for search, drag-and-drop
5. Update existing page to use new components

## Dependencies Analysis

### Required New Dependencies:
- `@tanstack/react-query`: Already used in project
- `react-hook-form` + `zod`: Already specified in guidelines
- `@dnd-kit/core` or `react-dnd`: For drag-and-drop functionality
- `react-virtualized` or similar: For large tree performance

### Existing Dependencies (No Changes):
- `axios`: Already configured
- `tailwindcss`: For styling
- `lucide-react`: For icons
- `clsx`: For conditional styling

## Risk Assessment

### Low Risk:
- API integration (endpoints already exist and tested)
- Basic CRUD operations (patterns established)
- Form handling (existing components available)

### Medium Risk:
- Drag-and-drop implementation (complex state management)
- Large tree performance (requires careful optimization)
- Real-time updates coordination (WebSocket complexity)

### Mitigation Strategies:
- Start with basic tree view, add drag-and-drop incrementally
- Implement virtual scrolling early for performance
- Use React Query's built-in optimistic updates
- Extensive error handling and fallback states

## Implementation Phases

### Phase 1: Core API Integration
- Replace mock data with real API calls
- Implement basic CRUD operations
- Add loading and error states

### Phase 2: Enhanced UI Features
- Implement hierarchical tree visualization
- Add search functionality
- Improve form validation and UX

### Phase 3: Advanced Features
- Add drag-and-drop reorganization
- Implement real-time updates
- Optimize for large datasets

### Phase 4: Polish and Performance
- Add virtual scrolling if needed
- Implement proper error boundaries
- Add accessibility improvements

---

**Research Status**: ✅ Complete - All unknowns resolved, ready for Phase 1