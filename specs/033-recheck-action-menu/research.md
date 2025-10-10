# Research: Complete Menu Actions API Integration Audit

**Feature**: 033-recheck-action-menu  
**Date**: 2025-10-09  
**Status**: Complete

## Executive Summary

This research document establishes the priority order for auditing 14 sidebar menus based on admin web backoffice importance, documents existing API endpoints, identifies gaps, and defines patterns for mock elimination and API integration.

---

## Menu Priority Order (Admin Importance)

### Tier 1: Critical Operations (Highest Priority)
These menus are essential for daily admin operations and must be fully functional with real APIs first.

1. **Dashboard** (`/dashboard`)
   - **Importance**: PRIMARY - First page admins see, shows system health
   - **Criticality**: Real-time metrics, device status, alerts
   - **Impact**: High - Affects admin decision-making
   
2. **Devices** (`/devices`)
   - **Importance**: CORE FUNCTIONALITY - Main entity management
   - **Criticality**: Device provisioning, monitoring, troubleshooting
   - **Impact**: High - Cannot manage digital signage without this
   
3. **Media** (`/media`)
   - **Importance**: CORE CONTENT - Primary content management
   - **Criticality**: Upload, organize, assign media files
   - **Impact**: High - Content is the product

4. **Device Registrations** (`/device-registrations/*`)
   - **Importance**: SECURITY & PROVISIONING - Critical workflow
   - **Criticality**: Approve/reject new Android TV registrations
   - **Impact**: High - Security gate for device enrollment
   - **Sub-menus**: Pending, Approved, Rejected, All Devices

### Tier 2: Operational Features (High Priority)
Essential for content delivery and scheduling operations.

5. **Schedules** (`/schedules`)
   - **Importance**: CONTENT DELIVERY - Time-based content control
   - **Criticality**: Schedule management, conflict detection
   - **Impact**: High - Determines what content plays when

6. **Users** (`/users`)
   - **Importance**: ACCESS CONTROL - Admin user management
   - **Criticality**: RBAC, permissions, user provisioning
   - **Impact**: High - Security and access management

7. **Assignments** (`/assignments`)
   - **Importance**: CONTENT DISTRIBUTION - Link content to devices
   - **Criticality**: Bulk assignment, target selection
   - **Impact**: Medium-High - Content distribution efficiency

### Tier 3: Supporting Features (Medium Priority)
Important for organization and advanced features.

8. **Playlists** (`/playlists`)
   - **Importance**: CONTENT ORGANIZATION - Group media sequences
   - **Criticality**: Playlist management, media ordering
   - **Impact**: Medium - Enhances content management

9. **Device Groups** (`/device-groups`)
   - **Importance**: ORGANIZATION - Logical device grouping
   - **Criticality**: Group management, device assignment
   - **Impact**: Medium - Simplifies bulk operations

10. **Analytics** (`/analytics`)
    - **Importance**: INSIGHTS - Performance metrics
    - **Criticality**: Usage statistics, device performance
    - **Impact**: Medium - Business intelligence

### Tier 4: Administrative Features (Lower Priority)
Useful but not critical for daily operations.

11. **QR Codes** (`/qr-codes`)
    - **Importance**: PROVISIONING TOOL - Device setup aid
    - **Criticality**: QR generation, download
    - **Impact**: Low-Medium - Alternative provisioning method

12. **Reports** (`/reports`)
    - **Importance**: REPORTING - Data export and analysis
    - **Criticality**: Report generation, export
    - **Impact**: Low-Medium - Business reporting

13. **Settings** (`/settings`)
    - **Importance**: CONFIGURATION - System settings
    - **Criticality**: System configuration, preferences
    - **Impact**: Low - Infrequent changes

---

## Existing API Endpoints Audit

### ✅ Fully Implemented Controllers

1. **DashboardController.cs** (`/api/dashboard`)
   - GET `/api/dashboard/summary` - Dashboard metrics
   - GET `/api/dashboard/device-status` - Device status grid
   - Endpoints exist, likely complete

2. **DevicesController.cs** (`/api/devices`)
   - GET `/api/devices` - List devices
   - GET `/api/devices/{id}` - Device detail
   - POST `/api/devices` - Create device
   - PUT `/api/devices/{id}` - Update device
   - DELETE `/api/devices/{id}` - Delete device
   - Endpoints exist, likely complete

3. **MediaController.cs** (`/api/media`)
   - GET `/api/media` - List media
   - GET `/api/media/{id}` - Media detail
   - POST `/api/media/upload` - Upload media (presigned URL)
   - PUT `/api/media/{id}` - Update media metadata
   - DELETE `/api/media/{id}` - Delete media
   - Endpoints exist, fully implemented

