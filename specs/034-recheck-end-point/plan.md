
# Implementation Plan: Complete API Endpoint Audit & Request/Response Mapping Verification

**Branch**: `034-recheck-end-point` | **Date**: 2025-10-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/034-recheck-end-point/spec.md`

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
**Primary Requirement**: Perform comprehensive audit of all API endpoint integrations between Next.js frontend and .NET backend to verify request/response mappings are correct, complete, and follow established guidelines.

**Technical Approach**: 
1. Systematically scan all service files in `src/digital-signage-web/src/services/` directory
2. For each API call, verify backend controller endpoint structure matches frontend expectations
3. Check response structure handling (direct arrays vs wrapped objects)
4. Validate null guards, fallback values, and error handling
5. Ensure compliance with `copilot-instructions-ui.instructions.md` patterns
6. Document findings and apply fixes following API Response Mapping guidelines

## Technical Context
**Language/Version**: 
- Frontend: TypeScript 5.x with Next.js 15 (React 18)
- Backend: C# .NET 8 with ASP.NET Core Web API

**Primary Dependencies**: 
- Frontend: Axios (API client), React Query (server state), Redux Toolkit (global state)
- Backend: Entity Framework Core 9, PostgreSQL (Npgsql), JWT Authentication, AWS S3

**Storage**: 
- PostgreSQL database (backend data persistence)
- LocalStorage/SessionStorage (frontend client state)

**Testing**: 
- Frontend: Jest, React Testing Library
- Backend: xUnit, InMemory Database, SQLite
- Integration: API endpoint contract validation

**Target Platform**: 
- Frontend: Web browsers (Chrome, Firefox, Safari, Edge)
- Backend: Linux server (Docker containers)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: 
- API response time <500ms p95
- Frontend bundle size <500KB (gzipped)
- Zero runtime errors in browser console

**Constraints**: 
- Must follow existing copilot-instructions-ui.instructions.md patterns
- Must maintain backward compatibility with existing API endpoints
- Must not break current UI functionality during audit/fixes
- All fixes must be tested before deployment

**Scale/Scope**: 
- ~20-30 service files to audit
- ~100+ API endpoint calls across all services
- ~60+ backend API controller endpoints
- All features: Auth, Devices, Media, Playlists, Schedules, Analytics, Reports, Users

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: Constitution file is a template placeholder. For this audit feature, we establish pragmatic principles:

### Audit Principles
1. **Non-Destructive First**: Audit and document before making changes
2. **Pattern Compliance**: All fixes must follow copilot-instructions-ui.instructions.md
3. **Backward Compatibility**: No breaking changes to existing functionality
4. **Test Validation**: Verify each fix doesn't introduce new issues
5. **Documentation**: Comprehensive audit report for team reference

### Quality Gates
- ✅ All service files scanned (100% coverage)
- ✅ No critical mapping issues remain unresolved
- ✅ All fixes follow established patterns
- ✅ Manual testing confirms no regressions
- ✅ Audit report documents all changes

**Initial Assessment**: PASS - Audit-only feature with clear scope and non-breaking approach

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
# Backend (.NET 8 Web API)
src/
├── DigitalSignage.Api/
│   └── Controllers/              # API Controllers to verify endpoint structure
│       ├── MediaController.cs
│       ├── DevicesController.cs
│       ├── PlaylistController.cs
│       ├── ScheduleController.cs
│       ├── UserController.cs
│       ├── AnalyticsController.cs
│       └── [60+ other controllers]
├── DigitalSignage.Application/
│   └── DTOs/                     # Data Transfer Objects (response structures)
└── DigitalSignage.Infrastructure/

# Frontend (Next.js 15 + TypeScript)
src/digital-signage-web/
├── src/
│   ├── services/                 # PRIMARY AUDIT TARGET
│   │   ├── api/                  # Auth services
│   │   │   ├── authService.ts
│   │   │   ├── userService.ts
│   │   │   └── userPermissionService.ts
│   │   ├── mediaService.ts       # Media management
│   │   ├── deviceService.ts      # Device management
│   │   ├── playlistService.ts    # Playlist management
│   │   ├── scheduleService.ts    # Schedule management
│   │   ├── analyticsService.ts   # Analytics data
│   │   ├── dashboardService.ts   # Dashboard metrics
│   │   ├── reportsService.ts     # Report generation
│   │   ├── tagService.ts         # Tag management
│   │   ├── settingsService.ts    # System settings
│   │   ├── deviceGroupService.ts
│   │   ├── userScheduleService.ts
│   │   ├── bulkOperationService.ts
│   │   ├── deviceDetailService.ts
│   │   ├── hardwareDetectionService.ts
│   │   ├── deviceHardwareProfileService.ts
│   │   ├── enhancedMediaService.ts
│   │   └── [20+ service files total]
│   ├── lib/
│   │   └── api.ts                # apiClient configuration (verify usage)
│   └── types/                    # TypeScript interfaces
└── tests/

# Documentation Output
docs/
└── API-ENDPOINT-AUDIT-REPORT.md  # Generated audit findings
```

