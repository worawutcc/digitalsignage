# Implementation Tasks

**Feature**: BaseEntity Extension and DateTime Standardization  
**Generated**: 29 September 2025  
**Dependencies**: Complete in numbered order unless marked [P] for parallel execution

## Setup and Foundation Tasks

### T001: Create BaseEntity Abstract Class [X]
**Path**: `src/DigitalSignage.Domain/Entities/BaseEntity.cs`
**Dependencies**: None
**Description**: Create abstract base class with audit fields
- CreatedAt (DateTime)
- CreatedBy (int)  
- UpdatedAt (DateTime)
- UpdatedBy (int)
- Virtual properties for EF Core compatibility

### T002: Update Domain Project References [P] [X]
**Path**: `src/DigitalSignage.Domain/DigitalSignage.Domain.csproj`
**Dependencies**: T001
**Description**: Ensure domain project has needed dependencies for BaseEntity

### T003: Create BaseEntity Unit Tests [P] [X]
**Path**: `tests/DigitalSignage.Domain.Tests/Entities/BaseEntityTests.cs`
**Dependencies**: T001
**Description**: Test BaseEntity property initialization and behavior

### T004: Create EF Core BaseEntity Configuration [P] [X]
**Path**: `src/DigitalSignage.Infrastructure/Data/Configurations/BaseEntityConfiguration.cs`
**Dependencies**: T001
**Description**: EF Core configuration for BaseEntity audit fields with proper column mapping

## Entity Model Updates - Core Entities

### T005: Update User Entity [X]
**Path**: `src/DigitalSignage.Domain/Entities/User.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity, remove duplicate audit fields
- Remove existing CreatedAt property
- Maintain existing UpdatedAt property but inherit type consistency

### T006: Update Device Entity [X]
**Path**: `src/DigitalSignage.Domain/Entities/Device.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity, remove duplicate audit fields
- Remove existing CreatedAt property
- Add inherited audit trail capabilities

### T007: Update DeviceGroup Entity [X]
**Path**: `src/DigitalSignage.Domain/Entities/DeviceGroup.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity, add missing audit fields

### T008: Update Media Entity [X]
**Path**: `src/DigitalSignage.Domain/Entities/Media.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity, standardize audit fields
- Remove existing CreatedAt property
- Standardize with inherited audit pattern

### T009: Update Schedule Entity [X]
**Path**: `src/DigitalSignage.Domain/Entities/Schedule.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity, remove duplicate fields
- Remove existing CreatedAt and UpdatedAt properties
- Inherit consistent audit trail

### T010: Update ScheduleMedia Entity [P] [X]
**Path**: `src/DigitalSignage.Domain/Entities/ScheduleMedia.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity for audit tracking of schedule-media relationships

## Entity Model Updates - Android TV Registration System

### T011: Update DeviceRegistrationRequest Entity [P] [X]
**Path**: `src/DigitalSignage.Domain/Entities/DeviceRegistrationRequest.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity, remove duplicate CreatedAt field

### T012: Update DeviceApproval Entity [P] [X]
**Path**: `src/DigitalSignage.Domain/Entities/DeviceApproval.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity, remove duplicate CreatedAt field

### T013: Update RegistrationAuditLog Entity [P] [X]
**Path**: `src/DigitalSignage.Domain/Entities/RegistrationAuditLog.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity, remove duplicate CreatedAt field

## Entity Model Updates - Supporting Entities

### T014: Update DeviceHeartbeat Entity [P] [SKIP - Entity does not exist]
**Path**: `src/DigitalSignage.Domain/Entities/DeviceHeartbeat.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity, remove duplicate CreatedAt field

### T015: Update AuditLog Entity [P] [SKIP - Entity does not exist]
**Path**: `src/DigitalSignage.Domain/Entities/AuditLog.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity, remove duplicate CreatedAt field

### T016: Update RefreshToken Entity [P] [X]
**Path**: `src/DigitalSignage.Domain/Entities/RefreshToken.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity, remove duplicate CreatedAt field

