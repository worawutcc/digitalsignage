# Playlist Item Builder Component

## Overview
Reusable component for adding and managing media items in playlists with drag-and-drop ordering, duration settings, transitions, and conditional playback. Follows React Query patterns and copilot-instructions-ui.instructions.md standards.

## Features
- ✅ Drag-and-drop reordering
- ✅ Media selection from library
- ✅ Custom duration settings
- ✅ Transition effects (8 types)
- ✅ Transition duration control
- ✅ Time-conditional playback
- ✅ Expandable item settings
- ✅ Loading, error, and empty states
- ✅ TypeScript strict mode
- ✅ Dark mode support
- ✅ Read-only mode

## Usage

### Basic Usage
```tsx
import { PlaylistItemBuilder } from '@/components/playlists'
import { PlaylistItemDto } from '@/types/playlist'

function MyPlaylistForm() {
  const [items, setItems] = useState<PlaylistItemDto[]>([])

  const handleItemsChange = (newItems: PlaylistItemDto[]) => {
    setItems(newItems)
  }

  return (
    <PlaylistItemBuilder
      items={items}
      onItemsChange={handleItemsChange}
    />
  )
}
```

### With Callbacks
```tsx
const handleAddItem = (request: CreatePlaylistItemRequest) => {
  console.log('Adding item:', request)
  // Call API to add item
}

const handleRemoveItem = (itemId: number) => {
  console.log('Removing item:', itemId)
  // Call API to remove item
}

<PlaylistItemBuilder
  items={items}
  onItemsChange={handleItemsChange}
  onAddItem={handleAddItem}
  onRemoveItem={handleRemoveItem}
/>
```

### Read-Only Mode
```tsx
<PlaylistItemBuilder
  items={items}
  onItemsChange={() => {}}
  readOnly={true}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `PlaylistItemDto[]` | Yes | - | Existing playlist items |
| `onItemsChange` | `(items: PlaylistItemDto[]) => void` | Yes | - | Callback when items change |
| `onAddItem` | `(request: CreatePlaylistItemRequest) => void` | No | - | Callback when new item added |
| `onRemoveItem` | `(itemId: number) => void` | No | - | Callback when item removed |
| `className` | `string` | No | `''` | Additional CSS classes |
| `readOnly` | `boolean` | No | `false` | Disable editing |

## Playlist Item Structure

```typescript
interface PlaylistItemDto {
  id: number
  playlistId: number
  mediaId: number
  mediaName: string
  mediaFileName: string
  mediaType: MediaType
  orderIndex: number
  durationSeconds: number
  useCustomDuration: boolean
  transitionEffect: TransitionEffect
  transitionDurationMs: number
  isConditional: boolean
  startTime: string | null  // "HH:mm:ss"
  endTime: string | null    // "HH:mm:ss"
}
```

## Transition Effects

| Effect | Value | Description |
|--------|-------|-------------|
| Cut | 0 | Instant transition |
| Fade | 1 | Cross-fade |
| Slide | 2 | Slide in/out |
| Zoom | 3 | Zoom in/out |
| Wipe | 4 | Wipe transition |
| Push | 5 | Push effect |
| Reveal | 6 | Reveal effect |
| Dissolve | 7 | Dissolve effect |

## Features

### 1. Drag-and-Drop Reordering
```tsx
// Items can be dragged to reorder
// Order index automatically updated
// Visual feedback during drag
```

### 2. Media Selection
```tsx
// Opens modal with media library
// Search and filter media
// Click to add to playlist
// Automatic duration detection
```

### 3. Item Settings (Expandable)
- **Duration**: Custom playback duration
- **Transition Effect**: Choose from 8 effects
- **Transition Duration**: Milliseconds (0-5000)
- **Time Conditional**: Play only during specific hours

### 4. Empty State
```tsx
// Shows when no items
// Provides "Add First Item" button
// Clear call-to-action
```

## Component Structure

```
PlaylistItemBuilder/
├── Header
│   ├── Title & item count
│   ├── Total duration
│   └── Add Media button
├── Items List (or Empty State)
│   └── Item Card (draggable)
│       ├── Drag handle
│       ├── Order number badge
│       ├── Media icon & name
│       ├── Duration & transition
│       ├── Expand/Remove buttons
│       └── Expanded Settings Panel
│           ├── Duration input
│           ├── Transition effect select
│           ├── Transition duration input
│           ├── Time conditional checkbox
│           ├── Start/End time inputs
│           └── File info
└── Media Selector Modal
    ├── Search bar
    ├── Loading state
    ├── Error state
    ├── Empty state
    └── Media grid
        └── Media card (clickable)
            ├── Media icon
            ├── Name & filename
            └── Type & duration
