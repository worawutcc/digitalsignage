# Quickstart Guide: Admin User Permission Management

## Overview
This guide walks through the complete implementation and testing of the RBAC permission management system for digital signage device groups.

## Prerequisites
- .NET 8 SDK installed
- PostgreSQL database running
- Existing digital signage system with:
  - JWT authentication (009-authentication-system)
  - Hierarchical device groups (014-basic-hierarchy)
  - User management system

## Implementation Steps

### 1. Domain Layer Setup
Create the core entities and enums:

```bash
# Create enum
touch src/DigitalSignage.Domain/Enums/UserPermissionLevel.cs

# Create entities
touch src/DigitalSignage.Domain/Entities/UserDeviceGroupPermission.cs
touch src/DigitalSignage.Domain/Entities/PermissionAuditLog.cs

# Create repository interface
touch src/DigitalSignage.Domain/Interfaces/IPermissionRepository.cs
```

### 2. Database Migration
Generate and apply the database migration:

```bash
# Generate migration
dotnet ef migrations add AddUserPermissionSystem \
  -p src/DigitalSignage.Infrastructure \
  -s src/DigitalSignage.Api

# Apply migration
dotnet ef database update \
  -p src/DigitalSignage.Infrastructure \
  -s src/DigitalSignage.Api
```

### 3. Infrastructure Layer
Implement data access layer:

```bash
# Create EF configurations
touch src/DigitalSignage.Infrastructure/Data/Configurations/UserDeviceGroupPermissionConfiguration.cs
touch src/DigitalSignage.Infrastructure/Data/Configurations/PermissionAuditLogConfiguration.cs

# Create repository implementation
touch src/DigitalSignage.Infrastructure/Data/Repositories/PermissionRepository.cs
```

### 4. Application Layer
Implement business logic services:

```bash
# Create DTOs
mkdir -p src/DigitalSignage.Application/DTOs/Permissions
touch src/DigitalSignage.Application/DTOs/Permissions/UserPermissionDto.cs
touch src/DigitalSignage.Application/DTOs/Permissions/SetPermissionRequest.cs
touch src/DigitalSignage.Application/DTOs/Permissions/PermissionAuditDto.cs

# Create services
touch src/DigitalSignage.Application/Services/IPermissionService.cs
touch src/DigitalSignage.Application/Services/PermissionService.cs

# Create AutoMapper profile
touch src/DigitalSignage.Application/Mappings/PermissionMappingProfile.cs
```

### 5. API Layer
Implement controllers and middleware:

```bash
# Create controllers
touch src/DigitalSignage.Api/Controllers/AdminPermissionController.cs
touch src/DigitalSignage.Api/Controllers/UserPermissionController.cs

# Create middleware
touch src/DigitalSignage.Api/Middleware/PermissionAuthorizationMiddleware.cs

# Create service extensions
touch src/DigitalSignage.Api/Extensions/PermissionServiceExtensions.cs
```

### 6. Testing Setup
Create comprehensive test suite:

```bash
# Create test files
touch tests/DigitalSignage.Application.Tests/Services/PermissionServiceTests.cs
touch tests/DigitalSignage.Infrastructure.Tests/Repositories/PermissionRepositoryTests.cs
touch tests/DigitalSignage.Api.Tests/Controllers/AdminPermissionControllerTests.cs
touch tests/DigitalSignage.Api.Tests/Controllers/UserPermissionControllerTests.cs
```

## Testing Scenarios

### Unit Test Validation
```bash
# Run unit tests
dotnet test tests/DigitalSignage.Application.Tests/
dotnet test tests/DigitalSignage.Infrastructure.Tests/
```

### Integration Test Validation
```bash
# Run API integration tests
dotnet test tests/DigitalSignage.Api.Tests/
```

### Manual Testing Scenarios

#### Scenario 1: Admin Grant Permission
Test admin granting ManageContent permission to user for device group:

```bash
# Start the API
dotnet run --project src/DigitalSignage.Api

# Get admin JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Grant permission (replace tokens and IDs)
curl -X PUT http://localhost:5000/api/admin/users/2/permissions/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceGroupId": 1,
    "permission": "ManageContent",
    "reason": "User needs to manage lobby content"
  }'
```

**Expected Result**: Permission created, audit log entry added, user can access device group.

#### Scenario 2: Permission Inheritance Test
Test hierarchical permission inheritance:

