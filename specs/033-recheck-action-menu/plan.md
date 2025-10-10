
# Implementation Plan: Complete Menu Actions API Integration Audit

**Branch**: `033-recheck-action-menu` | **Date**: 2025-10-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/033-recheck-action-menu/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

**Primary Requirement**: Audit and eliminate all mock data usage across all 14 sidebar menu pages, sub-menus, and page-level actions (buttons, forms, filters, search, workflows). Replace with real API calls ensuring UI data binding matches backend API response structures.

**Technical Approach**:
1. **Priority-Based Menu Audit**: Process menus in order of admin importance (Dashboard → Devices → Media → Users → Device Registrations → others)
2. **Three-Layer Audit**: Menu-level → Page actions → Workflow steps
3. **API-First Strategy**: Check existing API endpoints first, enhance if partial, create if missing
4. **Mock Elimination**: Remove all `mock*Service.ts` files and `USE_MOCK_*` flags
5. **Data Binding Validation**: Ensure TypeScript interfaces match backend DTOs, handle null/undefined, use Array.isArray() guards
6. **Service Layer Compliance**: All services must use `apiClient` from `/lib/api.ts` (no direct axios)
7. **Backend Enhancement**: Follow Clean Architecture patterns for new endpoints (Controller → Service → Repository → Domain)
8. **Skip Testing**: Per user request, no automated test creation (manual verification only)

## Technical Context

### Backend (API)
**Language/Version**: C# .NET 8 with ASP.NET Core Web API  
**Primary Dependencies**: Entity Framework Core 9, PostgreSQL (Npgsql), JWT Authentication, AWS S3 SDK, AutoMapper, SignalR, log4net  
**Storage**: PostgreSQL database with EF Core migrations, AWS S3 for media files  
**Testing**: xUnit (skipped per user request - manual testing only)  
**Target Platform**: Linux/Windows server (Docker-compatible)  
**Architecture**: Clean Architecture (Api → Application → Domain → Infrastructure layers)

### Frontend (UI)
**Language/Version**: TypeScript 5.x with Next.js 15 (App Router), React 18  
**Primary Dependencies**: React Query/TanStack Query, Redux Toolkit, Tailwind CSS 4, React Hook Form + Zod, Axios, Lucide React  
**Storage**: Browser LocalStorage/SessionStorage for client state, API integration for server state  
**Testing**: Manual verification only (no automated tests per user request)  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)  
**Architecture**: Feature-based organization with service layer abstraction

### Integration
**Project Type**: Web (frontend + backend monorepo)  
**API Base URL**: `http://localhost:5100` (development), configurable via env vars  
**Auth Pattern**: JWT Bearer tokens for admin authentication  
**Real-time**: SignalR WebSocket for device status updates  
**File Upload**: Presigned S3 URLs for media uploads

### User-Specified Constraints
**Priority Order**: Menus ordered by admin web backoffice importance  
**API Reference**: Must follow `copilot-instructions-api.instructions.md` for backend  
**UI Reference**: Must follow `copilot-instructions-ui.instructions.md` for frontend  
**Testing**: Skip test phase entirely (manual verification only)  
**DateTime**: All timestamp fields use `timestamp without time zone` PostgreSQL type with `DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)` pattern

### Performance Goals
**API Response Time**: <500ms for list endpoints, <200ms for simple CRUD  
**UI Rendering**: React Query caching for instant navigation, optimistic updates for mutations  
**Pagination**: Backend pagination for all lists (no client-side filtering of large datasets)  
**Real-time Updates**: <1s latency for device status changes via SignalR

### Constraints
**No Mock Data**: Zero tolerance for mock services - all must use real APIs  
**Service Layer**: All services must use `apiClient` from `/lib/api.ts` (no direct axios imports)  
**Data Binding**: TypeScript interfaces must match backend DTOs exactly  
**Error Handling**: Proper null/undefined checks, Array.isArray() guards, default values  
**Backend Standards**: Clean Architecture, DTOs for requests/responses, ProducesResponseType attributes

### Scale/Scope
**Menus to Audit**: 14 sidebar menus + 1 sub-menu group (Device Registrations with 4 tabs) = 15 total menu sections  
**Pages to Audit**: ~20-30 pages total (including sub-pages like Media Tags, Device Detail views)  
**Actions per Page**: Average 5-10 actions per page (buttons, forms, filters, search, sort, pagination)  
**Total Actions**: Estimated 150-300 individual actions to audit  
**Mock Services**: 5 confirmed mock services to eliminate (mockMediaService, mockDeviceService, mockPlaylistService, mockScheduleService, mockDashboardService)  
**API Controllers**: ~20 existing controllers, may need 5-10 new endpoints or enhancements

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ **PASSED** (Constitution file contains template placeholders only - no active constraints)

