# Menu API Integration Audit Report
Generated: 2025-01-09

## Executive Summary
This document audits all menu pages in the Digital Signage admin dashboard to identify which are using mock data vs real API integration, and provides actionable steps for complete API integration.

## Audit Findings

### ✅ Already Using API (No Changes Needed)
1. **Dashboard** (`/dashboard`)
   - ✅ Uses `useDashboardStats()` hook
   - API: `GET /api/dashboard/stats`

2. **Devices** (`/devices`)
   - ✅ Uses `useDevices()` hook
   - API: `GET /api/devices`

3. **Device Groups** (`/device-groups`)
   - ✅ Uses `useDeviceGroups()` hook
   - API: `GET /api/devicegroup`

4. **Device Registrations** (`/device-registrations`)
   - ✅ Pending: `usePendingDevices()` → `GET /api/admin/device-registration/pending`
   - ✅ Approved: `useApprovedDevices()` → custom endpoint (needs mapping to `/api/devices`)
   - ✅ Rejected: `useRejectedDevices()` → custom endpoint (needs mapping)
   - ✅ All Devices: `useAllDevices()` → `GET /api/devices`

5. **Media** (`/media`)
   - ✅ Uses `useMedia()` hook
   - API: `GET /api/media`

6. **Playlists** (`/playlists`)
   - ✅ Uses `getAllPlaylists()` service
   - API: `GET /api/playlist`

7. **Schedules** (`/schedules`)
   - ✅ Uses `useSchedules()` hook
   - API: `GET /api/admin/schedules`

---

### ❌ Using Mock Data (Needs API Integration)

#### 1. Analytics Page (`/analytics`) 🔴 HIGH PRIORITY
**Current State:** Full mock data
```typescript
const mockAnalytics: AnalyticsData = {
  totalViews: 15420,
  totalDevices: 25,
  totalContent: 156,
  avgViewTime: 45,
  topContent: [...],
  devicePerformance: [...],
  viewsByHour: [...],
  contentTypes: [...]
}
```

**Available API:**
- ❌ No dedicated analytics endpoint found
- ⚠️ Partial data available from:
  - `GET /api/dashboard/stats` - basic stats
  - `GET /api/media/statistics` - content statistics
  - `GET /api/admin/schedules/statistics` - schedule stats

**Action Required:**
- [ ] Create new `AnalyticsController` with endpoints:
  - `GET /api/analytics/overview` - main dashboard metrics
  - `GET /api/analytics/content-performance` - top content by views
  - `GET /api/analytics/device-performance` - device uptime/health
  - `GET /api/analytics/views-by-hour` - hourly view distribution
  - `GET /api/analytics/content-types` - content type breakdown

---

#### 2. Reports Page (`/reports`) 🔴 HIGH PRIORITY
**Current State:** Full mock data for report templates
```typescript
const reportTemplates: ReportTemplate[] = [
  { id: '1', name: 'Daily Analytics Summary', type: 'analytics', ... },
  { id: '2', name: 'Weekly Device Health Report', type: 'device', ... },
  ...
]
```

**Available API:**
- ❌ No report generation endpoints found

**Action Required:**
- [ ] Create `ReportsController` with endpoints:
  - `GET /api/reports/templates` - list available report templates
  - `POST /api/reports/generate` - generate report on-demand
  - `GET /api/reports/scheduled` - list scheduled reports
  - `POST /api/reports/schedule` - schedule recurring report
  - `GET /api/reports/{id}/download` - download generated report

---

#### 3. QR Codes Page (`/qr-codes`) 🟡 MEDIUM PRIORITY
**Current State:** Full mock data
```typescript
const mockQRCodes: QRCode[] = [
  { id: '1', name: 'Lobby WiFi Access', type: 'wifi', ... },
  { id: '2', name: 'Product Demo Video', type: 'url', ... },
  ...
]
```

**Available API:**
- ⚠️ Partial functionality exists but not exposed:
  - QR code generation likely handled server-side
  - No dedicated QR management endpoints

**Action Required:**
- [ ] Check if QR functionality exists in backend (may be embedded in other features)
- [ ] If not, create `QRCodeController`:
  - `GET /api/qr-codes` - list all QR codes
  - `POST /api/qr-codes` - create new QR code
  - `GET /api/qr-codes/{id}` - get QR code details
  - `PUT /api/qr-codes/{id}` - update QR code
  - `DELETE /api/qr-codes/{id}` - delete QR code
  - `GET /api/qr-codes/{id}/image` - get QR code image
  - `GET /api/qr-codes/statistics` - scan statistics

---

#### 4. Settings Page (`/settings`) 🟢 LOW PRIORITY
**Current State:** Static UI, no data integration
```typescript
// Just displays static cards with buttons
<button>Edit Profile</button>
<button>Security Settings</button>
<button>System Config</button>
```

**Available API:**
- ✅ User profile: `GET /api/users/profile`, `PUT /api/users/profile`
- ✅ Password change: `POST /api/users/change-password`
- ⚠️ System settings: Not exposed