4. **AdminDeviceRegistrationController.cs** (`/api/admin/device-registrations`)
   - GET `/api/admin/device-registrations` - List registrations (with status filter)
   - GET `/api/admin/device-registrations/{id}` - Registration detail
   - POST `/api/admin/device-registrations/{id}/approve` - Approve
   - POST `/api/admin/device-registrations/{id}/reject` - Reject
   - Endpoints exist, complete

5. **PlaylistController.cs** (`/api/playlists`)
   - GET `/api/playlists` - List playlists
   - GET `/api/playlists/{id}` - Playlist detail
   - POST `/api/playlists` - Create playlist
   - PUT `/api/playlists/{id}` - Update playlist
   - DELETE `/api/playlists/{id}` - Delete playlist
   - Endpoints exist, complete

6. **ScheduleController.cs** (`/api/schedules`)
   - GET `/api/schedules` - List schedules
   - GET `/api/schedules/{id}` - Schedule detail
   - POST `/api/schedules` - Create schedule
   - PUT `/api/schedules/{id}` - Update schedule
   - DELETE `/api/schedules/{id}` - Delete schedule
   - GET `/api/schedules/conflicts` - Conflict detection
   - Endpoints exist, complete

7. **AssignmentController.cs** (`/api/assignments`)
   - GET `/api/assignments` - List assignments
   - GET `/api/assignments/{id}` - Assignment detail
   - POST `/api/assignments` - Create assignment
   - PUT `/api/assignments/{id}` - Update assignment
   - DELETE `/api/assignments/{id}` - Delete assignment
   - Endpoints exist, complete

8. **AdminPermissionController.cs** (`/api/admin/users`)
   - GET `/api/admin/users` - List users
   - GET `/api/admin/users/{id}` - User detail
   - POST `/api/admin/users` - Create user
   - PUT `/api/admin/users/{id}` - Update user
   - DELETE `/api/admin/users/{id}` - Delete user
   - POST `/api/admin/users/{id}/reset-password` - Password reset
   - Endpoints exist, complete

9. **DeviceGroupController.cs** (`/api/devicegroups`)
   - GET `/api/devicegroups` - List device groups
   - GET `/api/devicegroups/{id}` - Device group detail
   - POST `/api/devicegroups` - Create device group
   - PUT `/api/devicegroups/{id}` - Update device group
   - DELETE `/api/devicegroups/{id}` - Delete device group
   - Endpoints exist, complete

10. **AnalyticsController.cs** (`/api/analytics`)
    - GET `/api/analytics/overview` - Analytics overview
    - GET `/api/analytics/devices` - Device analytics
    - GET `/api/analytics/media` - Media analytics
    - GET `/api/analytics/schedules` - Schedule analytics
    - Endpoints exist, complete

### ⚠️ Partially Implemented or Missing

11. **QRCodeController.cs** (`/api/qrcodes` or similar)
    - **Status**: MAY EXIST - Needs verification
    - **Required Endpoints**:
      - GET `/api/qrcodes` - List QR codes
      - POST `/api/qrcodes/generate` - Generate QR code
      - GET `/api/qrcodes/{id}/download` - Download QR image
      - DELETE `/api/qrcodes/{id}` - Delete QR code
    - **Action**: Verify existence, enhance if partial

12. **ReportsController.cs** (`/api/reports`)
    - **Status**: MAY EXIST - Needs verification
    - **Required Endpoints**:
      - GET `/api/reports` - List available reports
      - POST `/api/reports/generate` - Generate report
      - GET `/api/reports/{id}/export` - Export report (CSV/PDF)
      - GET `/api/reports/templates` - List report templates
    - **Action**: Verify existence, enhance if partial, create if missing

13. **SettingsController.cs** (`/api/settings`)
    - **Status**: LIKELY MISSING - Needs creation
    - **Required Endpoints**:
      - GET `/api/settings` - Get all settings
      - GET `/api/settings/{category}` - Get settings by category
      - PUT `/api/settings` - Update settings
      - POST `/api/settings/reset` - Reset to defaults
    - **Action**: Create new controller if missing

---

## Mock Service Analysis

### Confirmed Mock Services (TO REMOVE)

1. **mockMediaService.ts**
   - Location: `src/digital-signage-web/src/services/mockMediaService.ts`
   - Usage: Imported by `mediaService.ts` with `USE_MOCK_MEDIA_SERVICE` flag
   - Replacement: Real `MediaController` endpoints exist
   - Actions: Remove file, remove flag, remove conditional logic in `mediaService.ts`

