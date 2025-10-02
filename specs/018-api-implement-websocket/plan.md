
# Implementation Plan: WebSocket API for Real-Time Frontend Communication

**Branch**: `018-api-implement-websocket` | **Date**: 2025-10-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-api-implement-websocket/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   ✓ Feature spec loaded successfully
2. Fill Technical Context
   ✓ Project Type: Web (frontend: Next.js 15 + backend: .NET 8 API)
   ✓ Structure Decision: Backend-focused with frontend integration points
3. Fill the Constitution Check section
   ✓ Constitution template exists but not project-specific
   ✓ Following Clean Architecture principles per copilot-instructions.md
4. Evaluate Constitution Check section
   ✓ No violations - follows established patterns
   → Update Progress Tracking: Initial Constitution Check PASS
5. Execute Phase 0 → research.md
   ✓ Technology choices clear from existing codebase
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, copilot-instructions update
   ✓ Design artifacts planned
7. Re-evaluate Constitution Check section
   ✓ Design follows Clean Architecture
   → Update Progress Tracking: Post-Design Constitution Check PASS
8. Plan Phase 2 → Describe task generation approach
   ✓ TDD approach with contract tests first
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

**Primary Requirement**: Implement a WebSocket server at `/ws` endpoint in the backend API to enable real-time bidirectional communication with the Next.js admin frontend. The system will broadcast events for device status changes, schedule updates, media uploads, and system alerts to all connected and authenticated clients.

**Technical Approach**: Use ASP.NET Core SignalR (built on WebSocket protocol) to implement the real-time communication hub. Integrate with existing JWT authentication, RBAC system, and service layer to emit events when business operations occur. The implementation will follow Clean Architecture principles with hub classes in the Api layer, event abstractions in Application layer, and integration points in existing services.

## Technical Context
**Language/Version**: C# .NET 8 with ASP.NET Core Web API  
**Primary Dependencies**: ASP.NET Core SignalR, Microsoft.AspNetCore.Authentication.JwtBearer, Entity Framework Core 9  
**Storage**: PostgreSQL (existing) for connection audit logs, in-memory for active connection tracking  
**Testing**: xUnit, Microsoft.AspNetCore.SignalR.Client (for integration tests), InMemory testing utilities  
**Target Platform**: Linux/Windows server (Docker-compatible), integrated with existing API at port 5100  
**Project Type**: Web - Backend API with existing frontend (Next.js 15)  
**Performance Goals**: 
- WebSocket connection establishment < 500ms
- Event delivery latency < 1 second under normal load
- Support 100+ concurrent connections
- Connection stability > 99% uptime  
**Constraints**: 
- Must integrate with existing JWT authentication system
- Must respect existing RBAC permissions for event filtering
- Must not break existing REST API functionality
- Must use `/ws` path for WebSocket endpoint  
**Scale/Scope**: 
- 100+ concurrent admin users
- Event types: 7 core event types (device_status, schedule_*, media_*, user_action, system_alert, heartbeat)
- Integration points: 4 service layers (Device, Schedule, Media, User services)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Clean Architecture Compliance
- [x] **Layer Separation**: WebSocket hubs in Api layer, event abstractions in Application layer, no direct database access from hubs
- [x] **Dependency Inversion**: Hubs depend on IEventBroadcaster interface, services emit events via abstraction
- [x] **Single Responsibility**: Each hub handles one concern (notifications), event broadcasting separated from business logic
- [x] **Existing Patterns**: Follows established service registration pattern in Extensions/ folder

### Testing Requirements
- [x] **Test-First**: Contract tests for hub methods before implementation
- [x] **Integration Tests**: SignalR client tests for connection lifecycle and message exchange
- [x] **Unit Tests**: Event broadcasting service tests with mocked dependencies

### Security & Performance
- [x] **Authentication**: JWT validation at connection establishment (existing auth system)
- [x] **Authorization**: RBAC-based event filtering (existing authorization system)
- [x] **Performance**: In-memory connection tracking, async message handling, configurable connection limits
- [x] **Audit**: Connection events logged via existing audit logging system

**Initial Check**: PASS - Follows existing Clean Architecture patterns
**Post-Design Check**: (To be verified after Phase 1)

## Project Structure

