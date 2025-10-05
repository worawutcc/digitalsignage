
# Implementation Plan: Device Approval + Group Management System

**Branch**: `027-device-approval-group` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/027-device-approval-group/spec.md`

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
Enhance existing device approval workflow and group management capabilities for Android TV digital signage deployment. The system leverages existing DeviceApproval, DeviceGroup, and PlaylistAssignment entities to provide streamlined admin interfaces for device approval, hierarchical group organization, and content distribution. This builds upon established database schema and approval workflows rather than creating new infrastructure.

## Technical Context
**Language/Version**: C# .NET 8 (Backend), TypeScript 5.x (Frontend)  
**Primary Dependencies**: ASP.NET Core Web API, Entity Framework Core 9, Next.js 15, React 18, PostgreSQL, JWT Authentication, AWS S3  
**Storage**: PostgreSQL database with Entity Framework Core migrations  
**Testing**: xUnit (Backend), Jest (Frontend), Integration tests, Contract tests  
**Target Platform**: Linux server (Backend), Modern browsers (Frontend)
**Project Type**: web - Clean Architecture backend + Next.js frontend  
**Performance Goals**: Real-time device status updates, <500ms API response times, WebSocket for live updates  
**Constraints**: Enterprise security requirements, RBAC compliance, PostgreSQL datetime handling (timestamp without time zone)  
**Scale/Scope**: Support for 1000+ concurrent devices, admin dashboard for multiple administrators, bulk operations support

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Clean Architecture Compliance**: ✅ PASS - Feature follows existing Clean Architecture pattern (Api/Application/Domain/Infrastructure layers)  
**Repository Pattern**: ✅ PASS - Uses existing repository pattern for data access  
**DTO Pattern**: ✅ PASS - API uses DTOs for request/response, no domain entities exposed  
**Test-First Approach**: ✅ PASS - Contract tests generated before implementation  
**Security Compliance**: ✅ PASS - JWT authentication, RBAC, audit logging maintained  
**PostgreSQL DateTime Standards**: ✅ PASS - Follows existing timestamp without time zone pattern

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
├── DigitalSignage.Api/              # Web API Controllers
│   ├── Controllers/
│   ├── Extensions/
│   └── Program.cs
├── DigitalSignage.Application/      # Business Logic & Services
│   ├── Services/
│   ├── DTOs/
│   └── Interfaces/
├── DigitalSignage.Domain/           # Core Entities & Interfaces
│   ├── Entities/
│   ├── Enums/
│   └── Interfaces/
├── DigitalSignage.Infrastructure/   # Data Access & EF Core
│   ├── Data/
│   ├── Repositories/
│   └── Configurations/
└── digital-signage-web/            # Next.js Frontend
    ├── src/
    │   ├── app/                     # Next.js App Router
    │   ├── components/              # UI Components
    │   ├── features/               # Feature-based organization
    │   ├── services/               # API integration
    │   └── types/                  # TypeScript types
    └── tests/

tests/
├── DigitalSignage.Api.Tests/
├── DigitalSignage.Application.Tests/
├── DigitalSignage.Domain.Tests/
└── DigitalSignage.Infrastructure.Tests/
```

**Structure Decision**: Web application with Clean Architecture backend (.NET 8) and Next.js 15 frontend. Feature extends existing device management capabilities with approval workflow and group management functionality.

## Phase 0: Outline & Research
1. **Analyze existing infrastructure** from current database schema:
   - Map existing entities: DeviceRegistrationRequest, DeviceApproval, DeviceGroup, Device, PlaylistAssignment
   - Identify existing workflows: PIN/QR registration, approval process, group hierarchy
   - Document current relationships: Device.DeviceGroupId, PlaylistAssignment.DeviceGroupId

2. **Research integration points**:
   ```
   Task: "Analyze existing AdminDeviceRegistrationController capabilities"
   Task: "Document DeviceGroup hierarchical structure and validation"
   Task: "Map PlaylistAssignment content distribution patterns"
   Task: "Review existing bulk operations in current controllers"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Current State: [what exists now]
   - Enhancement Needed: [what to extend/improve]
   - Integration Approach: [how to leverage existing infrastructure]

**Output**: research.md with existing schema analysis and integration strategy

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Document integration strategy** → `data-model.md`:
   - Map existing entity enhancements needed
   - Document relationships to preserve (Device.DeviceGroupId, etc.)
   - Validation rules from existing schema constraints

2. **Generate API enhancement contracts** from functional requirements:
   - Extend existing AdminDeviceRegistrationController for bulk operations
   - Add DeviceGroup management endpoints for hierarchy navigation
   - Enhance PlaylistAssignment for group-level content distribution
   - Output OpenAPI specification to `/contracts/`

3. **Generate contract tests** from enhancement contracts:
   - Test files for extended controllers
   - Assert existing + new request/response schemas
   - Tests must fail initially (enhancements not implemented yet)

4. **Extract integration test scenarios** from user stories:
   - Each story → test using existing entity workflows
   - Quickstart integration = validate existing + enhanced functionality

5. **Update agent file incrementally** with integration context:
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
- Generate enhancement tasks from Phase 1 integration design
- Each API enhancement → controller extension task [P]
- Each service enhancement → business logic task [P]
- Each UI feature → component creation task
- Integration tasks to connect enhanced APIs with frontend

**Ordering Strategy**:
- Enhancement order: Extend existing before new functionality
- Integration order: Backend enhancements before frontend connections
- TDD order: Contract tests validate enhanced endpoints
- Mark [P] for parallel execution (independent controller/service extensions)

**Estimated Output**: 15-20 numbered, ordered enhancement tasks in tasks.md

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
- [x] Phase 0: Research complete - Existing schema analysis complete
- [x] Phase 1: Design complete - Integration strategy documented  
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS - Leverages existing infrastructure
- [x] Post-Design Constitution Check: PASS - No new architecture violations
- [x] All NEEDS CLARIFICATION resolved - Integration approach defined
- [x] Complexity deviations documented - None required, uses existing schema

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
