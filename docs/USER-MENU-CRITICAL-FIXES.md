# User Menu Critical Issues - FIXED

**Date:** 2025-10-08  
**Status:** ✅ COMPLETED

---

## Summary

Fixed 3 critical route mismatches and added 3 missing backend endpoints for User menu API integration.

---

## Changes Made

### 1. ✅ Added GET /api/auth/me Endpoint

**File:** `src/DigitalSignage.Api/Controllers/AuthController.cs`

**Changes:**
- Added `IUserService` dependency injection
- Added new endpoint: `GET /api/auth/me`
- Returns current authenticated user from JWT token
- Proper error handling for unauthorized and not found cases

```csharp
/// <summary>
/// Get current authenticated user
/// </summary>
[HttpGet("me")]
[Authorize]
[ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
public async Task<ActionResult<UserDto>> GetCurrentUser()
```

**Frontend:** No changes needed - `UserService.getCurrentUser()` already uses correct route

---

### 2. ✅ Added GET /api/users/search Endpoint

**File:** `src/DigitalSignage.Api/Controllers/UsersController.cs`

**Changes:**
- Added new endpoint: `GET /api/users/search`
- Query parameters: `searchTerm`, `role`, `isActive`
- Filters users by email, fullName, role, and active status
- Admin/Manager authorization required

```csharp
/// <summary>
/// Search users with filtering (Admin/Manager only)
/// </summary>
[HttpGet("search")]
[Authorize(Roles = "Admin,Manager")]
[ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers(
    [FromQuery] string? searchTerm = null,
    [FromQuery] string? role = null,
    [FromQuery] bool? isActive = null)
```

**Frontend:** No changes needed - `UserService.search()` already uses correct route

---

### 3. ✅ Added POST /api/users Endpoint

**File:** `src/DigitalSignage.Api/Controllers/UsersController.cs`

**Changes:**
- Added new endpoint: `POST /api/users`
- Creates new user (Admin only)
- Request DTO: `CreateUserRequest`
- Validates email uniqueness
- Returns created user with HTTP 201

```csharp
/// <summary>
/// Create new user (Admin only)
/// </summary>
[HttpPost]
[Authorize(Roles = "Admin")]
[ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request)
```

**Supporting Changes:**
- **DTO:** Created `CreateUserRequest` in `src/DigitalSignage.Application/DTOs/User/UserRequests.cs`
- **Interface:** Added `CreateAsync` method to `IUserService`
- **Service:** Implemented `CreateAsync` in both `Application.Services.UserService` and `Infrastructure.Services.UserService`

**Frontend:** No changes needed - `UserService.create()` already uses correct route

---

### 4. ✅ Fixed Change Password Route

**File:** `src/digital-signage-web/src/services/userService.ts`

**Change:**
```typescript
// BEFORE (WRONG):
static async changePassword(id: number, passwordData: ChangePasswordRequest): Promise<void> {
  await apiClient.post(`/api/users/${id}/change-password`, passwordData)
}

// AFTER (CORRECT):
static async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
  await apiClient.post('/api/users/change-password', passwordData)
}
```

**Note:** Removed `id` parameter since backend uses current user from JWT token

---

### 5. ✅ Fixed Update Profile Route

**File:** `src/digital-signage-web/src/services/userService.ts`

**Change:**
```typescript
// BEFORE (WRONG):
const response = await apiClient.put('/api/auth/profile', updates)

// AFTER (CORRECT):
const response = await apiClient.put('/api/users/profile', updates)
```

**Note:** Removed `email` from update params (not supported in backend profile update)

---

## Files Modified

### Backend
1. `src/DigitalSignage.Api/Controllers/AuthController.cs` - Added GET /api/auth/me
2. `src/DigitalSignage.Api/Controllers/UsersController.cs` - Added search and create endpoints
3. `src/DigitalSignage.Application/DTOs/User/UserRequests.cs` - Added CreateUserRequest DTO
4. `src/DigitalSignage.Application/Interfaces/IUserService.cs` - Added CreateAsync signature
5. `src/DigitalSignage.Application/Services/UserService.cs` - Implemented CreateAsync
6. `src/DigitalSignage.Infrastructure/Services/UserService.cs` - Implemented CreateAsync

### Frontend
1. `src/digital-signage-web/src/services/userService.ts` - Fixed changePassword and updateProfile routes

---

## Build Status

✅ **Backend:** Build successful (11 warnings, 0 errors)
```
dotnet build src/DigitalSignage.Api/DigitalSignage.Api.csproj
Build succeeded.
```

✅ **Frontend:** No syntax errors in modified files

---

## Testing Checklist

### ✅ Backend Endpoints

- [ ] **GET /api/auth/me** - Get current authenticated user
  - Test with valid JWT token
  - Test with invalid token (401)
  - Test with valid token but user deleted (404)

- [ ] **GET /api/users/search** - Search users
  - Test with no filters (return all)
  - Test with searchTerm filter
  - Test with role filter
  - Test with isActive filter
  - Test with combined filters
  - Test authorization (Admin/Manager only)

- [ ] **POST /api/users** - Create new user
  - Test successful creation
  - Test duplicate email (400)
  - Test invalid data (400)
  - Test authorization (Admin only)
  - Verify password is hashed
  - Verify CreatedAt/UpdatedAt timestamps

### ✅ Frontend Integration

- [ ] **Get Current User**
  - Test login and getCurrentUser()
  - Verify user data returned correctly

- [ ] **Search Users**
  - Test search with different filters
  - Verify results match expectations

- [ ] **Create User**
  - Test admin create user flow
  - Verify new user appears in user list

- [ ] **Change Password**
  - Test change password for current user
  - Verify old password validation
  - Verify new password applied

- [ ] **Update Profile**
  - Test update firstName/lastName
  - Verify profile updated correctly

---

## Remaining Issues (Low Priority)

The following issues were identified but NOT fixed in this phase (see USER-MENU-API-AUDIT.md for details):

### Medium Priority
- Missing backend endpoints for:
  - Reset password (self-service)
  - Toggle active status
  - Avatar upload

### Low Priority
- Frontend not using existing backend features:
  - User schedule assignment (3 endpoints)
  - User permissions (7 endpoints)
  - User device associations (7 endpoints)
  - Reset password (admin)
  - Lock user (admin)
  - Get user devices

- Frontend has methods without backend:
  - Role CRUD (create, update, delete by ID)
  - Permissions management
  - Activity logging

---

## Next Steps

1. **Test all fixed endpoints** - Run manual tests for all 5 changes
2. **Update TODO #6** - Create missing frontend services (userScheduleService, userPermissionService, userDeviceAssociationService)
3. **Continue audits** - Audit remaining menus (Device Management, Media, etc.)

---

## References

- **Audit Report:** `docs/USER-MENU-API-AUDIT.md`
- **API Guidelines:** `.github/instructions/copilot-instructions-api.instructions.md`
- **UI Guidelines:** `.github/instructions/copilot-instructions-ui.instructions.md`
