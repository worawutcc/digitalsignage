# Feature Specification: Complete API Endpoint Audit & Request/Response Mapping Verification

**Feature Branch**: `034-recheck-end-point`  
**Created**: 2025-10-10  
**Status**: Draft  
**Input**: User description: "recheck ทุกๆ end point ที่เรียก api ว่า ui blinding mapping request , reponse ตรงกับ api แล้วหรือยัง ถ้ายังแก้เพิ่มเติมให้ด้วย โดยอ้างอิงการทำงานตาม copilot-instructions-ui.instructions.md"

## Execution Flow (main)
```
1. Parse user description from Input
   → Requirement: Audit ALL API endpoint mappings between frontend UI and backend API
2. Extract key concepts from description
   → Actors: Frontend developers, QA testers, API consumers
   → Actions: Audit, verify, fix request/response mappings
   → Data: API endpoints, DTOs, TypeScript interfaces, service files
   → Constraints: Must follow copilot-instructions-ui.instructions.md guidelines
3. For each unclear aspect:
   → [CLARIFIED: Comprehensive audit of all ~20+ service files]
4. Fill User Scenarios & Testing section
   → User flow: Developer calls API → Response mapped → UI renders correctly
5. Generate Functional Requirements
   → Each requirement is testable via API call verification
6. Identify Key Entities (if data involved)
   → Entities: API Endpoints, DTOs, Service Methods, Response Structures
7. Run Review Checklist
   → No implementation details in spec (moved to plan phase)
   → All requirements are business/user-focused
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT needs to be verified and WHY
- ❌ Avoid HOW to implement (no specific code patterns in spec)
- 👥 Written for stakeholders who need confidence in API integration quality

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a **frontend developer**, I need to ensure that every API call made from the UI correctly maps request parameters and response data to the expected TypeScript interfaces, so that the application displays accurate data without runtime errors or missing fields.

As a **QA tester**, I need to verify that all API endpoints return data in the expected format, so that I can validate the UI displays correct information for all features.

As a **system administrator**, I need confidence that the frontend correctly consumes all backend APIs, so that the digital signage system operates reliably in production.

### Acceptance Scenarios

#### Scenario 1: API Response Structure Verification
1. **Given** a frontend service method calls a backend API endpoint
2. **When** the backend returns a response (array, object, or wrapped data)
3. **Then** the frontend service correctly identifies the response structure (direct array vs wrapped object)
4. **And** applies appropriate guards (`Array.isArray()`, null checks) to prevent runtime errors
5. **And** maps all fields from backend DTOs to frontend TypeScript interfaces with correct property names

#### Scenario 2: Missing Field Handling
1. **Given** a backend API response with optional/nullable fields
2. **When** the frontend service receives the response
3. **Then** all optional fields have default fallback values defined
4. **And** the UI displays appropriate placeholders for missing data
5. **And** no undefined/null errors occur in the console

#### Scenario 3: Request Parameter Validation
1. **Given** a frontend component needs to submit data to a backend API
2. **When** the user fills out a form or triggers an action
3. **Then** the service method constructs a request payload matching the backend DTO structure
4. **And** all required fields are present and correctly typed
5. **And** the backend accepts the request without validation errors

#### Scenario 4: Error Response Handling
1. **Given** a backend API returns an error response (4xx, 5xx)
2. **When** the frontend service receives the error
3. **Then** the error is caught in a try-catch block
4. **And** appropriate error logging occurs with context
5. **And** the UI displays a user-friendly error message
6. **And** the application returns safe default values to prevent crashes

#### Scenario 5: Authentication Token Injection
1. **Given** an authenticated user makes an API request
2. **When** the service calls `apiClient.get()` or `apiClient.post()`
3. **Then** the JWT token is automatically injected via the configured interceptor
4. **And** the backend successfully authenticates the request
5. **And** no 401 Unauthorized errors occur for authenticated endpoints

### Edge Cases
- **What happens when** backend returns `null` instead of an array?
  - Frontend must use `Array.isArray()` guard and return empty array
- **What happens when** backend changes a DTO property name?
  - Frontend TypeScript interface should catch type mismatches at compile time
- **What happens when** API response has deeply nested objects?
  - Frontend must access nested properties with optional chaining (`?.`)
- **What happens when** API endpoint changes from direct array to paginated response?
  - Frontend must detect structure change and adjust mapping logic
- **What happens when** multiple API calls fail simultaneously?
  - Each service method should handle errors independently without cascading failures

---

## Requirements *(mandatory)*

### Functional Requirements

#### API Endpoint Coverage
- **FR-001**: System MUST audit ALL service files in `src/digital-signage-web/src/services/` directory
- **FR-002**: System MUST verify ALL `apiClient.get()`, `apiClient.post()`, `apiClient.put()`, `apiClient.delete()`, `apiClient.patch()` calls
- **FR-003**: System MUST document the exact API endpoint path and HTTP method for each service method

#### Request Mapping Verification
- **FR-004**: System MUST verify that all request payloads match backend DTO structures
- **FR-005**: System MUST ensure all required fields are present in request objects
- **FR-006**: System MUST validate TypeScript types for request parameters match backend expectations

#### Response Mapping Verification
- **FR-007**: System MUST identify response structure patterns (direct array, wrapped object, single entity)
- **FR-008**: System MUST verify `Array.isArray()` guards are present for array responses
- **FR-009**: System MUST check that all optional fields have default fallback values
- **FR-010**: System MUST validate property name mappings between backend DTOs and frontend interfaces
- **FR-011**: System MUST ensure no direct property access without null checks (`response.data.items` vs `response.data?.items`)

#### Error Handling Verification
- **FR-012**: System MUST verify all API calls are wrapped in try-catch blocks
- **FR-013**: System MUST ensure error logging includes contextual information
- **FR-014**: System MUST validate that services return safe default values on error (empty arrays, null objects)
- **FR-015**: System MUST confirm error responses don't cause UI crashes

#### Compliance with Guidelines
- **FR-016**: System MUST verify all services use the configured `apiClient` from `/lib/api.ts` (not direct axios imports)
- **FR-017**: System MUST check that debug console.log statements are present in development mode
- **FR-018**: System MUST validate that service methods follow the patterns defined in `copilot-instructions-ui.instructions.md`
- **FR-019**: System MUST ensure TypeScript interfaces are defined in separate `.types.ts` files

#### Documentation & Testing
- **FR-020**: System MUST generate a comprehensive audit report listing all verified endpoints
- **FR-021**: System MUST document any mismatches or issues found during audit
- **FR-022**: System MUST provide fix recommendations for each identified issue
- **FR-023**: System MUST create test scenarios to validate corrected mappings

### Key Entities *(data involved)*

#### API Endpoint
- Represents a single backend API endpoint
- Attributes: HTTP method (GET/POST/PUT/DELETE), path, controller, action method
- Relationships: Called by Service Method, returns DTO

#### Service Method
- Represents a frontend TypeScript service method
- Attributes: method name, return type, parameters, API call statement
- Relationships: Calls API Endpoint, maps to TypeScript Interface

#### Backend DTO (Data Transfer Object)
- Represents C# class used for API request/response
- Attributes: DTO class name, properties, data types, nullability
- Relationships: Returned by API Endpoint, maps to Frontend Interface

#### Frontend TypeScript Interface
- Represents TypeScript type definition in `.types.ts` files
- Attributes: interface name, properties, optional fields, types
- Relationships: Used by Service Method, maps from Backend DTO

#### Response Structure Pattern
- Represents the format of API response
- Types: Direct Array, Wrapped Object (PagedResult, ApiResponse), Single Entity, Error Response
- Attributes: structure type, wrapper properties, data location path
- Relationships: Determines mapping logic in Service Method

#### Mapping Issue
- Represents a mismatch between backend and frontend
- Attributes: service file, method name, issue type, severity, description
- Types: Missing guard, Wrong property name, Missing null check, Missing fallback value, Wrong response structure assumption
- Relationships: Found in Service Method, requires Fix Action

#### Fix Action
- Represents a corrective change to resolve a Mapping Issue
- Attributes: file path, line numbers, old code, new code, rationale
- Relationships: Resolves Mapping Issue, implements Guideline Pattern

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded (all services in `src/services/` directory)
- [x] Dependencies identified (copilot-instructions-ui.instructions.md, existing API documentation)

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (none remaining)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

## Success Criteria

### Definition of Done
1. **100% Coverage**: All service files audited with no API calls skipped
2. **Zero Critical Issues**: No missing guards, null checks, or wrong structure assumptions remain
3. **Documentation Complete**: Audit report documents all endpoints, structures, and fixes applied
4. **Guidelines Compliance**: All services follow patterns from `copilot-instructions-ui.instructions.md`
5. **Regression Prevention**: Test scenarios created to prevent future mapping regressions

### Measurable Outcomes
- **Audit Coverage**: X out of Y service files verified (target: 100%)
- **Issues Found**: Count of mapping issues by severity (Critical/High/Medium/Low)
- **Issues Fixed**: Count of issues resolved with verified fixes
- **Test Coverage**: Number of API endpoints with test scenarios documented
- **Zero Runtime Errors**: No undefined/null errors in browser console during manual testing

---

## Assumptions & Dependencies

### Assumptions
1. Backend API endpoints are stable and follow RESTful conventions
2. Backend DTOs are defined with clear property names and types
3. Frontend services use the configured `apiClient` from `/lib/api.ts`
4. TypeScript strict mode is enabled to catch type mismatches

### Dependencies
1. **copilot-instructions-ui.instructions.md**: Defines authoritative API mapping patterns
2. **API-RESPONSE-MAPPING-GUIDELINE.md**: Provides detailed examples and best practices
3. **Backend API Controllers**: Source of truth for endpoint routes and response structures
4. **Existing Service Files**: All files in `src/digital-signage-web/src/services/` and subdirectories

### Out of Scope
1. Creating new API endpoints (backend development)
2. Refactoring API architecture or response formats
3. Performance optimization of API calls
4. API versioning strategy
5. GraphQL or alternative API patterns

---

## Business Value

### Problem Being Solved
- **Runtime Errors**: Eliminates undefined/null errors caused by incorrect response mapping
- **Data Display Issues**: Ensures UI displays complete and accurate data from backend
- **Development Velocity**: Reduces debugging time by catching issues early
- **Production Reliability**: Prevents API integration bugs from reaching production

### User Impact
- **End Users**: Experience a more stable application with no missing data or error messages
- **Administrators**: Gain confidence in system reliability for managing digital signage
- **Developers**: Have clear, verified patterns to follow for future API integrations
- **QA Testers**: Can efficiently validate API integrations with documented test scenarios

### Risk Mitigation
- **Low Risk**: Audit is non-destructive (read-only analysis before fixes)
- **High Value**: Catches critical issues before they cause production incidents
- **Scalable**: Establishes patterns that prevent future mapping errors
- **Maintainable**: Documentation serves as ongoing reference for team

---