2. **mockDeviceService.ts**
   - Location: `src/digital-signage-web/src/services/mockDeviceService.ts`
   - Replacement: Real `DevicesController` endpoints exist
   - Actions: Remove file, update `deviceService.ts` to use real API only

3. **mockPlaylistService.ts**
   - Location: `src/digital-signage-web/src/services/mockPlaylistService.ts`
   - Replacement: Real `PlaylistController` endpoints exist
   - Actions: Remove file, update `playlistService.ts` to use real API only

4. **mockScheduleService.ts**
   - Location: `src/digital-signage-web/src/services/mockScheduleService.ts`
   - Replacement: Real `ScheduleController` endpoints exist
   - Actions: Remove file, update `scheduleService.ts` to use real API only

5. **mockDashboardService.ts**
   - Location: `src/digital-signage-web/src/services/mockDashboardService.ts`
   - Replacement: Real `DashboardController` endpoints exist
   - Actions: Remove file, update `dashboardService.ts` to use real API only

---

## API Integration Patterns

### Pattern 1: Service Layer with apiClient

**✅ CORRECT Pattern** (Always use this):

```typescript
// src/services/mediaService.ts
import { apiClient } from '@/lib/api';

export interface MediaItem {
  id: number;
  name: string;
  type: string;
  // ... matches backend MediaDto
}

export const getMedia = async (): Promise<MediaItem[]> => {
  try {
    console.log('Fetching media from API...');
    const response = await apiClient.get('/api/media');
    
    // Guard against unexpected response format
    const dataArray = Array.isArray(response.data) ? response.data : [];
    
    return dataArray.map((media: any) => ({
      id: media.id || 0,
      name: media.name || 'Untitled',
      type: media.type || 'unknown',
      url: media.url || '',
      // ... all fields with defaults
    }));
  } catch (error) {
    console.error('Error fetching media:', error);
    throw error;
  }
};
```

**❌ INCORRECT Pattern** (Never do this):

```typescript
// ❌ Don't import axios directly
import axios from 'axios';

// ❌ Don't use mock flags
if (USE_MOCK_SERVICE) {
  return mockService.getData();
}

// ❌ Don't assume response structure without guards
return response.data.map(...); // Might not be array!

// ❌ Don't skip null checks
name: media.name, // Should be: media.name || 'Default'
```

### Pattern 2: Backend API Response Mapping

**Backend Controller Pattern**:
```csharp
[HttpGet]
[ProducesResponseType(typeof(IEnumerable<MediaDto>), StatusCodes.Status200OK)]
public async Task<ActionResult<IEnumerable<MediaDto>>> GetMedia()
{
    var media = await _mediaService.GetAllMediaAsync();
    return Ok(media);
}
```

**Frontend Handling**:
```typescript
// Backend returns IEnumerable<MediaDto> directly
// response.data is an array of MediaDto objects
const dataArray = Array.isArray(response.data) ? response.data : [];
```

### Pattern 3: Search/Filter/Sort/Pagination

**Backend Query Parameters**:
```csharp
[HttpGet]
public async Task<ActionResult<IEnumerable<MediaDto>>> GetMedia(
    [FromQuery] string? search = null,
    [FromQuery] string? type = null,
    [FromQuery] string? sortBy = "name",
    [FromQuery] string? order = "asc",
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20)
{
    // Backend filtering, sorting, pagination
}
```

**Frontend Service Call**:
```typescript
export const getMedia = async (params: {
  search?: string;
  type?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<MediaItem[]> => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.type) queryParams.append('type', params.type);
  // ... add all params
  
  const response = await apiClient.get(`/api/media?${queryParams}`);
  return mapResponseToMediaItems(response.data);
};
```

### Pattern 4: Form Submission with Validation

**Frontend Form**:
```typescript
const handleSubmit = async (data: MediaFormData) => {
  try {
    setLoading(true);
    const response = await mediaService.createMedia(data);
    toast.success('Media created successfully');
    router.push(`/media/${response.id}`);
  } catch (error: any) {
    // API validation errors
    if (error.response?.data?.errors) {
      setFormErrors(error.response.data.errors);
    } else {
      toast.error('Failed to create media');
    }
  } finally {
    setLoading(false);
  }
};
```

**Backend Validation**:
```csharp
[HttpPost]
[ProducesResponseType(typeof(MediaDto), StatusCodes.Status201Created)]
[ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
public async Task<ActionResult<MediaDto>> CreateMedia([FromBody] CreateMediaRequest request)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);
    
    var media = await _mediaService.CreateMediaAsync(request);
    return CreatedAtAction(nameof(GetMedia), new { id = media.Id }, media);
}
```

