
# Implementation Plan: User Schedule Assignment UI (Phase 1)

**Branch**: `020-phase-1` | **Date**: 2025-10-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/020-phase-1/spec.md`

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
**Primary Requirement**: Build admin UI for assigning content schedules to individual users in a digital signage system, enabling personalized content delivery based on user roles and assignments.

**Key Features**:
- User schedule assignment page with REPLACE semantics (not append)
- Schedule list enhancements showing default flags and assigned user counts
- View users assigned to specific schedules
- Mark schedules as default for fallback content delivery
- Warning modals for replacement operations

**Technical Approach**: 
- Next.js 15 frontend with React 19 and TypeScript
- React Query for server state management
- Redux Toolkit for global UI state
- Integration with existing Feature 019 backend APIs (already implemented)
- Component-based architecture following feature-folder organization

## Technical Context
**Language/Version**: TypeScript 5.x with Next.js 15 (React 19)
**Primary Dependencies**: 
- React Query/TanStack Query (server state)
- Redux Toolkit (global state)
- React Hook Form + Zod (forms & validation)
- Axios (API client)
- Tailwind CSS 4 (styling)
- shadcn/ui or Radix UI (accessible components)
- Lucide React (icons)

**Storage**: PostgreSQL (backend) via REST API, LocalStorage/SessionStorage for client state
**Testing**: Jest + React Testing Library for unit tests, Playwright for E2E
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - modern versions)
**Project Type**: Web (frontend only - backend APIs already complete)
**Performance Goals**: 
- Initial page load < 2s
- API response rendering < 500ms
- Smooth 60fps UI interactions
- React Query caching for < 100ms repeat views

**Constraints**: 
- Must integrate with existing backend APIs (no backend changes)
- Follow existing Next.js 15 App Router patterns
- Maintain existing component library standards
- Admin-only features (JWT auth required)
- Replace semantics for schedule assignments (explicit requirement)

**Scale/Scope**: 
- Support 100-1000+ users in system
- Handle 50-500+ schedules
- Real-time UI updates after mutations
- Mobile-responsive design required

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS (Constitution file is template - using Digital Signage project standards)

**Compliance Review**:
- ✅ **Component-First**: Building reusable UI components following feature-folder pattern
- ✅ **Type Safety**: Full TypeScript with strict mode, Zod schemas for validation
- ✅ **Test Coverage**: Unit tests for components, integration tests for user flows
- ✅ **API Integration**: Existing backend APIs tested and documented (Feature 019)
- ✅ **Clean Architecture**: Features organized by domain (users, schedules, devices)
- ✅ **Code Standards**: Following established Next.js 15 and React 19 patterns

**No Constitutional Violations**: This is a frontend-only feature building on existing infrastructure. No new services, no breaking changes, no architectural deviations.

## Project Structure

### Documentation (this feature)
```
specs/020-phase-1/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── user-schedules-api.yaml
│   └── component-contracts.md
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (Frontend - Next.js 15)
```
src/digital-signage-web/src/
├── app/
│   └── users/
│       └── [userId]/
│           └── schedules/
│               └── page.tsx              # NEW: User schedule assignment page
│
├── features/
│   ├── users/
│   │   ├── components/
│   │   │   ├── UserScheduleAssignment.tsx       # NEW: Main assignment component
│   │   │   ├── UserScheduleAssignment.types.ts  # NEW
│   │   │   ├── AssignedSchedulesList.tsx        # NEW: Current assignments list
│   │   │   └── AssignedSchedulesList.types.ts   # NEW
│   │   ├── hooks/
│   │   │   ├── useUserSchedules.ts              # NEW: React Query hooks
│   │   │   └── useAssignSchedules.ts            # NEW: Mutation hooks
│   │   ├── services/
│   │   │   └── userScheduleService.ts           # NEW: API client methods
│   │   └── types/
│   │       └── userSchedule.ts                  # NEW: TypeScript interfaces
│   │
│   └── schedules/
│       ├── components/
│       │   ├── ScheduleSelector.tsx             # NEW: Multi-select schedules
│       │   ├── ScheduleSelector.types.ts        # NEW
│       │   ├── DefaultScheduleToggle.tsx        # NEW: Default flag toggle
│       │   ├── DefaultScheduleToggle.types.ts   # NEW
│       │   ├── AssignedUsersList.tsx            # NEW: Users per schedule
│       │   ├── AssignedUsersList.types.ts       # NEW
│       │   ├── ContentSourceBadge.tsx           # NEW: Priority indicator
│       │   └── ContentSourceBadge.types.ts      # NEW
│       ├── hooks/
│       │   └── useSetDefaultSchedule.ts         # NEW: Default toggle mutation
│       └── services/
│           └── scheduleService.ts               # UPDATE: Add new methods
│
└── components/
    └── ui/
        ├── ConfirmationModal.tsx                # NEW: Reusable confirmation
        ├── ConfirmationModal.types.ts           # NEW
        ├── EmptyState.tsx                       # NEW: Empty state component
        └── EmptyState.types.ts                  # NEW

tests/
├── features/
│   ├── users/
│   │   ├── UserScheduleAssignment.test.tsx
│   │   └── userScheduleService.test.ts
│   └── schedules/
│       ├── ScheduleSelector.test.tsx
│       └── DefaultScheduleToggle.test.tsx
└── e2e/
    └── user-schedule-assignment.spec.ts
```

