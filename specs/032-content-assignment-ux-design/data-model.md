# Data Model: Content Assignment System

**Phase 1 Output** | **Date**: 2025-10-09

## Entity Overview

### Core Assignment Entities

#### 1. Assignment (New Unified Entity)
```csharp
public class Assignment : BaseEntity
{
    public int Id { get; set; }
    public AssignmentType AssignmentType { get; set; }      // Schedule, Playlist, Media, Emergency
    public int ContentId { get; set; }                     // Reference to Schedule/Playlist/Media
    public AssignmentTargetType TargetType { get; set; }   // Device, DeviceGroup
    public int TargetId { get; set; }                      // DeviceId or DeviceGroupId
    public int Priority { get; set; }                      // 1 (highest) to 10 (lowest)
    public DateTime StartDate { get; set; }                // Assignment start date
    public DateTime? EndDate { get; set; }                 // Assignment end date (optional)
    public TimeOnly? StartTime { get; set; }               // Daily start time (optional)
    public TimeOnly? EndTime { get; set; }                 // Daily end time (optional)
    public bool IsRecurring { get; set; }                  // Enable recurrence
    public string? RecurrencePattern { get; set; }         // JSON: {"type": "daily", "interval": 1}
    public string? DaysOfWeek { get; set; }                // "1,2,3,4,5" for weekdays
    public AssignmentStatus Status { get; set; }           // Active, Scheduled, Expired, Paused
    public bool IsEmergencyBroadcast { get; set; }         // Emergency override flag
    public DateTime? EmergencyExpiresAt { get; set; }      // Emergency broadcast expiry
    public string? Notes { get; set; }                     // Admin notes
    public int CreatedByUserId { get; set; }               // User who created assignment
    public int? LastModifiedByUserId { get; set; }         // User who last modified
    
    // Navigation properties
    public User CreatedByUser { get; set; }
    public User? LastModifiedByUser { get; set; }
    public Device? Device { get; set; }                    // When TargetType = Device
    public DeviceGroup? DeviceGroup { get; set; }          // When TargetType = DeviceGroup
    public ICollection<AssignmentHistory> AssignmentHistories { get; set; }
}
```

#### 2. AssignmentHistory (New Audit Entity)
```csharp
public class AssignmentHistory : BaseEntity
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public AssignmentAction Action { get; set; }           // Created, Updated, Deleted, Activated, Deactivated
    public string? PreviousValues { get; set; }            // JSON of previous values
    public string? NewValues { get; set; }                 // JSON of new values
    public string? Reason { get; set; }                    // Change reason
    public int UserId { get; set; }                        // User who performed action
    public DateTime ActionDate { get; set; }               // When action was performed
    
    // Navigation properties
    public Assignment Assignment { get; set; }
    public User User { get; set; }
}
```

### Enhanced Existing Entities

#### 3. Device (Enhanced)
```csharp
// Add navigation property for assignments
public ICollection<Assignment> Assignments { get; set; }
```

#### 4. DeviceGroup (Enhanced)  
```csharp
// Add navigation property for assignments
public ICollection<Assignment> Assignments { get; set; }
```

#### 5. User (Enhanced)
```csharp
// Add navigation properties for assignment tracking
public ICollection<Assignment> CreatedAssignments { get; set; }
public ICollection<Assignment> ModifiedAssignments { get; set; }
public ICollection<AssignmentHistory> AssignmentActions { get; set; }
```

## Enums

### AssignmentType
```csharp
public enum AssignmentType
{
    Schedule = 1,       // Direct schedule assignment
    Playlist = 2,       // Playlist assignment  
    Media = 3,          // Direct media assignment
    Emergency = 4       // Emergency broadcast
}
```

### AssignmentTargetType
```csharp
public enum AssignmentTargetType
{
    Device = 1,         // Individual device
    DeviceGroup = 2     // Device group
}
```

### AssignmentStatus
```csharp
public enum AssignmentStatus
{
    Draft = 0,          // Being created/edited
    Scheduled = 1,      // Future activation
    Active = 2,         // Currently active
    Expired = 3,        // Past end date
    Paused = 4,         // Temporarily disabled
    Cancelled = 5       // Manually cancelled
}
```

### AssignmentAction
```csharp
public enum AssignmentAction
{
    Created = 1,
    Updated = 2,
    Deleted = 3,
    Activated = 4,
    Deactivated = 5,
    Paused = 6,
    Resumed = 7,
    Emergency = 8       // Emergency broadcast triggered
}
```

## Validation Rules

### Assignment Entity Rules
1. **Content Reference**: ContentId must exist in referenced table based on AssignmentType
2. **Target Reference**: TargetId must exist as Device or DeviceGroup based on TargetType  
3. **Date Validation**: StartDate <= EndDate (when EndDate is specified)
4. **Time Validation**: StartTime < EndTime (when both specified)
5. **Emergency Rules**: Emergency broadcasts have priority 1 and ignore other constraints
6. **Recurrence Rules**: RecurrencePattern required when IsRecurring = true

