# Playlist & Scene Quick Reference

**Quick reference guide for developers working with Playlist and Scene features**

---

## 🎯 TL;DR - What We Built

✅ **Type Definitions:** Complete TypeScript types matching backend DTOs  
✅ **API Services:** Full CRUD operations for Playlist and Scene management  
✅ **Validation:** Comprehensive client-side validation with error messages  
✅ **Templates:** 8 pre-built scene layouts for common use cases  
✅ **Utilities:** Helper functions for formatting, filtering, and calculations  

---

## 📦 Import Quick Reference

```typescript
// Playlist Types
import {
  PlaylistDto,
  PlaylistItemDto,
  CreatePlaylistRequest,
  UpdatePlaylistRequest,
  PlaylistStatus,
  TransitionEffect,
  formatPlaylistDuration,
  getPlaylistStatusLabel,
  getPlaylistStatusColor,
  getTransitionEffectLabel
} from '@/types/playlist'

// Scene Types
import {
  SceneDto,
  SceneItemDto,
  CreateSceneRequest,
  UpdateSceneRequest,
  SceneLayoutType,
  SceneTemplate,
  SCENE_TEMPLATES,
  ANIMATION_PRESETS,
  getSceneLayoutTypeLabel,
  getSceneLayoutIcon,
  validateHexColor
} from '@/types/scene'

// API Services
import PlaylistService from '@/services/playlistService'
import SceneService from '@/services/sceneService'
```

---

## 🎬 Playlist Usage Examples

### Create a Playlist

```typescript
import PlaylistService from '@/services/playlistService'
import { CreatePlaylistRequest, PlaylistStatus } from '@/types/playlist'

const createPlaylist = async () => {
  const request: CreatePlaylistRequest = {
    name: 'Morning Announcements',
    description: 'Daily morning content for lobby displays',
    status: PlaylistStatus.Draft,
    isLooped: true,
    priority: 5,
    playlistItems: [
      {
        mediaId: 123,
        orderIndex: 1,
        durationSeconds: 30,
        useCustomDuration: true,
        transitionEffect: 1, // Fade
        transitionDurationMs: 500
      },
      {
        mediaId: 456,
        orderIndex: 2,
        durationSeconds: 45,
        useCustomDuration: true,
        transitionEffect: 2 // Slide
      }
    ]
  }

  try {
    const playlist = await PlaylistService.create(request, 1) // userId = 1
    console.log('Created playlist:', playlist)
  } catch (error) {
    console.error('Failed to create playlist:', error)
  }
}
```

### Get All Playlists with Filtering

```typescript
import PlaylistService from '@/services/playlistService'
import { PlaylistStatus } from '@/types/playlist'

const getActivePlaylists = async () => {
  const playlists = await PlaylistService.getFiltered({
    status: [PlaylistStatus.Active],
    sortBy: 'priority',
    sortOrder: 'desc'
  })
  
  return playlists
}
```

### Activate a Playlist

```typescript
import PlaylistService from '@/services/playlistService'

const activatePlaylist = async (playlistId: number) => {
  await PlaylistService.activate(playlistId)
  console.log('Playlist activated')
}
```

### Display Playlist Card

```typescript
import { PlaylistDto, formatPlaylistDuration, getPlaylistStatusLabel, getPlaylistStatusColor } from '@/types/playlist'

const PlaylistCard = ({ playlist }: { playlist: PlaylistDto }) => {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{playlist.name}</h3>
        <span className={`px-2 py-1 text-xs rounded ${getPlaylistStatusColor(playlist.status)}`}>
          {getPlaylistStatusLabel(playlist.status)}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2">{playlist.description}</p>
      <div className="mt-4 flex gap-4 text-sm">
        <span>📦 {playlist.totalItems} items</span>
        <span>⏱️ {formatPlaylistDuration(playlist.totalDurationSeconds)}</span>
        <span>🔄 Priority: {playlist.priority}</span>
      </div>
    </div>
  )
}
```

---

## 🎨 Scene Usage Examples

### Create a Scene from Template

```typescript
import SceneService from '@/services/sceneService'
import { SCENE_TEMPLATES, SceneLayoutType } from '@/types/scene'

const createSceneFromTemplate = async () => {
  // Get the Split Screen template
  const template = SCENE_TEMPLATES.find(t => t.layoutType === SceneLayoutType.SplitScreen)
  
  if (!template) return

  const scene = await SceneService.createFromTemplate(
    template,
    'Lobby Split Screen',
    'Split screen for lobby display',
    1 // userId
  )
  
  console.log('Created scene:', scene)
}
```

