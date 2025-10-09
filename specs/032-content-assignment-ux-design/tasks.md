# Implementation Tasks: Content Assignment UX/UI Design & API Integration

**Generated**: 2025-10-09 | **Feature**: 032-content-assignment-ux-design  
**Methodology**: TDD (Test-Driven Development) | **Execution**: Sequential with [P] parallel tasks

## Task Overview
**Total Tasks**: 40  
**Estimated Effort**: 3-4 days  
**Backend Tasks**: 20 | **Frontend Tasks**: 15 | **Integration Tasks**: 5  
**Architecture**: Clean Architecture (Backend) + App Router (Frontend)

## Phase 1: Setup & Foundation (Tasks 1-6)

### 1. [X] Setup Branch and Environment ✅
- ✅ Create feature branch `032-content-assignment-ux-design`
- ✅ Verify development environment prerequisites
- ✅ Update project documentation with assignment system overview
- **Files**: `.git/`, `README.md`, `docs/`
- **Time**: 15 min

### 2. [X] [P] Create Assignment Enums and Value Objects ✅
- ✅ Create `AssignmentType` enum (Schedule, Playlist, Media, Emergency)
- ✅ Create `AssignmentTargetType` enum (Device, DeviceGroup)  
- ✅ Create `AssignmentStatus` enum (Draft, Scheduled, Active, Expired, Paused, Cancelled)
- ✅ Create `AssignmentAction` enum (Created, Updated, Deleted, Activated, Deactivated)
- **Files**: `src/DigitalSignage.Domain/Enums/AssignmentEnums.cs`
- **Time**: 20 min

### 3. [X] [P] Create Assignment DTOs Structure ✅
- ✅ Create `AssignmentDto` for API responses
- ✅ Create `CreateAssignmentRequest` for single assignments
- ✅ Create `UpdateAssignmentRequest` for modifications
- ✅ Create `BulkAssignmentRequest` for bulk operations
- ✅ Create `AssignmentAnalyticsDto` for dashboard metrics
- **Files**: `src/DigitalSignage.Application/DTOs/Assignment/`
- **Time**: 30 min

### 4. [X] Create Assignment Entity Tests (TDD) ✅
- ✅ Write unit tests for Assignment entity validation
- ✅ Write tests for AssignmentHistory audit trail
- ✅ Write tests for emergency broadcast priority logic
- ✅ Write tests for recurrence pattern validation
- **Files**: `tests/DigitalSignage.Domain.Tests/Entities/AssignmentTests.cs`, `AssignmentHistoryTests.cs`
- **Time**: 45 min

### 5. [X] Create Assignment Entity Implementation ✅
- ✅ Implement `Assignment` entity with BaseEntity inheritance
- ✅ Implement `AssignmentHistory` entity for audit trail
- ✅ Add navigation properties and relationships
- ✅ Implement business logic methods (IsActive, IsExpired, etc.)
- ✅ Enhanced existing entities (Device, DeviceGroup, User) with Assignment navigation properties
- **Files**: `src/DigitalSignage.Domain/Entities/Assignment.cs`, `AssignmentHistory.cs`
- **Time**: 40 min
- **Dependencies**: Task 4 (tests must pass)

### 6. [X] Create Entity Framework Configuration ✅
- ✅ Create `AssignmentConfiguration` for EF Core mapping
- ✅ Create `AssignmentHistoryConfiguration` for audit table
- ✅ Configure relationships with Device, DeviceGroup, User entities
- ✅ Add DateTime column type configuration (timestamp without time zone)
- ✅ Register configurations in AppDbContext with proper DbSets
- **Files**: `src/DigitalSignage.Infrastructure/Data/Configurations/`, `AppDbContext.cs`
- **Time**: 30 min
- **Dependencies**: Task 5

## Phase 2: Database & Repository Layer (Tasks 7-12)

### 7. Create and Apply Database Migration
- Generate EF Core migration for Assignment tables
- Review migration SQL for PostgreSQL compatibility
- Apply migration to development database
- Verify table structure and constraints
- **Files**: `src/DigitalSignage.Infrastructure/Migrations/`
- **Commands**: `dotnet ef migrations add AddAssignmentSystem`, `dotnet ef database update`
- **Time**: 25 min
- **Dependencies**: Task 6

### 8. [P] Create Repository Interface Tests
- Write tests for `IAssignmentRepository` interface
- Write tests for complex queries (active assignments, priority ordering)
- Write tests for bulk operations and analytics queries
- Mock repository setup for service layer tests
- **Files**: `tests/DigitalSignage.Infrastructure.Tests/Repositories/AssignmentRepositoryTests.cs`
- **Time**: 50 min

