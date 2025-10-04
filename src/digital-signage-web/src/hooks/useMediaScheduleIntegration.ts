import { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import type { RootState } from '@/store'

export interface MediaScheduleIntegration {
  selectedMediaIds: string[]
  isMediaSelectorOpen: boolean
  scheduleId?: string
}

/**
 * Custom hook for managing media-schedule integration
 * Handles selection, navigation, and state management between media library and schedules
 */
export function useMediaScheduleIntegration() {
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([])
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false)
  const [currentScheduleId, setCurrentScheduleId] = useState<string | undefined>()
  const router = useRouter()

  // Add media to current selection
  const addToSelection = useCallback((mediaId: string) => {
    setSelectedMediaIds(prev => 
      prev.includes(mediaId) ? prev : [...prev, mediaId]
    )
  }, [])

  // Remove media from selection
  const removeFromSelection = useCallback((mediaId: string) => {
    setSelectedMediaIds(prev => prev.filter(id => id !== mediaId))
  }, [])

  // Clear all selected media
  const clearSelection = useCallback(() => {
    setSelectedMediaIds([])
  }, [])

  // Navigate to schedules with selected media
  const addToSchedule = useCallback((scheduleId?: string) => {
    if (selectedMediaIds.length === 0) return
    
    const params = new URLSearchParams()
    params.set('mediaIds', selectedMediaIds.join(','))
    if (scheduleId) {
      params.set('scheduleId', scheduleId)
    }
    
    router.push(`/schedules?${params.toString()}`)
  }, [selectedMediaIds, router])

  // Navigate to media library from schedule builder
  const selectMediaForSchedule = useCallback((scheduleId: string) => {
    setCurrentScheduleId(scheduleId)
    setIsMediaSelectorOpen(true)
    router.push(`/media?scheduleId=${scheduleId}&selector=true`)
  }, [router])

  // Get selected media info for display
  const getSelectedMediaCount = useCallback(() => {
    return selectedMediaIds.length
  }, [selectedMediaIds])

  // Navigate back to schedule with selected media
  const returnToSchedule = useCallback(() => {
    if (!currentScheduleId) return
    
    const params = new URLSearchParams()
    params.set('mediaIds', selectedMediaIds.join(','))
    router.push(`/schedules?scheduleId=${currentScheduleId}&${params.toString()}`)
  }, [currentScheduleId, selectedMediaIds, router])

  return {
    selectedMediaIds,
    isMediaSelectorOpen,
    currentScheduleId,
    addToSelection,
    removeFromSelection,
    clearSelection,
    addToSchedule,
    selectMediaForSchedule,
    getSelectedMediaCount,
    returnToSchedule,
    setIsMediaSelectorOpen,
  }
}

/**
 * Hook for tracking media usage across schedules
 */
export function useMediaUsageTracking(mediaId: string) {
  // This would typically fetch from API
  // For now, returning mock data structure
  const usageData = {
    scheduleCount: 3,
    activeSchedules: ['schedule-1', 'schedule-2', 'schedule-3'],
    lastUsed: '2025-01-07',
    totalViews: 1250
  }

  return {
    isUsed: usageData.scheduleCount > 0,
    scheduleCount: usageData.scheduleCount,
    activeSchedules: usageData.activeSchedules,
    lastUsed: usageData.lastUsed,
    totalViews: usageData.totalViews
  }
}