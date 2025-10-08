# User Menu API Integration Audit

**Date:** 2025-10-08  
**Phase:** 3 - Other Menus (User Management)  
**Status:** ⚠️ MISMATCHES FOUND - NEEDS FIXES

---

## Executive Summary

### Overall Status
- ✅ **Core User CRUD**: Fully integrated
- ✅ **Authentication**: Fully integrated  
- ⚠️ **Missing Endpoints**: 9 frontend methods have no backend match
- ⚠️ **Mismatched Endpoints**: 3 endpoints have route mismatches

---

## Backend API Endpoints (Available)

### AuthController (`/api/auth`)
| Method | Route | Frontend Usage | Status |
|--------|-------|----------------|--------|
| POST | `/register` | ✅ `UserService.login()` (wrong method) | ⚠️ Not used correctly |
| POST | `/login` | ✅ `UserService.login()` | ✅ Matched |
| POST | `/device-login` | ❌ Not used | ⚠️ Device-only |
| POST | `/refresh` | ✅ `UserService.refreshToken()` | ✅ Matched |
| POST | `/logout` | ✅ `UserService.logout()` | ✅ Matched |

### UsersController (`/api/users`)
| Method | Route | Frontend Usage | Status |
|--------|-------|----------------|--------|
| GET | `/profile` | ❌ Not used | ⚠️ Frontend uses `/api/auth/me` |
| PUT | `/profile` | ❌ Not used | ⚠️ Frontend uses `/api/auth/profile` |
| POST | `/change-password` | ❌ Not used | ⚠️ Wrong route |
| GET | `/` (all users) | ✅ `UserService.getAll()` | ✅ Matched |
| GET | `/{id}` | ✅ `UserService.getById()` | ✅ Matched |
| PUT | `/{id}` | ✅ `UserService.update()` | ✅ Matched |
| DELETE | `/{id}` | ✅ `UserService.delete()` | ✅ Matched |
| POST | `/{id}/reset-password` | ❌ Not used | ⚠️ Missing from frontend |
| POST | `/{id}/lock` | ❌ Not used | ⚠️ Missing from frontend |
| GET | `/roles` | ✅ `UserService.getRoles()` | ✅ Matched |
| GET | `/{userId}/devices` | ❌ Not used | ⚠️ Missing from frontend |

### UserScheduleController (`/api/admin/users/{userId}/schedules`)
| Method | Route | Frontend Usage | Status |
|--------|-------|----------------|--------|
| GET | `/api/admin/users/{userId}/schedules` | ❌ Not used | ⚠️ Missing from frontend |
| POST | `/api/admin/users/{userId}/schedules` | ❌ Not used | ⚠️ Missing from frontend |
| DELETE | `/api/admin/users/{userId}/schedules` | ❌ Not used | ⚠️ Missing from frontend |

### UserPermissionController (`/api/user/permissions`)
| Method | Route | Frontend Usage | Status |
|--------|-------|----------------|--------|
| GET | `/accessible-groups` | ❌ Not used | ⚠️ Missing from frontend |
| GET | `/my-permissions` | ❌ Not used | ⚠️ Missing from frontend |
| GET | `/device-group/{deviceGroupId}` | ❌ Not used | ⚠️ Missing from frontend |
| GET | `/device-group/{deviceGroupId}/effective` | ❌ Not used | ⚠️ Missing from frontend |
| GET | `/device-group/{deviceGroupId}/check/{requiredLevel}` | ❌ Not used | ⚠️ Missing from frontend |
| GET | `/device-group/{deviceGroupId}/can-manage` | ❌ Not used | ⚠️ Missing from frontend |
| GET | `/audit` | ❌ Not used | ⚠️ Missing from frontend |

### UserDeviceAssociationController (`/api/user-device-associations`)
| Method | Route | Frontend Usage | Status |
|--------|-------|----------------|--------|
| GET | `/` | ❌ Not used | ⚠️ Missing from frontend |
| GET | `/search` | ❌ Not used | ⚠️ Missing from frontend |
| GET | `/{id}` | ❌ Not used | ⚠️ Missing from frontend |
| POST | `/` | ❌ Not used | ⚠️ Missing from frontend |
| POST | `/bulk` | ❌ Not used | ⚠️ Missing from frontend |
| PUT | `/{id}` | ❌ Not used | ⚠️ Missing from frontend |
| DELETE | `/{id}` | ❌ Not used | ⚠️ Missing from frontend |

