# REPLACE Semantics Guide

## Overview
Comprehensive guide explaining the REPLACE (vs APPEND) behavior when assigning schedules to users in the Digital Signage system.

**Critical Business Rule**: Assigning schedules **REPLACES all existing schedules**, it does NOT append.

**Last Updated**: October 2, 2025  
**Phase**: 1 - User Schedule Assignment  
**Importance**: ⚠️ **CRITICAL** - Misunderstanding can lead to data loss

---

## Table of Contents

1. [What is REPLACE?](#what-is-replace)
2. [Why REPLACE Instead of APPEND?](#why-replace-instead-of-append)
3. [User Warning Implementation](#user-warning-implementation)
4. [Flowcharts](#flowcharts)
5. [Code Examples](#code-examples)
6. [Business Justification](#business-justification)
7. [Alternative Approaches Considered](#alternative-approaches-considered)
8. [FAQ](#faq)

---

## What is REPLACE?

### REPLACE Behavior ⚠️

When you assign schedules to a user who already has schedules:
1. **All existing schedules are removed**
2. **Only the newly selected schedules are assigned**
3. **The default schedule flag is cleared** (user must re-set default)

```
Before Assignment:
User has: [Schedule A, Schedule B, Schedule C]

After Assigning [Schedule D, Schedule E]:
User has: [Schedule D, Schedule E]

Result: Schedule A, B, C are GONE
```

### APPEND Behavior (NOT Used) 🚫

For comparison, if we used APPEND (which we don't):
1. Existing schedules would remain
2. New schedules would be added
3. Default schedule would remain

```
Before Assignment:
User has: [Schedule A, Schedule B, Schedule C]

After Appending [Schedule D, Schedule E]:
User has: [Schedule A, Schedule B, Schedule C, Schedule D, Schedule E]

Result: All schedules retained
```

---

## Why REPLACE Instead of APPEND?

### 1. Prevent Schedule Conflicts ⚠️

**Problem with APPEND**:
```
User has:
- Morning Shift (6 AM - 2 PM)
- Evening Shift (2 PM - 10 PM)

Admin appends:
- All Day Shift (6 AM - 6 PM)

Result: User has 3 conflicting schedules
→ System doesn't know which to use
→ Unpredictable behavior
```

**Solution with REPLACE**:
```
User has:
- Morning Shift (6 AM - 2 PM)
- Evening Shift (2 PM - 10 PM)

Admin replaces with:
- All Day Shift (6 AM - 6 PM)

Result: User has only All Day Shift
→ No conflicts
→ Clear intent
```

### 2. Clearer User Intent 📝

**REPLACE makes intent explicit**:
- Admin consciously decides the complete set of schedules
- No ambiguity about what the user should have
- Reduces "schedule creep" (accumulation of old schedules)

**Example Scenario**:
```
Admin thinks: "This user should be on Night Shift starting Monday"

With APPEND:
- Admin needs to remember to remove Day Shift first
- Easy to forget → user ends up on multiple shifts
- Requires 2 operations (remove old, add new)

With REPLACE:
- Admin just selects Night Shift
- System handles removal automatically
- Single operation → less error-prone
```

### 3. Easier Schedule Management 🎯

**Benefits**:
- **Atomic Operation**: All schedule changes happen together (no partial states)
- **Audit Trail**: Clear "before" and "after" states in logs
- **Simpler Logic**: No need to check for duplicates or conflicts
- **Predictable State**: User always has exactly what admin assigned last

**Example**:
```
Audit Log with REPLACE:
2024-10-02 09:00 - Admin removed all schedules from User123
2024-10-02 09:00 - Admin assigned [Schedule A, B, C] to User123

vs

Audit Log with APPEND:
2024-10-02 09:00 - Admin assigned Schedule A to User123
2024-10-01 14:30 - Admin assigned Schedule B to User123
2024-09-28 11:15 - Admin assigned Schedule C to User123
2024-09-15 08:00 - Admin assigned Schedule D to User123 (still active?)
... (confusing history)
```

### 4. Industry Best Practice 🏢

**Similar Systems Use REPLACE**:
- **Shift Management Systems**: Assigning shifts replaces previous assignments
- **Access Control**: Assigning permissions replaces old permission sets
- **Device Configuration**: Pushing config replaces current config
- **Email Rules**: Setting filters replaces old filters

**Analogy**:
> Think of it like setting your phone's alarm:
> - Setting "Wake up at 7 AM" replaces any previous alarm
> - You don't accumulate multiple alarms unless explicitly intended
> - Clear, predictable behavior

---

## User Warning Implementation

### Warning Modal Requirements ⚠️

**MUST show warning when**:
- User already has ≥1 schedule assigned
- Admin is about to assign new schedules

**Warning modal MUST display**:
1. ⚠️ Clear warning icon and title
2. Count of existing schedules
3. Explanation of REPLACE behavior
4. Explicit consequences
5. Require confirmation to proceed

### UI Design

```
┌─────────────────────────────────────────────────┐
│  ⚠️  This will REPLACE all existing schedules   │
├─────────────────────────────────────────────────┤
│                                                 │
│  The user currently has 3 schedules assigned.   │
│                                                 │
│  Proceeding will:                               │
│  • Remove all 3 existing schedules              │
│  • Assign only the 2 newly selected schedules   │
│  • Clear the default schedule flag              │
│                                                 │
│  This action cannot be undone.                  │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│   [Cancel]          [Yes, Replace Schedules]   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Code Implementation

```typescript
// Check if user has existing schedules
const { data: existingSchedules } = useUserSchedules(userId)
const userHasSchedules = existingSchedules && existingSchedules.length > 0

// Show warning in ScheduleSelector
<ScheduleSelector
  isOpen={isModalOpen}
  userHasSchedules={userHasSchedules} // ⚠️ Triggers warning
  availableSchedules={allSchedules}
  onConfirm={handleAssign}
  onClose={handleClose}
/>
```

```tsx
// ScheduleSelector component
export function ScheduleSelector({
  userHasSchedules,
  // ... other props
}: Props) {
  return (
    <Modal>
      {/* WARNING: Show only if user has schedules */}
      {userHasSchedules && (
        <div
          role="alert"
          aria-live="polite"
          className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4"
        >
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">
                This will REPLACE all existing schedules
              </h3>
              <p className="text-sm text-amber-800">
                Proceeding will remove all current schedules and assign only the newly selected ones.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Schedule selection UI */}
      {/* ... */}
    </Modal>
  )
}
```

---

## Flowcharts

### Assign Schedules Flow

```
                    START
                      │
                      ▼
         ┌────────────────────────┐
         │ Admin clicks           │
         │ "Assign Schedules"     │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ Fetch existing         │
         │ schedules for user     │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
    ┌───│ Does user have          │
    │   │ existing schedules?     │
    │   └────────────┬───────────┘
    │                │
    │ NO             │ YES
    │                ▼
    │   ┌────────────────────────┐
    │   │ Show REPLACE WARNING   │ ⚠️
    │   │ in modal               │
    │   └────────────┬───────────┘
    │                │
    └────────►       │
                     ▼
         ┌────────────────────────┐
         │ Admin selects          │
         │ schedules              │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ Admin clicks           │
         │ "Confirm Assignment"   │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ API Call:              │
         │ POST /users/:id/       │
         │      schedules         │
         │                        │
         │ Body: {                │
         │   scheduleIds: [...]   │
         │ }                      │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ Backend:               │
         │ 1. Delete all existing │
         │    schedules           │
         │ 2. Insert new          │
         │    schedules           │
         │ 3. Transaction commit  │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ Success!               │
         │ - Invalidate cache     │
         │ - Show toast           │
         │ - Close modal          │
         └────────────────────────┘
                      │
                      ▼
                     END
```

### Backend API Flow

```
POST /api/users/:userId/schedules
{
  "scheduleIds": [1, 2, 3],
  "assignedBy": "admin123"
}

                    START
                      │
                      ▼
         ┌────────────────────────┐
         │ Validate request       │
         │ - userId exists        │
         │ - scheduleIds valid    │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ BEGIN TRANSACTION      │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ Step 1:                │
         │ DELETE FROM            │
         │ user_schedules         │
         │ WHERE user_id = :id    │ ⚠️ REPLACE
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ Step 2:                │
         │ INSERT INTO            │
         │ user_schedules         │
         │ (user_id, schedule_id, │
         │  is_default,           │
         │  assigned_by)          │
         │ VALUES (...each...)    │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ Step 3:                │
         │ INSERT INTO audit_log  │
         │ (action: 'REPLACE')    │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ COMMIT TRANSACTION     │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ Return 200 OK          │
         └────────────────────────┘
                      │
                      ▼
                     END
```

---

## Code Examples

### Frontend: Complete Flow

```typescript
// 1. Component with warning
export function UserScheduleAssignment({ userId }: Props) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  
  // Fetch existing schedules
  const { data: existingSchedules } = useUserSchedules(userId)
  const userHasSchedules = existingSchedules && existingSchedules.length > 0
  
  // Assign mutation
  const assignSchedules = useAssignSchedules(userId)
  
  const handleAssign = (scheduleIds: number[]) => {
    assignSchedules.mutate(scheduleIds, {
      onSuccess: () => {
        toast.success('Schedules assigned successfully')
        setIsAssignModalOpen(false)
      },
      onError: (error) => {
        toast.error('Failed to assign schedules', {
          description: error.message,
        })
      },
    })
  }
  
  return (
    <div>
      <Button onClick={() => setIsAssignModalOpen(true)}>
        Assign Schedules
      </Button>
      
      <ScheduleSelector
        isOpen={isAssignModalOpen}
        userHasSchedules={userHasSchedules} // ⚠️ Show warning
        availableSchedules={allSchedules}
        onConfirm={handleAssign}
        onClose={() => setIsAssignModalOpen(false)}
      />
    </div>
  )
}
```

```typescript
// 2. ScheduleSelector with warning
export function ScheduleSelector({
  userHasSchedules,
  availableSchedules,
  onConfirm,
  onClose,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        <h2>Assign Schedules</h2>
      </Modal.Header>
      
      <Modal.Body>
        {/* REPLACE WARNING */}
        {userHasSchedules && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <AlertTitle>
                This will REPLACE all existing schedules
              </AlertTitle>
              <AlertDescription>
                Proceeding will remove all current schedules and assign only
                the newly selected ones.
              </AlertDescription>
            </div>
          </Alert>
        )}
        
        {/* Schedule list */}
        <div className="space-y-2">
          {availableSchedules.map((schedule) => (
            <ScheduleItem
              key={schedule.id}
              schedule={schedule}
              isSelected={selectedIds.includes(schedule.id)}
              onToggle={() => toggleSelection(schedule.id)}
            />
          ))}
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm(selectedIds)}
          disabled={selectedIds.length === 0}
        >
          Confirm Assignment
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
```

### Backend: REPLACE Implementation

```csharp
// Backend API endpoint (C# .NET)
[HttpPost("api/users/{userId}/schedules")]
public async Task<IActionResult> AssignSchedules(
    string userId,
    [FromBody] AssignSchedulesRequest request)
{
    // Validate
    if (!await _userRepository.ExistsAsync(userId))
        return NotFound("User not found");
    
    var validSchedules = await _scheduleRepository
        .GetByIdsAsync(request.ScheduleIds);
    if (validSchedules.Count != request.ScheduleIds.Count)
        return BadRequest("One or more schedules not found");
    
    // Begin transaction
    using var transaction = await _dbContext.Database.BeginTransactionAsync();
    
    try
    {
        // STEP 1: DELETE all existing schedules (REPLACE)
        var existingSchedules = await _dbContext.UserSchedules
            .Where(us => us.UserId == userId)
            .ToListAsync();
        
        _dbContext.UserSchedules.RemoveRange(existingSchedules);
        await _dbContext.SaveChangesAsync();
        
        // STEP 2: INSERT new schedules
        var newSchedules = request.ScheduleIds.Select(scheduleId => 
            new UserSchedule
            {
                UserId = userId,
                ScheduleId = scheduleId,
                IsDefault = false, // User must manually set default
                AssignedAt = DateTime.UtcNow,
                AssignedBy = request.AssignedBy
            }
        ).ToList();
        
        _dbContext.UserSchedules.AddRange(newSchedules);
        await _dbContext.SaveChangesAsync();
        
        // STEP 3: Audit log
        await _auditLogRepository.LogAsync(new AuditLog
        {
            Action = "REPLACE_SCHEDULES",
            EntityType = "UserSchedule",
            EntityId = userId,
            UserId = request.AssignedBy,
            Details = $"Replaced {existingSchedules.Count} schedules with {newSchedules.Count} new schedules",
            Timestamp = DateTime.UtcNow
        });
        
        // Commit transaction
        await transaction.CommitAsync();
        
        return Ok();
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        _logger.LogError(ex, "Failed to assign schedules");
        return StatusCode(500, "Failed to assign schedules");
    }
}
```

---

## Business Justification

### Use Cases Supporting REPLACE

#### 1. Shift Change Scenario
```
Scenario: Employee moves from Day Shift to Night Shift

With REPLACE:
1. Admin selects "Night Shift"
2. System removes "Day Shift" and assigns "Night Shift"
3. Employee has correct schedule immediately
✅ One operation, clear result

With APPEND:
1. Admin selects "Night Shift"
2. Employee now has BOTH "Day Shift" and "Night Shift"
3. Admin must remember to remove "Day Shift" separately
4. Risk of employee working both shifts (conflict)
❌ Two operations, potential errors
```

#### 2. Department Transfer
```
Scenario: Employee transfers from Sales to Marketing

With REPLACE:
1. Admin assigns Marketing schedules
2. All Sales schedules automatically removed
3. Clean transition
✅ Atomic operation

With APPEND:
1. Admin assigns Marketing schedules
2. Employee still has Sales schedules (incorrect access)
3. Must manually clean up old schedules
4. Security risk if forgotten
❌ Manual cleanup required
```

#### 3. Temporary Coverage
```
Scenario: Employee covers another shift temporarily

With REPLACE:
1. Admin assigns temporary shift
2. Regular shift removed automatically
3. After coverage, admin assigns regular shift back
✅ Clear state at each step

With APPEND:
1. Admin assigns temporary shift
2. Employee has both regular + temporary (confusion)
3. Must manually remove temporary shift later
4. Easy to forget cleanup
❌ Requires manual tracking
```

### Data Integrity Benefits

**REPLACE ensures**:
1. **No orphaned schedules**: Every assignment is intentional
2. **Clear audit trail**: Each operation is complete
3. **Predictable state**: User has exactly what was last assigned
4. **No conflicts**: Single schedule set per user
5. **Easier rollback**: Can restore previous state cleanly

---

## Alternative Approaches Considered

### Option 1: APPEND by Default ❌

**Pros**:
- Non-destructive
- Keeps historical assignments

**Cons**:
- Schedule conflicts
- Accumulation of old schedules
- Unclear intent
- **Rejected**: Too error-prone

### Option 2: Toggle Between REPLACE and APPEND ❌

**Example UI**:
```
┌─────────────────────────────┐
│ Assignment Mode:            │
│ ( ) Replace existing        │
│ ( ) Append to existing      │
└─────────────────────────────┘
```

**Pros**:
- Flexibility

**Cons**:
- Confusing for users
- Two code paths to maintain
- Users might choose wrong mode
- **Rejected**: Adds complexity without clear benefit

### Option 3: REPLACE with Archive ⚠️

**Behavior**:
- Removed schedules moved to "archive" table
- Can be restored

**Pros**:
- Safety net
- Undo capability

**Cons**:
- Additional storage
- More complex logic
- **Status**: Consider for Phase 2

### Option 4: Explicit "Remove All" First 🤔

**Workflow**:
1. User clicks "Remove All"
2. Then clicks "Assign New"

**Pros**:
- Very explicit
- Clear intent

**Cons**:
- Two operations required
- Poor UX
- Easy to forget first step
- **Rejected**: Too cumbersome

---

## FAQ

### Q1: What if I accidentally replace the wrong schedules?

**A**: 
- The warning modal requires explicit confirmation
- Audit logs track all changes (can restore manually)
- Future: Undo functionality (Phase 2)

```
Audit Log:
2024-10-02 09:00 - Admin replaced User123 schedules
Previous: [Schedule A, B, C]
New: [Schedule D, E]
Assigned by: admin@example.com
```

### Q2: Can I add just one schedule without removing others?

**A**:
No. This would be APPEND behavior, which we don't support.

**Workaround**:
1. Note current schedules
2. Assign: Current schedules + New schedule

**Example**:
```
User has: [Schedule A, B]
Want to add: Schedule C

Solution:
Select all three: [Schedule A, B, C]
Assign → User now has all three
```

### Q3: What happens to the default schedule flag?

**A**:
- Default flag is cleared during REPLACE
- User must manually set new default after assignment
- Prevents accidental default changes

```typescript
// After REPLACE, all schedules have isDefault: false
const newSchedules = scheduleIds.map(id => ({
  userId,
  scheduleId: id,
  isDefault: false, // Always false after REPLACE
  assignedAt: new Date(),
}))
```

### Q4: Why not just show which schedules will be removed?

**A**:
We do! The warning shows count of existing schedules.

**Future Enhancement** (Phase 2):
```
⚠️ This will REPLACE all existing schedules

The following 3 schedules will be removed:
• Morning Shift (Active)
• Evening Shift (Active)
• Weekend Shift (Inactive)

The following 2 schedules will be assigned:
• All Day Shift (Active)
• On-Call Shift (Active)
```

### Q5: What if the API call fails mid-operation?

**A**:
- Backend uses database transaction
- Either all changes succeed, or all fail
- No partial state

```csharp
using var transaction = await _dbContext.BeginTransactionAsync();
try {
    // Delete all
    // Insert new
    await transaction.CommitAsync(); // ✅ All or nothing
} catch {
    await transaction.RollbackAsync(); // ❌ Revert all
}
```

### Q6: Can I disable the warning modal?

**A**:
No. The warning is mandatory for data protection.

**Business rule**: Users must be explicitly warned about destructive operations.

### Q7: Is there a way to preview before assigning?

**A**:
The ScheduleSelector modal shows:
- Currently selected schedules
- Count of selections
- REPLACE warning (if applicable)

This provides preview before confirmation.

---

## Summary

### Key Points ⚠️

1. **REPLACE is intentional** - Prevents conflicts and unclear states
2. **Warning is mandatory** - Protects users from accidental data loss
3. **Transaction-based** - All-or-nothing ensures data integrity
4. **Audit trail** - All changes logged for accountability
5. **Industry standard** - Similar to other management systems

### Implementation Checklist ✅

- [ ] Show warning when `userHasSchedules === true`
- [ ] Warning displays count of existing schedules
- [ ] Confirm button requires explicit click
- [ ] Backend uses transaction (DELETE + INSERT)
- [ ] Audit log records before/after state
- [ ] Frontend invalidates cache after success
- [ ] Error handling with rollback
- [ ] Success toast notification
- [ ] Default schedule flag cleared

### Next Steps

**Phase 1** ✅:
- REPLACE semantics implemented
- Warning modal required
- Audit logging

**Phase 2** (Future):
- Archive removed schedules
- Undo capability
- Preview detailed changes (before/after list)
- Bulk operations (multiple users)

---

**Last Updated**: October 2, 2025  
**Status**: Production Implementation ✅  
**Criticality**: ⚠️ HIGH - Must understand before using feature
