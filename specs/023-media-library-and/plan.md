
# Implementation Plan: Media Library and Schedule Management UI

**Branch**: `023-media-library-and` | **Date**: 4 October 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/023-media-library-and/spec.md`

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
Digital signage administrators need comprehensive media library and schedule management interfaces to upload, organize, and manage content files, and create, assign, and monitor content display schedules across devices. This feature integrates existing functional pages (/media and /schedules) with enhanced UI components and ensures compatibility with current Next.js 15 architecture.

## Technical Context
**Language/Version**: TypeScript 5.0, Next.js 15 with App Router (React 18)  
**Primary Dependencies**: React Query/TanStack Query, Redux Toolkit, React Hook Form + Zod, Tailwind CSS 4  
**Storage**: Entity Framework with SQL Server/PostgreSQL (backend), Local Storage + Session Storage (frontend)  
**Testing**: Jest + React Testing Library (frontend), xUnit (backend) - tests will be skipped per requirements  
**Target Platform**: Web application (responsive desktop/tablet admin interface)
**Project Type**: web - determines source structure (frontend + backend separation)  
**Performance Goals**: <500ms page load times, <100ms UI interactions, real-time updates via WebSocket  
**Constraints**: Must integrate with existing pages, follow copilot-instructions-ui.instructions.md, maintain mobile responsiveness  
**Scale/Scope**: Support 1000+ media files, 100+ schedules, 50+ concurrent admin users

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: Template constitution found - no specific constraints defined
**Compliance Assessment**: 
- ✅ Feature builds upon existing functional pages (/media, /schedules)
- ✅ Follows established Next.js App Router architecture
- ✅ Uses TypeScript strict mode and component patterns
- ✅ Integrates with existing Redux Toolkit store
- ✅ No constitutional violations identified

**Decision**: PROCEED - No constitutional constraints to evaluate

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
# Backend API (.NET Core) - Existing
src/
├── DigitalSignage.Api/           # Web API controllers (existing MediaController, ScheduleController)
├── DigitalSignage.Application/   # Application services (existing MediaService, ScheduleService)
├── DigitalSignage.Domain/        # Domain entities (existing Media, Schedule entities)
└── DigitalSignage.Infrastructure/ # Data access, S3 integration

tests/
├── DigitalSignage.Api.Tests/           # API integration tests
├── DigitalSignage.Application.Tests/   # Application service tests
├── DigitalSignage.Domain.Tests/        # Domain logic tests
└── DigitalSignage.Infrastructure.Tests/ # Infrastructure tests

# Frontend Web App (Next.js) - Integration focus
src/digital-signage-web/
├── src/
│   ├── app/
│   │   ├── media/page.tsx              # ✅ EXISTS - Media Library interface
│   │   ├── schedules/page.tsx          # ✅ EXISTS - Schedule Management interface
│   │   └── content/page.tsx            # ✅ EXISTS - Redirects to /media
│   │
│   ├── features/
│   │   ├── media/                      # 🔄 ENHANCE - Media management features
│   │   │   ├── components/             # Media upload, preview, organization
│   │   │   ├── hooks/                  # useMedia, useMediaUpload hooks
│   │   │   └── services/               # mediaService API integration
│   │   │
│   │   └── schedules/                  # ✅ EXISTS - Schedule management features
│   │       ├── components/             # ScheduleBuilder, ScheduleCalendar
│   │       ├── hooks/                  # useSchedules, useScheduleCalendar
│   │       └── services/               # scheduleService API integration
│   │
│   └── components/
│       ├── layouts/AdminLayout.tsx     # ✅ EXISTS - Main admin layout
│       └── ui/                         # ✅ EXISTS - Reusable UI components
└── tests/                              # ⚠️ Tests will be skipped per requirements
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: Web application structure selected with frontend/backend separation. Existing pages (/media, /schedules) are functional and will be enhanced rather than rebuilt. Focus on integration and UI improvements following copilot-instructions-ui.instructions.md patterns.

## Phase 0: Outline & Research
**Analysis**: No NEEDS CLARIFICATION items found in Technical Context - all technologies and constraints are well-defined.

**Research Tasks**:
1. ✅ Existing page compatibility assessment - COMPLETED
2. ✅ Current component architecture review - COMPLETED  
3. ✅ Integration points identification - COMPLETED

**Findings**:
- **Decision**: Enhance existing pages rather than rebuild
- **Rationale**: Both /media and /schedules pages are functional with comprehensive features
- **Alternatives considered**: Complete rebuild rejected due to unnecessary duplication of working functionality
- **Integration approach**: Focus on UI enhancements, performance optimizations, and feature gaps

**Output**: research.md with consolidated findings

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
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

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
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

**Artifacts Generated**:
- [x] research.md - Integration approach and existing page analysis
- [x] data-model.md - Enhanced interface definitions and relationships
- [x] contracts/api-integration-contracts.md - API and component integration contracts
- [x] quickstart.md - 15-minute enhancement guide
- [x] .github/copilot-instructions.md - Updated agent context
- [x] tasks.md - 7 implementation tasks with priority and time estimates

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