### 9. Create Assignment Repository Interface
- Define `IAssignmentRepository` interface
- Include methods for CRUD operations
- Include methods for filtering, pagination, sorting
- Include methods for analytics and dashboard queries
- **Files**: `src/DigitalSignage.Domain/Interfaces/IAssignmentRepository.cs`
- **Time**: 20 min

### 10. Implement Assignment Repository
- Implement `AssignmentRepository` with EF Core
- Implement complex filtering and sorting logic
- Implement bulk operations with transaction support
- Implement analytics queries with optimized SQL
- **Files**: `src/DigitalSignage.Infrastructure/Repositories/AssignmentRepository.cs`
- **Time**: 60 min
- **Dependencies**: Tasks 8, 9 (tests must pass)

### 11. [P] Enhance Existing Entities for Assignment Navigation
- Add Assignment navigation properties to Device entity
- Add Assignment navigation properties to DeviceGroup entity
- Add Assignment navigation properties to User entity
- Update existing Entity Configurations if needed
- **Files**: `src/DigitalSignage.Domain/Entities/Device.cs`, `DeviceGroup.cs`, `User.cs`
- **Time**: 25 min

### 12. Register Repository in DI Container
- Register `IAssignmentRepository` in service collection
- Update database service extensions
- Verify dependency injection configuration
- **Files**: `src/DigitalSignage.Api/Extensions/DatabaseServiceExtensions.cs`
- **Time**: 10 min
- **Dependencies**: Task 10

## Phase 3: Business Logic & Services (Tasks 13-22)

### 13. Create Assignment Service Tests (TDD)
- Write comprehensive tests for `IAssignmentService`
- Write tests for assignment creation, update, deletion
- Write tests for priority conflict resolution
- Write tests for emergency broadcast override logic
- Write tests for recurrence pattern processing
- **Files**: `tests/DigitalSignage.Application.Tests/Services/AssignmentServiceTests.cs`
- **Time**: 75 min

### 14. Create Assignment Service Interface
- Define `IAssignmentService` interface
- Include methods for CRUD operations with DTOs
- Include methods for assignment validation
- Include methods for priority management
- **Files**: `src/DigitalSignage.Application/Interfaces/IAssignmentService.cs`
- **Time**: 20 min

### 15. Implement Assignment Service
- Implement core assignment management logic
- Implement validation rules and business constraints
- Implement priority conflict resolution
- Implement emergency broadcast logic
- Add comprehensive logging with log4net
- **Files**: `src/DigitalSignage.Application/Services/AssignmentService.cs`
- **Time**: 90 min
- **Dependencies**: Tasks 13, 14 (tests must pass)

### 16. [P] Create Bulk Assignment Service Tests
- Write tests for bulk assignment operations
- Write tests for batch validation and error handling  
- Write tests for transaction rollback scenarios
- Write tests for progress reporting
- **Files**: `tests/DigitalSignage.Application.Tests/Services/BulkAssignmentServiceTests.cs`
- **Time**: 45 min

### 17. Create and Implement Bulk Assignment Service
- Define `IBulkAssignmentService` interface
- Implement bulk create, update, delete operations
- Implement batch validation with detailed error reporting
- Implement transaction management for atomicity
- **Files**: `src/DigitalSignage.Application/Services/BulkAssignmentService.cs`
- **Time**: 60 min
- **Dependencies**: Task 16

### 18. [P] Create Assignment Analytics Service Tests  
- Write tests for dashboard metrics calculation
- Write tests for assignment statistics queries
- Write tests for performance and utilization metrics
- **Files**: `tests/DigitalSignage.Application.Tests/Services/AssignmentAnalyticsServiceTests.cs`
- **Time**: 40 min

### 19. Create and Implement Assignment Analytics Service
- Define `IAssignmentAnalyticsService` interface
- Implement dashboard metrics calculations
- Implement device utilization statistics
- Implement assignment performance analytics
- **Files**: `src/DigitalSignage.Application/Services/AssignmentAnalyticsService.cs`
- **Time**: 50 min
- **Dependencies**: Task 18

### 20. Enhance ContentDeliveryService for Assignment Priority
- Modify existing ContentDeliveryService to support unified Assignment priority
- Implement emergency broadcast override logic
- Update device content resolution algorithm
- Maintain backward compatibility with existing assignments
- **Files**: `src/DigitalSignage.Application/Services/ContentDeliveryService.cs`
- **Time**: 45 min
- **Dependencies**: Task 15

