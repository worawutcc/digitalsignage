# Playlist & Scene Management - Foundation Summary

**Status:** ✅ Phase 1 Complete - Type Definitions & API Services  
**Date:** 2025-01-07  
**Next Phase:** UI Components Implementation

---

## 🎯 Overview

We've successfully established the foundation for Playlist and Scene management in the Digital Signage UI. This phase focused on creating type-safe TypeScript definitions and comprehensive API service layers that match the backend API contracts.

## ✅ Completed Tasks

### 1. **TypeScript Type Definitions**

#### Created Files:
- `/src/types/playlist.ts` - Comprehensive Playlist types
- `/src/types/scene.ts` - Comprehensive Scene types

#### Key Features:

**Playlist Types:**
- ✅ `PlaylistDto` - Full playlist data structure
- ✅ `PlaylistItemDto` - Individual playlist item with media reference
- ✅ `CreatePlaylistRequest` - Validated creation request
- ✅ `UpdatePlaylistRequest` - Validated update request
- ✅ `PlaylistStatus` enum (Draft, Active, Scheduled, Archived)
- ✅ `TransitionEffect` enum (Cut, Fade, Slide, Zoom, Wipe, Push, Reveal, Dissolve)
- ✅ Helper functions: `formatPlaylistDuration()`, `getPlaylistStatusLabel()`, `getPlaylistStatusColor()`

**Scene Types:**
- ✅ `SceneDto` - Full scene data structure
- ✅ `SceneItemDto` - Individual scene item with positioning/animation
- ✅ `CreateSceneRequest` - Validated creation request
- ✅ `UpdateSceneRequest` - Validated update request
- ✅ `SceneLayoutType` enum (Custom, FullScreen, SplitScreen, Grid, PictureInPicture, Sidebar, Header, Footer)
- ✅ `SceneTemplate` interface - Pre-built scene layouts
- ✅ 8 pre-defined templates (FullScreen, Split Horizontal/Vertical, 2x2 Grid, PiP, Sidebar, Header, Footer)
- ✅ Animation presets (fadeIn/Out, slideIn/Out, zoomIn/Out, bounceIn/Out, rotateIn/Out)
- ✅ Helper functions: `getSceneLayoutTypeLabel()`, `getSceneLayoutIcon()`, `validateHexColor()`

### 2. **API Service Implementations**

#### Created Files:
- `/src/services/playlistService.ts` - Full Playlist API integration
- `/src/services/sceneService.ts` - Full Scene API integration

#### Playlist Service Features:
- ✅ **CRUD Operations**: `getAll()`, `getById()`, `getByUserId()`, `create()`, `update()`, `delete()`
- ✅ **Activation**: `activate()`, `deactivate()`
- ✅ **Duplication**: `duplicate()`
- ✅ **Filtering**: `getFiltered()` with search, status filter, creator filter, sorting
- ✅ **Statistics**: `getStatistics()` for dashboard/overview
- ✅ **Bulk Operations**: `bulkDelete()`, `bulkActivate()`, `bulkDeactivate()`
- ✅ **Import/Export**: `exportPlaylist()`, `importPlaylist()` as JSON
- ✅ **Validation**: `validatePlaylist()` with comprehensive error messages

#### Scene Service Features:
- ✅ **CRUD Operations**: `getAll()`, `getById()`, `getByUserId()`, `create()`, `update()`, `delete()`
- ✅ **Templates**: `getTemplates()`, `getPredefinedTemplates()`, `createFromTemplate()`
- ✅ **Duplication**: `duplicate()`
- ✅ **Template Conversion**: `convertToTemplate()`
- ✅ **Filtering**: `getFiltered()` with search, layout type filter, template filter, sorting
- ✅ **Statistics**: `getStatistics()` for dashboard/overview
- ✅ **Bulk Operations**: `bulkDelete()`
- ✅ **Import/Export**: `exportScene()`, `importScene()` as JSON
- ✅ **Validation**: `validateScene()` with comprehensive error messages
- ✅ **Utilities**: `calculateSceneDuration()`, `checkOverlap()` for scene item collision detection

---

## 📊 Backend API Mapping

### Playlist Controller Endpoints:
```
✅ GET    /api/playlist                    → PlaylistService.getAll()
✅ GET    /api/playlist/user/{userId}      → PlaylistService.getByUserId()
✅ GET    /api/playlist/{id}               → PlaylistService.getById()
✅ POST   /api/playlist                    → PlaylistService.create()
✅ PUT    /api/playlist/{id}               → PlaylistService.update()
✅ DELETE /api/playlist/{id}               → PlaylistService.delete()
✅ POST   /api/playlist/{id}/activate      → PlaylistService.activate()
✅ POST   /api/playlist/{id}/deactivate    → PlaylistService.deactivate()
```

