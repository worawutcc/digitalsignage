# Quick Start Guide: Menu API Integration Implementation

**Feature**: 033-recheck-action-menu  
**Date**: 2025-10-09  
**Status**: Implementation Ready

## Overview

This guide provides step-by-step instructions for implementing API integration for all 14 sidebar menus, replacing mock data with real API calls. Follow the menu priority order (Tier 1-4) for implementation.

---

## Prerequisites

1. ✅ Backend API controllers verified/created (see `contracts/api-endpoints.md`)
2. ✅ Data models documented (see `data-model.md`)
3. ✅ Frontend service layer structure exists (`src/services/`)
4. ✅ API client configured (`src/lib/api.ts`)
5. ✅ Authentication (JWT) in place

---

## Implementation Workflow

### Standard Pattern for Each Menu

```
1. Verify API Endpoint Exists
   ↓
2. Remove Mock Service File
   ↓
3. Create/Update Real Service File
   ↓
4. Update React Query Hooks
   ↓
5. Update UI Components
   ↓
6. Manual Verification Testing
```

---

## Tier 1: Critical Operations (Implement First)

### 1. Dashboard Menu

**Files to Modify**:
- `src/services/mockDashboardService.ts` → **DELETE**
- `src/services/dashboardService.ts` → **CREATE/UPDATE**
- `src/hooks/useDashboard.ts` → **UPDATE**
- `src/app/(dashboard)/page.tsx` → **VERIFY**

**API Endpoints** (from `contracts/api-endpoints.md`):
- `GET /api/dashboard/summary`
- `GET /api/dashboard/device-status`

**Implementation Steps**:

#### Step 1.1: Create Real Service
```typescript
// src/services/dashboardService.ts
import { apiClient } from '@/lib/api';
import type { DashboardSummary, DeviceStatusGrid } from '@/types';

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const { data } = await apiClient.get<DashboardSummary>('/api/dashboard/summary');
    return data;
  },

  getDeviceStatus: async (): Promise<DeviceStatusGrid> => {
    const { data } = await apiClient.get<DeviceStatusGrid>('/api/dashboard/device-status');
    
    // Data binding validation
    return {
      devices: Array.isArray(data.devices) ? data.devices : [],
      timestamp: data.timestamp || new Date().toISOString()
    };
  }
};
```

#### Step 1.2: Update React Query Hooks
```typescript
// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardService.getSummary,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000
  });
};

export const useDashboardDeviceStatus = () => {
  return useQuery({
    queryKey: ['dashboard', 'device-status'],
    queryFn: dashboardService.getDeviceStatus,
    refetchInterval: 30000,
    staleTime: 10000
  });
};
```

#### Step 1.3: Update Component
```typescript
// src/app/(dashboard)/page.tsx
'use client';

import { useDashboardSummary, useDashboardDeviceStatus } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useDashboardSummary();
  const { data: deviceStatus, isLoading: statusLoading, error: statusError } = useDashboardDeviceStatus();

  if (summaryLoading || statusLoading) return <LoadingSpinner />;
  if (summaryError || statusError) return <ErrorMessage error={summaryError || statusError} />;

  return (
    <div>
      <SummaryCards summary={summary} />
      <DeviceStatusGrid devices={deviceStatus?.devices || []} />
    </div>
  );
}
```

#### Step 1.4: Delete Mock File
```bash
rm src/services/mockDashboardService.ts
```

#### Step 1.5: Manual Verification
- [ ] Dashboard loads without errors
- [ ] Summary cards show correct data
- [ ] Device status grid displays real devices
- [ ] Data refreshes every 30 seconds
- [ ] Error handling works (disconnect backend to test)

---

### 2. Devices Menu

**Files to Modify**:
- `src/services/mockDeviceService.ts` → **DELETE**
- `src/services/deviceService.ts` → **CREATE/UPDATE**
- `src/hooks/useDevices.ts` → **UPDATE**
- `src/app/(dashboard)/devices/page.tsx` → **UPDATE**
- `src/app/(dashboard)/devices/[id]/page.tsx` → **UPDATE**
- `src/app/(dashboard)/devices/new/page.tsx` → **UPDATE**

**API Endpoints**:
- `GET /api/devices` (list with pagination)
- `GET /api/devices/{id}` (detail)
- `POST /api/devices` (create)
- `PUT /api/devices/{id}` (update)
- `DELETE /api/devices/{id}` (delete)

**Implementation Steps**:

