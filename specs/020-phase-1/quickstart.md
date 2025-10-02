# Quickstart Guide: User Schedule Assignment UI

**Feature**: User Schedule Assignment UI (Phase 1)  
**Date**: 2025-10-02  
**Purpose**: Manual testing guide for validating implementation

---

## Prerequisites

### System Requirements
- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Web browser (Chrome, Firefox, Safari, or Edge)

### Backend Requirements
- ✅ Backend API running on `http://localhost:5100`
- ✅ Feature 019 APIs implemented and tested
- ✅ Database seeded with test data:
  - At least 5 users
  - At least 10 schedules
  - Some existing user-schedule assignments

### Frontend Setup
```bash
# Navigate to frontend directory
cd src/digital-signage-web

# Install dependencies
npm install

# Set environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:5100" > .env.local

# Start development server
npm run dev

# Frontend should be running on http://localhost:3000
```

### Test User Credentials
```
Admin User:
  Email: admin@company.com
  Password: Admin123!

Regular User (for permission testing):
  Email: user@company.com
  Password: User123!
```

---

## Test Scenarios

### Scenario 1: View User's Assigned Schedules

**Objective**: Verify that admin can view a user's currently assigned schedules

**Steps**:
1. Log in as admin user
2. Navigate to Users page: `http://localhost:3000/users`
3. Find user "John Doe" in the user list
4. Click on the user or navigate to schedule management
5. Navigate to `/users/123/schedules` (replace 123 with actual user ID)

**Expected Results**:
- ✅ Page title shows "Schedule Assignment for John Doe"
- ✅ User info card displays name, email, device count
- ✅ Current assigned schedules are listed
- ✅ Each schedule shows: name, description, assigned date, assigned by
- ✅ If no schedules assigned, empty state is shown with "No schedules assigned yet" message
- ✅ "Assign Schedules" button is visible
- ✅ "Remove All Assignments" button is visible (disabled if no assignments)

**Test Data Variations**:
- User with 0 assignments → Should show empty state
- User with 1 assignment → Should show single schedule
- User with 5+ assignments → Should show scrollable list

---

### Scenario 2: Assign Schedules to User (New Assignment)

**Objective**: Assign schedules to a user who has no existing assignments

**Steps**:
1. Navigate to a user with no schedule assignments
2. Verify empty state is displayed
3. Click "Assign Schedules" button
4. Modal opens with schedule selector
5. Verify list of available schedules is loaded
6. Use search box to find "Morning News"
7. Check the checkbox for "Morning News"
8. Check the checkbox for "Afternoon Ads"
9. Note: No replacement warning should appear (no existing assignments)
10. Click "Assign Schedules" button

**Expected Results**:
- ✅ Modal opens smoothly
- ✅ Schedules load within 1 second
- ✅ Search filters schedules in real-time
- ✅ Selected schedules show checked checkboxes
- ✅ No replacement warning modal appears
- ✅ "Assign" button is enabled immediately
- ✅ Loading spinner shows during API call
- ✅ Success toast: "Successfully assigned 2 schedules"
- ✅ Modal closes automatically
- ✅ Page refreshes to show new assignments
- ✅ Both schedules are now in the list

**Validation**:
```bash
# Verify in backend API
curl -H "Authorization: Bearer {token}" \
  http://localhost:5100/api/admin/users/123/schedules

# Should return array with 2 schedules
```

---

### Scenario 3: Replace Existing Assignments (CRITICAL)

**Objective**: Verify REPLACE semantics with warning modal

**Steps**:
1. Navigate to a user who already has 2 schedules assigned
2. Note the current schedule names (e.g., "Morning News", "Afternoon Ads")
3. Click "Assign Schedules" button
4. Select 2 DIFFERENT schedules (e.g., "Evening Content", "Night Display")
5. Click "Assign Schedules" button

**Expected Results**:
- ✅ **WARNING MODAL APPEARS**
- ✅ Modal title: "Replace Existing Assignments?"
- ✅ Warning message in amber/yellow color
- ✅ Current assignments are listed in modal:
  ```
  Current Assignments (will be removed):
  - Morning News
  - Afternoon Ads
  ```
- ✅ New assignments are listed:
  ```
  New Assignments:
  - Evening Content
  - Night Display
  ```
- ✅ Checkbox: "I understand this will replace all existing assignments"
- ✅ "Confirm Replace" button is **DISABLED** until checkbox checked
- ✅ After checking checkbox, button becomes enabled
- ✅ Click "Confirm Replace"
- ✅ Loading state shown
- ✅ Success toast appears
- ✅ Modal closes
- ✅ **Old assignments are GONE**
- ✅ **Only new assignments remain** (Evening Content, Night Display)

**Critical Validation**:
```bash
# Verify replacement in backend
curl -H "Authorization: Bearer {token}" \
  http://localhost:5100/api/admin/users/123/schedules

# Should return ONLY the 2 new schedules
# Old schedules should NOT be in the response
```