### T017: Update UserSession Entity [P] [SKIP - Entity does not exist]
**Path**: `src/DigitalSignage.Domain/Entities/UserSession.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity, remove duplicate CreatedAt field

### T018: Update ApiLog Entity [P] [SKIP - Entity does not exist]
**Path**: `src/DigitalSignage.Domain/Entities/ApiLog.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity, remove duplicate CreatedAt field

### T019: Update ErrorLog Entity [P] [SKIP - Entity does not exist]
**Path**: `src/DigitalSignage.Domain/Entities/ErrorLog.rs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity, remove duplicate CreatedAt field

### T020: Update ConfigurationSetting Entity [P] [SKIP - Entity does not exist]
**Path**: `src/DigitalSignage.Domain/Entities/ConfigurationSetting.cs`
**Dependencies**: T001
**Description**: Inherit from BaseEntity for configuration change tracking

## EF Core Configuration Updates

### T021: Update User Entity Configuration [X]
**Path**: `src/DigitalSignage.Infrastructure/Data/Configurations/UserConfiguration.cs`
**Dependencies**: T005
**Description**: Update EF configuration to handle BaseEntity inheritance
- Remove individual audit field configurations
- Apply BaseEntityConfiguration

### T022: Update Device Entity Configuration [X]
**Path**: `src/DigitalSignage.Infrastructure/Data/Configurations/DeviceConfiguration.cs`
**Dependencies**: T006
**Description**: Update EF configuration for BaseEntity inheritance

### T023: Update DeviceGroup Entity Configuration [X]
**Path**: `src/DigitalSignage.Infrastructure/Data/Configurations/DeviceGroupConfiguration.cs`
**Dependencies**: T007
**Description**: Update EF configuration for BaseEntity inheritance

### T024: Update Media Entity Configuration [X]
**Path**: `src/DigitalSignage.Infrastructure/Data/Configurations/MediaConfiguration.cs`
**Dependencies**: T008
**Description**: Update EF configuration for BaseEntity inheritance

### T025: Update Schedule Entity Configuration [X]
**Path**: `src/DigitalSignage.Infrastructure/Data/Configurations/ScheduleConfiguration.cs`
**Dependencies**: T009
**Description**: Update EF configuration for BaseEntity inheritance

### T026: Update AppDbContext [X]
**Path**: `src/DigitalSignage.Infrastructure/Data/AppDbContext.cs`
**Dependencies**: T004, T021-T025
**Description**: Configure BaseEntity in DbContext and update SaveChanges to populate audit fields
- Override SaveChanges/SaveChangesAsync
- Auto-populate CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
- Handle IUserContext for current user ID

## Database Migration

### T027: Create BaseEntity Migration
**Path**: `src/DigitalSignage.Infrastructure/Migrations/`
**Dependencies**: T001-T026
**Description**: Generate EF Core migration for BaseEntity changes
- Add missing audit columns to all tables
- Set appropriate default values (-1 for system operations)
- Handle DateTime without timezone conversion

### T028: Test Migration Rollback [P]
**Path**: Migration testing
**Dependencies**: T027
**Description**: Verify migration can be safely rolled back without data loss

## Infrastructure and Service Updates

### T029: Create IUserContext Interface [X]
**Path**: `src/DigitalSignage.Application/Interfaces/IUserContext.cs`
**Dependencies**: None  
**Description**: Interface for accessing current user context for audit fields

### T030: Implement UserContext Service [X]
**Path**: `src/DigitalSignage.Infrastructure/Services/UserContext.cs`
**Dependencies**: T029
**Description**: Implementation to get current user ID from JWT claims or default to -1

### T031: Update Service Registration [X]
**Path**: `src/DigitalSignage.Api/Extensions/ApplicationServiceExtensions.cs`
**Dependencies**: T030
**Description**: Register IUserContext in DI container

## Testing - Unit Tests

### T032: Update Entity Unit Tests [P]
**Path**: `tests/DigitalSignage.Domain.Tests/Entities/`
**Dependencies**: T005-T020
**Description**: Update all entity unit tests to verify BaseEntity inheritance
- Test audit field inheritance
- Verify property accessibility
- Test entity creation with audit fields

### T033: Create AppDbContext Unit Tests [P]
**Path**: `tests/DigitalSignage.Infrastructure.Tests/Data/AppDbContextTests.cs`
**Dependencies**: T026
**Description**: Test SaveChanges audit field population
- Test CreatedAt/CreatedBy on insert
- Test UpdatedAt/UpdatedBy on update
- Test system user ID (-1) when no user context

### T034: Update Repository Tests [P]
**Path**: `tests/DigitalSignage.Infrastructure.Tests/Repositories/`
**Dependencies**: T027
**Description**: Update repository tests to verify audit fields are properly saved and retrieved

## Testing - Integration Tests

### T035: Update API Integration Tests [P]
**Path**: `tests/DigitalSignage.Api.Tests/Controllers/`
**Dependencies**: T027
**Description**: Verify API responses include audit fields and maintain backward compatibility
- Test GET endpoints return audit fields
- Test POST/PUT endpoints populate audit fields correctly
- Verify no breaking changes to response schemas

### T036: Create Migration Integration Tests [P]
**Path**: `tests/DigitalSignage.Infrastructure.Tests/Migrations/`
**Dependencies**: T027
**Description**: Test migration against real database
- Test migration up/down
- Verify data integrity
- Test audit field population on existing records

### T037: Update Service Integration Tests [P]
**Path**: `tests/DigitalSignage.Application.Tests/Services/`
**Dependencies**: T027
**Description**: Test services properly populate and use audit fields
- Test create operations set audit fields
- Test update operations modify UpdatedAt/UpdatedBy
- Test audit trail consistency

## Validation and Polish

### T038: Run Full Test Suite
**Path**: All test projects
**Dependencies**: T032-T037
**Description**: Execute complete test suite to verify no regressions
- Unit tests pass
- Integration tests pass
- API contract tests pass

### T039: Database Migration Testing [P]
**Path**: Database validation
**Dependencies**: T027, T038
**Description**: Test migration on staging environment
- Backup existing data
- Run migration
- Verify audit fields populated correctly
- Test application functionality

### T040: Performance Impact Assessment [P]
**Path**: Performance testing
**Dependencies**: T039
**Description**: Measure performance impact of audit field changes
- Database query performance
- SaveChanges overhead
- Memory usage with additional fields

### T041: Update Documentation [P]
**Path**: Documentation updates
**Dependencies**: T040
**Description**: Update internal documentation
- Entity relationship diagrams
- Database schema documentation
- Developer onboarding guides

### T042: Final Verification
**Path**: End-to-end testing
**Dependencies**: T041
**Description**: Complete feature verification
- All entities inherit BaseEntity
- Audit fields populate correctly
- No API breaking changes
- Migration completed successfully
- Documentation updated

## Execution Strategy

**Phase 1**: Setup (T001-T004) - Foundation must be complete before entity updates
**Phase 2**: Entity Updates (T005-T020) - Can be executed in parallel after Phase 1  
**Phase 3**: EF Configuration (T021-T026) - Sequential after respective entity updates
**Phase 4**: Migration (T027-T028) - After all configuration updates
**Phase 5**: Infrastructure (T029-T031) - Can run parallel with testing
**Phase 6**: Testing (T032-T037) - Parallel execution where marked [P]
**Phase 7**: Validation (T038-T042) - Sequential completion and verification

**Estimated Effort**: 42 tasks, ~8-12 hours total development time
**Risk Level**: Low (internal refactoring with comprehensive testing)
**Rollback Plan**: Database migration rollback + git revert (no API changes)