### Create a Custom Scene

```typescript
import SceneService from '@/services/sceneService'
import { CreateSceneRequest, SceneLayoutType } from '@/types/scene'

const createCustomScene = async () => {
  const request: CreateSceneRequest = {
    name: 'Custom Dashboard',
    description: 'Custom layout with 3 zones',
    layoutType: SceneLayoutType.Custom,
    width: 1920,
    height: 1080,
    backgroundColor: '#000000',
    sceneItems: [
      {
        mediaId: 123,
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
        zIndex: 1,
        durationSeconds: 60
      },
      {
        mediaId: 456,
        x: 1280,
        y: 0,
        width: 640,
        height: 360,
        zIndex: 2,
        durationSeconds: 60,
        animationIn: 'fadeIn',
        animationDuration: 500
      }
    ]
  }

  try {
    const scene = await SceneService.create(request, 1) // userId = 1
    console.log('Created scene:', scene)
  } catch (error) {
    console.error('Failed to create scene:', error)
  }
}
```

### Display Scene Template Gallery

```typescript
import { SCENE_TEMPLATES, getSceneLayoutTypeLabel } from '@/types/scene'

const SceneTemplateGallery = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {SCENE_TEMPLATES.map((template) => (
        <div key={template.name} className="p-4 border rounded-lg hover:shadow-lg cursor-pointer">
          <div className="text-3xl mb-2">{template.preview || '🖼️'}</div>
          <h3 className="font-semibold">{template.name}</h3>
          <p className="text-xs text-gray-600 mt-1">{template.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            {template.zones.length} zones · {template.width}×{template.height}
          </p>
        </div>
      ))}
    </div>
  )
}
```

### Check Scene Item Overlap

```typescript
import SceneService from '@/services/sceneService'
import { SceneDto } from '@/types/scene'

const validateSceneLayout = (scene: SceneDto) => {
  const hasOverlap = SceneService.checkOverlap(scene)
  
  if (hasOverlap) {
    console.warn('⚠️ Scene items are overlapping')
  } else {
    console.log('✅ Scene layout is valid')
  }
  
  return !hasOverlap
}
```

---

## 🔧 Validation Examples

### Validate Playlist Before Saving

```typescript
import PlaylistService from '@/services/playlistService'
import { CreatePlaylistRequest } from '@/types/playlist'

const validateAndSavePlaylist = async (request: CreatePlaylistRequest) => {
  const errors = PlaylistService.validatePlaylist(request)
  
  if (errors.length > 0) {
    console.error('Validation errors:', errors)
    alert(`Please fix the following errors:\n${errors.join('\n')}`)
    return
  }
  
  const playlist = await PlaylistService.create(request, 1)
  console.log('Playlist saved successfully:', playlist)
}
```

### Validate Scene Before Saving

```typescript
import SceneService from '@/services/sceneService'
import { CreateSceneRequest } from '@/types/scene'

const validateAndSaveScene = async (request: CreateSceneRequest) => {
  const errors = SceneService.validateScene(request)
  
  if (errors.length > 0) {
    console.error('Validation errors:', errors)
    alert(`Please fix the following errors:\n${errors.join('\n')}`)
    return
  }
  
  const scene = await SceneService.create(request, 1)
  console.log('Scene saved successfully:', scene)
}
```

---

## 🎭 Enum Reference

### PlaylistStatus

```typescript
enum PlaylistStatus {
  Draft = 0,      // Being edited, not visible to devices
  Active = 1,     // Live and playing on assigned devices
  Scheduled = 2,  // Scheduled for future activation
  Archived = 3    // Archived, no longer in use
}
```

### TransitionEffect

```typescript
enum TransitionEffect {
  Cut = 0,        // Instant transition
  Fade = 1,       // Fade in/out
  Slide = 2,      // Slide from side
  Zoom = 3,       // Zoom in/out
  Wipe = 4,       // Wipe across
  Push = 5,       // Push old content out
  Reveal = 6,     // Reveal underneath
  Dissolve = 7    // Dissolve effect
}
```

### SceneLayoutType

```typescript
enum SceneLayoutType {
  Custom = 0,             // User-defined layout
  FullScreen = 1,         // Single full-screen media
  SplitScreen = 2,        // Two sections (horizontal or vertical)
  Grid = 3,               // Grid layout (2x2, 3x3, etc.)
  PictureInPicture = 4,   // Main content + overlay
  Sidebar = 5,            // Main content + sidebar
  Header = 6,             // Header bar + content
  Footer = 7              // Content + footer bar
}
```

