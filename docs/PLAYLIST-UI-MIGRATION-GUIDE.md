# Playlist Management UI - Migration Guide

## Steps to Convert playlists/page.tsx to React Query

### Step 1: Update Imports
```typescript
// Add these imports
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Music, Loader2, AlertCircle } from 'lucide-react' // Add Music icon
import {
  PlaylistDto,
  PlaylistStatus,
  PlaylistStatistics, // Add this
  formatPlaylistDuration,
  getPlaylistStatusLabel,
  getPlaylistStatusColor
} from '@/types/playlist'
```

### Step 2: Remove Mock Data
Delete lines ~36-89 (mockPlaylists array)
Delete formatDuration function (use formatPlaylistDuration from types)
Delete getStatusColor function (use getPlaylistStatusColor from types)

### Step 3: Add React Query Setup
```typescript
export default function PlaylistsPage() {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | PlaylistStatus>('all')
  
  // Fetch playlists
  const { data: playlists = [], isLoading, error } = useQuery<PlaylistDto[], Error>({
    queryKey: ['playlists'],
    queryFn: () => PlaylistService.getAll()
  })

  // Fetch statistics
  const { data: stats } = useQuery<PlaylistStatistics>({
    queryKey: ['playlist-stats'],
    queryFn: () => PlaylistService.getStatistics()
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => PlaylistService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      queryClient.invalidateQueries({ queryKey: ['playlist-stats'] })
    }
  })

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: (id: number) => PlaylistService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
    }
  })

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: (id: number) => PlaylistService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      queryClient.invalidateQueries({ queryKey: ['playlist-stats'] })
    }
  })

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: number) => PlaylistService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      queryClient.invalidateQueries({ queryKey: ['playlist-stats'] })
    }
  })
```

### Step 4: Update Filter Logic
```typescript
  // Replace filteredPlaylists logic
  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = !searchTerm || 
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (playlist.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesStatus = statusFilter === 'all' || playlist.status === statusFilter
    
    return matchesSearch && matchesStatus
  })
```

### Step 5: Add Event Handlers
```typescript
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleDuplicate = (id: number) => {
    duplicateMutation.mutate(id)
  }

  const handleToggleActive = (playlist: PlaylistDto) => {
    if (playlist.status === PlaylistStatus.Active) {
      deactivateMutation.mutate(playlist.id)
    } else {
      activateMutation.mutate(playlist.id)
    }
  }

  const handleEdit = (playlist: PlaylistDto) => {
    // TODO: Open edit modal
  }
```

### Step 6: Update Statistics Section
```typescript
{/* Stats */}
{stats && (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
      <div className="flex items-center">
        <Music className="h-8 w-8 text-blue-500" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Playlists
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.totalPlaylists ?? 0}
          </p>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
      <div className="flex items-center">
        <Play className="h-8 w-8 text-green-500" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Active
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.activePlaylists ?? 0}
          </p>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
      <div className="flex items-center">
        <Monitor className="h-8 w-8 text-purple-500" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Assigned Devices
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.totalAssignedDevices ?? 0}
          </p>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
      <div className="flex items-center">
        <Clock className="h-8 w-8 text-orange-500" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Avg Duration
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats ? formatPlaylistDuration(stats.averageDuration) : '0:00'}
          </p>
        </div>
      </div>
    </div>
  </div>
)}
```

### Step 7: Add Status Filter
```typescript
{/* Controls - Add status filter after search */}
<select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value as 'all' | PlaylistStatus)}
  className="px-3 py-2 border rounded-lg text-sm"
>
  <option value="all">All Status</option>
  <option value={PlaylistStatus.Draft}>Draft</option>
  <option value={PlaylistStatus.Active}>Active</option>
  <option value={PlaylistStatus.Scheduled}>Scheduled</option>
  <option value={PlaylistStatus.Archived}>Archived</option>
</select>
```

### Step 8: Add Loading/Error/Empty States
```typescript
{/* Loading State */}
{isLoading && (
  <div className="flex justify-center items-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
)}

{/* Error State */}
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
    <AlertCircle className="h-5 w-5 text-red-500" />
    <p className="text-red-700">Failed to load playlists: {error.message}</p>
  </div>
)}

{/* Empty State */}
{!isLoading && !error && filteredPlaylists.length === 0 && (
  <div className="text-center py-12">
    <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No playlists found
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      {searchTerm || statusFilter !== 'all' 
        ? 'Try adjusting your search or filters'
        : 'Get started by creating your first playlist'}
    </p>
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Create Playlist
    </Button>
  </div>
)}
```

### Step 9: Update Grid/List Views
```typescript
{/* Show content only when not loading and no error */}
{!isLoading && !error && viewMode === 'grid' && filteredPlaylists.length > 0 && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredPlaylists.map((playlist) => (
      // Existing card JSX
    ))}
  </div>
)}

{!isLoading && !error && viewMode === 'list' && filteredPlaylists.length > 0 && (
  // Existing table JSX
)}
```

### Step 10: Update Card Actions
In each playlist card, replace button actions:
```typescript
{/* Replace static buttons with handlers */}
<Button onClick={() => handleEdit(playlist)}>
  <Edit className="h-4 w-4 mr-2" />
  Edit
</Button>
<Button onClick={() => handleDuplicate(playlist.id)}>
  <Copy className="h-4 w-4 mr-2" />
  Duplicate
</Button>

{/* Add activate/deactivate */}
<Button onClick={() => handleToggleActive(playlist)}>
  {playlist.status === PlaylistStatus.Active ? (
    <>
      <Pause className="h-4 w-4 mr-2" />
      Deactivate
    </>
  ) : (
    <>
      <Play className="h-4 w-4 mr-2" />
      Activate
    </>
  )}
</Button>
```

### Step 11: Use Correct Helper Functions
Replace all instances of:
- `formatDuration()` → `formatPlaylistDuration()`
- `getStatusColor()` → `getPlaylistStatusColor()`
- `playlist.status.charAt(0).toUpperCase()...` → `getPlaylistStatusLabel(playlist.status)`

### Step 12: Update Data Access
Replace all mock data access:
- `mockPlaylists.filter(p => p.status === 'active')` → Use `stats?.activePlaylists`
- `mockPlaylists.reduce((acc, p) => acc + p.assignedDevices, 0)` → Use `stats?.totalAssignedDevices`
- Direct array access → Use `playlists` from useQuery

## Testing
```bash
# Run backend
dotnet watch run --project src/DigitalSignage.Api

# Run frontend
npm run dev

# Navigate to
http://localhost:3000/playlists
```

## Expected Result
- ✅ Page loads with real API data
- ✅ Statistics show actual numbers from backend
- ✅ Search and filter work correctly
- ✅ Grid/List view toggle works
- ✅ CRUD operations trigger API calls
- ✅ Cache invalidates and refetches after mutations
- ✅ Loading state shows during fetch
- ✅ Error state shows if API fails
- ✅ Empty state shows if no data
