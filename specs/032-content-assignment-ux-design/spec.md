# Feature Specification: Content Assignment UX/UI Design & API Integration

**Feature Branch**: `032-content-assignment-ux-design`  
**Created**: 2025-10-09  
**Status**: Planning  
**Scope**: UX/UI Design + API Integration for comprehensive content assignment system

## Overview
ออกแบบและพัฒนาระบบ assign content ไป devices/groups ผ่าน **3 วิธี**:
1. **Direct Schedule Assignment** (มีอยู่แล้ว)
2. **Playlist Assignment** (ต้องออกแบบ UX/UI)
3. **Bulk Assignment Tools** (ใหม่)

## User Scenarios & Stories

### Primary User Story - Content Assignment Workflow
**As an** admin user  
**I want to** assign content (media/playlists/schedules) to devices and groups efficiently  
**So that** I can manage digital signage content delivery across the entire system

### Secondary User Story - Assignment Scheduling  
**As an** admin user  
**I want to** schedule content assignments with time ranges and recurrence patterns  
**So that** content automatically updates based on business schedules (morning news, lunch menu, etc.)

### Tertiary User Story - Assignment Management
**As an** admin user  
**I want to** view, edit, and manage all content assignments from a central dashboard  
**So that** I can monitor and adjust content delivery across all devices

## UX/UI Design Requirements

### 1. Content Assignment Dashboard
**Location**: `/admin/assignments` (new page)
```
📊 Assignment Overview Dashboard
├── 📈 Assignment Status (Active/Scheduled/Expired)
├── 📱 Device Coverage (Assigned vs Unassigned)
├── 📝 Content Utilization (Media/Playlists usage)
└── ⚡ Quick Actions (Bulk assign, Emergency broadcast)
```

### 2. Multi-Method Assignment Interface
**Locations**: Enhanced existing pages + new assignment flows

#### Method 1: Direct Schedule Assignment ✅ (exists)
- `/schedules` - Schedule creation and direct device assignment

#### Method 2: Playlist Assignment 🔧 (design needed)
- `/playlists/[id]/assign` - Assign playlist to devices/groups
- Drag-and-drop interface for device selection
- Calendar view for scheduling
- Bulk assignment capabilities

#### Method 3: Device-Centric Assignment 🔧 (design needed)  
- `/devices/[id]/content` - View all assigned content for device
- `/device-groups/[id]/content` - View all assigned content for group
- Quick assign interface with content browser

### 3. Assignment Scheduling Interface
**Features needed**:
- Date/time picker with timezone support
- Recurrence patterns (daily, weekly, custom)
- Priority system visualization
- Conflict detection and resolution

### 4. Visual Assignment Flow
```
🎯 Assignment Creation Wizard:
Step 1: Select Content (Media/Playlist/Schedule)
Step 2: Select Targets (Devices/Groups) 
Step 3: Set Schedule (Time/Recurrence/Priority)
Step 4: Review & Confirm
Step 5: Monitor Status
```

## API Design Requirements

### New Endpoints Needed

#### 1. Assignment Management API
```
POST   /api/assignments                 # Create assignment (any type)
GET    /api/assignments                 # List all assignments
GET    /api/assignments/{id}            # Get assignment details
PUT    /api/assignments/{id}            # Update assignment
DELETE /api/assignments/{id}            # Delete assignment

GET    /api/assignments/device/{id}     # Get device assignments
GET    /api/assignments/group/{id}      # Get group assignments
GET    /api/assignments/content/{type}/{id} # Get content assignments
```

#### 2. Bulk Assignment API
```
POST   /api/assignments/bulk            # Bulk create assignments
PUT    /api/assignments/bulk            # Bulk update assignments
DELETE /api/assignments/bulk            # Bulk delete assignments
```

#### 3. Assignment Analytics API
```
GET    /api/assignments/analytics/overview      # Dashboard data
GET    /api/assignments/analytics/coverage      # Device coverage stats
GET    /api/assignments/analytics/utilization   # Content usage stats
```

### Enhanced Content Delivery API
```csharp
// Enhance existing ContentDeliveryService
public async Task<NextScheduleResponseDto> GetNextScheduleAsync(string deviceKey)
{
    // Priority Order (UPDATED):
    // 1. Emergency Broadcasts (new)
    // 2. User-specific Schedules 
    // 3. Playlist Assignments (new)
    // 4. Device Group Schedules
    // 5. Default Schedules
}
```

## Functional Requirements

### Assignment Creation (FR-200 series)
- **FR-201**: System MUST support assigning content via drag-and-drop interface
- **FR-202**: System MUST support bulk assignment to multiple devices/groups
- **FR-203**: System MUST support scheduling assignments with start/end dates
- **FR-204**: System MUST support recurrence patterns (daily, weekly, custom)
- **FR-205**: System MUST validate assignment conflicts and show warnings

