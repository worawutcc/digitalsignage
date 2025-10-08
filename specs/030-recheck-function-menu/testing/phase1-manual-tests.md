# Phase 1 Playlists - Manual Testing Guide

**Feature:** 030-recheck-function-menu  
**Phase:** 1 - Playlists  
**Test Date:** ___________  
**Tester:** ___________

---

## Prerequisites

### Start Backend API
```bash
cd src/DigitalSignage.Api
dotnet watch run
```
Expected: API running on `https://localhost:7001` or `http://localhost:5001`

### Start Frontend
```bash
cd src/digital-signage-web
npm run dev
```
Expected: Frontend running on `http://localhost:3000`

---

## Test Suite

### Test 1: Update Playlist ✅/❌

**Endpoint:** `PUT /api/playlist/{id}`

#### Using Swagger/Postman:
1. Navigate to `https://localhost:7001/swagger`
2. Find `PUT /api/playlist/{id}`
3. Click "Try it out"
4. Use existing playlist ID (e.g., 1)
5. Send request body:
```json
{
  "name": "Updated Test Playlist",
  "description": "Testing update endpoint",
  "status": 1,
  "isLooped": true,
  "priority": 50
}
```
6. Execute

**Expected Response:** `200 OK` with updated `PlaylistDto`

**Verify:**
- [ ] Status code: 200
- [ ] Response contains updated name
- [ ] Response contains updated fields
- [ ] Database record updated

---

### Test 2: Duplicate Playlist (With Name) ✅/❌

**Endpoint:** `POST /api/playlist/{id}/duplicate`

#### Using Swagger/Postman:
1. Find `POST /api/playlist/{id}/duplicate`
2. Use existing playlist ID
3. Send request body:
```json
{
  "newName": "Duplicated Custom Name"
}
```
4. Execute

**Expected Response:** `201 Created` with new `PlaylistDto`

**Verify:**
- [ ] Status code: 201
- [ ] New playlist created with custom name
- [ ] New ID different from original
- [ ] Status set to Draft
- [ ] All items copied
- [ ] CreatedAt is current time

---

### Test 3: Duplicate Playlist (Auto Name) ✅/❌

**Endpoint:** `POST /api/playlist/{id}/duplicate`

#### Using Swagger/Postman:
1. Same endpoint
2. Send empty body or:
```json
{}
```
3. Execute

**Expected Response:** `201 Created`

**Verify:**
- [ ] Status code: 201
- [ ] New playlist name = `{Original Name} (Copy)`
- [ ] All other fields copied correctly

---

### Test 4: Get Statistics ✅/❌

**Endpoint:** `GET /api/playlist/statistics`

#### Using Swagger/Postman:
1. Find `GET /api/playlist/statistics`
2. No parameters needed
3. Execute

**Expected Response:** `200 OK` with statistics object

**Verify:**
- [ ] Status code: 200
- [ ] `totalPlaylists` matches database count
- [ ] `activePlaylists` count correct
- [ ] `draftPlaylists` count correct
- [ ] `scheduledPlaylists` count correct
- [ ] `archivedPlaylists` includes Inactive + Expired
- [ ] `averageDuration` calculated correctly
- [ ] `totalAssignedDevices` matches assignments

---

### Test 5: Edit Button Navigation ✅/❌

**UI:** Grid View

1. Navigate to `http://localhost:3000/playlists`
2. Ensure playlists loaded (not empty)
3. Click "Edit" button on any playlist card

