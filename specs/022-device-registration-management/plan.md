
# Implementation Plan: Device Registration Management UI

**Branch**: `022-device-registration-management` | **Date**: 3 October 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/022-device-registration-management/spec.md`

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
Digital signage administrators need a web-based interface to register, manage, and monitor Android TV devices in their signage network. The system must provide device registration forms, device listing with status monitoring, configuration management, and audit logging. Focus on Android TV workflow includes device discovery, pairing process, and Android-specific configuration options.

## Technical Context
**Language/Version**: C# .NET 8 (API), Next.js 14 with TypeScript (Frontend)  
**Primary Dependencies**: ASP.NET Core, Entity Framework Core, NextUI, React Query  
**Storage**: Entity Framework with SQL Server/PostgreSQL  
**Testing**: xUnit (Backend), Jest/React Testing Library (Frontend)  
**Target Platform**: Web application (responsive for desktop/tablet management)
**Project Type**: web - determines source structure (backend API + frontend web app)  
**Performance Goals**: <500ms API response times, real-time device status updates via WebSocket  
**Constraints**: Must handle offline device scenarios, secure device authentication, multi-tenant support  
**Scale/Scope**: Support 1000+ devices per organization, 100+ concurrent administrators

**Android TV Specific Context**: Android TV work flow requires device discovery via network scanning, QR code pairing for secure registration, Android-specific configuration (display resolution, orientation, app permissions), and real-time status monitoring for TV-specific metrics (screen health, power state, network connectivity).

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: PASS - No constitution file found or constitution is not yet defined for this project. Proceeding with standard best practices:
- Following existing project structure patterns (API + Web frontend)
- Using established technology stack (.NET Core + Next.js)
- Implementing proper separation of concerns (Domain, Application, Infrastructure layers)
- Following TDD principles with comprehensive test coverage

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
# Backend API (.NET Core)
src/
├── DigitalSignage.Api/           # Web API controllers
├── DigitalSignage.Application/   # Application services, DTOs, interfaces
├── DigitalSignage.Domain/        # Domain entities, aggregates, domain services
└── DigitalSignage.Infrastructure/ # Data access, external integrations

tests/
├── DigitalSignage.Api.Tests/           # API integration tests
├── DigitalSignage.Application.Tests/   # Application service tests
├── DigitalSignage.Domain.Tests/        # Domain logic tests
└── DigitalSignage.Infrastructure.Tests/ # Infrastructure tests

# Frontend Web App (Next.js)
src/digital-signage-web/
├── src/
│   ├── components/          # Reusable UI components
│   ├── app/                # Next.js app router pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API client services
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
└── __tests__/              # Frontend tests
```

**Structure Decision**: Web application structure using existing .NET Core backend with Clean Architecture (Domain, Application, Infrastructure, API layers) and Next.js frontend. Device management features will be implemented across all layers following the established patterns.

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
- [x] All NEEDS CLARIFICATION resolved (with Android TV context provided)
- [ ] Complexity deviations documented (none identified)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