### 21. [P] Create Assignment Validation Service
- Implement assignment conflict detection
- Implement schedule overlap validation
- Implement device availability checking
- Implement content availability validation
- **Files**: `src/DigitalSignage.Application/Services/AssignmentValidationService.cs`
- **Time**: 35 min

### 22. Register Services in DI Container
- Register all assignment services in application services
- Configure AutoMapper profiles for Assignment DTOs
- Update service registration extensions
- **Files**: `src/DigitalSignage.Api/Extensions/ApplicationServiceExtensions.cs`
- **Time**: 15 min
- **Dependencies**: Tasks 15, 17, 19, 21

## Phase 4: API Controllers & Endpoints (Tasks 23-27)

### 23. Create Assignment Controller Tests (TDD)
- Write integration tests for all Assignment API endpoints
- Write tests for authentication and authorization
- Write tests for input validation and error responses
- Write tests for pagination and filtering
- **Files**: `tests/DigitalSignage.Api.Tests/Controllers/AssignmentControllerTests.cs`
- **Time**: 90 min

### 24. Create Assignment Controller
- Implement `AssignmentController` with all CRUD endpoints
- Implement filtering, pagination, and sorting
- Implement proper HTTP status codes and responses
- Add comprehensive ProducesResponseType attributes
- Add proper authorization attributes
- **Files**: `src/DigitalSignage.Api/Controllers/AssignmentController.cs`
- **Time**: 70 min
- **Dependencies**: Task 23 (tests must pass)

### 25. [P] Create Bulk Assignment Controller Tests
- Write tests for bulk operation endpoints
- Write tests for batch validation responses
- Write tests for transaction error handling
- **Files**: `tests/DigitalSignage.Api.Tests/Controllers/BulkAssignmentControllerTests.cs`
- **Time**: 45 min

### 26. Create Bulk Assignment Controller  
- Implement bulk operations endpoint
- Implement batch processing with progress reporting
- Implement proper error handling and rollback
- Add comprehensive request/response documentation
- **Files**: `src/DigitalSignage.Api/Controllers/BulkAssignmentController.cs`
- **Time**: 50 min
- **Dependencies**: Task 25

### 27. [P] Create Assignment Analytics Controller
- Implement analytics and dashboard endpoints
- Implement metrics aggregation endpoints
- Add caching for performance-intensive queries
- **Files**: `src/DigitalSignage.Api/Controllers/AssignmentAnalyticsController.cs`
- **Time**: 35 min

## Phase 5: Frontend Foundation (Tasks 28-32)

### 28. [X] Create Assignment Feature Structure ✅
- ✅ Create assignment feature directory structure
- ✅ Set up TypeScript types and interfaces
- ✅ Create barrel exports for clean imports
- ✅ Set up Redux Toolkit slices for assignment state
- **Files**: `src/digital-signage-web/src/features/assignments/`
- **Time**: 30 min

### 29. [X] [P] Create Assignment Type Definitions ✅
- ✅ Create TypeScript interfaces for Assignment entities
- ✅ Create API request/response type definitions
- ✅ Create Redux state type definitions
- ✅ Create form validation schemas with Zod
- **Files**: `src/digital-signage-web/src/features/assignments/types/`
- **Time**: 40 min

### 30. Create Assignment API Client ✅
- ✅ Implement typed Axios client for assignment endpoints
- ✅ Implement error handling and request/response interceptors
- ✅ Create React Query hooks for data fetching
- ✅ Add optimistic updates for better UX
- **Files**: `src/digital-signage-web/src/features/assignments/api/`
- **Time**: 50 min
- **Dependencies**: Task 29

### 31. [P] Create Assignment Redux Store ✅
- ✅ Implement Redux Toolkit slice for assignment state
- ✅ Implement actions for CRUD operations
- ✅ Implement selectors for computed state
- ✅ Add persistence layer for draft assignments
- **Files**: `src/digital-signage-web/src/features/assignments/store/`
- **Time**: 45 min

### 32. Create Base Assignment Components
- Create `AssignmentCard` component for list display
- Create `AssignmentStatus` component for status indicators
- Create `AssignmentPriority` component for priority display
- Create `DeviceSelector` component for target selection
- **Files**: `src/digital-signage-web/src/features/assignments/components/`
- **Time**: 60 min
- **Dependencies**: Tasks 29, 31

## Phase 6: Frontend UI Implementation (Tasks 33-37)

