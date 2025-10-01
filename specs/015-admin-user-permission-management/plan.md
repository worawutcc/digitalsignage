
# Implementation Plan: Admin User Permission Management

**Branch**: `015-admin-user-permission-management` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-admin-user-permission-management/spec.md`

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
Implement comprehensive Role-Based Access Control (RBAC) system for admin management of user permissions across hierarchical device groups. Features four-tier permission levels (NoAccess, ViewOnly, ManageContent, FullControl) with hierarchical inheritance, explicit override capabilities, and complete audit trail. Extends existing JWT authentication and device hierarchy to provide granular access control for digital signage content management.

## Technical Context
**Language/Version**: C# .NET 8 with ASP.NET Core Web API  
**Primary Dependencies**: Entity Framework Core 9, JWT Bearer Authentication, AutoMapper, log4net  
**Storage**: PostgreSQL with Npgsql provider for RBAC tables and audit logs  
**Testing**: xUnit with InMemory database for integration tests, Moq for unit tests  
**Target Platform**: Linux/Windows server with Docker containerization support
**Project Type**: web - Clean Architecture backend API extending existing digital signage system  
**Performance Goals**: <100ms permission validation, 1000+ concurrent users with caching  
**Constraints**: Immutable audit logs, hierarchical inheritance calculation efficiency  
**Scale/Scope**: Enterprise-grade RBAC supporting 500+ users, 1000+ device groups, 2+ year audit retention

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Clean Architecture Compliance**:
- ✅ **Domain Independence**: New entities (UserDeviceGroupPermission, PermissionAuditLog) have no external dependencies
- ✅ **Application Layer Isolation**: Permission business logic isolated in PermissionService with interface abstraction
- ✅ **Infrastructure Encapsulation**: EF Core implementation details contained in Infrastructure layer
- ✅ **API Layer Separation**: Controllers handle HTTP concerns only, delegate to Application services

**Security Principles**:
- ✅ **JWT Integration**: Extends existing authentication without breaking changes
- ✅ **Role-Based Access**: Admin-only permission management with proper authorization middleware
- ✅ **Audit Trail**: Immutable audit logs for compliance and security tracking

**Performance & Scalability**:
- ✅ **Caching Strategy**: Permission caching planned to avoid recursive hierarchy calculations
- ✅ **Database Optimization**: Proper indexing on permission lookup columns
- ✅ **Hierarchical Efficiency**: Permission inheritance calculation optimized for large device hierarchies

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
├── DigitalSignage.Domain/           # Core entities and enums
│   ├── Entities/
│   │   ├── UserDeviceGroupPermission.cs      # New RBAC entity
│   │   └── PermissionAuditLog.cs             # New audit entity
│   ├── Enums/
│   │   └── UserPermissionLevel.cs            # Four-tier permission enum
│   └── Interfaces/
│       └── IPermissionRepository.cs          # New repository interface
├── DigitalSignage.Application/      # Business logic and services
│   ├── DTOs/
│   │   ├── UserPermissionDto.cs              # Permission response DTO
│   │   ├── SetPermissionRequest.cs           # Permission update request
│   │   └── PermissionAuditDto.cs             # Audit log DTO
│   ├── Services/
│   │   ├── IPermissionService.cs             # Permission business logic interface
│   │   └── PermissionService.cs              # Permission business logic implementation
│   └── Mappings/
│       └── PermissionMappingProfile.cs       # AutoMapper configuration
├── DigitalSignage.Infrastructure/   # Data access and external services
│   ├── Data/
│   │   ├── Configurations/
│   │   │   ├── UserDeviceGroupPermissionConfiguration.cs
│   │   │   └── PermissionAuditLogConfiguration.cs
│   │   └── Repositories/
│   │       └── PermissionRepository.cs       # EF Core implementation
│   └── Migrations/                           # EF Core migrations for new tables
└── DigitalSignage.Api/             # Controllers and API configuration
    ├── Controllers/
    │   ├── AdminPermissionController.cs      # Admin permission management
    │   └── UserPermissionController.cs       # User permission queries
    ├── Middleware/
    │   └── PermissionAuthorizationMiddleware.cs # Permission validation middleware
    └── Extensions/
        └── PermissionServiceExtensions.cs    # DI registration

tests/
├── DigitalSignage.Domain.Tests/
├── DigitalSignage.Application.Tests/
│   └── Services/
│       └── PermissionServiceTests.cs        # Business logic unit tests
├── DigitalSignage.Infrastructure.Tests/
│   └── Repositories/
│       └── PermissionRepositoryTests.cs     # Data access tests
└── DigitalSignage.Api.Tests/
    └── Controllers/
        ├── AdminPermissionControllerTests.cs # API integration tests
        └── UserPermissionControllerTests.cs  # API integration tests
```

**Structure Decision**: Clean Architecture pattern with four-layer separation (Domain → Application → Infrastructure → Api). New RBAC functionality extends existing authentication system while maintaining architectural boundaries. Permission logic encapsulated in Application layer with EF Core data access in Infrastructure layer.

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
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
