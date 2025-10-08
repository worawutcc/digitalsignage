# Phase 0: Research - API Integration Audit

**Created**: 2025-01-07  
**Purpose**: Document existing API landscape and integration patterns before systematic audit

## Executive Summary
The Digital Signage system has a comprehensive backend API built with .NET 8 Web API and a Next.js 15 frontend. However, many UI features are not connected to the backend, resulting in non-functional CRUD operations, filters, and actions across multiple menu areas. This research identifies the audit approach and existing patterns.

## Current State Analysis

### Existing API Architecture

#### Backend (.NET 8 Web API)
- **Pattern**: Clean Architecture with Domain → Application → Infrastructure → Api layers
- **Controllers**: Located in `src/DigitalSignage.Api/Controllers/`
- **Services**: Business logic in `src/DigitalSignage.Application/Services/`
- **DTOs**: Request/response objects in `src/DigitalSignage.Application/DTOs/`
- **Authentication**: JWT Bearer tokens with RBAC
- **Documentation**: ProducesResponseType attributes on all endpoints

#### Frontend (Next.js 15 + React 18)
- **Pattern**: Feature-based organization with co-located hooks, services, components
- **State Management**: React Query for server state, Redux Toolkit for global state
- **API Client**: Configured Axios client in `/lib/api.ts` with auth interceptor
- **Service Layer**: Individual service files per feature (e.g., `playlistService.ts`)
- **Hooks**: React Query hooks wrapping service calls (e.g., `usePlaylistAssignmentSummary`)

### Known Working Integrations
Based on recent implementation history:

1. **Playlist Assignment Summary** (✅ Recently completed)
   - Backend: `GET /api/playlist/{id}/assignment-summary`
   - Service: `PlaylistService.GetAssignmentSummaryAsync`
   - Frontend: `usePlaylistAssignmentSummary` hook → `PlaylistService.getAssignmentSummary`
   - Component: `PlaylistAssignmentSummary.tsx`

2. **Authentication System** (✅ Working)
   - Backend: `POST /api/auth/login`, `/api/auth/register`
   - Frontend: Redux auth slice with JWT token management

3. **Media Upload** (✅ Working with S3)
   - Backend: Presigned URL generation, S3 integration
   - Frontend: Direct S3 upload with progress tracking

### Known Non-Working Areas

Based on user report: "action ต่างๆ ของ playlist, schedules, crud ต่างๆ query ต่างๆ ยังไม่เชื่อมต่อเลย"

**Phase 1: Playlists Menu** (Priority: High)
- ❌ Create Playlist form submission
- ❌ Edit Playlist data loading and saving
- ❌ Delete Playlist API call
- ❌ Duplicate Playlist action
- ❌ Activate/Deactivate toggle
- ❌ Search and filter with API parameters
- ❌ Playlist statistics

**Phase 2: Schedules Menu** (Priority: High)
- ❌ Create Schedule (all tabs: basic, time, targets, content)
- ❌ Edit Schedule data loading and updates
- ❌ Delete Schedule
- ❌ Schedule calendar event loading
- ❌ Conflict detection validation
- ❌ User/device assignment
- ❌ Template operations

**Phase 3-7: Other Menus** (Priority: Medium)
- Devices, Media, Users, QR Codes, Dashboard menus all require audit

## Audit Strategy

### Discovery Process

For each menu/submenu area:

1. **UI Inventory**
   - List all user-facing actions (buttons, forms, filters)
   - Identify data displays requiring API queries
   - Document expected user interactions

2. **Frontend Code Audit**
   - Check page components in `/app/{menu}/`
   - Review feature hooks in `/features/{menu}/hooks/`
   - Verify service calls in `/services/{menuService}.ts`
   - Confirm apiClient usage (no direct axios imports)

3. **Backend API Audit**
   - Search for existing endpoints in controllers
   - Verify service implementations
   - Check DTO definitions
   - Review database entity relationships

4. **Gap Analysis**
   - Identify UI features with no service calls
   - Find service methods with mock data or stubs
   - Locate missing backend endpoints
   - Document type mismatches (frontend types vs backend DTOs)

### Integration Patterns to Follow

#### Frontend Service Pattern (MUST FOLLOW)
```typescript
// services/playlistService.ts
import { apiClient } from '@/lib/api'; // ✅ CORRECT
// import axios from 'axios';           // ❌ NEVER DO THIS

export const PlaylistService = {
  getAll: async () => {
    const response = await apiClient.get<Playlist[]>('/api/playlist');
    return response.data;
  },
  
  create: async (data: CreatePlaylistRequest) => {
    const response = await apiClient.post<Playlist>('/api/playlist', data);
    return response.data;
  },
  
  // ... other methods
};
```

#### React Query Hook Pattern
```typescript
// features/playlists/hooks/usePlaylists.ts
import { useQuery } from '@tanstack/react-query';
import { PlaylistService } from '@/services/playlistService';

export function usePlaylists() {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: PlaylistService.getAll,
    refetchInterval: 30000,
  });
}
```

#### Backend Controller Pattern
```csharp
/// <summary>
/// Get all playlists
/// </summary>
[HttpGet]
[ProducesResponseType(typeof(List<PlaylistDto>), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
public async Task<ActionResult<List<PlaylistDto>>> GetAllPlaylists()
{
    var playlists = await _playlistService.GetAllAsync();
    return Ok(playlists);
}
```