The constitution file (`.specify/memory/constitution.md`) contains only template placeholders and no active governance rules for this project. Therefore, no constitutional violations are possible.

**Key Observations**:
- No library-first requirement (this is an application feature audit, not a library)
- No CLI interface requirement (web application context)
- No test-first mandate (user explicitly requested skipping tests)
- No integration testing requirements
- No observability/versioning/simplicity constraints beyond standard practices

**Design Decisions**:
- **Approach**: Direct in-place audit and refactoring of existing services and pages
- **No New Libraries**: Using existing service layer patterns
- **No Breaking Changes**: Replacing mock implementations with real API calls maintains same interfaces
- **Simplicity**: Straightforward mock elimination, no architectural changes

**Complexity Tracking**: None - this is a code quality improvement feature (mock removal) with no new complexity introduced.

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
digital_signage/
├── src/
│   ├── DigitalSignage.Api/              # Backend: Web API + Controllers
│   │   ├── Controllers/
│   │   │   ├── DashboardController.cs
│   │   │   ├── DevicesController.cs
│   │   │   ├── DeviceGroupController.cs
│   │   │   ├── MediaController.cs
│   │   │   ├── PlaylistController.cs
│   │   │   ├── ScheduleController.cs
│   │   │   ├── AssignmentController.cs
│   │   │   ├── AdminPermissionController.cs (Users)
│   │   │   ├── AnalyticsController.cs
│   │   │   ├── QRCodeController.cs (if exists)
│   │   │   ├── ReportsController.cs (if exists)
│   │   │   ├── AdminDeviceRegistrationController.cs
│   │   │   └── SettingsController.cs (if exists)
│   │   ├── DTOs/
│   │   └── Extensions/
│   │
│   ├── DigitalSignage.Application/      # Backend: Business Logic + Services
│   │   ├── Services/
│   │   │   ├── DashboardService.cs
│   │   │   ├── DeviceService.cs
│   │   │   ├── DeviceGroupService.cs
│   │   │   ├── MediaService.cs
│   │   │   ├── PlaylistService.cs
│   │   │   ├── ScheduleService.cs
│   │   │   ├── AssignmentService.cs
│   │   │   ├── UserService.cs
│   │   │   ├── AnalyticsService.cs
│   │   │   └── DeviceRegistrationService.cs
│   │   ├── Interfaces/
│   │   └── DTOs/
│   │
│   ├── DigitalSignage.Domain/           # Backend: Core Entities
│   │   └── Entities/
│   │
│   ├── DigitalSignage.Infrastructure/   # Backend: Data Access + EF Core
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   └── Configurations/
│   │   └── Repositories/
│   │
│   └── digital-signage-web/             # Frontend: Next.js App
│       ├── src/
│       │   ├── app/                     # Next.js App Router
│       │   │   ├── (dashboard)/
│       │   │   │   ├── dashboard/
│       │   │   │   ├── devices/
│       │   │   │   ├── device-groups/
│       │   │   │   ├── media/
│       │   │   │   ├── playlists/
│       │   │   │   ├── schedules/
│       │   │   │   ├── assignments/
│       │   │   │   ├── users/
│       │   │   │   ├── analytics/
│       │   │   │   ├── qr-codes/
│       │   │   │   ├── reports/
│       │   │   │   ├── device-registrations/
│       │   │   │   │   ├── pending/
│       │   │   │   │   ├── approved/
│       │   │   │   │   ├── rejected/
│       │   │   │   │   └── devices/
│       │   │   │   ├── settings/
│       │   │   │   └── layout.tsx
│       │   │   ├── login/
│       │   │   └── layout.tsx
│       │   │
│       │   ├── components/              # Reusable UI components
│       │   │   ├── layouts/
│       │   │   │   └── Sidebar.tsx
│       │   │   └── ui/
│       │   │
│       │   ├── services/                # API Integration Layer (AUDIT TARGET)
│       │   │   ├── dashboardService.ts
│       │   │   ├── deviceService.ts
│       │   │   ├── deviceGroupService.ts
│       │   │   ├── mediaService.ts
│       │   │   ├── playlistService.ts
│       │   │   ├── scheduleService.ts
│       │   │   ├── assignmentService.ts
│       │   │   ├── userService.ts
│       │   │   ├── analyticsService.ts
│       │   │   ├── qrCodeService.ts (if exists)
│       │   │   ├── reportsService.ts (if exists)
│       │   │   ├── deviceRegistrationService.ts
│       │   │   ├── settingsService.ts (if exists)
│       │   │   ├── mockMediaService.ts (TO REMOVE)
│       │   │   ├── mockDeviceService.ts (TO REMOVE)
│       │   │   ├── mockPlaylistService.ts (TO REMOVE)
│       │   │   ├── mockScheduleService.ts (TO REMOVE)
│       │   │   └── mockDashboardService.ts (TO REMOVE)
│       │   │
│       │   ├── lib/
│       │   │   ├── api.ts                # apiClient configuration (STANDARD)
│       │   │   └── auth.ts
│       │   │
│       │   └── types/                    # TypeScript interfaces
│       │
│       └── package.json
│
├── tests/ (SKIPPED per user request)
└── DigitalSignage.sln
```

**Structure Decision**: **Web Application (Frontend + Backend)**

This is a monorepo with separate backend (.NET) and frontend (Next.js) projects. The audit will focus on:

1. **Frontend Services** (`src/digital-signage-web/src/services/`) - Replace mock implementations with real API calls
2. **Frontend Pages** (`src/digital-signage-web/src/app/(dashboard)/`) - Verify all page actions call real APIs
3. **Backend Controllers** (`src/DigitalSignage.Api/Controllers/`) - Enhance or create missing endpoints
4. **Backend Services** (`src/DigitalSignage.Application/Services/`) - Implement business logic for new endpoints

**Key Directories**:
- **Audit Target**: `src/digital-signage-web/src/services/` and all page files in `src/app/(dashboard)/`
- **API Enhancement**: `src/DigitalSignage.Api/Controllers/` and `src/DigitalSignage.Application/Services/`
- **Mock Removal**: Delete 5 `mock*Service.ts` files in frontend services folder

## Phase 0: Outline & Research
**Status**: ✅ **COMPLETE**

**Output**: `research.md` created with:
- **Menu Prioritization**: 4-tier priority system (Tier 1: Critical → Tier 4: Administrative)
- **Existing API Audit**: 10 fully implemented controllers identified, 3 controllers need verification
- **Mock Services Inventory**: 5 mock services documented for removal
- **Integration Patterns**: 5 core patterns documented (apiClient usage, response mapping, search/filter/sort/pagination, form submission, multi-step wizard)
- **Decision Log**: 6 key decisions documented (API-first approach, service layer compliance, data binding validation, backend standards, error handling, testing skip)

**Key Findings**:
- Tier 1 Menus (Critical): Dashboard, Devices, Media, Device Registrations
- Tier 2 Menus (Operational): Schedules, Users, Assignments
- Tier 3 Menus (Supporting): Playlists, Device Groups, Analytics
- Tier 4 Menus (Administrative): QR Codes, Reports, Settings
- Controllers Verified: Dashboard, Devices, Media, AdminDeviceRegistration, Playlist, Schedule, Assignment, AdminPermission, DeviceGroup, Analytics
- Controllers Need Verification: QRCode, Reports, Settings (may not exist)
- Mock Services: mockMediaService.ts, mockDeviceService.ts, mockPlaylistService.ts, mockScheduleService.ts, mockDashboardService.ts

## Phase 1: Design & Contracts
**Status**: ✅ **COMPLETE**

**Outputs**:
1. ✅ `data-model.md` - Entity mappings and relationships
   - 12 core entities mapped: User, Device, DeviceGroup, Media, Playlist, Schedule, Assignment, DeviceRegistrationRequest, AnalyticsMetric, QRCode, Setting, Report
   - Each entity includes: Domain Entity (C#), Application DTO (C#), Frontend TypeScript Interface
   - Entity relationships documented
   - Field mapping rules and validation patterns

2. ✅ `contracts/api-endpoints.md` - Complete API specifications
   - 47 API endpoints documented across 13 controllers
   - HTTP methods, request/response schemas, status codes for all endpoints
   - Query parameters for search/filter/sort/pagination
   - Authentication requirements specified
   - Error response patterns standardized
   - Endpoints by status: 40 verified existing, 3 need verification, 4 need creation

3. ✅ `quickstart.md` - Implementation guide
   - Standard implementation workflow for each menu
   - Code examples for service layer, React Query hooks, UI components
   - Common integration patterns (list pagination, CRUD mutations, search/filter/sort, multi-step wizard)
   - Error handling guidelines
   - Testing checklist template
   - Implementation priority order (Tier 1-4)
   - Common issues & solutions appendix

**Contract Tests**: ⏭️ **SKIPPED** (per user request - manual testing only)

**Key Deliverables**:
- Complete API contract with 47 endpoints documented
- Entity-to-DTO-to-TypeScript mapping for 12 entities
- Step-by-step implementation guide with code examples
- Error handling and validation patterns
- Priority-based implementation order

**Agent Context Update**: ⏭️ **DEFERRED** (to be executed at end of /plan)

## Phase 2: Task Planning Approach
**Status**: ✅ **COMPLETE** (Planning approach defined)

*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

The `/tasks` command will generate `tasks.md` based on the following breakdown strategy:

1. **Menu-Based Task Grouping**
   - Each menu (14 total) becomes a task group
   - Sub-menus (Device Registrations with 4 tabs) get separate tasks
   - Total: ~18 primary implementation tasks

2. **Task Structure Per Menu**
   ```
   Task N: [Menu Name] - API Integration
   - Verify API endpoints exist (from contracts/api-endpoints.md)
   - Remove mock service file (if exists)
   - Create/update real service file using apiClient
   - Create/update React Query hooks
   - Update UI components with real data binding
   - Manual verification testing (from quickstart.md checklist)
   ```

3. **Priority-Based Ordering**
   - **Tier 1 Tasks (Critical)**: Dashboard, Devices, Media, Device Registrations (Tasks 1-4)
   - **Tier 2 Tasks (Operational)**: Schedules, Users, Assignments (Tasks 5-7)
   - **Tier 3 Tasks (Supporting)**: Playlists, Device Groups, Analytics (Tasks 8-10)
   - **Tier 4 Tasks (Administrative)**: QR Codes, Reports, Settings (Tasks 11-13)
   - **Verification Tasks**: API endpoint verification, mock cleanup, final validation (Tasks 14-18)

4. **Backend Enhancement Tasks** (If needed)
   - Task: Create QRCodeController if missing (from contracts verification)
   - Task: Create ReportsController if missing (from contracts verification)
   - Task: Create SettingsController if missing (from contracts verification)
   - Each includes: Controller, Service, DTO, Repository, Migration

5. **Dependency Ordering**
   - Backend API endpoints must exist before frontend integration
   - Data model entities referenced by contracts/api-endpoints.md
   - Service layer pattern from quickstart.md
   - No parallel execution (each menu builds on previous learnings)

6. **Task Metadata**
   - Estimated effort per menu: 2-4 hours (varies by complexity)
   - Total estimated effort: 40-80 hours
   - Each task includes: Files to modify, API endpoints, testing checklist
   - Reference sections: quickstart.md step-by-step guide, contracts/api-endpoints.md for schemas

**Estimated Task Count**: 18-22 tasks total
- 14 menu integration tasks
- 4 Device Registrations sub-menu tasks (Pending, Approved, Rejected, Devices)
- 0-3 backend controller creation tasks (QR Codes, Reports, Settings - if missing)
- 1 final cleanup/verification task

**Testing Strategy**: Manual verification only (per user request)
- Each task includes checklist from quickstart.md
- Functional tests: CRUD operations, pagination, search/filter/sort
- Error handling tests: Network errors, validation errors, authorization errors
- Edge cases: Empty states, null values, long text

**IMPORTANT**: This phase is executed by the `/tasks` command, NOT by `/plan`

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) - ✅ `research.md` created with menu priorities and API audit
- [x] Phase 1: Design complete (/plan command) - ✅ `data-model.md`, `contracts/api-endpoints.md`, `quickstart.md` created
- [x] Phase 2: Task planning complete (/plan command - describe approach only) - ✅ Task generation strategy defined
- [ ] Phase 3: Tasks generated (/tasks command) - ⏭️ Ready for `/tasks` command execution

**Deliverables Created**:
- ✅ `specs/033-recheck-action-menu/plan.md` (this file)
- ✅ `specs/033-recheck-action-menu/research.md` (menu prioritization, API audit, patterns, decisions)
- ✅ `specs/033-recheck-action-menu/data-model.md` (12 entities with full mappings)
- ✅ `specs/033-recheck-action-menu/contracts/api-endpoints.md` (47 endpoints documented)
- ✅ `specs/033-recheck-action-menu/quickstart.md` (implementation guide with code examples)
- ⏭️ `specs/033-recheck-action-menu/tasks.md` (pending - will be created by `/tasks` command)

**Constitution Check History**:
- ✅ Initial Check (Before Phase 0): PASSED - No active constraints
- ✅ Post-Design Check (After Phase 1): PASSED - No new violations introduced

**Next Steps**:
1. Execute `/tasks` command to generate `tasks.md` from Phase 1 design artifacts
2. Review generated tasks for accuracy and completeness
3. Begin implementation following task priority order (Tier 1 → Tier 4)
4. Follow `quickstart.md` for step-by-step implementation guidance
5. Use `contracts/api-endpoints.md` for API schema reference
6. Refer to `data-model.md` for entity mappings and TypeScript interfaces
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
