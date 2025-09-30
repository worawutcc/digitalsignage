
# Implementation Plan: QR Code Device Registration System

**Branch**: `013-qr-code-system` | **Date**: 2025-09-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-qr-code-system/spec.md`

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
Replace the existing PIN-based device registration system with a QR Code-based system that allows Android TV devices to generate QR codes for admin scanning and instant approval. This improves registration speed by 70% (from 2 minutes to 30 seconds) and eliminates manual PIN entry errors while maintaining security through time-limited QR codes and comprehensive audit trails.

## Technical Context
**Language/Version**: C# .NET 8 with ASP.NET Core Web API  
**Primary Dependencies**: Entity Framework Core 9, JWT Bearer Authentication, AWS S3 SDK, log4net, PostgreSQL (Npgsql)  
**Storage**: PostgreSQL database with Entity Framework Core migrations, AWS S3 for media files  
**Testing**: xUnit for unit/integration tests, InMemory Database for testing, SQLite for lightweight tests  
**Target Platform**: Linux/Windows server environments, Android TV client applications
**Project Type**: Web application (backend API + mobile client integration)  
**Performance Goals**: QR code generation <2s, scanning/approval <3s, support 100 concurrent registrations  
**Constraints**: 99.9% availability during business hours, QR codes readable on 32" screens from 6 feet, 15-minute expiration  
**Scale/Scope**: Digital signage system supporting enterprise Android TV deployments, existing Clean Architecture pattern

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Clean Architecture Compliance**: ✅ PASS - Extends existing Domain/Application/Infrastructure layers  
**Dependency Inversion**: ✅ PASS - Uses existing interface patterns and DI container  
**Test-First Approach**: ✅ PASS - Will generate contract tests before implementation  
**API Documentation**: ✅ PASS - Follows existing ProducesResponseType pattern  
**Security Standards**: ✅ PASS - Maintains JWT authentication and audit logging  
**Performance Requirements**: ✅ PASS - Aligns with existing scalability patterns

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
├── DigitalSignage.Api/              # Web API Controllers + DTOs
│   ├── Controllers/
│   │   └── DeviceRegistrationController.cs (extend with QR endpoints)
│   └── Program.cs
├── DigitalSignage.Application/      # Business Logic + Services
│   ├── DTOs/DeviceRegistration/     # QR Code DTOs
│   ├── Interfaces/                  # QR Service Interfaces
│   └── Services/                    # QR Code Service Implementation
├── DigitalSignage.Domain/           # Core Entities + Enums
│   ├── Entities/
│   │   └── DeviceRegistrationRequest.cs (extend with QR fields)
│   └── Enums/
│       └── RegistrationMethod.cs (new)
└── DigitalSignage.Infrastructure/   # Data Access + External Services
    ├── Data/                        # EF Core Context + Configurations
    ├── Services/                    # QR Code Generation Service
    └── Repositories/                # Data Access Layer

tests/
├── DigitalSignage.Api.Tests/        # API Integration Tests
├── DigitalSignage.Application.Tests/ # Service Unit Tests
├── DigitalSignage.Domain.Tests/     # Domain Logic Tests
└── DigitalSignage.Infrastructure.Tests/ # Repository/Service Tests
```

**Structure Decision**: Extending existing .NET 8 Clean Architecture solution with QR Code functionality integrated into current layer structure. Maintains separation of concerns and existing patterns.

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

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
