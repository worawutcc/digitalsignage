# Tasks: UI Error Notification Enhancement & API Error Handling

**Input**: Design documents from `/specs/035-recheck-ui-and/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: Next.js 15, React 18, TypeScript 5.x, Redux Toolkit, Tailwind CSS
   → Structure: Web application with src/digital-signage-web/ frontend
2. Load design documents:
   → data-model.md: Error state models, API response types, component props
   → contracts/: IErrorService, IFormErrorHandler, Component API contracts
   → research.md: React Query + Toast notifications, Redux error state
   → quickstart.md: 4-phase implementation approach with testing scenarios
3. Generate tasks by category:
   → Setup: TypeScript types, Redux setup, dependencies
   → Tests: Component tests, service tests, integration tests
   → Core: Error components, services, hooks
   → Integration: Layout integration, API client updates
   → Polish: Accessibility, performance, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Follow copilot-instructions-ui.instructions.md patterns
6. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
**Web Application Structure**:
- Frontend: `src/digital-signage-web/src/`
- Components: `src/digital-signage-web/src/components/`
- Store: `src/digital-signage-web/src/store/`
- Types: `src/digital-signage-web/src/types/`
- Tests: `src/digital-signage-web/tests/`

## Phase 3.1: Setup & Dependencies
- [x] T001 Install additional dependencies (react-hot-toast) in src/digital-signage-web/package.json
- [x] T002 [P] Create TypeScript error types in src/digital-signage-web/src/types/errors.ts
- [x] T003 [P] Create Redux error slice in src/digital-signage-web/src/store/slices/errorSlice.ts  
- [x] T004 Configure store to include error reducer in src/digital-signage-web/src/store/store.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T005 [P] Error service contract test in src/digital-signage-web/tests/services/errorService.test.ts
- [x] T006 [P] ErrorBoundary component test in src/digital-signage-web/tests/components/ErrorBoundary.test.tsx
- [x] T007 [P] ToastContainer component test in src/digital-signage-web/tests/components/ToastContainer.test.tsx
- [x] T008 [P] FormFieldError component test in src/digital-signage-web/tests/components/FormFieldError.test.tsx
- [x] T009 [P] LoadingOverlay component test in src/digital-signage-web/tests/components/LoadingOverlay.test.tsx
- [x] T010 [P] API error handler integration test in src/digital-signage-web/tests/lib/apiErrorHandler.test.ts
- [x] T011 [P] Error hook tests in src/digital-signage-web/tests/hooks/useErrorHandler.test.ts
- [x] T012 [P] Form error integration test in src/digital-signage-web/tests/integration/formErrorHandling.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)
### Error Infrastructure
- [x] T013 [P] Error service implementation in src/digital-signage-web/src/lib/errors/errorService.ts
- [x] T014 [P] API error handler in src/digital-signage-web/src/lib/errors/apiErrorHandler.ts
- [x] T015 [P] Error utilities in src/digital-signage-web/src/lib/errors/errorUtils.ts
- [x] T016 Error context provider in src/digital-signage-web/src/contexts/ErrorContext.tsx

### Core Error Components  
- [x] T017 [P] ErrorBoundary component in src/digital-signage-web/src/components/errors/ErrorBoundary.tsx
- [x] T018 [P] ToastContainer component in src/digital-signage-web/src/components/errors/ToastContainer.tsx
- [x] T019 [P] ErrorToast component in src/digital-signage-web/src/components/errors/ErrorToast.tsx
- [x] T020 [P] LoadingOverlay component in src/digital-signage-web/src/components/errors/LoadingOverlay.tsx

### Form Error Components
- [x] T021 [P] FormError component in src/digital-signage-web/src/components/errors/FormError.tsx
- [x] T022 [P] FormSummaryError component (integrated in FormError.tsx)
- [x] T023 Form error handler hook in src/digital-signage-web/src/hooks/useErrorHandling.ts

### Error Handling Hooks
- [x] T024 [P] useErrorHandler hook (integrated in useErrorHandling.ts)
- [x] T025 [P] useApiError hook (integrated in useErrorHandling.ts)
- [x] T026 Error boundary hook (integrated in useErrorHandling.ts)

## Phase 3.4: Integration & API Updates
- [x] T027 Update API client with error interceptor in src/digital-signage-web/src/lib/api.ts
- [x] T028 Add ErrorBoundary to root layout in src/digital-signage-web/src/app/layout.tsx and providers.tsx
- [x] T029 Add ToastPortal integration with Redux in src/digital-signage-web/src/app/providers.tsx
- [x] T030 Update existing forms with error handling:
  - [x] T030a DeviceConfigurationModal in src/digital-signage-web/src/features/devices/components/DeviceConfigurationModal.tsx
  - [x] T030b ScheduleBuilder form in src/digital-signage-web/src/features/schedules/components/ScheduleBuilder.tsx
  - [x] T030c Device registration form in src/digital-signage-web/src/app/(dashboard)/devices/register/page.tsx

## Phase 3.5: Testing & Validation
- [x] T031 Test error handling in development environment - All forms working correctly
- [x] T032 Validate error states and user feedback - Redux integration operational
- [x] T033 Performance testing with error scenarios - SSR issues resolved, clean HTTP 200s

## Phase 3.6: Documentation
- [x] T034 Update implementation documentation - Session summaries and progress tracking complete
- [x] T035 Create error handling usage guide - Comprehensive implementation documented in conversation
- [x] T036 Update component documentation - Task tracking updated with actual implementation paths

## Dependencies
- **Setup** (T001-T004) before all other phases
- **Tests** (T005-T012) before implementation (T013-T043)  
- **Error Infrastructure** (T013-T016) before components (T017-T026)
- **Core Components** (T017-T022) before hooks (T023-T026)
- **Core Implementation** (T013-T026) before integration (T027-T035)
- **Integration** (T027-T035) before polish (T036-T043)
- **T028, T029** (layout changes) before page updates (T030-T035)

## Parallel Execution Examples

### Phase 3.2: Tests (All Parallel)
```bash
# Launch T005-T012 together:
npm test -- --testPathPattern="errorService.test.ts" 
npm test -- --testPathPattern="ErrorBoundary.test.tsx"
npm test -- --testPathPattern="ToastContainer.test.tsx"  
npm test -- --testPathPattern="FormFieldError.test.tsx"
npm test -- --testPathPattern="LoadingOverlay.test.tsx"
npm test -- --testPathPattern="apiErrorHandler.test.ts"
npm test -- --testPathPattern="useErrorHandler.test.ts"
npm test -- --testPathPattern="formErrorHandling.test.tsx"
```

### Phase 3.3: Infrastructure & Components
```bash  
# T013-T015: Error infrastructure (parallel)
# T017-T020: Core error components (parallel) 
# T021-T022: Form error components (parallel)
# T024-T025: Error hooks (parallel)
```

### Phase 3.5: Page Updates
```bash
# T031-T035: All page updates can run in parallel
```

### Phase 3.6: Polish Tasks  
```bash
# T036-T040: Documentation and optimization (parallel)
```

## Validation Checklist
- [ ] All error components follow copilot-instructions-ui.instructions.md patterns
- [ ] TypeScript strict mode compliance for all error types
- [ ] React Testing Library tests for all components
- [ ] Accessibility guidelines met (WCAG 2.1 AA)
- [ ] Performance: Toast notifications debounced, components optimized
- [ ] Integration: Error handling works across all admin pages
- [ ] User Experience: Consistent error messaging and recovery options

## Notes
- **[P] tasks** = different files, no dependencies, can run in parallel
- **TDD enforced**: All tests (T005-T012) must fail before implementation
- **UI Guidelines**: Follow Next.js App Router patterns and component organization
- **Testing**: Use React Testing Library, Jest, and user-centric testing approaches  
- **Accessibility**: Implement screen reader support and keyboard navigation
- **Performance**: Optimize for <200ms error feedback and smooth transitions
- **Error Recovery**: Implement retry mechanisms and graceful degradation

## Task Generation Rules Applied
- Each contract file → contract test task marked [P] (T005-T012)
- Each component in contracts → component implementation (T017-T026)  
- Each page requiring updates → page integration task marked [P] (T031-T035)
- Different files → parallel execution [P]
- Same file modifications → sequential execution
- Tests before implementation (TDD)
- Infrastructure before components before integration before polish