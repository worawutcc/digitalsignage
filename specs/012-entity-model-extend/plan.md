
# Implementation Plan: Entity Model Base Entity Extension and Date Column Standardization

**Branch**: `012-entity-model-extend` | **Date**: 29 September 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-entity-model-extend/spec.md`

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
Create a BaseEntity abstract class containing common audit trail fields (CreatedAt, CreatedBy, UpdatedAt, UpdatedBy) and refactor all domain entities to inherit from it. Standardize all date/time fields to use DateTime without timezone for consistency across the digital signage system.

## Technical Context
**Language/Version**: C# .NET 8 with ASP.NET Core Web API  
**Primary Dependencies**: Entity Framework Core 8, ASP.NET Core, PostgreSQL (Npgsql), JWT Authentication, AWS S3  
**Storage**: PostgreSQL database with Entity Framework Core migrations  
**Testing**: xUnit, Entity Framework InMemory provider for integration tests  
**Target Platform**: Linux/Windows server, cloud deployment ready
**Project Type**: Web application (Clean Architecture: API + Application + Domain + Infrastructure)  
**Performance Goals**: Entity operations <50ms, migration execution <5min  
**Constraints**: Backward compatibility required, zero-downtime deployment preferred  
**Scale/Scope**: ~20 existing entities, support for 10k+ records per entity type

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Clean Architecture Compliance**:
- ✅ Changes isolated to Domain layer (BaseEntity) with proper inheritance
- ✅ Infrastructure layer handles database mapping changes
- ✅ No business logic mixed with data access concerns

**Test-First Approach**:
- ✅ Integration tests verify audit field population
- ✅ Migration tests ensure data consistency
- ✅ Contract tests validate API response changes

**Backward Compatibility**:
- ✅ Existing API contracts remain unchanged
- ✅ Database migration preserves existing data
- ✅ Nullable audit fields for legacy records

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
├── DigitalSignage.Api/              # Web API controllers, middleware, configuration
├── DigitalSignage.Application/      # Business logic, services, DTOs
├── DigitalSignage.Domain/           # Entities, enums, value objects, interfaces
│   ├── Entities/                    # Domain entities (target for BaseEntity)
│   │   ├── BaseEntity.cs            # NEW: Common audit trail base class
│   │   ├── User.cs                  # MODIFY: Inherit from BaseEntity
│   │   ├── Device.cs                # MODIFY: Inherit from BaseEntity
│   │   ├── Media.cs                 # MODIFY: Inherit from BaseEntity
│   │   └── [18+ other entities]     # MODIFY: Inherit from BaseEntity
│   └── Common/                      # NEW: Common interfaces for audit
└── DigitalSignage.Infrastructure/   # Data access, EF Core, external services
    ├── Data/
    │   ├── AppDbContext.cs          # MODIFY: Configure BaseEntity mappings
    │   ├── Configurations/          # MODIFY: Update entity configurations
    │   └── Migrations/              # NEW: Migration for BaseEntity changes
    └── Services/                    # MODIFY: Audit field population logic

tests/
├── DigitalSignage.Domain.Tests/     # NEW: BaseEntity unit tests
├── DigitalSignage.Infrastructure.Tests/ # NEW: Migration and EF tests
└── DigitalSignage.Api.Tests/        # MODIFY: Integration tests for audit trails
```

**Structure Decision**: Clean Architecture Web API with existing four-layer separation. The BaseEntity refactoring affects primarily the Domain layer with cascading changes to Infrastructure (EF configurations and migrations) and testing layers.

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
- Generate tasks from Phase 1 design docs (data-model.md, quickstart.md)
- BaseEntity creation task (foundational) 
- Entity inheritance tasks for each of 20+ domain entities [P]
- EF Core configuration updates [P]
- Database migration creation and execution
- Integration tests for audit field population
- Validation tests from quickstart.md scenarios

**Ordering Strategy**:
- Foundation-first: BaseEntity → Entity Updates → EF Configuration → Migration
- TDD approach: Tests before implementation where applicable
- Parallel execution for independent entity updates [P]
- Sequential for database migration (single migration for all changes)

**Entity Update Task Breakdown**:
1. High-priority entities with existing audit fields (User, Device, Media) - 7 tasks
2. Medium-priority entities with partial audit (PlaybackState, ServiceInstance) - 5 tasks  
3. New entities without audit fields (ScheduleMedia, PlaylistItem, etc.) - 8 tasks
4. Special case entities (RefreshToken, DeviceApproval with field mapping) - 3 tasks

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md covering BaseEntity implementation, entity updates, database migration, and comprehensive testing

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
- [x] Complexity deviations documented (none required)

**Artifacts Generated**:
- [x] research.md - All technical decisions documented
- [x] data-model.md - BaseEntity design and entity mappings
- [x] contracts/api-impact-analysis.md - No API changes required
- [x] quickstart.md - Complete implementation and validation guide
- [x] .github/copilot-instructions.md - Updated with new tech context

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
