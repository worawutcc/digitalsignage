import React from 'react'
import { usePlaylistAssignmentSummary } from '../hooks/usePlaylistAssignmentSummary'
import type { PlaylistAssignmentSummary } from '@/types/playlist'
import { Loader2, AlertCircle, Monitor } from 'lucide-react'

export interface PlaylistAssignmentSummaryProps {
  playlistId: number
}

/**
 * PlaylistAssignmentSummary
 * Displays assignment summary for a playlist
 */
export function PlaylistAssignmentSummary({ playlistId }: PlaylistAssignmentSummaryProps) {
  const { data, isLoading, error } = usePlaylistAssignmentSummary(playlistId)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin h-4 w-4" /> Loading assignment summary...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="h-4 w-4" /> Error loading assignment summary
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="rounded-lg border p-4 bg-background shadow-sm">
      <div className="font-semibold text-lg mb-2 flex items-center gap-2">
        <Monitor className="h-5 w-5 text-blue-600" /> Assignment Summary
      </div>
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <span className="text-sm text-muted-foreground">Total Assignments</span>
          <div className="font-bold text-xl">{data.totalAssignments}</div>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Active Assignments</span>
          <div className="font-bold text-xl">{data.activeAssignments}</div>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Devices</span>
          <div className="font-bold text-xl">{data.deviceCount}</div>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Device Groups</span>
          <div className="font-bold text-xl">{data.deviceGroupCount}</div>
        </div>
      </div>
      <div className="mt-2">
        <span className="text-sm text-muted-foreground">Assignments:</span>
        <ul className="list-disc ml-6 mt-1">
          {data.assignments.length === 0 ? (
            <li className="text-muted-foreground">No assignments found.</li>
          ) : (
            data.assignments.map(a => (
              <li key={a.id} className="text-sm">
                Device: <span className="font-semibold">{a.deviceName || 'N/A'}</span> | Priority: {a.priority} | Start: {a.startTime ? new Date(a.startTime).toLocaleString() : '-'} | End: {a.endTime ? new Date(a.endTime).toLocaleString() : '-'}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