### Pattern 5: Multi-Step Wizard Integration

**Frontend Wizard State**:
```typescript
const [wizardStep, setWizardStep] = useState(1);
const [wizardData, setWizardData] = useState<Partial<AssignmentData>>({});

// Step 1: API call for target selection
const loadTargets = async () => {
  const devices = await deviceService.getDevices();
  const groups = await deviceGroupService.getDeviceGroups();
  return { devices, groups };
};

// Step 2: API call for content selection
const loadContent = async () => {
  const media = await mediaService.getMedia();
  const playlists = await playlistService.getPlaylists();
  return { media, playlists };
};

// Final step: Submit complete wizard data
const submitWizard = async () => {
  await assignmentService.createAssignment(wizardData);
};
```

---

## Page Action Audit Checklist

For each menu page, audit these action types:

### 1. **Page Load Actions**
- [ ] Initial data fetch calls real API (no mock)
- [ ] Loading state shows during API call
- [ ] Error state handles API failures
- [ ] Data binding matches API response structure

### 2. **Search Actions**
- [ ] Search input triggers API call (debounced)
- [ ] Query parameter sent to backend
- [ ] Backend performs search (no client-side only)
- [ ] Results update from API response

### 3. **Filter Actions**
- [ ] Filter dropdowns populated from API
- [ ] Filter selections call API with parameters
- [ ] Backend performs filtering
- [ ] Results reflect backend filter execution

### 4. **Sort Actions**
- [ ] Sort column headers call API with sort params
- [ ] Backend performs sorting
- [ ] UI updates with sorted results from API

### 5. **Pagination Actions**
- [ ] Pagination controls call API with page/pageSize
- [ ] Backend performs pagination
- [ ] Page navigation fetches new data from API

### 6. **Create Actions**
- [ ] "Create" button opens form/modal
- [ ] Form dropdowns fetch options from API
- [ ] Form validation calls backend validation API (if applicable)
- [ ] "Save" button calls POST API endpoint
- [ ] Success/error feedback from API response
- [ ] UI updates with new data from API

### 7. **Edit Actions**
- [ ] "Edit" button fetches current data from API
- [ ] Form pre-populated with API data
- [ ] "Update" button calls PUT/PATCH API endpoint
- [ ] Changes persist to database
- [ ] UI reflects updated data from API

### 8. **Delete Actions**
- [ ] "Delete" button shows confirmation dialog
- [ ] Confirmation calls DELETE API endpoint
- [ ] Record removed from database
- [ ] UI updates to remove deleted item

### 9. **Bulk Actions**
- [ ] Bulk select checkboxes
- [ ] Bulk action button enabled when items selected
- [ ] Bulk operation calls API (single or batch endpoint)
- [ ] Progress indicator for bulk operation
- [ ] UI updates after bulk operation completes

### 10. **Export/Download Actions**
- [ ] Export button calls API to generate file
- [ ] Download initiated from API response (presigned URL or blob)
- [ ] File format (CSV, PDF, etc.) handled by backend

---

## Data Binding Validation Checklist

For each service method, ensure:

### TypeScript Interface Matches Backend DTO

**Backend C# DTO**:
```csharp
public class MediaDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; } // Nullable
    public string Type { get; set; }
    public string Url { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**Frontend TypeScript Interface**:
```typescript
export interface MediaItem {
  id: number;
  name: string;
  description: string | null; // Match nullability
  type: string;
  url: string;
  createdAt: string; // DateTime serialized to ISO string
}
```

### Response Mapping with Guards

```typescript
const mapMediaDto = (dto: any): MediaItem => ({
  id: dto.id || 0,                        // Default for missing
  name: dto.name || 'Untitled',           // Default for null/undefined
  description: dto.description || null,   // Explicit null handling
  type: dto.type || 'unknown',
  url: dto.url || '',
  createdAt: dto.createdAt || new Date().toISOString(),
});

