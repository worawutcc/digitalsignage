'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  Grid,
  List,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Clock,
  Users,
  Monitor,
  MoreHorizontal,
  Calendar,
  Shuffle,
  Repeat
} from 'lucide-react'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface PlaylistItem {
  id: string
  name: string
  type: 'image' | 'video' | 'text'
  duration: number
  order: number
}

interface Playlist {
  id: string
  name: string
  description: string
  items: PlaylistItem[]
  totalDuration: number
  assignedDevices: number
  status: 'active' | 'draft' | 'scheduled'
  lastModified: string
  createdBy: string
  schedule?: {
    startTime: string
    endTime: string
    days: string[]
  }
}

const mockPlaylists: Playlist[] = [
  {
    id: '1',
    name: 'Morning Announcements',
    description: 'Daily morning content for lobby displays',
    items: [
      { id: '1', name: 'Welcome Message', type: 'text', duration: 10, order: 1 },
      { id: '2', name: 'Company Logo', type: 'image', duration: 5, order: 2 },
      { id: '3', name: 'Today\'s Schedule', type: 'text', duration: 15, order: 3 }
    ],
    totalDuration: 30,
    assignedDevices: 5,
    status: 'active',
    lastModified: '2025-01-07',
    createdBy: 'Admin User',
    schedule: {
      startTime: '08:00',
      endTime: '10:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    }
  },
  {
    id: '2',
    name: 'Product Showcase',
    description: 'Latest product demonstrations and features',
    items: [
      { id: '4', name: 'Product Video 1', type: 'video', duration: 120, order: 1 },
      { id: '5', name: 'Feature Highlights', type: 'image', duration: 30, order: 2 },
      { id: '6', name: 'Customer Testimonial', type: 'video', duration: 60, order: 3 }
    ],
    totalDuration: 210,
    assignedDevices: 8,
    status: 'active',
    lastModified: '2025-01-06',
    createdBy: 'Marketing Team'
  },
  {
    id: '3',
    name: 'Event Promotion',
    description: 'Upcoming events and announcements',
    items: [
      { id: '7', name: 'Event Banner', type: 'image', duration: 20, order: 1 },
      { id: '8', name: 'Event Details', type: 'text', duration: 25, order: 2 }
    ],
    totalDuration: 45,
    assignedDevices: 3,
    status: 'draft',
    lastModified: '2025-01-05',
    createdBy: 'Events Team'
  }
]

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function PlaylistsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredPlaylists = mockPlaylists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    playlist.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Playlists
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage content playlists for your digital signage displays
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Playlists
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockPlaylists.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Assigned Devices
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockPlaylists.reduce((acc, p) => acc + p.assignedDevices, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Duration
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatDuration(Math.round(mockPlaylists.reduce((acc, p) => acc + p.totalDuration, 0) / mockPlaylists.length))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Scheduled
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockPlaylists.filter(p => p.schedule).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search playlists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Playlists Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaylists.map((playlist) => (
              <div key={playlist.id} className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {playlist.description}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(playlist.status)}`}>
                      {playlist.status.charAt(0).toUpperCase() + playlist.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {playlist.items.length} items
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="font-medium">{formatDuration(playlist.totalDuration)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Devices:</span>
                      <span className="font-medium">{playlist.assignedDevices}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Modified:</span>
                      <span className="font-medium">{playlist.lastModified}</span>
                    </div>
                  </div>

                  {playlist.schedule && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Scheduled
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {playlist.schedule.startTime} - {playlist.schedule.endTime}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {playlist.schedule.days.join(', ')}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Items</th>
                    <th className="text-left p-4">Duration</th>
                    <th className="text-left p-4">Devices</th>
                    <th className="text-left p-4">Modified</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlaylists.map((playlist) => (
                    <tr key={playlist.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {playlist.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {playlist.description}
                          </div>
                          {playlist.schedule && (
                            <div className="flex items-center mt-1">
                              <Calendar className="h-3 w-3 text-blue-500 mr-1" />
                              <span className="text-xs text-blue-600">
                                {playlist.schedule.startTime} - {playlist.schedule.endTime}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(playlist.status)}`}>
                          {playlist.status.charAt(0).toUpperCase() + playlist.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {playlist.items.length}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {formatDuration(playlist.totalDuration)}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {playlist.assignedDevices}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {playlist.lastModified}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-lg w-full max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Create New Playlist
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Playlist Name
                    </label>
                    <Input placeholder="Enter playlist name" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={3}
                      placeholder="Describe this playlist..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Loop Mode
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option value="repeat">Repeat</option>
                        <option value="shuffle">Shuffle</option>
                        <option value="once">Play Once</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button>
                    Create Playlist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}