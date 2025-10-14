
# Implementation Plan: Enhanced UI Playlist Management

**Branch**: `036-enhance-ui-playlist` | **Date**: 2025-10-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/036-enhance-ui-playlist/spec.md`

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
Enhanced playlist management UI for digital signage administrators featuring drag-and-drop media ordering, real-time previews, bulk operations, and modern responsive design. Implementation will follow Next.js 15 App Router patterns with TypeScript, React Hook Form + Zod validation, and integration with existing C# .NET 8 API backend following clean architecture patterns.

## Technical Context
**Language/Version**: TypeScript 5.x (Frontend), C# .NET 8 (Backend)
**Primary Dependencies**: Next.js 15 App Router, React 18, Tailwind CSS 4, React Hook Form + Zod, React Query/TanStack Query, Redux Toolkit, Axios, ASP.NET Core Web API, Entity Framework Core 9
**Storage**: PostgreSQL (backend data), LocalStorage/SessionStorage (client state), existing API endpoints
**Testing**: User requested to skip testing phase
**Target Platform**: Modern web browsers, responsive design for desktop/tablet admin interface
**Project Type**: web - frontend + backend integration
**Performance Goals**: <200ms UI response time, smooth drag-drop interactions, real-time updates
**Constraints**: Must follow existing copilot instructions, integrate with current API structure, maintain clean architecture
**Scale/Scope**: Admin-only interface, 100+ playlists, 1000+ media items, real-time updates for active sessions

**Additional Context**: User provided - "ถ้ามีแก้ api ให้ อ้างอิง copilot-instructions-api.instructions.md ในการแก้ api - ไม่ต้อง ทำเทส (skip phase test)"

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Digital Signage Architecture Principles**:
- ✅ **Clean Architecture**: Maintain separation between UI (Next.js), Application (services), and Domain layers (entities)
- ✅ **API-First**: Follow existing REST API patterns, enhance only as needed following copilot-instructions-api.instructions.md
- ✅ **Responsive Design**: Follow Next.js 15 App Router patterns per copilot-instructions-ui.instructions.md
- ✅ **TypeScript Strict**: Full type safety across frontend components and API integration
- ✅ **Performance**: Optimize for admin workflow efficiency with real-time feedback

**Compliance Status**: PASS - Enhancement follows existing patterns and architectural guidelines

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
# Digital Signage Project Structure
src/
├── DigitalSignage.Api/                 # Web API Controllers
├── DigitalSignage.Application/         # Business Logic & Services
│   ├── Services/                       # Application Services
│   ├── DTOs/                          # Data Transfer Objects
│   └── Interfaces/                    # Service Interfaces
├── DigitalSignage.Domain/             # Core Entities & Interfaces
│   └── Entities/                      # Domain Entities (Playlist, Media, etc.)
├── DigitalSignage.Infrastructure/      # Data Access & EF Core
│   ├── Data/                          # DbContext & Configurations
│   └── Repositories/                  # Repository Implementations
└── digital-signage-web/               # Next.js Frontend
    └── src/
        ├── app/                       # Next.js 15 App Router
        │   └── (dashboard)/           # Layout group for admin pages
        │       └── playlists/         # Playlist management pages
        ├── components/                # Reusable UI components
        ├── features/                  # Feature-based organization
        │   └── playlists/            # Playlist-specific components
        ├── hooks/                     # Custom React hooks
        ├── lib/                       # Utilities & API client
        └── services/                  # API service layer

tests/
├── DigitalSignage.Api.Tests/
├── DigitalSignage.Application.Tests/
└── DigitalSignage.Infrastructure.Tests/
```

**Structure Decision**: Web application following existing Digital Signage clean architecture with Next.js 15 frontend and C# .NET 8 API backend. Enhancement will focus on playlist management UI in `src/digital-signage-web/src/app/(dashboard)/playlists/` and corresponding feature components, with minimal API changes following existing patterns.

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
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS  
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
