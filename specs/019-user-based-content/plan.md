# Implementation Plan: User-Based Content Assignment for Digital Signage Devices

**Branch**: `019-user-based-content` | **Date**: 2025-10-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-user-based-content/spec.md`

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

Enable Android TV devices to identify users during registration by providing their email address. Administrators can then assign specific content schedules to individual users, allowing personalized content delivery. The system implements a three-tier priority for content retrieval: User-Specific > Device Group > Default schedules.

**Key Capabilities:**
- Device registration with user email identification
- Automatic user matching against existing accounts
- Admin approval workflow with user assignment
- Content manager assigns schedules to users (not devices)
- Priority-based content delivery with fallback mechanism
- Complete audit trail for all user-content associations

## Technical Context
**Language/Version**: C# .NET 8, TypeScript 5.x  
**Primary Dependencies**: ASP.NET Core Web API, Entity Framework Core 9, PostgreSQL (Npgsql), Next.js 15, React 18  
**Storage**: PostgreSQL database with EF Core migrations  
**Testing**: xUnit (backend), Jest/React Testing Library (frontend)  
**Target Platform**: Linux/Windows server (backend), Modern browsers (frontend)  
**Project Type**: web (backend + frontend structure)  
**Performance Goals**: <2s content request response time, support 1000 concurrent devices  
**Constraints**: <200ms p95 for database queries, backward compatibility with existing devices  
**Scale/Scope**: Support 10,000+ users, 1000+ devices, 500+ schedules

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Clean Architecture Compliance**:
- ✅ Follows existing Clean Architecture: Domain → Application → Infrastructure → API
- ✅ New entities in Domain layer (UserSchedule)
- ✅ Business logic in Application Services
- ✅ Data access in Infrastructure
- ✅ Controllers remain thin

**Testing Requirements**:
- ✅ Unit tests for services and domain logic
- ✅ Integration tests for API endpoints
- ✅ Contract tests for data models
- ✅ TDD approach: Write tests first, then implement

**Database Design**:
- ✅ Follows existing EF Core patterns
- ✅ Proper relationships and constraints
- ✅ Nullable foreign keys for optional relationships
- ✅ Unique indexes where appropriate

**API Design**:
- ✅ RESTful conventions
- ✅ Proper HTTP status codes
- ✅ ProducesResponseType attributes for documentation
- ✅ Role-based authorization

## Project Structure

### Documentation (this feature)
```
specs/019-user-based-content/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── device-registration-api.yaml
│   ├── schedule-assignment-api.yaml
│   └── content-delivery-api.yaml
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Backend (.NET 8 Web API)
src/DigitalSignage.Domain/
├── Entities/
│   ├── Device.cs                    # UPDATE: Add AssignedUserId
│   ├── DeviceRegistrationRequest.cs # UPDATE: Add RequestedUsername, MatchedUserId
│   ├── Schedule.cs                  # UPDATE: Add IsDefault flag
│   └── UserSchedule.cs              # NEW: User-Schedule assignment
├── Interfaces/
│   └── (no changes - use existing patterns)

src/DigitalSignage.Application/
├── DTOs/
│   ├── Device/
│   │   ├── DeviceRegistrationRequestDto.cs       # UPDATE
│   │   ├── DeviceRegistrationResponseDto.cs      # UPDATE
│   │   ├── PendingRegistrationDto.cs             # NEW
│   │   ├── ApproveRegistrationRequest.cs         # UPDATE
│   │   └── AssignUserToDeviceRequest.cs          # NEW
│   └── Schedule/
│       ├── AssignSchedulesToUserRequest.cs       # NEW
│       ├── UserScheduleDto.cs                    # NEW
│       └── DeviceScheduleDto.cs                  # EXISTING
├── Services/
│   ├── IDeviceService.cs                         # UPDATE interface
│   ├── DeviceService.cs                          # UPDATE implementation
│   ├── IScheduleService.cs                       # UPDATE interface
│   └── ScheduleService.cs                        # UPDATE implementation

src/DigitalSignage.Infrastructure/
├── Data/
│   ├── AppDbContext.cs                           # UPDATE: Add UserSchedules DbSet
│   └── Configurations/
│       ├── DeviceConfiguration.cs                # UPDATE
│       ├── DeviceRegistrationRequestConfiguration.cs  # UPDATE
│       ├── ScheduleConfiguration.cs              # UPDATE
│       └── UserScheduleConfiguration.cs          # NEW
└── Migrations/
    └── [timestamp]_AddUserContentAssignment.cs   # NEW migration

