# Tasks: Enhanced Device Registration with Hardware Information

**Branch**: `028-enhanced-device-registration`  
**Input**: Design documents from `/specs/028-enhanced-device-registration/`  
**Prerequisites**: plan.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

## Execution Context
**Tech Stack**: C# .NET 8 with ASP.NET Core Web API, Entity Framework Core 9, PostgreSQL  
**Dependencies**: JWT Authentication, AWS S3 SDK, AutoMapper, SixLabors.ImageSharp, SignalR  
**Project Type**: Clean Architecture with API backend + React frontend  
**Integration Focus**: Extend existing device registration, media processing, and SignalR systems

## Phase 3.1: Setup and Entity Framework Integration

### T001: Create DeviceHardwareProfile Entity and Configuration
**Status**: ✅ Completed  
**Type**: Backend - Domain Entity  
**Dependencies**: None  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 45 minutes

**Description**:
Create the DeviceHardwareProfile domain entity and EF Core configuration, extending existing Device entity relationships.

**Files to Create/Modify**:
- `src/DigitalSignage.Domain/Entities/DeviceHardwareProfile.cs` (new)
- `src/DigitalSignage.Infrastructure/Data/Configurations/DeviceHardwareProfileConfiguration.cs` (new)
- `src/DigitalSignage.Domain/Entities/Device.cs` (modify - add navigation property)

**Implementation Requirements**:
- Inherit from BaseEntity following existing patterns
- Include all hardware detection fields (display, device specs, capabilities)
- JSON columns for extensible capabilities (SupportedFormats, CodecCapabilities, AdditionalSpecs)
- One-to-one relationship with Device entity
- PostgreSQL-specific DateTime configuration (`timestamp without time zone`)
- Validation attributes for display dimensions, refresh rate, API level

**Acceptance Criteria**:
- Entity compiles without errors
- Follows existing entity patterns in domain layer
- EF Core configuration uses PostgreSQL conventions
- Navigation properties properly configured
- JSON columns properly mapped

### T002: Create MediaVariant Entity and Configuration
**Status**: ✅ Completed  
**Type**: Backend - Domain Entity  
**Dependencies**: None  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 30 minutes

**Description**:
Create MediaVariant entity for storing device-optimized media versions, extending existing Media entity.

**Files to Create/Modify**:
- `src/DigitalSignage.Domain/Entities/MediaVariant.cs` (new)
- `src/DigitalSignage.Infrastructure/Data/Configurations/MediaVariantConfiguration.cs` (new)
- `src/DigitalSignage.Domain/Entities/Media.cs` (modify - add navigation property)

**Implementation Requirements**:
- Many-to-one relationship with Media entity
- CloudFront URL support for S3 content delivery
- Quality levels (high, medium, low, original)
- Target resolution specifications
- Index on MediaId and TargetResolution for query performance

**Acceptance Criteria**:
- Entity follows existing Media entity patterns
- Proper relationship configuration with Media
- Indexes created for performance
- CloudFront URL field properly configured

### T003: Enhance DeviceRegistrationRequest Entity
**Status**: ✅ Completed  
**Type**: Backend - Domain Entity Enhancement  
**Dependencies**: None  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 20 minutes

**Description**:
Extend existing DeviceRegistrationRequest entity to include hardware information fields.

**Files to Modify**:
- `src/DigitalSignage.Domain/Entities/DeviceRegistrationRequest.cs`
- `src/DigitalSignage.Infrastructure/Data/Configurations/DeviceRegistrationRequestConfiguration.cs`

**Implementation Requirements**:
- Add HardwareInfo JSON field for extensible hardware data
- Add HasHardwareInfo boolean flag
- Add hardware processing status fields (HardwareProcessed, HardwareProcessedAt)
- Maintain backward compatibility with existing registration workflow

**Acceptance Criteria**:
- Backward compatible with existing registrations
- New fields nullable/optional
- JSON field properly configured
- Existing tests continue to pass

### T004: Create HardwareDetectionJob Entity and Configuration
**Status**: ✅ Completed  
**Type**: Backend - Domain Entity  
**Dependencies**: T003 (DeviceRegistrationRequest enhanced)  
**Can Run in Parallel**: ❌ No  
**Estimated Effort**: 35 minutes

**Description**:
Create entity for tracking background hardware detection processing with job status management.

**Files to Create**:
- `src/DigitalSignage.Domain/Entities/HardwareDetectionJob.cs`
- `src/DigitalSignage.Infrastructure/Data/Configurations/HardwareDetectionJobConfiguration.cs`
- `src/DigitalSignage.Domain/Enums/HardwareDetectionStatus.cs`

**Implementation Requirements**:
- One-to-one relationship with DeviceRegistrationRequest
- Status enum (Pending, Processing, Completed, Failed, Retrying)
- Retry count and error message fields
- Timestamps for job lifecycle tracking
- Foreign key relationship to DeviceHardwareProfile when completed

**Acceptance Criteria**:
- Status transitions properly validated
- Retry logic supported through entity design
- Timestamps in UTC using PostgreSQL conventions
- Proper relationship constraints

