# Quickstart: User-Based Content Assignment

**Feature**: 019-user-based-content  
**Date**: 2025-10-02  
**Status**: Implementation Ready

This quickstart guide walks you through implementing and testing the user-based content assignment feature from scratch.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Database Migration](#database-migration)
4. [Backend Implementation](#backend-implementation)
5. [Testing Strategy](#testing-strategy)
6. [Common Scenarios](#common-scenarios)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- ✅ .NET 8 SDK (8.0.100 or later)
- ✅ PostgreSQL 14+ (or SQL Server 2019+ as alternate)
- ✅ Entity Framework Core CLI tools
- ✅ Postman or similar API testing tool (optional)
- ✅ IDE: Visual Studio 2022 / VS Code with C# extension

### Existing Features
This feature builds on:
- ✅ Feature 002: Project structure (Clean Architecture)
- ✅ Feature 009: Authentication system (JWT + Device Key)
- ✅ Feature 011: Android TV self-registration (QR code flow)
- ✅ Feature 013: QR code system
- ✅ Feature 018: WebSocket implementation (SignalR)

### Knowledge Requirements
- C# async/await patterns
- Entity Framework Core migrations
- ASP.NET Core Web API controllers
- Clean Architecture layering
- JWT authentication basics

---

## Development Setup

### 1. Branch Setup

```bash
# Ensure you're on the correct branch
git checkout 019-user-based-content

# Pull latest changes
git pull origin 019-user-based-content

# Verify workspace structure
ls -la src/DigitalSignage.Api
ls -la src/DigitalSignage.Domain/Entities
ls -la src/DigitalSignage.Infrastructure/Data
```

### 2. Configuration

**Update `appsettings.Development.json`:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=DigitalSignage_Dev;Username=postgres;Password=your_password",
    "DatabaseProvider": "PostgreSQL"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  }
}
```

### 3. Verify Dependencies

Check that all required NuGet packages are installed:

```bash
cd src/DigitalSignage.Infrastructure
dotnet list package | grep -E "Npgsql|EntityFrameworkCore"
```

Expected output:
- `Npgsql.EntityFrameworkCore.PostgreSQL` >= 8.0.0
- `Microsoft.EntityFrameworkCore` >= 8.0.0
- `Microsoft.EntityFrameworkCore.Tools` >= 8.0.0

---

## Database Migration

### 1. Create Migration

```bash
# From solution root
dotnet ef migrations add AddUserContentAssignment \
  -p src/DigitalSignage.Infrastructure \
  -s src/DigitalSignage.Api \
  -o Data/Migrations
```

**What this creates:**
- `UserSchedules` table (junction table)
- `Device.AssignedUserId` column
- `DeviceRegistrationRequest.RequestedUsername` column
- `DeviceRegistrationRequest.RequestedUserDisplayName` column
- `DeviceRegistrationRequest.MatchedUserId` column
- `Schedule.IsDefault` column
- All necessary indexes and foreign keys

### 2. Review Migration

```bash
# View generated migration
cat src/DigitalSignage.Infrastructure/Data/Migrations/*_AddUserContentAssignment.cs
```

Verify it includes:
- ✅ `CreateTable("UserSchedules")` with composite unique index
- ✅ `AddColumn` operations for all new fields
- ✅ Foreign key constraints with `OnDelete.SetNull` or `Cascade`
- ✅ Indexes: `AssignedUserId`, `RequestedUsername`, `IsDefault`, `(Status, RequestedAt)`

### 3. Apply Migration

```bash
# Update database
dotnet ef database update \
  -p src/DigitalSignage.Infrastructure \
  -s src/DigitalSignage.Api
```

### 4. Verify Schema

```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d DigitalSignage_Dev

# Check tables
\dt

# Verify UserSchedules structure
\d "UserSchedules"

# Verify Device columns
\d "Devices"

# Exit
\q
```

---

## Backend Implementation

### Phase 1: Domain Entities (Already Done)

✅ Entities defined in `/specs/019-user-based-content/data-model.md`:
- `Device` - Updated with `AssignedUserId`
- `DeviceRegistrationRequest` - Updated with user identification fields
- `Schedule` - Updated with `IsDefault`
- `UserSchedule` - NEW entity

### Phase 2: Application Services

**Order of Implementation:**

#### 1. `IDeviceRegistrationService` Update

**File**: `src/DigitalSignage.Application/Interfaces/IDeviceRegistrationService.cs`

Add methods:
```csharp
Task<DeviceRegistrationResponseDto> RegisterDeviceWithUserAsync(
    DeviceRegistrationWithUserRequestDto request);

Task<PendingRegistrationDetailDto> GetPendingRegistrationDetailsAsync(Guid requestId);
```

#### 2. `IUserScheduleService` (New)

**File**: `src/DigitalSignage.Application/Interfaces/IUserScheduleService.cs`

```csharp
public interface IUserScheduleService
{
    Task<IEnumerable<AssignedScheduleDto>> GetUserSchedulesAsync(int userId);
    Task AssignUserSchedulesAsync(int userId, IEnumerable<int> scheduleIds, int assignedByUserId);
    Task RemoveUserSchedulesAsync(int userId);
    Task<IEnumerable<UserAssignmentDto>> GetScheduleUsersAsync(int scheduleId);
}
```

#### 3. `IContentDeliveryService` Update

**File**: `src/DigitalSignage.Application/Interfaces/IContentDeliveryService.cs`

Update method signature:
```csharp
Task<ScheduleResponseDto> GetNextScheduleAsync(string deviceKey);
// Add internal priority logic: User → DeviceGroup → Default
```

#### 4. Implementation Order

```
1. UserScheduleService.cs (Application/Services/)
2. DeviceRegistrationService.cs (update existing)
3. ContentDeliveryService.cs (update existing)
4. ScheduleService.cs (add SetDefaultScheduleAsync)
```

### Phase 3: API Controllers

**Order of Implementation:**

#### 1. Update `DeviceRegistrationController`

**File**: `src/DigitalSignage.Api/Controllers/DeviceRegistrationController.cs`

```csharp
[HttpPost("register")]
[AllowAnonymous]
[ProducesResponseType(typeof(DeviceRegistrationResponseDto), StatusCodes.Status201Created)]
[ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
public async Task<ActionResult<DeviceRegistrationResponseDto>> Register(
    [FromBody] DeviceRegistrationWithUserRequestDto request)
{
    // Validate email format
    // Call service to create registration request with user matching
    // Return response with matchedUser information
}

[HttpGet("pending")]
[Authorize(Roles = "Admin,DeviceManager")]
[ProducesResponseType(typeof(List<PendingRegistrationDetailDto>), StatusCodes.Status200OK)]
public async Task<ActionResult<List<PendingRegistrationDetailDto>>> GetPending()
{
    // Return list with auto-matched user info
}
```

#### 2. Create `UserScheduleController`

**File**: `src/DigitalSignage.Api/Controllers/UserScheduleController.cs`

```csharp
[ApiController]
[Route("api/admin/users/{userId}/schedules")]
[Authorize(Roles = "Admin,ContentManager")]
public class UserScheduleController : ControllerBase
{
    private readonly IUserScheduleService _userScheduleService;
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AssignedScheduleDto>>> GetUserSchedules(int userId) { }
    
    [HttpPost]
    public async Task<ActionResult<AssignSchedulesResponseDto>> AssignSchedules(
        int userId, [FromBody] AssignSchedulesRequestDto request) { }
    
    [HttpDelete]
    public async Task<IActionResult> RemoveAllSchedules(int userId) { }
}
```

#### 3. Update `DeviceController`

**File**: `src/DigitalSignage.Api/Controllers/DeviceController.cs`

```csharp
[HttpGet("next-schedule")]
[Authorize(AuthenticationSchemes = "DeviceKey")]
[ProducesResponseType(typeof(ScheduleResponseDto), StatusCodes.Status200OK)]
public async Task<ActionResult<ScheduleResponseDto>> GetNextSchedule()
{
    var deviceKey = GetDeviceKeyFromHeader();
    var schedule = await _contentDeliveryService.GetNextScheduleAsync(deviceKey);
    return Ok(schedule);
}

[HttpPost("heartbeat")]
[Authorize(AuthenticationSchemes = "DeviceKey")]
public async Task<ActionResult<HeartbeatResponseDto>> Heartbeat(
    [FromBody] HeartbeatRequestDto request)
{
    // Check for user assignment changes
    // Return shouldRefreshContent flag
}
```

---

## Testing Strategy

### Unit Tests

#### 1. UserScheduleService Tests

**File**: `tests/DigitalSignage.Application.Tests/Services/UserScheduleServiceTests.cs`

```csharp
[Fact]
public async Task AssignUserSchedules_ShouldReplaceExistingAssignments()
{
    // Arrange: User with schedules [1, 2]
    // Act: Assign schedules [3, 4]
    // Assert: User now has only [3, 4]
}

[Fact]
public async Task AssignUserSchedules_WithEmptyArray_ShouldRemoveAllAssignments()
{
    // Arrange: User with schedules [1, 2]
    // Act: Assign empty array []
    // Assert: User has no schedules
}

[Fact]
public async Task GetUserSchedules_ShouldReturnOnlyActiveSchedules()
{
    // Arrange: User with active and inactive schedules
    // Act: Get schedules
    // Assert: Returns only active ones
}
```

#### 2. ContentDeliveryService Tests

**File**: `tests/DigitalSignage.Application.Tests/Services/ContentDeliveryServiceTests.cs`

```csharp
[Fact]
public async Task GetNextSchedule_WithUserAssignment_ShouldReturnUserSchedule()
{
    // Arrange: Device with AssignedUserId, user has schedules, group has schedules
    // Act: Get next schedule
    // Assert: Returns user schedule (Priority 1)
}

[Fact]
public async Task GetNextSchedule_WithoutUserAssignment_ShouldReturnGroupSchedule()
{
    // Arrange: Device without user, but in group with schedules
    // Act: Get next schedule
    // Assert: Returns group schedule (Priority 2)
}

[Fact]
public async Task GetNextSchedule_WithNoAssignments_ShouldReturnDefaultSchedule()
{
    // Arrange: Device with no user, no group, but default schedule exists
    // Act: Get next schedule
    // Assert: Returns default schedule (Priority 3)
}
```

#### 3. DeviceRegistrationService Tests

```csharp
[Fact]
public async Task RegisterDevice_WithExistingEmail_ShouldAutoMatchUser()
{
    // Arrange: User exists with email "john@example.com"
    // Act: Register device with requestedUsername = "john@example.com"
    // Assert: Response contains matchedUser with userId
}

[Fact]
public async Task RegisterDevice_WithNonExistingEmail_ShouldReturnNullMatchedUser()
{
    // Arrange: Email doesn't exist in database
    // Act: Register device with requestedUsername
    // Assert: matchedUser is null in response
}
```

### Integration Tests

**File**: `tests/DigitalSignage.Api.Tests/Controllers/UserScheduleControllerTests.cs`

```csharp
[Fact]
public async Task AssignSchedules_AsAdmin_ShouldReturn200()
{
    // Arrange: JWT token with Admin role
    // Act: POST /api/admin/users/42/schedules with scheduleIds [1, 2]
    // Assert: 200 OK, database updated
}

[Fact]
public async Task GetNextSchedule_AsDevice_WithUserAssignment_ShouldReturnUserContent()
{
    // Arrange: Device with valid deviceKey, assigned to user with schedules
    // Act: GET /api/device/next-schedule with DeviceKey header
    // Assert: 200 OK, source = "UserAssignment"
}
```

### Contract Tests

Run against OpenAPI specifications:

```bash
# Install Schemathesis
pip install schemathesis

# Test device registration API
schemathesis run \
  specs/019-user-based-content/contracts/device-registration-api.yaml \
  --base-url=http://localhost:5000

# Test schedule assignment API
schemathesis run \
  specs/019-user-based-content/contracts/schedule-assignment-api.yaml \
  --base-url=http://localhost:5000 \
  --header="Authorization: Bearer YOUR_JWT_TOKEN"
```

### Scenario Tests

**File**: `tests/DigitalSignage.Api.Tests/Scenarios/UserBasedContentScenarioTests.cs`

```csharp
[Fact]
public async Task Scenario_DeviceRegistrationWithUserAssignment_EndToEnd()
{
    // 1. Device registers with email
    // 2. System auto-matches user
    // 3. Admin approves and confirms user
    // 4. Device polls and gets deviceKey
    // 5. Admin assigns schedules to user
    // 6. Device calls next-schedule and gets user-specific content
}
```

---

## Common Scenarios

### Scenario 1: New Device Registration with Auto-Match

**Steps:**

1. **Device sends registration** (with user email):
   ```bash
   curl -X POST http://localhost:5000/api/device/register \
     -H "Content-Type: application/json" \
     -d '{
       "deviceName": "Conference Room A",
       "deviceModel": "Sony Bravia",
       "osVersion": "Android TV 12",
       "screenResolution": "3840x2160",
       "macAddress": "00:11:22:33:44:55",
       "requestedUsername": "john.doe@company.com",
       "requestedUserDisplayName": "John Doe - Marketing"
     }'
   ```

2. **Expected Response** (User found):
   ```json
   {
     "requestId": "550e8400-e29b-41d4-a716-446655440000",
     "registrationPin": "AB1234",
     "qrCodeUrl": "https://...",
     "status": "Pending",
     "expiresAt": "2025-10-02T10:15:00Z",
     "matchedUser": {
       "userId": 42,
       "email": "john.doe@company.com",
       "displayName": "John Doe",
       "matchedAutomatically": true
     }
   }
   ```

3. **Admin reviews pending**:
   ```bash
   curl -X GET http://localhost:5000/api/admin/device-registrations/pending \
     -H "Authorization: Bearer <ADMIN_JWT>"
   ```

4. **Admin approves** (confirms auto-matched user):
   ```bash
   curl -X POST http://localhost:5000/api/admin/device-registrations/550e8400-e29b-41d4-a716-446655440000/approve \
     -H "Authorization: Bearer <ADMIN_JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "assignedUserId": 42,
       "deviceGroupId": 5,
       "notes": "Approved for Marketing department"
     }'
   ```

5. **Device polls status**:
   ```bash
   curl -X GET http://localhost:5000/api/device/registration/550e8400-e29b-41d4-a716-446655440000/status
   ```

6. **Expected Response** (Approved):
   ```json
   {
     "status": "Approved",
     "deviceKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "assignedUser": {
       "userId": 42,
       "email": "john.doe@company.com",
       "displayName": "John Doe"
     },
     "signalRUrl": "wss://api.example.com/hubs/notification"
   }
   ```

### Scenario 2: Admin Assigns Schedules to User

**Steps:**

1. **Admin assigns multiple schedules**:
   ```bash
   curl -X POST http://localhost:5000/api/admin/users/42/schedules \
     -H "Authorization: Bearer <ADMIN_JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "scheduleIds": [10, 15, 20]
     }'
   ```

2. **Expected Response**:
   ```json
   {
     "userId": 42,
     "assignedSchedules": [
       {"scheduleId": 10, "scheduleName": "Marketing Campaign Q4"},
       {"scheduleId": 15, "scheduleName": "Company Announcements"},
       {"scheduleId": 20, "scheduleName": "Product Launch"}
     ],
     "totalAssigned": 3,
     "replacedPrevious": true,
     "assignedAt": "2025-10-02T10:00:00Z"
   }
   ```

3. **Verify assignment**:
   ```bash
   curl -X GET http://localhost:5000/api/admin/users/42/schedules \
     -H "Authorization: Bearer <ADMIN_JWT>"
   ```

### Scenario 3: Device Gets Personalized Content

**Steps:**

1. **Device calls next-schedule** (with deviceKey):
   ```bash
   curl -X GET http://localhost:5000/api/device/next-schedule \
     -H "Authorization: Bearer <DEVICE_KEY>"
   ```

2. **Expected Response** (User-specific content):
   ```json
   {
     "scheduleId": 10,
     "scheduleName": "Marketing Campaign Q4",
     "priority": 10,
     "source": "UserAssignment",
     "assignedUser": {
       "userId": 42,
       "email": "john.doe@company.com",
       "displayName": "John Doe"
     },
     "media": [
       {
         "mediaId": 100,
         "fileName": "campaign-video.mp4",
         "mediaType": "Video",
         "duration": 30,
         "presignedUrl": "https://s3.amazonaws.com/..."
       }
     ]
   }
   ```

### Scenario 4: Priority Fallback Logic

**Test with devices in different states:**

```bash
# Device WITH user assignment → Gets user schedules
curl -X GET http://localhost:5000/api/device/next-schedule \
  -H "Authorization: Bearer <DEVICE_WITH_USER_KEY>"
# Expected source: "UserAssignment"

# Device WITHOUT user but IN group → Gets group schedules
curl -X GET http://localhost:5000/api/device/next-schedule \
  -H "Authorization: Bearer <DEVICE_IN_GROUP_KEY>"
# Expected source: "DeviceGroup"

# Device WITHOUT user and WITHOUT group → Gets default
curl -X GET http://localhost:5000/api/device/next-schedule \
  -H "Authorization: Bearer <UNASSIGNED_DEVICE_KEY>"
# Expected source: "Default"
```

---

## Troubleshooting

### Problem: Migration Fails with "Column already exists"

**Solution:**
```bash
# Rollback migration
dotnet ef database update <PreviousMigrationName> \
  -p src/DigitalSignage.Infrastructure \
  -s src/DigitalSignage.Api

# Remove migration file
rm src/DigitalSignage.Infrastructure/Data/Migrations/*_AddUserContentAssignment.cs

# Recreate migration
dotnet ef migrations add AddUserContentAssignment \
  -p src/DigitalSignage.Infrastructure \
  -s src/DigitalSignage.Api
```

### Problem: Device Gets Wrong Content Priority

**Debug Steps:**

1. Check device assignment:
   ```sql
   SELECT "Id", "DeviceName", "AssignedUserId", "DeviceGroupId" 
   FROM "Devices" 
   WHERE "MacAddress" = '00:11:22:33:44:55';
   ```

2. Check user schedules:
   ```sql
   SELECT us."UserId", us."ScheduleId", s."ScheduleName", s."IsActive"
   FROM "UserSchedules" us
   JOIN "Schedules" s ON s."Id" = us."ScheduleId"
   WHERE us."UserId" = 42;
   ```

3. Check device group schedules:
   ```sql
   SELECT dgs."DeviceGroupId", dgs."ScheduleId", s."ScheduleName"
   FROM "DeviceGroupSchedules" dgs
   JOIN "Schedules" s ON s."Id" = dgs."ScheduleId"
   WHERE dgs."DeviceGroupId" = 5;
   ```

4. Check default schedules:
   ```sql
   SELECT "Id", "ScheduleName", "IsDefault", "IsActive"
   FROM "Schedules"
   WHERE "IsDefault" = true AND "IsActive" = true;
   ```

### Problem: Auto-Match Not Working

**Check:**

1. User exists and is active:
   ```sql
   SELECT "Id", "Email", "IsActive" 
   FROM "Users" 
   WHERE LOWER("Email") = LOWER('john.doe@company.com');
   ```

2. Email format validation:
   ```csharp
   // In DeviceRegistrationService
   var isValidEmail = new EmailAddressAttribute().IsValid(request.RequestedUsername);
   if (!isValidEmail) throw new ValidationException("Invalid email format");
   ```

3. Check matched user in registration request:
   ```sql
   SELECT "RequestId", "RequestedUsername", "MatchedUserId"
   FROM "DeviceRegistrationRequests"
   WHERE "RequestId" = '550e8400-e29b-41d4-a716-446655440000';
   ```

### Problem: Schedule Assignment Not Replacing Previous

**Verify transaction handling:**

```csharp
// In UserScheduleService.AssignUserSchedulesAsync
using var transaction = await _context.Database.BeginTransactionAsync();
try
{
    // 1. Delete existing assignments
    var existing = await _context.UserSchedules
        .Where(us => us.UserId == userId)
        .ToListAsync();
    _context.UserSchedules.RemoveRange(existing);
    
    // 2. Add new assignments
    var newAssignments = scheduleIds.Select(scheduleId => new UserSchedule
    {
        UserId = userId,
        ScheduleId = scheduleId,
        AssignedAt = DateTimeOffset.UtcNow,
        AssignedByUserId = assignedByUserId
    });
    await _context.UserSchedules.AddRangeAsync(newAssignments);
    
    await _context.SaveChangesAsync();
    await transaction.CommitAsync();
}
catch
{
    await transaction.RollbackAsync();
    throw;
}
```

### Problem: Unique Constraint Violation on (UserId, ScheduleId)

**Cause:** Attempting to assign same schedule twice without deleting existing.

**Solution:** Ensure delete-then-insert pattern in `AssignUserSchedulesAsync`.

---

## Next Steps

After completing this quickstart:

1. ✅ **Verify all unit tests pass**: `dotnet test`
2. ✅ **Run integration tests**: Focus on UserScheduleController and DeviceController
3. ✅ **Test contract compliance**: Run Schemathesis against API contracts
4. ✅ **Execute scenario tests**: End-to-end user flows
5. ✅ **Update documentation**: API docs with Swagger annotations
6. ✅ **Frontend integration**: Next.js admin UI for schedule assignment

---

## Resources

- **Spec**: `/specs/019-user-based-content/spec.md`
- **Data Model**: `/specs/019-user-based-content/data-model.md`
- **Research**: `/specs/019-user-based-content/research.md`
- **API Contracts**: `/specs/019-user-based-content/contracts/*.yaml`
- **Implementation Plan**: `/specs/019-user-based-content/plan.md`

---

**Status**: ✅ Quickstart Complete - Ready for Implementation