#### Step 2.1: Create Real Service
```typescript
// src/services/deviceService.ts
import { apiClient } from '@/lib/api';
import type { Device, DeviceListResponse, CreateDeviceRequest, UpdateDeviceRequest } from '@/types';

export const deviceService = {
  getDevices: async (params: {
    search?: string;
    status?: string;
    groupId?: number;
    sortBy?: string;
    order?: string;
    page?: number;
    pageSize?: number;
  }): Promise<DeviceListResponse> => {
    const { data } = await apiClient.get<DeviceListResponse>('/api/devices', { params });
    
    // Data binding validation
    return {
      items: Array.isArray(data.items) ? data.items : [],
      totalCount: data.totalCount || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 20,
      totalPages: data.totalPages || 1
    };
  },

  getDeviceById: async (id: number): Promise<Device> => {
    const { data } = await apiClient.get<Device>(`/api/devices/${id}`);
    return data;
  },

  createDevice: async (request: CreateDeviceRequest): Promise<Device> => {
    const { data } = await apiClient.post<Device>('/api/devices', request);
    return data;
  },

  updateDevice: async (id: number, request: UpdateDeviceRequest): Promise<Device> => {
    const { data } = await apiClient.put<Device>(`/api/devices/${id}`, request);
    return data;
  },

  deleteDevice: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/devices/${id}`);
  }
};
```

#### Step 2.2: Update React Query Hooks
```typescript
// src/hooks/useDevices.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceService } from '@/services/deviceService';
import { toast } from 'sonner';

export const useDevices = (params: any) => {
  return useQuery({
    queryKey: ['devices', params],
    queryFn: () => deviceService.getDevices(params),
    keepPreviousData: true
  });
};

export const useDevice = (id: number) => {
  return useQuery({
    queryKey: ['devices', id],
    queryFn: () => deviceService.getDeviceById(id),
    enabled: !!id
  });
};

export const useCreateDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deviceService.createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Device created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create device');
    }
  });
};

export const useUpdateDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      deviceService.updateDevice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['devices', variables.id] });
      toast.success('Device updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update device');
    }
  });
};

export const useDeleteDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deviceService.deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Device deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete device');
    }
  });
};
```

#### Step 2.3: Update List Page
```typescript
// src/app/(dashboard)/devices/page.tsx
'use client';

import { useState } from 'react';
import { useDevices, useDeleteDevice } from '@/hooks/useDevices';
import { DataTable } from '@/components/ui/data-table';

