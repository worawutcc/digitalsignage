
# Implementation Plan: Complete API Integration Audit and Fix for All Menu Functions

**Branch**: `030-recheck-function-menu` | **Date**: 2025-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/030-recheck-function-menu/spec.md`

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
Conduct a comprehensive audit of all menu and submenu functions in the Digital Signage admin interface to identify and fix non-working API integrations. Many UI features currently lack proper backend connections, resulting in non-functional CRUD operations, filters, and actions. The implementation follows a phased, menu-by-menu approach (Playlists → Schedules → Devices → Media → Users → QR Codes → Dashboard) with priority on reusing existing APIs before creating new endpoints. All fixes must comply with copilot-instructions-ui.instructions.md for frontend patterns and copilot-instructions-api.instructions.md for backend patterns.

## Technical Context
**Language/Version**: 
- Frontend: TypeScript 5.x with Next.js 15 (React 18)
- Backend: C# .NET 8 with ASP.NET Core Web API

**Primary Dependencies**: 
- Frontend: React Query/TanStack Query, Redux Toolkit, Tailwind CSS 4, React Hook Form + Zod, Axios, Lucide React
- Backend: Entity Framework Core 9, PostgreSQL (Npgsql), JWT Authentication, AWS S3 SDK, log4net

**Storage**: PostgreSQL database with Entity Framework Core migrations, AWS S3 for media files

**Testing**: No unit tests or documentation generation required per user specification - focus on functional integration only

**Target Platform**: Web application (admin interface for digital signage system)

**Project Type**: web (frontend + backend)

**Performance Goals**: 
- API response times <500ms for CRUD operations
- Real-time updates via WebSocket for device status
- React Query caching for 30-second intervals

**Constraints**: 
- Must use configured apiClient from /lib/api.ts for all service calls
- Must follow existing architectural patterns (Clean Architecture backend, feature-based frontend)
- Must preserve existing working features while fixing broken ones
- Must work incrementally phase-by-phase to avoid breaking changes

**Scale/Scope**: 
- 7 main menu areas (Playlists, Schedules, Devices, Media, Users, QR Codes, Dashboard)
- ~60+ functional requirements across all phases
- ~15-20 entities involved in the audit
- Estimated 100+ API endpoints to audit/create/fix

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: Constitution file is a template placeholder. Project uses architectural instruction files instead:
- copilot-instructions-api.instructions.md for backend patterns
- copilot-instructions-ui.instructions.md for frontend patterns

**Architectural Compliance**:
- ✅ **Clean Architecture (Backend)**: Maintain layer separation (Domain → Application → Infrastructure → Api)
- ✅ **Service Layer Pattern**: All API calls through service layer using configured apiClient
- ✅ **DTOs**: Backend never returns domain entities directly; frontend types match backend DTOs
- ✅ **React Query for Server State**: All API data fetching uses React Query hooks
- ✅ **Redux for Global State**: Authentication, UI state managed via Redux Toolkit
- ✅ **Feature-Based Organization**: Frontend organized by features with co-located hooks, services, components
- ✅ **Incremental Changes**: Phase-by-phase approach minimizes breaking changes
- ✅ **API Reuse Priority**: Check existing endpoints before creating new ones

**No Constitution Violations**: This is an integration and bug-fix feature working within existing architecture.

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
│   ├── DigitalSignage.Api/              # Backend Web API
│   │   ├── Controllers/                 # REST endpoints (audit/fix here)
│   │   └── Extensions/                  # Service registration
│   │
│   ├── DigitalSignage.Application/      # Backend business logic
│   │   ├── DTOs/                        # Data transfer objects (verify types)
│   │   ├── Services/                    # Business logic (audit/fix here)
│   │   └── Interfaces/                  # Service contracts
│   │
│   ├── DigitalSignage.Domain/           # Backend domain entities
│   │   └── Entities/                    # Core entities (reference only)
│   │
│   ├── DigitalSignage.Infrastructure/   # Backend data access
│   │   ├── Data/                        # EF Core DbContext
│   │   └── Repositories/                # Data access patterns
│   │
│   └── digital-signage-web/             # Frontend Next.js application
│       └── src/
│           ├── app/                     # Next.js pages (audit UI here)
│           │   ├── playlists/           # Phase 1: Playlists menu
│           │   ├── schedules/           # Phase 2: Schedules menu
│           │   ├── devices/             # Phase 3: Devices menu
│           │   ├── media/               # Phase 4: Media menu
│           │   ├── users/               # Phase 5: Users menu
│           │   ├── qrcodes/             # Phase 6: QR Codes menu
│           │   └── dashboard/           # Phase 7: Dashboard
│           │
│           ├── features/                # Feature-based organization
│           │   ├── playlists/           # Playlist hooks, services, components
│           │   ├── schedules/           # Schedule hooks, services, components
│           │   ├── devices/             # Device hooks, services, components
│           │   ├── media/               # Media hooks, services, components
│           │   └── users/               # User hooks, services, components
│           │
│           ├── services/                # API service layer (audit/fix here)
│           │   ├── playlistService.ts   # Must use apiClient
│           │   ├── scheduleService.ts   # Must use apiClient
│           │   ├── deviceService.ts     # Must use apiClient
│           │   ├── mediaService.ts      # Must use apiClient
│           │   └── userService.ts       # Must use apiClient
│           │
│           ├── lib/
│           │   └── api.ts               # Configured Axios client
│           │
│           └── types/                   # TypeScript definitions (verify DTOs)
│
├── specs/030-recheck-function-menu/     # This feature documentation
│   ├── spec.md                          # Feature specification
│   ├── plan.md                          # This file
│   ├── research.md                      # Phase 0 output
│   ├── data-model.md                    # Phase 1 output
│   ├── quickstart.md                    # Phase 1 output
│   └── contracts/                       # Phase 1 API contracts
│
└── docs/                                # Project documentation
    └── api-integration.md               # Existing API documentation
```

