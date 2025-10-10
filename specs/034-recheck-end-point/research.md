# Research: API Endpoint Audit & Mapping Verification

**Feature**: 034-recheck-end-point  
**Date**: 2025-10-10  
**Status**: Complete

## Overview
This document consolidates research findings for auditing and verifying API endpoint mappings between the Next.js frontend and .NET backend.

---

## 1. Existing Audit Documentation Analysis

### Decision: Leverage existing audit documents as baseline
**Rationale**: The codebase already has comprehensive API integration documentation that provides patterns and known issues.

**Key Documents Found**:
1. **API-RESPONSE-MAPPING-GUIDELINE.md** - Authoritative patterns for response handling
2. **API-UI-INTEGRATION-AUDIT.md** - Previous audit findings
3. **copilot-instructions-ui.instructions.md** - Required compliance patterns
4. **SERVICES-APICLIENT-MIGRATION.md** - Service layer standards

**Alternatives Considered**:
- Starting from scratch without reference: Rejected - would miss institutional knowledge
- Using only copilot instructions: Rejected - too high-level without specific examples

---

## 2. Service File Discovery Strategy

### Decision: File system scan + grep for apiClient calls
**Rationale**: Ensures 100% coverage of all API calls without manual enumeration.

**Approach**:
```bash
# Find all service files
find src/digital-signage-web/src/services -name "*.ts" -type f

# Find all apiClient calls
grep -r "apiClient\.(get|post|put|delete|patch)" src/digital-signage-web/src/services/
```

**Service Files Identified** (~20-30 files):
- Core: authService.ts, userService.ts, userPermissionService.ts
- Media: mediaService.ts, enhancedMediaService.ts, tagService.ts
- Devices: deviceService.ts, deviceDetailService.ts, deviceGroupService.ts
- Hardware: hardwareDetectionService.ts, deviceHardwareProfileService.ts
- Schedules: scheduleService.ts, userScheduleService.ts
- Playlists: playlistService.ts, sceneService.ts
- Analytics: analyticsService.ts, dashboardService.ts, reportsService.ts
- Operations: bulkOperationService.ts, settingsService.ts

**Alternatives Considered**:
- Manual list from memory: Rejected - high risk of missing files
- IDE workspace symbol search: Rejected - not scriptable/repeatable

---

## 3. Backend Controller Mapping Strategy

### Decision: Match frontend endpoints to C# controllers via file naming convention
**Rationale**: ASP.NET Core routing follows predictable patterns (e.g., `/api/media` → `MediaController.cs`)

**Mapping Pattern**:
```
Frontend:             Backend:
/api/auth/*       →   Controllers/AuthController.cs
/api/media/*      →   Controllers/MediaController.cs
/api/devices/*    →   Controllers/DevicesController.cs
/api/playlists/*  →   Controllers/PlaylistController.cs
/api/schedules/*  →   Controllers/ScheduleController.cs
```

**Controller Discovery**:
```bash
find src/DigitalSignage.Api/Controllers -name "*Controller.cs"
```

**Alternatives Considered**:
- Parse OpenAPI/Swagger spec: Rejected - may not be up-to-date
- Runtime API discovery: Rejected - requires running backend

---

## 4. Response Structure Pattern Detection

### Decision: Classify responses into 4 patterns based on backend return types
**Rationale**: Different controller return types require different frontend handling logic.

**Pattern Classification**:

| Backend Return Type | Response Structure | Frontend Handling |
|---------------------|-------------------|-------------------|
| `IEnumerable<T>` | Direct array | `Array.isArray(response.data)` |
| `List<T>` | Direct array | `Array.isArray(response.data)` |
| `PagedResult<T>` | Wrapped object | `response.data.items` |
| `ApiResponse<T>` | Wrapped object | `response.data.data` |
| Single `T` | Single object | Direct access |

**Detection Method**:
1. Read controller method signature
2. Check `ActionResult<TReturn>` generic type
3. Classify into pattern category
4. Verify frontend matches pattern

**Alternatives Considered**:
- Runtime response inspection: Rejected - requires test data setup
- Manual classification: Rejected - error-prone

---

## 5. Validation Checklist Design

### Decision: 7-point checklist per service method
**Rationale**: Covers all requirements from FR-007 through FR-019 in spec.