**Action Required:**
- [ ] Integrate existing user profile endpoints
- [ ] Add system configuration endpoints if needed:
  - `GET /api/settings/system` - get system settings
  - `PUT /api/settings/system` - update system settings

---

#### 5. Device Detail Page (`/devices/[deviceId]`) 🟡 MEDIUM PRIORITY
**Current State:** Mock device data and configuration
```typescript
const mockDevice = { id: '1', name: 'Lobby Display 1', ... }
const mockConfiguration: DeviceConfiguration = { ... }
```

**Available API:**
- ✅ Device info: `GET /api/devices/{id}`
- ✅ Configuration: `GET /api/devices/{deviceId}/configuration`
- ✅ Hardware profile: `GET /api/device/{deviceId}/hardware-profile`

**Action Required:**
- [ ] Replace mock data with existing API hooks
- [ ] Create service hooks:
  - `useDevice(deviceId)` → `GET /api/devices/{id}`
  - `useDeviceConfiguration(deviceId)` → `GET /api/devices/{deviceId}/configuration`
  - `useDeviceHardware(deviceId)` → `GET /api/device/{deviceId}/hardware-profile`

---

## API Coverage Summary

### Existing Controllers (48 total)
✅ **Core Features (Good Coverage):**
- `AuthController` - Authentication
- `UsersController` - User management
- `DevicesController` / `DeviceController` - Device management
- `DeviceGroupController` - Device groups with hierarchy
- `MediaController` - Media library
- `PlaylistController` / `SceneController` - Playlists and scenes
- `ScheduleController` - Scheduling system
- `AdminDeviceRegistrationController` - Device approval workflow
- `DashboardController` - Dashboard stats

⚠️ **Partial Coverage:**
- Analytics - basic stats only, no detailed analytics
- Reports - no report generation system
- QR Codes - may exist but not exposed

❌ **Missing Controllers:**
- `AnalyticsController` - detailed analytics and metrics
- `ReportsController` - report generation and scheduling
- `QRCodeController` - QR code management (if needed)
- `SystemSettingsController` - system configuration

---

## Priority Action Plan

### Phase 1: Critical Features (Week 1)
1. **Analytics API** 🔴
   - Create `AnalyticsController`
   - Implement analytics service layer
   - Create DTOs for analytics data
   - Add Entity Framework queries for metrics

2. **Device Detail Page** 🟡
   - Create React Query hooks for device details
   - Replace mock data with API calls
   - Add proper error handling and loading states

### Phase 2: Important Features (Week 2)
3. **Reports API** 🔴
   - Create `ReportsController`
   - Implement report generation service
   - Add PDF/Excel export functionality
   - Create scheduled report system

4. **Settings Page** 🟢
   - Integrate user profile APIs
   - Add system settings if needed

### Phase 3: Optional Features (Week 3)
5. **QR Code System** 🟡
   - Audit existing QR functionality
   - Create dedicated endpoints if needed
   - Integrate with frontend

---

## Type Mapping Requirements

### Analytics DTOs (Need to Create)
```csharp
public class AnalyticsOverviewDto
{
    public int TotalViews { get; set; }
    public int TotalDevices { get; set; }
    public int TotalContent { get; set; }
    public double AvgViewTime { get; set; }
}

public class ContentPerformanceDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Views { get; set; }
    public string Duration { get; set; }
    public int Engagement { get; set; }
}

public class ViewsByHourDto
{
    public string Hour { get; set; }
    public int Views { get; set; }
}
```

### Report DTOs (Need to Create)
```csharp
public class ReportTemplateDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Type { get; set; } // analytics, device, content, user, custom
    public DateTime LastGenerated { get; set; }
    public string Frequency { get; set; } // daily, weekly, monthly, custom
    public string Format { get; set; } // pdf, excel, csv
    public string Status { get; set; } // active, draft, scheduled
    public List<string> Recipients { get; set; }
}
```

---

## Frontend Type Mapping

### Existing (Already Correct)
- ✅ Device → DeviceDto
- ✅ Media → MediaDto  
- ✅ Playlist → PlaylistDto
- ✅ Schedule → ScheduleDto
- ✅ User → UserDto

### Need to Create
- ❌ Analytics types (match backend DTOs)
- ❌ Report types (match backend DTOs)
- ❌ QRCode types (if controller created)

---

## Next Steps

1. **Immediate Actions:**
   - Create `AnalyticsController` (backend)
   - Create analytics service hooks (frontend)
   - Replace mock data in `/analytics` page

2. **This Week:**
   - Fix device detail page mock data
   - Create reports API structure
   - Audit QR code functionality

3. **Documentation:**
   - Update API endpoint list
   - Create service migration guide
   - Document DTO mappings

---

## Notes
- All frontend services must use `apiClient` from `/lib/api.ts`
- Follow React Query patterns for data fetching
- Use proper TypeScript types matching backend DTOs
- Add loading states and error handling for all API calls
- Follow layout group patterns (no wrapper components in pages)