### Business Rules
1. **Priority Conflict**: Multiple active assignments for same target resolved by priority
2. **Emergency Override**: Emergency broadcasts immediately override all other assignments
3. **Scheduling Conflict**: System warns about overlapping assignments but allows creation
4. **Audit Trail**: All assignment changes tracked in AssignmentHistory
5. **Permission Check**: Users can only modify assignments they have permission for

## Database Relationships

### Assignment Relationships
```sql
-- Foreign Key Constraints
CONSTRAINT FK_Assignment_CreatedByUser FOREIGN KEY (CreatedByUserId) REFERENCES Users(Id)
CONSTRAINT FK_Assignment_LastModifiedByUser FOREIGN KEY (LastModifiedByUserId) REFERENCES Users(Id)
CONSTRAINT FK_Assignment_Device FOREIGN KEY (TargetId) REFERENCES Devices(Id) -- when TargetType = Device
CONSTRAINT FK_Assignment_DeviceGroup FOREIGN KEY (TargetId) REFERENCES DeviceGroups(Id) -- when TargetType = DeviceGroup

-- Check Constraints
CONSTRAINT CK_Assignment_Target_Consistency CHECK (
    (TargetType = 1 AND EXISTS(SELECT 1 FROM Devices WHERE Id = TargetId)) OR
    (TargetType = 2 AND EXISTS(SELECT 1 FROM DeviceGroups WHERE Id = TargetId))
)
CONSTRAINT CK_Assignment_Date_Range CHECK (EndDate IS NULL OR StartDate <= EndDate)
CONSTRAINT CK_Assignment_Time_Range CHECK (EndTime IS NULL OR StartTime IS NULL OR StartTime < EndTime)
CONSTRAINT CK_Assignment_Emergency_Priority CHECK (IsEmergencyBroadcast = false OR Priority = 1)
```

### Indexes for Performance
```sql
-- Query optimization indexes
CREATE INDEX IX_Assignment_Status_StartDate ON Assignments(Status, StartDate) 
CREATE INDEX IX_Assignment_TargetType_TargetId ON Assignments(TargetType, TargetId)
CREATE INDEX IX_Assignment_AssignmentType_ContentId ON Assignments(AssignmentType, ContentId)
CREATE INDEX IX_Assignment_Priority_Status ON Assignments(Priority, Status)
CREATE INDEX IX_Assignment_IsEmergencyBroadcast ON Assignments(IsEmergencyBroadcast) WHERE IsEmergencyBroadcast = true
```

## Data Migration Strategy

### Phase 1: Create New Tables
```sql
-- Create Assignment and AssignmentHistory tables
-- Add navigation properties to existing entities
-- Create indexes and constraints
```

### Phase 2: Data Migration (Optional)
```sql
-- Migrate existing PlaylistAssignments to unified Assignment table
-- Preserve existing data structure and relationships
-- Update foreign key references
```

### Phase 3: Service Layer Updates
```csharp
// Update ContentDeliveryService to use Assignment table
// Maintain backward compatibility with PlaylistAssignment queries
// Implement assignment priority resolution logic
```

## State Transitions

### Assignment Status Flow
```
Draft → Scheduled → Active → Expired
  ↓         ↓        ↓
Cancelled   ↓      Paused → Active
         Cancelled    ↓
                   Cancelled
```

### Emergency Broadcast Flow
```
Any Status → Emergency (Active) → Expired/Cancelled
```

## Content Resolution Priority

### Priority Order (Enhanced ContentDeliveryService)
1. **Emergency Broadcasts** (Priority 1, IsEmergencyBroadcast = true)
2. **User-specific Schedule Assignments** (Direct user assignments)
3. **Playlist Assignments** (Device/Group playlist assignments)  
4. **Device Group Schedule Assignments** (Group-level schedules)
5. **Default Schedule Assignments** (System defaults)

### Resolution Algorithm
```csharp
public async Task<Assignment?> GetActiveAssignmentAsync(Device device, DateTime now)
{
    return await _context.Assignments
        .Include(a => a.Device)
        .Include(a => a.DeviceGroup)
        .Where(a => a.Status == AssignmentStatus.Active &&
                   a.StartDate <= now &&
                   (a.EndDate == null || a.EndDate >= now) &&
                   IsTimeMatch(a, now) &&
                   IsTargetMatch(a, device))
        .OrderBy(a => a.IsEmergencyBroadcast ? 0 : 1)    // Emergency first
        .ThenBy(a => a.Priority)                          // Then by priority
        .ThenBy(a => a.CreatedAt)                         // Then by creation time
        .FirstOrDefaultAsync();
}
```

---

**All entities defined with proper relationships and validation rules** - Ready for contract generation.