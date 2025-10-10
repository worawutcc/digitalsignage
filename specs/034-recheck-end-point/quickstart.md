# Quickstart Guide: API Endpoint Audit

**Feature**: 034-recheck-end-point  
**Date**: 2025-10-10  
**Time to Complete**: ~2-3 hours (initial audit), 4-6 hours (fixes + verification)

## Overview
This guide walks you through running a complete API endpoint audit to verify request/response mappings between the Next.js frontend and .NET backend.

---

## Prerequisites

### System Requirements
- Node.js 18+ (for frontend)
- .NET 8 SDK (for backend reference)
- Git (for version control)
- VS Code or similar editor

### Knowledge Requirements
- TypeScript and Next.js basics
- Understanding of REST API concepts
- Familiarity with async/await patterns
- Basic command line usage

### Files You'll Need
- ✅ `copilot-instructions-ui.instructions.md` - Pattern reference
- ✅ `API-RESPONSE-MAPPING-GUIDELINE.md` - Detailed examples
- ✅ `specs/034-recheck-end-point/data-model.md` - Entity definitions
- ✅ `specs/034-recheck-end-point/contracts/audit-report-contract.md` - Report format

---

## Step 1: Prepare Your Environment

### 1.1 Navigate to Project Root
```bash
cd /Users/worawutcc/workspace/worawutcc/digital-signage/digital_signage
```

### 1.2 Ensure Clean Working Directory
```bash
# Check git status
git status

# Stash any uncommitted changes
git stash

# Switch to feature branch
git checkout 034-recheck-end-point
```

### 1.3 Install Dependencies (if needed)
```bash
# Frontend dependencies
cd src/digital-signage-web
npm install
cd ../..
```

---

## Step 2: Discover Service Files

### 2.1 List All Service Files
```bash
# Find all TypeScript service files
find src/digital-signage-web/src/services -name "*.ts" -type f | sort

# Expected output: ~20-30 files
```

**Example Output**:
```
src/digital-signage-web/src/services/analyticsService.ts
src/digital-signage-web/src/services/api/authService.ts
src/digital-signage-web/src/services/api/userPermissionService.ts
src/digital-signage-web/src/services/api/userService.ts
src/digital-signage-web/src/services/bulkOperationService.ts
src/digital-signage-web/src/services/dashboardService.ts
src/digital-signage-web/src/services/deviceDetailService.ts
src/digital-signage-web/src/services/deviceGroupService.ts
src/digital-signage-web/src/services/deviceHardwareProfileService.ts
src/digital-signage-web/src/services/deviceService.ts
src/digital-signage-web/src/services/enhancedMediaService.ts
src/digital-signage-web/src/services/hardwareDetectionService.ts
src/digital-signage-web/src/services/mediaService.ts
src/digital-signage-web/src/services/playlistService.ts
src/digital-signage-web/src/services/reportsService.ts
src/digital-signage-web/src/services/scheduleService.ts
src/digital-signage-web/src/services/settingsService.ts
src/digital-signage-web/src/services/tagService.ts
src/digital-signage-web/src/services/userScheduleService.ts
...
```

### 2.2 Count API Calls
```bash
# Count all apiClient method calls
grep -r "apiClient\.\(get\|post\|put\|delete\|patch\)" src/digital-signage-web/src/services/ | wc -l

# Expected: 100+ API calls
```

---

## Step 3: Initialize Audit Report

### 3.1 Create Report File
```bash
# Create report from template
touch docs/API-ENDPOINT-AUDIT-REPORT.md
```

### 3.2 Add Report Header
Open `docs/API-ENDPOINT-AUDIT-REPORT.md` and add:

```markdown
# API Endpoint Audit Report

**Audit ID**: audit-034-recheck-endpoint-20251010
**Date**: 2025-10-10T14:30:00Z
**Duration**: [TBD]
**Auditor**: [Your Name]
**Status**: IN_PROGRESS

## Executive Summary

### Scope
- **Total Service Files**: [count from step 2.1]
- **Total Service Methods**: [TBD]
- **Total API Endpoints**: [TBD]
- **Total API Calls**: [count from step 2.2]

### Findings
- **Total Issues**: 0 (updating...)
- **Critical**: 0
- **High**: 0
- **Medium**: 0
- **Low**: 0

---

## Detailed Findings

[Will be populated during audit]
```

---

## Step 4: Audit First Service File (Example)

Let's audit `mediaService.ts` as a complete example.

### 4.1 Open Service File
```bash
code src/digital-signage-web/src/services/mediaService.ts
```