### Scene Controller Endpoints:
```
✅ GET    /api/scene                       → SceneService.getAll()
✅ GET    /api/scene/user/{userId}         → SceneService.getByUserId()
✅ GET    /api/scene/{id}                  → SceneService.getById()
✅ GET    /api/scene/templates             → SceneService.getTemplates()
✅ POST   /api/scene                       → SceneService.create()
✅ PUT    /api/scene/{id}                  → SceneService.update()
✅ DELETE /api/scene/{id}                  → SceneService.delete()
```

---

## 🎨 Scene Template Library

We've defined **8 pre-built scene templates** for common use cases:

1. **Full Screen** - Single content area (1920x1080)
2. **Split Screen (Horizontal)** - Two vertical sections (960px each)
3. **Split Screen (Vertical)** - Two horizontal sections (540px each)
4. **2x2 Grid** - Four equal quadrants
5. **Picture in Picture** - Main content + small overlay (480x270 corner)
6. **Sidebar (Right)** - Main content (1440px) + sidebar (480px)
7. **Header & Content** - Header bar (200px) + content below
8. **Content & Footer** - Content + footer bar (150px)

Each template includes:
- Layout type, dimensions, description
- Pre-defined zones with x, y, width, height, zIndex
- Ready to use in Scene creation UI

---

## 🔄 Digital Signage Content Workflow

Now that we have types and services, the intended workflow is:

```
1. UPLOAD MEDIA
   └─→ Enhanced Media Upload with device-optimized variants

2. ORGANIZE CONTENT (NEW - What we're building)
   ├─→ Create PLAYLIST (time-based sequencing)
   │   └─→ Add media items, set duration, transitions
   │   
   └─→ Create SCENE (spatial layout)
       └─→ Add media items, position, animate

3. ASSIGN TO DEVICE GROUPS
   └─→ Assign Playlist/Scene to DeviceGroup

4. SCHEDULE & DEPLOY
   └─→ Schedule content with time windows
   └─→ Devices pull and display content
```

### Key Differences:
- **Playlist**: Time-based sequencing (media plays one after another)
- **Scene**: Spatial layout (multiple media items displayed simultaneously)
- **DeviceGroup**: Organization unit for targeting devices

---

## 📋 Next Steps (Remaining Tasks)

### ⏳ Task 4: Enhance Playlist Management UI
**Goal:** Update existing `/app/playlists/page.tsx` to use real API

**Required Changes:**
- Replace mock data with `PlaylistService` API calls
- Add React Query hooks for data fetching
- Implement create/edit/delete modals
- Add status management (Draft → Active workflow)
- Integrate with media selection
- Add device assignment preview

### ⏳ Task 5: Create Playlist Item Builder Component
**Component:** `/features/playlists/components/PlaylistItemBuilder.tsx`

**Features:**
- Drag-and-drop ordering of playlist items
- Media picker integration
- Duration settings (default vs. custom)
- Transition effect selector
- Conditional playback (time-based StartTime/EndTime)
- Real-time preview of playlist sequence
- Total duration calculator

### ⏳ Task 6: Create Scene Management UI
**Component:** `/app/scenes/page.tsx`

**Features:**
- List/Grid view toggle
- Template gallery integration
- CRUD operations with validation
- Layout type selector
- Scene preview/thumbnail
- Filter by layout type, template status
- Device assignment summary

### ⏳ Task 7: Create Scene Canvas Editor
**Component:** `/features/scenes/components/SceneCanvasEditor.tsx`

**Features:**
- Visual canvas (1920x1080 or custom)
- Drag-and-drop media items onto canvas
- Resize/rotate handles
- Z-index layering controls
- Opacity/animation settings panel
- Grid snapping, guidelines
- Real-time preview
- Zoom in/out

### ⏳ Task 8: Create Scene Template Gallery
**Component:** `/features/scenes/components/SceneTemplateGallery.tsx`

**Features:**
- Browse 8 pre-defined templates
- Template preview cards
- "Use Template" quick action
- Clone template to custom scene
- Template zones visualization

### ⏳ Task 9: Update Media Assignment UI
**Goal:** Extend QuickAssignModal for Playlist/Scene assignment

**Changes:**
- Add tabs: Device Groups, Playlists, Scenes
- Integrate PlaylistService and SceneService
- Show playlist/scene list with selection
- Support assigning media to multiple targets
- Success feedback with assignment summary

