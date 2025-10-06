# Tasks: Enhanced Device Groups UI with API Integration

**Input**: Design documents from `/specs/029-ui-device-groups/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Implementation plan found ✅
   → Tech stack: Next.js 15, React 18, TypeScript, React Query, Tailwind CSS 4
2. Load optional design documents:
   → data-model.md: DeviceGroup entities, validation schemas ✅
   → contracts/: API and component contract tests ✅
   → research.md: React Query integration decisions ✅
3. Generate tasks by category:
   → Setup: TypeScript interfaces, React Query hooks
   → Core: Enhance existing components, add new UI components
   → Integration: API integration, SignalR real-time updates
   → Polish: Search, drag-drop, performance optimization
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Enhance existing before creating new
5. Number tasks sequentially (T001, T002...)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- **Enhancement Priority**: Build on existing `src/digital-signage-web/src/app/device-groups/page.tsx` and `src/digital-signage-web/src/components/forms/DeviceGroupForm.tsx`

## Path Conventions
**Frontend Web App Structure**: `src/digital-signage-web/src/`
- Components: `components/`
- Pages: `app/`
- Hooks: `hooks/`
- Types: `types/`
- Services: `services/`

## Phase 3.1: Setup & Types
- [x] T001 [P] Create TypeScript interfaces in `src/digital-signage-web/src/types/deviceGroup.types.ts`
- [x] T002 [P] Create Zod validation schemas in `src/digital-signage-web/src/lib/validations/deviceGroup.schema.ts`
- [x] T003 [P] Create React Query keys structure in `src/digital-signage-web/src/hooks/keys/deviceGroupKeys.ts`

## Phase 3.2: API Integration Layer (Foundation)
- [x] T004 [P] Create device groups API service in `src/digital-signage-web/src/services/deviceGroupService.ts`
- [x] T005 [P] Create useDeviceGroups hook in `src/digital-signage-web/src/hooks/useDeviceGroups.ts`
- [x] T006 [P] Create useCreateDeviceGroup mutation hook in `src/digital-signage-web/src/hooks/useCreateDeviceGroup.ts`
- [x] T007 [P] Create useUpdateDeviceGroup mutation hook in `src/digital-signage-web/src/hooks/useUpdateDeviceGroup.ts`
- [x] T008 [P] Create useDeleteDeviceGroup mutation hook in `src/digital-signage-web/src/hooks/useDeleteDeviceGroup.ts`

## Phase 3.3: Core Component Enhancement (Build on Existing)
- [x] T009 Enhance existing DeviceGroupForm component in `src/digital-signage-web/src/components/forms/DeviceGroupForm.tsx` with Zod validation
- [x] T010 Replace mock data with React Query integration in `src/digital-signage-web/src/app/device-groups/page.tsx`
- [x] T011 Add hierarchical tree structure to device groups page
- [x] T012 Implement CRUD operations with optimistic updates in device groups page

## Phase 3.4: New UI Components (Essential Features)
- [x] T013 [P] Create DeviceGroupTree component in `src/digital-signage-web/src/components/DeviceGroupTree.tsx`
- [x] T014 [P] Create DeviceGroupItem component in `src/digital-signage-web/src/components/DeviceGroupItem.tsx`
- [x] T015 [P] Create DeviceGroupModal component in `src/digital-signage-web/src/components/DeviceGroupModal.tsx`
- [x] T016 [P] Create DeviceGroupSearch component in `src/digital-signage-web/src/components/DeviceGroupSearch.tsx`

## Phase 3.5: Advanced Features
- [x] T017 [P] Create useDeviceGroupSearch hook in `src/digital-signage-web/src/hooks/useDeviceGroupSearch.ts`
- [x] T018 [P] Create useRealTimeUpdates hook in `src/digital-signage-web/src/hooks/useRealTimeUpdates.ts`
- [x] T019 Add drag-and-drop functionality to DeviceGroupTree component using @dnd-kit/core
- [x] T020 Add real-time updates integration to device groups page

## Phase 3.6: Performance & Polish
- [x] T021 [P] Add error boundaries in `src/digital-signage-web/src/components/DeviceGroupsErrorBoundary.tsx`
- [x] T022 [P] Add loading states and skeleton components in `src/digital-signage-web/src/components/DeviceGroupsSkeleton.tsx`
- [x] T023 Implement keyboard navigation and accessibility features in DeviceGroupTree
- [x] T024 Add performance optimization with virtualization for large lists
- [x] T025 [P] Update admin layout navigation in `src/digital-signage-web/src/components/layouts/AdminLayout.tsx`

## Dependencies
**Phase Dependencies**:
- Setup (T001-T003) before API integration (T004-T008)
- API hooks (T004-T008) before component enhancement (T009-T012)
- Core enhancement (T009-T012) before new components (T013-T016)
- Basic components (T013-T016) before advanced features (T017-T020)
- Core functionality before performance optimization (T021-T025)

**File Dependencies**:
- T001 (types) blocks T002 (validation), T004 (service)
- T002 (validation) blocks T009 (form enhancement)
- T005 (useDeviceGroups) blocks T010 (page integration)
- T013 (tree component) blocks T019 (drag-drop), T023 (accessibility)
- T014 (item component) blocks T013 (tree component)

## Parallel Execution Examples
```
# Phase 3.1 - Setup (can run together):
Task: "Create TypeScript interfaces in src/digital-signage-web/src/types/deviceGroup.types.ts"
Task: "Create Zod validation schemas in src/digital-signage-web/src/lib/validations/deviceGroup.schema.ts"
Task: "Create React Query keys structure in src/digital-signage-web/src/hooks/keys/deviceGroupKeys.ts"

