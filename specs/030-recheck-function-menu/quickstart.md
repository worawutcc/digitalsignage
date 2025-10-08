# Quickstart: API Integration Audit - Manual Validation Guide

**Created**: 2025-01-07  
**Purpose**: Step-by-step guide for manually validating API integration fixes

## Prerequisites

### Environment Setup
1. **Backend API Running**:
   ```bash
   cd /Users/worawutcc/workspace/worawutcc/digital-signage/digital_signage
   dotnet watch run --project src/DigitalSignage.Api
   ```
   - API should be available at `http://localhost:5100`
   - Swagger docs at `http://localhost:5100/swagger`

2. **Frontend Dev Server Running**:
   ```bash
   cd src/digital-signage-web
   npm run dev
   ```
   - Frontend should be available at `http://localhost:3000`

3. **Test User Account**:
   - Username: `admin` / Email: `admin@digitalsignage.com`
   - Password: (your admin password)
   - Role: Admin

## Phase 1: Playlists Menu Validation

### Test 1.1: View All Playlists
**Expected**: Playlist list loads from API

**Steps**:
1. Navigate to `http://localhost:3000/playlists`
2. Open browser DevTools → Network tab
3. Look for `GET http://localhost:5100/api/playlist` request
4. Verify response contains playlists array

**Success Criteria**:
- ✅ API call appears in network tab
- ✅ Response status 200 OK
- ✅ Playlists display in UI
- ✅ No console errors