export const getMedia = async (): Promise<MediaItem[]> => {
  const response = await apiClient.get('/api/media');
  
  // Guard against non-array response
  if (!Array.isArray(response.data)) {
    console.warn('Expected array response, got:', typeof response.data);
    return [];
  }
  
  return response.data.map(mapMediaDto);
};
```

---

## Backend Enhancement Guidelines

### When to Enhance vs Create

**Enhance Existing** when:
- Controller exists but missing endpoints (e.g., only GET, need POST/PUT/DELETE)
- Endpoint exists but doesn't support required parameters (e.g., no search/filter)
- Response format incomplete (e.g., missing pagination metadata)

**Create New** when:
- No controller exists for the entity/feature
- Entirely new functionality required
- Complex operations need dedicated service layer

### Clean Architecture Pattern

**1. Domain Entity** (if new):
```csharp
// src/DigitalSignage.Domain/Entities/Setting.cs
public class Setting : BaseEntity
{
    public string Category { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
}
```

**2. Application DTO**:
```csharp
// src/DigitalSignage.Application/DTOs/SettingDto.cs
public class SettingDto
{
    public int Id { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
}
```

**3. Application Service**:
```csharp
// src/DigitalSignage.Application/Services/SettingsService.cs
public class SettingsService : ISettingsService
{
    private readonly ISettingsRepository _repository;
    private readonly ILogger<SettingsService> _logger;
    
    public SettingsService(ISettingsRepository repository, ILogger<SettingsService> logger)
    {
        _repository = repository;
        _logger = logger;
    }
    
    public async Task<IEnumerable<SettingDto>> GetAllSettingsAsync()
    {
        var settings = await _repository.GetAllAsync();
        return settings.Select(MapToDto);
    }
    
    private SettingDto MapToDto(Setting entity) => new SettingDto { /* mapping */ };
}
```

**4. API Controller**:
```csharp
// src/DigitalSignage.Api/Controllers/SettingsController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;
    
    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }
    
    /// <summary>
    /// Get all settings
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<SettingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<SettingDto>>> GetSettings()
    {
        var settings = await _settingsService.GetAllSettingsAsync();
        return Ok(settings);
    }
}
```

**5. Service Registration**:
```csharp
// src/DigitalSignage.Api/Extensions/ApplicationServiceExtensions.cs
public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<ISettingsService, SettingsService>();
        // ... other services
        return services;
    }
}
```

---

## Decision Log

### Decision 1: Menu Priority Order
**Decision**: Process menus in admin importance order (Dashboard → Devices → Media → Device Registrations → etc.)  
**Rationale**: Ensures most critical functionality is verified first, allows early detection of high-impact issues  
**Alternatives Considered**: Alphabetical order (rejected - not based on importance), Complexity order (rejected - not user-centric)

### Decision 2: Service Layer Pattern
**Decision**: All services must use `apiClient` from `/lib/api.ts`, no direct axios imports  
**Rationale**: Centralized authentication, error handling, request/response interceptors  
**Alternatives Considered**: Direct axios per service (rejected - duplicates auth logic), Fetch API (rejected - less features than axios)

### Decision 3: Mock Elimination Strategy
**Decision**: Remove mock files entirely, not just disable via flags  
**Rationale**: Prevents accidental re-enable, reduces codebase size, clearer intent  
**Alternatives Considered**: Keep files but disable (rejected - technical debt), Feature flags (rejected - adds complexity)

### Decision 4: Testing Approach
**Decision**: Manual testing only, skip automated test creation per user request  
**Rationale**: User explicitly requested skipping test phase, focus on implementation speed  
**Alternatives Considered**: TDD approach (rejected - user constraint), Integration tests only (rejected - still tests)

### Decision 5: Data Binding Validation
**Decision**: Always use Array.isArray() guards, provide default values, match TypeScript interfaces to C# DTOs  
**Rationale**: Prevents runtime errors from unexpected API responses, improves robustness  
**Alternatives Considered**: Trust API always returns correct format (rejected - too risky), Try-catch only (rejected - doesn't prevent mapping errors)

### Decision 6: Backend Enhancement First
**Decision**: Check and enhance existing APIs before creating new ones  
**Rationale**: User requirement "recheck เส้นจาก api ก่อน ถ้ามีก็ enhance ให้ support ถ้าไม่มี ค่อยเพิ่ม"  
**Alternatives Considered**: Create all new endpoints (rejected - duplicates existing), Ignore existing (rejected - violates requirement)

---

## Conclusion

This research establishes:

1. ✅ **Menu Priority**: 14 menus organized into 4 tiers by admin importance
2. ✅ **API Status**: 10 controllers fully implemented, 3 need verification/enhancement
3. ✅ **Mock Services**: 5 confirmed mock services to remove
4. ✅ **Integration Patterns**: 5 documented patterns for API integration
5. ✅ **Audit Checklists**: 10 action types and data binding validation checklist
6. ✅ **Backend Guidelines**: Clean Architecture patterns for enhancements

**Ready for Phase 1**: Design & Contracts