**Structure Decision**: Web application frontend following Next.js 15 App Router with feature-folder organization. Backend APIs already exist and are not modified in this feature.

## Phase 0: Outline & Research ✅ COMPLETE

**Status**: Complete  
**Output**: `research.md`

**Research Completed**:
1. ✅ State management strategy (React Query + Redux Toolkit)
2. ✅ Form validation approach (React Hook Form + Zod)
3. ✅ Component architecture pattern (Feature folders)
4. ✅ API integration best practices (Axios + interceptors)
5. ✅ Warning modal UX pattern (Mandatory confirmation)
6. ✅ Empty state design (Actionable CTAs)
7. ✅ Performance optimization strategy (Virtual scrolling + pagination)
8. ✅ Error handling strategy (Layered with boundaries)

**Key Decisions**:
- **State**: Hybrid React Query (server) + Redux Toolkit (UI)
- **Forms**: React Hook Form + Zod for type-safe validation
- **Architecture**: Feature-folder organization with presentation/container separation
- **Performance**: Virtual scrolling for 500+ item lists
- **UX**: Mandatory confirmation modal with checkbox for REPLACE semantics

**Research Document**: [research.md](./research.md)

---

## Phase 1: Design & Contracts ✅ COMPLETE

**Status**: Complete  
**Outputs**: 
- `data-model.md` - TypeScript types and Zod schemas
- `contracts/user-schedules-api.md` - API contracts (6 endpoints)
- `contracts/component-contracts.md` - React component contracts
- `quickstart.md` - Manual testing guide
- `.github/copilot-instructions-web.md` - Updated with Phase 1 context

**Artifacts Generated**:

### 1. Data Model (data-model.md)
- 35+ TypeScript interfaces and types
- Zod validation schemas for all forms
- Type guards for runtime validation
- API request/response types aligned with backend DTOs
- React Query type definitions
- Redux state slice types

**Key Types**:
- `UserSchedule` - Assignment entity
- `Schedule` (enhanced) - With `isDefault` and `assignedUsersCount`
- `AssignSchedulesRequest` - REPLACE semantics
- `ScheduleAssignmentFormData` - Form validation

### 2. API Contracts (contracts/user-schedules-api.md)
- 6 backend API endpoints documented (all already implemented)
- Request/response schemas for each endpoint
- Error response formats
- Authentication requirements (JWT Bearer)
- Contract test scenarios for each endpoint
- Integration test examples

**Endpoints**:
1. `GET /api/admin/users/{userId}/schedules` - Get assignments
2. `POST /api/admin/users/{userId}/schedules` - Assign (REPLACE)
3. `DELETE /api/admin/users/{userId}/schedules` - Remove all
4. `GET /api/admin/schedules/{scheduleId}/users` - Reverse lookup
5. `PUT /api/admin/schedules/{scheduleId}/default` - Toggle default
6. `GET /api/admin/schedules` - List for selector

