# 🔍 Code Review & UI Requirements - Digital Signage Project

**วันที่**: 2 ตุลาคม 2025  
**Branch**: 017-design-ui-backoffice  
**Feature**: 019-user-based-content (User-Based Content Assignment)

---

## 📊 สรุป Project Overview

### Backend (.NET 8 + PostgreSQL) ✅ **สมบูรณ์ 100%**

**Architecture**: Clean Architecture
- ✅ Domain Layer - Entities, Business Rules
- ✅ Application Layer - Services, DTOs, Interfaces  
- ✅ Infrastructure Layer - EF Core, Repositories, AWS S3
- ✅ API Layer - Controllers, Authentication, Swagger

**Feature 019 Implementation**: **30/32 tasks complete (93.8%)**
- ✅ Database Schema (UserSchedule entity, indexes)
- ✅ Service Layer (UserScheduleService, ContentDeliveryService)
- ✅ API Controllers (4 controllers, 12+ endpoints)
- ✅ Three-Tier Priority System
- ✅ Email Auto-Matching
- ✅ Real-time Change Detection
- ✅ Documentation

**API Endpoints ที่ Backend พร้อมใช้**:
```
Admin Endpoints (JWT Auth):
├─ GET    /api/admin/users/{userId}/schedules
├─ POST   /api/admin/users/{userId}/schedules  
├─ DELETE /api/admin/users/{userId}/schedules
├─ GET    /api/admin/schedules/{scheduleId}/users
├─ PUT    /api/admin/schedules/{scheduleId}/default
├─ POST   /api/device-registration/initiate-qr
├─ POST   /api/device-registration/approve-qr
└─ GET    /api/admin/device-registrations/pending

Device Endpoints (DeviceKey Auth):
├─ GET  /api/device/next-schedule
├─ POST /api/device/heartbeat  
└─ GET  /api/device/current-assignment
```

---

## 🖥️ Frontend (Next.js 15) - **ต้องเพิ่ม UI สำหรับ Feature 019**

### ✅ สิ่งที่มีอยู่แล้ว (Existing UI)

**Pages ที่สร้างแล้ว**:
```
src/digital-signage-web/src/app/
├─ dashboard/page.tsx        ✅ Dashboard with stats
├─ devices/page.tsx          ✅ Device management  
├─ schedules/page.tsx        ✅ Schedule management (แต่ยังไม่มี user assignment)
├─ users/page.tsx            ✅ User & role management
├─ content/page.tsx          ✅ Media library
├─ displays/page.tsx         ✅ Display management
└─ settings/page.tsx         ✅ Settings
```

**Components ที่มีอยู่**:
- ✅ `ScheduleCalendar` - Calendar view for schedules
- ✅ `ScheduleBuilder` - Schedule creation/editing
- ✅ `ConflictDetection` - Schedule conflict detection
- ✅ `UserList` - User listing component
- ✅ `RoleManager` - Role & permission management
- ✅ `DeviceList` - Device listing

**Services ที่มีอยู่**:
- ✅ `userService.ts` - User API calls
- ✅ `scheduleService.ts` - Schedule API calls
- ✅ `deviceService.ts` - Device API calls

---

## 🚨 สิ่งที่ต้องเพิ่มใน Admin UI (Feature 019)

### 1. **User Schedule Assignment Page** 🔴 CRITICAL

**ไฟล์ที่ต้องสร้าง**:
```
src/digital-signage-web/src/app/users/[userId]/schedules/
└─ page.tsx  (NEW)
```

**หน้าที่**:
- แสดงรายการ Schedules ที่ถูก assign ให้ user
- เลือก Schedules หลายตัวเพื่อ assign (replace semantics)
- ลบ assignments ทั้งหมด
- แสดง User info และ assigned devices

**UI Components ที่ต้องมี**:
```tsx
// User Schedule Assignment Page
- UserScheduleList (แสดง assigned schedules)
- ScheduleSelector (เลือก schedules จาก dropdown/modal)
- AssignScheduleButton (Assign schedules with replace warning)
- RemoveAllButton (Remove all assignments)
- UserInfoCard (แสดงข้อมูล user + devices)
```

