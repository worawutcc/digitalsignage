
# Implementation Plan: Enhanced Device Registration with Hardware Information

**Branch**: `028-enhanced-device-registration` | **Date**: 2024-12-19 | **Spec**: [../spec.md](./spec.md)
**Input**: Feature specification from `/specs/028-enhanced-device-registration/spec.md`

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
Enhanced device registration workflow that automatically collects comprehensive hardware information during Android TV device registration, including display resolution, screen dimensions, supported formats, and device capabilities. This enables optimized content delivery with multi-size media processing and device-appropriate content serving, building on existing device registration and multi-size media upload features.

## Technical Context
**Language/Version**: C# .NET 8 with ASP.NET Core Web API  
**Primary Dependencies**: Entity Framework Core 9, JWT Authentication, AWS S3 SDK, AutoMapper, SixLabors.ImageSharp, SignalR  
**Storage**: PostgreSQL (Npgsql provider) with Entity Framework Core migrations  
**Testing**: xUnit with InMemory Database for integration tests  
**Target Platform**: Linux server, Docker containers, Android TV clients  
**Project Type**: web - Clean Architecture with API backend + React frontend  
**Performance Goals**: Handle device registration with hardware detection <2s response time, support concurrent device registrations  
**Constraints**: Backward compatibility with existing devices, secure hardware information collection, audit logging required  
**Scale/Scope**: 1000+ Android TV devices, multi-tenant support, real-time device status updates via SignalR

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Clean Architecture Compliance**:
- [x] Domain entities remain pure (no infrastructure dependencies) - DeviceHardwareProfile is pure domain entity
- [x] Application services coordinate business logic without external concerns - Services handle coordination only
- [x] Infrastructure handles external systems (database, AWS S3, hardware detection) - All external systems isolated to Infrastructure layer
- [x] API controllers remain thin (DTOs in/out, delegate to application services) - Controllers use DTOs and delegate to services

**Digital Signage System Principles**:
- [x] Backward compatibility with existing device registration workflow - Legacy devices get default profiles
- [x] Security-first approach (audit logging, secure hardware data collection) - Comprehensive audit logging implemented
- [x] Device-agnostic design (fallback for devices without detailed hardware info) - Default profiles for non-capable devices
- [x] Performance considerations (non-blocking hardware detection, efficient storage) - Asynchronous processing with SignalR updates

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
├── digital-signage-web/           # React frontend (separate feature)
├── DigitalSignage.Api/            # Web API controllers & DTOs
│   ├── Controllers/
│   ├── Extensions/
│   └── Program.cs
├── DigitalSignage.Application/    # Business logic & services
│   ├── DTOs/
│   ├── Interfaces/
│   └── Services/
├── DigitalSignage.Domain/         # Core entities & domain logic
│   ├── Entities/
│   ├── Enums/
│   └── Interfaces/
└── DigitalSignage.Infrastructure/ # Data access & external services
    ├── Data/
    ├── Services/
    └── Extensions/

tests/
├── DigitalSignage.Api.Tests/      # API integration tests
├── DigitalSignage.Application.Tests/ # Service unit tests
├── DigitalSignage.Domain.Tests/   # Domain logic tests
└── DigitalSignage.Infrastructure.Tests/ # Data access tests
```

**Structure Decision**: Clean Architecture with Web API backend. The feature enhances existing device registration in the API layer, adds hardware profile entities to Domain, extends registration services in Application, and updates EF Core models in Infrastructure. Frontend integration points will be added to existing React admin interface.

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
- [x] Complexity deviations documented (none required)

**Completed Artifacts**:
- ✅ research.md - Hardware detection research and technology decisions
- ✅ data-model.md - Entity definitions and database schema
- ✅ contracts/api-contracts.yaml - OpenAPI specification for enhanced endpoints
- ✅ quickstart.md - Integration testing scenarios and validation steps
- ✅ GitHub Copilot context updated with new feature information

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