### ⏳ Task 10: Documentation & Testing Guide
**Deliverables:**
- API integration examples
- Component usage guide
- Manual testing checklist (CRUD operations)
- Workflow diagrams (Upload→Organize→Assign→Deploy)
- Troubleshooting guide

---

## 🧪 Testing Checklist

### API Service Tests (To be implemented):
- [ ] Playlist CRUD operations
- [ ] Playlist validation edge cases
- [ ] Playlist filtering and sorting
- [ ] Playlist bulk operations
- [ ] Scene CRUD operations
- [ ] Scene validation edge cases
- [ ] Scene template creation
- [ ] Scene filtering and sorting
- [ ] Import/Export functionality

### Integration Tests (After UI implementation):
- [ ] Create playlist with media items
- [ ] Create scene from template
- [ ] Assign playlist to device group
- [ ] Assign scene to device group
- [ ] Schedule playlist with time windows
- [ ] Preview playlist/scene before activation
- [ ] Duplicate and edit playlist/scene
- [ ] Bulk activate/deactivate playlists

---

## 🚀 Technology Stack

**TypeScript:** Strict mode enabled, comprehensive type safety  
**Axios:** HTTP client for API communication  
**React Query:** (To be integrated) Data fetching, caching, synchronization  
**Next.js 15:** App Router, Server Components  
**Tailwind CSS 4:** Utility-first styling  
**Lucide React:** Icon library  

---

## 📁 File Structure

```
src/
├── types/
│   ├── playlist.ts              ✅ Complete
│   └── scene.ts                 ✅ Complete
│
├── services/
│   ├── playlistService.ts       ✅ Complete
│   └── sceneService.ts          ✅ Complete
│
├── app/
│   ├── playlists/
│   │   └── page.tsx             ⏳ Needs enhancement (uses mock data)
│   └── scenes/
│       └── page.tsx             ⏳ To be created
│
└── features/
    ├── playlists/
    │   └── components/
    │       └── PlaylistItemBuilder.tsx    ⏳ To be created
    └── scenes/
        └── components/
            ├── SceneCanvasEditor.tsx       ⏳ To be created
            └── SceneTemplateGallery.tsx    ⏳ To be created
```

---

## 💡 Developer Notes

### Backend Entity Relationships:
```
Playlist
  └── PlaylistItem[]
      └── Media (mediaId reference)

Scene
  └── SceneItem[]
      └── Media (mediaId reference)

PlaylistAssignment
  └── Playlist + DeviceGroup

(Scene assignments to be implemented)
```

### Time Format Handling:
- **DateTime**: ISO 8601 strings (`2025-01-07T10:30:00Z`)
- **TimeOnly**: String format `HH:mm:ss` (e.g., `"14:30:00"`)
- **Duration**: Integer seconds (e.g., `300` = 5 minutes)

### Validation Rules:
- **Playlist Name**: 1-200 characters
- **Scene Name**: 1-200 characters
- **Description**: 0-1000 characters
- **Priority**: 0-100
- **Duration**: Minimum 1 second
- **Scene Width**: 1-7680px
- **Scene Height**: 1-4320px
- **Opacity**: 0.0-1.0
- **Rotation**: -360 to 360 degrees

---

## 🎯 Success Criteria

**Phase 1 (✅ Complete):**
- Type-safe definitions matching backend DTOs
- Full API service coverage for all endpoints
- Comprehensive validation and error handling
- Helper utilities for formatting and calculations

**Phase 2 (⏳ In Progress):**
- Functional Playlist management UI with real API
- Functional Scene management UI with templates
- Media assignment to Playlists/Scenes
- Comprehensive testing and documentation

---

## 📞 Support & Resources

**Backend API Documentation:** `/docs/api/` (see PlaylistController, SceneController)  
**UI Instructions:** `.github/instructions/copilot-instructions-ui.instructions.md`  
**Backend Instructions:** `.github/instructions/copilot-instructions-api.instructions.md`  
**Existing Components:** `/features/media/components/` (Enhanced Media Upload reference)

---

## 🔗 Related Documentation

- [Enhanced Media Upload UI Summary](./ENHANCED-MEDIA-UPLOAD-UI-SUMMARY.md)
- [API Integration Guide](./api-integration.md)
- [Component Library](./component-library.md)
- [Manual Testing Guide](./manual-testing-guide.md)

---

**Next Action:** Begin Task 4 - Enhance Playlist Management UI with real API integration.
