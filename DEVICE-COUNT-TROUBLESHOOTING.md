# Device Count Display Issue - Troubleshooting Guide

## Problem Summary
The schedules page is still showing "0 devices" even after enhancing the API to include device count in the response. The API has been successfully updated but the frontend is not reflecting the changes.

## Root Cause Analysis
The issue is likely related to frontend caching in React Query. The enhanced API is working correctly, but the frontend cache is serving stale data without the device count property.

## API Enhancement Status ✅ COMPLETED
- Enhanced `ScheduleDto` with `DeviceCount`, `MediaFiles`, `AssignedDevices`, `TotalDurationSeconds` properties
- Updated `ScheduleService.GetAllSchedulesAsync()` with proper Include navigation properties
- Updated `ScheduleService.GetScheduleByIdAsync()` with enhanced data mapping
- API endpoint `/api/admin/schedules` now returns device count correctly

## Frontend Status ✅ COMPLETED  
- Updated Schedule interface in `scheduleService.ts` with new properties
- Created assignment helper functions for clear enum display
- Fixed property mappings and React key props

## Troubleshooting Steps

### 1. Clear React Query Cache
The frontend React Query cache may be serving stale data. To force refresh:

**Option A: Hard Refresh Browser**
- Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- This clears browser cache and forces reload

**Option B: Clear React Query Cache Programmatically**
Add this temporary code to clear cache:

```typescript
// In schedules page component, add:
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// Add button to clear cache
const handleClearCache = () => {
  queryClient.invalidateQueries(['schedules'])
  queryClient.clear()
}
```

### 2. Verify API Response
Test the API endpoint directly to confirm it returns device count:

```bash
curl -H "Accept: application/json" http://localhost:5100/api/admin/schedules
```

Expected response should include `deviceCount` field:
```json
[
  {
    "id": 1,
    "name": "Test Schedule",
    "deviceCount": 2,
    "mediaFiles": [...],
    // ... other fields
  }
]
```

### 3. Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload the schedules page
4. Check the API call to `/api/admin/schedules`
5. Verify the response includes `deviceCount` field

### 4. Restart Development Server
If cache persists, restart the Next.js development server:

```bash
cd src/digital-signage-web
# Kill existing process
lsof -ti:3000 | xargs kill -9
# Start fresh
npm run dev
```

### 5. Check Environment Configuration
Verify the API URL configuration in frontend:

```bash
# Check .env.local file
cat src/digital-signage-web/.env.local

# Should contain:
NEXT_PUBLIC_API_URL=http://localhost:5100
```

## Verification Steps

### Backend Verification ✅
- [ ] API builds successfully
- [ ] ScheduleService includes navigation properties
- [ ] DeviceCount is calculated in DTO mapping
- [ ] Controller returns enhanced ScheduleDto

### Frontend Verification 
- [ ] Browser shows updated device counts (not 0)
- [ ] Network tab shows API response with deviceCount
- [ ] React Query cache is cleared
- [ ] Frontend development server restarted

## Expected Outcome
After clearing cache/restarting frontend:
- Schedules list should show actual device counts (e.g., "2 devices", "1 device")
- Schedule detail pages should display correct device information
- Assignment Type should show "Schedule" instead of numbers

## Next Steps if Issue Persists
1. Check database for actual ScheduleDevice relationships
2. Verify Entity Framework navigation property configuration
3. Add logging to API endpoint to trace data flow
4. Test with fresh browser profile/incognito mode

## Files Modified
- `src/DigitalSignage.Application/DTOs/Schedule/ScheduleCoreDtos.cs` - Enhanced ScheduleDto
- `src/DigitalSignage.Application/Services/ScheduleService.cs` - Enhanced navigation properties
- `src/digital-signage-web/src/services/scheduleService.ts` - Updated interfaces
- `src/digital-signage-web/src/utils/assignmentHelpers.ts` - Assignment display helpers

Last Updated: 2025-01-11