**Test Variations**:
- Try clicking "Confirm Replace" before checking checkbox → Should not work
- Click "Cancel" in warning modal → Should abort assignment, keep old assignments
- Close modal with X button → Should abort assignment

---

### Scenario 4: Remove All Assignments

**Objective**: Remove all schedule assignments from a user

**Steps**:
1. Navigate to a user with 3+ schedule assignments
2. Click "Remove All Assignments" button
3. Confirmation modal appears

**Expected Results**:
- ✅ Confirmation modal shows
- ✅ Title: "Remove All Schedule Assignments?"
- ✅ Warning message: "This will remove all {count} schedule assignments from {username}. Their devices will fall back to group or default schedules."
- ✅ "Cancel" and "Remove All" buttons
- ✅ "Remove All" button is red (destructive action)
- ✅ Click "Remove All"
- ✅ Loading state shown
- ✅ Success toast: "All assignments removed"
- ✅ Page updates to show empty state
- ✅ "No schedules assigned yet" message displayed

**Validation**:
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:5100/api/admin/users/123/schedules

# Should return empty array or 0 count
```

---

### Scenario 5: View Users Assigned to a Schedule

**Objective**: See which users have a specific schedule assigned (reverse lookup)

**Steps**:
1. Navigate to Schedules page: `http://localhost:3000/schedules`
2. Find schedule "Morning News"
3. Click on "View Assigned Users" link or badge showing user count
4. Modal opens with list of users

**Expected Results**:
- ✅ Modal title: "Users Assigned to Morning News"
- ✅ User list displays:
  - User name
  - User email
  - Assigned date
  - Device count for that user
- ✅ Total count shown: "3 users assigned"
- ✅ If many users, pagination works
- ✅ Search box filters users by name or email
- ✅ Empty state if no users assigned

**Test with Different Schedules**:
- Schedule with 0 users → Empty state
- Schedule with 1 user → Single user card
- Schedule with 20+ users → Pagination appears

---

### Scenario 6: Mark Schedule as Default

**Objective**: Toggle the default flag on a schedule

**Steps**:
1. Navigate to Schedules page
2. Find schedule "General Content"
3. Locate the "Set as Default" toggle switch
4. Current state shows OFF (gray)
5. Click the toggle switch

**Expected Results**:
- ✅ Toggle animates to ON position
- ✅ Loading spinner shows briefly on toggle
- ✅ Success toast: "Schedule marked as default"
- ✅ Toggle turns blue/primary color
- ✅ Badge appears: "Default" in gray color
- ✅ Schedule now shows content source: "Default"

**Toggle Back**:
6. Click toggle again to turn OFF
7. Loading spinner shows
8. Success toast: "Default flag removed"
9. Badge disappears
10. Content source changes back to "Group" or "User"

**Validation**:
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:5100/api/admin/schedules/45