---

## 📊 Statistics & Reporting

### Get Playlist Statistics

```typescript
import PlaylistService from '@/services/playlistService'

const stats = await PlaylistService.getStatistics()

console.log(`
  Total Playlists: ${stats.totalPlaylists}
  Active: ${stats.activePlaylists}
  Draft: ${stats.draftPlaylists}
  Scheduled: ${stats.scheduledPlaylists}
  Average Duration: ${stats.averageDuration}s
`)
```

### Get Scene Statistics

```typescript
import SceneService from '@/services/sceneService'

const stats = await SceneService.getStatistics()

console.log(`
  Total Scenes: ${stats.totalScenes}
  Custom Scenes: ${stats.customScenes}
  Templates: ${stats.templateScenes}
  Average Items per Scene: ${stats.averageItems}
`)
```

---

## 🧪 Bulk Operations

### Bulk Activate Playlists

```typescript
import PlaylistService from '@/services/playlistService'

const playlistIds = [1, 2, 3, 4]
await PlaylistService.bulkActivate(playlistIds)
console.log('All playlists activated')
```

### Bulk Delete Scenes

```typescript
import SceneService from '@/services/sceneService'

const sceneIds = [10, 11, 12]
await SceneService.bulkDelete(sceneIds)
console.log('Scenes deleted')
```

---

## 💾 Import/Export

### Export Playlist as JSON

```typescript
import PlaylistService from '@/services/playlistService'

const playlistId = 5
const json = await PlaylistService.exportPlaylist(playlistId)

// Save to file or copy to clipboard
const blob = new Blob([json], { type: 'application/json' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = `playlist-${playlistId}.json`
a.click()
```

### Import Playlist from JSON

```typescript
import PlaylistService from '@/services/playlistService'

const jsonString = `{ "name": "Imported Playlist", ... }`
const playlist = await PlaylistService.importPlaylist(jsonString, 1)
console.log('Playlist imported:', playlist)
```

---

## 🔍 Filtering & Sorting

### Advanced Playlist Filtering

```typescript
import PlaylistService from '@/services/playlistService'
import { PlaylistStatus } from '@/types/playlist'

const playlists = await PlaylistService.getFiltered({
  status: [PlaylistStatus.Active, PlaylistStatus.Scheduled],
  searchTerm: 'morning',
  createdByUserId: 1,
  sortBy: 'updatedAt',
  sortOrder: 'desc'
})
```

### Advanced Scene Filtering

```typescript
import SceneService from '@/services/sceneService'
import { SceneLayoutType } from '@/types/scene'

const scenes = await SceneService.getFiltered({
  layoutType: [SceneLayoutType.SplitScreen, SceneLayoutType.Grid],
  isTemplate: false,
  searchTerm: 'lobby',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})
```

---

## 🎯 Best Practices

### ✅ DO:
- Always validate before API calls
- Use TypeScript types for type safety
- Handle errors with try-catch
- Show loading states during API calls
- Use helper functions for formatting
- Check backend responses for null/undefined

### ❌ DON'T:
- Don't mutate API response objects directly
- Don't skip validation
- Don't hardcode enum values (use enums)
- Don't ignore error responses
- Don't create playlists/scenes without media items
- Don't assume API calls will succeed

---

## 🐛 Troubleshooting

### Problem: "Cannot read property 'X' of undefined"
**Solution:** Check if API returned data before accessing properties. Use optional chaining (`?.`)

### Problem: "Validation failed" errors
**Solution:** Use `validatePlaylist()` or `validateScene()` before submitting to get detailed error messages

### Problem: "Network Error" or API not responding
**Solution:** Check `NEXT_PUBLIC_API_URL` environment variable, verify backend is running on correct port

### Problem: Type errors with enum values
**Solution:** Import enums from types file, use enum values instead of hardcoded numbers

---

## 📞 Quick Links

- **Full Documentation:** [PLAYLIST-SCENE-FOUNDATION-SUMMARY.md](./PLAYLIST-SCENE-FOUNDATION-SUMMARY.md)
- **Type Definitions:** `/src/types/playlist.ts`, `/src/types/scene.ts`
- **API Services:** `/src/services/playlistService.ts`, `/src/services/sceneService.ts`
- **Backend DTOs:** `/src/DigitalSignage.Application/DTOs/`
- **Backend Controllers:** `/src/DigitalSignage.Api/Controllers/`

---

**Last Updated:** 2025-01-07  
**Version:** 1.0.0 (Foundation Phase)