**Checklist Items**:
1. ✅ **Response Structure Guard**: `Array.isArray()` or null check present
2. ✅ **Fallback Values**: Optional fields have defaults (e.g., `|| 'Untitled'`)
3. ✅ **Property Name Mapping**: Backend DTO field names match frontend access
4. ✅ **Error Handling**: Try-catch block wraps API call
5. ✅ **Error Logging**: Console.error with context present
6. ✅ **Safe Defaults on Error**: Returns empty array/null object, not undefined
7. ✅ **apiClient Usage**: Uses configured client, not direct axios import

**Alternatives Considered**:
- Automated linting rules: Considered for future - requires ESLint plugin development
- TypeScript compiler checks: Rejected - can't detect runtime structure issues

---

## 6. Issue Severity Classification

### Decision: 4-tier severity system aligned with impact
**Rationale**: Prioritizes critical runtime errors over style issues.

**Severity Levels**:
- **CRITICAL**: Will cause runtime crash (e.g., missing `Array.isArray()` guard)
- **HIGH**: Data loss or incorrect display (e.g., wrong property name mapping)
- **MEDIUM**: User experience issue (e.g., missing error message)
- **LOW**: Code style or optimization (e.g., missing debug log)

**Alternatives Considered**:
- Binary (pass/fail): Rejected - loses prioritization information
- 5+ levels: Rejected - over-complicates for this scope

---

## 7. Audit Report Format

### Decision: Markdown table with filterable severity tags
**Rationale**: Human-readable, version-controllable, searchable in GitHub.

**Report Structure**:
```markdown
# API Endpoint Audit Report

## Executive Summary
- Total Services Audited: X
- Total API Calls: Y
- Issues Found: Z (Critical: A, High: B, Medium: C, Low: D)

## Detailed Findings

### [ServiceName]
| Method | Endpoint | Severity | Issue | Fix |
|--------|----------|----------|-------|-----|
| getMedia | GET /api/media | CRITICAL | Missing Array.isArray() | Add guard |
```

**Alternatives Considered**:
- JSON output: Rejected - less readable for team review
- CSV: Rejected - poor for multi-line code examples

---

## 8. Fix Application Strategy

### Decision: Atomic fixes per service file with git commits
**Rationale**: Enables easy rollback if a fix causes issues.

**Fix Workflow**:
1. Audit service file → generate findings
2. Apply fixes following copilot-instructions-ui patterns
3. Run TypeScript compiler check
4. Manual test affected UI pages
5. Git commit with descriptive message
6. Move to next service file

**Fix Pattern Reference**: 
Use patterns from `copilot-instructions-ui.instructions.md` section "API Response Mapping & Data Binding"

**Alternatives Considered**:
- Bulk fixes across all files: Rejected - hard to isolate issues
- Automated code generation: Rejected - requires validation anyway

---

## 9. Testing Validation Approach

### Decision: Manual UI testing + TypeScript compilation + browser console monitoring
**Rationale**: No existing automated integration tests for all endpoints.

**Validation Steps**:
1. **TypeScript Check**: `npm run type-check` must pass
2. **Build Check**: `npm run build` must succeed
3. **Runtime Testing**: Load each affected page in browser
4. **Console Monitoring**: No undefined/null errors in console
5. **Functional Testing**: Verify data displays correctly

**Future Enhancement**: Create automated integration tests (out of scope for this audit)

**Alternatives Considered**:
- Automated E2E tests: Rejected - would delay audit completion
- Unit tests only: Rejected - doesn't catch integration issues

---

## 10. Performance Considerations

### Decision: No performance changes expected
**Rationale**: Audit fixes are adding safety guards, not changing logic.

**Expected Impact**:
- Response time: No change (guards are O(1) checks)
- Bundle size: +1-2KB for additional validation code
- Memory: No change (same data structures)

**Alternatives Considered**:
- Optimize while fixing: Rejected - scope creep risk

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Discovery** | File system scan + grep | 100% coverage guarantee |
| **Mapping** | Convention-based controller matching | Predictable, reliable |
| **Validation** | 7-point checklist | Covers all spec requirements |
| **Severity** | 4-tier system | Prioritizes critical issues |
| **Reporting** | Markdown tables | Readable, version-controlled |
| **Fixing** | Atomic per-file commits | Easy rollback |
| **Testing** | Manual + TypeScript + Console | Pragmatic for audit scope |

---

## Next Steps → Phase 1: Design & Contracts

With research complete, proceed to:
1. Generate data model for audit entities (Endpoint, ServiceMethod, Issue, etc.)
2. Define audit report contract (schema/format)
3. Create quickstart guide for running the audit
4. Update copilot instructions with findings (if needed)