```bash
# Grant FullControl on parent group (ID: 1)
curl -X PUT http://localhost:5000/api/admin/users/2/permissions/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceGroupId": 1,
    "permission": "FullControl",
    "reason": "Department head access"
  }'

# Check inherited permissions on child group (ID: 2)
curl -X GET http://localhost:5000/api/admin/users/2/permissions?includeInherited=true \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Result**: User has FullControl on parent group (explicit) and child groups (inherited).

#### Scenario 3: User Access Validation
Test user can only see accessible device groups:

```bash
# Get user JWT token (non-admin user)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'

# Get accessible device groups
curl -X GET http://localhost:5000/api/user/accessible-device-groups \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

**Expected Result**: Only device groups with ViewOnly or higher permissions returned.

#### Scenario 4: Audit Trail Verification
Test audit logging functionality:

```bash
# Make several permission changes
curl -X PUT http://localhost:5000/api/admin/users/2/permissions/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceGroupId": 1, "permission": "ViewOnly", "reason": "Reduced access"}'

curl -X DELETE http://localhost:5000/api/admin/users/2/permissions/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Check audit log
curl -X GET http://localhost:5000/api/admin/permissions/audit?userId=2 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Result**: Audit log shows GRANTED → MODIFIED → REVOKED sequence with timestamps and reasons.

## Performance Testing

### Load Test Permission Validation
Test permission validation performance under load:

```bash
# Install k6 for load testing
npm install -g k6

# Create load test script
cat > permission-load-test.js << 'EOF'
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 500 },
    { duration: '30s', target: 0 },
  ],
};

export default function() {
  let token = 'YOUR_USER_TOKEN';
  let response = http.get('http://localhost:5000/api/user/accessible-device-groups', {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
  });
}
EOF

# Run load test
k6 run permission-load-test.js
```

**Expected Result**: >95% requests complete in <100ms, no errors under 500 concurrent users.

### Cache Performance Test
Validate permission caching effectiveness:

```bash
# Make identical permission requests
for i in {1..100}; do
  curl -s http://localhost:5000/api/user/accessible-device-groups \
    -H "Authorization: Bearer YOUR_USER_TOKEN" \
    -w "%{time_total}\n" -o /dev/null
done | awk '{sum+=$1; if($1>max) max=$1; if(min=="" || $1<min) min=$1} END {print "Avg:", sum/NR, "Min:", min, "Max:", max}'
```

**Expected Result**: Average response time significantly lower than initial uncached request.

## Validation Checklist

### Functional Requirements ✅
- [ ] Admin can assign four-tier permissions (NoAccess, ViewOnly, ManageContent, FullControl)
- [ ] Permissions inherit hierarchically through device group structure  
- [ ] Users see only device groups they have access to
- [ ] Explicit permissions can override inherited permissions
- [ ] Complete audit trail of all permission changes
- [ ] Admin role required for permission management operations

### Security Requirements ✅
- [ ] JWT authentication required for all endpoints
- [ ] Admin role validation for permission management endpoints
- [ ] User can only query their own permissions (non-admin)
- [ ] Audit logs are immutable and tamper-proof
- [ ] No unauthorized access to protected device groups

### Performance Requirements ✅
- [ ] Permission validation completes in <100ms
- [ ] System supports 500+ concurrent users with caching
- [ ] Database queries optimized with proper indexing
- [ ] Cache invalidation works correctly for permission changes

### Data Integrity ✅
- [ ] Database constraints prevent invalid permission assignments
- [ ] Foreign key relationships maintain referential integrity
- [ ] Audit logs have complete before/after state tracking
- [ ] Permission inheritance calculation is consistent

## Deployment Notes

### Database Configuration
```sql
-- Ensure proper indexes exist
ANALYZE UserDeviceGroupPermissions;
ANALYZE PermissionAuditLogs;

-- Verify constraint enforcement
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid IN (
  'UserDeviceGroupPermissions'::regclass, 
  'PermissionAuditLogs'::regclass
);
```

### Caching Configuration
Update `appsettings.Production.json`:
```json
{
  "PermissionCaching": {
    "UserPermissionsTTL": "00:05:00",
    "DeviceGroupTreeTTL": "01:00:00",
    "PermissionMatrixTTL": "00:10:00"
  }
}
```

### Monitoring Setup
Configure application insights or logging for:
- Permission validation request times
- Cache hit/miss ratios
- Audit log write performance
- Failed authorization attempts

## Success Criteria Met ✅
- Complete RBAC system operational
- Performance targets achieved
- Security requirements enforced
- Audit compliance maintained
- Integration with existing systems successful