---

## Frontend Service Methods (Missing Backend)

### ❌ Methods with NO Backend Match

| Frontend Method | Expected Route | Issue | Priority |
|-----------------|----------------|-------|----------|
| `getCurrentUser()` | `GET /api/auth/me` | ❌ Backend doesn't have this | 🔴 HIGH |
| `search()` | `GET /api/users/search` | ❌ Backend doesn't have this | 🔴 HIGH |
| `create()` | `POST /api/users` | ❌ Backend doesn't have this | 🔴 HIGH |
| `changePassword()` | `POST /api/users/{id}/change-password` | ❌ Wrong route (backend: `/change-password`) | 🟡 MEDIUM |
| `resetPassword()` | `POST /api/auth/reset-password` | ❌ Backend doesn't have this | 🟡 MEDIUM |
| `toggleActive()` | `PATCH /api/users/{id}/toggle-active` | ❌ Backend doesn't have this | 🟡 MEDIUM |
| `getRoleById()` | `GET /api/users/roles/{id}` | ❌ Backend doesn't have this | 🟠 LOW |
| `createRole()` | `POST /api/users/roles` | ❌ Backend doesn't have this | 🟠 LOW |
| `updateRole()` | `PUT /api/users/roles/{id}` | ❌ Backend doesn't have this | 🟠 LOW |
| `deleteRole()` | `DELETE /api/users/roles/{id}` | ❌ Backend doesn't have this | 🟠 LOW |
| `getPermissions()` | `GET /api/users/permissions` | ❌ Backend doesn't have this | 🟠 LOW |
| `checkPermission()` | `GET /api/users/{userId}/permissions/check` | ❌ Backend doesn't have this | 🟠 LOW |
| `getUserActivity()` | `GET /api/users/{userId}/activity` | ❌ Backend doesn't have this | 🟠 LOW |
| `updateProfile()` | `PUT /api/auth/profile` | ❌ Backend uses `/api/users/profile` | 🟡 MEDIUM |
| `uploadAvatar()` | `POST /api/auth/avatar` | ❌ Backend doesn't have this | 🟠 LOW |

---

## Issues Found

### 🔴 Critical Issues (High Priority)

1. **No GET Current User Endpoint (`/api/auth/me`)**
   - Frontend: `UserService.getCurrentUser()` expects `GET /api/auth/me`
   - Backend: Only has `GET /api/users/profile` (requires authentication)
   - **Action Required**: Add `GET /api/auth/me` to `AuthController` OR update frontend to use `/api/users/profile`

2. **No User Search Endpoint**
   - Frontend: `UserService.search()` expects `GET /api/users/search`
   - Backend: Only has `GET /api/users` (all users)
   - **Action Required**: Add search/filter endpoint to `UsersController`

3. **No User Creation Endpoint**
   - Frontend: `UserService.create()` expects `POST /api/users`
   - Backend: Only has `POST /api/auth/register`
   - **Action Required**: Add `POST /api/users` admin endpoint OR update frontend to use `/api/auth/register`

### 🟡 Medium Priority Issues

4. **Change Password Route Mismatch**
   - Frontend: `POST /api/users/{id}/change-password`
   - Backend: `POST /api/users/change-password` (no ID in route)
   - **Action Required**: Update frontend to use correct route

5. **Update Profile Route Mismatch**
   - Frontend: `PUT /api/auth/profile`
   - Backend: `PUT /api/users/profile`
   - **Action Required**: Update frontend to use correct route

6. **Missing Reset Password Endpoint**
   - Frontend: `UserService.resetPassword()` expects `POST /api/auth/reset-password`
   - Backend: Only has `POST /api/users/{id}/reset-password` (admin action)
   - **Action Required**: Add self-service password reset OR clarify admin-only flow

7. **Missing Toggle Active Endpoint**
   - Frontend: `UserService.toggleActive()` expects `PATCH /api/users/{id}/toggle-active`
   - Backend: Has `PUT /api/users/{id}` (full update) and `POST /api/users/{id}/lock`
   - **Action Required**: Use existing update endpoint OR add dedicated toggle

### 🟠 Low Priority (Feature Gaps)