### T005: Create Entity Framework Migration
**Status**: ✅ Completed  
**Type**: Backend - Database Migration  
**Dependencies**: T001, T002, T003, T004 (all entities created)  
**Can Run in Parallel**: ❌ No  
**Estimated Effort**: 25 minutes

**Description**:
Generate and verify EF Core migration for all new entities and enhanced relationships.

**Command to Execute**:
```bash
dotnet ef migrations add EnhancedDeviceRegistrationWithHardware -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api
```

**Files Generated**:
- `src/DigitalSignage.Infrastructure/Migrations/[timestamp]_EnhancedDeviceRegistrationWithHardware.cs`

**Validation Steps**:
- Review generated SQL for PostgreSQL compatibility
- Verify JSON column types and constraints
- Check foreign key relationships
- Validate indexes created correctly
- Test migration applies without errors

**Acceptance Criteria**:
- Migration applies cleanly to development database
- All new tables created with proper constraints
- JSON fields configured correctly
- Foreign keys and indexes present
- No breaking changes to existing data

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

### T006: Contract Test - Enhanced Device Registration Endpoint
**Status**: ⏳ Pending  
**Type**: Backend - Contract Test  
**Dependencies**: T005 (migration applied)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 45 minutes

**Description**:
Create contract tests for enhanced device registration endpoint that accepts hardware information.

**Files to Create**:
- `tests/DigitalSignage.Api.Tests/Contracts/EnhancedDeviceRegistrationContractTests.cs`

**Test Scenarios**:
- POST /api/device/register with complete hardware info returns 201
- POST /api/device/register without hardware info (backward compatibility) returns 201
- POST /api/device/register with invalid hardware data returns 400
- Hardware detection job created when hardware info provided
- Response includes hardwareDetectionJobId when applicable

**Must Fail Initially**: Yes - endpoints not implemented yet

**Acceptance Criteria**:
- All tests written and failing
- Tests cover both enhanced and legacy registration
- Validation error scenarios included
- Response schema validation included
- Background job creation verified

### T007: Contract Test - Device Hardware Profile Endpoint
**Status**: ⏳ Pending  
**Type**: Backend - Contract Test  
**Dependencies**: T005 (migration applied)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 30 minutes

**Description**:
Create contract tests for device hardware profile management endpoints.

**Files to Create**:
- `tests/DigitalSignage.Api.Tests/Contracts/DeviceHardwareProfileContractTests.cs`

**Test Scenarios**:
- GET /api/device/{deviceId}/hardware-profile returns 200 with profile data
- GET /api/device/{deviceId}/hardware-profile returns 404 for non-existent device
- PUT /api/device/{deviceId}/hardware-profile updates profile returns 200
- PUT with invalid data returns 400 with validation errors

**Must Fail Initially**: Yes - endpoints not implemented yet

**Acceptance Criteria**:
- All tests written and failing
- Admin authentication required for updates
- Validation scenarios covered
- JSON schema validation for hardware capabilities

### T008: Contract Test - Device-Optimized Content Endpoint
**Status**: ⏳ Pending  
**Type**: Backend - Contract Test  
**Dependencies**: T005 (migration applied)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 40 minutes

**Description**:
Create contract tests for device-optimized content delivery endpoint.

**Files to Create**:
- `tests/DigitalSignage.Api.Tests/Contracts/OptimizedContentContractTests.cs`

**Test Scenarios**:
- GET /api/device/{deviceId}/optimized-content returns media variants for device
- Query parameter mediaIds filters content correctly
- Response includes appropriate resolution variants based on device profile
- CloudFront URLs included in response
- Empty response for device without hardware profile (graceful degradation)

**Must Fail Initially**: Yes - endpoints not implemented yet

**Acceptance Criteria**:
- All tests written and failing
- Device-specific content optimization verified
- CloudFront URL generation tested
- Multiple media items handling tested
- Fallback behavior for devices without profiles tested

### T009: Contract Test - Hardware Detection Status Endpoint
**Status**: ⏳ Pending  
**Type**: Backend - Contract Test  
**Dependencies**: T005 (migration applied)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 35 minutes

**Description**:
Create contract tests for hardware detection job status and management endpoints.

**Files to Create**:
- `tests/DigitalSignage.Api.Tests/Contracts/HardwareDetectionStatusContractTests.cs`

**Test Scenarios**:
- GET /api/admin/hardware-detection/status returns job list with filters
- POST /api/admin/hardware-detection/{jobId}/retry initiates retry
- Status filtering by registration request ID works
- Retry only works for failed jobs
- Admin authentication required

**Must Fail Initially**: Yes - endpoints not implemented yet

**Acceptance Criteria**:
- All tests written and failing
- Admin authentication properly tested
- Job status transitions validated
- Retry logic constraints verified
- Query filtering functionality tested

### T010: Integration Test - Complete Hardware Detection Workflow
**Status**: ⏳ Pending  
**Type**: Backend - Integration Test  
**Dependencies**: T006-T009 (contract tests created)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 60 minutes

**Description**:
Create end-to-end integration test covering complete hardware detection and media optimization workflow.

**Files to Create**:
- `tests/DigitalSignage.Api.Tests/Integration/HardwareDetectionWorkflowTests.cs`