**Example Structure**:
```tsx
'use client'

export default function UserSchedulesPage({ 
  params 
}: { 
  params: { userId: string } 
}) {
  return (
    <div>
      <h1>Schedule Assignment for {user.name}</h1>
      
      {/* Current Assignments */}
      <AssignedSchedulesList userId={params.userId} />
      
      {/* Assign New Schedules */}
      <ScheduleSelector 
        onAssign={handleAssign}
        replaceMode={true}  // Warning: will replace existing
      />
    </div>
  )
}
```

---

### 2. **Schedule Detail Page Enhancement** 🟡 HIGH PRIORITY

**ไฟล์ที่ต้องแก้**:
```
src/digital-signage-web/src/app/schedules/page.tsx  (UPDATE)
```

**ฟีเจอร์ที่ต้องเพิ่ม**:
- ✨ **Default Schedule Toggle** - ปุ่มสำหรับ mark schedule เป็น default
- 👥 **Assigned Users List** - แสดงว่า schedule นี้ assign ให้ user ไหนบ้าง
- 🎯 **Content Source Indicator** - แสดงว่า schedule เป็น User/Group/Default

**UI Components ที่ต้องเพิ่ม**:
```tsx
// ใน ScheduleList component
<ScheduleCard>
  {/* Existing info */}
  
  {/* NEW: Default Flag Toggle */}
  <DefaultToggle 
    scheduleId={schedule.id}
    isDefault={schedule.isDefault}
    onToggle={handleSetDefault}
  />
  
  {/* NEW: Assigned Users Badge */}
  <AssignedUsersBadge 
    scheduleId={schedule.id}
    count={schedule.assignedUsersCount}
    onClick={() => showUsersList(schedule.id)}
  />
  
  {/* NEW: Priority Indicator */}
  <PriorityBadge 
    type={schedule.contentSource}  // User/Group/Default
  />
</ScheduleCard>
```

---

### 3. **Device Registration with User Identification** 🟡 HIGH PRIORITY

**ไฟล์ที่ต้องสร้าง/แก้**:
```
src/digital-signage-web/src/app/admin/device-registrations/
└─ pending/page.tsx  (NEW)
```

**หน้าที่**:
- แสดงรายการ pending device registrations
- แสดง matched user (auto-match by email)
- อนุมัติ/ปฏิเสธการลงทะเบียน
- มองเห็น requested username + matched user

**UI Components**:
```tsx
<PendingRegistrationsList>
  {registrations.map(reg => (
    <RegistrationCard key={reg.id}>
      <DeviceInfo model={reg.deviceModel} mac={reg.macAddress} />
      
      {/* NEW: User Matching Info */}
      <UserMatchInfo>
        <RequestedUser email={reg.requestedUsername} />
        {reg.matchedUser && (
          <MatchedUserBadge 
            user={reg.matchedUser}
            autoMatched={true}
          />
        )}
      </UserMatchInfo>
      
      <ApproveButton 
        onApprove={() => approve(reg.id, reg.matchedUserId)}
      />
    </RegistrationCard>
  ))}
</PendingRegistrationsList>
```

---

### 4. **User Detail Page Enhancement** 🟢 MEDIUM PRIORITY

**ไฟล์ที่ต้องแก้**:
```
src/digital-signage-web/src/app/users/[userId]/page.tsx  (NEW หรือ UPDATE)
```

**ฟีเจอร์ที่ต้องเพิ่ม**:
- 📅 **Assigned Schedules Section** - quick view ของ schedules ที่ assign ให้
- 📱 **Associated Devices Section** - devices ที่ assign ให้ user นี้
- 🔗 **Quick Assign Button** - ปุ่ม shortcut ไปหน้า schedule assignment

