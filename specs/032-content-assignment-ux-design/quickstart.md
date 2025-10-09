# Quickstart Guide: Content Assignment System

**Phase 1 Output** | **Date**: 2025-10-09

## Overview
This quickstart guide provides step-by-step instructions for implementing and testing the unified content assignment system for Digital Signage management.

## Prerequisites

### Development Environment
- ✅ .NET 8 SDK installed
- ✅ Node.js 18+ and npm installed
- ✅ PostgreSQL 14+ running
- ✅ VS Code with C# and TypeScript extensions
- ✅ Postman or similar API testing tool

### Existing System Requirements
- ✅ Digital Signage backend API running on `http://localhost:5100`
- ✅ Digital Signage frontend running on `http://localhost:3000`
- ✅ PostgreSQL database with existing schema
- ✅ JWT authentication configured
- ✅ AWS S3 bucket configured for media storage

## Implementation Steps

### Phase 1: Backend API Implementation

#### Step 1: Create Assignment Entity and Configuration
```bash
# Navigate to backend directory
cd src/DigitalSignage.Domain/Entities

# Create Assignment entity file
# (Implementation will follow data-model.md specifications)
```

#### Step 2: Create Database Migration
```bash
# Navigate to project root
cd /path/to/digital_signage

# Create migration for Assignment tables
dotnet ef migrations add AddAssignmentSystem -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api

# Apply migration to database
dotnet ef database update -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api
```

#### Step 3: Implement Assignment Services
```bash
# Create service interfaces and implementations
# Location: src/DigitalSignage.Application/Services/
- AssignmentService.cs
- AssignmentAnalyticsService.cs  
- BulkAssignmentService.cs
```

#### Step 4: Create Assignment Controller
```bash
# Create REST API controller
# Location: src/DigitalSignage.Api/Controllers/AssignmentController.cs
# (Follow API specification from contracts/assignment-api.yaml)
```

#### Step 5: Register Services in DI Container
```csharp
// Add to src/DigitalSignage.Api/Extensions/ApplicationServiceExtensions.cs
services.AddScoped<IAssignmentService, AssignmentService>();
services.AddScoped<IAssignmentAnalyticsService, AssignmentAnalyticsService>();
services.AddScoped<IBulkAssignmentService, BulkAssignmentService>();
```

### Phase 2: Frontend Implementation  

#### Step 1: Create Assignment Feature Structure
```bash
# Navigate to frontend directory
cd src/digital-signage-web

# Create assignment feature directories
mkdir -p src/features/assignments/{components,hooks,services,types}
mkdir -p src/components/assignments
mkdir -p src/app/\(dashboard\)/assignments
```

#### Step 2: Implement Assignment Services
```typescript
// Create API service client
// Location: src/features/assignments/services/assignmentService.ts
// (Follow patterns from existing deviceService.ts)
```

#### Step 3: Create Assignment Components
```bash
# Create core assignment components
# Location: src/components/assignments/
- AssignmentDashboard.tsx
- AssignmentWizard.tsx
- DeviceSelector.tsx
- ContentBrowser.tsx
- SchedulePicker.tsx
```

#### Step 4: Create Assignment Pages
```bash
# Create assignment pages using App Router
# Location: src/app/(dashboard)/assignments/
- page.tsx (dashboard)
- create/page.tsx (creation wizard)
- [id]/page.tsx (assignment details)
```

#### Step 5: Add Assignment State Management
```typescript
// Create Redux slice for assignment state
// Location: src/store/slices/assignmentSlice.ts
// (Follow pattern from existing scheduleAssignmentSlice.ts)
```

### Phase 3: Enhanced Content Delivery

#### Step 1: Enhance ContentDeliveryService
```csharp
// Update existing ContentDeliveryService.cs to include:
// 1. Emergency broadcast priority
// 2. Playlist assignment resolution
// 3. New priority ordering system
```

#### Step 2: Add Assignment Resolution Logic
```csharp
// Implement GetActiveAssignmentAsync method
// Priority: Emergency > User Schedule > Playlist > Group Schedule > Default
```

## Testing Scenarios

### Backend API Testing

#### Test 1: Create Basic Assignment
```bash
# POST /api/assignments
curl -X POST http://localhost:5100/api/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "assignmentType": "Playlist",
    "contentId": 1,
    "targetType": "Device", 
    "targetId": 1,
    "priority": 5,
    "startDate": "2025-10-10T08:00:00Z",
    "endDate": "2025-10-10T18:00:00Z"
  }'

# Expected: 201 Created with AssignmentDto response
```

#### Test 2: Get Device Assignments
```bash
# GET /api/assignments/device/1
curl -X GET http://localhost:5100/api/assignments/device/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with array of AssignmentDto
```

#### Test 3: Create Emergency Broadcast
```bash
# POST /api/assignments/emergency
curl -X POST http://localhost:5100/api/assignments/emergency \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "contentType": "Schedule",
    "contentId": 5,
    "expiresAt": "2025-10-10T12:00:00Z",
    "reason": "System maintenance notification"
  }'

# Expected: 201 Created with emergency assignment
```