# Phase 3.2 - API Hooks (can run together after T001):
Task: "Create device groups API service in src/digital-signage-web/src/services/deviceGroupService.ts"
Task: "Create useDeviceGroups hook in src/digital-signage-web/src/hooks/useDeviceGroups.ts"
Task: "Create useCreateDeviceGroup mutation hook in src/digital-signage-web/src/hooks/useCreateDeviceGroup.ts"

# Phase 3.4 - New Components (can run together):
Task: "Create DeviceGroupTree component in src/digital-signage-web/src/components/DeviceGroupTree.tsx"
Task: "Create DeviceGroupItem component in src/digital-signage-web/src/components/DeviceGroupItem.tsx"
Task: "Create DeviceGroupModal component in src/digital-signage-web/src/components/DeviceGroupModal.tsx"
```

## Task Generation Rules
**Enhancement Pattern**: 
- ✅ Build on existing `/device-groups/page.tsx` and `DeviceGroupForm.tsx`
- ✅ Follow copilot-instructions-ui.instructions.md patterns
- ✅ Use React Query for state management
- ✅ Skip test phases per user request
- ✅ Integration with existing API endpoints (no backend changes)

**File Organization**:
- Types: `types/deviceGroup.types.ts`
- Hooks: `hooks/use*.ts`
- Components: `components/DeviceGroup*.tsx`
- Services: `services/deviceGroupService.ts`
- Validation: `lib/validations/deviceGroup.schema.ts`

**Technical Standards**:
- TypeScript strict mode
- React Hook Form + Zod validation
- React Query optimistic updates
- Tailwind CSS 4 styling
- Lucide React icons
- Accessibility compliance
- Mobile-responsive design

## Notes
- [P] tasks = different files, no dependencies
- Enhance existing components before creating new ones
- Follow Next.js 15 App Router patterns
- Real-time updates via SignalR integration
- Performance optimization for 1000+ device groups
- Skip testing phases per user requirement
- Focus on UI enhancement with existing backend API

## Success Criteria
✅ **Enhanced existing page** with hierarchical tree view
✅ **Real API integration** replacing mock data
✅ **Complete CRUD operations** with optimistic updates
✅ **Search and filtering** functionality
✅ **Drag-and-drop reordering** capability
✅ **Real-time synchronization** via WebSocket
✅ **Performance optimized** for large datasets
✅ **Accessible** keyboard navigation
✅ **Mobile responsive** design
✅ **Error handling** with user feedback