### 3. Component Contracts (contracts/component-contracts.md)
- 10 React components with props interfaces
- 3 React Query custom hooks
- 2 API service layers
- Contract tests for each component
- Integration test scenarios
- E2E test flow

**Components**:
- Pages: `UserSchedulesPage`
- Feature: `UserScheduleAssignment`, `AssignedSchedulesList`, `ScheduleSelector`
- Schedule: `DefaultScheduleToggle`, `AssignedUsersList`, `ContentSourceBadge`
- UI: `ConfirmationModal`, `EmptyState`

### 4. Quickstart Guide (quickstart.md)
- 10 detailed test scenarios
- Manual testing procedures
- Expected results for each scenario
- Validation checklists
- Troubleshooting guide
- Performance testing procedures

**Key Scenarios**:
- View user schedules
- Assign schedules (new)
- Replace existing assignments (with warning)
- Remove all assignments
- View users for schedule
- Toggle default flag
- Search and filter
- Mobile responsive
- Error handling
- Performance with large datasets

### 5. Agent Context Updated
- ✅ Added TypeScript 5.x + Next.js 15 context
- ✅ Added PostgreSQL + LocalStorage storage context
- ✅ Updated recent changes
- ✅ Preserved manual additions

**Agent File**: `.github/copilot-instructions-web.md`

---
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

### 1. Foundation Tasks (Types & Services)
From `data-model.md`, generate tasks for:
- [ ] Create TypeScript type definitions (features/users/types/)
- [ ] Create TypeScript type definitions (features/schedules/types/)
- [ ] Create Zod validation schemas (features/users/schemas/)
- [ ] Implement userScheduleService API client
- [ ] Update scheduleService with new methods
- [ ] Create Redux slice for schedule assignment UI state

**Estimated**: 6 tasks, 4-6 hours

### 2. Core Component Tasks (TDD Approach)
From `component-contracts.md`, generate tasks for:
- [ ] Write contract tests for UserScheduleAssignment [P]
- [ ] Implement UserScheduleAssignment component
- [ ] Write contract tests for AssignedSchedulesList [P]
- [ ] Implement AssignedSchedulesList component
- [ ] Write contract tests for ScheduleSelector [P]
- [ ] Implement ScheduleSelector component (with REPLACE warning)
- [ ] Write contract tests for DefaultScheduleToggle [P]
- [ ] Implement DefaultScheduleToggle component
- [ ] Write contract tests for AssignedUsersList [P]
- [ ] Implement AssignedUsersList component
- [ ] Write contract tests for ContentSourceBadge [P]
- [ ] Implement ContentSourceBadge component

**Estimated**: 12 tasks, 10-14 hours

### 3. UI Components Tasks
- [ ] Write contract tests for ConfirmationModal [P]
- [ ] Implement ConfirmationModal reusable component
- [ ] Write contract tests for EmptyState [P]
- [ ] Implement EmptyState reusable component

**Estimated**: 4 tasks, 2-3 hours

### 4. React Query Hooks Tasks
From `data-model.md` hook definitions:
- [ ] Implement useUserSchedules hook with caching
- [ ] Implement useAssignSchedules mutation hook
- [ ] Implement useRemoveUserSchedules mutation hook
- [ ] Implement useScheduleUsers hook
- [ ] Implement useSetDefaultSchedule mutation hook

**Estimated**: 5 tasks, 3-4 hours

### 5. Page Integration Tasks
- [ ] Create user schedule assignment page (/users/[userId]/schedules)
- [ ] Add navigation link to user schedules from user list
- [ ] Update schedules page with new components (default toggle, user count)
- [ ] Implement breadcrumb navigation
- [ ] Add mobile responsive styles

**Estimated**: 5 tasks, 4-5 hours

