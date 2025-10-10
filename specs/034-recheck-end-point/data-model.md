# Data Model: API Endpoint Audit

**Feature**: 034-recheck-end-point  
**Date**: 2025-10-10  
**Status**: Complete

## Overview
This document defines the domain entities and their relationships for the API endpoint audit system. These are conceptual models used for organizing audit findings, not database schemas.

---

## Core Entities

### 1. ServiceFile
Represents a TypeScript service file in the frontend codebase.

**Attributes**:
- `filePath: string` - Absolute path to service file (e.g., `/src/services/mediaService.ts`)
- `fileName: string` - File name only (e.g., `mediaService.ts`)
- `domain: string` - Feature domain (e.g., "Media", "Devices", "Auth")
- `methodCount: number` - Total number of API-calling methods
- `totalIssues: number` - Sum of all issues found
- `criticalIssues: number` - Count of CRITICAL severity issues
- `auditStatus: AuditStatus` - Current audit state
- `lastModified: Date` - File modification timestamp

**Relationships**:
- Has many `ServiceMethod`
- Has many `AuditIssue`

**Validation Rules**:
- `filePath` must end with `.ts`
- `fileName` must match pattern `*Service.ts` or `*Api.ts`
- `methodCount` ≥ 0
- `totalIssues` = sum of all related `AuditIssue` entities

**States** (AuditStatus):
- `NOT_STARTED` - File not yet reviewed
- `IN_PROGRESS` - Currently being audited
- `COMPLETED` - Audit finished, issues documented
- `FIXED` - All issues resolved
- `VERIFIED` - Fixes tested and confirmed

---

### 2. ServiceMethod
Represents a single method within a service file that makes an API call.

**Attributes**:
- `id: string` - Unique identifier (e.g., `mediaService.getMedia`)
- `methodName: string` - Function name (e.g., `getMedia`)
- `serviceFile: ServiceFile` - Parent service file reference
- `httpMethod: HttpMethod` - HTTP verb used
- `endpointPath: string` - API endpoint called (e.g., `/api/media`)
- `returnType: string` - TypeScript return type (e.g., `Promise<MediaItem[]>`)
- `lineNumber: number` - Starting line in source file
- `hasTryCatch: boolean` - Error handling present
- `hasArrayGuard: boolean` - `Array.isArray()` check present
- `hasFallbackValues: boolean` - Default values for optional fields
- `usesApiClient: boolean` - Uses configured `apiClient` vs direct axios

**Relationships**:
- Belongs to one `ServiceFile`
- Calls one `BackendEndpoint`
- Has many `AuditIssue`
- Maps to one `ResponseStructure`

**Validation Rules**:
- `methodName` must be valid JavaScript identifier
- `endpointPath` must start with `/api/`
- `lineNumber` > 0
- `httpMethod` in [GET, POST, PUT, DELETE, PATCH]

**Computed Properties**:
- `issueCount: number` - Count of related issues
- `complianceScore: number` - Percentage of checklist items passed (0-100)

---

### 3. BackendEndpoint
Represents a backend API controller endpoint.

**Attributes**:
- `id: string` - Unique identifier (e.g., `MediaController.GetMedia`)
- `controllerName: string` - Controller class name (e.g., `MediaController`)
- `actionMethod: string` - Controller method name (e.g., `GetMedia`)
- `httpMethod: HttpMethod` - HTTP verb
- `route: string` - Full route template (e.g., `/api/media`)
- `returnType: string` - C# return type (e.g., `ActionResult<IEnumerable<MediaDto>>`)
- `dtoType: string` - Response DTO class name (e.g., `MediaDto`)
- `filePath: string` - Controller file path
- `lineNumber: number` - Method definition line

**Relationships**:
- Called by many `ServiceMethod`
- Returns one `ResponseStructure` pattern

**Validation Rules**:
- `controllerName` must end with `Controller`
- `route` must start with `/api/`
- `returnType` must contain `ActionResult<T>`

**Computed Properties**:
- `responsePattern: ResponsePattern` - Derived from `returnType` analysis

---

### 4. ResponseStructure
Represents the pattern/shape of API response data.

**Attributes**:
- `pattern: ResponsePattern` - Classification of response structure
- `description: string` - Human-readable explanation
- `frontendAccess: string` - Code pattern for accessing data (e.g., `response.data`)
- `requiresGuard: boolean` - Whether `Array.isArray()` check needed
- `exampleBackendType: string` - Example C# return type
- `exampleFrontendCode: string` - Example TypeScript handling code

**Pattern Types** (ResponsePattern enum):
- `DIRECT_ARRAY` - Backend returns array directly (`IEnumerable<T>`, `List<T>`)
- `WRAPPED_PAGED` - Paginated response (`PagedResult<T>`)
- `WRAPPED_API_RESPONSE` - Custom wrapper (`ApiResponse<T>`)
- `SINGLE_OBJECT` - Single entity (`T`)
- `ERROR_RESPONSE` - Error structure (4xx, 5xx)