### 4.2 Find First API Call Method
Look for methods like:
```typescript
export async function getMedia(): Promise<MediaItem[]> {
  const response = await apiClient.get('/api/media');
  return response.data.map(...);
}
```

### 4.3 Run 7-Point Checklist

#### Checklist for `getMedia()` method:

1. **✅/❌ Response Structure Guard**: Does it use `Array.isArray(response.data)`?
   ```typescript
   // ❌ BAD: Assumes response.data is always array
   return response.data.map(...)
   
   // ✅ GOOD: Guards against non-array
   const array = Array.isArray(response.data) ? response.data : [];
   return array.map(...)
   ```

2. **✅/❌ Fallback Values**: Do optional fields have defaults?
   ```typescript
   // ❌ BAD: No fallback
   name: media.fileName
   
   // ✅ GOOD: Multiple fallbacks
   name: media.fileName || media.name || 'Untitled'
   ```

3. **✅/❌ Property Name Mapping**: Do frontend names match backend DTOs?
   - Check backend controller: `MediaController.cs`
   - Verify DTO property names match

4. **✅/❌ Error Handling**: Is API call wrapped in try-catch?
   ```typescript
   // ❌ BAD: No error handling
   export async function getMedia() {
     const response = await apiClient.get('/api/media');
     return response.data;
   }
   
   // ✅ GOOD: Try-catch with logging
   export async function getMedia() {
     try {
       const response = await apiClient.get('/api/media');
       return response.data;
     } catch (error) {
       console.error('❌ Failed to fetch media:', error);
       return [];
     }
   }
   ```

5. **✅/❌ Error Logging**: Is there `console.error()` with context?

6. **✅/❌ Safe Defaults on Error**: Does catch block return `[]` or `null`?
   ```typescript
   // ❌ BAD: Returns undefined
   catch (error) {
     console.error(error);
   }
   
   // ✅ GOOD: Returns safe default
   catch (error) {
     console.error('❌ Failed to fetch media:', error);
     return []; // Safe empty array
   }
   ```

7. **✅/❌ apiClient Usage**: Uses `apiClient` not direct `axios`?
   ```typescript
   // ❌ BAD: Direct axios import
   import axios from 'axios';
   const response = await axios.get('/api/media');
   
   // ✅ GOOD: Configured apiClient
   import { apiClient } from '@/lib/api';
   const response = await apiClient.get('/api/media');
   ```

### 4.4 Document Findings

For each ❌ failure, add to audit report:

```markdown
### Media Management

#### File: `mediaService.ts`
**Location**: `src/services/mediaService.ts`
**Status**: IN_PROGRESS
**Methods Audited**: 1
**Issues Found**: 3 (1 critical, 2 high)

##### Method: `getMedia`
**Line**: 45
**Endpoint**: `GET /api/media`
**Backend**: `MediaController.GetMedia`
**Return Type**: `Promise<MediaItem[]>`
**Response Pattern**: DIRECT_ARRAY

**Checklist Results**:
- ❌ Response Structure Guard
- ✅ Fallback Values
- ✅ Property Name Mapping
- ❌ Error Handling
- ❌ Error Logging
- ❌ Safe Defaults on Error (N/A - no error handler)
- ✅ apiClient Usage

**Issues**:

###### Issue #001: Missing Array.isArray() Guard
**Severity**: CRITICAL
**Type**: MISSING_ARRAY_GUARD
**Status**: OPEN

**Description**: Method assumes response.data is always an array without verification.

**Current Code** (Lines 47-49):
```typescript
const response = await apiClient.get('/api/media');
return response.data.map((media: any) => ({
  id: media.id,
  name: media.fileName
}));
```

**Issue**: If backend returns null or non-array, `.map()` will throw TypeError.

**Fix**: Add Array.isArray() guard

**Corrected Code**:
```typescript
const response = await apiClient.get('/api/media');
const mediaArray = Array.isArray(response.data) ? response.data : [];
return mediaArray.map((media: any) => ({
  id: media.id,
  name: media.fileName || 'Untitled'
}));
```

**Pattern Used**: Array Response Guard
**Source**: copilot-instructions-ui.md, section "API Response Mapping"
```

---

## Step 5: Verify Backend Endpoint Structure

### 5.1 Find Matching Controller
```bash
# Search for Media controller
find src/DigitalSignage.Api/Controllers -name "*Media*Controller.cs"
```

### 5.2 Open Controller File
```bash
code src/DigitalSignage.Api/Controllers/MediaController.cs
```

### 5.3 Find Matching Action Method
Look for method matching `/api/media` GET endpoint:

