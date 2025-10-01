
# Implementation Plan: Basic Hierarchy Device Grouping

**Branch**: `014-basic-hierarchy` | **Date**: 2025-09-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/014-basic-hierarchy/spec.md`

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
Extend existing DeviceGroup entity with hierarchical parent-child relationships to enable organizational device management (Company → Branch → Floor → Zone). Implementation will add self-referencing foreign key to existing DeviceGroup table, implement tree operations for navigation and content scheduling inheritance, and create intuitive tree-based UI for device organization. Targets 80% reduction in device targeting time while supporting up to 10,000 device groups with sub-2-second tree loading performance.

## Technical Context
**Language/Version**: C# .NET 8 with ASP.NET Core Web API + Entity Framework Core 9  
**Primary Dependencies**: Entity Framework Core (PostgreSQL), ASP.NET Core MVC, log4net, AWS S3 SDK  
**Storage**: PostgreSQL database with Entity Framework Core migrations  
**Testing**: xUnit, InMemory Database for integration tests, SQLite for lightweight database tests  
**Target Platform**: Linux server, containerized deployment  
**Project Type**: web - Clean Architecture backend API with hierarchical data model extension  
**Performance Goals**: Tree operations <100ms, hierarchy loading <2s for 1000 groups, content propagation <30s for 1000 devices  
**Constraints**: Self-referencing foreign key design, prevent circular references, max 10 hierarchy levels, maintain existing API compatibility  
**Scale/Scope**: Up to 10,000 device groups, enterprise multi-location deployments, hierarchical content scheduling inheritance

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Clean Architecture Compliance**:
- ✅ Domain entities maintain business logic isolation
- ✅ Application services orchestrate business operations  
- ✅ Infrastructure handles data persistence concerns
- ✅ API layer provides RESTful interface contracts

**Dependency Inversion**:
- ✅ DeviceGroup entity remains in Domain layer
- ✅ Repository interfaces defined in Domain, implemented in Infrastructure
- ✅ Hierarchical operations abstracted behind service interfaces

**Database Design Principles**:
- ✅ Self-referencing foreign key follows established patterns
- ✅ Migration safety with cascading delete restrictions
- ✅ Indexing strategy for performance optimization

**Performance & Scalability**:
- ✅ Recursive query patterns with depth limits
- ✅ Materialized path computation for efficient breadcrumbs
- ✅ Bulk operations support for large hierarchies

**PASS**: No constitutional violations detected

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
src/
├── DigitalSignage.Domain/           # Core entities + interfaces
│   ├── Entities/DeviceGroup.cs      # Extended with ParentGroupId, Path
│   ├── Interfaces/IDeviceGroupRepository.cs
│   └── ValueObjects/HierarchyPath.cs
├── DigitalSignage.Application/      # Business logic + services  
│   ├── DTOs/DeviceGroup/            # Request/response DTOs
│   ├── Services/DeviceGroupService.cs
│   └── Interfaces/IDeviceGroupService.cs
├── DigitalSignage.Infrastructure/   # Data access + EF Core
│   ├── Data/Configurations/DeviceGroupConfiguration.cs
│   ├── Data/Migrations/             # AddHierarchicalGrouping migration
│   └── Repositories/DeviceGroupRepository.cs
└── DigitalSignage.Api/              # Web API + Controllers
    ├── Controllers/DeviceGroupController.cs
    ├── DTOs/DeviceGroup/            # API-specific DTOs
    └── Extensions/                  # Service registration

tests/
├── DigitalSignage.Domain.Tests/     # Domain logic tests
├── DigitalSignage.Application.Tests/ # Service tests
├── DigitalSignage.Infrastructure.Tests/ # Repository + EF tests
└── DigitalSignage.Api.Tests/        # Controller + integration tests
```

**Structure Decision**: Clean Architecture web application extending existing .NET 8 API. Hierarchical functionality will be added to existing DeviceGroup entity across all layers, maintaining established dependency directions and architectural patterns.

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
