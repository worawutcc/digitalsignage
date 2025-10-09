
# Implementation Plan: Content Assignment UX/UI Design & API Integration

**Branch**: `032-content-assignment-ux-design` | **Date**: 2025-10-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/032-content-assignment-ux-design/spec.md`

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
Comprehensive UX/UI design and API integration for content assignment system with three assignment methods: Direct Schedule Assignment (existing), Playlist Assignment (enhance), and Bulk Assignment Tools (new). Technical approach enhances existing Clean Architecture (ASP.NET Core + Next.js) with unified assignment dashboard, drag-and-drop interfaces, and enhanced ContentDeliveryService with emergency broadcast priority system.

## Technical Context
**Language/Version**: C# .NET 8 (Backend), TypeScript 5.x (Frontend)  
**Primary Dependencies**: ASP.NET Core Web API, Entity Framework Core 9, Next.js 15, React 18, PostgreSQL, JWT Authentication, AWS S3, SignalR  
**Storage**: PostgreSQL (assignments/analytics), AWS S3 (media content), LocalStorage/SessionStorage (UI state)  
**Testing**: xUnit (backend), Jest/React Testing Library (frontend)  
**Target Platform**: Web application (admin dashboard), RESTful API, SignalR WebSockets
**Project Type**: web - frontend (Next.js) + backend (ASP.NET Core API)  
**Performance Goals**: <200ms API response, <100ms content delivery, bulk assignment 100+ devices <5s, real-time updates <1s  
**Constraints**: Backward compatibility with existing assignments, 1000+ devices scale, intuitive UX for non-technical users  
**Scale/Scope**: 1000+ devices, 500+ content items, real-time dashboard, emergency broadcast system

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: PASS - No constitutional violations detected  
**Rationale**: 
- Enhancement of existing system (not new complexity)
- Follows established Clean Architecture patterns
- Reuses existing entities (PlaylistAssignment already exists)
- API follows RESTful conventions per copilot-instructions-api.instructions.md
- Frontend follows Next.js App Router patterns per copilot-instructions-ui.instructions.md

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
# Web application: Backend + Frontend
src/
├── DigitalSignage.Api/                    # API Controllers & Configuration
│   └── Controllers/
│       └── AssignmentController.cs        # New unified assignment API
├── DigitalSignage.Application/            # Business Logic & Services
│   ├── Services/
│   │   ├── AssignmentService.cs           # New unified assignment management
│   │   ├── AssignmentAnalyticsService.cs  # New dashboard analytics
│   │   ├── BulkAssignmentService.cs       # New bulk operations
│   │   └── ContentDeliveryService.cs      # Enhanced with new priority logic
│   └── DTOs/
│       └── Assignment/                    # New assignment DTOs
├── DigitalSignage.Domain/                 # Core Entities (enhance existing)
│   └── Entities/
│       └── Assignment.cs                  # New unified assignment entity
├── DigitalSignage.Infrastructure/         # Data Access (enhance existing)
│   └── Data/Configurations/
│       └── AssignmentConfiguration.cs     # New assignment entity config
└── digital-signage-web/                  # Frontend Next.js Application
    └── src/
        ├── app/(dashboard)/               # Layout group for admin
        │   └── assignments/               # New assignment dashboard
        │       ├── page.tsx               # Assignment overview dashboard
        │       ├── create/page.tsx        # Assignment creation wizard
        │       └── [id]/page.tsx          # Assignment details/edit
        ├── components/assignments/        # New assignment components
        │   ├── AssignmentDashboard.tsx    # Main dashboard component
        │   ├── AssignmentWizard.tsx       # Step-by-step creation
        │   ├── ContentBrowser.tsx         # Content selection
        │   ├── DeviceSelector.tsx         # Device/group selection
        │   ├── SchedulePicker.tsx         # Date/time/recurrence
        │   ├── AssignmentList.tsx         # Assignment table
        │   ├── ConflictResolver.tsx       # Conflict handling
        │   └── BulkAssignmentTools.tsx    # Bulk operations
        ├── features/assignments/          # Assignment feature module
        │   ├── hooks/                     # Assignment-specific hooks
        │   ├── services/                  # Assignment API services
        │   └── types.ts                   # Assignment types
        └── store/slices/
            └── assignmentSlice.ts         # Assignment state management

tests/
├── DigitalSignage.Api.Tests/             # API integration tests
├── DigitalSignage.Application.Tests/     # Service unit tests
└── digital-signage-web/tests/            # Frontend component tests
```

**Structure Decision**: Web application with existing Clean Architecture backend and Next.js frontend. Enhancement of existing patterns with new assignment management layer. Follows copilot-instructions-api.instructions.md for backend and copilot-instructions-ui.instructions.md for frontend structure.

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
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (data-model.md, assignment-api.yaml, quickstart.md)
- Backend tasks: Assignment entity → AssignmentService → AssignmentController → Enhanced ContentDeliveryService
- Frontend tasks: Assignment components → Assignment pages → Assignment state management → Assignment services
- Integration tasks: API testing → Frontend-backend integration → Content delivery testing
- Each major component generates 3-5 implementation tasks with tests

**Ordering Strategy**:
- **Backend First**: Database schema → Services → Controllers → API testing
- **Frontend Second**: Components → Pages → State management → Integration
- **Enhancement Third**: ContentDeliveryService → Real-time updates → Emergency broadcasts
- **Validation Fourth**: End-to-end testing → Performance validation → Documentation
- Mark [P] for parallel execution within each phase
- Dependencies: Backend API ready before frontend integration

**Task Categories**:
1. **Database & Entities** (5-7 tasks): Assignment schema, migrations, entity configurations
2. **Backend Services** (8-10 tasks): AssignmentService, AnalyticsService, BulkService, API controllers
3. **Frontend Components** (10-12 tasks): Dashboard, wizard, selectors, forms, state management
4. **Integration & Enhancement** (6-8 tasks): ContentDelivery enhancement, SignalR updates, emergency broadcasts
5. **Testing & Validation** (4-6 tasks): API tests, component tests, E2E scenarios, performance validation

**Estimated Output**: 33-43 numbered, ordered tasks in tasks.md

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
- [x] Phase 0: Research complete (/plan command) ✅ 2025-10-09
- [x] Phase 1: Design complete (/plan command) ✅ 2025-10-09
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅ 2025-10-09
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅ 2025-10-09
- [x] Post-Design Constitution Check: PASS ✅ 2025-10-09
- [x] All NEEDS CLARIFICATION resolved ✅ 2025-10-09
- [x] Complexity deviations documented: N/A - No violations detected ✅ 2025-10-09

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