**Expected Behavior:**
- [ ] Navigates to `/playlists/edit/{id}`
- [ ] URL contains correct playlist ID
- [ ] Edit form loads (or shows not found if page doesn't exist yet)

---

### Test 6: Edit Button Navigation (List View) ✅/❌

**UI:** List View

1. Navigate to `/playlists`
2. Switch to List view (click List icon)
3. Click Edit icon (pencil) in Actions column

**Expected Behavior:**
- [ ] Navigates to `/playlists/edit/{id}`
- [ ] URL contains correct playlist ID

---

### Test 7: Duplicate Button (Grid View) ✅/❌

**UI:** Grid View

1. Navigate to `/playlists`
2. Click "Duplicate" button on any playlist card
3. Wait for operation to complete

**Expected Behavior:**
- [ ] Button shows loading state (disabled)
- [ ] API call to `/api/playlist/{id}/duplicate`
- [ ] Success: New playlist appears in list
- [ ] New name: `{Original Name} (Copy)`
- [ ] React Query cache invalidated
- [ ] List refreshes automatically

---

### Test 8: Play/Pause Button (Grid View) ✅/❌

**UI:** Grid View - Top Right of Card

#### Test Activate:
1. Find playlist with Draft or Inactive status
2. Click Play icon button
3. Observe changes

**Expected Behavior:**
- [ ] Button disabled during mutation
- [ ] API call to `/api/playlist/{id}/activate`
- [ ] Success: Status badge changes to Active
- [ ] Icon changes to Pause
- [ ] Statistics card updates (+1 Active)

#### Test Deactivate:
4. Click Pause icon button (on active playlist)
5. Observe changes

**Expected Behavior:**
- [ ] API call to `/api/playlist/{id}/deactivate`
- [ ] Status badge changes to Inactive
- [ ] Icon changes to Play
- [ ] Statistics card updates (-1 Active)

---

### Test 9: Play/Pause Button (List View) ✅/❌

**UI:** List View - First Action Button

Repeat Test 8 but in List view.

**Expected Behavior:** Same as Test 8

---

### Test 10: Delete Button ✅/❌

**UI:** Both Grid and List Views

1. Click Delete button (Trash icon)
2. Browser confirmation dialog appears

**Expected Behavior:**
- [ ] Confirmation dialog: "Are you sure you want to delete this playlist?"
- [ ] Click Cancel → No action taken
- [ ] Click OK → Deletion proceeds
- [ ] Button disabled during mutation
- [ ] API call to `/api/playlist/{id}`
- [ ] Success: Playlist removed from list
- [ ] Statistics card updates (-1 Total)

---

### Test 11: Statistics Card ✅/❌

**UI:** Dashboard Cards

1. Navigate to `/playlists`
2. Observe statistics cards at top

**Expected Behavior:**
- [ ] Total Playlists card shows count
- [ ] Active card shows active count
- [ ] Assigned Devices card shows count
- [ ] Avg Duration card shows formatted time
- [ ] All counts accurate (compare to database)
- [ ] Cards load from API (not client-side computed)

**Verify API Call:**
- [ ] Network tab shows: `GET /api/playlist/statistics`
- [ ] NOT fetching all playlists for stats

---

### Test 12: React Query Cache Invalidation ✅/❌

**Test Cache After Mutations:**

1. Open DevTools → Network tab
2. Note current playlist count
3. Perform any mutation (create/update/delete/duplicate)
4. Observe network requests

**Expected Behavior:**
- [ ] After create: `GET /api/playlist` called
- [ ] After update: `GET /api/playlist` called
- [ ] After delete: `GET /api/playlist` and `/api/playlist/statistics` called
- [ ] After duplicate: `GET /api/playlist` called
- [ ] After activate/deactivate: Both endpoints called
- [ ] List updates automatically (no manual refresh needed)

---

### Test 13: Error Handling ✅/❌

#### Test 404 Errors:
1. Use Swagger to call `PUT /api/playlist/99999` (non-existent)
2. Expected: `404 Not Found`

#### Test 400 Errors:
3. Send invalid data (e.g., name too long, invalid status)
4. Expected: `400 Bad Request` with validation details

#### Test Network Errors:
5. Stop backend API
6. Try any action in UI
7. Expected: Error message displayed (check frontend error boundaries)

---

### Test 14: Loading States ✅/❌

**UI:** All Mutation Buttons

1. Click any action button (Edit, Duplicate, Delete, Play/Pause)
2. Observe UI during operation (may need slow network to see)

**Expected Behavior:**
- [ ] Button shows disabled state
- [ ] Other UI remains interactive
- [ ] Loading indicator shown (if implemented)
- [ ] Button re-enables after completion

---

### Test 15: Search & Filter ✅/❌

**UI:** Search Bar

1. Navigate to `/playlists`
2. Type in search box: "test"
3. Observe filtered results

**Expected Behavior:**
- [ ] Client-side filtering works
- [ ] Filters by name
- [ ] Filters by description
- [ ] Case-insensitive

**Note:** Server-side search not yet implemented (future enhancement)

---

## Test Results Summary

### Endpoints
- [ ] Test 1: Update Playlist
- [ ] Test 2: Duplicate with name
- [ ] Test 3: Duplicate auto name
- [ ] Test 4: Get Statistics

### UI Actions
- [ ] Test 5: Edit (Grid)
- [ ] Test 6: Edit (List)
- [ ] Test 7: Duplicate (UI)
- [ ] Test 8: Play/Pause (Grid)
- [ ] Test 9: Play/Pause (List)
- [ ] Test 10: Delete
- [ ] Test 11: Statistics Card
- [ ] Test 12: Cache Invalidation
- [ ] Test 13: Error Handling
- [ ] Test 14: Loading States
- [ ] Test 15: Search & Filter

### Overall Status
- **Total Tests:** 15
- **Passed:** ______
- **Failed:** ______
- **Blocked:** ______

---

## Issues Found

| Issue # | Test | Description | Severity | Status |
|---------|------|-------------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## Notes

[Add any additional observations, performance notes, or recommendations here]

---

**Tester Signature:** ___________  
**Date Completed:** ___________  
**Status:** ⏳ Pending / ✅ Complete / ❌ Failed

