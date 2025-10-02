# Manual Testing Guide (T065-T067)

## Overview
Comprehensive manual testing scenarios for Phase 1: User Schedule Assignment feature. This guide provides step-by-step test procedures to validate all functionality before production deployment.

**Phase**: 1 - User Schedule Assignment  
**Features Tested**: User list, schedule viewing, assignment (REPLACE), default setting, removal  
**Test Environment**: Staging  
**Last Updated**: October 2, 2025

---

## Table of Contents

1. [Test Scenario 1: User Schedule Views](#test-scenario-1-user-schedule-views)
2. [Test Scenario 2: Assign Schedules (REPLACE Warning)](#test-scenario-2-assign-schedules-replace-warning)
3. [Test Scenario 3: Set Default Schedule](#test-scenario-3-set-default-schedule)
4. [Test Scenario 4: User List (Search/Sort/Pagination)](#test-scenario-4-user-list-searchsortpagination)
5. [Test Scenario 5: Remove All Schedules](#test-scenario-5-remove-all-schedules)
6. [Test Scenario 6: Mobile Responsive](#test-scenario-6-mobile-responsive)
7. [Test Scenario 7: Keyboard Navigation](#test-scenario-7-keyboard-navigation)
8. [Test Scenario 8: Error Handling](#test-scenario-8-error-handling)
9. [Test Scenario 9: Performance (10k Users)](#test-scenario-9-performance-10k-users)
10. [Test Scenario 10: Edge Cases](#test-scenario-10-edge-cases)

---

## Test Environment Setup

### Prerequisites
- ✅ Staging environment deployed
- ✅ Test database with sample data
- ✅ Admin user credentials
- ✅ Chrome DevTools or similar

### Test Data Requirements
- **Users**: Minimum 10,000 users (for performance testing)
- **Schedules**: 50+ schedules with various states (active, inactive, different time ranges)
- **User Schedule Assignments**: Mix of users with 0, 1, 3, 5, 10+ schedules

### Test Browsers
- ✅ Chrome 120+ (primary)
- ✅ Firefox 121+
- ✅ Safari 17+
- ✅ Edge 120+

### Mobile Devices
- ✅ iOS 17+ (iPhone)
- ✅ Android 13+ (Samsung/Pixel)

---

## Test Scenario 1: User Schedule Views

**Objective**: Verify user can view assigned schedules correctly

### Prerequisites
- User exists with 3-5 schedules assigned
- Mix of active and inactive schedules
- One schedule marked as default

### Test Steps

#### 1.1 View User Schedules List

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Navigate to `/schedules/users` | User list page loads | ☐ Pass ☐ Fail | |
| 2 | Click on user with assigned schedules | Schedule list displays | ☐ Pass ☐ Fail | |
| 3 | Verify schedule cards show: | All info visible | ☐ Pass ☐ Fail | |
|   | - Schedule name | ✓ | | |
|   | - Time range (e.g., "6:00 AM - 2:00 PM") | ✓ | | |
|   | - Active/Inactive badge | ✓ | | |
|   | - Default badge (if applicable) | ✓ | | |
| 4 | Verify default schedule has: | Correct styling | ☐ Pass ☐ Fail | |
|   | - Star icon (⭐) | ✓ | | |
|   | - "Default" badge | ✓ | | |
|   | - Distinct visual styling | ✓ | | |

**Screenshot Placeholder**: ![User Schedule List](./screenshots/test-1.1-schedule-list.png)

#### 1.2 Verify Schedule Badge Colors

| Schedule State | Expected Badge | Pass/Fail |
|----------------|----------------|-----------|
| Active | Green badge "Active" | ☐ Pass ☐ Fail |
| Inactive | Gray badge "Inactive" | ☐ Pass ☐ Fail |
| Default | Gold star icon + "Default" | ☐ Pass ☐ Fail |

#### 1.3 Empty Schedule State

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Click user with no schedules | Empty state displays | ☐ Pass ☐ Fail | |
| 2 | Verify empty state shows: | All elements visible | ☐ Pass ☐ Fail | |
|   | - Calendar icon | ✓ | | |
|   | - "No schedules assigned" title | ✓ | | |
|   | - Description text | ✓ | | |
|   | - "Assign Schedules" button | ✓ | | |

**Screenshot Placeholder**: ![Empty State](./screenshots/test-1.3-empty-state.png)

### Test Data

```json
{
  "userId": "user-test-001",
  "schedules": [
    {
      "id": 1,
      "name": "Morning Shift",
      "timeRange": "6:00 AM - 2:00 PM",
      "isActive": true,
      "isDefault": true
    },
    {
      "id": 2,
      "name": "Evening Shift",
      "timeRange": "2:00 PM - 10:00 PM",
      "isActive": true,
      "isDefault": false
    },
    {
      "id": 3,
      "name": "Weekend Shift",
      "timeRange": "8:00 AM - 4:00 PM",
      "isActive": false,
      "isDefault": false
    }
  ]
}
```

### Pass Criteria
- ✅ All schedule information displays correctly
- ✅ Default schedule visually distinct
- ✅ Badge colors match schedule states
- ✅ Empty state shows for users with no schedules
- ✅ No console errors

---

## Test Scenario 2: Assign Schedules (REPLACE Warning)

**Objective**: Verify REPLACE behavior and warning modal functionality

### Prerequisites
- User exists with 2-3 schedules already assigned
- 10+ available schedules to assign

### Test Steps

#### 2.1 Assign to User Without Existing Schedules

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Click user with 0 schedules | User detail view opens | ☐ Pass ☐ Fail | |
| 2 | Click "Assign Schedules" button | Modal opens | ☐ Pass ☐ Fail | |
| 3 | Verify NO warning message shows | No ⚠️ warning visible | ☐ Pass ☐ Fail | |
| 4 | Select 3 schedules | Checkboxes checked | ☐ Pass ☐ Fail | |
| 5 | Click "Confirm Assignment" | Modal closes, schedules assigned | ☐ Pass ☐ Fail | |
| 6 | Verify success toast shows | "Schedules assigned successfully" | ☐ Pass ☐ Fail | |
| 7 | Verify 3 schedules now displayed | All 3 schedules visible | ☐ Pass ☐ Fail | |

#### 2.2 Assign to User With Existing Schedules (REPLACE)

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Click user with 3 existing schedules | User detail view opens | ☐ Pass ☐ Fail | |
| 2 | Note existing schedule names | e.g., "Morning, Evening, Night" | ☐ Pass ☐ Fail | |
| 3 | Click "Assign Schedules" button | Modal opens | ☐ Pass ☐ Fail | |
| 4 | Verify REPLACE WARNING shows: | Warning visible | ☐ Pass ☐ Fail | |
|   | - ⚠️ AlertTriangle icon | ✓ | | |
|   | - Yellow/amber background | ✓ | | |
|   | - "This will REPLACE all existing schedules" title | ✓ | | |
|   | - Current schedule count (e.g., "3 schedules") | ✓ | | |
|   | - Explanation of consequences | ✓ | | |
| 5 | Select 2 NEW schedules (different from existing) | Checkboxes checked | ☐ Pass ☐ Fail | |
| 6 | Click "Confirm Assignment" | Modal closes | ☐ Pass ☐ Fail | |
| 7 | Verify success toast shows | Toast displays | ☐ Pass ☐ Fail | |
| 8 | Verify OLD schedules removed | Previous 3 schedules gone | ☐ Pass ☐ Fail | |
| 9 | Verify NEW schedules assigned | Only 2 new schedules visible | ☐ Pass ☐ Fail | |

**Screenshot Placeholder**: ![REPLACE Warning Modal](./screenshots/test-2.2-replace-warning.png)

#### 2.3 Warning Modal Content Verification

| Element | Expected Content | Pass/Fail |
|---------|-----------------|-----------|
| Icon | ⚠️ Yellow triangle | ☐ Pass ☐ Fail |
| Title | "This will REPLACE all existing schedules" | ☐ Pass ☐ Fail |
| Message | Clear explanation of REPLACE behavior | ☐ Pass ☐ Fail |
| Cancel Button | "Cancel" (gray outline) | ☐ Pass ☐ Fail |
| Confirm Button | "Confirm Assignment" (primary color) | ☐ Pass ☐ Fail |

#### 2.4 Verify Default Schedule Cleared

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Start with user having 3 schedules, Schedule A is default | ⭐ on Schedule A | ☐ Pass ☐ Fail | |
| 2 | Assign 2 new schedules (REPLACE) | Old schedules removed | ☐ Pass ☐ Fail | |
| 3 | Verify NO schedule has default flag | No ⭐ icon visible | ☐ Pass ☐ Fail | |
| 4 | Verify all `isDefault = false` | API response confirms | ☐ Pass ☐ Fail | |

### Test Data

**Before Assignment**:
```json
{
  "userId": "user-test-002",
  "existingSchedules": [
    { "id": 1, "name": "Morning Shift", "isDefault": true },
    { "id": 2, "name": "Evening Shift", "isDefault": false },
    { "id": 3, "name": "Night Shift", "isDefault": false }
  ]
}
```

**After Assignment** (REPLACE):
```json
{
  "userId": "user-test-002",
  "newSchedules": [
    { "id": 10, "name": "Weekend Day", "isDefault": false },
    { "id": 11, "name": "Weekend Night", "isDefault": false }
  ]
}
```

### Pass Criteria
- ✅ Warning shows ONLY when user has existing schedules
- ✅ Warning content is clear and accurate
- ✅ REPLACE behavior works correctly (old removed, new added)
- ✅ Default schedule flag cleared after REPLACE
- ✅ Success toast displays
- ✅ No console errors

---

## Test Scenario 3: Set Default Schedule

**Objective**: Verify default schedule toggle functionality

### Prerequisites
- User has 3+ schedules assigned
- None marked as default initially

### Test Steps

#### 3.1 Set First Default Schedule

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | View user with 3 schedules, no default | No ⭐ icon visible | ☐ Pass ☐ Fail | |
| 2 | Click star icon on Schedule A | Icon animates/highlights | ☐ Pass ☐ Fail | |
| 3 | Verify Schedule A now shows: | Visual update | ☐ Pass ☐ Fail | |
|   | - Filled star icon (⭐) | ✓ | | |
|   | - "Default" badge | ✓ | | |
|   | - Distinct styling (border/background) | ✓ | | |
| 4 | Verify success toast shows | "Default schedule updated" | ☐ Pass ☐ Fail | |
| 5 | Refresh page | Default persists | ☐ Pass ☐ Fail | |

**Screenshot Placeholder**: ![Default Schedule Set](./screenshots/test-3.1-default-set.png)

#### 3.2 Change Default Schedule

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | User has Schedule A as default | ⭐ on Schedule A | ☐ Pass ☐ Fail | |
| 2 | Click star icon on Schedule B | Icon on B highlights | ☐ Pass ☐ Fail | |
| 3 | Verify Schedule A default removed | Star icon empty on A | ☐ Pass ☐ Fail | |
| 4 | Verify Schedule B default set | Star icon filled on B | ☐ Pass ☐ Fail | |
| 5 | Verify only ONE default exists | Only B has ⭐ | ☐ Pass ☐ Fail | |
| 6 | Verify success toast shows | Toast displays | ☐ Pass ☐ Fail | |

#### 3.3 Unset Default Schedule

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | User has Schedule A as default | ⭐ on Schedule A | ☐ Pass ☐ Fail | |
| 2 | Click filled star icon on Schedule A | Icon becomes empty | ☐ Pass ☐ Fail | |
| 3 | Verify "Default" badge removed | Badge gone | ☐ Pass ☐ Fail | |
| 4 | Verify no schedule has default flag | No ⭐ anywhere | ☐ Pass ☐ Fail | |
| 5 | Verify success toast shows | "Default schedule removed" | ☐ Pass ☐ Fail | |

#### 3.4 Optimistic Update

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Open DevTools Network tab | Throttle: Slow 3G | ☐ Pass ☐ Fail | |
| 2 | Click star icon on Schedule A | Immediate UI update | ☐ Pass ☐ Fail | |
| 3 | Verify star fills BEFORE API response | Optimistic update works | ☐ Pass ☐ Fail | |
| 4 | Verify API call completes | 200 OK response | ☐ Pass ☐ Fail | |
| 5 | Verify UI remains consistent | No flicker/rollback | ☐ Pass ☐ Fail | |

#### 3.5 Error Rollback

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Simulate API failure (DevTools) | Block request | ☐ Pass ☐ Fail | |
| 2 | Click star icon on Schedule A | UI updates optimistically | ☐ Pass ☐ Fail | |
| 3 | Wait for API failure | Request fails (500) | ☐ Pass ☐ Fail | |
| 4 | Verify UI rolls back | Star returns to previous state | ☐ Pass ☐ Fail | |
| 5 | Verify error toast shows | "Failed to update default" | ☐ Pass ☐ Fail | |

### Pass Criteria
- ✅ Default can be set, changed, and unset
- ✅ Only one schedule can be default at a time
- ✅ Visual feedback immediate (optimistic update)
- ✅ Default persists after page refresh
- ✅ Error handling with rollback works
- ✅ No console errors

---

## Test Scenario 4: User List (Search/Sort/Pagination)

**Objective**: Verify user list functionality with large dataset

### Prerequisites
- Database with 10,000+ users
- Mix of users with 0, 1, 3, 5, 10+ schedules

### Test Steps

#### 4.1 Virtual Scrolling Performance

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Navigate to `/schedules/users` | Page loads < 2s | ☐ Pass ☐ Fail | |
| 2 | Verify only ~20 users rendered initially | Check DevTools Elements | ☐ Pass ☐ Fail | |
| 3 | Scroll down 100 users | Smooth scrolling | ☐ Pass ☐ Fail | |
| 4 | Verify DOM size remains constant | ~50-100 elements max | ☐ Pass ☐ Fail | |
| 5 | Scroll to bottom (user 10,000) | No lag or freeze | ☐ Pass ☐ Fail | |
| 6 | Check Performance (DevTools) | FPS > 50 | ☐ Pass ☐ Fail | |

**Screenshot Placeholder**: ![Virtual Scrolling DevTools](./screenshots/test-4.1-virtual-scroll.png)

#### 4.2 Search Functionality

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Type "John" in search box | Debounced search (500ms) | ☐ Pass ☐ Fail | |
| 2 | Verify results show only matching users | Filtered list | ☐ Pass ☐ Fail | |
| 3 | Verify search matches: | Multiple fields | ☐ Pass ☐ Fail | |
|   | - Name | ✓ | | |
|   | - Email | ✓ | | |
|   | - Username | ✓ | | |
| 4 | Clear search | All users return | ☐ Pass ☐ Fail | |
| 5 | Search "nonexistent" | Empty state shows | ☐ Pass ☐ Fail | |

#### 4.3 Sort Functionality

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Click "Name" column header | Sort A-Z | ☐ Pass ☐ Fail | |
| 2 | Click again | Sort Z-A | ☐ Pass ☐ Fail | |
| 3 | Click "Schedule Count" header | Sort by count (ascending) | ☐ Pass ☐ Fail | |
| 4 | Verify users with 0 schedules at top | Correct order | ☐ Pass ☐ Fail | |
| 5 | Click again | Sort descending | ☐ Pass ☐ Fail | |

#### 4.4 Pagination (URL State)

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Note initial URL | e.g., `/users?page=1` | ☐ Pass ☐ Fail | |
| 2 | Click "Next Page" | URL updates to `?page=2` | ☐ Pass ☐ Fail | |
| 3 | Verify different users displayed | Page 2 content | ☐ Pass ☐ Fail | |
| 4 | Copy URL and open in new tab | Same page/users displayed | ☐ Pass ☐ Fail | |
| 5 | Click browser back button | Returns to page 1 | ☐ Pass ☐ Fail | |

#### 4.5 Combined Filters

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Search "John" | Filtered results | ☐ Pass ☐ Fail | |
| 2 | Sort by "Schedule Count" | Search results sorted | ☐ Pass ☐ Fail | |
| 3 | Verify URL includes both: | `?search=John&sort=scheduleCount` | ☐ Pass ☐ Fail | |
| 4 | Refresh page | Filters persist | ☐ Pass ☐ Fail | |

### Pass Criteria
- ✅ Virtual scrolling works smoothly with 10k+ users
- ✅ Search debounced and searches multiple fields
- ✅ Sort works for all columns
- ✅ Pagination state in URL (shareable)
- ✅ Combined filters work together
- ✅ Performance metrics: FPS > 50, Page load < 2s

---

## Test Scenario 5: Remove All Schedules

**Objective**: Verify bulk removal functionality with confirmation

### Prerequisites
- User exists with 5+ schedules assigned

### Test Steps

#### 5.1 Remove All Schedules

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Click user with 5 schedules | User detail view | ☐ Pass ☐ Fail | |
| 2 | Click "Remove All" button | Confirmation modal opens | ☐ Pass ☐ Fail | |
| 3 | Verify modal shows: | All elements visible | ☐ Pass ☐ Fail | |
|   | - ⚠️ Warning icon | ✓ | | |
|   | - "Remove All Schedules" title | ✓ | | |
|   | - Count of schedules (e.g., "5 schedules") | ✓ | | |
|   | - Confirmation message | ✓ | | |
| 4 | Click "Cancel" | Modal closes, no changes | ☐ Pass ☐ Fail | |
| 5 | Verify schedules still exist | All 5 schedules visible | ☐ Pass ☐ Fail | |

**Screenshot Placeholder**: ![Remove All Confirmation Modal](./screenshots/test-5.1-remove-all-modal.png)

#### 5.2 Confirm Removal

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Click "Remove All" button again | Modal opens | ☐ Pass ☐ Fail | |
| 2 | Click "Confirm" button | Modal closes | ☐ Pass ☐ Fail | |
| 3 | Verify success toast shows | "All schedules removed" | ☐ Pass ☐ Fail | |
| 4 | Verify empty state displays | Calendar icon + message | ☐ Pass ☐ Fail | |
| 5 | Refresh page | Empty state persists | ☐ Pass ☐ Fail | |

#### 5.3 API Verification

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Open DevTools Network tab | Monitor requests | ☐ Pass ☐ Fail | |
| 2 | Click "Remove All" and confirm | DELETE request sent | ☐ Pass ☐ Fail | |
| 3 | Verify API endpoint: | `DELETE /users/{userId}/schedules` | ☐ Pass ☐ Fail | |
| 4 | Verify response: | `204 No Content` | ☐ Pass ☐ Fail | |
| 5 | Verify cache invalidated | Subsequent GET requests fetch updated data | ☐ Pass ☐ Fail | |

### Pass Criteria
- ✅ Confirmation modal shows before removal
- ✅ Cancel button prevents removal
- ✅ Confirm button removes all schedules
- ✅ Empty state displays after removal
- ✅ API call correct (DELETE endpoint)
- ✅ Success toast displays

---

## Test Scenario 6: Mobile Responsive

**Objective**: Verify responsive design on mobile devices

### Prerequisites
- Mobile device or Chrome DevTools device emulation
- Test on iOS (iPhone 14) and Android (Pixel 7)

### Test Steps

#### 6.1 User List Mobile View

| Device | Step | Expected Result | Pass/Fail | Notes |
|--------|------|----------------|-----------|-------|
| iPhone 14 Pro | Navigate to `/users` | Page displays correctly | ☐ Pass ☐ Fail | |
| | Verify elements stack vertically | Single column layout | ☐ Pass ☐ Fail | |
| | Tap user | Details view opens | ☐ Pass ☐ Fail | |
| | Verify touch targets ≥ 44x44px | All buttons tappable | ☐ Pass ☐ Fail | |
| Pixel 7 | Repeat above steps | Same results | ☐ Pass ☐ Fail | |

**Screenshot Placeholder**: ![Mobile User List](./screenshots/test-6.1-mobile-user-list.png)

#### 6.2 Schedule Cards Mobile View

| Device | Step | Expected Result | Pass/Fail | Notes |
|--------|------|----------------|-----------|-------|
| iPhone 14 Pro | View user schedules | Cards display correctly | ☐ Pass ☐ Fail | |
| | Verify cards full-width | No horizontal scroll | ☐ Pass ☐ Fail | |
| | Verify text readable | Font size ≥ 16px | ☐ Pass ☐ Fail | |
| | Tap "Assign Schedules" | Modal opens full-screen | ☐ Pass ☐ Fail | |

#### 6.3 Modal Mobile View

| Device | Step | Expected Result | Pass/Fail | Notes |
|--------|------|----------------|-----------|-------|
| iPhone 14 Pro | Open assignment modal | Modal displays correctly | ☐ Pass ☐ Fail | |
| | Verify modal takes full screen | No overflow | ☐ Pass ☐ Fail | |
| | Scroll schedule list | Smooth scrolling | ☐ Pass ☐ Fail | |
| | Tap schedule checkbox | Checkbox toggles | ☐ Pass ☐ Fail | |
| | Tap "Confirm" | Modal closes, schedules assigned | ☐ Pass ☐ Fail | |

**Screenshot Placeholder**: ![Mobile Modal](./screenshots/test-6.3-mobile-modal.png)

#### 6.4 Responsive Breakpoints

| Viewport Width | Expected Layout | Pass/Fail |
|----------------|----------------|-----------|
| 320px (iPhone SE) | Single column, no horizontal scroll | ☐ Pass ☐ Fail |
| 375px (iPhone 14) | Single column, optimized spacing | ☐ Pass ☐ Fail |
| 768px (iPad) | 2-column layout (if applicable) | ☐ Pass ☐ Fail |
| 1024px+ (Desktop) | Full multi-column layout | ☐ Pass ☐ Fail |

### Pass Criteria
- ✅ No horizontal scrolling on any device
- ✅ All touch targets ≥ 44x44px
- ✅ Text readable (font size ≥ 16px)
- ✅ Modals display correctly on mobile
- ✅ Responsive breakpoints work
- ✅ Performance acceptable on mobile network

---

## Test Scenario 7: Keyboard Navigation

**Objective**: Verify full keyboard accessibility

### Prerequisites
- Desktop browser (Chrome/Firefox)
- Keyboard only (no mouse)

### Test Steps

#### 7.1 Tab Navigation

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Press Tab from page top | Focus moves to first interactive element | ☐ Pass ☐ Fail | |
| 2 | Continue pressing Tab | Logical tab order (left-to-right, top-to-bottom) | ☐ Pass ☐ Fail | |
| 3 | Verify focus ring visible | Blue outline around focused element | ☐ Pass ☐ Fail | |
| 4 | Tab through user list | Each user row focusable | ☐ Pass ☐ Fail | |
| 5 | Tab to "Assign Schedules" button | Button receives focus | ☐ Pass ☐ Fail | |

#### 7.2 Modal Keyboard Navigation

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Tab to "Assign Schedules" button | Button focused | ☐ Pass ☐ Fail | |
| 2 | Press Enter | Modal opens | ☐ Pass ☐ Fail | |
| 3 | Verify focus trapped in modal | Tab cycles within modal only | ☐ Pass ☐ Fail | |
| 4 | Press ESC | Modal closes | ☐ Pass ☐ Fail | |
| 5 | Verify focus returns to trigger button | Focus restored | ☐ Pass ☐ Fail | |

#### 7.3 Schedule Selection (Keyboard)

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Open assignment modal | Modal displays | ☐ Pass ☐ Fail | |
| 2 | Tab to first schedule checkbox | Checkbox focused | ☐ Pass ☐ Fail | |
| 3 | Press Space | Checkbox toggles | ☐ Pass ☐ Fail | |
| 4 | Tab to next checkbox | Focus moves | ☐ Pass ☐ Fail | |
| 5 | Press Space | Second checkbox toggles | ☐ Pass ☐ Fail | |
| 6 | Tab to "Confirm" button | Button focused | ☐ Pass ☐ Fail | |
| 7 | Press Enter | Schedules assigned | ☐ Pass ☐ Fail | |

#### 7.4 Default Schedule Toggle (Keyboard)

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Tab to star icon | Icon focused | ☐ Pass ☐ Fail | |
| 2 | Press Enter or Space | Default toggle activates | ☐ Pass ☐ Fail | |
| 3 | Verify visual feedback | Star fills/empties | ☐ Pass ☐ Fail | |

#### 7.5 Keyboard Shortcuts (Future)

| Shortcut | Expected Action | Pass/Fail |
|----------|----------------|-----------|
| `/` | Focus search box | ☐ Pass ☐ Fail |
| `Esc` | Close modal/dialog | ☐ Pass ☐ Fail |
| `Ctrl+S` | Save form (if applicable) | ☐ N/A (not implemented) |

### Pass Criteria
- ✅ All interactive elements keyboard accessible
- ✅ Logical tab order
- ✅ Focus ring visible (contrast ratio ≥ 3:1)
- ✅ Modal focus trap works
- ✅ ESC closes modals
- ✅ No keyboard traps (can exit all components)

---

## Test Scenario 8: Error Handling

**Objective**: Verify error states and recovery

### Prerequisites
- Chrome DevTools Network tab
- Ability to simulate API failures

### Test Steps

#### 8.1 Network Error (Fetch Schedules)

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Open DevTools, go offline | Network: Offline | ☐ Pass ☐ Fail | |
| 2 | Navigate to user schedules | Loading state shows | ☐ Pass ☐ Fail | |
| 3 | Wait for timeout | Error state displays | ☐ Pass ☐ Fail | |
| 4 | Verify error shows: | All elements visible | ☐ Pass ☐ Fail | |
|   | - Error icon | ✓ | | |
|   | - "Failed to load schedules" message | ✓ | | |
|   | - "Try Again" button | ✓ | | |
| 5 | Go back online | Network: Online | ☐ Pass ☐ Fail | |
| 6 | Click "Try Again" | Schedules load successfully | ☐ Pass ☐ Fail | |

**Screenshot Placeholder**: ![Error State](./screenshots/test-8.1-error-state.png)

#### 8.2 API Error (500 Internal Server Error)

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Open DevTools Network tab | Monitor requests | ☐ Pass ☐ Fail | |
| 2 | Block API request (simulate 500) | Request fails | ☐ Pass ☐ Fail | |
| 3 | Try to assign schedules | Error toast shows | ☐ Pass ☐ Fail | |
| 4 | Verify toast shows: | "Failed to assign schedules. Please try again." | ☐ Pass ☐ Fail | |
| 5 | Verify schedules NOT changed | Previous state preserved | ☐ Pass ☐ Fail | |

#### 8.3 Validation Error (400 Bad Request)

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Open assignment modal | Modal displays | ☐ Pass ☐ Fail | |
| 2 | Click "Confirm" without selecting schedules | Validation error | ☐ Pass ☐ Fail | |
| 3 | Verify error message: | "Please select at least one schedule" | ☐ Pass ☐ Fail | |
| 4 | Select 1 schedule | Error clears | ☐ Pass ☐ Fail | |
| 5 | Click "Confirm" | Schedules assigned | ☐ Pass ☐ Fail | |

#### 8.4 Authentication Error (401 Unauthorized)

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Clear auth token (localStorage) | Token removed | ☐ Pass ☐ Fail | |
| 2 | Try to assign schedules | API returns 401 | ☐ Pass ☐ Fail | |
| 3 | Verify redirect to login | `/login` page | ☐ Pass ☐ Fail | |
| 4 | Verify error message: | "Session expired. Please login again." | ☐ Pass ☐ Fail | |

#### 8.5 ErrorBoundary (JavaScript Error)

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Trigger JavaScript error (component crash) | Error boundary catches | ☐ Pass ☐ Fail | |
| 2 | Verify fallback UI shows: | All elements visible | ☐ Pass ☐ Fail | |
|   | - ⚠️ Error icon | ✓ | | |
|   | - "Something went wrong" message | ✓ | | |
|   | - "Try Again" button | ✓ | | |
|   | - "Go to Home" button | ✓ | | |
| 3 | Click "Try Again" | Component re-renders | ☐ Pass ☐ Fail | |
| 4 | Verify error logged to console | Console shows error details | ☐ Pass ☐ Fail | |

**Screenshot Placeholder**: ![ErrorBoundary Fallback](./screenshots/test-8.5-error-boundary.png)

### Pass Criteria
- ✅ Network errors handled gracefully
- ✅ API errors show user-friendly messages
- ✅ Validation errors clear and actionable
- ✅ 401 redirects to login
- ✅ ErrorBoundary catches crashes
- ✅ All errors logged to console
- ✅ Retry functionality works

---

## Test Scenario 9: Performance (10k Users)

**Objective**: Verify performance with large dataset

### Prerequisites
- Database seeded with 10,000+ users
- Chrome DevTools Lighthouse
- Performance monitoring enabled

### Test Steps

#### 9.1 Page Load Performance

| Metric | Target | Actual | Pass/Fail | Notes |
|--------|--------|--------|-----------|-------|
| First Contentful Paint (FCP) | < 1.5s | | ☐ Pass ☐ Fail | |
| Largest Contentful Paint (LCP) | < 2.5s | | ☐ Pass ☐ Fail | |
| Time to Interactive (TTI) | < 3.0s | | ☐ Pass ☐ Fail | |
| Total Blocking Time (TBT) | < 200ms | | ☐ Pass ☐ Fail | |
| Cumulative Layout Shift (CLS) | < 0.1 | | ☐ Pass ☐ Fail | |

**Screenshot Placeholder**: ![Lighthouse Report](./screenshots/test-9.1-lighthouse.png)

#### 9.2 Virtual Scrolling Performance

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Open DevTools Performance tab | Start recording | ☐ Pass ☐ Fail | |
| 2 | Scroll through 1,000 users | Smooth scrolling | ☐ Pass ☐ Fail | |
| 3 | Stop recording | Analyze results | ☐ Pass ☐ Fail | |
| 4 | Verify FPS | ≥ 50 FPS | ☐ Pass ☐ Fail | |
| 5 | Verify DOM size | < 100 elements | ☐ Pass ☐ Fail | |

#### 9.3 Memory Usage

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Open DevTools Memory tab | Take heap snapshot | ☐ Pass ☐ Fail | |
| 2 | Note initial memory usage | e.g., 50 MB | ☐ Pass ☐ Fail | |
| 3 | Scroll through 5,000 users | Heap snapshot again | ☐ Pass ☐ Fail | |
| 4 | Verify memory increase | < 50 MB increase | ☐ Pass ☐ Fail | |
| 5 | Navigate away and back | Memory released | ☐ Pass ☐ Fail | |

#### 9.4 Bundle Size

| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| Initial bundle size | < 200 KB | | ☐ Pass ☐ Fail |
| Route chunk size | < 100 KB | | ☐ Pass ☐ Fail |
| Total page size | < 500 KB | | ☐ Pass ☐ Fail |

#### 9.5 API Performance

| Endpoint | Target | Actual | Pass/Fail |
|----------|--------|--------|-----------|
| GET /users (10k users) | < 500ms | | ☐ Pass ☐ Fail |
| GET /users/{id}/schedules | < 200ms | | ☐ Pass ☐ Fail |
| POST /users/{id}/schedules | < 300ms | | ☐ Pass ☐ Fail |
| DELETE /users/{id}/schedules | < 200ms | | ☐ Pass ☐ Fail |

### Pass Criteria
- ✅ Lighthouse Performance score ≥ 90
- ✅ Core Web Vitals: All "Good" (green)
- ✅ Virtual scrolling: FPS ≥ 50
- ✅ Memory usage: < 100 MB increase
- ✅ Bundle size: < 200 KB initial
- ✅ API response times: All < 500ms

---

## Test Scenario 10: Edge Cases

**Objective**: Verify handling of uncommon scenarios

### Test Steps

#### 10.1 User with 100+ Schedules

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Create user with 100 schedules | User created | ☐ Pass ☐ Fail | |
| 2 | View user schedules | All 100 schedules display | ☐ Pass ☐ Fail | |
| 3 | Verify virtual scrolling works | Smooth scrolling | ☐ Pass ☐ Fail | |
| 4 | Assign 50 new schedules (REPLACE) | Old 100 removed, new 50 added | ☐ Pass ☐ Fail | |

#### 10.2 Schedule with Very Long Name

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Create schedule with 200-character name | Schedule created | ☐ Pass ☐ Fail | |
| 2 | Assign to user | Displays correctly | ☐ Pass ☐ Fail | |
| 3 | Verify text truncation | Ellipsis (...) shown | ☐ Pass ☐ Fail | |
| 4 | Hover over name | Tooltip shows full name | ☐ Pass ☐ Fail | |

#### 10.3 Concurrent Modifications

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Open user in two browser tabs | Both tabs show same data | ☐ Pass ☐ Fail | |
| 2 | Assign schedules in Tab 1 | Tab 1 updates | ☐ Pass ☐ Fail | |
| 3 | Refresh Tab 2 | Tab 2 shows updated schedules | ☐ Pass ☐ Fail | |
| 4 | Assign different schedules in Tab 2 | Tab 2 updates | ☐ Pass ☐ Fail | |
| 5 | Verify last write wins | Most recent assignment persists | ☐ Pass ☐ Fail | |

#### 10.4 Special Characters in Search

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Search with special chars: `<script>` | No XSS vulnerability | ☐ Pass ☐ Fail | |
| 2 | Search with SQL: `'; DROP TABLE users;` | No SQL injection | ☐ Pass ☐ Fail | |
| 3 | Search with Unicode: `用户` | Search works | ☐ Pass ☐ Fail | |
| 4 | Search with emoji: `🚀` | No errors | ☐ Pass ☐ Fail | |

#### 10.5 Rapid Clicking

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Click "Assign Schedules" 10 times rapidly | Only 1 modal opens | ☐ Pass ☐ Fail | |
| 2 | Click "Set Default" star 10 times rapidly | Only 1 API call | ☐ Pass ☐ Fail | |
| 3 | Verify debouncing/throttling works | No duplicate requests | ☐ Pass ☐ Fail | |

#### 10.6 Deleted Schedule Still Assigned

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|----------------|-----------|-------|
| 1 | Assign Schedule X to User | Schedule assigned | ☐ Pass ☐ Fail | |
| 2 | Delete Schedule X (admin action) | Schedule deleted | ☐ Pass ☐ Fail | |
| 3 | View user schedules | Deleted schedule not shown OR shown with "Deleted" badge | ☐ Pass ☐ Fail | |
| 4 | Verify no broken UI | No errors | ☐ Pass ☐ Fail | |

### Pass Criteria
- ✅ Handles 100+ schedules per user
- ✅ Long names truncated with tooltip
- ✅ Concurrent modifications handled
- ✅ No XSS or SQL injection vulnerabilities
- ✅ Rapid clicking handled (debounced)
- ✅ Deleted schedules handled gracefully

---

## Test Summary Report Template

### Test Execution Summary

| Scenario | Total Tests | Passed | Failed | Blocked | Pass Rate |
|----------|-------------|--------|--------|---------|-----------|
| 1. User Schedule Views | 10 | | | | % |
| 2. Assign Schedules (REPLACE) | 15 | | | | % |
| 3. Set Default Schedule | 12 | | | | % |
| 4. User List (Search/Sort/Pagination) | 12 | | | | % |
| 5. Remove All Schedules | 8 | | | | % |
| 6. Mobile Responsive | 10 | | | | % |
| 7. Keyboard Navigation | 12 | | | | % |
| 8. Error Handling | 15 | | | | % |
| 9. Performance (10k Users) | 10 | | | | % |
| 10. Edge Cases | 12 | | | | % |
| **TOTAL** | **116** | | | | **%** |

### Critical Issues Found

| Issue ID | Severity | Scenario | Description | Status |
|----------|----------|----------|-------------|--------|
| | High | | | |
| | Medium | | | |
| | Low | | | |

### Performance Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Lighthouse Performance | ≥ 90 | | ✅/❌ |
| First Contentful Paint | < 1.5s | | ✅/❌ |
| Largest Contentful Paint | < 2.5s | | ✅/❌ |
| Time to Interactive | < 3.0s | | ✅/❌ |
| Bundle Size | < 200 KB | | ✅/❌ |

### Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Product Owner | | | |
| Dev Lead | | | |

---

**Last Updated**: October 2, 2025  
**Version**: 1.0  
**Status**: Ready for Testing ✅