# isDefault should be true or false based on toggle
```

---

### Scenario 7: Search and Filter Schedules in Selector

**Objective**: Test search functionality in schedule selector modal

**Steps**:
1. Open schedule selector modal (any user)
2. Note: 20+ schedules are available
3. Type "news" in search box
4. Results filter in real-time

**Expected Results**:
- ✅ Only schedules containing "news" in name or description are shown
- ✅ Filtering happens instantly (< 300ms debounce)
- ✅ If no matches, show "No schedules found"
- ✅ Clear search button (X) appears in search box
- ✅ Clicking X clears search and shows all schedules again

**Filter Tests**:
- Search "morning" → Should find "Morning News", "Morning Announcements"
- Search "xyz123" → Should show empty state
- Search by description text → Should find schedules with matching descriptions

**Additional Filters**:
5. Check "Active schedules only" checkbox
6. Inactive schedules disappear from list
7. Uncheck → Inactive schedules reappear (grayed out, not selectable)

---

### Scenario 8: Mobile Responsive Design

**Objective**: Verify UI works on mobile devices

**Steps**:
1. Open Chrome DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 Pro (or similar)
4. Navigate through all pages

**Expected Results**:
- ✅ User schedule assignment page is readable
- ✅ Schedule selector modal fits screen width
- ✅ Buttons are large enough to tap (44x44px minimum)
- ✅ Lists scroll smoothly
- ✅ No horizontal scroll required
- ✅ Text is legible without zooming
- ✅ Modal overlays properly
- ✅ Search box is usable with on-screen keyboard

**Test Devices**:
- iPhone 12 Pro (390x844)
- iPad Air (820x1180)
- Samsung Galaxy S21 (360x800)

---

### Scenario 9: Error Handling

**Objective**: Verify graceful error handling

**Test Cases**:

**9.1 Network Error**:
1. Stop backend server
2. Try to load user schedules page
3. Expected: Error state with "Failed to load schedules" and Retry button
4. Start backend server
5. Click Retry button
6. Expected: Schedules load successfully

**9.2 Authorization Error**:
1. Log in as regular user (non-admin)
2. Try to access `/users/123/schedules`
3. Expected: Redirect to dashboard with "Unauthorized" toast

**9.3 User Not Found**:
1. Navigate to `/users/999999/schedules` (non-existent ID)
2. Expected: 404 page or error message "User not found"

**9.4 Validation Error**:
1. Open schedule selector
2. Don't select any schedules
3. Click "Assign Schedules"
4. Expected: Validation error "At least one schedule must be selected"

**9.5 API Error During Assignment**:
1. Try to assign an inactive schedule (if backend prevents this)
2. Expected: Error toast with specific message "Cannot assign inactive schedules"
3. Modal remains open
4. User can fix selection and retry

---

### Scenario 10: Performance Testing

**Objective**: Verify performance with large datasets

**Setup**:
- Seed database with 500+ schedules
- Seed database with 100+ users

**Tests**:

**10.1 Large Schedule List**:
1. Open schedule selector
2. Measure time to load and render schedules
3. Expected: < 2 seconds for initial load
4. Scroll through list
5. Expected: Smooth 60fps scrolling (virtual scrolling)

**10.2 Search Performance**:
1. Type in search box
2. Observe debounce delay
3. Expected: 300ms debounce, then instant results
4. Search with 500 schedules
5. Expected: Filter results in < 100ms

**10.3 Cache Performance**:
1. Navigate to user A's schedules
2. Navigate back to user list
3. Navigate to user A's schedules again
4. Expected: Instant load from cache (< 100ms)

**10.4 Mutation Performance**:
1. Assign 10 schedules at once
2. Expected: API call completes in < 500ms
3. Expected: UI updates instantly with new assignments

---

## Validation Checklist

### Functional Requirements (FR-001 to FR-030)

- [ ] FR-001: Navigate to user schedule page ✅
- [ ] FR-002: Display current assignments ✅
- [ ] FR-003: Select multiple schedules ✅
- [ ] FR-004: Show REPLACE warning ✅
- [ ] FR-005: Confirm or cancel replacement ✅
- [ ] FR-006: Send assignment API request ✅
- [ ] FR-007: Show success notification ✅
- [ ] FR-008: Update UI immediately ✅
- [ ] FR-009: Remove all assignments ✅
- [ ] FR-010: Display user information ✅
- [ ] FR-011: Default schedule toggle ✅
- [ ] FR-012: Update default flag via API ✅
- [ ] FR-013: Visual default indicator ✅
- [ ] FR-014: View assigned users list ✅
- [ ] FR-015: User count badge ✅
- [ ] FR-016: Content source indicator ✅
- [ ] FR-017: Fetch user schedules ✅
- [ ] FR-018: Fetch available schedules ✅
- [ ] FR-019: Fetch assigned users ✅
- [ ] FR-020: Cache API responses ✅
- [ ] FR-021: Invalidate cache after mutations ✅
- [ ] FR-022: Loading spinners ✅
- [ ] FR-023: User-friendly error messages ✅
- [ ] FR-024: Handle network timeouts ✅
- [ ] FR-025: Retry mechanism ✅
- [ ] FR-026: Search/filter functionality ✅
- [ ] FR-027: Schedule preview on hover ✅
- [ ] FR-028: Prevent inactive schedule assignment ✅
- [ ] FR-029: Breadcrumb navigation ✅
- [ ] FR-030: Unsaved work confirmation ✅

### Success Metrics

- [ ] Admins can assign schedules in < 30 seconds
- [ ] No accidental data loss (REPLACE warning works)
- [ ] 100% of assignments reflect in backend
- [ ] Zero unauthorized access
- [ ] API response time < 500ms
- [ ] Initial page load < 2s
- [ ] Unit test coverage > 80%
- [ ] E2E tests pass

---

## Common Issues & Troubleshooting

### Issue: Modal doesn't open
**Solution**: Check browser console for JavaScript errors. Verify Redux store is properly configured.

### Issue: API calls fail with 401
**Solution**: JWT token expired. Log out and log in again.

### Issue: Schedules don't update after assignment
**Solution**: Check React Query cache invalidation. Verify `queryClient.invalidateQueries` is called after mutation.

### Issue: Replace warning doesn't show
**Solution**: Verify user has existing assignments. Check `currentScheduleIds` prop is passed correctly.

### Issue: Performance is slow with large lists
**Solution**: Verify virtual scrolling is enabled. Check that React Query pagination is working.

---

## Developer Commands

### Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Build for Production
```bash
npm run build
npm run start
```

### Lint and Type Check
```bash
npm run lint
npm run type-check
```

---

## Next Steps

After completing quickstart validation:

1. ✅ All scenarios pass → Proceed to automated testing
2. ❌ Issues found → Document bugs, fix, retest
3. 📝 Update documentation with any discovered edge cases
4. 🚀 Ready for Phase 2: High Priority features (Device Registration UI)

---

**Testing Complete**: Mark as ✅ when all scenarios validated
**Approver**: _________________  
**Date**: _________________