```csharp
[HttpGet]
public async Task<ActionResult<IEnumerable<MediaDto>>> GetMedia()
{
    var media = await _mediaService.GetAllAsync();
    return Ok(media);  // ← Returns array directly
}
```

### 5.4 Identify Response Pattern
- Return type: `ActionResult<IEnumerable<MediaDto>>`
- Pattern: **DIRECT_ARRAY** (not wrapped)
- Frontend should expect: `response.data` = array directly

---

## Step 6: Apply Fixes

### 6.1 Make Changes to Service File
Open `src/services/mediaService.ts` and apply fixes:

```typescript
// BEFORE (problematic)
export async function getMedia(): Promise<MediaItem[]> {
  const response = await apiClient.get('/api/media');
  return response.data.map((media: any) => ({
    id: media.id,
    name: media.fileName
  }));
}

// AFTER (fixed)
export async function getMedia(): Promise<MediaItem[]> {
  try {
    const response = await apiClient.get('/api/media');
    console.log('📦 Media API response:', response.data); // Debug log
    
    // Guard: Ensure array
    const mediaArray = Array.isArray(response.data) ? response.data : [];
    
    // Map with fallbacks
    return mediaArray.map((media: any) => ({
      id: media.id,
      name: media.fileName || media.name || 'Untitled', // Fallback
      type: 'media' as const,
      description: media.fileType || 'No description',   // Fallback
    }));
  } catch (error) {
    console.error('❌ Failed to fetch media:', error);
    return []; // Safe default
  }
}
```

### 6.2 Run TypeScript Check
```bash
cd src/digital-signage-web
npm run type-check
```

Expected output: `✓ No TypeScript errors`

### 6.3 Test in Browser
```bash
# Start dev server
npm run dev

# Open browser to http://localhost:3000
# Navigate to Media Library page
# Check browser console for errors
```

### 6.4 Commit Fix
```bash
git add src/digital-signage-web/src/services/mediaService.ts
git commit -m "fix(services): add array guard and error handling to mediaService.getMedia

- Add Array.isArray() guard for response.data
- Wrap in try-catch with error logging
- Add fallback values for optional fields
- Return safe empty array on error

Fixes: Issue #001 (CRITICAL)
Ref: specs/034-recheck-end-point"
```

### 6.5 Update Audit Report
Mark issue as FIXED:

```markdown
###### Issue #001: Missing Array.isArray() Guard
**Severity**: CRITICAL
**Type**: MISSING_ARRAY_GUARD
**Status**: FIXED ✅

...

**Fix Applied**: Yes
**Fix Verified**: Yes
**Git Commit**: abc123def
```

---

## Step 7: Repeat for All Service Files

### 7.1 Create Service File Checklist
```markdown
## Service File Audit Progress

- [ ] analyticsService.ts (0 / X methods)
- [ ] api/authService.ts (0 / X methods)
- [ ] api/userPermissionService.ts (0 / X methods)
- [ ] api/userService.ts (0 / X methods)
- [ ] bulkOperationService.ts (0 / X methods)
- [ ] dashboardService.ts (0 / X methods)
- [ ] deviceDetailService.ts (0 / X methods)
- [ ] deviceGroupService.ts (0 / X methods)
- [ ] deviceHardwareProfileService.ts (0 / X methods)
- [ ] deviceService.ts (0 / X methods)
- [ ] enhancedMediaService.ts (0 / X methods)
- [ ] hardwareDetectionService.ts (0 / X methods)
- [x] mediaService.ts (8 / 8 methods) ✅
- [ ] playlistService.ts (0 / X methods)
- [ ] reportsService.ts (0 / X methods)
- [ ] scheduleService.ts (0 / X methods)
- [ ] settingsService.ts (0 / X methods)
- [ ] tagService.ts (0 / X methods)
- [ ] userScheduleService.ts (0 / X methods)
```

### 7.2 Batch Processing Strategy
Work in logical groups:
1. **Phase 1**: Auth & Users (foundation)
2. **Phase 2**: Core Content (Media, Playlists, Schedules)
3. **Phase 3**: Devices & Hardware
4. **Phase 4**: Analytics & Reports
5. **Phase 5**: Settings & Utilities

---

## Step 8: Generate Final Report

### 8.1 Calculate Metrics
```bash
# Count total issues
grep "**Severity**:" docs/API-ENDPOINT-AUDIT-REPORT.md | wc -l

# Count by severity
grep "**Severity**: CRITICAL" docs/API-ENDPOINT-AUDIT-REPORT.md | wc -l
grep "**Severity**: HIGH" docs/API-ENDPOINT-AUDIT-REPORT.md | wc -l

# Count fixes applied
grep "**Fix Applied**: Yes" docs/API-ENDPOINT-AUDIT-REPORT.md | wc -l
```