export default function DevicesPage() {
  const [params, setParams] = useState({
    page: 1,
    pageSize: 20,
    search: '',
    status: '',
    sortBy: 'name',
    order: 'asc'
  });

  const { data, isLoading, error } = useDevices(params);
  const deleteMutation = useDeleteDevice();

  const handleDelete = async (id: number) => {
    if (confirm('Delete this device?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <PageHeader title="Devices" />
      <SearchBar onSearch={(search) => setParams({ ...params, search, page: 1 })} />
      <DataTable
        data={data?.items || []}
        columns={deviceColumns}
        loading={isLoading}
        pagination={{
          page: data?.page || 1,
          pageSize: data?.pageSize || 20,
          totalPages: data?.totalPages || 1,
          onPageChange: (page) => setParams({ ...params, page })
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

#### Step 2.4: Manual Verification
- [ ] Device list loads with pagination
- [ ] Search filters devices correctly
- [ ] Status filter works
- [ ] Sorting works (click column headers)
- [ ] Create device form submits successfully
- [ ] Edit device form updates correctly
- [ ] Delete device removes from list
- [ ] Error messages display for validation errors

---

### 3. Media Menu

**Files to Modify**:
- `src/services/mockMediaService.ts` → **DELETE**
- `src/services/mediaService.ts` → **UPDATE** (remove USE_MOCK_MEDIA_SERVICE flag)
- `src/hooks/useMedia.ts` → **VERIFY**
- `src/app/(dashboard)/media/page.tsx` → **VERIFY**
- `src/components/media/MediaUploadDialog.tsx` → **VERIFY**

**API Endpoints**:
- `GET /api/media`
- `GET /api/media/{id}`
- `POST /api/media/upload` (presigned URL workflow)
- `POST /api/media/{id}/confirm-upload`
- `PUT /api/media/{id}`
- `DELETE /api/media/{id}`

**Implementation Steps**:

#### Step 3.1: Update Media Service (Remove Mock Flag)
```typescript
// src/services/mediaService.ts
import { apiClient } from '@/lib/api';
import axios from 'axios';

// REMOVE: const USE_MOCK_MEDIA_SERVICE = true;
// DELETE: All mock implementation code

export const mediaService = {
  getMedia: async (params: any) => {
    const { data } = await apiClient.get('/api/media', { params });
    return {
      items: Array.isArray(data.items) ? data.items : [],
      totalCount: data.totalCount || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 20,
      totalPages: data.totalPages || 1
    };
  },

  uploadMedia: async (file: File, metadata: any) => {
    // Step 1: Request presigned URL
    const { data: presignedData } = await apiClient.post('/api/media/upload', {
      fileName: file.name,
      fileType: metadata.fileType || 'image',
      fileSize: file.size,
      contentType: file.type
    });

    // Step 2: Upload to S3
    await axios.put(presignedData.uploadUrl, file, {
      headers: { 'Content-Type': file.type }
    });

    // Step 3: Confirm upload
    const { data: confirmedMedia } = await apiClient.post(
      `/api/media/${presignedData.mediaId}/confirm-upload`,
      {
        name: metadata.name,
        description: metadata.description,
        tagIds: metadata.tagIds || []
      }
    );

    return confirmedMedia;
  },

  updateMedia: async (id: number, updates: any) => {
    const { data } = await apiClient.put(`/api/media/${id}`, updates);
    return data;
  },

  deleteMedia: async (id: number) => {
    await apiClient.delete(`/api/media/${id}`);
  }
};
```

#### Step 3.2: Verify Upload Dialog
```typescript
// src/components/media/MediaUploadDialog.tsx
'use client';

import { useUploadMedia } from '@/hooks/useMedia';
import { toast } from 'sonner';

export function MediaUploadDialog({ open, onClose }: Props) {
  const uploadMutation = useUploadMedia();

  const handleUpload = async (file: File, metadata: any) => {
    try {
      await uploadMutation.mutateAsync({ file, metadata });
      toast.success('Media uploaded successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Upload form with progress bar */}
      <UploadForm onSubmit={handleUpload} uploading={uploadMutation.isPending} />
    </Dialog>
  );
}
```

#### Step 3.3: Delete Mock File
```bash
rm src/services/mockMediaService.ts
```

#### Step 3.4: Manual Verification
- [ ] Media list loads with thumbnails
- [ ] Filter by type works (image/video/html)
- [ ] Tag filtering works
- [ ] Upload dialog opens
- [ ] File selection works
- [ ] Upload progress shows
- [ ] Upload completes successfully
- [ ] New media appears in list
- [ ] Edit media updates metadata
- [ ] Delete media removes file from S3 and database
- [ ] Error handling for large files

---

### 4. Device Registrations Menu

**Files to Modify**:
- `src/app/(dashboard)/device-registrations/pending/page.tsx` → **UPDATE**
- `src/app/(dashboard)/device-registrations/approved/page.tsx` → **UPDATE**
- `src/app/(dashboard)/device-registrations/rejected/page.tsx` → **UPDATE**
- `src/services/deviceRegistrationService.ts` → **VERIFY**
- `src/hooks/useDeviceRegistrations.ts` → **VERIFY**

**API Endpoints**:
- `GET /api/admin/device-registrations?status=Pending`
- `GET /api/admin/device-registrations?status=Approved`
- `GET /api/admin/device-registrations?status=Rejected`
- `POST /api/admin/device-registrations/{id}/approve`
- `POST /api/admin/device-registrations/{id}/reject`

**Implementation Steps**:

#### Step 4.1: Verify Service Exists
```typescript
// src/services/deviceRegistrationService.ts
import { apiClient } from '@/lib/api';

export const deviceRegistrationService = {
  getRegistrations: async (status: string, params: any) => {
    const { data } = await apiClient.get('/api/admin/device-registrations', {
      params: { status, ...params }
    });
    return {
      items: Array.isArray(data.items) ? data.items : [],
      totalCount: data.totalCount || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 20,
      totalPages: data.totalPages || 1
    };
  },

  approve: async (id: number, approvalData: any) => {
    const { data } = await apiClient.post(
      `/api/admin/device-registrations/${id}/approve`,
      approvalData
    );
    return data;
  },

  reject: async (id: number, reason: string) => {
    const { data } = await apiClient.post(
      `/api/admin/device-registrations/${id}/reject`,
      { reason }
    );
    return data;
  }
};
```

#### Step 4.2: Update Pending Page
```typescript
// src/app/(dashboard)/device-registrations/pending/page.tsx
'use client';

import { useDeviceRegistrations, useApproveRegistration } from '@/hooks/useDeviceRegistrations';

export default function PendingRegistrationsPage() {
  const { data, isLoading } = useDeviceRegistrations('Pending', { page: 1, pageSize: 20 });
  const approveMutation = useApproveRegistration();

  const handleApprove = async (id: number, approvalData: any) => {
    await approveMutation.mutateAsync({ id, data: approvalData });
  };

  return (
    <div>
      <PageHeader title="Pending Registrations" count={data?.totalCount || 0} />
      <RegistrationList
        registrations={data?.items || []}
        loading={isLoading}
        onApprove={handleApprove}
      />
    </div>
  );
}
```

#### Step 4.3: Manual Verification
- [ ] Pending tab shows new registrations
- [ ] Approve dialog opens with device groups selection
- [ ] Approve action creates device and updates status
- [ ] Approved tab shows approved devices
- [ ] Reject dialog opens with reason field
- [ ] Reject action updates status with reason
- [ ] Rejected tab shows rejected requests
- [ ] All tab shows all registrations

---

## Tier 2: Operational Features

### 5. Schedules Menu

**Files to Modify**:
- `src/services/mockScheduleService.ts` → **DELETE**
- `src/services/scheduleService.ts` → **CREATE/UPDATE**
- `src/hooks/useSchedules.ts` → **UPDATE**
- `src/app/(dashboard)/schedules/page.tsx` → **UPDATE**

**Key Features**:
- Schedule conflict detection
- Recurrence patterns
- Content linking (media/playlist)

**Implementation Pattern**: Same as Devices (CRUD with additional conflict check endpoint)

---

### 6. Users Menu

**Files to Modify**:
- `src/services/userService.ts` → **CREATE/UPDATE**
- `src/hooks/useUsers.ts` → **CREATE/UPDATE**
- `src/app/(dashboard)/users/page.tsx` → **UPDATE**

**Key Features**:
- Role-based access control
- Password reset workflow
- User activation/deactivation

**Implementation Pattern**: Same as Devices with additional role management

---

### 7. Assignments Menu

**Files to Modify**:
- `src/services/assignmentService.ts` → **CREATE/UPDATE**
- `src/hooks/useAssignments.ts` → **CREATE/UPDATE**
- `src/app/(dashboard)/assignments/page.tsx` → **UPDATE**

**Key Features**:
- Multi-step wizard (target → content → review)
- Bulk assignment support
- Priority management

**Implementation Pattern**: Multi-step form with wizard state management

---

## Tier 3: Supporting Features

### 8-10. Playlists, Device Groups, Analytics

**Implementation Pattern**: Standard CRUD with specialized operations

- **Playlists**: Add/remove media, reorder items
- **Device Groups**: Assign/unassign devices
- **Analytics**: Date range filtering, metric aggregation

---

## Tier 4: Administrative Features

### 11-13. QR Codes, Reports, Settings

**Implementation Pattern**: 
- **QR Codes**: Generate → Download workflow
- **Reports**: Generate → Export workflow
- **Settings**: Category-based grouping

---

## Common Integration Patterns

### Pattern 1: List with Pagination
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['resource', params],
  queryFn: () => service.getList(params),
  keepPreviousData: true
});
```

### Pattern 2: Create/Update Mutation
```typescript
const mutation = useMutation({
  mutationFn: service.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resource'] });
    toast.success('Created successfully');
  }
});
```

### Pattern 3: Delete with Confirmation
```typescript
const handleDelete = async (id: number) => {
  if (confirm('Delete this item?')) {
    await deleteMutation.mutateAsync(id);
  }
};
```

### Pattern 4: Search/Filter/Sort
```typescript
const [params, setParams] = useState({
  search: '',
  sortBy: 'name',
  order: 'asc',
  page: 1
});

const { data } = useQuery({
  queryKey: ['resource', params],
  queryFn: () => service.getList(params)
});
```

### Pattern 5: Multi-step Wizard
```typescript
const [step, setStep] = useState(1);
const [formData, setFormData] = useState({});

const handleNext = (stepData: any) => {
  setFormData({ ...formData, ...stepData });
  setStep(step + 1);
};

const handleSubmit = async () => {
  await mutation.mutateAsync(formData);
};
```

---

## Error Handling Guidelines

### 1. Network Errors
```typescript
if (error) {
  return (
    <ErrorMessage
      title="Failed to load data"
      message={error.response?.data?.detail || 'Network error occurred'}
      retry={() => refetch()}
    />
  );
}
```

### 2. Validation Errors
```typescript
onError: (error: any) => {
  const errors = error.response?.data?.errors;
  if (errors) {
    Object.entries(errors).forEach(([field, messages]) => {
      form.setError(field, { message: (messages as string[]).join(', ') });
    });
  }
}
```

### 3. Authorization Errors
```typescript
if (error.response?.status === 403) {
  toast.error('You do not have permission to perform this action');
  router.push('/dashboard');
}
```

---

## Testing Checklist Template

For each menu implementation, verify:

### Functional Tests
- [ ] List loads with correct data
- [ ] Pagination works (next/previous/page size)
- [ ] Search filters results
- [ ] Sorting works (ascending/descending)
- [ ] Create form validates fields
- [ ] Create form submits successfully
- [ ] Edit form pre-fills with existing data
- [ ] Edit form updates successfully
- [ ] Delete confirmation dialog appears
- [ ] Delete removes item from list

### Error Handling Tests
- [ ] Network error shows error message
- [ ] Validation errors display inline
- [ ] 404 shows "not found" message
- [ ] 403 redirects to dashboard
- [ ] 500 shows generic error message

### Edge Cases
- [ ] Empty list shows empty state
- [ ] Loading state shows spinner
- [ ] Long text truncates correctly
- [ ] Null/undefined values handled
- [ ] Array fields default to empty array

---

## Implementation Priority Order

Follow this exact order to maximize admin workflow efficiency:

1. ✅ **Dashboard** (Critical overview)
2. ✅ **Devices** (Core resource management)
3. ✅ **Media** (Content foundation)
4. ✅ **Device Registrations** (Device onboarding)
5. **Schedules** (Content timing)
6. **Users** (Access control)
7. **Assignments** (Content delivery)
8. **Playlists** (Content sequencing)
9. **Device Groups** (Bulk management)
10. **Analytics** (Performance monitoring)
11. **QR Codes** (Alternative provisioning)
12. **Reports** (Data export)
13. **Settings** (System configuration)

---

## Verification Commands

### Check Mock Services Still Exist
```bash
find src/services -name "mock*.ts" -type f
```

### Check API Client Usage
```bash
grep -r "import.*apiClient" src/services/
```

### Check Direct Axios Usage (Should be none in services/)
```bash
grep -r "import axios from" src/services/
```

---

## Success Criteria

✅ **All 5 mock service files deleted**:
- mockMediaService.ts
- mockDeviceService.ts
- mockPlaylistService.ts
- mockScheduleService.ts
- mockDashboardService.ts

✅ **All 14 menus use real APIs**:
- Every menu has service file using `apiClient`
- Every menu has React Query hooks
- Every menu has working CRUD operations

✅ **Data binding validation**:
- All array responses have `Array.isArray()` checks
- All optional fields have default values
- TypeScript interfaces match backend DTOs

✅ **Error handling**:
- Network errors show retry option
- Validation errors display inline
- Success toasts on mutations
- Loading states on all data fetches

✅ **Manual testing**:
- Each menu tested with real backend
- All workflows verified (create/read/update/delete)
- Edge cases handled (empty states, long text, null values)

---

## Next Steps After Implementation

1. **Update Documentation**:
   - Mark all menus as "API Integrated" in `research.md`
   - Update `plan.md` Phase 1 status to "Complete"
   - Create `IMPLEMENTATION-SUMMARY.md` with completion date

2. **Code Review**:
   - Verify all mock files removed
   - Check apiClient usage consistency
   - Validate TypeScript types
   - Review error handling patterns

3. **Performance Optimization**:
   - Add React Query stale time/cache settings
   - Implement optimistic updates where applicable
   - Add infinite scroll for large lists

4. **Production Readiness**:
   - Test with production-like data volume
   - Verify S3 presigned URLs work
   - Test WebSocket connections (device status)
   - Load test API endpoints

---

## Appendix: Common Issues & Solutions

### Issue 1: Cannot write DateTime with Kind=UTC
**Solution**: Use `DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)` in backend services

### Issue 2: Array mapping error "data.map is not a function"
**Solution**: Add `Array.isArray()` guard before mapping: `Array.isArray(data) ? data.map(...) : []`

### Issue 3: Presigned URL upload fails
**Solution**: Check S3 CORS configuration allows PUT requests from frontend domain

### Issue 4: JWT token expires during session
**Solution**: Implement token refresh logic in API interceptor

### Issue 5: Pagination resets on filter change
**Solution**: Reset page to 1 when changing search/filter params

---

## Contact & Support

For implementation questions:
- Review: `/docs/MENU-API-INTEGRATION-AUDIT.md`
- Backend API patterns: `.github/instructions/copilot-instructions-api.instructions.md`
- Frontend patterns: `.github/instructions/copilot-instructions-ui.instructions.md`
- Data models: `specs/033-recheck-action-menu/data-model.md`
- API contracts: `specs/033-recheck-action-menu/contracts/api-endpoints.md`