**UI Layout**:
```tsx
<UserDetailPage>
  <UserProfile />
  
  {/* NEW: Assigned Content Section */}
  <ContentAssignmentSection>
    <SchedulesCard 
      userId={userId}
      schedules={userSchedules}
      quickAssignButton={true}
    />
    
    <DevicesCard
      userId={userId}
      devices={assignedDevices}
    />
  </ContentAssignmentSection>
</UserDetailPage>
```

---

### 5. **Dashboard Enhancement** 🟢 MEDIUM PRIORITY

**ไฟล์ที่ต้องแก้**:
```
src/digital-signage-web/src/app/dashboard/page.tsx  (UPDATE)
```

**สถิติที่ต้องเพิ่ม**:
- 📊 **User Assignments Count** - จำนวน users ที่มี schedule assignments
- 🎯 **Content Delivery Stats** - แยกตาม User/Group/Default
- 📈 **Assignment Trends** - กราฟแสดง user assignment trends

**Stats Cards ที่ต้องเพิ่ม**:
```tsx
<DashboardStats>
  {/* Existing stats... */}
  
  {/* NEW: User Assignment Stats */}
  <StatCard
    title="Users with Assigned Content"
    value={stats.usersWithAssignments}
    icon={Users}
    trend={+15}
  />
  
  <StatCard
    title="Active User Schedules"
    value={stats.activeUserSchedules}
    icon={Calendar}
  />
</DashboardStats>
```

---

## 📦 Services ที่ต้องสร้าง/แก้

### 1. **User Schedule Service** 🔴 CRITICAL

**ไฟล์ที่ต้องสร้าง**:
```
src/digital-signage-web/src/features/users/services/userScheduleService.ts  (NEW)
```

**Functions ที่ต้องมี**:
```typescript
export class UserScheduleService {
  // Get user's assigned schedules
  async getUserSchedules(userId: number): Promise<UserSchedule[]>
  
  // Assign schedules to user (REPLACE semantics)
  async assignSchedules(
    userId: number, 
    scheduleIds: number[]
  ): Promise<AssignmentResponse>
  
  // Remove all assignments
  async removeAllSchedules(userId: number): Promise<void>
  
  // Get users assigned to schedule (reverse lookup)
  async getScheduleUsers(scheduleId: number): Promise<User[]>
}
```

---

### 2. **Schedule Service Enhancement** 🟡 HIGH PRIORITY

**ไฟล์ที่ต้องแก้**:
```
src/digital-signage-web/src/features/schedules/services/scheduleService.ts  (UPDATE)
```

**Functions ที่ต้องเพิ่ม**:
```typescript
// เพิ่ม functions ใหม่
export class ScheduleService {
  // ... existing methods ...
  
  // NEW: Set schedule as default
  async setAsDefault(
    scheduleId: number, 
    isDefault: boolean
  ): Promise<Schedule>
  
  // NEW: Get users assigned to schedule
  async getAssignedUsers(scheduleId: number): Promise<User[]>
}
```

---

### 3. **Device Registration Service** 🟡 HIGH PRIORITY

**ไฟล์ที่ต้องสร้าง**:
```
src/digital-signage-web/src/features/devices/services/deviceRegistrationService.ts  (NEW)
```

**Functions**:
```typescript
export class DeviceRegistrationService {
  // Get pending registrations with user matching
  async getPendingRegistrations(): Promise<PendingRegistration[]>
  
  // Approve registration with user assignment
  async approveRegistration(
    registrationId: string,
    assignedUserId?: number
  ): Promise<ApprovalResponse>
}
```

---

## 🎨 UI Components ที่ต้องสร้าง

### Priority: CRITICAL 🔴

1. **UserScheduleAssignment Component**
```tsx
// src/features/users/components/UserScheduleAssignment.tsx
export function UserScheduleAssignment({ userId }: Props) {
  // แสดง + จัดการ schedule assignments
}
```

2. **ScheduleSelector Component**
```tsx
// src/features/schedules/components/ScheduleSelector.tsx
export function ScheduleSelector({ 
  onSelect, 
  selectedIds,
  replaceMode 
}: Props) {
  // Multi-select schedules with search/filter
}
```