**Structure Decision**: Web application structure (Option 2) - This is an audit/verification feature that spans both frontend service layer and backend API controllers. The primary focus is on the frontend `src/services/` directory where all API calls are made, cross-referencing with backend `Controllers/` to verify endpoint contracts match.

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
1. **Discovery Tasks** (Parallel):
   - Scan all service files in `src/services/` directory
   - Enumerate all apiClient method calls
   - Map backend controller endpoints
   - Create service file inventory

2. **Audit Tasks** (Sequential by domain):
   - Auth & Users domain (3-4 service files)
   - Core Content domain (Media, Playlists, Schedules) (8-10 files)
   - Devices & Hardware domain (6-8 files)
   - Analytics & Reports domain (4-6 files)
   - Settings & Utilities domain (3-4 files)
   
3. **Validation Tasks** (Per service file):
   - Run 7-point checklist on each method
   - Document issues in audit report
   - Classify by severity
   - Map to backend endpoint structure

4. **Fix Tasks** (By severity):
   - Fix all CRITICAL issues first
   - Fix HIGH priority issues
   - Fix MEDIUM priority issues
   - Fix LOW priority issues (optional)

5. **Verification Tasks** (Per domain):
   - Run TypeScript compilation
   - Execute build process
   - Manual UI testing
   - Browser console monitoring

**Ordering Strategy**:
- **Phase A**: Discovery (parallel, all files)
- **Phase B**: Audit by domain (sequential domains, parallel files within domain)
- **Phase C**: Fix by severity (sequential CRITICAL→HIGH→MEDIUM→LOW)
- **Phase D**: Verification (per domain after fixes)

**Task Dependencies**:
- Discovery must complete before Audit
- Audit must complete before Fixes
- Fixes must complete before Verification
- Within each phase, tasks can run in parallel where independent

**Estimated Output**: 35-45 numbered tasks in tasks.md:
- 5-8 discovery tasks
- 20-25 audit tasks (one per service file)
- 8-10 fix batch tasks (grouped by severity)
- 5-6 verification tasks
- 1 final report task

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
- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
- [x] Phase 3: Tasks generated (/tasks command) ✅
- [ ] Phase 4: Implementation complete ⏳ Ready to Execute
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [x] Complexity deviations documented (None) ✅

**Artifacts Generated**:
- [x] `research.md` - Complete with 10 key decisions
- [x] `data-model.md` - 8 entities with relationships
- [x] `contracts/audit-report-contract.md` - Report schema and validation
- [x] `quickstart.md` - Step-by-step audit execution guide
- [x] `.github/copilot-instructions.md` - Updated with feature context
- [x] `tasks.md` - 48 actionable tasks with dependencies ✅

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