### 33. [X] Create Assignment Dashboard Page ✅
- ✅ Implement assignment list with filtering and sorting
- ✅ Implement search functionality (client-side)
- ✅ Add bulk selection and operations
- ✅ Integrate with existing (dashboard) layout group
- ✅ Fix Redux integration and TypeScript types
- ✅ Fix all export statements with .js extensions
- **Files**: `src/digital-signage-web/src/app/(dashboard)/assignments/page.tsx`
- **Time**: 70 min
- **Dependencies**: Tasks 30, 32

### 34. [P] Create Assignment Creation Wizard
- Implement multi-step assignment creation wizard
- Implement content selection interface
- Implement device/group target selection
- Implement scheduling and recurrence options
- Add form validation with real-time feedback
- **Files**: `src/digital-signage-web/src/features/assignments/components/AssignmentWizard/`
- **Time**: 90 min

### 35. Create Assignment Detail/Edit Page
- Implement assignment detail view
- Implement inline editing functionality
- Add assignment history display
- Add delete and duplicate actions
- **Files**: `src/digital-signage-web/src/app/(dashboard)/assignments/[id]/page.tsx`
- **Time**: 60 min
- **Dependencies**: Task 33

### 36. [P] Create Bulk Assignment Tools
- Implement bulk assignment creation interface
- Implement CSV import functionality for bulk operations
- Add batch validation and error reporting
- Implement progress tracking for bulk operations
- **Files**: `src/digital-signage-web/src/features/assignments/components/BulkTools/`
- **Time**: 75 min

### 37. Create Assignment Analytics Dashboard
- Implement assignment metrics visualization
- Create charts for device utilization
- Add assignment performance indicators  
- Integrate with existing dashboard navigation
- **Files**: `src/digital-signage-web/src/app/(dashboard)/assignments/analytics/page.tsx`
- **Time**: 65 min
- **Dependencies**: Task 33

## Phase 7: Integration & Polish (Tasks 38-40)

### 38. Enhance Device Management Integration
- Add assignment quick-actions to device list
- Show active assignments in device detail view
- Add assignment status indicators in device cards
- Update device status to reflect assignment state
- **Files**: `src/digital-signage-web/src/features/devices/`
- **Time**: 45 min
- **Dependencies**: Tasks 33, 35

### 39. Implement Real-time Updates via SignalR
- Extend existing SignalR hub for assignment updates
- Implement real-time assignment status changes
- Add real-time notifications for emergency broadcasts
- Update UI automatically when assignments change
- **Files**: `src/DigitalSignage.Api/Hubs/`, `src/digital-signage-web/src/services/signalr/`
- **Time**: 55 min
- **Dependencies**: Task 24

### 40. Final Integration Testing and Validation
- Run comprehensive end-to-end testing scenarios
- Validate API contract compliance with OpenAPI spec
- Test emergency broadcast priority system  
- Verify assignment conflict resolution
- Test bulk operations with 100+ assignments
- Validate responsive design on different screen sizes
- **Files**: Integration testing across all components
- **Time**: 90 min
- **Dependencies**: All previous tasks

---

## Testing Strategy

### Backend Testing
- **Unit Tests**: All services, entities, and business logic
- **Integration Tests**: API endpoints, database operations
- **Performance Tests**: Bulk operations, analytics queries
- **Contract Tests**: API specification compliance

### Frontend Testing  
- **Component Tests**: React Testing Library for UI components
- **Integration Tests**: API integration and state management
- **E2E Tests**: Complete user workflows (Playwright/Cypress)
- **Accessibility Tests**: WCAG compliance validation

### Manual Testing Scenarios
1. **Basic Assignment Creation**: Single assignment to device/group
2. **Bulk Assignment**: 100+ assignments via CSV import
3. **Emergency Broadcast**: Override existing assignments
4. **Priority Conflict Resolution**: Multiple assignments same device
5. **Real-time Updates**: Assignment status changes via SignalR
6. **Analytics Dashboard**: Metrics calculation and visualization

## Deployment Checklist
- [ ] Database migration applied successfully
- [ ] All unit tests passing
- [ ] API integration tests passing  
- [ ] Frontend build successful
- [ ] SignalR hub properly configured
- [ ] Emergency broadcast system tested
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation updated

## Success Criteria
- ✅ All 40 tasks completed successfully
- ✅ API endpoints match OpenAPI specification
- ✅ Frontend components follow design system
- ✅ Emergency broadcast system operational
- ✅ Bulk operations handle 100+ assignments
- ✅ Real-time updates working via SignalR
- ✅ Assignment analytics dashboard functional
- ✅ Integration with existing device management
- ✅ Comprehensive test coverage (>90%)
- ✅ Performance targets met (<200ms API, <5s bulk ops)