#### Backend Service Pattern
```csharp
public class PlaylistService : IPlaylistService
{
    private readonly IPlaylistRepository _playlistRepository;
    private readonly ILogger<PlaylistService> _logger;

    public PlaylistService(
        IPlaylistRepository playlistRepository,
        ILogger<PlaylistService> logger)
    {
        _playlistRepository = playlistRepository;
        _logger = logger;
    }

    public async Task<List<PlaylistDto>> GetAllAsync()
    {
        var playlists = await _playlistRepository.GetAllAsync();
        return playlists.Select(p => MapToDto(p)).ToList();
    }
}
```

### Type Safety Requirements

#### DTO Synchronization
- Backend DTOs in `DigitalSignage.Application/DTOs/`
- Frontend types in `src/digital-signage-web/src/types/`
- **MUST MATCH**: Property names, data types, nullable fields

#### Example Type Alignment
```csharp
// Backend: PlaylistDto.cs
public class PlaylistDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

```typescript
// Frontend: types/playlist.ts
export interface Playlist {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string; // ISO string from API
}
```

## Research Findings

### Decision 1: Audit Execution Order
**Chosen**: Menu-by-menu phases (Playlists → Schedules → Devices → Media → Users → QR Codes → Dashboard)

**Rationale**: 
- Incremental approach reduces risk of breaking changes
- Allows testing and validation between phases
- Prioritizes high-value features first (content management before analytics)
- Maintains working system throughout audit process

**Alternatives Considered**:
- **Layer-by-layer** (all frontend first, then backend): Rejected - creates large integration gaps
- **Entity-by-entity** (all Playlist work, then all Schedule work): Rejected - same as chosen approach
- **Full parallel audit**: Rejected - too complex to manage, higher risk of conflicts

### Decision 2: API Reuse Strategy
**Chosen**: Always check existing endpoints before creating new ones

**Rationale**:
- Reduces backend code duplication
- Maintains consistent API patterns
- Faster implementation (wire up existing vs create new)
- Avoids technical debt from redundant endpoints

**Alternatives Considered**:
- **Create new endpoints for each feature**: Rejected - increases maintenance burden
- **Generic endpoints with parameters**: Considered but requires careful design

### Decision 3: Testing Approach
**Chosen**: Manual functional testing only (per user specification)

**Rationale**:
- User explicitly stated: "No unit tests or documentation generation required"
- Focus on working integrations, not test coverage
- Integration validation through UI interaction
- Faster delivery without test infrastructure overhead

**Alternatives Considered**:
- **Full TDD with unit tests**: Rejected per user requirement
- **Contract testing**: Would be beneficial but not required

### Decision 4: Migration Path
**Chosen**: In-place fixes on feature branch with incremental commits per phase

**Rationale**:
- No breaking changes to existing working features
- Git history shows progression through phases
- Easy rollback if issues discovered
- Can deploy phases independently if needed

**Alternatives Considered**:
- **Separate branch per phase**: Rejected - merge overhead
- **Parallel development**: Rejected - coordination complexity

## Technical Constraints

### Must Maintain
1. **Authentication**: JWT token flow must continue working
2. **Working Features**: Playlist assignment summary, media upload, auth system
3. **Architectural Patterns**: Clean Architecture, feature-based organization
4. **Type Safety**: TypeScript strict mode, full type coverage

### Must Avoid
1. **Direct Axios Imports**: All service files must use apiClient
2. **Breaking Changes**: No changes to working API contracts
3. **Mock Data**: Remove all mock/stub data, use real APIs
4. **Domain Entity Exposure**: Backend never returns entities directly (always DTOs)

### DateTime Handling (CRITICAL)
Backend uses PostgreSQL with special datetime handling:
- **Column Type**: `timestamp without time zone`
- **Application Code**: Convert `DateTime.UtcNow` to `DateTimeKind.Unspecified` for database operations
- **Pattern**: `DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)`
- **Reason**: Prevents "Cannot write DateTime with Kind=UTC" errors

## Dependencies and Prerequisites

### Required Tools
- ✅ .NET 8 SDK (backend development)
- ✅ Node.js 18+ (frontend development)
- ✅ PostgreSQL database (running locally or via connection string)
- ✅ AWS S3 credentials (for media operations)

### Documentation References
- `copilot-instructions-api.instructions.md` - Backend patterns
- `copilot-instructions-ui.instructions.md` - Frontend patterns
- `docs/api-integration.md` - Existing API documentation
- `PRD_DigitalSignage.md` - Product requirements

### Codebase Knowledge Required
- Existing entity relationships (Playlist, Schedule, Device, Media, User, etc.)
- EF Core migration patterns
- React Query cache invalidation strategies
- Redux store structure (auth, UI state)

## Phase 0 Checklist
- [x] Documented current architecture (frontend + backend)
- [x] Identified working integrations (baseline)
- [x] Listed known non-working areas (scope)
- [x] Defined audit strategy (discovery process)
- [x] Established integration patterns to follow
- [x] Documented type safety requirements
- [x] Made key decisions (execution order, API reuse, testing, migration)
- [x] Documented technical constraints
- [x] Listed dependencies and prerequisites

## Next Steps → Phase 1: Design & Contracts
1. Extract entity models from domain layer
2. Generate API contracts for each menu area
3. Create quickstart validation guide
4. Update architectural instruction files incrementally