**Test Scenarios**:
- Complete workflow: Registration → Hardware Detection → Profile Creation → Media Optimization
- SignalR notifications sent during hardware processing
- Background job processing simulation
- Device-specific media variant selection
- Backward compatibility with existing devices

**Must Fail Initially**: Yes - full workflow not implemented yet

**Acceptance Criteria**:
- End-to-end workflow test written and failing
- SignalR integration tested
- Background processing simulation included
- Media optimization workflow verified
- Backward compatibility validated

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### T011: Create DeviceHardwareProfile DTOs and AutoMapper Configuration
**Status**: ⏳ Pending  
**Type**: Backend - Application DTOs  
**Dependencies**: T006-T010 (tests failing)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 30 minutes

**Description**:
Create DTOs for device hardware profile data transfer and AutoMapper configuration.

**Files to Create**:
- `src/DigitalSignage.Application/DTOs/DeviceHardwareProfileDto.cs`
- `src/DigitalSignage.Application/DTOs/CreateDeviceHardwareProfileRequest.cs`
- `src/DigitalSignage.Application/DTOs/UpdateDeviceHardwareProfileRequest.cs`
- `src/DigitalSignage.Application/DTOs/HardwareDetectionJobStatusDto.cs`

**Implementation Requirements**:
- DTOs follow existing naming conventions
- AutoMapper profiles for entity-to-DTO mapping
- Validation attributes on request DTOs
- JSON property naming follows camelCase
- Hardware capabilities as strongly-typed objects where possible

**Acceptance Criteria**:
- DTOs compile without errors
- AutoMapper configuration registered
- Validation attributes properly applied
- Consistent with existing DTO patterns

### T012: Create MediaVariant DTOs and AutoMapper Configuration
**Status**: ⏳ Pending  
**Type**: Backend - Application DTOs  
**Dependencies**: T006-T010 (tests failing)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 25 minutes

**Description**:
Create DTOs for media variant data transfer with device optimization information.

**Files to Create**:
- `src/DigitalSignage.Application/DTOs/MediaVariantDto.cs`
- `src/DigitalSignage.Application/DTOs/OptimizedContentResponseDto.cs`
- `src/DigitalSignage.Application/DTOs/OptimizedMediaItemDto.cs`

**Implementation Requirements**:
- Integration with existing MediaDto structure
- CloudFront URL handling
- Device-specific optimization metadata
- Target resolution and quality information

**Acceptance Criteria**:
- DTOs follow existing media DTO patterns
- CloudFront URL fields properly mapped
- Device optimization metadata included
- AutoMapper configuration registered

### T013: Enhance DeviceRegistrationService with Hardware Processing
**Status**: ⏳ Pending  
**Type**: Backend - Application Service Enhancement  
**Dependencies**: T011, T012 (DTOs created)  
**Can Run in Parallel**: ❌ No  
**Estimated Effort**: 75 minutes

**Description**:
Extend existing DeviceRegistrationService to handle hardware information processing and background job creation.

**Files to Modify**:
- `src/DigitalSignage.Application/Services/DeviceRegistrationService.cs`
- `src/DigitalSignage.Application/Interfaces/IDeviceRegistrationService.cs`

**Implementation Requirements**:
- Extend InitiateRegistrationAsync to accept optional hardware info
- Create HardwareDetectionJob when hardware info provided
- Maintain backward compatibility with existing registration flow
- Proper error handling for hardware processing failures
- Integration with existing audit logging

**Integration Points**:
- Existing DeviceRegistrationRequest entity
- Existing PIN-based approval workflow
- Existing audit logging system
- SignalR notifications for hardware processing status

**Acceptance Criteria**:
- Existing registration tests continue to pass
- Hardware info optional and non-breaking
- Background job created when hardware provided
- Audit logs include hardware processing events
- Error handling for malformed hardware data

### T014: Create HardwareDetectionService for Background Processing
**Status**: ⏳ Pending  
**Type**: Backend - Application Service  
**Dependencies**: T013 (DeviceRegistrationService enhanced)  
**Can Run in Parallel**: ❌ No  
**Estimated Effort**: 90 minutes

**Description**:
Create new service for processing device hardware information in background with job status management.

**Files to Create**:
- `src/DigitalSignage.Application/Services/HardwareDetectionService.cs`
- `src/DigitalSignage.Application/Interfaces/IHardwareDetectionService.cs`

**Implementation Requirements**:
- Process JSON hardware information into DeviceHardwareProfile
- Create default hardware profiles for devices without detection data
- Handle hardware detection failures with retry logic
- Update HardwareDetectionJob status throughout processing
- Integration with SignalR for real-time status updates

**Key Methods**:
- ProcessHardwareDetectionAsync(jobId)
- RetryFailedDetectionAsync(jobId)
- CreateDefaultHardwareProfileAsync(deviceId)
- GetDetectionJobStatusAsync(jobId)

**Acceptance Criteria**:
- Asynchronous processing with proper error handling
- SignalR notifications sent for status updates
- Default profiles created for legacy devices
- Retry logic with exponential backoff
- Comprehensive logging for debugging