#### Test 4: Bulk Assignment Creation
```bash
# POST /api/assignments/bulk
curl -X POST http://localhost:5100/api/assignments/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "assignments": [
      {
        "assignmentType": "Playlist",
        "contentId": 2,
        "targetType": "DeviceGroup",
        "targetId": 1,
        "priority": 3,
        "startDate": "2025-10-11T09:00:00Z"
      },
      {
        "assignmentType": "Playlist", 
        "contentId": 2,
        "targetType": "DeviceGroup",
        "targetId": 2,
        "priority": 3,
        "startDate": "2025-10-11T09:00:00Z"
      }
    ]
  }'

# Expected: 201 Created with bulk operation results
```

### Frontend Testing

#### Test 1: Assignment Dashboard Access
1. Navigate to `http://localhost:3000/assignments`
2. Verify dashboard loads with assignment statistics
3. Check real-time status updates work correctly

#### Test 2: Assignment Creation Wizard
1. Click "Create Assignment" button
2. Walk through multi-step wizard:
   - Select content (playlist/schedule/media)
   - Select target devices/groups
   - Set scheduling options
   - Review and confirm
3. Verify assignment appears in dashboard

#### Test 3: Device Assignment View
1. Navigate to `http://localhost:3000/devices/1/content`
2. Verify all assignments for device are displayed
3. Test quick assignment functionality

#### Test 4: Bulk Assignment Operations
1. Navigate to assignment dashboard
2. Select multiple devices from device selector
3. Choose content to assign
4. Set bulk scheduling options
5. Verify bulk creation success

### Content Delivery Testing

#### Test 1: Priority Resolution
1. Create assignments with different priorities for same device
2. Call device content delivery API: `GET /api/device/next-schedule`
3. Verify highest priority content is returned

#### Test 2: Emergency Broadcast Override
1. Create normal assignment for device
2. Create emergency broadcast assignment
3. Call content delivery API
4. Verify emergency broadcast overrides normal content

#### Test 3: Assignment Scheduling
1. Create assignment with future start date
2. Verify content not delivered before start date
3. Update system time or wait for start date
4. Verify content delivery activates

## Validation Checklist

### Backend Validation
- [ ] Assignment entity properly created and configured
- [ ] Database migration applied successfully
- [ ] All API endpoints respond with correct status codes
- [ ] JWT authentication works for all endpoints
- [ ] Assignment priority resolution works correctly
- [ ] Emergency broadcast immediately overrides other assignments
- [ ] Bulk operations handle errors gracefully
- [ ] Assignment history tracking works
- [ ] Analytics endpoints return correct data

### Frontend Validation  
- [ ] Assignment dashboard loads and displays data correctly
- [ ] Assignment creation wizard completes successfully
- [ ] Device assignment views show correct assignments
- [ ] Bulk assignment tools work for multiple selections
- [ ] Real-time updates via SignalR work
- [ ] Error handling and validation messages display
- [ ] Loading states show during API operations
- [ ] Responsive design works on mobile devices

### Integration Validation
- [ ] Content delivery service uses new assignment priority
- [ ] TV clients receive correct content based on assignments
- [ ] Assignment conflicts are detected and reported
- [ ] Emergency broadcasts reach devices within 30 seconds
- [ ] Existing schedule assignment functionality unchanged
- [ ] Performance meets requirements (<200ms API, <5s bulk ops)

## Performance Testing

### Load Testing Scenarios
```bash
# Test bulk assignment performance
# Create 100 assignments for 100 devices simultaneously
# Expected: Complete within 5 seconds

# Test assignment resolution performance  
# Query active assignments for 1000 devices
# Expected: Each query <100ms

# Test emergency broadcast speed
# Create emergency broadcast to all devices
# Expected: Delivery to devices within 30 seconds
```

### Monitoring Points
- Assignment API response times
- Database query performance
- SignalR message delivery speed
- Frontend component render times
- Memory usage during bulk operations

## Troubleshooting

### Common Issues

#### "Assignment not found" Error
- Verify assignment ID is correct
- Check user has permission to access assignment
- Ensure assignment hasn't been deleted

#### Content Delivery Not Working
- Check assignment status is "Active"
- Verify current time is within assignment schedule
- Check assignment priority conflicts
- Ensure ContentDeliveryService includes new assignment logic

#### Frontend Assignment Dashboard Not Loading
- Check API endpoints are accessible
- Verify JWT token is valid
- Check browser console for JavaScript errors
- Ensure SignalR connection is established

#### Bulk Assignment Performance Issues
- Reduce batch size if timeout occurs
- Check database indexes are created
- Monitor memory usage during bulk operations
- Consider implementing background job processing

## Next Steps

After completing this quickstart:

1. **Advanced Features**: Implement assignment conflict resolution
2. **Mobile Optimization**: Optimize assignment interface for mobile devices  
3. **Reporting**: Add detailed assignment reporting and analytics
4. **Automation**: Implement automated assignment scheduling
5. **Integration**: Connect with external calendar systems

## Support

For additional help:
- Check API documentation at `/swagger` endpoint
- Review component library documentation
- Consult Digital Signage system architecture documentation
- Contact development team for technical support

---

**Quickstart validation complete** - System ready for assignment management operations.