src/DigitalSignage.Api/
├── Controllers/
│   ├── DeviceController.cs                       # UPDATE endpoints
│   └── ScheduleController.cs                     # UPDATE endpoints
└── Extensions/
    └── ApplicationServiceExtensions.cs           # (no changes needed)

# Frontend (Next.js 15 + React 18)
src/digital-signage-web/
├── src/
│   ├── app/
│   │   └── admin/
│   │       ├── devices/
│   │       │   └── pending-registrations/
│   │       │       └── page.tsx                  # NEW: Pending approval list
│   │       └── schedules/
│   │           └── user-assignments/
│   │               └── page.tsx                  # NEW: User schedule assignment
│   ├── components/
│   │   ├── devices/
│   │   │   ├── PendingRegistrationCard.tsx       # NEW
│   │   │   └── ApproveRegistrationModal.tsx      # NEW
│   │   └── schedules/
│   │       ├── UserScheduleAssignmentForm.tsx    # NEW
│   │       └── ScheduleSelector.tsx              # NEW
│   ├── services/
│   │   ├── deviceService.ts                      # UPDATE
│   │   └── scheduleService.ts                    # UPDATE
│   └── types/
│       ├── device.ts                             # UPDATE
│       └── schedule.ts                           # UPDATE

# Tests
tests/DigitalSignage.Domain.Tests/
├── Entities/
│   └── UserScheduleTests.cs                      # NEW

tests/DigitalSignage.Application.Tests/
├── Services/
│   ├── DeviceServiceTests.cs                     # UPDATE
│   └── ScheduleServiceTests.cs                   # UPDATE

tests/DigitalSignage.Api.Tests/
├── Controllers/
│   ├── DeviceControllerTests.cs                  # UPDATE
│   └── ScheduleControllerTests.cs                # UPDATE
└── Integration/
    ├── UserContentAssignmentTests.cs             # NEW
    └── PriorityBasedDeliveryTests.cs             # NEW
