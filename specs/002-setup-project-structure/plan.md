
# Implementation Plan: Digital Signage .NET 8 Project Structure Setup

**Branch**: `002-setup-project-structure` | **Date**: 26 September 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-setup-project-structure/spec.md`

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
Establish a standardized .NET 8 project structure for the Digital Signage system following clean architecture principles. The structure will include Api, Application, Domain, and Infrastructure layers with proper dependency injection, configuration management, database support (PostgreSQL/SQL Server), AWS S3 integration, testing framework, Docker support, and comprehensive build pipeline configurations.

## Technical Context
**Language/Version**: C# .NET 8 with ASP.NET Core Web API  
**Primary Dependencies**: ASP.NET Core 8, Entity Framework Core 8, log4net, AWS SDK S3, Npgsql, SQL Server provider  
**Storage**: PostgreSQL (primary), SQL Server (alternate), AWS S3 for media files  
**Testing**: xUnit with InMemory/SQLite databases for testing  
**Target Platform**: Linux containers (Docker), Windows Server deployment support  
**Project Type**: web - backend API with clean architecture structure  
**Performance Goals**: Scalable architecture supporting multiple devices, efficient media serving with presigned URLs  
**Constraints**: Clean architecture principles, dependency flow toward Domain layer, environment-specific configurations  
**Scale/Scope**: Multi-tenant capable, supports device provisioning and media management at scale

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: Template constitution found - proceeding with standard .NET project structure principles:
- ✅ Clean Architecture: Clear separation of concerns with inward dependencies
- ✅ Test-First Approach: xUnit test projects with comprehensive coverage
- ✅ Simplicity: Standard .NET project structure without over-engineering
- ✅ Observability: Health endpoints, structured logging, metrics capability
- ✅ Configuration Management: Environment-specific settings without code changes

**Gate Status**: PASS - Project structure aligns with clean architecture principles

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
DigitalSignage.sln
src/
├── DigitalSignage.Api/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Filters/
│   ├── Program.cs
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── appsettings.Staging.json
│   └── appsettings.Production.json
├── DigitalSignage.Application/
│   ├── Services/
│   │   ├── Interfaces/
│   │   └── Implementations/
│   ├── DTOs/
│   ├── Validators/
│   └── Mappings/
├── DigitalSignage.Domain/
│   ├── Entities/
│   ├── Enums/
│   ├── ValueObjects/
│   └── Interfaces/
└── DigitalSignage.Infrastructure/
    ├── Data/
    │   ├── AppDbContext.cs
    │   ├── Configurations/
    │   └── Migrations/
    ├── Repositories/
    ├── Services/
    └── ExternalServices/

tests/
├── DigitalSignage.Api.Tests/
│   ├── Controllers/
│   └── Integration/
├── DigitalSignage.Application.Tests/
│   ├── Services/
│   └── Unit/
├── DigitalSignage.Domain.Tests/
│   └── Entities/
└── DigitalSignage.Infrastructure.Tests/
    ├── Data/
    └── Repositories/

docker/
├── Dockerfile
├── docker-compose.yml
├── docker-compose.override.yml
└── docker-compose.prod.yml

.github/
└── workflows/
    ├── build.yml
    └── deploy.yml
```

**Structure Decision**: .NET 8 Clean Architecture selected for backend API structure. This provides clear separation of concerns with Api (presentation), Application (business logic), Domain (core entities), and Infrastructure (data access) layers. Dependencies flow inward toward Domain, supporting testability and maintainability.

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
- [ ] Complexity deviations documented

**Artifacts Generated**:
- [x] research.md - Technical decisions and alternatives
- [x] data-model.md - Project structure entities and relationships  
- [x] contracts/ - Project setup operation contracts
- [x] quickstart.md - 5-minute setup guide with validation
- [x] .github/copilot-instructions.md - Updated agent context

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