### Documentation (this feature)
```
specs/018-api-implement-websocket/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── websocket-events.json      # Event message schemas
│   ├── hub-methods.json           # Hub method contracts
│   └── connection-flow.md         # Connection lifecycle documentation
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── DigitalSignage.Api/                      # Web API + WebSocket Hubs
│   ├── Hubs/
│   │   └── NotificationHub.cs               # SignalR hub for real-time events
│   ├── Extensions/
│   │   └── SignalRServiceExtensions.cs      # SignalR service registration
│   ├── Middleware/
│   │   └── WebSocketAuthenticationMiddleware.cs  # WS auth handling
│   └── Program.cs                           # Add SignalR configuration
│
├── DigitalSignage.Application/              # Business Logic + Event Interfaces
│   ├── Interfaces/
│   │   └── IRealtimeEventBroadcaster.cs     # Event broadcasting abstraction
│   ├── Services/
│   │   └── RealtimeEventBroadcaster.cs      # SignalR-based implementation
│   └── DTOs/
│       └── RealtimeEventDto.cs              # Event message structure
│
├── DigitalSignage.Domain/                   # Core Entities
│   └── Enums/
│       └── RealtimeEventType.cs             # Event type enumeration
│
└── DigitalSignage.Infrastructure/           # Data Access (if needed)
    └── Data/
        └── Configurations/
            └── WebSocketConnectionLogConfiguration.cs  # Audit log entity config

tests/
├── DigitalSignage.Api.Tests/
│   ├── Hubs/
│   │   └── NotificationHubTests.cs          # Hub integration tests
│   └── Integration/
│       └── WebSocketConnectionTests.cs      # End-to-end connection tests
│
├── DigitalSignage.Application.Tests/
│   └── Services/
│       └── RealtimeEventBroadcasterTests.cs # Event broadcasting tests
│
└── DigitalSignage.Infrastructure.Tests/     # (If audit logging added)
```

**Structure Decision**: Web application with backend API focus. WebSocket implementation follows existing Clean Architecture:
- **Api Layer**: SignalR hubs (thin, delegate to services), middleware for authentication
- **Application Layer**: Event broadcasting service interface and implementation, DTOs for messages
- **Domain Layer**: Event type enumerations and domain-relevant value objects
- **Infrastructure Layer**: Audit logging configuration if connection logs are persisted

Frontend (src/digital-signage-web/) already has complete WebSocket client - no changes needed there.

## Phase 0: Outline & Research

**Status**: ✅ Complete

### Research Completed

1. **Technology Choice**: ASP.NET Core SignalR selected over native WebSocket
   - Rationale: Built-in auth, connection management, reconnection, type safety
   - See: `research.md` for detailed decision analysis

2. **Architecture Pattern**: Single NotificationHub with event-type-based routing
   - Rationale: Simplicity, aligns with frontend single `/ws` endpoint expectation
   - See: `research.md` - "Decision 2: Hub Architecture Pattern"

3. **Event Broadcasting**: IRealtimeEventBroadcaster abstraction in Application layer
   - Rationale: Clean Architecture compliance, testability, flexibility
   - See: `research.md` - "Decision 3: Event Broadcasting Strategy"

4. **Authentication**: JWT validation at connection establishment
   - Rationale: Reuse existing auth system, frontend already manages JWT
   - See: `research.md` - "Decision 4: Authentication & Authorization"

5. **Scalability**: In-memory tracking with Redis backplane upgrade path
   - Rationale: YAGNI for current scale (100 connections), documented growth path
   - See: `research.md` - "Decision 5: Connection Management & Scalability"

6. **Message Format**: JSON-serialized events matching frontend expectations
   - Rationale: Frontend already implemented, type-safe on both ends
   - See: `research.md` - "Decision 6: Event Message Format"

### Unknowns Resolved
- ✅ All NEEDS CLARIFICATION items resolved
- ✅ Technology stack confirmed (SignalR + existing stack)
- ✅ Integration points identified (5 existing services)
- ✅ Performance requirements validated (achievable with chosen stack)
- ✅ Security approach confirmed (JWT + RBAC)

**Output**: `research.md` (complete)

## Phase 1: Design & Contracts

**Status**: ✅ Complete

*Prerequisites: research.md complete*

### Design Artifacts Created

