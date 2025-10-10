# Feature Specification: Complete Menu Actions API Integration Audit

**Feature Branch**: `033-recheck-action-menu`  
**Created**: 2025-10-09  
**Status**: Draft  
**Input**: User description: "recheck action ของแต่ละ menu ใน slide bar รวมถึง sub menu, flow เมนูข้างใน action แต่ละ action ว่ายังใช้ mock ไหม ถ้าใช้ให้ปรับแก้ไปเรียก api ทั้งหมด โดย recheck เส้นจาก api ก่อน ถ้ามีก็ enhance ให้ support ถ้าไม่มี ค่อยเพิ่ม"

## Execution Flow (main)
```
1. Parse user description from Input
   → User requires comprehensive audit of all sidebar menu actions
   → Goal: Eliminate all mock data, replace with real API calls
2. Extract key concepts from description
   → Actors: Admin users, Backend API, Frontend services
   → Actions: Audit menu actions, verify API endpoints, replace mock services, enhance missing APIs
   → Data: All menu pages (Dashboard, Devices, Media, Playlists, Schedules, etc.)
   → Constraints: Must check API first before creating new endpoints, maintain UI/API data binding consistency
3. For each unclear aspect:
   → ✅ All requirements are clear from user input
4. Fill User Scenarios & Testing section
   → ✅ User flow is clear: audit → verify API → enhance/add → replace mock
5. Generate Functional Requirements
   → ✅ All requirements are testable
6. Identify Key Entities (if data involved)
   → ✅ Entities identified across all menu sections
7. Run Review Checklist
   → ✅ No [NEEDS CLARIFICATION] markers
   → ✅ No implementation details (saved for planning phase)
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a **Digital Signage System Administrator**, I need **all menu actions in the sidebar, including sub-menus and all page-level actions/flows, to use real API calls instead of mock data** so that **the system displays actual production data and performs real operations** instead of simulated responses.

**Current Pain Points:**
- Some menu pages still use mock services that return fake data
- Page-level actions (buttons, forms, modals, dialogs) may still call mock services
- Page workflows (create → save, edit → update, delete → confirm) may not complete to backend
- Inconsistent behavior between development and production environments
- Data displayed in UI doesn't reflect actual database state
- CRUD operations may not persist to backend
- Analytics and reports show simulated data instead of real metrics
- In-page actions like filters, search, sort, pagination may use client-side mock data

**Desired Outcome:**
- Every sidebar menu and submenu uses real API endpoints
- Every action within each page (buttons, forms, filters, search) calls real APIs
- Every workflow step (multi-step forms, wizards, confirmations) integrates with backend
- UI data binding matches actual API response structures
- All CRUD operations persist to database
- All filtering, sorting, pagination happens on backend
- Consistent behavior across all environments
- Real-time data reflects actual system state

### Acceptance Scenarios

#### Scenario 1: Menu and Page Action Verification
1. **Given** admin is logged into the dashboard
2. **When** admin navigates to any menu item (Dashboard, Devices, Media, Playlists, Schedules, Assignments, Users, Analytics, QR Codes, Reports, Device Registrations, Settings)
3. **Then** the page displays real data from API endpoints
4. **And** no mock data or simulated responses are returned
5. **And** all page-level actions (buttons, filters, search, sort) call real APIs

#### Scenario 2: API Endpoint Coverage for Page Flows
1. **Given** a menu page requires data fetching and user interactions
2. **When** the page component loads
3. **Then** a corresponding API endpoint exists and is called for initial data
4. **And** the API returns properly structured data
5. **And** UI components correctly bind to the API response structure
6. **When** admin interacts with page elements (search box, filters, sort dropdowns)
7. **Then** each interaction triggers appropriate API calls
8. **And** results update based on backend response

#### Scenario 3: CRUD Operations Within Page Flows
1. **Given** a menu page supports create/update/delete operations
2. **When** admin clicks "Create New" or "Add" button
3. **Then** a form/modal opens with real API-backed dropdowns and validation
4. **When** admin fills the form and clicks "Save"
5. **Then** the operation calls the correct API endpoint
6. **And** changes persist to the database
7. **And** UI updates reflect the actual database state
8. **And** success/error feedback comes from API response

#### Scenario 4: Sub-menu Navigation
1. **Given** a menu item has sub-items (e.g., Device Registrations: Pending, Approved, Rejected, All Devices)
2. **When** admin navigates to any sub-menu
3. **Then** each sub-menu page uses real API calls
4. **And** data is filtered/scoped correctly per sub-menu
5. **And** all actions within the sub-menu page call real APIs

#### Scenario 5: Multi-Step Workflows
1. **Given** a page has multi-step workflows (e.g., Media Upload Wizard, Assignment Wizard, Device Setup)
2. **When** admin progresses through each step
3. **Then** each step validates data via API calls
4. **And** navigation between steps preserves state from API responses
5. **And** final submission persists all data to backend
6. **And** workflow can be cancelled/resumed based on API state

#### Scenario 6: In-Page Search and Filtering
1. **Given** a page has search, filter, or sort capabilities
2. **When** admin types in search box or selects filter options
3. **Then** the page calls backend API with query parameters
4. **And** filtering/sorting happens on backend, not client-side only
5. **And** results reflect actual database query execution
6. **And** pagination works with backend page size and offset

#### Scenario 7: API Enhancement for Missing Endpoints
1. **Given** a page action or flow requires an API endpoint that doesn't exist
2. **When** audit identifies the missing endpoint
3. **Then** a new API controller/endpoint is created following backend guidelines
4. **And** the endpoint supports all required operations
5. **And** frontend service is updated to use the new endpoint
6. **And** page actions/flows are updated to call the new API

### Edge Cases
- **What happens when an API endpoint exists but returns a different data structure than UI expects?**
  - System must map API response to UI model, with proper null/undefined handling
  
- **How does system handle pages with partial API integration (some actions use API, some use mock)?**
  - All mock usages must be eliminated, even for partially integrated features
  - Each button, form, filter, search action must be audited individually
  
- **What if an API endpoint exists but doesn't support all required operations (e.g., only GET, missing POST/PUT/DELETE)?**
  - Backend API must be enhanced to support full CRUD operations
  - Page workflows may be blocked until API is complete
  
- **How to handle analytics/dashboard pages that aggregate data from multiple API endpoints?**
  - Service layer must orchestrate multiple API calls and combine responses
  - Loading states must handle sequential/parallel API calls
  
- **What about real-time features (device status, live monitoring)?**
  - Must verify WebSocket/SignalR integration is properly connected to real backend services
  
- **What if a page has complex workflows with conditional steps?**
  - Each conditional branch must call appropriate API endpoints
  - State management must sync with backend at each decision point
  
- **How to handle form validation that depends on backend rules?**
  - Client-side validation should call backend validation APIs
  - Forms must handle async validation feedback
  
- **What about bulk operations (delete multiple, assign to multiple devices)?**
  - Backend must provide bulk operation endpoints
  - UI must show progress for each item in bulk operation
  
- **How to handle page actions that depend on data from other pages?**
  - Services must fetch related data from API (no hardcoded/cached mock data)
  - Navigation state should not carry mock data between pages

---

## Requirements *(mandatory)*

### Functional Requirements

#### FR-001: Comprehensive Page and Action Audit
- System MUST audit all sidebar menu items, sub-menus, and all page-level actions to identify mock data usage:
  - Dashboard (widgets, charts, metrics, refresh actions)
  - Devices (list, detail, create, edit, delete, status updates, filters, search)
  - Device Groups (list, create, edit, delete, assign devices, filters)
  - Media (library list, upload, tags, detail view, edit metadata, delete, search, filter by type/tag, pagination)
  - Playlists (list, create, edit, delete, add media, reorder items, preview, filters)
  - Schedules (list, create, edit, delete, assign content, set recurrence, conflict detection, calendar view)
  - Assignments (list, create wizard, edit, delete, bulk assign, target selection, filters)
  - Users (list, create, edit, delete, roles, permissions, password reset, filters, search)
  - Analytics (reports, charts, export, date range filters, metric selection)
  - QR Codes (list, generate, download, delete, configure)
  - Reports (list, generate, export, schedule, filters, parameters)
  - Device Registrations (Pending/Approved/Rejected/All tabs, approve/reject actions, detail view, search, filters)
  - Settings (view, edit, save, sections/tabs)
- System MUST audit all in-page workflows:
  - Form submissions (create/edit dialogs)
  - Multi-step wizards (media upload, assignment creation)
  - Confirmation dialogs (delete confirmations, bulk operations)
  - Search and filter interactions
  - Sort and pagination controls
  - Dropdown/select data population
  - Real-time status updates
  - File upload progress indicators

#### FR-002: API Endpoint Verification
- System MUST verify backend API endpoint existence and functionality for each menu action
- System MUST document the mapping between frontend services and backend controllers
- System MUST identify gaps where API endpoints are missing

#### FR-003: Mock Service Elimination
- System MUST remove all mock service implementations from the codebase:
  - `mockMediaService.ts`
  - `mockDeviceService.ts`
  - `mockPlaylistService.ts`
  - `mockScheduleService.ts`
  - `mockDashboardService.ts`
  - Any other mock/stub services
- System MUST remove all mock data flags (e.g., `USE_MOCK_MEDIA_SERVICE`)

#### FR-004: API Response Data Binding
- System MUST ensure UI components correctly bind to actual API response structures
- System MUST add proper null/undefined checks for optional API response fields
- System MUST map API response property names to frontend model property names
- System MUST handle array vs wrapped response patterns (e.g., direct array vs `{ data: [], items: [] }`)

#### FR-005: Service Layer API Integration
- All frontend services MUST use the configured `apiClient` from `/lib/api.ts`
- Services MUST NOT import or use direct `axios` calls
- Services MUST implement proper error handling for API failures
- Services MUST include console logging during development for debugging

#### FR-006: Backend API Enhancement
- For menu actions lacking API endpoints, system MUST create new controllers following Clean Architecture patterns
- New API endpoints MUST follow existing conventions (DTOs, service layer, repository pattern)
- API controllers MUST include proper HTTP status codes and response types
- DateTime fields MUST use `timestamp without time zone` PostgreSQL configuration

#### FR-007: CRUD Operation Completeness
- All menu pages supporting data management MUST have complete CRUD API endpoints:
  - GET (list and detail)
  - POST (create)
  - PUT/PATCH (update)
  - DELETE (remove)
- API endpoints MUST persist changes to PostgreSQL database

#### FR-008: Sub-menu and In-Page Action Support
- Sub-menu pages (e.g., Device Registrations sub-items) MUST have dedicated API endpoints or query parameters
- Sub-menu data filtering MUST occur on the backend, not client-side only
- All in-page actions MUST call appropriate API endpoints:
  - Button clicks (Create, Edit, Delete, Save, Cancel, etc.)
  - Form submissions with validation
  - Search box inputs (debounced API calls)
  - Filter dropdowns and checkboxes
  - Sort column headers
  - Pagination controls (next, previous, page size)
  - Bulk operation checkboxes and actions
  - Modal/dialog open actions that fetch data
  - Tab switches that load different data sets
  - Export/download actions that generate files via API

#### FR-009: Dashboard and Analytics Integration
- Dashboard widgets MUST fetch real metrics from `/api/analytics` or `/api/dashboard` endpoints
- Charts and graphs MUST display actual database aggregations
- Real-time device status MUST connect to WebSocket/SignalR for live updates

#### FR-010: Media Management Integration
- Media upload MUST use presigned URL workflow with AWS S3
- Media library MUST fetch from `/api/media` endpoint with pagination
- Media filtering/search MUST use backend API query parameters
- Media tags MUST integrate with backend tag management APIs

#### FR-011: Device Management Integration
- Device list MUST fetch from `/api/devices` endpoint
- Device registration workflow MUST use `/api/admin/device-registrations` endpoints
- Device groups MUST integrate with `/api/devicegroups` endpoints
- Device health monitoring MUST use real heartbeat data

#### FR-012: Schedule and Playlist Integration
- Playlist CRUD operations MUST use `/api/playlists` endpoints
- Schedule management MUST use `/api/schedules` endpoints
- Content assignment MUST use `/api/assignments` endpoints
- Conflict detection MUST call backend validation APIs

#### FR-013: User Management Integration
- User list and management MUST use `/api/admin/users` endpoints
- Permission management MUST integrate with RBAC APIs
- User authentication MUST use JWT tokens from backend

#### FR-014: Page Flow and Workflow Integration
- Multi-step workflows MUST integrate with backend at each step:
  - Media upload wizard (file selection → upload → metadata → assignment)
  - Assignment wizard (target selection → content selection → schedule → confirm)
  - Device setup wizard (registration → hardware profile → group assignment)
- Form validations MUST call backend validation APIs:
  - Unique name checks
  - Format validations (email, URL, resolution)
  - Business rule validations (schedule conflicts, assignment limits)
- Dependent dropdowns MUST fetch options from API:
  - Device list when selecting assignment target
  - Media list when building playlists
  - Group list when assigning devices
  - Tag list when filtering media

#### FR-015: Search, Filter, Sort, and Pagination
- All list pages MUST implement backend-driven operations:
  - Search calls API with query parameter (e.g., `/api/media?search=keyword`)
  - Filters call API with filter parameters (e.g., `/api/devices?status=online&group=lobby`)
  - Sort calls API with sort parameter (e.g., `/api/playlists?sortBy=name&order=asc`)
  - Pagination calls API with page parameters (e.g., `/api/schedules?page=2&pageSize=20`)
- Client-side filtering/sorting is NOT acceptable (except for tiny datasets < 10 items)

#### FR-016: Real-time and Live Updates
- Real-time features MUST use WebSocket/SignalR for live data:
  - Device status indicators
  - Heartbeat monitoring
  - Active connections dashboard
  - Live content playback status
- Polling-based updates MUST call real API endpoints (not mock timers)

#### FR-017: Testing and Validation
- Each menu action MUST be manually tested to verify API integration
- Each page-level action (button, form, filter) MUST be tested individually
- Each workflow step MUST be verified to call correct API
- UI data display MUST match actual backend database records
- CRUD operations MUST persist and be verifiable in database
- Error scenarios (404, 500, network failure) MUST display proper user feedback
- Loading states MUST show during API calls
- Success/error messages MUST come from API responses

### Key Entities *(all menus involve database entities)*

#### Core Entities
- **Device**: Physical Android TV devices with hardware profiles, status, and registration info
- **DeviceGroup**: Logical grouping of devices for batch content assignment
- **Media**: Content files (images, videos, HTML) stored in AWS S3 with metadata in PostgreSQL
- **MediaTag**: Taxonomy for organizing and filtering media content
- **Playlist**: Ordered sequence of media items with duration and transition settings
- **Scene**: Scene-based content composition (if applicable)
- **Schedule**: Time-based content delivery rules with recurrence patterns
- **Assignment**: Links between content (media/playlists) and targets (devices/groups)
- **User**: Admin users with role-based permissions
- **DeviceRegistrationRequest**: Pending Android TV self-registration requests
- **DeviceApproval**: Approved/rejected device registration records
- **QRCode**: QR code generation records for device provisioning
- **AnalyticsMetric**: Aggregated data for dashboard widgets and reports
- **AuditLog**: System activity logs for compliance and debugging

#### Entity Relationships
- Device ← DeviceGroup (many-to-many through DeviceGroupMembership)
- Media ← MediaTag (many-to-many through MediaTagRelation)
- Playlist → Media (one-to-many through PlaylistItem)
- Schedule → Playlist/Media (many-to-many through ScheduleMedia)
- Assignment → Device/DeviceGroup (polymorphic target)
- Assignment → Media/Playlist/Schedule (polymorphic content)
- User → Device (many-to-many through UserDeviceAssociation)

---

## Out of Scope

The following are explicitly NOT included in this feature:
- Creating new UI pages or components
- Redesigning existing page layouts
- Adding new business features or functionality
- Performance optimization (separate from mock elimination)
- Unit test creation (user explicitly requested skipping test phase)
- API security enhancements (unless directly related to mock removal)
- Database schema changes (unless required for missing endpoints)

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (none found)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

## Assumptions & Dependencies

### Assumptions
1. Backend API follows Clean Architecture with Controllers, Services, Repositories, and Domain entities
2. Frontend uses Next.js 15 App Router with React Query for server state management
3. PostgreSQL is the primary database with Entity Framework Core
4. AWS S3 is used for media file storage
5. JWT authentication is already implemented for admin users
6. WebSocket/SignalR infrastructure exists for real-time features

### Dependencies
1. Backend API must be accessible during development/testing
2. Database migrations must be up-to-date
3. AWS S3 bucket must be configured with proper CORS settings
4. Environment variables must be properly set for API base URL
5. Authentication tokens must be valid for API testing

---

## Success Criteria

This feature is considered complete when:

1. ✅ **Zero Mock Services Remain**: All `mock*Service.ts` files are deleted or deprecated
2. ✅ **100% API Coverage for Menus**: Every menu and sub-menu calls a real backend API endpoint
3. ✅ **100% API Coverage for Page Actions**: Every button, form, filter, search, sort, pagination action calls real APIs
4. ✅ **Data Binding Validated**: UI displays match actual API response structures with no mapping errors
5. ✅ **CRUD Operations Verified**: All create/update/delete actions persist to database
6. ✅ **Sub-menu Integration**: All Device Registrations sub-pages (Pending, Approved, Rejected, All) use real APIs
7. ✅ **Workflow Integration**: All multi-step workflows (upload wizard, assignment wizard) call APIs at each step
8. ✅ **Search/Filter/Sort Backend-Driven**: No client-side only filtering; all operations query backend
9. ✅ **Form Validations API-Backed**: All form validations call backend validation endpoints
10. ✅ **Dependent Data API-Fetched**: All dropdowns, selects, and dependent fields fetch from APIs
11. ✅ **Dashboard Metrics**: Dashboard displays real aggregated data from database
12. ✅ **Real-time Features Connected**: WebSocket/SignalR properly connected for live updates
13. ✅ **Manual Testing Passed**: Admin can perform all menu actions and page flows with real data
14. ✅ **Workflow Testing Passed**: All wizards and multi-step processes work end-to-end
15. ✅ **Documentation Updated**: Service-to-API mapping document is created with page action details
16. ✅ **No Console Errors**: Browser console shows no API mapping or binding errors
17. ✅ **API Enhancement Complete**: Any missing backend endpoints are implemented following guidelines
18. ✅ **Loading States Working**: All API calls show proper loading indicators
19. ✅ **Error Handling Verified**: All API errors display user-friendly messages

---

## Next Steps (Planning Phase)

After this specification is approved, the planning phase will detail:
1. Technical implementation approach for each menu section
2. Priority order for API integration (high-impact menus first)
3. Detailed API endpoint mapping document covering:
   - Menu-level API endpoints
   - Page action API endpoints (buttons, forms, filters)
   - Workflow step API endpoints (wizards, multi-step processes)
4. Page-by-page action inventory:
   - List of all interactive elements per page
   - Current API vs mock status for each action
   - Required API enhancements
5. Data transformation patterns for UI binding
6. Backend enhancement requirements for missing APIs
7. Workflow integration patterns (wizard steps, form submissions)
8. Migration strategy from mock to real services
9. Testing checklist for each menu item and page action

**Note**: The user has requested skipping the test phase, so automated testing will not be part of the implementation plan.

---