### T015: Create HardwareDetectionBackgroundService
**Status**: ⏳ Pending  
**Type**: Backend - Background Service  
**Dependencies**: T014 (HardwareDetectionService created)  
**Can Run in Parallel**: ❌ No  
**Estimated Effort**: 60 minutes

**Description**:
Create IHostedService for processing hardware detection jobs in background queue.

**Files to Create**:
- `src/DigitalSignage.Api/Services/HardwareDetectionBackgroundService.cs`

**Implementation Requirements**:
- Inherit from BackgroundService for long-running processing
- Poll for pending HardwareDetectionJobs periodically
- Process jobs using HardwareDetectionService
- Handle service scope creation for dependency injection
- Graceful shutdown with job completion
- Integration with existing DeviceHeartbeatService patterns

**Configuration**:
- Polling interval configurable via appsettings
- Max concurrent job processing
- Retry policy configuration

**Acceptance Criteria**:
- Background service registered in dependency injection
- Jobs processed automatically after creation
- Proper service scope handling
- Graceful shutdown implemented
- Error handling with job status updates

### T016: Enhance MediaService with Multi-Size Processing
**Status**: ⏳ Pending  
**Type**: Backend - Application Service Enhancement  
**Dependencies**: T012 (MediaVariant DTOs created)  
**Can Run in Parallel**: ❌ No  
**Estimated Effort**: 120 minutes

**Description**:
Extend existing MediaService to generate device-optimized media variants using SixLabors.ImageSharp.

**Files to Modify**:
- `src/DigitalSignage.Application/Services/MediaService.cs`
- `src/DigitalSignage.Application/Interfaces/IMediaService.cs`

**New Methods to Add**:
- GenerateMediaVariantsAsync(mediaId, deviceProfiles)
- GetOptimizedContentForDeviceAsync(deviceId, mediaIds)
- GetMediaVariantsByResolutionAsync(targetResolutions)

**Implementation Requirements**:
- Integration with existing UploadFileAsync method
- SixLabors.ImageSharp for image resizing
- Multiple resolution variants (4K, HD, mobile)
- Quality levels (high, medium, low)
- Enhanced S3 folder structure with date/type/resolution
- CloudFront URL generation for variants

**Integration Points**:
- Existing S3FileUploadService with enhanced folder structure
- Existing MediaDto and response patterns
- CloudFront configuration for optimized delivery

**Acceptance Criteria**:
- Media variants generated automatically on upload
- Device-specific optimization based on hardware profiles
- CloudFront URLs generated for all variants
- Backward compatibility with existing media endpoints
- Performance optimized for concurrent processing

### T017: Enhance S3FileUploadService with CloudFront and New Folder Structure
**Status**: ⏳ Pending  
**Type**: Backend - Infrastructure Service Enhancement  
**Dependencies**: T016 (MediaService multi-size processing)  
**Can Run in Parallel**: ❌ No  
**Estimated Effort**: 45 minutes

**Description**:
Extend existing S3FileUploadService to support enhanced folder structure and CloudFront URL generation.

**Files to Modify**:
- `src/DigitalSignage.Infrastructure/Services/S3FileUploadService.cs`
- `src/DigitalSignage.Application/Interfaces/IFileUploadService.cs`
- Configuration files for CloudFront settings

**Enhancement Requirements**:
- New folder pattern: `digitalsignage/ddmmyyyy/MediaType/resolution/filename`
- CloudFront URL generation method
- Support for multiple file variants upload
- Enhanced presigned URL generation for variants

**New Configuration**:
- CloudFront distribution URL
- Enhanced folder structure settings
- Cache control headers for media variants

**Acceptance Criteria**:
- Enhanced folder structure implemented
- CloudFront URLs generated correctly
- Existing S3 functionality preserved
- Configuration properly integrated
- Performance optimized for batch operations

### T018: Create DeviceHardwareProfile API Controller
**Status**: ⏳ Pending  
**Type**: Backend - API Controller  
**Dependencies**: T014 (HardwareDetectionService created)  
**Can Run in Parallel**: ❌ No  
**Estimated Effort**: 60 minutes

**Description**:
Create new API controller for device hardware profile management with CRUD operations.

**Files to Create**:
- `src/DigitalSignage.Api/Controllers/DeviceHardwareProfileController.cs`

**Endpoints to Implement**:
- GET /api/device/{deviceId}/hardware-profile
- PUT /api/device/{deviceId}/hardware-profile
- GET /api/device/{deviceId}/optimized-content

**Implementation Requirements**:
- JWT authentication for admin operations
- ProducesResponseType attributes for all endpoints
- Input validation using ModelState
- Integration with HardwareDetectionService
- Error handling following existing controller patterns

**Authorization**:
- Read operations: Authenticated users
- Update operations: Admin role required
- Audit logging for all profile changes

**Acceptance Criteria**:
- All endpoints implemented with proper HTTP status codes
- Authentication and authorization working
- Input validation with proper error responses
- Integration with service layer complete
- Contract tests now passing

### T019: Create Hardware Detection Admin API Controller
**Status**: ⏳ Pending  
**Type**: Backend - API Controller  
**Dependencies**: T014 (HardwareDetectionService created)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 45 minutes

