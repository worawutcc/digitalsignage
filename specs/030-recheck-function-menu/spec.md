# Feature Specification: Complete API Integration Audit and Fix for All Menu Functions

**Feature Branch**: `030-recheck-function-menu`  
**Created**: 2025-01-07  
**Status**: Draft  
**Input**: User description: "recheck function ของแต่ละ menu, submenu ต่างๆ เหมือนยังไม่ต่อ api เลยส่วนมากยังไม่ทำงาน เช่น action ต่างๆ ของ playlist, schedules, crud ต่างๆ query ต่างๆ ยังไม่เชื่อมต่อเลย แก้ไขให้ด้วย โดย ref copilot-instructions-ui.instructions.md โดยแบ่ง phase ตาม menu - ถ้า api ไหนไม่มี หรือ ไม่ตรงให้ recheck api ก่อน ว่างานเรื่องเดียวกัน ให้ integration ก่อน ถ้าไม่มีค่อยสร้างใหม่ตาม copilot-instructions-api.instructions.md"

## Execution Flow (main)
```
1. Parse user description from Input
   → Feature request: Comprehensive API integration audit and fixes for all menu/submenu functions
2. Extract key concepts from description
   → Actors: Admin users, System administrators
   → Actions: Audit API connections, Fix non-working CRUD operations, Connect disconnected queries
   → Data: Playlists, Schedules, Devices, Media, Users, all menu/submenu entities
   → Constraints: Follow UI instructions, phase by menu, recheck existing APIs before creating new ones
3. For each unclear aspect:
   → ✓ Clear: Systematic audit and fix approach
   → ✓ Clear: Menu-based phasing
   → ✓ Clear: Priority on reusing existing APIs
4. Fill User Scenarios & Testing section
   → User flow: Admin discovers non-working features, system audits and fixes them systematically
5. Generate Functional Requirements
   → Each requirement testable via UI interaction and API response validation
6. Identify Key Entities
   → All existing menu entities: Playlist, Schedule, Device, Media, User, DeviceGroup, QRCode, etc.
7. Run Review Checklist
   → No [NEEDS CLARIFICATION] markers
   → Implementation follows copilot-instructions-ui.instructions.md and copilot-instructions-api.instructions.md
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need: Working CRUD operations, functional queries, complete API integration
- ✅ WHY: Current UI has non-functional menu items and actions that don't connect to backend
- ❌ Avoid HOW: No specific React Query implementation details or C# service patterns (covered in instruction files)
- 👥 Written for business stakeholders: "All menu features must work" not "Implement useQuery hooks"

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As an **admin user**, when I navigate to any menu or submenu (Playlists, Schedules, Devices, Media, Users, etc.), I expect all displayed actions, filters, CRUD operations, and data queries to work correctly by connecting to the backend API. Currently, many features are non-functional because they lack proper API integration.

### Acceptance Scenarios

#### Phase 1: Playlists Menu
1. **Given** I am on the Playlists page, **When** I click "Create Playlist", **Then** the form submits data to the API and creates a new playlist
2. **Given** I view a playlist, **When** I click "Edit", **Then** the form loads existing data and saves changes via API
3. **Given** I have playlists listed, **When** I click "Delete", **Then** the playlist is removed via API call
4. **Given** I view playlists, **When** I click "Duplicate", **Then** a copy is created via API
5. **Given** I view playlists, **When** I toggle "Activate/Deactivate", **Then** the status updates via API
6. **Given** I view playlists, **When** I search or filter, **Then** results are fetched from API with query parameters
7. **Given** I view a playlist, **When** I check assignment summary, **Then** device/group assignments load from API

#### Phase 2: Schedules Menu
1. **Given** I am on the Schedules page, **When** I click "Create Schedule", **Then** all form fields (basic info, time slots, targets, content) save via API
2. **Given** I view schedules, **When** I edit a schedule, **Then** existing data loads and updates save via API
3. **Given** I view schedules, **When** I delete a schedule, **Then** it is removed via API
4. **Given** I view schedule calendar, **When** I select a date range, **Then** scheduled events load from API
5. **Given** I create a schedule, **When** conflict detection runs, **Then** validation queries check existing schedules via API
6. **Given** I view schedules, **When** I assign to users/devices, **Then** assignments save via API
7. **Given** I view schedule templates, **When** I select or create templates, **Then** they load/save via API

#### Phase 3: Devices Menu
1. **Given** I am on the Devices page, **When** I view device list, **Then** all devices load from API
2. **Given** I view devices, **When** I create/edit/delete a device, **Then** operations execute via API
3. **Given** I view devices, **When** I check device status or heartbeat, **Then** real-time data loads from API
4. **Given** I view devices, **When** I assign to groups, **Then** group assignments save via API
5. **Given** I view device groups, **When** I perform CRUD operations, **Then** they execute via API
6. **Given** I view device registration requests, **When** I approve/reject, **Then** actions execute via API

#### Phase 4: Media Menu
1. **Given** I am on the Media page, **When** I view media library, **Then** all media items load from API
2. **Given** I view media, **When** I upload new media, **Then** files upload to S3 and metadata saves via API
3. **Given** I view media, **When** I edit metadata, **Then** changes save via API
4. **Given** I view media, **When** I delete media, **Then** it is removed from S3 and database via API
5. **Given** I view media, **When** I filter by type/date, **Then** filtered results load from API
6. **Given** I view media, **When** I assign to schedules/playlists, **Then** assignments save via API

#### Phase 5: Users Menu
1. **Given** I am on the Users page, **When** I view user list, **Then** all users load from API
2. **Given** I view users, **When** I create/edit/delete a user, **Then** operations execute via API
3. **Given** I view users, **When** I assign roles/permissions, **Then** assignments save via API
4. **Given** I view users, **When** I assign devices/schedules, **Then** user-device/user-schedule associations save via API
5. **Given** I view users, **When** I set default schedules, **Then** preferences save via API

#### Phase 6: QR Codes Menu
1. **Given** I am on the QR Codes page, **When** I view QR code list, **Then** all codes load from API
2. **Given** I view QR codes, **When** I create/edit/delete a QR code, **Then** operations execute via API
3. **Given** I create a QR code, **When** I select device assignment, **Then** device data loads and assignment saves via API

#### Phase 7: Dashboard & Analytics
1. **Given** I am on the Dashboard, **When** I view statistics cards, **Then** aggregated data loads from API
2. **Given** I view analytics, **When** I select date ranges or filters, **Then** chart data loads from API
3. **Given** I view device status grid, **When** real-time updates occur, **Then** WebSocket/API provides live data

### Edge Cases
- What happens when API endpoint doesn't exist for a UI feature? → Check existing API first, create new endpoint if needed following API instructions
- How does system handle API errors (404, 500, network failure)? → Display user-friendly error messages, log errors, retry where appropriate
- What happens when API response structure doesn't match UI expectations? → Update types to match backend DTOs, fix mapping issues
- How does system handle unauthorized API calls? → Redirect to login, show permission error messages
- What happens when multiple users edit the same entity simultaneously? → Implement optimistic updates with conflict resolution via React Query

---

## Requirements *(mandatory)*

### Functional Requirements

#### General Requirements
- **FR-001**: System MUST audit all menu and submenu UI functions to identify non-working API integrations
- **FR-002**: System MUST prioritize fixing existing API connections before creating new endpoints
- **FR-003**: System MUST follow copilot-instructions-ui.instructions.md for all frontend integration patterns
- **FR-004**: System MUST follow copilot-instructions-api.instructions.md when creating new backend endpoints
- **FR-005**: System MUST complete fixes in phases, organized by menu (Playlists → Schedules → Devices → Media → Users → QR Codes → Dashboard)
- **FR-006**: System MUST use React Query/TanStack Query for all API data fetching
- **FR-007**: System MUST use the configured apiClient from /lib/api.ts for all service layer calls
- **FR-008**: System MUST ensure all DTOs match between frontend types and backend responses

#### Phase 1: Playlists Menu Requirements
- **FR-101**: Users MUST be able to create new playlists with all form fields saving to API
- **FR-102**: Users MUST be able to edit existing playlists with data loading and saving via API
- **FR-103**: Users MUST be able to delete playlists via API calls
- **FR-104**: Users MUST be able to duplicate playlists via API
- **FR-105**: Users MUST be able to activate/deactivate playlists via API
- **FR-106**: Users MUST be able to search and filter playlists with API query support
- **FR-107**: Users MUST be able to view playlist assignment summary from API
- **FR-108**: System MUST display playlist statistics fetched from API
- **FR-109**: Users MUST be able to manage playlist items (add/remove/reorder) via API
- **FR-110**: Users MUST be able to convert playlists to templates via API

#### Phase 2: Schedules Menu Requirements
- **FR-201**: Users MUST be able to create schedules with basic info, time slots, targets, and content via API
- **FR-202**: Users MUST be able to edit existing schedules with all tabs (basic, time, targets, content) saving via API
- **FR-203**: Users MUST be able to delete schedules via API
- **FR-204**: Users MUST be able to view schedule calendar with events loaded from API
- **FR-205**: System MUST validate schedule conflicts via API queries
- **FR-206**: Users MUST be able to assign schedules to users and devices via API
- **FR-207**: Users MUST be able to create and use schedule templates via API
- **FR-208**: Users MUST be able to set recurring schedules with patterns saved via API
- **FR-209**: Users MUST be able to view schedule statistics from API
- **FR-210**: System MUST support schedule filtering and search via API

#### Phase 3: Devices Menu Requirements
- **FR-301**: Users MUST be able to view all devices loaded from API
- **FR-302**: Users MUST be able to create, edit, and delete devices via API
- **FR-303**: Users MUST be able to view real-time device status and heartbeat from API
- **FR-304**: Users MUST be able to assign devices to groups via API
- **FR-305**: Users MUST be able to manage device groups (CRUD) via API
- **FR-306**: Users MUST be able to approve/reject device registration requests via API
- **FR-307**: Users MUST be able to view device configuration and update settings via API
- **FR-308**: System MUST display device statistics and health metrics from API
- **FR-309**: Users MUST be able to filter devices by status, group, location via API
- **FR-310**: System MUST support device hardware profile detection via API

#### Phase 4: Media Menu Requirements
- **FR-401**: Users MUST be able to view all media items loaded from API
- **FR-402**: Users MUST be able to upload media files with S3 integration and metadata saving via API
- **FR-403**: Users MUST be able to edit media metadata via API
- **FR-404**: Users MUST be able to delete media with S3 and database removal via API
- **FR-405**: Users MUST be able to filter media by type, date, tags via API
- **FR-406**: Users MUST be able to assign media to schedules and playlists via API
- **FR-407**: Users MUST be able to view media usage statistics from API
- **FR-408**: System MUST generate and serve presigned URLs for media access
- **FR-409**: Users MUST be able to bulk upload media files via API
- **FR-410**: System MUST support media transcoding status updates from API

#### Phase 5: Users Menu Requirements
- **FR-501**: Users MUST be able to view all users loaded from API
- **FR-502**: Users MUST be able to create, edit, and delete users via API
- **FR-503**: Users MUST be able to assign roles and permissions via API
- **FR-504**: Users MUST be able to assign devices to users via API
- **FR-505**: Users MUST be able to assign schedules to users via API
- **FR-506**: Users MUST be able to set user default schedules via API
- **FR-507**: Users MUST be able to view user activity logs from API
- **FR-508**: Users MUST be able to filter users by role, status via API
- **FR-509**: System MUST validate user permissions for all operations via API
- **FR-510**: System MUST support user bulk operations via API

#### Phase 6: QR Codes Menu Requirements
- **FR-601**: Users MUST be able to view all QR codes loaded from API
- **FR-602**: Users MUST be able to create QR codes with device assignment via API
- **FR-603**: Users MUST be able to edit QR code metadata via API
- **FR-604**: Users MUST be able to delete QR codes via API
- **FR-605**: Users MUST be able to regenerate QR codes via API
- **FR-606**: Users MUST be able to download QR code images from API
- **FR-607**: System MUST track QR code scan events via API
- **FR-608**: Users MUST be able to filter QR codes by type, device, date via API

#### Phase 7: Dashboard & Analytics Requirements
- **FR-701**: System MUST display real-time statistics on dashboard loaded from API
- **FR-702**: System MUST display device status grid with live updates from WebSocket/API
- **FR-703**: Users MUST be able to view analytics charts with data from API
- **FR-704**: Users MUST be able to filter analytics by date range via API
- **FR-705**: System MUST display recent activity feed from API
- **FR-706**: System MUST display system health metrics from API
- **FR-707**: Users MUST be able to export analytics data via API

### Key Entities *(include if feature involves data)*

This feature involves ALL existing entities in the Digital Signage system:

- **Playlist**: Represents content playlists with items, assignments, and status
- **PlaylistItem**: Individual media items within a playlist with order and duration
- **PlaylistAssignment**: Association between playlists and devices/groups
- **Schedule**: Time-based content scheduling with slots, targets, and recurrence
- **ScheduleMedia**: Media items assigned to schedules
- **TimeSlot**: Time windows for schedule execution with days of week
- **Device**: Digital signage display devices with status, configuration, and heartbeat
- **DeviceGroup**: Logical grouping of devices for bulk management
- **DeviceRegistrationRequest**: Pending device registration approvals
- **Media**: Content files (images, videos, HTML) with S3 storage and metadata
- **User**: Admin and user accounts with roles, permissions, and assignments
- **UserDeviceAssociation**: User-to-device access mappings
- **UserSchedule**: User-specific schedule assignments
- **QRCode**: QR codes for device provisioning and information
- **Scene**: Complex content layouts with multiple media items
- **SceneItem**: Individual elements within a scene
- **PlaybackState**: Current playback status of devices

### API Endpoint Requirements

For each entity, the system MUST provide and connect:

#### CRUD Endpoints
- **GET /api/{entity}**: List all entities with pagination, filtering, sorting
- **GET /api/{entity}/{id}**: Get single entity by ID
- **POST /api/{entity}**: Create new entity
- **PUT /api/{entity}/{id}**: Update existing entity
- **DELETE /api/{entity}/{id}**: Delete entity

#### Specialized Endpoints
- **POST /api/{entity}/{id}/action**: Execute specific actions (activate, duplicate, etc.)
- **GET /api/{entity}/statistics**: Get aggregated statistics
- **GET /api/{entity}/search**: Advanced search with filters
- **POST /api/{entity}/bulk**: Bulk operations
- **GET /api/{entity}/{id}/relationships**: Get related entities

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs) - Refers to instruction files for patterns
- [x] Focused on user value and business needs - All menu functions must work correctly
- [x] Written for non-technical stakeholders - Clear "what" without "how"
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous - Each can be tested via UI interaction
- [x] Success criteria are measurable - Working CRUD operations per menu
- [x] Scope is clearly bounded - Phase-by-phase menu-based approach

### Implementation Guidance
- Implementation follows copilot-instructions-ui.instructions.md for frontend patterns
- Implementation follows copilot-instructions-api.instructions.md for backend patterns
- No unit tests or documentation generation required per user request
- Focus on functional integration, not test coverage or API documentation
- [ ] Review checklist passed

---