3. **DefaultScheduleToggle Component**
```tsx
// src/features/schedules/components/DefaultScheduleToggle.tsx
export function DefaultScheduleToggle({ 
  scheduleId, 
  isDefault,
  onToggle 
}: Props) {
  // Toggle switch + confirmation modal
}
```

### Priority: HIGH 🟡

4. **AssignedUsersList Component**
```tsx
// src/features/schedules/components/AssignedUsersList.tsx
export function AssignedUsersList({ scheduleId }: Props) {
  // List of users assigned to schedule
}
```

5. **PendingRegistrationCard Component**
```tsx
// src/features/devices/components/PendingRegistrationCard.tsx
export function PendingRegistrationCard({ registration }: Props) {
  // Card showing device + matched user + approve/reject
}
```

### Priority: MEDIUM 🟢

6. **ContentSourceBadge Component**
```tsx
// src/features/schedules/components/ContentSourceBadge.tsx
export function ContentSourceBadge({ 
  source  // "User" | "Group" | "Default"
}: Props) {
  // Colored badge showing content priority
}
```

---

## 🔄 React Query Hooks ที่ต้องสร้าง

### User Schedules Hooks
```typescript
// src/features/users/hooks/useUserSchedules.ts

export function useUserSchedules(userId: number) {
  return useQuery(['userSchedules', userId], ...)
}

export function useAssignSchedules() {
  return useMutation(userScheduleService.assignSchedules, {
    onSuccess: () => queryClient.invalidateQueries('userSchedules')
  })
}

export function useRemoveUserSchedules() {
  return useMutation(...)
}

export function useScheduleUsers(scheduleId: number) {
  return useQuery(['scheduleUsers', scheduleId], ...)
}
```

### Schedule Hooks Enhancement
```typescript
// src/features/schedules/hooks/useSchedules.ts (UPDATE)

export function useSetDefaultSchedule() {
  return useMutation(scheduleService.setAsDefault)
}
```

---

## 📋 Priority Checklist

### Phase 1: Critical (ต้องทำก่อน) 🔴
- [ ] สร้าง `UserScheduleService` API calls
- [ ] สร้างหน้า User Schedule Assignment (`/users/[userId]/schedules`)
- [ ] สร้าง `ScheduleSelector` component
- [ ] เพิ่ม Default Schedule Toggle ใน Schedules page
- [ ] เพิ่ม Assigned Users list ใน Schedule detail

### Phase 2: High Priority 🟡  
- [ ] สร้างหน้า Pending Device Registrations
- [ ] สร้าง `PendingRegistrationCard` component
- [ ] เพิ่ม User Matching display
- [ ] เพิ่ม Approval workflow UI

### Phase 3: Medium Priority 🟢
- [ ] เพิ่ม Assigned Schedules section ใน User detail
- [ ] เพิ่ม Content Source badges
- [ ] เพิ่ม Dashboard stats
- [ ] เพิ่ม Assignment trends graphs

---

## 🧪 Testing Requirements

### Unit Tests ที่ต้องเพิ่ม
```typescript
// User Schedule Service Tests
describe('UserScheduleService', () => {
  test('should assign schedules with replace semantics')
  test('should remove all assignments')
  test('should get assigned users for schedule')
})

// Component Tests
describe('ScheduleSelector', () => {
  test('should show replace warning')
  test('should handle multi-select')
})
```

### Integration Tests
```typescript
// User Schedule Assignment Flow
describe('User Schedule Assignment', () => {
  test('should complete full assignment workflow')
  test('should update UI after assignment')
  test('should handle API errors gracefully')
})
```

---

## 📚 Documentation ที่ต้องเพิ่ม

### 1. User Guide
```markdown
## How to Assign Schedules to Users

1. Navigate to Users page
2. Select a user
3. Click "Assign Schedules" 
4. Select schedules (will replace existing)
5. Click "Save"

**Note**: Assignment uses REPLACE semantics, not append.
```