**Structure Decision**: Web application (Option 2) - Digital Signage has a clear frontend/backend separation with Next.js frontend in `src/digital-signage-web/` and .NET backend in `src/DigitalSignage.*/`. This feature audits and fixes API integration across both layers, working phase-by-phase through each menu area.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

This feature is unique - it's an audit and fix operation, not greenfield development. Task generation will follow an **audit → identify → fix** pattern rather than traditional TDD.

### Task Categories

**1. Audit Tasks (Phase 1: Playlists) [Sequential]**
- Task: Audit Playlists UI - identify all user actions (buttons, forms, filters)
- Task: Audit Playlists frontend services - verify apiClient usage
- Task: Audit Playlists React Query hooks - check for stubs/mock data
- Task: Audit Playlists backend - list existing API endpoints
- Task: Gap analysis - document missing/broken integrations

**2. Backend Fix Tasks (if needed) [P when independent]**
- Task: Create/fix PlaylistController endpoints
- Task: Implement/fix PlaylistService methods
- Task: Create/update PlaylistDto definitions
- Task: Add service registrations

**3. Frontend Fix Tasks (if needed) [P when independent]**
- Task: Fix playlistService.ts - ensure apiClient usage
- Task: Update usePlaylists hook - remove mock data
- Task: Wire playlist form submission to API
- Task: Connect edit form data loading
- Task: Implement delete confirmation + API call
- Task: Fix duplicate action API integration
- Task: Wire activate/deactivate toggle
- Task: Add search/filter query parameters
- Task: Update TypeScript types to match DTOs

**4. Validation Tasks [Sequential after fixes]**
- Task: Manual testing per quickstart.md checklist
- Task: Verify React Query cache invalidation
- Task: Test error handling and edge cases
- Task: Verify type safety (no TypeScript errors)

### Ordering Strategy

**Phase-Based Sequential Execution**:
1. Complete Phase 1 (Playlists) audit → fix → validate
2. Move to Phase 2 (Schedules) using same pattern
3. Continue through Phases 3-7

**Within Each Phase**:
1. Audit tasks (must complete first to identify work)
2. Backend fixes (can be parallel if independent endpoints)
3. Frontend fixes (can be parallel if independent features)
4. Validation (sequential, comprehensive testing)

**Dependency Rules**:
- Backend endpoint must exist before frontend wires to it
- Service layer must use apiClient before hooks call it
- Type definitions must match before API integration
- Validation only after all fixes complete

**Estimated Task Breakdown**:
- Phase 1 (Playlists): 20-25 tasks
  - 5 audit tasks
  - 8-10 backend fix tasks (if needed)
  - 8-10 frontend fix tasks
  - 2-3 validation tasks
- Phases 2-7: Similar pattern per phase
- **Total: 140-175 tasks across all phases**

**Task Prioritization**:
- **High Priority**: Playlists (Phase 1), Schedules (Phase 2) - core content management
- **Medium Priority**: Devices (Phase 3), Media (Phase 4), Users (Phase 5)
- **Lower Priority**: QR Codes (Phase 6), Dashboard (Phase 7) - analytics/utilities

**Special Considerations**:
- No unit tests required per user specification
- Focus on functional integration validation
- Use manual testing via quickstart.md
- Git commit after each sub-phase completion
- Can deploy phases independently if needed

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

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
- [x] Phase 0: Research complete (/plan command) ✅
  - Documented current architecture
  - Identified working and broken integrations
  - Established audit strategy
  - Made key technical decisions
- [x] Phase 1: Design complete (/plan command) ✅
  - Created data-model.md with all 15+ entities
  - Generated contracts/playlist-api.md with full endpoint specifications
  - Created quickstart.md manual validation guide
  - Documented integration patterns
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
  - Defined audit → identify → fix task pattern
  - Established phase-based sequential execution
  - Estimated 140-175 tasks across 7 phases
  - Prioritized content management phases (Playlists, Schedules)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
  - No violations - working within existing architecture
  - Following copilot-instructions-api.instructions.md
  - Following copilot-instructions-ui.instructions.md
- [x] Post-Design Constitution Check: PASS ✅
  - Clean Architecture maintained
  - Service layer patterns preserved
  - Feature-based organization kept
  - No new architectural complexity introduced
- [x] All NEEDS CLARIFICATION resolved ✅
  - All technical context documented
  - Technologies and patterns confirmed
  - Integration approach established
- [x] Complexity deviations documented: NONE ✅
  - This is integration/bug-fix work
  - No new patterns introduced
  - No additional projects or layers

**Artifacts Generated**:
- ✅ specs/030-recheck-function-menu/research.md (43KB, comprehensive audit strategy)
- ✅ specs/030-recheck-function-menu/data-model.md (25KB, 15+ entities documented)
- ✅ specs/030-recheck-function-menu/contracts/playlist-api.md (12KB, full API contract)
- ✅ specs/030-recheck-function-menu/quickstart.md (18KB, manual validation guide)
- ✅ specs/030-recheck-function-menu/plan.md (this file, updated with all phases)

**Next Command**: `/tasks` to generate detailed task list for Phase 1 (Playlists) implementation

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