```

**Structure Decision**: Web application with existing .NET backend and Next.js frontend. Follow established Clean Architecture patterns with Domain → Application → Infrastructure → API layers. Frontend follows Next.js 15 App Router conventions with server/client component separation.

## Phase 0: Outline & Research

**Status**: ✅ COMPLETE

**Artifacts Generated**:
- ✅ `research.md` - Comprehensive technical research document

**Research Questions Resolved** (10 total):
1. ✅ Database schema for UserSchedule - Junction table with unique constraint
2. ✅ Priority-based content delivery - Sequential query approach with three tiers
3. ✅ User matching during registration - Hybrid automatic with admin override
4. ✅ Backward compatibility - Nullable foreign keys with graceful degradation
5. ✅ Schedule assignment behavior - Replace (not append) with transactional handling
6. ✅ Performance optimization - Database indexes + deferred caching
7. ✅ Migration strategy - Single migration with explicit rollback
8. ✅ API versioning - Not needed (backward compatible)
9. ✅ Security & authorization - RBAC following existing patterns
10. ✅ Testing strategy - Multi-layered approach (unit, integration, contract, scenario)

**Key Design Decisions**:
- UserSchedule junction table with (UserId, ScheduleId) unique constraint
- Priority delivery: User > DeviceGroup > Default schedules
- Auto-match users by email with admin confirmation/override
- Replace (not append) semantics for schedule assignments
- Backward compatible via nullable foreign keys
- All operations audit logged

**Validation**:
- ✅ All NEEDS CLARIFICATION resolved
- ✅ No blockers identified
- ✅ Constitution compliance verified

**Reference**: See `specs/019-user-based-content/research.md` for complete analysis
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

**Status**: ✅ COMPLETE

**Prerequisites**: ✅ research.md complete with all unknowns resolved

**Artifacts Generated**:

1. ✅ **data-model.md** - Complete entity specifications
   - Updated entities: Device, DeviceRegistrationRequest, Schedule
   - New entity: UserSchedule (junction table)
   - EF Core configurations for all entities
   - Migration script (Up/Down methods)
   - Query patterns for content delivery
   - Relationship diagrams in Mermaid format

2. ✅ **contracts/** - OpenAPI 3.0 specifications
   - `device-registration-api.yaml` - Registration with user identification
   - `schedule-assignment-api.yaml` - Admin schedule assignments to users
   - `content-delivery-api.yaml` - Priority-based content retrieval
   - All endpoints documented with request/response examples
   - Security schemes defined (Bearer + DeviceKey)

3. ✅ **quickstart.md** - Developer setup guide
   - Prerequisites and dependencies
   - Database migration steps
   - Backend implementation order
   - Testing strategy (unit, integration, contract, scenario)
   - Common usage scenarios with curl examples
   - Troubleshooting guide with SQL queries

4. ✅ **Agent context update** - `.github/copilot-instructions.md`
   - Executed: `.specify/scripts/bash/update-agent-context.sh copilot`
   - Added new technologies: C# .NET 8, TypeScript 5.x, EF Core 9, Next.js 15
   - Added new entities: UserSchedule, updated Device/Schedule/DeviceRegistrationRequest
   - Preserved manual additions between markers
   - Kept under 150 lines for token efficiency

**Validation**:
- ✅ All entities mapped to contracts
- ✅ All API endpoints have OpenAPI specs
- ✅ Data model supports all functional requirements
- ✅ Backward compatibility maintained (nullable foreign keys)
- ✅ Constitution compliance verified (Clean Architecture, TDD, REST conventions)

**Key Design Elements**:
- **3-tier content priority**: User schedules → Device group schedules → Default schedules
- **Replace semantics**: Schedule assignments replace (not append) previous assignments
- **Auto-match workflow**: Email auto-matches users, admin confirms/overrides
- **Audit trail**: All operations logged with AssignedAt/AssignedByUserId
- **Performance**: Composite indexes for multi-column queries

**Contract Test Strategy** (to be executed in Phase 2):
- Schemathesis for OpenAPI contract validation
- Unit tests for service layer logic
- Integration tests for API endpoints
- Scenario tests for end-to-end user flows

**Reference**: All Phase 1 artifacts in `specs/019-user-based-content/`


## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

1. **Load Base Template**
   - Use `.specify/templates/tasks-template.md` as starting point
   - Inherit task structure conventions (numbering, [P] markers, status tracking)

2. **Generate from Design Artifacts**
   - Parse `data-model.md` for entity creation tasks
   - Parse `contracts/*.yaml` for API endpoint tasks
   - Parse `quickstart.md` for integration test scenarios
   - Parse `spec.md` for functional requirement coverage

3. **Task Categories** (estimated 28-32 tasks):
   
   **Database & Entities** (6 tasks):
   - Update Device entity (add AssignedUserId)
   - Update DeviceRegistrationRequest entity (add user fields)
   - Update Schedule entity (add IsDefault)
   - Create UserSchedule entity
   - Create EF Core configurations
   - Create and apply migration [P]
   
   **Application Services** (8 tasks):
   - Update IDeviceService interface
   - Implement device registration with user matching
   - Update IScheduleService interface
   - Implement schedule assignment to users (replace semantics)
   - Implement priority-based content delivery
   - Add audit logging for user assignments [P]
   - Add validation for schedule assignments [P]
   - Add user auto-match logic
   
   **API Controllers** (5 tasks):
   - Update DeviceRegistrationController (add user fields)
   - Update DeviceController (priority-based next-schedule)
   - Create UserScheduleController (schedule assignment endpoints)
   - Add admin approval with user assignment
   - Update heartbeat endpoint (detect user changes)
   
   **Tests - Unit** (4 tasks):
   - UserSchedule entity tests [P]
   - ScheduleService tests (assignment logic) [P]
   - DeviceService tests (user matching) [P]
   - ContentDeliveryService tests (priority logic) [P]
   
   **Tests - Integration** (3 tasks):
   - Device registration with user identification
   - Schedule assignment API
   - Priority-based content delivery
   
   **Tests - Contract** (3 tasks):
   - Device registration API contract validation [P]
   - Schedule assignment API contract validation [P]
   - Content delivery API contract validation [P]
   
   **Tests - Scenario** (2 tasks):
   - End-to-end device registration with user
   - End-to-end content personalization flow

4. **Ordering Strategy**:
   - **TDD Order**: Tests before implementation for each component
   - **Dependency Order**: 
     - Phase A: Database migrations + entity tests
     - Phase B: Service interfaces + service tests
     - Phase C: Controller implementations + integration tests
     - Phase D: Contract validation + scenario tests
   - **Parallel Markers [P]**: Independent file modifications can run concurrently

5. **Task Format** (following tasks-template.md):
   ```markdown
   ## T001: Update Device Entity with AssignedUserId
   **Type**: Backend - Entity  
   **Status**: ⏳ Pending  
   **Dependencies**: None  
   **Estimated Effort**: 30 minutes
   
   **Description**: Add `AssignedUserId` nullable foreign key to Device entity...
   
   **Acceptance Criteria**:
   - [ ] Device.cs has AssignedUserId property (int?, nullable)
   - [ ] Navigation property to User exists
   - [ ] DeviceConfiguration updated with relationship
   
   **Files to Modify**:
   - `src/DigitalSignage.Domain/Entities/Device.cs`
   - `src/DigitalSignage.Infrastructure/Data/Configurations/DeviceConfiguration.cs`
   ```

**Estimated Output**: `tasks.md` with 28-32 numbered tasks, grouped by phase, with clear dependencies and [P] markers for parallelization

**Quality Checks** (to be performed by /tasks command):
- ✅ All entities from data-model.md covered
- ✅ All endpoints from contracts/ covered
- ✅ All scenarios from quickstart.md covered
- ✅ Test-first approach (tests before implementation)
- ✅ No circular dependencies

**IMPORTANT**: This phase is executed by the `/tasks` command, NOT by `/plan`. The /plan command STOPS after Phase 1.


## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

**Status**: ✅ NO VIOLATIONS

This feature follows all constitutional principles:
- ✅ Clean Architecture maintained (Domain → Application → Infrastructure → API)
- ✅ TDD approach documented in quickstart.md
- ✅ No additional projects or layers introduced
- ✅ Standard repository pattern used (existing IRepository interfaces)
- ✅ REST conventions followed in API contracts
- ✅ Backward compatible design (nullable foreign keys)

**No complexity deviations to document.**

---

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- ✅ Phase 0: Research complete (/plan command)
  - ✅ research.md generated with 10 questions resolved
  - ✅ All technical unknowns answered
  - ✅ Design decisions documented
  
- ✅ Phase 1: Design complete (/plan command)
  - ✅ data-model.md created (5 entities documented)
  - ✅ contracts/ directory created (3 OpenAPI specs)
  - ✅ quickstart.md created (setup + testing guide)
  - ✅ Agent context updated (.github/copilot-instructions.md)
  
- ✅ Phase 2: Task planning complete (/plan command - describe approach only)
  - ✅ Task generation strategy documented
  - ✅ Estimated 28-32 tasks across 6 categories
  - ✅ Ordering and dependency strategy defined
  - ✅ Ready for /tasks command execution
  
- ⏳ Phase 3: Tasks generated (/tasks command) - **NOT YET EXECUTED**
- ⏳ Phase 4: Implementation complete - **NOT YET EXECUTED**
- ⏳ Phase 5: Validation passed - **NOT YET EXECUTED**

**Gate Status**:
- ✅ Initial Constitution Check: PASS (no violations)
- ✅ Post-Design Constitution Check: PASS (no violations)
- ✅ All NEEDS CLARIFICATION resolved (10/10 in research.md)
- ✅ Complexity deviations documented (none required)

**Artifacts Generated** (Phase 0-1):
- ✅ `specs/019-user-based-content/plan.md` (this file)
- ✅ `specs/019-user-based-content/research.md`
- ✅ `specs/019-user-based-content/data-model.md`
- ✅ `specs/019-user-based-content/quickstart.md`
- ✅ `specs/019-user-based-content/contracts/device-registration-api.yaml`
- ✅ `specs/019-user-based-content/contracts/schedule-assignment-api.yaml`
- ✅ `specs/019-user-based-content/contracts/content-delivery-api.yaml`
- ✅ `.github/copilot-instructions.md` (updated)

**Next Command**: Execute `/tasks` to generate `tasks.md` from Phase 1 design artifacts

---
*Implementation plan complete. Ready for task generation via /tasks command.*  
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