### 2. API Integration Guide
```markdown
## Feature 019 API Integration

### Endpoints
- GET /api/admin/users/{userId}/schedules
- POST /api/admin/users/{userId}/schedules
- PUT /api/admin/schedules/{scheduleId}/default
```

---

## 🎯 สรุป: สิ่งที่ต้องทำใน UI

### Files ที่ต้องสร้างใหม่ (16 files):

**Pages** (3):
1. `/users/[userId]/schedules/page.tsx`
2. `/admin/device-registrations/pending/page.tsx`
3. `/users/[userId]/page.tsx` (user detail)

**Services** (2):
4. `features/users/services/userScheduleService.ts`
5. `features/devices/services/deviceRegistrationService.ts`

**Components** (6):
6. `features/users/components/UserScheduleAssignment.tsx`
7. `features/schedules/components/ScheduleSelector.tsx`
8. `features/schedules/components/DefaultScheduleToggle.tsx`
9. `features/schedules/components/AssignedUsersList.tsx`
10. `features/schedules/components/ContentSourceBadge.tsx`
11. `features/devices/components/PendingRegistrationCard.tsx`

**Hooks** (3):
12. `features/users/hooks/useUserSchedules.ts`
13. `features/schedules/hooks/useDefaultSchedule.ts`
14. `features/devices/hooks/useDeviceRegistrations.ts`

**Types** (2):
15. `features/users/types/userSchedule.ts`
16. `features/devices/types/registration.ts`

### Files ที่ต้องแก้ไข (5 files):

1. `app/schedules/page.tsx` - เพิ่ม default toggle + assigned users
2. `app/dashboard/page.tsx` - เพิ่ม user assignment stats
3. `features/schedules/services/scheduleService.ts` - เพิ่ม setAsDefault method
4. `components/layouts/Sidebar.tsx` - อาจต้องเพิ่ม menu items
5. `types/api.ts` - เพิ่ม types ใหม่

---

## 💡 Recommendations

### Best Practices
1. ✅ **ใช้ React Query** สำหรับ data fetching + caching
2. ✅ **ใช้ Zod** สำหรับ form validation
3. ✅ **ใช้ TypeScript** strict mode
4. ✅ **แยก Server/Client Components** ตาม Next.js 15 best practices
5. ✅ **Error Handling** - แสดง toast notifications เมื่อเกิด error

### Performance
1. 🚀 **Lazy load** ScheduleSelector modal
2. 🚀 **Debounce** search inputs
3. 🚀 **Virtualize** long lists (100+ items)
4. 🚀 **Optimize** re-renders with React.memo

### UX Improvements
1. 💡 **Warning Modal** เมื่อ assign schedules (replace semantics)
2. 💡 **Loading States** สำหรับทุก async operations
3. 💡 **Empty States** เมื่อไม่มีข้อมูล
4. 💡 **Success Toast** หลัง assign/remove สำเร็จ

---

## ✅ Conclusion

**Backend**: ✅ **พร้อม 100%** - ทุก API endpoints ใช้งานได้แล้ว

**Frontend**: 🚧 **ต้องเพิ่ม UI ~40%** สำหรับ Feature 019
- Critical: User Schedule Assignment page + components
- High: Device Registration with User Matching
- Medium: Dashboard stats + User detail enhancements

**Estimated Work**: 
- Phase 1 (Critical): ~16-20 ชั่วโมง
- Phase 2 (High): ~8-12 ชั่วโมง  
- Phase 3 (Medium): ~4-6 ชั่วโมง
- **รวมทั้งหมด**: ~28-38 ชั่วโมง

**Next Steps**:
1. เริ่มจาก Phase 1 (Critical) ก่อน
2. ทำ User Schedule Assignment page + components
3. Test กับ Backend APIs ที่มีอยู่แล้ว
4. ทำ Phase 2, 3 ต่อเนื่อง

---

**หมายเหตุ**: Backend APIs พร้อมใช้งานแล้วทั้งหมด สามารถเริ่มพัฒนา UI ได้เลย โดยใช้ API endpoints ที่ระบุไว้ข้างต้น