**Relationships**:
- Used by many `ServiceMethod`
- Returned by many `BackendEndpoint`

**Validation Rules**:
- `frontendAccess` must be valid JavaScript expression
- `exampleBackendType` and `exampleFrontendCode` must be non-empty

---

### 5. AuditIssue
Represents a single problem found during audit.

**Attributes**:
- `id: string` - Unique identifier
- `serviceFile: ServiceFile` - File containing issue
- `serviceMethod: ServiceMethod` - Method with issue (optional if file-level)
- `issueType: IssueType` - Category of problem
- `severity: Severity` - Impact level
- `title: string` - Short description
- `description: string` - Detailed explanation
- `currentCode: string` - Problematic code snippet
- `fixedCode: string` - Corrected code snippet
- `lineNumber: number` - Location in file
- `checklistItem: number` - Which validation item failed (1-7)
- `status: IssueStatus` - Resolution state

**Issue Types** (IssueType enum):
- `MISSING_ARRAY_GUARD` - No `Array.isArray()` check
- `MISSING_NULL_CHECK` - No null/undefined guard
- `WRONG_PROPERTY_NAME` - Backend DTO field name mismatch
- `MISSING_FALLBACK_VALUE` - No default for optional field
- `MISSING_ERROR_HANDLER` - No try-catch block
- `MISSING_ERROR_LOG` - No console.error on failure
- `UNSAFE_ERROR_RETURN` - Returns undefined on error
- `DIRECT_AXIOS_IMPORT` - Not using configured `apiClient`
- `MISSING_DEBUG_LOG` - No console.log for debugging

**Severity Levels** (Severity enum):
- `CRITICAL` - Will cause runtime crash
- `HIGH` - Data loss or incorrect display
- `MEDIUM` - User experience degradation
- `LOW` - Code quality or optimization

**Issue Status** (IssueStatus enum):
- `OPEN` - Issue identified, not yet fixed
- `IN_PROGRESS` - Fix being applied
- `FIXED` - Code corrected
- `VERIFIED` - Fix tested and confirmed
- `WONT_FIX` - Accepted exception (with justification)

**Relationships**:
- Belongs to one `ServiceFile`
- Optionally belongs to one `ServiceMethod`
- Results in one `FixAction` (when status = FIXED)

**Validation Rules**:
- `severity` must align with `issueType` (e.g., `MISSING_ARRAY_GUARD` → CRITICAL)
- `currentCode` and `fixedCode` must differ when status = FIXED
- `checklistItem` must be 1-7

---

### 6. FixAction
Represents a corrective change applied to resolve an issue.

**Attributes**:
- `id: string` - Unique identifier
- `issue: AuditIssue` - Issue being resolved
- `filePath: string` - File modified
- `lineStart: number` - First line changed
- `lineEnd: number` - Last line changed
- `oldCode: string` - Original code
- `newCode: string` - Corrected code
- `patternUsed: string` - Reference to guideline pattern applied
- `appliedAt: Date` - Timestamp of fix
- `appliedBy: string` - Who/what applied fix (e.g., "manual", "script")
- `gitCommit: string` - Git commit hash (optional)
- `tested: boolean` - Whether fix was validated
- `rollbackable: boolean` - Whether change can be easily reverted

**Relationships**:
- Resolves one `AuditIssue`
- References one `GuidelinePattern`

**Validation Rules**:
- `oldCode` ≠ `newCode`
- `lineStart` ≤ `lineEnd`
- `tested` must be true before deployment

**Computed Properties**:
- `linesChanged: number` - `lineEnd - lineStart + 1`

---

### 7. GuidelinePattern
Represents a reusable code pattern from guidelines.

**Attributes**:
- `id: string` - Unique identifier
- `name: string` - Pattern name (e.g., "Array Response Guard")
- `category: string` - Pattern category (e.g., "Response Handling")
- `description: string` - What the pattern does
- `codeExample: string` - Example implementation
- `sourceDocument: string` - Where defined (e.g., "copilot-instructions-ui.md")
- `section: string` - Specific section reference
- `applicableIssueTypes: IssueType[]` - Which issues this pattern fixes

**Relationships**:
- Used by many `FixAction`

**Validation Rules**:
- `codeExample` must be valid TypeScript
- `sourceDocument` must exist in repository

---

### 8. AuditReport
Represents the complete audit execution and its results.