```

## Styling

### Drag-and-Drop
```tsx
// Active drag: opacity-50
// Hover: shadow-md
// Cursor: cursor-move
```

### Order Badge
```tsx
// Blue circular badge
// Sequential numbering
// Auto-updates on reorder
```

### Expanded Settings
```tsx
// Gray background panel
// Grid layout (2 columns on md+)
// Smooth transition
```

## API Integration

### Fetch Media
```typescript
import { MediaService } from '@/services/mediaService'

// Automatically fetches when modal opens
const { data: mediaList } = useQuery({
  queryKey: ['media-all'],
  queryFn: () => MediaService.getAll(),
  enabled: showMediaSelector
})
```

### Add Item
```typescript
const handleAddItem = async (request: CreatePlaylistItemRequest) => {
  await PlaylistService.addItem(playlistId, request)
  queryClient.invalidateQueries(['playlists'])
}
```

### Remove Item
```typescript
const handleRemoveItem = async (itemId: number) => {
  await PlaylistService.removeItem(playlistId, itemId)
  queryClient.invalidateQueries(['playlists'])
}
```

## Examples

### In Playlist Creation Form
```tsx
function CreatePlaylistPage() {
  const [items, setItems] = useState<PlaylistItemDto[]>([])
  const [name, setName] = useState('')
  
  const handleSubmit = async () => {
    const request: CreatePlaylistRequest = {
      name,
      items: items.map(item => ({
        mediaId: item.mediaId,
        orderIndex: item.orderIndex,
        durationSeconds: item.durationSeconds,
        transitionEffect: item.transitionEffect,
        transitionDurationMs: item.transitionDurationMs
      }))
    }
    await PlaylistService.create(request)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
      <PlaylistItemBuilder
        items={items}
        onItemsChange={setItems}
      />
      <Button type="submit">Create Playlist</Button>
    </form>
  )
}
```

### In Playlist Edit Form
```tsx
function EditPlaylistPage({ playlistId }: { playlistId: number }) {
  const { data: playlist } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: () => PlaylistService.getById(playlistId)
  })

  const [items, setItems] = useState<PlaylistItemDto[]>(
    playlist?.playlistItems || []
  )

  const updateMutation = useMutation({
    mutationFn: (items: PlaylistItemDto[]) =>
      PlaylistService.updateItems(playlistId, items),
    onSuccess: () => {
      queryClient.invalidateQueries(['playlist', playlistId])
    }
  })

  const handleItemsChange = (newItems: PlaylistItemDto[]) => {
    setItems(newItems)
    updateMutation.mutate(newItems)
  }

  return (
    <PlaylistItemBuilder
      items={items}
      onItemsChange={handleItemsChange}
    />
  )
}
```

## Time-Conditional Playback

```tsx
// Enable conditional playback
item.isConditional = true
item.startTime = "09:00:00"  // Play from 9 AM
item.endTime = "17:00:00"    // Play until 5 PM

// Disable conditional playback
item.isConditional = false
item.startTime = null
item.endTime = null
```

## Duration Calculation

```tsx
// Total playlist duration
const totalDuration = items.reduce(
  (sum, item) => sum + item.durationSeconds, 
  0
)

// Format duration
const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}m ${secs}s`
}
```

## States

### Empty State
- Shows when `items.length === 0`
- Play icon placeholder
- "Add First Item" button

### Loading State
- Shows while fetching media
- Centered Loader2 spinner

### Error State
- Red alert box
- Error message display
- AlertCircle icon

## Accessibility

- Keyboard navigation for drag-drop (future enhancement)
- ARIA labels on buttons
- Semantic HTML structure
- Focus management in modal

## Testing

### Manual Testing
1. Add items from media library
2. Drag to reorder items
3. Expand item settings
4. Change duration/transition
5. Enable time conditional
6. Remove items
7. Test empty state
8. Test read-only mode

### Component Testing
```typescript
import { render, screen } from '@testing-library/react'
import { PlaylistItemBuilder } from '@/components/playlists'

test('renders empty state', () => {
  render(
    <PlaylistItemBuilder
      items={[]}
      onItemsChange={jest.fn()}
    />
  )
  
  expect(screen.getByText(/no items yet/i)).toBeInTheDocument()
})
```

## Related Components
- `Button` - Actions
- `Input` - Settings inputs
- `MediaService` - Media fetching

## Related Types
- `PlaylistItemDto` - Item structure
- `CreatePlaylistItemRequest` - Add item request
- `TransitionEffect` - Transition enum
- `MediaFile` - Media structure

## Future Enhancements
- [ ] Keyboard shortcuts for reordering
- [ ] Bulk operations (delete, duplicate)
- [ ] Preview media in modal
- [ ] Copy/paste items
- [ ] Item templates
- [ ] Advanced conditional rules
- [ ] Animation previews
- [ ] Timeline view

## Version History
- v1.0.0 (2025-01-07) - Initial release with drag-drop, transitions, and conditional playback
