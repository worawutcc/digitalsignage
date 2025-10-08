# UserScheduleService Registration Fix

**Date:** 2025-10-08  
**Issue:** API 500 Error on `/api/admin/schedules` endpoint

## Problem

```
System.InvalidOperationException: Unable to resolve service for type 
'DigitalSignage.Application.Interfaces.IUserScheduleService' 
while attempting to activate 'DigitalSignage.Api.Controllers.ScheduleController'.
```

## Root Cause

The `IUserScheduleService` interface and `UserScheduleService` implementation existed in the codebase, but the service was **not registered** in the dependency injection container.

## Solution

Added service registration in `src/DigitalSignage.Api/Extensions/ApplicationServiceExtensions.cs`:

```csharp
// User Schedule Service (Feature 019)
services.AddScoped<IUserScheduleService, UserScheduleService>();
```

## Location

**File:** `src/DigitalSignage.Api/Extensions/ApplicationServiceExtensions.cs`  
**Line:** Added after UserDeviceAssociation services (around line 67)

## Status

✅ **Fixed** - Hot reload applied successfully  
✅ No build errors  
✅ API running in development mode

## Testing

After the fix, the `/api/admin/schedules` endpoint should now:
- Resolve `IUserScheduleService` correctly
- Return 200 OK with schedule data (or empty array if no data)
- No longer throw `InvalidOperationException`

## Related Services

The `UserScheduleService` also requires:
- `DbContext` (already registered)
- `ILogger<UserScheduleService>` (auto-registered by framework)

No repository interface needed - service uses `DbContext` directly.
