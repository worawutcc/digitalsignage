# API Response Mapping Guideline for UI Development

**Created:** 2025-10-09  
**Purpose:** Best practices for mapping backend API responses to frontend models  
**Related:** `copilot-instructions-ui.instructions.md` section "API Response Mapping & Data Binding"

## Problem Statement

Frontend developers often encounter runtime errors when mapping API responses due to:
1. Incorrect assumptions about response structure (wrapped vs unwrapped)
2. Missing null/undefined checks for optional fields
3. Property name mismatches between backend DTOs and frontend interfaces
4. No validation of response data types

## Real-World Example: Assignment Wizard Content API

### ❌ The Bug
```typescript
// contentApi.ts (WRONG)
export async function getMedia(): Promise<ContentItem[]> {
  const response = await apiClient.get('/api/media');
  return response.data.items.map((media: any) => ({  // ← ERROR: .items doesn't exist!
    id: media.id,
    name: media.fileName,
  }));
}
```

**Error:** `Cannot read properties of undefined (reading 'map')`  
**Cause:** Backend returns array directly, not wrapped in `{ items: [] }`

### ✅ The Fix
```typescript
// contentApi.ts (CORRECT)
export async function getMedia(): Promise<ContentItem[]> {
  try {
    const response = await apiClient.get('/api/media');
    console.log('📦 Media API response:', response.data);  // 1. Debug log
    
    const mediaArray = Array.isArray(response.data) ? response.data : [];  // 2. Guard
    
    return mediaArray.map((media: any) => ({
      id: media.id,
      name: media.fileName || media.name || 'Untitled',  // 3. Fallbacks
      type: 'media' as const,
      description: media.fileType ? 
        `${media.fileType} - ${(media.fileSize / 1024 / 1024).toFixed(2)} MB` : 
        'No description',
      status: media.status || 'unknown',
    }));
  } catch (error) {
    console.error('❌ Failed to fetch media:', error);
    return [];  // 4. Error handling
  }
}
```

## Backend API Response Patterns

### Pattern 1: Direct Array Return
```csharp
// Backend: MediaController.cs
[HttpGet]
public async Task<ActionResult<IEnumerable<MediaDto>>> GetMedia()
{
    var media = await _mediaService.GetAllAsync();
    return Ok(media);  // ← Returns array directly
}
```

**Frontend Handling:**
```typescript
const response = await apiClient.get('/api/media');
const array = Array.isArray(response.data) ? response.data : [];
```

### Pattern 2: Wrapped Response
```csharp
// Backend: PagedMediaController.cs
[HttpGet]
public async Task<ActionResult<PagedResult<MediaDto>>> GetMedia()
{
    var result = new PagedResult<MediaDto> {
        Items = media,
        TotalCount = count
    };
    return Ok(result);  // ← Returns wrapped object
}
```

**Frontend Handling:**
```typescript
const response = await apiClient.get('/api/media/paged');
const array = Array.isArray(response.data?.items) ? response.data.items : [];
```

### Pattern 3: Single Object Return
```csharp
// Backend: MediaController.cs
[HttpGet("{id}")]
public async Task<ActionResult<MediaDto>> GetMedia(int id)
{
    var media = await _mediaService.GetByIdAsync(id);
    return Ok(media);  // ← Returns single object
}
```

**Frontend Handling:**
```typescript
const response = await apiClient.get(`/api/media/${id}`);
const media = response.data || null;
```

## Mandatory Checklist for API Service Functions

### 1. Console Logging
```typescript
console.log('📦 Media API response:', response.data);
```
- Use emoji for visual identification
- Log before mapping to see actual structure

### 2. Array Guard
```typescript
const array = Array.isArray(response.data) ? response.data : [];
```
- Always check if response is array before `.map()`
- Fallback to empty array