**Description**:
Create API controller for hardware detection job management (admin functions).

**Files to Create**:
- `src/DigitalSignage.Api/Controllers/HardwareDetectionController.cs`

**Endpoints to Implement**:
- GET /api/admin/hardware-detection/status
- POST /api/admin/hardware-detection/{jobId}/retry

**Implementation Requirements**:
- Admin role authorization required
- Job status filtering capabilities
- Retry logic with validation
- Integration with HardwareDetectionService
- Proper error handling and logging

**Acceptance Criteria**:
- Admin endpoints implemented
- Proper authorization enforcement
- Job management functionality working
- Error scenarios handled correctly
- Contract tests now passing

### T020: Enhance DeviceRegistrationController with Hardware Support
**Status**: ⏳ Pending  
**Type**: Backend - API Controller Enhancement  
**Dependencies**: T013 (DeviceRegistrationService enhanced)  
**Can Run in Parallel**: ❌ No  
**Estimated Effort**: 30 minutes

**Description**:
Extend existing DeviceRegistrationController to handle optional hardware information in registration requests.

**Files to Modify**:
- `src/DigitalSignage.Api/Controllers/DeviceRegistrationController.cs`

**Enhancement Requirements**:
- Accept optional hardwareInfo in registration request DTOs
- Create hardware detection jobs when hardware info provided
- Maintain backward compatibility with existing API contracts
- Add hardwareDetectionJobId to registration response

**Integration Points**:
- Existing device registration workflow
- Enhanced DeviceRegistrationService
- Existing response DTOs with new optional fields

**Acceptance Criteria**:
- Existing registration functionality unchanged
- Hardware info accepted and processed
- Backward compatibility maintained
- Hardware detection job ID returned when applicable
- Enhanced contract tests now passing

## Phase 3.4: SignalR Integration and Real-time Updates

### T021: Enhance NotificationHub with Hardware Detection Events
**Status**: ⏳ Pending  
**Type**: Backend - SignalR Hub Enhancement  
**Dependencies**: T015 (HardwareDetectionBackgroundService created)  
**Can Run in Parallel**: ❌ No  
**Estimated Effort**: 40 minutes

**Description**:
Extend existing NotificationHub to broadcast hardware detection status updates and profile changes.

**Files to Modify**:
- `src/DigitalSignage.Api/Hubs/NotificationHub.cs`

**New Event Types**:
- hardware_detection_started
- hardware_detection_completed  
- hardware_detection_failed
- hardware_profile_updated
- device_optimization_available

**Implementation Requirements**:
- Integration with existing event broadcasting patterns
- Device-specific event subscriptions
- Admin notifications for hardware detection status
- Client methods for hardware-related events

**Integration Points**:
- Existing SignalR infrastructure and patterns
- HardwareDetectionService for status updates
- Existing device subscription mechanisms

**Acceptance Criteria**:
- Hardware events broadcast correctly
- Device-specific subscriptions working
- Admin notifications implemented
- Integration with existing SignalR patterns
- Real-time updates reach connected clients

### T022: Enhance RealtimeEventBroadcaster with Hardware Events
**Status**: ⏳ Pending  
**Type**: Backend - Service Enhancement  
**Dependencies**: T021 (NotificationHub enhanced)  
**Can Run in Parallel**: ❌ No  
**Estimated Effort**: 25 minutes

**Description**:
Extend existing RealtimeEventBroadcaster to handle hardware detection and profile update events.

**Files to Modify**:
- `src/DigitalSignage.Api/Services/RealtimeEventBroadcaster.cs`

**Enhancement Requirements**:
- Hardware detection event broadcasting methods
- Device-specific event targeting
- Integration with HardwareDetectionService
- Event payload formatting for hardware data

**New Methods**:
- BroadcastHardwareDetectionStatusAsync
- BroadcastHardwareProfileUpdateAsync
- NotifyDeviceOptimizationAvailableAsync

**Acceptance Criteria**:
- Hardware events properly broadcast
- Event targeting working correctly
- Integration with services complete
- Existing functionality preserved
- Events reach appropriate subscribers

## Phase 3.5: Frontend Integration (React Admin Interface)

### T023: Create Device Hardware Profile React Components
**Status**: ⏳ Pending  
**Type**: Frontend - React Components  
**Dependencies**: T018, T019 (API controllers created)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 90 minutes

**Description**:
Create React components for displaying and managing device hardware profiles in admin interface.

**Files to Create**:
- `src/digital-signage-web/src/features/devices/components/DeviceHardwareProfile.tsx`
- `src/digital-signage-web/src/features/devices/components/DeviceHardwareProfile.types.ts`
- `src/digital-signage-web/src/features/devices/components/HardwareDetectionStatus.tsx`
- `src/digital-signage-web/src/features/devices/hooks/useDeviceHardwareProfile.ts`

**Implementation Requirements**:
- TypeScript with strict typing
- React Hook Form + Zod for hardware profile editing
- Real-time updates via WebSocket integration
- Responsive design with Tailwind CSS
- Integration with existing device management UI