1. **Data Model** (`data-model.md` - 500+ lines):
   - RealtimeEventType enum (7 event types)
   - RealtimeEventDto<TPayload> base structure
   - 7 event payload DTOs (DeviceStatusChanged, ScheduleConflict, ScheduleUpdated, MediaUploaded, UserAction, SystemAlert, Heartbeat)
   - ConnectionInfo internal model (in-memory tracking)
   - WebSocketConnectionLog audit entity (extends BaseEntity)
   - IRealtimeEventBroadcaster interface (5 methods)
   - Database schema with indexes
   - Message flow diagrams
   - Validation rules and state transitions
   - Performance and security considerations

2. **Connection Lifecycle** (`contracts/connection-flow.md`):
   - Connection establishment flow (JWT auth via query string)
   - Initial handshake (ConnectionEstablished event)
   - Active communication (15s heartbeat, bidirectional events)
   - Error handling (validation, auth, rate limit errors)
   - Disconnection flows (client-initiated, server-initiated, timeout, error)
   - State diagram (5 states)
   - Reconnection strategies (exponential backoff)
   - Security flows (JWT validation, RBAC filtering)
   - Error codes table (WebSocket close codes + app codes)
   - 3 detailed scenarios (device offline, schedule conflict, server restart)

3. **Event Schemas** (`contracts/websocket-events.json`):
   - BaseEvent definition (type, payload, timestamp, metadata)
   - 10 event type schemas with JSON validation
   - Complete examples for each event type
   - Enum constraints for event types
   - Required field specifications

4. **Hub Method Contracts** (`contracts/hub-methods.json`):
   - Server methods: SendHeartbeat, SubscribeToEvents, UnsubscribeFromEvents, AcknowledgeEvent
   - Parameter specifications and return types
   - Invocation examples

5. **Validation Guide** (`quickstart.md` - 600+ lines):
   - 6 comprehensive test scenarios:
     1. Connection establishment with JWT auth verification
     2. Device status event broadcast (API/DB/UI triggers)
     3. Schedule conflict to multiple clients
     4. RBAC event filtering (admin vs viewer roles)
     5. Connection lifecycle (heartbeat, reconnect, token expiry, server restart)
     6. Performance & load (concurrent connections, rapid events)
   - Validation checklist for all 27 functional requirements
   - Tools setup instructions
   - Troubleshooting guide
   - Success criteria verification

### Design Decisions Validated

- **Clean Architecture Compliance**: 
  - Domain layer: Entities, enums, interfaces
  - Application layer: DTOs, service interfaces, broadcasting abstraction
  - Infrastructure layer: SignalR implementation, EF Core configuration
  - API layer: Hub class, service registration

- **Integration Points Defined**:
  - DeviceService → DeviceStatusChanged events
  - ScheduleService → ScheduleConflict, ScheduleUpdated events
  - MediaService → MediaUploaded events
  - UserService → UserAction events
  - System Monitoring → SystemAlert events

- **Performance Requirements Achievable**:
  - Connection establishment < 500ms (SignalR handshake + JWT validation)
  - Event delivery < 1s (in-memory broadcast, single-server topology)
  - 100+ concurrent connections (tested to 1000 in research)
  - >99% uptime (proven SignalR stability)

- **Security Model Complete**:
  - JWT authentication at connection
  - RBAC event filtering per connection
  - Connection audit logging
  - Rate limiting strategy defined
  - Origin validation for CORS

**Output**: data-model.md, contracts/ (3 files), quickstart.md

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

**Status**: 🔜 Ready for `/tasks` command

*This section describes what the /tasks command will do - DO NOT execute during /plan*

### Task Generation Strategy

When `/tasks` is invoked, the system will:

1. **Load Phase 1 Design Artifacts**:
   - `data-model.md` → entities, DTOs, interfaces to implement
   - `contracts/` → endpoints, events, methods to test
   - `quickstart.md` → test scenarios to validate
   - `research.md` → technology decisions to follow

2. **Generate Implementation Tasks** following TDD approach:
   ```
   Ordering:
   [P1] Tests First (contract tests for each endpoint/method)
   [P2] Domain Layer (enums, entities)
   [P3] Application Layer (interfaces, DTOs, services)
   [P4] Infrastructure Layer (SignalR implementation, EF config)
   [P5] API Layer (hubs, middleware, registration)
   [P6] Integration Tests (end-to-end scenarios from quickstart.md)
   [P7] Documentation & Validation
   ```