### 3. Property Fallbacks
```typescript
{
  id: item.id,
  name: item.fileName || item.name || 'Untitled',
  status: item.status || 'unknown',
  count: item.count || 0,
}
```
- Multiple fallback values for strings
- Default values for numbers
- Use nullish coalescing (`??`) for 0/false values

### 4. Error Handling
```typescript
try {
  // API call and mapping
} catch (error) {
  console.error('❌ Failed to fetch:', error);
  return [];  // Always return expected type
}
```
- Catch all errors
- Log with emoji for visibility
- Return empty array/null/default value

### 5. TypeScript Interfaces
```typescript
export interface MediaItem {
  id: number;
  fileName: string;  // Match backend property names
  fileType: string;
  fileSize: number;
}
```
- Match backend DTO property names exactly
- Document any transformations
- Use strict types (no `any` in interfaces)

## Response Structure Quick Reference

| Backend Type | ASP.NET Return | Frontend Access |
|--------------|----------------|-----------------|
| Array | `Ok(list)` | `response.data` |
| Paged | `Ok(new { items, total })` | `response.data.items` |
| Single | `Ok(item)` | `response.data` |
| Created | `CreatedAtAction(...)` | `response.data` |
| NoContent | `NoContent()` | `response.status === 204` |

## Testing Your API Mapping

### 1. Check Backend Controller
```csharp
// Find the controller method
[HttpGet]
public async Task<ActionResult<IEnumerable<MediaDto>>> GetMedia()
{
    return Ok(media);  // ← What's being returned?
}
```

### 2. Test in Browser Console
```javascript
// Open DevTools Network tab
// Find the API call
// Check Response preview
```

### 3. Add Debug Logs
```typescript
console.log('📦 Raw response:', response);
console.log('📦 Response data:', response.data);
console.log('📦 Is array?', Array.isArray(response.data));
console.log('📦 First item:', response.data?.[0]);
```

### 4. Test Edge Cases
- Empty response: `[]`
- Null response: `null`
- Error response: `{ error: "..." }`
- Missing properties: `{ id: 1 }` (no name)

## Common Errors and Solutions

### Error 1: "Cannot read property 'map' of undefined"
```typescript
// ❌ WRONG
return response.data.items.map(...)

// ✅ CORRECT
const array = Array.isArray(response.data) ? response.data : [];
return array.map(...)
```

### Error 2: "Property 'name' does not exist"
```typescript
// ❌ WRONG
name: media.name  // Backend uses 'fileName'

// ✅ CORRECT
name: media.fileName || media.name || 'Untitled'
```

### Error 3: Empty list shows "No data"
```typescript
// ❌ WRONG - Silent failure
const response = await apiClient.get('/api/media');
return response.data || [];  // No logging

// ✅ CORRECT - Debuggable
const response = await apiClient.get('/api/media');
console.log('📦 Response:', response.data);
const array = Array.isArray(response.data) ? response.data : [];
console.log('✅ Mapped items:', array.length);
return array;
```

## Integration with copilot-instructions-ui.instructions.md

This guideline has been integrated into the main UI instructions file under:
- Section: **API Integration Rules**
- Subsection: **API Response Mapping & Data Binding**

All future UI development must follow these patterns to ensure robust API integration.

## Related Files

- `/src/digital-signage-web/src/features/assignments/api/contentApi.ts` - Reference implementation
- `/src/digital-signage-web/src/features/assignments/api/targetApi.ts` - Reference implementation
- `/.github/instructions/copilot-instructions-ui.instructions.md` - Main UI guidelines
- `/docs/SERVICES-APICLIENT-MIGRATION.md` - API client usage audit

## Enforcement

- ✅ All PR reviews must verify API response mapping follows this guideline
- ✅ New API service functions must include all 5 mandatory checklist items
- ✅ Console logs must be present during development (can remove before production)
- ✅ TypeScript interfaces must match backend DTOs

---
**Last Updated:** 2025-10-09  
**Version:** 1.0  
**Status:** Active