**Component Features**:
- Hardware specifications display (resolution, capabilities)
- Hardware detection job status tracking
- Manual hardware profile editing (admin only)
- Device-specific media optimization status
- Real-time status updates via SignalR

**Acceptance Criteria**:
- Components follow existing UI patterns
- TypeScript types properly defined
- Real-time updates working
- Form validation implemented
- Responsive design working
- Integration with device management complete

### T024: Create Hardware Detection Management Interface
**Status**: ⏳ Pending  
**Type**: Frontend - React Components  
**Dependencies**: T019 (Hardware Detection Controller created)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 75 minutes

**Description**:
Create admin interface for managing hardware detection jobs and viewing system status.

**Files to Create**:
- `src/digital-signage-web/src/app/admin/hardware-detection/page.tsx`
- `src/digital-signage-web/src/features/hardware/components/HardwareDetectionJobsList.tsx`
- `src/digital-signage-web/src/features/hardware/components/HardwareDetectionJobItem.tsx`
- `src/digital-signage-web/src/features/hardware/hooks/useHardwareDetectionJobs.ts`

**Implementation Requirements**:
- Admin role authentication required
- Job status filtering and searching
- Retry failed jobs functionality
- Real-time job status updates
- Export job reports to CSV

**Admin Features**:
- Hardware detection job queue monitoring
- Failed job retry with progress tracking
- Hardware detection statistics dashboard
- Device compatibility reports
- System performance metrics

**Acceptance Criteria**:
- Admin authentication enforced
- Job management functionality working
- Real-time updates implemented
- Export functionality working
- Statistics dashboard functional

### T025: Enhance Existing Device Components with Hardware Info
**Status**: ⏳ Pending  
**Type**: Frontend - Component Enhancement  
**Dependencies**: T023 (Hardware Profile components created)  
**Can Run in Parallel**: ❌ No  
**Estimated Effort**: 45 minutes

**Description**:
Integrate hardware profile information into existing device management components.

**Files to Modify**:
- `src/digital-signage-web/src/features/devices/components/DeviceCard.tsx`
- `src/digital-signage-web/src/features/devices/components/DeviceDetails.tsx`
- `src/digital-signage-web/src/app/devices/[id]/page.tsx`

**Enhancement Requirements**:
- Display hardware specifications in device details
- Show hardware detection status in device cards
- Hardware-aware content recommendations
- Device capability indicators
- Optimization status badges

**Integration Points**:
- Existing device management workflows
- Device registration approval process
- Content assignment based on device capabilities
- Device status monitoring

**Acceptance Criteria**:
- Hardware info displayed in existing components
- Hardware detection status visible
- Content recommendations working
- Device capabilities clearly shown
- Existing functionality preserved

### T026: Create Device Registration Enhancement UI
**Status**: ⏳ Pending  
**Type**: Frontend - Component Enhancement  
**Dependencies**: T020 (DeviceRegistrationController enhanced)  
**Can Run in Parallel**: ❌ No  
**Estimated Effort**: 60 minutes

**Description**:
Enhance device registration UI to show hardware detection progress and results.

**Files to Modify**:
- `src/digital-signage-web/src/app/devices/register/page.tsx`
- `src/digital-signage-web/src/features/devices/components/DeviceRegistrationForm.tsx`

**Enhancement Requirements**:
- Hardware detection progress indicators
- Real-time status updates during registration
- Hardware profile preview after detection
- Fallback UI for devices without hardware detection
- Registration success with hardware info summary

**New Features**:
- Hardware detection progress tracking
- Device capability preview
- Automatic content optimization notifications
- Registration workflow with hardware steps
- Error handling for hardware detection failures

**Acceptance Criteria**:
- Registration workflow enhanced
- Hardware detection progress visible
- Real-time updates working
- Error scenarios handled
- Backward compatibility maintained

## Phase 3.6: Testing and Quality Assurance

### T027: Unit Tests for Hardware Detection Services
**Status**: ⏳ Pending  
**Type**: Backend - Unit Tests  
**Dependencies**: T014, T015 (Hardware services created)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 75 minutes

**Description**:
Create comprehensive unit tests for hardware detection services with mock dependencies.

**Files to Create**:
- `tests/DigitalSignage.Application.Tests/Services/HardwareDetectionServiceTests.cs`
- `tests/DigitalSignage.Api.Tests/Services/HardwareDetectionBackgroundServiceTests.cs`

**Test Coverage**:
- Hardware information parsing and validation
- Hardware profile creation from device data
- Default profile generation for legacy devices
- Error handling and retry logic
- Job status transitions and updates
- Background service job processing

**Mock Requirements**:
- Database context mocking
- SignalR hub context mocking
- S3 service mocking for testing
- Logger verification
- Service scope testing

**Acceptance Criteria**:
- >80% code coverage for hardware services
- All error scenarios tested
- Mock dependencies properly configured
- Retry logic thoroughly tested
- Job processing workflows validated

### T028: Unit Tests for Enhanced Media Processing
**Status**: ⏳ Pending  
**Type**: Backend - Unit Tests  
**Dependencies**: T016, T017 (Enhanced media services)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 60 minutes