### 6. Integration Tests Tasks
From `quickstart.md` scenarios:
- [ ] Write E2E test: View user schedules
- [ ] Write E2E test: Assign schedules (new)
- [ ] Write E2E test: Replace assignments with warning
- [ ] Write E2E test: Remove all assignments
- [ ] Write E2E test: View users for schedule
- [ ] Write E2E test: Toggle default flag
- [ ] Write E2E test: Search and filter
- [ ] Write E2E test: Mobile responsive
- [ ] Write E2E test: Error handling

**Estimated**: 9 tasks, 6-8 hours

### 7. Performance & Polish Tasks
- [ ] Implement virtual scrolling for large schedule lists
- [ ] Add debounced search in schedule selector
- [ ] Optimize React Query cache invalidation
- [ ] Add loading skeletons for all async operations
- [ ] Implement optimistic updates for mutations
- [ ] Add toast notifications for all actions
- [ ] Accessibility audit and fixes
- [ ] Performance audit (Lighthouse)

**Estimated**: 8 tasks, 5-7 hours

### 8. Documentation & Deployment Tasks
- [ ] Update README with Phase 1 features
- [ ] Document API integration patterns
- [ ] Create developer guide for REPLACE semantics
- [ ] Update component library documentation
- [ ] Run full test suite validation
- [ ] Build production bundle and test
- [ ] Deploy to staging environment
- [ ] Final QA validation using quickstart.md

**Estimated**: 8 tasks, 4-5 hours

---

**Total Estimated Tasks**: 57 tasks  
**Total Estimated Time**: 38-52 hours  
**Parallel Execution**: Tasks marked [P] can run in parallel (contract tests, component implementations)

**Task Ordering Strategy**:
1. **TDD Order**: Tests before implementation (contract tests → implementation)
2. **Dependency Order**: 
   - Types → Services → Hooks → Components → Pages → Integration
3. **Critical Path**: Core assignment workflow first (UserScheduleAssignment, ScheduleSelector)
4. **Parallel Work**: Contract tests can be written independently [P]

**IMPORTANT**: The /tasks command will generate the full tasks.md file with all 57 tasks in proper order. This /plan command stops here.

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

**No Violations**: This feature follows all established patterns and standards. No architectural deviations or complexity violations.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No violations | Feature uses existing patterns and infrastructure |

---

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
- [ ] Phase 3: Tasks generated (/tasks command) - NEXT STEP
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [x] Complexity deviations documented: N/A ✅

**Artifacts Generated**:
- [x] research.md (8 research decisions documented)
- [x] data-model.md (35+ types and schemas)
- [x] contracts/user-schedules-api.md (6 API endpoints)
- [x] contracts/component-contracts.md (10 components, 3 hooks, 2 services)
- [x] quickstart.md (10 test scenarios)
- [x] .github/copilot-instructions-web.md (updated with Phase 1 context)

---

## Summary & Next Steps

### ✅ Planning Complete

**Phase 0 + Phase 1 Deliverables**:
- 8 research decisions with rationale
- 35+ TypeScript types and Zod schemas
- 6 API endpoint contracts (backend ready)
- 10 React component contracts
- 3 React Query hooks
- 2 API service layers
- 10 detailed test scenarios
- Agent context updated

**Ready for Implementation**:
- All technical unknowns resolved
- Architecture decisions documented
- Component contracts defined
- API integration patterns established
- Testing strategy documented
- Performance optimization planned

### 📋 Next Command: `/tasks`

The `/tasks` command will:
1. Load tasks-template.md
2. Generate 57 ordered, numbered tasks
3. Create tasks.md in specs/020-phase-1/
4. Tasks will follow TDD order (tests → implementation)
5. Mark parallel tasks with [P]
6. Estimate time for each task
7. Define acceptance criteria
8. Specify file paths to create/modify

**Estimated Timeline**:
- Phase 3 (Task Generation): < 5 minutes (automated)
- Phase 4 (Implementation): 38-52 hours
- Phase 5 (Validation): 4-6 hours

**Critical Path**: Core assignment workflow (20-25 hours of 38-52 total)

---
*Based on Constitution v2.1.1 - See `.specify/memory/constitution.md`*
*Plan generated: 2025-10-02*
*Ready for: /tasks command*