8. **Missing User Schedules Integration**
   - Backend has full `UserScheduleController`
   - Frontend has no corresponding service methods
   - **Action Required**: Add user schedule methods to frontend service

9. **Missing User Permissions Integration**
   - Backend has full `UserPermissionController`
   - Frontend has no corresponding service methods
   - **Action Required**: Add user permission methods to frontend service

10. **Missing User Device Associations Integration**
    - Backend has full `UserDeviceAssociationController`
    - Frontend has no corresponding service methods
    - **Action Required**: Add user device association methods to frontend service

11. **Missing Role CRUD Endpoints**
    - Frontend expects full role management (create, update, delete by ID)
    - Backend only has `GET /api/users/roles` (list all)
    - **Action Required**: Add role CRUD endpoints to backend OR remove from frontend

12. **Missing Permissions Endpoints**
    - Frontend expects `GET /api/users/permissions` and permission checks
    - Backend has separate `UserPermissionController` with different routes
    - **Action Required**: Align permission endpoints between frontend/backend

13. **Missing User Activity Logging**
    - Frontend expects `GET /api/users/{userId}/activity`
    - Backend has no activity tracking endpoint
    - **Action Required**: Add activity tracking endpoint OR remove from frontend

14. **Missing Avatar Upload**
    - Frontend: `UserService.uploadAvatar()` expects `POST /api/auth/avatar`
    - Backend: No avatar upload endpoint
    - **Action Required**: Add avatar upload endpoint OR remove from frontend

15. **Backend Reset Password & Lock User Not Used**
    - Backend has `POST /api/users/{id}/reset-password` and `POST /api/users/{id}/lock`
    - Frontend doesn't use these admin endpoints
    - **Action Required**: Add frontend methods to use these admin features

16. **Backend Get User Devices Not Used**
    - Backend has `GET /api/users/{userId}/devices`
    - Frontend doesn't use this endpoint
    - **Action Required**: Add frontend method to get user devices

---

## Required Actions

### Immediate Fixes (Critical - Must Fix)

1. **Add or Update Get Current User Endpoint**
   ```csharp
   // Option A: Add to AuthController
   [HttpGet("me")]
   [Authorize]
   public async Task<ActionResult<UserDto>> GetCurrentUser()
   
   // Option B: Update frontend to use /api/users/profile
   static async getCurrentUser(): Promise<User> {
     const response = await apiClient.get('/api/users/profile')
     return response.data
   }
   ```

2. **Add User Search Endpoint to UsersController**
   ```csharp
   [HttpGet("search")]
   [Authorize(Roles = "Admin,Manager")]
   [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
   public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers([FromQuery] UserSearchParams searchParams)
   ```

3. **Add User Creation Endpoint to UsersController**
   ```csharp
   [HttpPost]
   [Authorize(Roles = "Admin")]
   [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
   public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request)
   ```

4. **Fix Change Password Route in Frontend**
   ```typescript
   // Current (WRONG):
   await apiClient.post(`/api/users/${id}/change-password`, passwordData)
   
   // Should be:
   await apiClient.post('/api/users/change-password', passwordData)
   ```

5. **Fix Update Profile Route in Frontend**
   ```typescript
   // Current (WRONG):
   const response = await apiClient.put('/api/auth/profile', updates)
   
   // Should be:
   const response = await apiClient.put('/api/users/profile', updates)
   ```

### Medium Priority Additions

6. **Add Missing Backend Admin Features to Frontend**
   ```typescript
   // Add to userService.ts
   static async resetUserPassword(id: number, passwordData: ResetPasswordRequest): Promise<void> {
     await apiClient.post(`/api/users/${id}/reset-password`, passwordData)
   }
   
   static async lockUser(id: number, lockData: LockUserRequest): Promise<void> {
     await apiClient.post(`/api/users/${id}/lock`, lockData)
   }
   
   static async getUserDevices(userId: number): Promise<DeviceDto[]> {
     const response = await apiClient.get(`/api/users/${userId}/devices`)
     return response.data
   }
   ```

