# Core Menu Mock Data Audit - 9 October 2025

## ✅ Pages Using Real API (Complete)

### 1. Analytics (`/analytics/page.tsx`)
- **Status:** ✅ Complete
- **APIs:** 5 endpoints (overview, content-performance, device-performance, views-by-hour, content-types)
- **Hooks:** useAnalyticsOverview, useContentPerformance, useDevicePerformance, useViewsByHour, useContentTypes
- **Note:** Has old page (`page_old.tsx`) with mock data - can be deleted

### 2. Settings (`/settings/page.tsx`)
- **Status:** ✅ Complete (just completed)
- **APIs:** GET/PUT /api/users/profile, POST /api/users/change-password
- **Hooks:** useUserProfile, useUpdateProfile, useChangePassword
- **Features:** View profile, edit profile, change password

### 3. Reports (`/reports/page.tsx`)
- **Status:** ✅ Complete
- **APIs:** 6 endpoints (templates, generated reports, generate, download-url, delete)
- **Hooks:** useReportTemplates, useGeneratedReports, useGenerateReport, etc.

### 4. Device Detail (`/devices/[deviceId]/page.tsx`)
- **Status:** ✅ Complete
- **APIs:** GET/PUT/DELETE /api/devices/{id}, GET/PUT /api/devices/{id}/configuration
- **Hooks:** useDeviceDetail, useDeviceConfiguration, useUpdateDevice, useDeleteDevice

### 5. Device Registrations (`/device-registrations/**`)
- **Status:** ✅ Uses real API
- **APIs:** Device registration endpoints
- **Pages:** pending, approved, rejected, devices

---

## 🔄 Pages Using Mock Data (Need Work)

### 1. QR Codes (`/qr-codes/page.tsx`)
- **Status:** 🟡 **SKIPPED** - Not core feature, deferred
- **Mock Data:** `mockQRCodes` array (4 items)
- **Action:** Keep mock data for now, implement later if needed

### 2. Schedule Templates (`/schedules/templates/page.tsx`)
- **Status:** ⚠️ Uses mock data
- **Mock Data:** `mockTemplates` array
- **Backend API:** ❌ Not found
- **Priority:** MEDIUM - Templates is a helper feature for schedules
- **Action Needed:** 
  - Check if this is actually used or just placeholder UI
  - If used, create ScheduleTemplate entity & API
  - If not used, consider removing the page

### 3. Media Tags (`/media/tags/page.tsx`)
- **Status:** ⚠️ Uses mock data
- **Mock Data:** `mockTagStats` array
- **Backend API:** ❌ Not found
- **Priority:** LOW - Tags is organizational feature
- **Action Needed:**
  - Check if Media entity has Tags field
  - If yes, create Tags API endpoints
  - If no, consider if tags are needed

---

## ✅ Core Pages to Verify (Likely Using Real API)

### 1. Dashboard (`/dashboard/page.tsx`)
- **Status:** ✓ Need to verify
- **Expected:** Should use real device/schedule data
- **Action:** Quick verification

### 2. Media Library (`/media/page.tsx`)
- **Status:** ✓ Need to verify
- **Expected:** Uses MediaService with S3 integration
- **Action:** Quick verification

### 3. Schedules (`/schedules/page.tsx`)
- **Status:** ✓ Need to verify
- **Expected:** Uses ScheduleService
- **Action:** Quick verification

### 4. Playlists (`/playlists/page.tsx`)
- **Status:** ✓ Need to verify
- **Expected:** Uses PlaylistService
- **Action:** Quick verification

### 5. Devices (`/devices/page.tsx`)
- **Status:** ✓ Need to verify
- **Expected:** Uses DeviceService
- **Action:** Quick verification

### 6. Device Groups (`/device-groups/page.tsx`)
- **Status:** ✓ Need to verify
- **Expected:** Uses DeviceGroupService
- **Action:** Quick verification

### 7. Devices Live View (`/dashboard/devices-live/page.tsx`)
- **Status:** ✓ Need to verify
- **Expected:** Uses real-time device status API
- **Action:** Quick verification

---

## 🎯 Recommended Action Plan

### Phase 1: Verify Core Pages (1-2 hours)
Quick grep/read to verify these pages don't use mock data:
- [ ] Dashboard
- [ ] Media Library
- [ ] Schedules
- [ ] Playlists
- [ ] Devices
- [ ] Device Groups
- [ ] Devices Live View

**Command:**
```bash
grep -l "const mock" src/digital-signage-web/src/app/(dashboard)/{dashboard,media,schedules,playlists,devices,device-groups}/page.tsx
```

### Phase 2: Decide on Non-Core Features
- [ ] **Schedule Templates** - Check if actually used, if not → delete page
- [ ] **Media Tags** - Check if Media has tags field, if not → delete page
- [ ] **QR Codes** - Already skipped ✅

### Phase 3: Clean Up Old Files
- [ ] Delete `analytics/page_old.tsx` (has mock data but not used)
- [ ] Delete any other `*_old.tsx` or `*.backup.tsx` files

### Phase 4: Fix Build Error
- [ ] Fix AnalyticsService.cs to unblock migrations
- [ ] Run any pending migrations

---

## 📊 Current Status Summary

**Pages Audited:** 20 total dashboard pages

**Using Real API:** 5 pages confirmed ✅
- Analytics
- Settings  
- Reports
- Device Detail
- Device Registrations (4 sub-pages)

**Using Mock Data:** 3 pages ⚠️
- QR Codes (skipped - not core)
- Schedule Templates (need decision)
- Media Tags (need decision)

**Need Verification:** 7 pages ✓
- Dashboard
- Media Library
- Schedules
- Playlists
- Devices
- Device Groups
- Devices Live View

---

## 🚀 Next Steps

1. **Immediate:** Verify the 7 core pages don't use mock data (quick grep)
2. **Quick Win:** Delete `analytics/page_old.tsx` and other old files
3. **Decision:** Schedule Templates & Media Tags - use or remove?
4. **Fix Build:** AnalyticsService.cs errors blocking everything
5. **Optional:** Implement Schedule Templates/Media Tags if needed

---

## 📝 Notes

- Most core features likely already use real APIs (based on existing services)
- Schedule Templates & Media Tags might be placeholder UI that was never connected
- QR Codes was a nice-to-have feature, correctly skipped
- Focus should be on verifying core pages work correctly