### Assignment Management (FR-210 series)  
- **FR-211**: System MUST show assignment status (active, scheduled, expired)
- **FR-212**: System MUST allow editing active assignments
- **FR-213**: System MUST support assignment priorities and conflict resolution
- **FR-214**: System MUST track assignment history and changes
- **FR-215**: System MUST support emergency broadcast overrides

### Content Delivery (FR-220 series)
- **FR-221**: TV clients MUST receive content based on assignment priority
- **FR-222**: System MUST handle multiple assignments per device gracefully
- **FR-223**: System MUST support real-time assignment updates via SignalR
- **FR-224**: System MUST fallback to default content when no assignments active

## Technical Architecture

### Frontend Components (New)
```
src/digital-signage-web/src/components/assignments/
├── AssignmentDashboard.tsx         # Main dashboard
├── AssignmentWizard.tsx            # Step-by-step assignment creation
├── ContentBrowser.tsx              # Content selection interface  
├── DeviceSelector.tsx              # Device/group selection with drag-drop
├── SchedulePicker.tsx              # Date/time/recurrence picker
├── AssignmentList.tsx              # Assignment management table
├── ConflictResolver.tsx            # Handle assignment conflicts
└── BulkAssignmentTools.tsx         # Bulk operations interface
```

### Backend Services (Enhanced)
```
src/DigitalSignage.Application/Services/
├── AssignmentService.cs            # Unified assignment management
├── AssignmentAnalyticsService.cs   # Dashboard analytics
├── BulkAssignmentService.cs        # Bulk operations
└── Enhanced ContentDeliveryService.cs # Updated priority logic
```

### Database Schema (New Tables)
```sql
-- Unified assignment tracking
CREATE TABLE Assignments (
    Id INT PRIMARY KEY,
    ContentType VARCHAR(50),  -- 'Schedule', 'Playlist', 'Media'
    ContentId INT,
    TargetType VARCHAR(50),   -- 'Device', 'DeviceGroup'  
    TargetId INT,
    Priority INT,
    StartDate TIMESTAMP,
    EndDate TIMESTAMP,
    IsRecurring BOOLEAN,
    RecurrencePattern TEXT,
    Status VARCHAR(20),       -- 'Active', 'Scheduled', 'Expired'
    CreatedByUserId INT,
    CreatedAt TIMESTAMP,
    UpdatedAt TIMESTAMP
);
```

## Success Criteria

### UX/UI Success Metrics
- [ ] Assignment creation time reduced by 70% (vs current schedule method)
- [ ] Admin can assign playlist to 10+ devices in under 2 minutes
- [ ] Zero-click conflict resolution for 80% of assignment conflicts
- [ ] Dashboard provides complete system status in single view

### API Performance Metrics  
- [ ] Assignment creation API responds < 200ms
- [ ] Bulk assignment handles 100+ devices in < 5 seconds
- [ ] Content delivery maintains current performance (<100ms)
- [ ] Real-time assignment updates via SignalR < 1 second

### System Integration Metrics
- [ ] All existing functionality remains operational
- [ ] TV clients receive correct content based on new priority system
- [ ] Assignment conflicts detected and resolved automatically
- [ ] Emergency broadcasts override all other assignments within 30 seconds

## Implementation Phases

### Phase 1: API Foundation (Week 1)
- Create Assignment entities and services
- Implement unified assignment API endpoints
- Add assignment tracking to database
- Create bulk assignment capabilities

### Phase 2: UX/UI Design (Week 2)  
- Design assignment dashboard mockups
- Create assignment wizard user flow
- Design device selector with drag-drop
- Implement scheduling interface

### Phase 3: Frontend Implementation (Week 3)
- Build assignment dashboard components
- Implement assignment creation wizard
- Add assignment management interfaces
- Integrate with existing pages

### Phase 4: Content Delivery Integration (Week 4)
- Enhance ContentDeliveryService with new priority logic
- Update TV client assignment resolution
- Add real-time assignment updates
- Implement emergency broadcasting

### Phase 5: Testing & Polish (Week 4)
- End-to-end assignment workflow testing
- Performance optimization
- User acceptance testing
- Documentation and training materials

## Dependencies & Constraints

### Dependencies
- **Existing Systems**: Current schedule/playlist/device management APIs
- **Authentication**: JWT-based admin authentication
- **Real-time**: SignalR infrastructure for live updates
- **Storage**: AWS S3 for media content

### Constraints  
- **Backward Compatibility**: All existing assignment methods must continue working
- **Performance**: Assignment operations must not impact content delivery performance
- **Scale**: System must handle 1000+ devices and 500+ content items
- **User Experience**: Assignment workflow must be intuitive for non-technical users

---

**Note**: This is a comprehensive UX/UI design and API integration project focused on creating an efficient, scalable content assignment system that enhances the existing digital signage platform.