7. **Add User Schedule Management**
   ```typescript
   // Create new userScheduleService.ts
   static async getUserSchedules(userId: number): Promise<GetUserSchedulesResponseDto> {
     const response = await apiClient.get(`/api/admin/users/${userId}/schedules`)
     return response.data
   }
   
   static async assignUserSchedules(userId: number, scheduleIds: number[]): Promise<AssignSchedulesResponseDto> {
     const response = await apiClient.post(`/api/admin/users/${userId}/schedules`, { scheduleIds })
     return response.data
   }
   
   static async removeUserSchedules(userId: number): Promise<void> {
     await apiClient.delete(`/api/admin/users/${userId}/schedules`)
   }
   ```

8. **Add User Permission Management**
   ```typescript
   // Create new userPermissionService.ts
   static async getAccessibleDeviceGroups(minimumLevel?: UserPermissionLevel): Promise<DeviceGroupAccessDto[]> {
     const response = await apiClient.get('/api/user/permissions/accessible-groups', { params: { minimumLevel } })
     return response.data
   }
   
   static async getMyPermissions(): Promise<UserPermissionDto[]> {
     const response = await apiClient.get('/api/user/permissions/my-permissions')
     return response.data
   }
   
   // ... other permission methods
   ```

9. **Add User Device Association Management**
   ```typescript
   // Create new userDeviceAssociationService.ts
   static async getAllAssociations(): Promise<UserDeviceAssociationDto[]> {
     const response = await apiClient.get('/api/user-device-associations')
     return response.data
   }
   
   static async searchAssociations(searchParams: SearchUserDeviceAssociationRequest): Promise<UserDeviceAssociationDto[]> {
     const response = await apiClient.get('/api/user-device-associations/search', { params: searchParams })
     return response.data
   }
   
   // ... other association methods
   ```

### Low Priority (Remove or Implement)

10. **Decision Required: Role Management**
    - Either add full role CRUD to backend
    - OR remove role CRUD from frontend (keep only read-only roles)

11. **Decision Required: Activity Logging**
    - Either add activity tracking to backend
    - OR remove from frontend service

12. **Decision Required: Avatar Upload**
    - Either add avatar upload to backend
    - OR remove from frontend service

---

## Testing Checklist

After fixes are implemented:

### Core User Management
- [ ] Login works correctly
- [ ] Get current user works
- [ ] Get all users works (admin)
- [ ] Get user by ID works
- [ ] Search users works (new endpoint)
- [ ] Create user works (new endpoint)
- [ ] Update user works
- [ ] Delete user works
- [ ] Change password works (fixed route)
- [ ] Update profile works (fixed route)

### Admin Features
- [ ] Reset user password works (admin)
- [ ] Lock/unlock user works (admin)
- [ ] Get user devices works

### User Schedules
- [ ] Get user schedules works
- [ ] Assign user schedules works
- [ ] Remove user schedules works

### User Permissions
- [ ] Get accessible device groups works
- [ ] Get my permissions works
- [ ] Check device group permission works
- [ ] Get effective permission works

### User Device Associations
- [ ] Get all associations works
- [ ] Search associations works
- [ ] Create association works
- [ ] Bulk create associations works
- [ ] Update association works
- [ ] Delete association works

---

## Files to Update

### Backend (Add Missing Endpoints)
1. `src/DigitalSignage.Api/Controllers/AuthController.cs` - Add `GET /api/auth/me`
2. `src/DigitalSignage.Api/Controllers/UsersController.cs` - Add search, create endpoints
3. Create DTOs if missing in `src/DigitalSignage.Application/DTOs/User/`

### Frontend (Fix Routes & Add Missing Methods)
1. `src/digital-signage-web/src/services/userService.ts` - Fix routes, add missing methods
2. `src/digital-signage-web/src/services/userScheduleService.ts` - Create new service
3. `src/digital-signage-web/src/services/userPermissionService.ts` - Create new service
4. `src/digital-signage-web/src/services/userDeviceAssociationService.ts` - Create new service

---

## Conclusion

**User menu has significant integration gaps:**
- ✅ Core CRUD operations work
- ⚠️ 3 route mismatches need immediate fixes
- ❌ 9+ frontend methods have no backend
- ❌ 20+ backend endpoints unused by frontend

**Recommendation:** 
1. Fix critical route mismatches first (getCurrentUser, changePassword, updateProfile)
2. Add missing backend endpoints (search, create)
3. Add missing frontend services (schedules, permissions, associations)
4. Remove or implement low-priority features based on product requirements

**Next Phase:** After User menu fixes, continue with Device Management menu audit.