### 8.2 Update Executive Summary
Fill in all [TBD] placeholders with actual counts.

### 8.3 Add Recommendations Section
Based on findings, add:
```markdown
## Recommendations

### Immediate Actions (Critical)
1. Fix remaining CRITICAL issues in deviceService.ts (lines 45, 67, 89)
2. Add error handling to analyticsService.ts methods

### Short-term Improvements (High)
1. Standardize fallback values across all services
2. Add TypeScript interfaces for all DTOs

### Long-term Enhancements (Medium/Low)
1. Create ESLint rules for pattern enforcement
2. Add integration tests for critical endpoints
3. Consider API client wrapper with built-in guards
```

---

## Step 9: Final Validation

### 9.1 Run Full Build
```bash
cd src/digital-signage-web
npm run build
```

Expected: Build succeeds with no errors.

### 9.2 Manual Testing Checklist
Test each feature area:

```markdown
### Manual Testing
| Feature Area | Test Status | Notes |
|--------------|-------------|-------|
| Auth/Login | ✅ PASS | No console errors |
| Media Library | ✅ PASS | Data displays correctly |
| Device Management | ✅ PASS | Device list loads |
| Playlists | ✅ PASS | Playlist CRUD works |
| Schedules | ✅ PASS | Schedule wizard functional |
| Analytics | ⚠️ PENDING | Need test data |
```

### 9.3 Browser Console Check
Open DevTools → Console:
- ❌ 0 `TypeError` errors
- ❌ 0 `Cannot read property of undefined` errors
- ✅ Only expected API responses logged

---

## Step 10: Document & Close

### 10.1 Update Progress Tracking
In `specs/034-recheck-end-point/plan.md`:

```markdown
## Progress Tracking

**Phase Status**:
- [x] Phase 0: Research complete
- [x] Phase 1: Design complete
- [x] Phase 2: Task planning complete
- [x] Phase 3: Tasks generated
- [x] Phase 4: Implementation complete ✅
- [x] Phase 5: Validation passed ✅

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)
```

### 10.2 Commit Final Report
```bash
git add docs/API-ENDPOINT-AUDIT-REPORT.md
git add specs/034-recheck-end-point/plan.md
git commit -m "docs: complete API endpoint audit report

- Audited 28 service files with 147 methods
- Found and fixed 89 issues (12 critical, 23 high, 34 medium, 20 low)
- 100% compliance with copilot-instructions-ui patterns
- All fixes tested and verified
- Zero runtime errors in browser console

Closes: 034-recheck-end-point"
```

### 10.3 Create Pull Request
```bash
gh pr create \
  --title "API Endpoint Audit & Request/Response Mapping Fixes" \
  --body "$(cat docs/API-ENDPOINT-AUDIT-REPORT.md)" \
  --label "audit,enhancement,quality"
```

---

## Troubleshooting

### Issue: TypeScript errors after fix
**Solution**: Check property names match backend DTOs exactly.

### Issue: Runtime error persists
**Solution**: Add debug console.log to see actual API response structure.

### Issue: Backend endpoint not found
**Solution**: Check route attribute in controller vs. frontend path.

### Issue: Test data not available
**Solution**: Use Postman/curl to verify backend returns expected format.

---

## Time Estimates

| Activity | Time (per service) | Total (28 services) |
|----------|-------------------|---------------------|
| Audit methods | 5-10 min | 2-5 hours |
| Document issues | 2-5 min/issue | 3-4 hours |
| Apply fixes | 3-5 min/issue | 4-6 hours |
| Test fixes | 5-10 min | 2-3 hours |
| Report writing | N/A | 1-2 hours |
| **TOTAL** | | **12-20 hours** |

**Recommendation**: Spread over 2-3 days with breaks.

---

## Success Criteria

✅ **Audit Complete** when:
- [ ] All 28 service files reviewed
- [ ] All issues documented in report
- [ ] All CRITICAL issues fixed
- [ ] 90%+ of HIGH issues fixed
- [ ] TypeScript compilation passes
- [ ] Build succeeds
- [ ] Manual testing shows no regressions
- [ ] Zero runtime errors in console
- [ ] Report committed to repository

---

**Next Steps**: Use this quickstart to execute the audit following the defined patterns and contracts. Update the report incrementally as you progress through each service file.