**Description**:
Create unit tests for multi-size media processing and device-optimized content delivery.

**Files to Create**:
- `tests/DigitalSignage.Application.Tests/Services/MediaServiceVariantTests.cs`
- `tests/DigitalSignage.Infrastructure.Tests/Services/S3FileUploadEnhancedTests.cs`

**Test Coverage**:
- Media variant generation for different resolutions
- Device-specific content optimization
- CloudFront URL generation
- S3 folder structure enhancement
- Image processing with SixLabors.ImageSharp
- Error handling for processing failures

**Testing Scenarios**:
- Multiple resolution variant creation
- Quality level optimization
- Device profile-based optimization
- Batch processing performance
- Storage optimization

**Acceptance Criteria**:
- Media processing thoroughly tested
- Device optimization algorithms validated
- Performance scenarios covered
- Error handling tested
- CloudFront integration verified

### T029: Integration Tests for Complete Hardware Workflow
**Status**: ⏳ Pending  
**Type**: Backend - Integration Tests  
**Dependencies**: T010 (initial integration test), All Phase 3.3 tasks  
**Can Run in Parallel**: ❌ No  
**Estimated Effort**: 90 minutes

**Description**:
Enhance and verify end-to-end integration tests for complete hardware detection and optimization workflow.

**Files to Modify/Create**:
- `tests/DigitalSignage.Api.Tests/Integration/HardwareDetectionWorkflowTests.cs` (enhance)
- `tests/DigitalSignage.Api.Tests/Integration/DeviceOptimizationIntegrationTests.cs` (new)

**Workflow Scenarios**:
- Android TV registration with hardware info → Profile creation → Media optimization
- Legacy device registration → Default profile → Standard content delivery
- Hardware detection failure → Retry → Success
- Real-time notifications throughout workflow
- Admin hardware management workflows

**Integration Points**:
- Database transactions across entities
- SignalR real-time communication
- Background service processing
- S3 and CloudFront integration
- Media processing pipeline

**Acceptance Criteria**:
- All workflow scenarios pass
- Real-time notifications verified
- Database consistency maintained
- Performance targets met
- Error recovery tested

### T030: Performance Testing and Optimization
**Status**: ⏳ Pending  
**Type**: Backend - Performance Testing  
**Dependencies**: T029 (integration tests passing)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 60 minutes

**Description**:
Create performance tests for hardware detection and media processing under load.

**Files to Create**:
- `tests/DigitalSignage.Api.Tests/Performance/HardwareDetectionPerformanceTests.cs`
- `tests/DigitalSignage.Api.Tests/Performance/MediaOptimizationPerformanceTests.cs`

**Performance Targets**:
- Device registration with hardware < 2 seconds response time
- Hardware detection processing < 30 seconds per device
- Media variant generation < 60 seconds per media file
- Concurrent device registrations (100+ devices)
- Background job processing throughput

**Testing Scenarios**:
- Concurrent device registrations
- Bulk media processing
- Database query optimization
- Memory usage during processing
- SignalR broadcast performance

**Acceptance Criteria**:
- All performance targets met
- Concurrent load handled correctly
- Memory usage within acceptable limits
- Database queries optimized
- SignalR performance validated

## Phase 3.7: Documentation and Deployment

### T031: Update API Documentation
**Status**: ⏳ Pending  
**Type**: Documentation  
**Dependencies**: T018, T019, T020 (API controllers implemented)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 45 minutes

**Description**:
Update OpenAPI documentation and integration guides for enhanced device registration features.

**Files to Update**:
- `docs/api/digital-signage-backoffice-api.yaml` (update existing)
- `docs/api/AndroidTV-API-Documentation.md` (enhance)
- `specs/028-enhanced-device-registration/contracts/api-contracts.yaml` (finalize)

**Documentation Updates**:
- Enhanced device registration endpoints
- Hardware profile management endpoints
- Device-optimized content delivery endpoints
- Hardware detection admin endpoints
- WebSocket events for hardware processing

**Integration Guide Updates**:
- Android TV hardware detection integration
- Admin interface hardware management
- Content optimization workflow
- Troubleshooting hardware detection issues

**Acceptance Criteria**:
- OpenAPI spec updated and valid
- Integration guides comprehensive
- Code examples provided
- Troubleshooting section complete
- API versioning properly documented

### T032: Update Deployment Configuration
**Status**: ⏳ Pending  
**Type**: DevOps - Configuration  
**Dependencies**: T005 (migration created), T015 (background service)  
**Can Run in Parallel**: ✅ Yes [P]  
**Estimated Effort**: 30 minutes

**Description**:
Update deployment configurations for new background services and database schema.

**Files to Update**:
- Production deployment scripts (if any)
- Database migration deployment procedures
- Background service configuration
- CloudFront configuration updates
- Performance monitoring updates

**Configuration Updates**:
- HardwareDetectionBackgroundService settings
- Enhanced S3 and CloudFront configuration
- Database migration execution
- SignalR scaling considerations
- Monitoring for hardware detection metrics

**Acceptance Criteria**:
- Deployment procedures updated
- Configuration validated
- Migration strategy documented
- Rollback procedures defined
- Monitoring configuration complete