**Attributes**:
- `id: string` - Unique identifier
- `startedAt: Date` - Audit start timestamp
- `completedAt: Date` - Audit end timestamp
- `duration: number` - Total time in seconds
- `totalServiceFiles: number` - Files audited
- `totalMethods: number` - Methods reviewed
- `totalEndpoints: number` - Unique backend endpoints
- `totalIssues: number` - Issues found
- `issuesBySeverity: Map<Severity, number>` - Issue count per severity
- `issuesByType: Map<IssueType, number>` - Issue count per type
- `fixesApplied: number` - Issues resolved
- `fixesVerified: number` - Fixes tested
- `complianceScore: number` - Overall percentage (0-100)
- `status: ReportStatus` - Audit execution state

**Report Status** (ReportStatus enum):
- `IN_PROGRESS` - Audit running
- `COMPLETED` - Audit finished
- `FIXES_IN_PROGRESS` - Issues being resolved
- `VALIDATION` - Testing fixes
- `DONE` - All complete and verified

**Relationships**:
- Contains many `ServiceFile`
- Contains many `AuditIssue`
- Contains many `FixAction`

**Validation Rules**:
- `completedAt` ≥ `startedAt`
- `totalIssues` = sum of `issuesBySeverity` values
- `complianceScore` = (totalMethods - totalIssues) / totalMethods * 100

---

## Entity Relationships Diagram

```
┌─────────────────┐
│  AuditReport    │
│  - id           │
│  - startedAt    │
│  - totalIssues  │
└────────┬────────┘
         │ contains
         ├─────────────────┐
         │                 │
    ┌────▼──────────┐ ┌────▼─────────┐
    │  ServiceFile  │ │  AuditIssue  │
    │  - filePath   │ │  - issueType │
    │  - domain     │ │  - severity  │
    └────┬──────────┘ └────┬─────────┘
         │ has                  │ resolves
         │                 ┌────▼────────┐
    ┌────▼─────────────┐  │  FixAction  │
    │  ServiceMethod   │  │  - oldCode  │
    │  - methodName    │  │  - newCode  │
    │  - endpointPath  │  └────┬────────┘
    └────┬─────────────┘       │ uses
         │ calls          ┌────▼──────────────┐
         │                │ GuidelinePattern  │
    ┌────▼──────────────┐ │ - name            │
    │ BackendEndpoint   │ │ - codeExample     │
    │ - controllerName  │ └───────────────────┘
    │ - actionMethod    │
    └────┬──────────────┘
         │ returns
    ┌────▼───────────────┐
    │ ResponseStructure  │
    │ - pattern          │
    │ - frontendAccess   │
    └────────────────────┘
```

---

## State Transitions

### ServiceFile Audit Flow
```
NOT_STARTED → IN_PROGRESS → COMPLETED → FIXED → VERIFIED
                                ↓
                          (if issues found)
```

### AuditIssue Resolution Flow
```
OPEN → IN_PROGRESS → FIXED → VERIFIED
                       ↓
                   (optional)
                   WONT_FIX
```

### AuditReport Progress Flow
```
IN_PROGRESS → COMPLETED → FIXES_IN_PROGRESS → VALIDATION → DONE
```

---

## Example Data Flow

**Scenario**: Auditing `mediaService.ts` method `getMedia()`

1. **Create ServiceFile**:
   - `filePath: /src/services/mediaService.ts`
   - `domain: Media`
   - `auditStatus: NOT_STARTED`

2. **Create ServiceMethod**:
   - `id: mediaService.getMedia`
   - `endpointPath: /api/media`
   - `httpMethod: GET`
   - `returnType: Promise<MediaItem[]>`

3. **Find BackendEndpoint**:
   - `controllerName: MediaController`
   - `actionMethod: GetMedia`
   - `returnType: ActionResult<IEnumerable<MediaDto>>`
   - → Determines `ResponseStructure: DIRECT_ARRAY`

4. **Run Validation Checklist**:
   - Check 1: Array.isArray() → ❌ MISSING
   - Check 2: Fallback values → ✅ PRESENT
   - Check 3: Error handling → ❌ MISSING

5. **Create AuditIssues**:
   - Issue 1: `MISSING_ARRAY_GUARD`, CRITICAL
   - Issue 2: `MISSING_ERROR_HANDLER`, HIGH

6. **Apply FixActions**:
   - Fix 1: Add `Array.isArray(response.data) ? response.data : []`
   - Fix 2: Wrap in try-catch with error logging

7. **Update ServiceFile**:
   - `totalIssues: 2`
   - `criticalIssues: 1`
   - `auditStatus: FIXED`

8. **Verify Fixes**:
   - Run TypeScript check → ✅ PASS
   - Manual UI test → ✅ PASS
   - Update `auditStatus: VERIFIED`

---

## Summary

This data model provides:
- **Traceability**: Every issue traces to source file, method, and line number
- **Actionability**: Each issue has clear fix pattern and verification steps
- **Metrics**: Quantifiable progress via counts, scores, and status transitions
- **Documentation**: Self-documenting audit trail for future reference

The model supports the audit workflow from discovery → validation → fixing → verification while maintaining referential integrity and clear state management.