3. **Task Structure** (estimated 25-30 tasks):
   - **T001-T003**: Contract test setup (3 tasks)
     * T001: Setup SignalR test infrastructure
     * T002: Create hub method contract tests (fail)
     * T003: Create event schema validation tests (fail)
   
   - **T004-T007**: Domain layer (4 tasks)
     * T004: Create RealtimeEventType enum
     * T005: Create WebSocketConnectionLog entity
     * T006: Create domain interfaces
     * T007: Validate domain tests pass
   
   - **T008-T012**: Application layer (5 tasks)
     * T008: Create RealtimeEventDto and payload DTOs
     * T009: Create IRealtimeEventBroadcaster interface
     * T010: Create RealtimeEventBroadcaster implementation
     * T011: Register application services
     * T012: Validate application tests pass
   
   - **T013-T017**: Infrastructure layer (5 tasks)
     * T013: Create WebSocketConnectionLogConfiguration
     * T014: Add WebSocketConnectionLogs DbSet to AppDbContext
     * T015: Generate EF Core migration
     * T016: Apply migration to database
     * T017: Validate infrastructure tests pass
   
   - **T018-T023**: API layer (6 tasks)
     * T018: Create NotificationHub with basic methods
     * T019: Create WebSocketAuthenticationMiddleware
     * T020: Create SignalRServiceExtensions
     * T021: Update Program.cs with SignalR configuration
     * T022: Validate contract tests pass
     * T023: Validate hub authentication works
   
   - **T024-T027**: Service integration (4 tasks)
     * T024: Integrate DeviceService with event broadcaster
     * T025: Integrate ScheduleService with event broadcaster
     * T026: Integrate MediaService with event broadcaster
     * T027: Integrate UserService/SystemMonitoring with event broadcaster
   
   - **T028-T030**: End-to-end validation (3 tasks)
     * T028: Run Scenario 1-3 from quickstart.md
     * T029: Run Scenario 4-6 from quickstart.md
     * T030: Validate all 27 FRs from spec.md

4. **Parallelization Markers**:
   - `[P]` = Can execute in parallel with same-priority tasks
   - Sequential dependencies clearly marked
   - TDD flow: Test → Implement → Validate

5. **Task Attributes** (each task includes):
   - Priority level (P1-P7)
   - Estimated time
   - Dependencies (task IDs)
   - Validation criteria (specific test to pass or checklist item)
   - File paths to create/modify
   - Related spec requirements (FR-XXX)

6. **Output**: `tasks.md` (~30 tasks, ready for execution)

### Design Completeness Validation

Before task generation, verify:
- ✅ All 27 functional requirements have implementation path
- ✅ All 7 event types have data model and contracts
- ✅ All 5 integration points identified
- ✅ Performance targets achievable (validated in research)
- ✅ Security requirements covered (JWT + RBAC)
- ✅ Test scenarios cover all user stories
- ✅ Clean Architecture compliance maintained

**Next Command**: User should run `/tasks` to generate tasks.md from these design artifacts.

---

## Progress Tracking

### Phase 0: Research & Decisions
- ✅ Technology choice (SignalR vs native WebSocket)
- ✅ Architecture pattern (single hub with routing)
- ✅ Event broadcasting abstraction
- ✅ Authentication strategy (JWT at connection)
- ✅ Scalability approach (in-memory with Redis path)
- ✅ Message format (JSON with type safety)
- ✅ Integration points identified (5 services)
- **Output**: research.md (400+ lines)

### Phase 1: Design & Contracts
- ✅ Data model complete (entities, DTOs, interfaces)
- ✅ Connection lifecycle documented
- ✅ Event schemas defined (10 event types)
- ✅ Hub method contracts specified
- ✅ Validation guide created (6 scenarios)
- ✅ Agent context updated (copilot-instructions.md)
- **Output**: data-model.md, contracts/ (3 files), quickstart.md (2200+ total lines)

### Phase 2: Task Generation
- 🔜 **Awaiting `/tasks` command**
- Task generation strategy documented above
- All prerequisites complete
- Estimated output: 25-30 tasks in tasks.md

### Phase 3-4: Implementation
- ⏳ Pending task generation
- Will follow TDD approach (tests → implement → validate)
- Clean Architecture compliance throughout

### Phase 5: Validation & Completion
- ⏳ Pending implementation
- 6 quickstart scenarios ready for validation
- All 27 FRs checkpoints defined
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
- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