### T033: Execute Manual Testing Scenarios
**Status**: ⏳ Pending  
**Type**: Quality Assurance  
**Dependencies**: All implementation tasks complete  
**Can Run in Parallel**: ❌ No (requires complete system)  
**Estimated Effort**: 120 minutes

**Description**:
Execute comprehensive manual testing scenarios from quickstart.md and validate all functionality.

**Testing Based On**:
- `specs/028-enhanced-device-registration/quickstart.md`

**Manual Test Scenarios**:
- Android TV registration with complete hardware info
- Legacy device registration (backward compatibility)
- Device-optimized content delivery testing
- Hardware detection failure and recovery
- Admin hardware management workflows
- Real-time notifications validation

**Cross-Browser Testing**:
- Chrome, Firefox, Safari, Edge
- Mobile responsive design
- WebSocket connectivity across browsers
- Performance on different devices

**Acceptance Criteria**:
- All quickstart scenarios pass
- Cross-browser compatibility confirmed
- Mobile responsiveness verified
- Performance acceptable across scenarios
- User experience flows smooth

## Dependencies Summary

### Critical Path
```
T005 (Migration) → T006-T010 (Tests) → T013 (DeviceRegistrationService) → 
T014 (HardwareDetectionService) → T015 (BackgroundService) → 
T018-T020 (Controllers) → T021-T022 (SignalR) → T029 (Integration Tests)
```

### Parallel Execution Opportunities

**Phase 3.1 Setup** - Can run in parallel:
- T001: DeviceHardwareProfile Entity [P]
- T002: MediaVariant Entity [P] 
- T003: DeviceRegistrationRequest Enhancement [P]

**Phase 3.2 Tests** - Can run in parallel after T005:
- T006: Enhanced Registration Contract Test [P]
- T007: Hardware Profile Contract Test [P]
- T008: Optimized Content Contract Test [P]
- T009: Hardware Detection Status Contract Test [P]
- T010: Integration Workflow Test [P]

**Phase 3.3 DTOs** - Can run in parallel after tests:
- T011: DeviceHardwareProfile DTOs [P]
- T012: MediaVariant DTOs [P]

**Phase 3.5 Frontend** - Can run in parallel after API controllers:
- T023: Hardware Profile Components [P]
- T024: Hardware Detection Management [P]

**Phase 3.6 Testing** - Can run in parallel after implementation:
- T027: Hardware Services Unit Tests [P]
- T028: Media Processing Unit Tests [P]
- T030: Performance Testing [P]

**Phase 3.7 Documentation** - Can run in parallel:
- T031: API Documentation [P]
- T032: Deployment Configuration [P]

## Parallel Execution Examples

### Phase 3.1 Entity Setup
```bash
# Execute simultaneously (different files):
Task T001: "Create DeviceHardwareProfile entity and EF configuration"
Task T002: "Create MediaVariant entity and EF configuration"  
Task T003: "Enhance DeviceRegistrationRequest entity"
```

### Phase 3.2 TDD Tests
```bash
# Execute simultaneously after migration (different test files):
Task T006: "Contract test enhanced device registration endpoint" 
Task T007: "Contract test device hardware profile endpoint"
Task T008: "Contract test device-optimized content endpoint"
Task T009: "Contract test hardware detection status endpoint"
Task T010: "Integration test complete hardware workflow"
```

### Phase 3.6 Quality Testing
```bash
# Execute simultaneously (independent test suites):
Task T027: "Unit tests for hardware detection services"
Task T028: "Unit tests for enhanced media processing"
Task T030: "Performance testing and optimization"
```

## Integration Focus Areas

### Existing System Integration
✅ **Device Registration**: Extends existing PIN-based approval workflow  
✅ **Media Processing**: Builds on existing MediaService and S3FileUploadService  
✅ **SignalR**: Leverages existing NotificationHub and RealtimeEventBroadcaster  
✅ **Authentication**: Uses existing JWT and role-based authorization  
✅ **Database**: Extends existing EF Core patterns and PostgreSQL setup  

### Integration Validation Tasks
- T013: Ensure DeviceRegistrationService backward compatibility
- T016: Verify MediaService integration with existing upload workflow
- T020: Maintain existing API contract compatibility
- T021: Integrate with existing SignalR event patterns
- T025: Preserve existing device management UI functionality

## Notes
- **[P] tasks**: Different files, no dependencies - can run in parallel
- **Test-First**: All contract/integration tests (T006-T010) must fail before implementation
- **Backward Compatibility**: All enhancements maintain existing functionality
- **Integration Focus**: Leverages existing infrastructure maximally
- **Performance**: Hardware detection and media processing designed for concurrent operations
- **Real-time**: SignalR integration provides immediate feedback throughout workflows

## Task Validation Checklist
- [x] All contracts have corresponding tests (T006-T009)
- [x] All entities have model tasks (T001-T004)  
- [x] All tests come before implementation (T006-T010 → T013+)
- [x] Parallel tasks truly independent (different files marked [P])
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Integration opportunities identified and leveraged
- [x] Backward compatibility maintained throughout