**Failure Indicators**:
- ❌ No API call made (stub data or broken service)
- ❌ 404 Not Found (endpoint doesn't exist)
- ❌ Empty list despite backend data
- ❌ Console error: "axios is not defined" (wrong import)

---

### Test 1.2: Create Playlist
**Expected**: Form submits data and creates playlist via API

**Steps**:
1. Click "Create Playlist" button
2. Fill form:
   - Name: "Test Playlist"
   - Description: "Validation test"
   - IsActive: true
3. Click "Save"
4. Check Network tab for `POST http://localhost:5100/api/playlist`

**Success Criteria**:
- ✅ POST request with correct JSON body
- ✅ Response status 201 Created
- ✅ New playlist appears in list
- ✅ Form closes or resets
- ✅ Success toast/notification

**Failure Indicators**:
- ❌ No POST request (form handler not wired)
- ❌ 400 Bad Request (validation error)
- ❌ Request body empty or malformed
- ❌ UI doesn't update after success

---

### Test 1.3: Edit Playlist
**Expected**: Form loads existing data and saves changes via API

**Steps**:
1. Click "Edit" on existing playlist
2. Verify form pre-fills with current data
3. Change name to "Updated Test Playlist"
4. Click "Save"
5. Check Network tab for `PUT http://localhost:5100/api/playlist/{id}`

**Success Criteria**:
- ✅ GET request loads playlist data first (if separate call)
- ✅ PUT request with updated data
- ✅ Response status 200 OK
- ✅ Updated data displays in list
- ✅ No duplicate entries

**Failure Indicators**:
- ❌ Form empty (edit not loading data)
- ❌ No PUT request on save
- ❌ Creates new playlist instead of updating
- ❌ Optimistic update reverts on error

---

### Test 1.4: Delete Playlist
**Expected**: Confirmation prompt, then DELETE API call removes playlist

**Steps**:
1. Click "Delete" on a test playlist
2. Confirm deletion in modal/prompt
3. Check Network tab for `DELETE http://localhost:5100/api/playlist/{id}`

**Success Criteria**:
- ✅ Confirmation dialog appears
- ✅ DELETE request on confirm
- ✅ Response status 204 No Content or 200 OK
- ✅ Playlist removed from list
- ✅ React Query cache invalidated

**Failure Indicators**:
- ❌ No DELETE request (stub handler)
- ❌ 409 Conflict (playlist has assignments)
- ❌ Item still visible after refresh
- ❌ No confirmation dialog (dangerous!)

---

### Test 1.5: Duplicate Playlist
**Expected**: Creates copy of playlist via API

**Steps**:
1. Click "Duplicate" on existing playlist
2. Enter new name in dialog (if prompted)
3. Check Network tab for `POST http://localhost:5100/api/playlist/{id}/duplicate`

**Success Criteria**:
- ✅ POST request to duplicate endpoint
- ✅ Response status 201 Created
- ✅ New playlist appears with "(Copy)" suffix
- ✅ Items copied if playlist had items

**Failure Indicators**:
- ❌ No API call (client-side duplication)
- ❌ Items not copied
- ❌ Wrong endpoint called (e.g., regular POST /playlist)

---

### Test 1.6: Activate/Deactivate Toggle
**Expected**: Status changes via API

**Steps**:
1. Find playlist with toggle switch
2. Click toggle to change state
3. Check Network tab for `PATCH http://localhost:5100/api/playlist/{id}/activate` or `/deactivate`

**Success Criteria**:
- ✅ PATCH request to activate/deactivate endpoint
- ✅ Response status 200 OK
- ✅ UI updates immediately (optimistic)
- ✅ Change persists after refresh

**Failure Indicators**:
- ❌ No API call (local state only)
- ❌ Toggle reverts on page refresh
- ❌ Wrong HTTP method (PUT instead of PATCH)

---

### Test 1.7: Search/Filter Playlists
**Expected**: Query parameters sent to API

**Steps**:
1. Enter "morning" in search box
2. Check Network tab for `GET http://localhost:5100/api/playlist?search=morning`
3. Toggle "Active Only" filter
4. Verify `?isActive=true` parameter

**Success Criteria**:
- ✅ Query parameters in URL
- ✅ API called on search input (debounced)
- ✅ Results update dynamically
- ✅ Filter combinations work

**Failure Indicators**:
- ❌ Client-side filtering only
- ❌ No debounce (API spam)
- ❌ Parameters not sent correctly
- ❌ Filters don't combine (e.g., search + isActive)

---

### Test 1.8: Playlist Assignment Summary
**Expected**: Shows device/group assignments from API

**Steps**:
1. Navigate to playlist detail or expand card
2. Find assignment summary section
3. Check Network tab for `GET http://localhost:5100/api/playlist/{id}/assignment-summary`

**Success Criteria**:
- ✅ GET request to assignment-summary endpoint
- ✅ Response contains totalAssignments, deviceCount, etc.
- ✅ UI displays statistics correctly
- ✅ Assignment list shows device/group names

**Failure Indicators**:
- ❌ Mock data displayed
- ❌ Always shows zero assignments
- ❌ Device names missing (not included in query)

---

## Phase 2: Schedules Menu Validation

### Test 2.1: Create Schedule (All Tabs)
**Expected**: Multi-tab form submits complete schedule data

**Steps**:
1. Click "Create Schedule"
2. **Basic Info Tab**:
   - Name: "Morning Schedule"
   - Priority: 5
   - Start Date: Today
3. **Time Slots Tab**:
   - Add slot: 08:00-12:00, Mon-Fri
4. **Targets Tab**:
   - Select device or device group
5. **Content Tab**:
   - Add media items
6. Click "Save"
7. Check Network tab for `POST http://localhost:5100/api/schedule`

**Success Criteria**:
- ✅ Single POST request with complete data
- ✅ All tabs' data included in request body
- ✅ Response status 201 Created
- ✅ New schedule appears in list

**Failure Indicators**:
- ❌ No POST request
- ❌ Missing data from tabs (only basic info sent)
- ❌ Multiple requests instead of one
- ❌ 400 Bad Request (validation errors)

---

### Test 2.2: Schedule Calendar View
**Expected**: Calendar loads schedule events from API

**Steps**:
1. Navigate to schedules calendar view
2. Check Network tab for `GET http://localhost:5100/api/schedule?startDate=...&endDate=...`

**Success Criteria**:
- ✅ API call with date range parameters
- ✅ Events appear on calendar
- ✅ Clicking date changes API query

**Failure Indicators**:
- ❌ Static calendar (no API calls)
- ❌ All schedules loaded at once (no filtering)
- ❌ Date parameters not sent

---

### Test 2.3: Conflict Detection
**Expected**: Backend validates schedule conflicts

**Steps**:
1. Create schedule for device "Display 1" from 10:00-12:00
2. Try creating another schedule for same device, same time
3. Check for validation error

**Success Criteria**:
- ✅ API returns 400 Bad Request or 409 Conflict
- ✅ Error message explains conflict
- ✅ UI shows error to user

**Failure Indicators**:
- ❌ Allows conflicting schedules
- ❌ Client-side validation only
- ❌ No error message

---

## Phase 3: Devices Menu Validation

### Test 3.1: Device Status Updates
**Expected**: Real-time status from heartbeat API or WebSocket

**Steps**:
1. Navigate to devices page
2. Check Network tab for periodic `GET /api/device` calls or WebSocket connection
3. Verify device status indicators (Online, Offline, Error)

**Success Criteria**:
- ✅ Status updates automatically (polling or WebSocket)
- ✅ Last heartbeat timestamp displayed
- ✅ Indicators change color based on status

**Failure Indicators**:
- ❌ Static status (always "Online")
- ❌ No periodic updates
- ❌ Stale heartbeat data

---

### Test 3.2: Device Registration Approval
**Expected**: Admin approves/rejects via API

**Steps**:
1. Navigate to device registration requests
2. Click "Approve" on pending request
3. Check Network tab for `POST /api/device/registration/{id}/approve`

**Success Criteria**:
- ✅ POST/PATCH request with approval action
- ✅ Request moves from pending to approved
- ✅ Device created in devices list

**Failure Indicators**:
- ❌ No API call
- ❌ Status doesn't change
- ❌ Device not created

---

## Phase 4: Media Menu Validation

### Test 4.1: Media Upload
**Expected**: S3 presigned URL flow

**Steps**:
1. Click "Upload Media"
2. Select file
3. Monitor Network tab:
   - First: `POST /api/media/presigned-url`
   - Then: Direct upload to S3
   - Finally: `POST /api/media` to save metadata

**Success Criteria**:
- ✅ Three-step upload process
- ✅ Progress indicator during upload
- ✅ Media appears in library after completion

**Failure Indicators**:
- ❌ Direct upload to API (inefficient)
- ❌ Upload fails without error message
- ❌ Metadata not saved

---

### Test 4.2: Media Assignment to Schedule
**Expected**: Associates media with schedule via API

**Steps**:
1. Edit schedule
2. Add media item in content tab
3. Save schedule
4. Verify assignment saved

**Success Criteria**:
- ✅ API includes media IDs in schedule data
- ✅ Assignment persists after refresh

**Failure Indicators**:
- ❌ Media not saved with schedule
- ❌ Assignment lost on reload

---

## Phase 5: Users Menu Validation

### Test 5.1: User Device Assignment
**Expected**: Assigns devices to users via API

**Steps**:
1. Edit user
2. Select devices to assign
3. Save
4. Check Network tab for `POST /api/user/{id}/devices`

**Success Criteria**:
- ✅ API call with device IDs
- ✅ Assignments saved
- ✅ User can only see assigned devices

**Failure Indicators**:
- ❌ No API call
- ❌ Assignment not persisted
- ❌ User sees all devices

---

## Phase 6: QR Codes Menu Validation

### Test 6.1: Generate QR Code
**Expected**: Backend generates QR code data

**Steps**:
1. Click "Generate QR Code"
2. Select device
3. Check Network tab for `POST /api/qrcode`

**Success Criteria**:
- ✅ POST request creates QR code
- ✅ QR code image URL returned
- ✅ Image displays correctly

**Failure Indicators**:
- ❌ Client-side generation only
- ❌ QR code not saved to database
- ❌ Can't regenerate same code

---

## Phase 7: Dashboard Validation

### Test 7.1: Dashboard Statistics
**Expected**: Aggregated data from API

**Steps**:
1. Navigate to dashboard
2. Check Network tab for stats endpoints:
   - `GET /api/dashboard/statistics`
   - `GET /api/device/status-summary`
   - etc.

**Success Criteria**:
- ✅ Multiple API calls for different widgets
- ✅ Real data displayed (not hardcoded)
- ✅ Charts render with actual values

**Failure Indicators**:
- ❌ Fake data (always same numbers)
- ❌ No API calls
- ❌ "No data available" despite having data

---

## Common Issues & Solutions

### Issue: No API Calls Made
**Symptoms**: Network tab empty, mock data displayed
**Causes**:
- Service method not called in component
- React Query hook not used
- Event handler not wired

**Solution**:
1. Check component: Does it call the hook?
2. Check hook: Does it call the service?
3. Check service: Does it use apiClient?

---

### Issue: 404 Not Found
**Symptoms**: API returns 404
**Causes**:
- Endpoint doesn't exist in backend
- Wrong URL path
- Route parameter issue

**Solution**:
1. Check Swagger docs: `http://localhost:5100/swagger`
2. Verify endpoint exists in controller
3. Match frontend path exactly

---

### Issue: 401 Unauthorized
**Symptoms**: All API calls fail with 401
**Causes**:
- JWT token expired or missing
- Auth interceptor not working

**Solution**:
1. Re-login to get fresh token
2. Check localStorage for token
3. Verify apiClient has auth interceptor

---

### Issue: Wrong Data Type
**Symptoms**: API returns data but UI doesn't display
**Causes**:
- Frontend type doesn't match backend DTO
- Property name mismatch (camelCase vs PascalCase)

**Solution**:
1. Compare frontend type to backend DTO
2. Check JSON serialization settings (camelCase configured?)
3. Update type definitions to match

---

## Validation Checklist

Use this checklist after completing each phase:

### Phase 1: Playlists
- [ ] All playlists load from API
- [ ] Create playlist works
- [ ] Edit playlist loads and saves
- [ ] Delete playlist with confirmation
- [ ] Duplicate creates copy
- [ ] Activate/deactivate toggle works
- [ ] Search/filter sends query params
- [ ] Assignment summary displays

### Phase 2: Schedules
- [ ] Create schedule (all tabs) works
- [ ] Edit schedule loads data
- [ ] Delete schedule works
- [ ] Calendar view loads events
- [ ] Conflict detection validates
- [ ] User/device assignment saves
- [ ] Template operations work

### Phase 3: Devices
- [ ] Device list loads
- [ ] Device CRUD works
- [ ] Status updates real-time
- [ ] Registration approval works
- [ ] Group assignment works
- [ ] Device groups CRUD works

### Phase 4: Media
- [ ] Media list loads
- [ ] Upload with presigned URL works
- [ ] Edit metadata saves
- [ ] Delete removes from S3 and DB
- [ ] Filter by type/date works
- [ ] Assignment to schedule/playlist works

### Phase 5: Users
- [ ] User list loads
- [ ] User CRUD works
- [ ] Role assignment works
- [ ] Device assignment works
- [ ] Schedule assignment works
- [ ] Default schedule setting works

### Phase 6: QR Codes
- [ ] QR code list loads
- [ ] Generate QR code works
- [ ] Edit QR code works
- [ ] Delete QR code works
- [ ] Device assignment works

### Phase 7: Dashboard
- [ ] Statistics load from API
- [ ] Device status grid updates
- [ ] Charts display real data
- [ ] Recent activity loads
- [ ] Filters work with API

---

## Performance Validation

### API Response Times
- CRUD operations: < 500ms
- List queries: < 1000ms
- Statistics/aggregations: < 2000ms

### Frontend Performance
- React Query caching active (check devtools)
- Optimistic updates for mutations
- Debounced search (not every keystroke)
- Pagination for large lists

---

## Success Criteria Summary

**Phase is complete when**:
- ✅ All CRUD operations call correct APIs
- ✅ All filters/search send query parameters
- ✅ All actions (duplicate, activate, etc.) work
- ✅ No console errors
- ✅ No 404/500 errors in normal operation
- ✅ Data persists after refresh
- ✅ Optimistic updates + React Query invalidation work
- ✅ Type safety (TypeScript + Zod validation)

**Ready to proceed to next phase**: When all checklist items pass for current phase.
